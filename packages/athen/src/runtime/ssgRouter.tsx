import { inject, provide } from 'essor';
import type { InjectionKey } from 'essor';
import type {
  RouteComponent,
  RouteComponentLoader,
  RouteLocationNormalizedLoaded,
  Router,
  RouterViewProps,
} from 'essor-router';

const RouterKey = Symbol('athen:ssg-router') as InjectionKey<Router>;
const RouteKey = Symbol('athen:ssg-route') as InjectionKey<RouteLocationNormalizedLoaded>;
const ViewDepthKey = Symbol('athen:ssg-view-depth') as InjectionKey<number>;

const ROUTE_COMPONENT_LOADER = '__routeComponentLoader';

type RouteComponentModule = RouteComponent | { default: RouteComponent };

function normalizeDefaultExport(component: unknown) {
  if (component && typeof component === 'object' && 'default' in component) {
    return (component as { default: unknown }).default;
  }
  return component;
}

function normalizeRouteComponent(component: RouteComponentModule): RouteComponent {
  return normalizeDefaultExport(component) as RouteComponent;
}

function isPromiseLike<T = unknown>(value: unknown): value is PromiseLike<T> {
  return Boolean(value && typeof (value as { then?: unknown }).then === 'function');
}

function isRouteComponentLoader(component: unknown): component is RouteComponentLoader {
  return (
    typeof component === 'function' &&
    Boolean((component as unknown as Record<string, unknown>)[ROUTE_COMPONENT_LOADER])
  );
}

async function resolveRouteComponent(component: unknown): Promise<RouteComponent> {
  if (isPromiseLike<RouteComponentModule>(component)) {
    return normalizeRouteComponent(await component);
  }
  if (isRouteComponentLoader(component)) {
    return normalizeRouteComponent(await component());
  }
  return normalizeRouteComponent(component as RouteComponentModule);
}

function renderComponentOrValue(value: unknown) {
  const component = normalizeDefaultExport(value);
  if (typeof component === 'function') return (component as RouteComponent)({});
  return component ?? null;
}

/**
 * Resolve every matched route's component up-front so SSR rendering never hits
 * a pending promise or an unresolved lazy import.
 */
export async function preloadSsgRoute(router: Router, routePath: string) {
  await router.preloadRoute(routePath);
  for (const matched of router.currentRoute.value.matched) {
    const components = matched.components;
    if (!components) continue;
    await Promise.all(
      Object.keys(components).map(async (name) => {
        components[name] = await resolveRouteComponent(components[name]);
      }),
    );
  }
}

function hasRenderableComponent(record: RouteLocationNormalizedLoaded['matched'][number]) {
  const components = record?.components;
  return Boolean(components && Object.values(components).some(Boolean));
}

function resolveViewDepth(route: RouteLocationNormalizedLoaded, depth: number) {
  while (route.matched[depth] && !hasRenderableComponent(route.matched[depth])) {
    depth += 1;
  }
  return depth;
}

/**
 * SSG-friendly counterpart of `essor-router`'s `RouterView`. The client
 * implementation relies on lifecycle hooks that don't fire under
 * `renderToStringAsync`; here we walk the matched chain synchronously and
 * resolve nested views via Essor's `provide`/`inject`.
 */
export function RouterView(props: RouterViewProps) {
  const router = props.router ?? inject(RouterKey);
  if (!router) return null;

  const route = (props.route ??
    inject(RouteKey) ??
    router.currentRoute.value) as RouteLocationNormalizedLoaded;
  const startDepth = props.router ? 0 : inject(ViewDepthKey, 0)!;
  const depth = resolveViewDepth(route, startDepth);
  const matched = route.matched[depth];
  const viewName = props.name || 'default';

  router.init();
  provide(RouterKey, router);
  provide(RouteKey, route);
  provide(ViewDepthKey, depth + 1);

  const View = matched?.components?.[viewName];
  if (View) return renderComponentOrValue(View);
  return renderComponentOrValue(props.fallback ?? props.children);
}
