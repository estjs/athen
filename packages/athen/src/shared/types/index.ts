import type { FrontMatterMeta, PageModule } from './frontMatter';
import type { DefaultTheme } from './defaultTheme';
import type { RouteOptions } from './router';
import type { PluginOption, UserConfig as ViteConfiguration } from 'vite';
export { DefaultTheme } from './defaultTheme';

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
    algoliaOptions?: Record<string, any>;
  };
  transformResult?: (results: any[]) => any[];
}

// TODO:
// router types
type Component = any;
export interface Meta {
  name?: string;
}
export interface Router {
  path: string;
  component: Component;
  meta?: Meta;
  preload?: (base?: string) => Promise<Component>;
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
  analytics?: Record<string, any> | false;
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

export interface SiteConfig<ThemeConfig = unknown> extends Omit<UserConfig, 'themeConfig'> {
  root: string;
  srcDir: string;
  configPath?: string;
  configDeps?: string[];
  themeDir?: string;
  outDir?: string;
  // Current page data
  siteData?: SiteData<ThemeConfig>;
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
  pageType: string;
  frontmatter?: FrontMatterMeta;
  description?: string;
  toc?: Header[];
  content?: string;
  routePath: string;
  subModules?: PageModule<any>[];
}
