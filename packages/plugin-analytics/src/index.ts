import type { HtmlTagDescriptor, Plugin } from 'vite';
import type { AnalyticsOptions } from './types';

function gaSnippets(id: string): HtmlTagDescriptor[] {
  return [
    {
      tag: 'script',
      attrs: {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${id}`,
      },
      children: '',
      injectTo: 'head',
    },
    {
      tag: 'script',
      children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${id}');`,
      injectTo: 'head',
    },
  ];
}

function baiduSnippet(id: string): HtmlTagDescriptor {
  return {
    tag: 'script',
    children: `(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?${id}";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`,
    injectTo: 'head',
  };
}

function tencentSnippet(sid: string, cid?: string): HtmlTagDescriptor {
  // Build `mta.setAttribute("sid", "...")` calls with quoted attribute names
  // and JSON-encoded values — emitting the bare name (`sid`) would reference an
  // undefined identifier at runtime.
  const setAttrs = [`mta.setAttribute("sid", ${JSON.stringify(sid)});`];
  if (cid) setAttrs.push(`mta.setAttribute("cid", ${JSON.stringify(cid)});`);
  return {
    tag: 'script',
    children: `var _mtac = {}; (function() { var mta = document.createElement("script"); mta.src = "//pingjs.qq.com/h5/stats.js?v2.0.4"; mta.setAttribute("name","MTAH5"); ${setAttrs.join(
      ' ',
    )} var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(mta, s);})();`,
    injectTo: 'head',
  };
}

function aliSnippet(id: string): HtmlTagDescriptor {
  return {
    tag: 'script',
    children: `var cnzz_protocol = (('https:' == document.location.protocol) ? ' https://' : ' http://');document.write(unescape("%3Cspan id='cnzz_stat_icon_${id}'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/z_stat.php%3Fid%3D${id}%26show%3Dpic' type='text/javascript'%3E%3C/script%3E"));`,
    injectTo: 'head',
  };
}

function plausibleSnippet(domain: string, apiHost?: string): HtmlTagDescriptor {
  return {
    tag: 'script',
    attrs: {
      'defer': true,
      'data-domain': domain,
      'src': `${apiHost || 'https://plausible.io'}/js/plausible.js`,
    },
    children: '',
    injectTo: 'head',
  };
}

function umamiSnippet(id: string, src: string): HtmlTagDescriptor {
  return {
    tag: 'script',
    attrs: {
      'defer': true,
      'data-website-id': id,
      src,
    },
    children: '',
    injectTo: 'head',
  };
}

function ackeeSnippet(server: string, domainId: string): HtmlTagDescriptor {
  return {
    tag: 'script',
    attrs: {
      'async': true,
      'src': `${server}/tracker.js`,
      'data-ackee-server': server,
      'data-ackee-domain-id': domainId,
    },
    children: '',
    injectTo: 'head',
  };
}

// Vercel Web Analytics is served same-origin from `/_vercel/insights/script.js`
// once enabled on the project, and requires the `window.va` queue stub to buffer
// events until the deferred script loads. See
// https://vercel.com/docs/analytics/quickstart (plain HTML).
function vercelSnippets(id: string): HtmlTagDescriptor[] {
  return [
    {
      tag: 'script',
      children:
        'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };',
      injectTo: 'head',
    },
    {
      tag: 'script',
      attrs: {
        'defer': true,
        'src': '/_vercel/insights/script.js',
        'data-id': id,
      },
      children: '',
      injectTo: 'head',
    },
  ];
}

function customSnippet(snippet: string): HtmlTagDescriptor {
  return {
    tag: 'script',
    children: snippet,
    injectTo: 'head',
  };
}

export default function analyticsPlugin(options: AnalyticsOptions = {}): Plugin | undefined {
  // if no provider configured return undefined
  if (Object.keys(options).length === 0) return undefined;

  return {
    name: 'athen-plugin-analytics',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [];
      if (options.google) tags.push(...gaSnippets(options.google.id));
      if (options.baidu) tags.push(baiduSnippet(options.baidu.id));
      if (options.tencent) tags.push(tencentSnippet(options.tencent.sid, options.tencent.cid));
      if (options.ali) tags.push(aliSnippet(options.ali.id));
      if (options.plausible)
        tags.push(plausibleSnippet(options.plausible.domain, options.plausible.apiHost));
      if (options.umami) tags.push(umamiSnippet(options.umami.id, options.umami.src));
      if (options.ackee) tags.push(ackeeSnippet(options.ackee.server, options.ackee.domainId));
      if (options.vercel) tags.push(...vercelSnippets(options.vercel.id));
      if (options.custom) tags.push(customSnippet(options.custom.snippet));

      return tags;
    },
  };
}
