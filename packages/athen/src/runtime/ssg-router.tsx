import { inject, provide } from 'essor';
import { useRoute as useClientRoute, useRouter as useClientRouter } from 'athen:ssg-essor-router';
import type { Router, RouterViewProps } from 'athen:ssg-essor-router';
import type { InjectionKey } from 'essor';

export * from 'athen:ssg-essor-router';

const RouterKey = Symbol('athen:ssg-router') as InjectionKey<Router>;
const RouteKey = Symbol('athen:ssg-route') as InjectionKey<SsgRoute>;
const ViewDepthKey = Symbol('athen:ssg-view-depth') as InjectionKey<number>;

type SsgRouteComponent = unknown;
type SsgMatchedRoute = {
  components?: Record<string, SsgRouteComponent> | null;
};
type SsgRoute = {
  matched: SsgMatchedRoute[];
};

function hasRenderableComponent(record?: SsgMatchedRoute) {
  return Boolean(record?.components && Object.values(record.components).some(Boolean));
}

function resolveViewDepth(route: SsgRoute, depth: number) {
  while (route.matched[depth] && !hasRenderableComponent(route.matched[depth])) {
    depth += 1;
  }

  return depth;
}

function normalizeComponent(component: SsgRouteComponent | undefined) {
  if (component && typeof component === 'object' && 'default' in component) {
    return (component as { default: SsgRouteComponent }).default;
  }

  return component;
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function renderComponent(component: SsgRouteComponent | undefined, props: RouterViewProps) {
  const fallback = props.fallback || props.children;
  const ViewComponent = normalizeComponent(component || fallback);

  if (!ViewComponent) {
    return null;
  }

  if (typeof ViewComponent !== 'function') {
    return ViewComponent;
  }

  try {
    const Component = ViewComponent as (props?: Record<string, unknown>) => unknown;

    return <Component />;
  } catch (error) {
    props.onError?.(normalizeError(error));

    if (fallback && fallback !== ViewComponent) {
      return renderComponent(fallback, props);
    }

    return null;
  }
}

export function useRouter() {
  return inject(RouterKey) || useClientRouter();
}

export function useRoute() {
  return inject(RouteKey) || useClientRoute();
}

export function usePreloadRoute() {
  const router = useRouter();

  return (to: Parameters<Router['preloadRoute']>[0]) => router.preloadRoute(to);
}

export function RouterView(props: RouterViewProps) {
  const router = props.router || useRouter();
  const route = (props.route || inject(RouteKey) || router.currentRoute.value) as SsgRoute;
  const depth = resolveViewDepth(route, props.router ? 0 : inject(ViewDepthKey, 0));
  const matchedRoute = route.matched[depth];
  const viewName = props.name || 'default';

  router.init();
  provide(RouterKey, router);
  provide(RouteKey, route);
  provide(ViewDepthKey, depth + 1);

  return renderComponent(matchedRoute?.components?.[viewName], props);
}
