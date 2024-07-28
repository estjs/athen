declare module 'athen:site-data' {
  import type { DefaultTheme, SiteData } from '@shared/types';
  const siteData: SiteData<DefaultTheme.Config>;
  export default siteData;
}
declare module 'athen:routes' {
  import type { RouteRecordRaw } from 'essor-router';
  export type ComponentType<T> = new (...args: T) => JSX.Element;

  type NewRoute = RouteRecordRaw & {
    preload?: () => Promise<ComponentType<any>>;
  };
  const routes: NewRoute[];
  export { routes };
}

declare module 'athen:base' {
  const baseUrl: string;
  export default baseUrl;
}
