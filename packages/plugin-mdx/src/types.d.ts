import type { Plugin } from 'vite';
import type { Pluggable } from 'unified';
export type MarkdownPlugin = Pluggable;
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
   * Extra remark plugins appended after Athen built-ins.
   */
  remarkPlugins?: MarkdownPlugin[];
  /**
   * Extra rehype plugins appended after Athen built-ins.
   */
  rehypePlugins?: MarkdownPlugin[];
  /**
   * Whether code blocks should render line numbers by default.
   */
  lineNumbers?: boolean;
  /**
   * Table-of-contents extraction options.
   */
  toc?:
    | boolean
    | {
        level?: [number, number];
      };
  /**
   * External link handling. Set false to disable Athen's default target behavior.
   */
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
  /**
   * Whether to enable the mdx plugin.
   * @default true
   */
  essor: boolean;
}
