import FlexSearch from 'flexsearch';
import { uniqBy } from 'lodash-es';
import { getAllPages, normalizeHref, withBase } from '@/runtime';
import { backTrackHeaders } from './util';
import type { CreateOptions, Index as SearchIndex } from 'flexsearch';

const SEARCH_MAX_SUGGESTIONS = 7;
const THRESHOLD_CONTENT_LENGTH = 100;
// TODO: need fix
type Header = any;
interface PageDataForSearch {
  title: string;
  headers: string[];
  content: string;
  path: string;
  rawHeaders: Header[];
}

interface CommonMatchResult {
  title: string;
  header: string;
  link: string;
}

interface HeaderMatch extends CommonMatchResult {
  type: 'header';
  headerHighlightIndex: number;
}

interface ContentMatch extends CommonMatchResult {
  type: 'content';
  statement: string;
  statementHighlightIndex: number;
}

export type MatchResultItem = HeaderMatch | ContentMatch;

const cjkRegex =
  /[\u3131-\u314E|\u314F-\u3163\uAC00-\uD7A3\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\u3041-\u3096\u30A1-\u30FA]|[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]/gu;

const WHITE_PAGE_TYPES = ['home', 'api', '404', 'custom'];

export class PageSearcher {
  #index?: SearchIndex<PageDataForSearch[]>;
  #cjkIndex?: SearchIndex<PageDataForSearch[]>;
  #headerToIdMap: Record<string, string> = {};
  #langRoutePrefix: string;

  constructor(langRoutePrefix = '') {
    this.#langRoutePrefix = langRoutePrefix;
  }

  async init(options: CreateOptions = {}) {
    const pages = await getAllPages(route =>
      route.path.startsWith(withBase(this.#langRoutePrefix)),
    );
    const pagesForSearch: PageDataForSearch[] = pages
      .filter(page => {
        return !WHITE_PAGE_TYPES.includes(page.frontmatter?.pageType || '');
      })
      .map(page => ({
        title: page.title!,
        headers: (page.toc || []).map(header => header.text),
        content: page.content || '',
        path: page.routePath,
        rawHeaders: page.toc || [],
      }));
    this.#headerToIdMap = pages.reduce(
      (acc, page) => {
        (page.toc || []).forEach(header => {
          acc[page.routePath + header.text] = header.id;
        });
        return acc;
      },
      {} as Record<string, string>,
    );

    const createOptions: CreateOptions = {
      encode: 'simple',
      tokenize: 'forward',
      split: /\W+/,
      async: true,
      doc: {
        id: 'path',
        field: ['title', 'headers', 'content'],
      },
      ...options,
    };
    // Init Search Indexes
    // English Index
    this.#index = FlexSearch.create(createOptions);
    // CJK: Chinese, Japanese, Korean
    this.#cjkIndex = FlexSearch.create({
      ...createOptions,
      encode: false,
      tokenize(str: string) {
        const cjkWords: string[] = [];
        let m: RegExpExecArray | null = null;
        do {
          m = cjkRegex.exec(str);
          if (m) {
            cjkWords.push(m[0]);
          }
        } while (m);
        return cjkWords;
      },
    });
    this.#index!.add(pagesForSearch);
    this.#cjkIndex!.add(pagesForSearch);
  }

  async match(query: string, limit: number = SEARCH_MAX_SUGGESTIONS) {
    const searchResult = await Promise.all([
      this.#index?.search({
        query,
        limit,
      }),
      this.#cjkIndex?.search(query, limit),
    ]);
    const flattenSearchResult = searchResult.flat(2).filter(Boolean) as PageDataForSearch[];
    const matchedResult: MatchResultItem[] = [];
    flattenSearchResult.forEach(item => {
      // Header match
      const matchedHeader = this.#matchHeader(item, query, matchedResult);
      // If we have matched header, we don't need to match content
      // Because the header is already in the content
      if (matchedHeader) {
        return;
      }
      // Content match
      this.#matchContent(item, query, matchedResult);
    });
    const res = uniqBy(matchedResult, 'link');
    return res;
  }

  #matchHeader(item: PageDataForSearch, query: string, matchedResult: MatchResultItem[]): boolean {
    const { headers, rawHeaders } = item;
    for (const [index, header] of headers.entries()) {
      if (header.includes(query)) {
        const headerAnchor = this.#headerToIdMap[item.path + header];
        // Find the all parent headers (except h1)
        // So we can show the full path of the header in search result
        // e.g. header2 > header3 > header4
        const headerGroup = backTrackHeaders(rawHeaders, index);
        const headerStr = headerGroup.map(item => item.text).join(' > ');
        matchedResult.push({
          type: 'header',
          title: item.title,
          header: headerStr,
          headerHighlightIndex: headerStr.indexOf(query),
          link: `${normalizeHref(item.path)}#${headerAnchor}`,
        });
        return true;
      }
    }
    return false;
  }

  #matchContent(item: PageDataForSearch, query: string, matchedResult: MatchResultItem[]) {
    const { content, headers } = item;
    const queryIndex = content.indexOf(query);
    if (queryIndex === -1) {
      return;
    }
    const headersIndex = headers.map(h => content.indexOf(h));
    const currentHeaderIndex = headersIndex.findIndex((hIndex, position) => {
      if (position < headers.length - 1) {
        const next = headersIndex[position + 1];
        if (hIndex <= queryIndex && next >= queryIndex) {
          return true;
        }
      } else {
        return hIndex < queryIndex;
      }
    });
    const currentHeader = headers[currentHeaderIndex] ?? item.title;

    let statementStartIndex = content.slice(0, queryIndex).lastIndexOf('\n');
    statementStartIndex = statementStartIndex === -1 ? 0 : statementStartIndex;
    const statementEndIndex = content.indexOf('\n', queryIndex + query.length);
    let statement = content.slice(statementStartIndex, statementEndIndex);
    if (statement.length > THRESHOLD_CONTENT_LENGTH) {
      statement = this.#normalizeStatement(statement, query);
    }
    matchedResult.push({
      type: 'content',
      title: item.title,
      header: currentHeader,
      statement,
      statementHighlightIndex: statement.indexOf(query),
      link: `${normalizeHref(item.path)}#${currentHeader}`,
    });
  }

  #normalizeStatement(statement: string, query: string) {
    // If statement is too long, we will only show 120 characters
    const queryIndex = statement.indexOf(query);
    const maxPrefixOrSuffix = Math.floor((THRESHOLD_CONTENT_LENGTH - query.length) / 2);
    let prefix = statement.slice(0, queryIndex);
    if (prefix.length > maxPrefixOrSuffix) {
      prefix = `...${statement.slice(queryIndex - maxPrefixOrSuffix + 3, queryIndex)}`;
    }
    let suffix = statement.slice(queryIndex + query.length);
    if (suffix.length > maxPrefixOrSuffix) {
      suffix = `${statement.slice(
        queryIndex + query.length,
        queryIndex + maxPrefixOrSuffix - 3,
      )}...`;
    }
    return prefix + query + suffix;
  }
}
