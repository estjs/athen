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
}
