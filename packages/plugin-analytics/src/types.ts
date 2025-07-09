export interface GoogleAnalytics {
  id: string;
}

export interface BaiduTongji {
  id: string; // hm.js id
}

export interface TencentMTA {
  sid: string; // site id
  cid?: string; // app id
}

export interface AliCNZZ {
  id: string; // cnzz site id
}

export interface Plausible {
  domain: string;
  apiHost?: string;
}

export interface Umami {
  id: string;
  src: string; // umami script src
}

export interface Ackee {
  server: string; // ackee server url (no trailing slash)
  domainId: string;
}

export interface VercelAnalytics {
  id: string;
}

export interface CustomAnalytics {
  snippet: string; // raw script snippet
}

export interface AnalyticsOptions {
  google?: GoogleAnalytics;
  baidu?: BaiduTongji;
  tencent?: TencentMTA;
  ali?: AliCNZZ;
  plausible?: Plausible;
  umami?: Umami;
  ackee?: Ackee;
  vercel?: VercelAnalytics;
  custom?: CustomAnalytics;
}
