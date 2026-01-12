import { computed, onDestroy, onMount, ref, signal } from 'essor';
import { FlexSearcher } from './FlexSearcher';
import { AlgoliaSearcher } from './AlgoliaSearcher';
import { Suggestion } from './Suggestion';
import { debounce } from './utils';
import type { SearchResult } from '../types';
import './SearchBox.scss';

export interface SearchBoxProps {
  provider?: 'flex' | 'algolia';
  placeholder?: string;
  maxResults?: number;
  cacheEnabled?: boolean;
  cacheMaxAge?: number;
  algolia?: {
    appId: string;
    apiKey: string;
    indexName: string;
    algoliaOptions?: Record<string, any>;
  };
  langRoutePrefix?: string;
  onSearch?: (query: string, results: SearchResult[]) => void;
}

const KEY_CODE = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SEARCH: 'KeyK',
};

export function SearchBox(props: SearchBoxProps) {
  const query = signal('');
  const results = signal<SearchResult[]>([]);
  const loading = signal(false);
  const focused = signal(false);
  const currentIndex = signal(-1);
  const initialized = signal(false);
  const searchInputRef = ref<HTMLInputElement>();
  const searcherRef = ref<FlexSearcher | AlgoliaSearcher>();
  const showResults = computed(() => {
    debugger;
    return;
  });
  const showLoading = computed(() => loading.value && query.value.length > 0);

  const debouncedSearch = debounce(async (q: string) => {
    if (!q.trim()) {
      results.value = [];
      loading.value = false;
      return;
    }
    if (!initialized.value) await initSearcher();
    if (!searcherRef.value) {
      loading.value = false;
      return;
    }
    try {
      const r = await searcherRef.value.search(q);
      results.value = r;
      props.onSearch?.(q, r);
    } catch {
      results.value = [];
    } finally {
      loading.value = false;
    }
  }, 150);

  const initSearcher = async () => {
    if (searcherRef.value) return;
    try {
      searcherRef.value =
        props.provider === 'algolia' && props.algolia
          ? new AlgoliaSearcher(props.algolia)
          : new FlexSearcher({
              langRoutePrefix: props.langRoutePrefix,
              cacheEnabled: props.cacheEnabled,
              cacheMaxAge: props.cacheMaxAge,
              maxResults: props.maxResults,
            });
      await searcherRef.value.init();
      initialized.value = true;
    } catch {
      initialized.value = true;
    }
  };

  const onQueryChange = (v: string) => {
    query.value = v;
    currentIndex.value = -1;
    loading.value = true;
    debouncedSearch(v);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!(focused.value && query.value.length > 0)) return;
    if (e.code === KEY_CODE.ARROW_DOWN) {
      e.preventDefault();
      currentIndex.value = Math.min(currentIndex.value + 1, results.value.length - 1);
    } else if (e.code === KEY_CODE.ARROW_UP) {
      e.preventDefault();
      currentIndex.value = Math.max(currentIndex.value - 1, -1);
    } else if (e.code === KEY_CODE.ENTER) {
      e.preventDefault();
      if (currentIndex.value >= 0 && results.value[currentIndex.value])
        window.location.href = results.value[currentIndex.value].path;
    } else if (e.code === KEY_CODE.ESCAPE) {
      e.preventDefault();
      focused.value = false;
      searchInputRef.value?.blur();
    }
  };

  const onGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.code === KEY_CODE.SEARCH && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      focused.value = true;
      searchInputRef.value?.focus();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', onGlobalKeyDown);
    initSearcher();
  });
  onDestroy(() => {
    document.removeEventListener('keydown', onGlobalKeyDown);
    debouncedSearch.cancel();
  });

  return (
    <div class="athen-search-box">
      <div class="search-input-container">
        <span class="search-icon" />
        <input
          ref={searchInputRef}
          class={`search-input ${focused.value ? 'focus' : ''}`}
          type="text"
          placeholder={props.placeholder || 'Search...'}
          value={query.value}
          onInput={(e: Event) => onQueryChange((e.target as HTMLInputElement).value)}
          onFocus={() => {
            setTimeout(() => {
              focused.value = true;
            }, 200);
          }}
          onBlur={() => {
            setTimeout(() => {
              focused.value = false;
            }, 200);
          }}
          onKeyDown={onKeyDown}
          autocomplete="off"
          spellcheck={false}
        />
        <div class="search-shortcut">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>
      {focused.value && query.value.length > 0 && (
        <div class="search-results">
          {showLoading.value ? (
            <div class="search-loading">
              <div class="loading-text">Searching...</div>
            </div>
          ) : results.value.length > 0 ? (
            <ul class="results-list">
              {results.value.map((r, i) => (
                <Suggestion
                  result={r}
                  query={query.value}
                  isActive={i === currentIndex.value}
                  onClick={() => {
                    window.location.href = r.path;
                  }}
                />
              ))}
            </ul>
          ) : (
            <div class="no-results">
              <div class="no-results-text">No results found for "{query.value}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
