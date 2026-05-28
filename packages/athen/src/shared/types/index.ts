import type { FrontMatterMeta, PageModule } from './frontMatter';
import type { PluginOption, UserConfig as ViteConfiguration } from 'vite';
import type {
  EditLink,
  Footer,
  HeadConfig,
  IconLink,
  Image,
  LocaleConfig,
  NavItem,
  Sidebar,
  SidebarConfig,
} from './theme';

export * from './frontMatter';
export * from './theme';

// -----------------------------------------------------------------------
// Route options (passed through to the file-based route scanner)
// -----------------------------------------------------------------------

export interface RouteOptions {
  /** The directory to search for pages. */
  root?: string;
  /** The basename of the site. */
  prefix?: string;
  /**
   * Extensions of files that should be converted into routes.
   * @default ['js','jsx','ts','tsx','md','mdx']
   */
  extensions?: string[];
  /** Extra glob patterns to include. */
  include?: string[];
  /** Glob patterns to exclude. */
  exclude?: string[];
  /** Whether generated public URLs should be clean (no `.html` suffix). */
  cleanUrls?: boolean;
  /** Whether generated public URLs should end with a trailing slash. */
  trailingSlash?: boolean;
  /** Public URL rewrites used by link checking and route normalization. */
  rewrites?: Record<string, string>;
}

// -----------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------

export interface SearchConfig {
  provider?: 'flex' | 'algolia';
  include?: string[];
  exclude?: string[];
  searchIndexPath?: string;
  cache?: { enabled?: boolean; maxAge?: number };
  searchOptions?: { limit?: number; enrich?: boolean; suggest?: boolean };
  algolia?: {
    appId: string;
    apiKey: string;
    indexName: string;
    algoliaOptions?: Record<string, unknown>;
  };
  transformResult?: (results: SearchResult[]) => SearchResult[];
  customFields?: Record<
    string,
    {
      getter: (page: unknown) => string;
      index?: {
        encode?: string | ((str: string) => string);
        tokenize?: string | ((str: string) => string[]);
        resolution?: number;
      };
    }
  >;
}

export interface SearchResult {
  path: string;
  title: string;
  heading?: string;
  content?: string;
}

// -----------------------------------------------------------------------
// Misc shared
// -----------------------------------------------------------------------

export interface Meta {
  name?: string;
  filePath?: string;
  description?: string;
  lang?: string;
  localePrefix?: string;
  headings?: Array<{ id: string; text: string; depth: number }>;
}

export interface Router {
  path: string;
  component: unknown;
  meta?: Meta;
  preload?: (base?: string) => Promise<unknown>;
  title?: string;
  description?: string;
  lang?: string;
  localePrefix?: string;
}

/**
 * Pre-scanned route record produced by `collectRoutes`. Shared by the
 * build-time route table, sidebar generation, broken-link checking, and the
 * `athen:routes` virtual module codegen.
 */
export interface RouteMeta {
  routePath: string;
  absolutePath: string;
  filePath: string;
  name?: string;
  title?: string;
  description?: string;
  frontmatter?: Record<string, unknown>;
  headings?: Array<{ id: string; text: string; depth: number }>;
  /** Normalized URL prefix of the locale this route belongs to (`''` for root). */
  localePrefix?: string;
  lang?: string;
}

export interface PluginOptions {
  root: string;
}

export interface Header {
  id: string;
  text: string;
  depth: number;
}

export type BrokenLinksBehavior = 'throw' | 'warn' | 'ignore';

export interface MarkdownConfig {
  lineNumbers?: boolean;
  toc?: boolean | { level?: [number, number] };
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  externalLinks?: false | { target?: string | false; rel?: string | false };
  shiki?: { theme?: string; themes?: string[] };
}

// -----------------------------------------------------------------------
// Main user config — flat
// -----------------------------------------------------------------------

export interface UserConfig {
  // ---- site identity ----
  title?: string;
  description?: string;
  lang?: string;
  base?: string;
  favicon?: string;
  /** Site logo (used in navbar). */
  logo?: Image;
  head?: HeadConfig[];
  /** Whether the light/dark toggle is enabled. */
  colorScheme?: boolean;

  // ---- routing ----
  srcDir?: string;
  outDir?: string;
  tempDir?: string;
  routeBasePath?: string;
  include?: string[];
  exclude?: string[];
  extensions?: string[];
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  rewrites?: Record<string, string>;
  /** Single-page application mode in production. */
  enableSpa?: boolean;
  onBrokenLinks?: BrokenLinksBehavior;
  /** Show last-updated timestamps under each page. */
  lastUpdated?: boolean;

  // ---- i18n ----
  defaultLocale?: string;
  locales?: Record<string, LocaleConfig>;

  // ---- theme content ----
  nav?: NavItem[];
  /** Sidebar config. Defaults to `'auto'` (derived from filesystem + `_meta.json`). */
  sidebar?: SidebarConfig;
  socialLinks?: IconLink[];
  /** Either a URL pattern string (e.g. `https://github.com/org/repo/edit/main/:path`) or an `EditLink` object. */
  editLink?: string | EditLink;
  footer?: Footer;
  /** Custom layout slots (banner/sidebar-extra/footer-extra). */
  slots?: {
    banner?: unknown;
    sidebarExtra?: unknown;
    footerExtra?: unknown;
  };

  // ---- capabilities ----
  search?: SearchConfig | boolean;
  analytics?: Record<string, unknown> | false;
  markdown?: MarkdownConfig;

  // ---- custom theme ----
  /** Custom theme package name or path. */
  theme?: string;
  /** Free-form bag passed through to custom themes. */
  themeConfig?: Record<string, unknown>;

  // ---- escape hatches ----
  vite?: ViteConfiguration;
  route?: RouteOptions;
  plugins?: PluginOption[];
}

/**
 * Resolved site configuration. Output of `resolveConfig()`.
 */
export interface SiteConfig {
  root: string;
  configPath: string;
  themeDir: string;
  siteData: SiteData;
  configDeps?: string[];
  search?: SearchConfig | boolean;
  analytics?: Record<string, unknown> | false;
  plugins?: PluginOption[];
  vite?: ViteConfiguration;
  route?: RouteOptions;
  markdown?: MarkdownConfig;
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  rewrites?: Record<string, string>;
  outDir?: string;
  tempDir?: string;
  enableSpa?: boolean;
  onBrokenLinks?: BrokenLinksBehavior;
  srcDir?: string;
  /** Internal: pre-scanned route table shared across plugins and build steps. */
  _routes?: RouteMeta[];
}

/**
 * Resolved site data exposed to the runtime via the `athen:site-data` virtual
 * module. All theme fields are flat — no nested `themeConfig` wrapper.
 */
export interface SiteData {
  root: string;
  base: string;
  lang: string;
  title: string;
  description: string;
  favicon: string;
  head: HeadConfig[];
  colorScheme: boolean;
  search?: SearchConfig;

  // i18n
  defaultLocale?: string;
  locales?: Record<string, LocaleConfig>;

  // theme content (resolved — `editLink` always an object if present)
  logo?: Image;
  nav?: NavItem[];
  sidebar?: Sidebar;
  socialLinks?: IconLink[];
  editLink?: EditLink;
  footer?: Footer;
  lastUpdated?: boolean;
  /** Site-level fallback for the aside outline heading. Per-locale overrides
   *  live in `locales[x].outlineTitle`. Defaults to `'On this page'`. */
  outlineTitle?: string;
  slots?: {
    banner?: unknown;
    sidebarExtra?: unknown;
    footerExtra?: unknown;
  };

  /** Passthrough bag for custom themes. */
  themeConfig?: Record<string, unknown>;
}

export type PageType = 'home' | 'doc' | 'api' | 'custom' | '404';

export interface PageData {
  siteData: SiteData;
  pagePath: string;
  relativePagePath: string;
  lastUpdatedTime?: string;
  title?: string;
  pageType: PageType;
  frontmatter?: FrontMatterMeta;
  description?: string;
  lang?: string;
  toc?: Header[];
  content?: string;
  routePath: string;
  subModules?: PageModule<unknown>[];
}
