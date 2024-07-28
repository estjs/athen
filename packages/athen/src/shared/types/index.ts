import type { FrontMatterMeta, PageModule } from './frontMatter';
import type { DefaultTheme } from './defaultTheme';
import type { RouteOptions } from './router';
import type { UserConfig as ViteConfiguration } from 'vite';

export { DefaultTheme } from './defaultTheme';

export * from './frontMatter';

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
  appearance?: boolean;
  /**
   * The custom config of vite-plugin-route
   */
  route?: RouteOptions;
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
  appearance: boolean;
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
