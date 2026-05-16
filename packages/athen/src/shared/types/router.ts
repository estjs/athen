export interface RouteOptions {
  /**
   * The directory to search for pages
   */
  root?: string;
  /**
   * The basename of the site
   */
  prefix?: string;
  /**
   * The extension name of the filepath that will be converted to a route
   * @default ['js','jsx','ts','tsx','md','mdx']
   */
  extensions?: string[];
  /**
   * Include extra files from being converted to routes
   */
  include?: string[];
  /**
   * Exclude files from being converted to routes
   */
  exclude?: string[];
  /**
   * Whether generated public URLs should be clean.
   */
  cleanUrls?: boolean;
  /**
   * Whether generated public URLs should end with a trailing slash.
   */
  trailingSlash?: boolean;
  /**
   * Public URL rewrites used by link checking and route normalization.
   */
  rewrites?: Record<string, string>;
}
