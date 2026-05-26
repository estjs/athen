import { dirname, isAbsolute, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import {
  LOCALE_PREFERENCE_KEY,
  getLocaleRedirectEntries,
  hasRootLocale,
  normalizeLanguageTag,
  normalizeLocalePrefix,
} from '../shared/locale';
import { DEFAULT_THEME_PATH } from './constants';
import { type RouteMeta, collectRoutes } from './routes';
import { buildSidebar, hasAutoSidebar, resolveSidebarConfig } from './sidebar';
import type { LocaleRedirectEntry } from '../shared/locale';
import type {
  EditLink,
  HeadConfig,
  LocaleConfig,
  RouteOptions,
  Sidebar,
  SiteConfig,
  SiteData,
  UserConfig,
} from '../shared/types';

const CONFIG_FILE_PATTERN = /^athen\.config\.(?:ts|js|mjs|cjs)$/;

type RawConfig = UserConfig | Promise<UserConfig> | (() => UserConfig | Promise<UserConfig>);

function getUserConfigPath(root: string): string {
  const configFile = fs.readdirSync(root).find((file) => CONFIG_FILE_PATTERN.test(file));
  if (!configFile) {
    throw new Error(`No athen config file found in ${root}`);
  }
  return resolve(root, configFile);
}

async function loadUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production',
): Promise<readonly [string, UserConfig]> {
  const configPath = getUserConfigPath(root);
  const result = await loadConfigFromFile({ command, mode }, configPath, root);
  if (!result) return [configPath, {}] as const;

  const { config: raw = {} as RawConfig } = result;
  const userConfig = await (typeof raw === 'function' ? raw() : raw);
  return [configPath, userConfig as UserConfig] as const;
}

const DARK_MODE_SCRIPT: HeadConfig = [
  'script',
  { id: 'check-dark-light' },
  `;(function () {
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var setting = localStorage.getItem('color-schema') || 'auto';
  if (setting === 'dark' || (prefersDark && setting !== 'light')) {
    document.documentElement.classList.toggle('dark', true);
  }
})();`,
];

/**
 * Inlined `<script id="check-lang">` body — pure client code. Match algorithm
 * mirrors `resolveLocaleRedirectTarget` below: in-prefix → skip; localStorage
 * preference → jump; navigator.languages best-match (exact > base lang) →
 * jump; otherwise first redirectable. Modern ES (matches `target:
 * baseline-widely-available`).
 */
const LOCALE_REDIRECT_SCRIPT_BODY = `cfg => {
  const strip = s => (s||'').replace(/^\\/+|\\/+$/g,'');
  const norm = t => (t||'').replace(/_/g,'-').trim().toLowerCase();
  const cur = (location.pathname||'/').replace(/\\/+$/,'') || '/';
  const go = p => { location.href = cfg.base + '/' + p + '/'; };
  if (cfg.entries.some(e => { const p = cfg.base+'/'+strip(e.prefix); return cur===p||cur.startsWith(p+'/'); })) return;
  let stored=''; try { stored = strip(localStorage.getItem(cfg.key)||''); } catch {}
  if (stored && cfg.entries.some(e => strip(e.prefix)===stored)) return go(stored);
  if (cfg.hasRoot) return;
  const ok = cfg.entries.map(e => ({p:strip(e.prefix), l:norm(e.lang||e.prefix)})).filter(e=>e.p);
  for (const c of (navigator.languages || [navigator.language] || []).map(norm).filter(Boolean)) {
    const cb = c.split('-')[0];
    const hit = ok.find(e=>e.l===c) || ok.find(e=>e.l===cb || e.l.split('-')[0]===cb);
    if (hit) return go(hit.p);
  }
  if (ok[0]) go(ok[0].p);
}`;

/**
 * Build the `<script id="check-lang">` head entry that redirects on first
 * load. Returns null when redirection is unnecessary (no locales, or only a
 * root locale).
 */
function createLanguageRedirectScript(siteData: SiteData): HeadConfig | null {
  const entries = getLocaleRedirectEntries(siteData);
  const hasRoot = hasRootLocale(siteData);
  if (entries.length === 0 || (hasRoot && entries.length === 1)) return null;
  const cfg = JSON.stringify({
    base: siteData.base || '',
    entries,
    key: LOCALE_PREFERENCE_KEY,
    hasRoot,
  });
  return ['script', { id: 'check-lang' }, `;(${LOCALE_REDIRECT_SCRIPT_BODY})(${cfg})`];
}

function normalizeEditLink(value: string | EditLink | undefined): EditLink | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return { pattern: value };
  return value;
}

/**
 * Normalize the locales record:
 *  - Replace the `root` alias with `'/'`.
 *  - Fill in `langRoutePrefix` (the normalized URL prefix) so theme/runtime
 *    code can read it without re-deriving.
 *  - Inline-normalize per-locale `editLink` from string form.
 */
function normalizeLocales(
  locales: Record<string, LocaleConfig> | undefined,
): Record<string, LocaleConfig> | undefined {
  if (!locales) return undefined;
  const out: Record<string, LocaleConfig> = {};
  for (const [rawKey, raw] of Object.entries(locales)) {
    const key = rawKey === 'root' ? '/' : rawKey;
    const normalizedPrefix = normalizeLocalePrefix(key);
    out[key] = {
      ...raw,
      langRoutePrefix: normalizedPrefix ? `/${normalizedPrefix}/` : '/',
      editLink: typeof raw.editLink === 'string' ? { pattern: raw.editLink } : raw.editLink,
    };
  }
  return out;
}

/**
 * Server-side counterpart of the client redirect script. Pick the locale URL
 * prefix that best matches a list of preferred BCP-47 language tags. Used by
 * SSG output and exposed for tests; the inline `LOCALE_REDIRECT_SCRIPT_BODY`
 * above implements the same algorithm for the browser.
 */
export function resolveLocaleRedirectTarget(
  preferredLanguages: string[],
  localeEntries: LocaleRedirectEntry[],
  storedLocalePrefix?: string,
): string | undefined {
  const entries = localeEntries.map((e) => ({
    prefix: normalizeLocalePrefix(e.prefix),
    lang: normalizeLanguageTag(e.lang || e.prefix),
  }));
  if (entries.length === 0) return undefined;

  if (storedLocalePrefix) {
    const target = normalizeLocalePrefix(storedLocalePrefix);
    const match = entries.find((e) => e.prefix === target);
    if (match) return match.prefix ? `/${match.prefix}/` : undefined;
  }

  const hasRoot = entries.some((e) => e.prefix === '');
  const redirectable = entries.filter((e) => e.prefix);
  if (hasRoot || redirectable.length === 0) return undefined;

  for (const candidate of preferredLanguages.map(normalizeLanguageTag).filter(Boolean)) {
    const base = candidate.split('-')[0];
    const hit =
      redirectable.find((e) => e.lang === candidate) ||
      redirectable.find((e) => {
        const eb = e.lang.split('-')[0];
        return e.lang === base || eb === base;
      });
    if (hit) return `/${hit.prefix}/`;
  }
  return `/${redirectable[0].prefix}/`;
}

function resolveRoute(userConfig: UserConfig): RouteOptions | undefined {
  const route: RouteOptions = {
    ...(userConfig.route || {}),
    ...(userConfig.srcDir && { root: userConfig.srcDir }),
    ...(userConfig.routeBasePath && { prefix: userConfig.routeBasePath }),
    ...(userConfig.include && { include: userConfig.include }),
    ...(userConfig.exclude && { exclude: userConfig.exclude }),
    ...(userConfig.extensions && { extensions: userConfig.extensions }),
    ...(userConfig.cleanUrls !== undefined && { cleanUrls: userConfig.cleanUrls }),
    ...(userConfig.trailingSlash !== undefined && { trailingSlash: userConfig.trailingSlash }),
    ...(userConfig.rewrites && { rewrites: userConfig.rewrites }),
  };
  return Object.keys(route).length ? route : undefined;
}

/**
 * Compose the auto-generated sidebar from a pre-collected route table. Runs
 * for every locale prefix (root + each declared locale) so per-locale subtrees
 * get their own sidebar entries.
 */
function resolveAutoSidebar(scanDir: string, siteData: SiteData, routes: RouteMeta[]): Sidebar {
  const prefixes = ['', ...Object.keys(siteData.locales || {}).map(normalizeLocalePrefix)];
  const merged: Sidebar = {};
  for (const prefix of new Set(prefixes)) {
    Object.assign(merged, buildSidebar(scanDir, routes, prefix));
  }
  return merged;
}

function assembleHead(userConfig: UserConfig, siteData: SiteData): HeadConfig[] {
  const head: HeadConfig[] = [...(userConfig.head ?? [])];
  if (userConfig.colorScheme !== false) head.push(DARK_MODE_SCRIPT);
  const redirect = createLanguageRedirectScript(siteData);
  if (redirect) head.push(redirect);
  return head;
}

/** Build the public `SiteData` from a user config. */
export function resolveSiteData(root: string, userConfig: UserConfig = {}): SiteData {
  const siteData: SiteData = {
    root,
    base: userConfig.base ?? '',
    lang: userConfig.lang ?? 'en-US',
    title: userConfig.title ?? 'Athen',
    description: userConfig.description ?? '',
    favicon: userConfig.favicon ?? '',
    head: [],
    colorScheme: userConfig.colorScheme ?? true,
    search: typeof userConfig.search === 'object' ? userConfig.search : undefined,
    defaultLocale: userConfig.defaultLocale,
    locales: normalizeLocales(userConfig.locales),
    logo: userConfig.logo,
    nav: userConfig.nav,
    socialLinks: userConfig.socialLinks,
    editLink: normalizeEditLink(userConfig.editLink),
    footer: userConfig.footer,
    lastUpdated: userConfig.lastUpdated,
    slots: userConfig.slots,
    themeConfig: userConfig.themeConfig,
  };
  siteData.head = assembleHead(userConfig, siteData);
  return siteData;
}

function resolveThemeDir(theme: string | undefined, root: string): string {
  if (!theme) return DEFAULT_THEME_PATH;
  if (isAbsolute(theme)) return theme;
  const require = createRequire(import.meta.url);
  try {
    return dirname(require.resolve(theme, { paths: [root] }));
  } catch {
    return resolve(root, theme);
  }
}

export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production',
): Promise<SiteConfig> {
  const [configPath, userConfig] = await loadUserConfig(root, command, mode);
  const themeDir = resolveThemeDir(userConfig.theme, root);

  const route = resolveRoute(userConfig);
  const siteData = resolveSiteData(root, userConfig);

  // Scan routes once; downstream (sidebar, brokenLinks, router plugin, dev
  // middleware, mdx HMR) reads from `config._routes` instead of re-walking.
  const scanDir = join(root, route?.root || userConfig.srcDir || '');
  const routes = collectRoutes(scanDir, route, siteData);

  const userSidebar = userConfig.sidebar ?? 'auto';
  const autoSidebar = hasAutoSidebar(userSidebar)
    ? resolveAutoSidebar(scanDir, siteData, routes)
    : {};
  siteData.sidebar = resolveSidebarConfig(
    userSidebar === 'auto' ? undefined : userSidebar,
    autoSidebar,
  );

  return {
    root,
    configPath,
    themeDir,
    siteData,
    search: userConfig.search,
    analytics: userConfig.analytics,
    plugins: userConfig.plugins,
    vite: userConfig.vite,
    route,
    markdown: userConfig.markdown,
    cleanUrls: userConfig.cleanUrls,
    trailingSlash: userConfig.trailingSlash,
    rewrites: userConfig.rewrites,
    outDir: userConfig.outDir,
    tempDir: userConfig.tempDir,
    enableSpa: userConfig.enableSpa,
    onBrokenLinks: userConfig.onBrokenLinks,
    srcDir: userConfig.srcDir,
    _routes: routes,
  };
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
