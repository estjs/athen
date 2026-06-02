export type FeatureIcon = string | { src: string; alt?: string; width?: string; height: string };

export interface Hero {
  name: string;
  text: string;
  tagline: string;
  image?: {
    src: string;
    alt: string;
  };
  actions: {
    text: string;
    link: string;
    theme: 'brand' | 'alt';
  }[];
}

export interface Feature {
  icon: FeatureIcon;
  title: string;
  details: string;
}

export interface CTA {
  title: string;
  text?: string;
  /**
   * Destination link when clicking the CTA button. If omitted, no button is rendered.
   */
  link?: string;
  /**
   * Custom text for CTA button, defaults to "Get Started" in UI layer.
   */
  buttonText?: string;
}

export interface Sponsor {
  /** Display name */
  name: string;
  /** Sponsor logo image path/url */
  logo: string;
  /** External link to sponsor site */
  link: string;
}

export interface FrontMatterMeta {
  description?: string;
  /**
   * The layout to use when rendering the page. `'home'` selects the built-in
   * home layout; `'api'` and `'custom'` switch the resolved `pageType`
   * accordingly. Anything else (including unset) falls through to the default
   * doc layout.
   */
  layout?: string;
  /**
   * Sidebar sort key (Docusaurus-style). Lower values appear first. For a
   * folder, set it in that folder's `index.md` to order the whole section.
   */
  sidebar_position?: number;
  /** Override the sidebar display text (page title is unchanged). */
  sidebar_label?: string;
  /** Extra CSS class applied to this entry's sidebar item. */
  sidebar_class_name?: string;
  /** Stable unique key for this sidebar item (used as the render key). */
  sidebar_key?: string;
  /** Hide the page from the auto-generated sidebar. */
  sidebar?: boolean;
  /** Hide the right-side "On this page" outline. */
  outline?: boolean;
  /** Render line numbers in code blocks on this page (overrides markdown.lineNumbers). */
  lineNumbers?: boolean;

  // Home layout blocks (rendered when `layout: 'home'`)
  hero?: Hero;
  features?: Feature[];
  sponsors?: Sponsor[];
  cta?: CTA;
}
export interface PageModule<T = unknown> {
  default: T;
  frontmatter?: FrontMatterMeta;
  content?: string;
  [key: string]: unknown;
}
