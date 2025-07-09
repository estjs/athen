import type { DefaultTheme, PageType } from '.';

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
  icon: DefaultTheme.FeatureIcon;
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
  title: string;
  description: string;
  api: boolean;
  pageType: PageType;
  /**
   * The layout to use when rendering the page, e.g. `home`.
   */
  layout?: string;
  features?: Feature[];
  hero?: Hero;
  sidebar?: boolean;
  outline?: boolean;
  lineNumbers?: boolean;
  sponsors?: Sponsor[];
  cta?: CTA;
}
export interface PageModule<T extends any> {
  default: T;
  frontmatter?: FrontMatterMeta;
  content?: string;
  [key: string]: unknown;
}
