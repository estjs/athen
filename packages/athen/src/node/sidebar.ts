import { dirname, join } from 'node:path';
import fs from 'fs-extra';
import { humanize } from '../shared/title';
import type { Sidebar, SidebarConfig, SidebarGroup, SidebarItem } from '../shared/types';
import type { RouteMeta } from './routes';

/**
 * Per-folder metadata file. Drop next to your pages as `_meta.json` to
 * customise sidebar grouping without writing a sidebar config block.
 *
 * - `title`     — Group label shown in the sidebar. Defaults to a humanised
 *                 folder name.
 * - `order`     — Numeric sort key when grouping is sorted (lower first).
 * - `items`     — Ordered list of immediate children: either file basenames
 *                 (without extension) or subfolder names. Anything omitted is
 *                 dropped from the sidebar; anything not listed falls through
 *                 to alphabetical / frontmatter `order`.
 * - `collapsed` — Default-collapse this group in the UI.
 * - `hidden`    — Hide this folder (and its children) from the sidebar
 *                 entirely (still routable).
 */
export interface FolderMeta {
  title?: string;
  order?: number;
  items?: string[];
  collapsed?: boolean;
  hidden?: boolean;
}

interface FolderNode {
  type: 'folder';
  name: string;
  absolutePath: string;
  meta?: FolderMeta;
  children: Node[];
}

interface PageNode {
  type: 'page';
  name: string;
  route: RouteMeta;
}

type Node = FolderNode | PageNode;

const META_FILE = '_meta.json';

function readFolderMeta(folderPath: string): FolderMeta | undefined {
  const metaPath = join(folderPath, META_FILE);
  if (!fs.existsSync(metaPath)) return undefined;
  try {
    return fs.readJSONSync(metaPath) as FolderMeta;
  } catch (error) {
    console.warn(`[athen] Failed to parse ${metaPath}:`, error);
    return undefined;
  }
}

function getNodeOrder(node: Node): number {
  if (node.type === 'folder') {
    const value = node.meta?.order;
    return typeof value === 'number' && Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  }
  const value = node.route.frontmatter?.order;
  const order = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(order) ? order : Number.POSITIVE_INFINITY;
}

function isHiddenPage(route: RouteMeta): boolean {
  return route.frontmatter?.sidebar === false;
}

/** Build a folder/page tree under `scanRoot` from a flat list of routes. */
function buildTree(scanRoot: string, routes: RouteMeta[]): FolderNode {
  const root: FolderNode = {
    type: 'folder',
    name: '',
    absolutePath: scanRoot,
    children: [],
  };

  const folderCache = new Map<string, FolderNode>();
  folderCache.set(scanRoot, root);

  function getFolder(absolutePath: string): FolderNode {
    const existing = folderCache.get(absolutePath);
    if (existing) return existing;
    const parent = getFolder(dirname(absolutePath));
    const node: FolderNode = {
      type: 'folder',
      name: absolutePath.slice(dirname(absolutePath).length + 1),
      absolutePath,
      meta: readFolderMeta(absolutePath),
      children: [],
    };
    parent.children.push(node);
    folderCache.set(absolutePath, node);
    return node;
  }

  for (const route of routes) {
    if (isHiddenPage(route)) continue;
    const absoluteFilePath = route.absolutePath;
    const folder = getFolder(dirname(absoluteFilePath));
    const baseName = route.name || '';
    folder.children.push({ type: 'page', name: baseName, route });
  }

  // Read meta for the root too — used by single-section sidebars.
  if (!root.meta) {
    root.meta = readFolderMeta(scanRoot);
  }
  return root;
}

function sortChildren(folder: FolderNode): Node[] {
  const items = folder.meta?.items;
  const byName = new Map<string, Node>();
  for (const child of folder.children) {
    if (child.type === 'folder' && child.meta?.hidden) continue;
    byName.set(child.name, child);
  }

  // 1) Items pinned in `_meta.json#items` come first, in declared order.
  const ordered: Node[] = [];
  const pinned = new Set<string>();
  if (Array.isArray(items)) {
    for (const name of items) {
      const node = byName.get(name);
      if (node) {
        ordered.push(node);
        pinned.add(name);
      }
    }
  }

  // 2) Remaining items fall back to frontmatter `order` (pages) or
  //    `_meta.json#order` (folders), then alphabetical.
  const remaining = [...byName.values()].filter((n) => !pinned.has(n.name));
  remaining.sort((a, b) => {
    const orderDelta = getNodeOrder(a) - getNodeOrder(b);
    if (orderDelta !== 0) return orderDelta;
    return a.name.localeCompare(b.name);
  });

  return [...ordered, ...remaining];
}

function buildSidebarItem(node: Node): SidebarItem | undefined {
  if (node.type === 'page') {
    return {
      text: node.route.title || humanize(node.name),
      link: node.route.routePath,
    };
  }
  // Folder → group-as-item (collapsible item with children)
  const children = sortChildren(node).map(buildSidebarItem).filter(Boolean) as SidebarItem[];
  if (children.length === 0) return undefined;
  return {
    text: node.meta?.title || humanize(node.name),
    items: children,
  };
}

function buildSidebarGroup(folder: FolderNode): SidebarGroup | undefined {
  const items = sortChildren(folder).map(buildSidebarItem).filter(Boolean) as SidebarItem[];
  if (items.length === 0) return undefined;
  return {
    text: folder.meta?.title || (folder.name ? humanize(folder.name) : undefined),
    items,
    collapsed: folder.meta?.collapsed,
  };
}

/**
 * Produce sidebar groups keyed by their top-level section (e.g. `/guide/`).
 *
 * - Each immediate subfolder of `scanRoot` becomes a sidebar section.
 * - Pages directly under `scanRoot` (e.g. `index.md`) are skipped — they're
 *   typically landing pages and rarely belong in a sidebar.
 * - For i18n sites with `localePrefix` (e.g. `zh`), the locale folder is
 *   transparent: groups are keyed under `/zh/<section>/`.
 */
export function buildSidebar(scanRoot: string, routes: RouteMeta[], localePrefix = ''): Sidebar {
  // Only include routes that live under this locale (or the root locale).
  const localeRoutes = routes.filter((route) => (route.localePrefix || '') === localePrefix);
  if (localeRoutes.length === 0) return {};

  const tree = buildTree(scanRoot, localeRoutes);
  const sidebar: Sidebar = {};

  // First-level folders below the locale folder become sections. For the root
  // locale, the locale folder doesn't exist — first-level folders of scanRoot
  // ARE the sections.
  const sectionRoot = localePrefix
    ? ((tree.children.find((c) => c.type === 'folder' && c.name === localePrefix) as
        | FolderNode
        | undefined) ?? tree)
    : tree;

  for (const child of sortChildren(sectionRoot)) {
    if (child.type !== 'folder') continue;
    const group = buildSidebarGroup(child);
    if (!group) continue;
    const key = localePrefix ? `/${localePrefix}/${child.name}/` : `/${child.name}/`;
    sidebar[key] = [group];
  }

  return sidebar;
}

// -----------------------------------------------------------------------
// Explicit sidebar config support (escape hatch)
// -----------------------------------------------------------------------

function isAutoMarker(value: unknown): value is 'auto' {
  return value === 'auto';
}

/** True when any part of the user's sidebar config asks for auto-generation. */
export function hasAutoSidebar(sidebar: unknown): boolean {
  if (isAutoMarker(sidebar)) return true;
  if (!sidebar || typeof sidebar !== 'object') return false;
  return Object.values(sidebar as Record<string, unknown>).includes('auto');
}

/**
 * Merge an explicit user sidebar config with an auto-generated one. For each
 * key:
 *   - `'auto'`        → use the auto sidebar entry for that prefix
 *   - explicit groups → keep as-is
 */
export function resolveSidebarConfig(
  userSidebar: SidebarConfig | undefined,
  autoSidebar: Sidebar,
): Sidebar {
  if (!userSidebar || userSidebar === 'auto') {
    return autoSidebar;
  }

  const result: Sidebar = { ...autoSidebar };
  for (const [prefix, value] of Object.entries(userSidebar)) {
    if (value === 'auto') {
      if (autoSidebar[prefix]) result[prefix] = autoSidebar[prefix];
    } else {
      result[prefix] = value;
    }
  }
  return result;
}
