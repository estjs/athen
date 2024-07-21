import type { Plugin } from 'vite';
export interface options {
  /**
   * root path
   */
  root: string;
  /**
   * Base path of the site.
   */
  base: string;
  /**
   * Enable single page application in production.
   */
  enableSpa?: boolean;
  /**
   * Whether to fail builds when there are dead links.
   */
  allowDeadLinks?: boolean;
  /**
   * vite plugin array
   */
  plugins?: Plugin[];
  /**
   * Whether to enable the mdx plugin.
   * @default true
   */
  essor: boolean;
}
