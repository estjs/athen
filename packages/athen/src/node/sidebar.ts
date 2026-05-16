import { normalizePublicRoute } from '../shared/utils';
import type { DefaultTheme } from '../shared/types';
import type { RouteMeta } from './plugins/router/routeService';

export type AutoSidebarConfig =
  | DefaultTheme.Sidebar
  | 'auto'
  | Record<string, DefaultTheme.SidebarGroup[] | 'auto'>;

function isAutoSidebarConfig(sidebar: unknown): sidebar is 'auto' {
  return sidebar === 'auto';
}

export function hasAutoSidebar(sidebar: unknown): boolean {
  if (isAutoSidebarConfig(sidebar)) return true;
  if (!sidebar || typeof sidebar !== 'object') return false;
  return Object.values(sidebar).includes('auto');
}

function formatSegment(segment: string) {
  return segment.replaceAll(/[-_]+/g, ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase());
}

function splitRouteSegments(routePath: string) {
  return normalizePublicRoute(routePath).split('/').filter(Boolean);
}

function normalizeSidebarPrefix(prefix?: string) {
  return prefix ? normalizePublicRoute(prefix, { trailingSlash: true }) : undefined;
}

function isLocaleLikePrefix(prefix: string) {
  const segments = splitRouteSegments(prefix);
  return segments.length === 1 && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segments[0]);
}

function getSidebarKey(routePath: string, prefix?: string) {
  const normalizedPrefix = normalizeSidebarPrefix(prefix);
  const routeSegments = splitRouteSegments(routePath);

  if (!normalizedPrefix) {
    const [firstSegment] = routeSegments;
    return firstSegment ? `/${firstSegment}/` : '/';
  }

  if (normalizedPrefix === '/') {
    const [firstSegment] = routeSegments;
    return firstSegment ? `/${firstSegment}/` : '/';
  }

  if (!isLocaleLikePrefix(normalizedPrefix)) {
    return normalizedPrefix;
  }

  const prefixSegments = splitRouteSegments(normalizedPrefix);
  const section = routeSegments[prefixSegments.length];
  return section ? `/${[...prefixSegments, section].join('/')}/` : normalizedPrefix;
}

function isRouteUnderPrefix(routePath: string, prefix?: string, excludePrefixes: string[] = []) {
  const normalizedRoute = normalizePublicRoute(routePath, { trailingSlash: true });
  const normalizedPrefix = normalizeSidebarPrefix(prefix);
  const normalizedExcludePrefixes = excludePrefixes.map((excludePrefix) =>
    normalizePublicRoute(excludePrefix, { trailingSlash: true }),
  );

  if (
    normalizedExcludePrefixes.some(
      (excludePrefix) =>
        excludePrefix !== '/' &&
        (normalizedRoute === excludePrefix || normalizedRoute.startsWith(excludePrefix)),
    )
  ) {
    return false;
  }

  if (!normalizedPrefix || normalizedPrefix === '/') {
    return true;
  }

  return normalizedRoute === normalizedPrefix || normalizedRoute.startsWith(normalizedPrefix);
}

function isHiddenFromSidebar(route: RouteMeta) {
  return route.frontmatter?.sidebar === false;
}

function toSidebarItem(route: RouteMeta): DefaultTheme.SidebarItem {
  return {
    text: route.title || route.name || route.routePath,
    link: route.routePath,
  };
}

function getRouteOrder(route: RouteMeta) {
  const value = route.frontmatter?.order ?? route.frontmatter?.sidebarOrder;
  const order = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(order) ? order : Number.POSITIVE_INFINITY;
}

function compareRoutes(a: RouteMeta, b: RouteMeta) {
  const orderDiff = getRouteOrder(a) - getRouteOrder(b);
  return orderDiff || a.routePath.localeCompare(b.routePath);
}

function createGroup(key: string, routes: RouteMeta[]): DefaultTheme.SidebarGroup {
  const groupText = key === '/' ? 'Docs' : splitRouteSegments(key).map(formatSegment).join(' ');
  return {
    text: groupText,
    items: routes.map(toSidebarItem),
  };
}

export function createAutoSidebar(
  routes: RouteMeta[],
  prefix?: string,
  excludePrefixes: string[] = [],
): DefaultTheme.Sidebar {
  const groups = new Map<string, RouteMeta[]>();

  for (const route of routes) {
    if (isHiddenFromSidebar(route)) {
      continue;
    }
    if (!isRouteUnderPrefix(route.routePath, prefix, excludePrefixes)) {
      continue;
    }

    const key = getSidebarKey(route.routePath, prefix);
    const groupRoutes = groups.get(key) || [];
    groupRoutes.push(route);
    groups.set(key, groupRoutes);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, groupRoutes]) => [key, [createGroup(key, groupRoutes.sort(compareRoutes))]]),
  );
}

export function resolveSidebar(routes: RouteMeta[], sidebar: AutoSidebarConfig) {
  if (isAutoSidebarConfig(sidebar)) {
    return createAutoSidebar(routes);
  }

  const resolvedSidebar: DefaultTheme.Sidebar = {};
  for (const [prefix, value] of Object.entries(sidebar)) {
    if (value === 'auto') {
      Object.assign(resolvedSidebar, createAutoSidebar(routes, prefix));
    } else {
      resolvedSidebar[prefix] = value;
    }
  }
  return resolvedSidebar;
}
