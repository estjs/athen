import path from 'node:path';
import fs from 'fs-extra';
import {
  type UrlPolicy,
  applyRewrite,
  cleanUrl,
  normalizePublicRoute,
  normalizeRouteTarget,
} from '../shared/utils';
import type { BrokenLinksBehavior } from '../shared/types';
import type { RouteMeta } from './routes';

export interface BrokenLinkIssue {
  file: string;
  link: string;
  resolved: string;
  reason: string;
  type: 'page' | 'anchor';
}

export interface CheckBrokenLinksOptions {
  routes: RouteMeta[];
  onBrokenLinks?: BrokenLinksBehavior;
  urlPolicy?: UrlPolicy;
}

const LINK_RE = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
const SPECIAL_PROTOCOL_RE = /^(?:https?:)?\/\/|^(?:mailto|tel):/i;

function removeMdExtension(filePath: string) {
  return filePath.replace(/\.(mdx?|html)$/, '');
}

function parseLink(link: string) {
  const [withoutHash, ...hashParts] = link.split('#');
  return {
    path: withoutHash,
    hash: hashParts.length ? hashParts.join('#') : '',
  };
}

function createRouteMaps(routes: RouteMeta[], urlPolicy?: UrlPolicy) {
  const routeMap = new Map<string, RouteMeta>();
  const fileMap = new Map<string, RouteMeta>();

  for (const route of routes) {
    routeMap.set(normalizePublicRoute(route.routePath, urlPolicy), route);

    const fileKey = removeMdExtension(route.filePath);
    fileMap.set(fileKey, route);
    if (fileKey.endsWith('/index')) {
      fileMap.set(fileKey.replace(/\/index$/, ''), route);
    }
  }

  return { routeMap, fileMap };
}

function resolveRelativeFileRoute(
  source: RouteMeta,
  linkPath: string,
  fileMap: Map<string, RouteMeta>,
) {
  const sourceDir = path.posix.dirname(source.filePath);
  const targetFile = path.posix.normalize(path.posix.join(sourceDir, cleanUrl(linkPath)));
  return fileMap.get(removeMdExtension(targetFile));
}

function resolveRoute(
  source: RouteMeta,
  link: string,
  routeMap: Map<string, RouteMeta>,
  fileMap: Map<string, RouteMeta>,
  urlPolicy?: UrlPolicy,
) {
  const { path: linkPath, hash } = parseLink(link);

  if (!linkPath) {
    return {
      route: source,
      resolved: `${source.routePath}${hash ? `#${hash}` : ''}`,
      hash,
    };
  }

  const relativeFileRoute =
    !linkPath.startsWith('/') && /\.(?:mdx?|html)$/.test(cleanUrl(linkPath))
      ? resolveRelativeFileRoute(source, linkPath, fileMap)
      : undefined;

  if (relativeFileRoute) {
    return {
      route: relativeFileRoute,
      resolved: `${relativeFileRoute.routePath}${hash ? `#${hash}` : ''}`,
      hash,
    };
  }

  const sourceDir = source.routePath.endsWith('/')
    ? source.routePath
    : path.posix.dirname(source.routePath);
  const routeTarget = linkPath.startsWith('/')
    ? linkPath
    : path.posix.normalize(path.posix.join(sourceDir, linkPath));
  const resolved = applyRewrite(
    normalizeRouteTarget(`${routeTarget}${hash ? `#${hash}` : ''}`, urlPolicy),
    urlPolicy,
  );
  const route = routeMap.get(parseLink(resolved).path);

  return {
    route,
    resolved,
    hash,
  };
}

function createIssue(
  source: RouteMeta,
  link: string,
  resolved: string,
  reason: string,
  type: BrokenLinkIssue['type'],
): BrokenLinkIssue {
  return {
    file: source.filePath,
    link,
    resolved,
    reason,
    type,
  };
}

function formatIssue(issue: BrokenLinkIssue) {
  const heading = issue.type === 'anchor' ? 'Broken anchor found' : 'Broken link found';
  return `${heading} in ${issue.file}\n\n  ${issue.link}\n  -> resolved to ${issue.resolved}\n  -> ${issue.reason}`;
}

export async function checkBrokenLinks(options: CheckBrokenLinksOptions) {
  const behavior = options.onBrokenLinks ?? 'ignore';
  const errors: BrokenLinkIssue[] = [];
  const warnings: BrokenLinkIssue[] = [];

  if (behavior === 'ignore') {
    return { errors, warnings };
  }

  const { routeMap, fileMap } = createRouteMaps(options.routes, options.urlPolicy);

  for (const route of options.routes) {
    if (!/\.mdx?$/.test(route.absolutePath)) {
      continue;
    }

    const content = await fs.readFile(route.absolutePath, 'utf-8');
    const cleanedContent = content
      .replaceAll(/<!--[\s\S]*?-->/g, '')
      .replaceAll(/```[\s\S]*?```/g, '')
      .replaceAll(/`[^`\n]+`/g, '');
    const links = [...cleanedContent.matchAll(LINK_RE)].map((match) => match[1]);
    for (const link of links) {
      if (SPECIAL_PROTOCOL_RE.test(link)) {
        continue;
      }

      const {
        route: targetRoute,
        resolved,
        hash,
      } = resolveRoute(route, link, routeMap, fileMap, options.urlPolicy);

      if (!targetRoute) {
        errors.push(createIssue(route, link, resolved, 'target page does not exist', 'page'));
        continue;
      }

      if (hash && !targetRoute.headings?.some((heading) => heading.id === hash)) {
        errors.push(
          createIssue(route, link, resolved, `anchor does not exist: #${hash}`, 'anchor'),
        );
      }
    }
  }

  if (behavior === 'warn') {
    warnings.push(...errors);
    errors.length = 0;
    for (const warning of warnings) {
      console.warn(formatIssue(warning));
    }
  }

  if (errors.length) {
    throw new Error(errors.map(formatIssue).join('\n\n'));
  }

  return { errors, warnings };
}
