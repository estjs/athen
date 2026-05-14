import {
  convertTextChildToString as serverConvertTextChildToString,
  convertToString as serverConvertToString,
  createSSGComponent as serverCreateSSGComponent,
  render as serverRender,
} from 'athen:ssg-essor-server';

export * from 'athen:ssg-essor-server';

const SafeHtmlMarker = Symbol.for('athen.ssg.safe-html');

type SafeHtml = {
  [SafeHtmlMarker]: true;
  html: string;
  toString: () => string;
};

function markSafeHtml(value: unknown): SafeHtml {
  const html = String(value ?? '');

  return {
    [SafeHtmlMarker]: true,
    html,
    toString() {
      return html;
    },
  };
}

function isSafeHtml(value: unknown): value is SafeHtml {
  return Boolean(value && typeof value === 'object' && (value as SafeHtml)[SafeHtmlMarker]);
}

function unwrapSafeHtml(value: unknown): unknown {
  if (isSafeHtml(value)) {
    return value.html;
  }

  if (Array.isArray(value)) {
    return value.map(unwrapSafeHtml);
  }

  if (typeof value === 'function') {
    return () => unwrapSafeHtml(value());
  }

  return value;
}

export function convertTextChildToString(content: unknown) {
  if (isSafeHtml(content)) {
    return content.html;
  }

  if (Array.isArray(content)) {
    return content.map(convertTextChildToString).join('');
  }

  if (typeof content === 'function') {
    return convertTextChildToString(content());
  }

  return serverConvertTextChildToString(content);
}

export function convertToString(content: unknown, isSvg?: boolean) {
  return serverConvertToString(unwrapSafeHtml(content), isSvg);
}

export function createSSGComponent(component: any, props?: any) {
  return markSafeHtml(serverCreateSSGComponent(component, props));
}

export function render(templates: string[], hydrationKey: string, ...components: unknown[]) {
  return markSafeHtml(
    serverRender(
      templates,
      hydrationKey,
      ...components.map(component => convertToString(component)),
    ),
  );
}
