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

export interface FrontMatterMeta {
  title: string;
  description: string;
  api: boolean;
  pageType: PageType;
  features?: Feature[];
  hero?: Hero;
  sidebar?: boolean;
  outline?: boolean;
  lineNumbers?: boolean;
}
export interface PageModule<T extends any> {
  default: T;
  frontmatter?: FrontMatterMeta;
  content?: string;
  [key: string]: unknown;
}
