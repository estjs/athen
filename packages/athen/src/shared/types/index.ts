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

export interface UserConfig<ThemeConfig = unknown> {
  /**
   * Base path of the site.
   */
  base?: string;
  /**
   * Path to html icon file.
   */
  icon?: string;
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
   * Whether dark mode/light mode toggle button is displayed.
   */
  colorScheme?: boolean;
  /**
   * The custom config of vite-plugin-route
   */
  route?: RouteOptions;
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
  theme?: string;
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
  outDir?: string;
  tempDir?: string;
  enableSpa?: boolean;
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
