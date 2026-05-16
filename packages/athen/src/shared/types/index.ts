import type { FrontMatterMeta, PageModule } from './frontMatter';
import type { DefaultTheme } from './defaultTheme';
import type { RouteOptions } from './router';
import type { PluginOption, UserConfig as ViteConfiguration } from 'vite';
export { DefaultTheme } from './defaultTheme';
export type { RouteOptions } from './router';

export * from './frontMatter';

// Search configuration types
export interface SearchConfig {
  provider?: 'flex' | 'algolia';
  include?: string[];
  exclude?: string[];
  searchIndexPath?: string;
  cache?: {
    enabled?: boolean;
    maxAge?: number;
  };
  searchOptions?: {
    limit?: number;
    enrich?: boolean;
    suggest?: boolean;
  };
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

export interface Meta {
  name?: string;
}
export interface Router {
  path: string;
  component: unknown;
  meta?: Meta;
  preload?: (base?: string) => Promise<unknown>;
}

export interface PluginOptions {
  root: string;
}

export interface Header {
  id: string;
  text: string;
  depth: number;
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

export type BrokenLinksBehavior = 'throw' | 'warn' | 'ignore';

export interface SiteUserConfig {
  /**
   * Base path of the site.
   */
  base?: string;
  /**
   * Path to html icon file. `favicon` is the preferred name for new configs.
   */
  icon?: string;
  favicon?: string;
  /**
   * Language of the site.
   */
  lang?: string;
  /**
   * Title of the site.
   */
  title?: string;
  /**
   * Description of the site.
   */
  description?: string;
  /**
   * Custom head config.
   */
  head?: HeadConfig[];
  /**
   * Whether dark mode/light mode toggle button is displayed.
   */
  colorScheme?: boolean;
}

export interface DocsUserConfig {
  /**
   * Source directory of the site.
   */
  srcDir?: string;
  /**
   * Route prefix for generated documentation pages.
   */
  routeBasePath?: string;
  /**
   * Include extra files from being converted to routes.
   */
  include?: string[];
  /**
   * Exclude files from being converted to routes.
   */
  exclude?: string[];
  /**
   * File extensions that can be converted to routes.
   */
  extensions?: string[];
  /**
   * Output directory of the site.
   */
  outDir?: string;
  /**
   * Temporary directory of the site.
   */
  tempDir?: string;
  /**
   * Enable single page application in production.
   */
  enableSpa?: boolean;
  /**
   * Broken-link handling strategy.
   */
  onBrokenLinks?: BrokenLinksBehavior;
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  rewrites?: Record<string, string>;
  /**
   * Edit link URL pattern, e.g. `https://github.com/org/repo/edit/main/docs/:path`.
   */
  editUrl?: string;
  editLink?: DefaultTheme.EditLink;
  /**
   * Whether to calculate git based last-updated metadata.
   */
  lastUpdated?: boolean;
}

export type MarkdownPlugin = unknown | [unknown, Record<string, unknown>?];

export interface MarkdownConfig {
  /**
   * Whether code blocks should render line numbers by default.
   */
  lineNumbers?: boolean;
  /**
   * Table-of-contents extraction/rendering options.
   */
  toc?:
    | boolean
    | {
        level?: [number, number];
      };
  remarkPlugins?: MarkdownPlugin[];
  rehypePlugins?: MarkdownPlugin[];
  externalLinks?:
    | false
    | {
        target?: string | false;
        rel?: string | false;
      };
  shiki?: {
    theme?: string;
    themes?: string[];
  };
}

export interface I18nConfig {
  defaultLocale?: string;
  locales?: Record<string, DefaultTheme.LocaleConfig>;
  redirect?: boolean;
}

export interface ThemeUserConfig<ThemeConfig = DefaultTheme.Config> {
  /**
   * Theme package name or relative/absolute path.
   */
  name?: string;
  path?: string;
  /**
   * Theme-specific configuration.
   */
  config?: ThemeConfig;
  /**
   * Convenience aliases for the default theme.
   */
  nav?: DefaultTheme.NavItem[];
  sidebar?: DefaultTheme.SidebarConfig;
  socialLinks?: DefaultTheme.IconLink[];
}

export interface UserConfig<ThemeConfig = unknown> {
  /**
   * Optional grouped site metadata. Prefer top-level fields for simple configs.
   */
  site?: SiteUserConfig;
  /**
   * Optional grouped documentation routing/build behavior. Prefer top-level fields for simple configs.
   */
  docs?: DocsUserConfig;
  /**
   * Markdown / MDX pipeline configuration.
   */
  markdown?: MarkdownConfig;
  /**
   * Optional grouped internationalization configuration. Prefer top-level `locales` for simple configs.
   */
  i18n?: I18nConfig;
  /**
   * Base path of the site.
   */
  base?: string;
  /**
   * Path to html icon file.
   */
  icon?: string;
  /**
   * Preferred name for the site favicon.
   */
  favicon?: string;
  /**
   * Source directory of the site.
   */
  srcDir?: string;
  /**
   * Language of the site.
   */
  lang?: string;

  /**
   * Language of the site.
   */
  langs?: string[];
  /**
   * Default locale key or language tag.
   */
  defaultLocale?: string;
  /**
   * Locale-specific default-theme configuration.
   */
  locales?: Record<string, DefaultTheme.LocaleConfig>;
  /**
   * Title of the site.
   */
  title?: string;
  /**
   * Description of the site.
   */
  description?: string;
  /**
   * Custom head config.
   */
  head?: HeadConfig[];
  /**
   * Theme config.
   */
  themeConfig?: ThemeConfig;
  /**
   * Output directory of the site.
   */
  outDir?: string;
  /**
   * Temporary directory of the site.
   */
  tempDir?: string;
  /**
   * Vite Configuration
   */
  vite?: ViteConfiguration;
  /**
   * Enable single page application in production.
   */
  enableSpa?: boolean;
  /**
   * Whether to fail builds when there are dead links.
   */
  allowDeadLinks?: boolean;
  /**
   * Broken-link handling strategy.
   */
  onBrokenLinks?: BrokenLinksBehavior;
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  rewrites?: Record<string, string>;
  /**
   * Whether dark mode/light mode toggle button is displayed.
   */
  colorScheme?: boolean;
  /**
   * The custom config of vite-plugin-route
   */
  route?: RouteOptions;
  /**
   * Route prefix for generated pages.
   */
  routeBasePath?: string;
  /**
   * Include files from being converted to routes.
   */
  include?: string[];
  /**
   * Exclude files from being converted to routes.
   */
  exclude?: string[];
  /**
   * File extensions that can be converted to routes.
   */
  extensions?: string[];
  /**
   * Edit link URL pattern, e.g. `https://github.com/org/repo/edit/main/docs/:path`.
   */
  editUrl?: string;
  editLink?: DefaultTheme.EditLink;
  /**
   * Analytics configuration. If set to false, built-in analytics plugin is disabled.
   */
  analytics?: Record<string, unknown> | false;
  /**
   * Multiple site instances in a single repo.
   */
  instances?: Array<{
    root: string; // sub directory relative to workspace root
    base?: string;
    outDir?: string;
  }>;
  /**
   * Custom theme package name or relative/absolute path. If not provided, built-in default theme will be used.
   */
  theme?: string | ThemeUserConfig<ThemeConfig>;
  /**
   * Search configuration. If set to false, built-in search plugin is disabled.
   */
  search?: SearchConfig | boolean;
  /**
   * Custom Vite / Athen plugins. If a plugin shares the same `name` with a built-in one, it will override it.
   */
  plugins?: PluginOption[];
}

/**
 * Resolved site configuration. This is the output of `resolveConfig()` — it only
 * contains the fields that the config resolver actually produces, rather than
 * inheriting every optional UserConfig field.
 */
export interface SiteConfig<ThemeConfig = unknown> {
  root: string;
  configPath: string;
  themeDir: string;
  siteData: SiteData<ThemeConfig>;
  configDeps?: string[];
  /** Search configuration passthrough from user config. */
  search?: SearchConfig | boolean;
  /** Analytics configuration passthrough from user config. */
  analytics?: Record<string, unknown> | false;
  /** User-supplied Vite/Athen plugins. */
  plugins?: PluginOption[];
  /** Multi-instance build configuration. */
  instances?: Array<{
    root: string;
    base?: string;
    outDir?: string;
  }>;
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
  allowDeadLinks?: boolean;
  srcDir?: string;
}
export interface SiteData<ThemeConfig = unknown> {
  root: string;
  base: string;
  lang: string;
  title: string;
  description: string;
  icon: string;
  head: HeadConfig[];
  themeConfig: ThemeConfig;
  colorScheme: boolean;
  search?: SearchConfig;
}

export type PageType = 'home' | 'doc' | 'api' | 'custom' | '404';

export interface PageData {
  siteData: SiteData<DefaultTheme.Config>;
  pagePath: string;
  relativePagePath: string;
  lastUpdatedTime?: string;
  title?: string;
  pageType: PageType;
  frontmatter?: FrontMatterMeta;
  description?: string;
  toc?: Header[];
  content?: string;
  routePath: string;
  subModules?: PageModule<unknown>[];
}
