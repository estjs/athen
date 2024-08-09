import { renderToString } from 'essor';
export function render(Compt: any) {
  return renderToString(Compt, {});
}
export { routes } from 'athen:routes';
