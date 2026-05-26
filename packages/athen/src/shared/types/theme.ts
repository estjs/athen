// `HeadConfig` is defined in this same file to avoid a circular import with `./index.ts`.

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

// -----------------------------------------------------------------------
// Nav
// -----------------------------------------------------------------------

export type NavItem = NavItemWithLink | NavItemWithChildren;

export interface NavItemWithLink {
  text: string;
  link: string;
  activeMatch?: string;
}

export interface NavItemWithChildren {
  text?: string;
  items: NavItemWithLink[];
}

// -----------------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------------

export type Sidebar = Record<string, SidebarGroup[]>;

/**
 * Sidebar configuration. Defaults to `'auto'` — derived from the filesystem
 * + per-folder `_meta.json` files. Pass an explicit object for full control.
 */
export type SidebarConfig = Sidebar | 'auto' | Record<string, SidebarGroup[] | 'auto'>;

export interface SidebarGroup {
  text?: string;
  items: SidebarItem[];
  collapsed?: boolean;
  collapsable?: boolean;
}

export type SidebarItem =
  | { text: string; link: string }
  | { text: string; link?: string; items: SidebarItem[] };

// -----------------------------------------------------------------------
// Edit link
// -----------------------------------------------------------------------

export interface EditLink {
  /** URL pattern, e.g. `https://github.com/org/repo/edit/main/:path`. */
  pattern: string;
  /** Custom text. Defaults to `Edit this page`. */
  text?: string;
}

// -----------------------------------------------------------------------
// Icons / links / images
// -----------------------------------------------------------------------

export type Image = string | { src: string; alt?: string };

export type IconLinkIcon =
  | 'discord'
  | 'facebook'
  | 'gitlab'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'mastodon'
  | 'npm'
  | 'slack'
  | 'twitter'
  | 'x'
  | 'youtube'
  | 'wechat'
  | { svg: string };

export interface IconLink {
  icon: IconLinkIcon;
  link: string;
  ariaLabel?: string;
}

// -----------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------

export interface Footer {
  message?: string;
  copyright?: string;
}

// -----------------------------------------------------------------------
// Locale config (flat — same field names as the root config)
// -----------------------------------------------------------------------

export interface LocaleConfig {
  /** UI label shown in the language switcher (required). */
  label: string;
  /** BCP-47 language tag for this locale. */
  lang?: string;
  /** Resolved at build time — the URL prefix for this locale (`''` for root). */
  langRoutePrefix?: string;
  /** Label used inside the language switcher dropdown. */
  selectText?: string;
  /** Per-locale `<title>`. */
  title?: string;
  /** Per-locale `<meta name="description">`. */
  description?: string;
  /** Per-locale extra `<head>` entries. */
  head?: HeadConfig[];

  // Theme overrides (same field names as the root config)
  nav?: NavItem[];
  sidebar?: SidebarConfig;
  socialLinks?: IconLink[];
  editLink?: string | EditLink;
  footer?: Footer;
  logo?: Image;
  lastUpdatedText?: string;
  outlineTitle?: string;
  prevPageText?: string;
  nextPageText?: string;
}

// -----------------------------------------------------------------------
// Resolved per-route locale view
// -----------------------------------------------------------------------

/** What components see via `useLocale()` — the locale's identity + theme fields merged with the root. */
export interface ResolvedLocaleData {
  label: string;
  lang?: string;
  langRoutePrefix?: string;
  selectText?: string;
  title?: string;
  description?: string;
  head?: HeadConfig[];
  // theme fields (merged from root + locale override)
  nav?: NavItem[];
  sidebar?: Sidebar;
  socialLinks?: IconLink[];
  editLink?: EditLink;
  footer?: Footer;
  logo?: Image;
  lastUpdatedText?: string;
  outlineTitle?: string;
  prevPageText?: string;
  nextPageText?: string;
}
