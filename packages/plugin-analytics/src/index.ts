import type { Plugin } from 'vite';
import type { AnalyticsOptions } from './types';

function gaSnippets(id: string) {
  return [
    {
      tag: 'script',
      attrs: {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${id}`,
      },
      injectTo: 'head',
    },
    {
      tag: 'script',
      children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${id}');`,
      injectTo: 'head',
    },
  ];
}

function baiduSnippet(id: string) {
  return {
    tag: 'script',
    children: `(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?${id}";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();`,
    injectTo: 'head',
  };
}

function tencentSnippet(sid: string, cid?: string) {
  const attrs = [`sid='${sid}'`];
  if (cid) attrs.push(`cid='${cid}'`);
  return {
    tag: 'script',
    children: `var _mtac = {}; (function() { var mta = document.createElement("script"); mta.src = "//pingjs.qq.com/h5/stats.js?v2.0.4"; mta.setAttribute("name","MTAH5"); ${attrs
      .map(a => `mta.setAttribute(${a.split('=')[0]}, ${a.split('=')[1]});`) // naive
      .join(
        ' ',
      )} var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(mta, s);})();`,
    injectTo: 'head',
  };
}

function aliSnippet(id: string) {
  return {
    tag: 'script',
    children: `var cnzz_protocol = (('https:' == document.location.protocol) ? ' https://' : ' http://');document.write(unescape("%3Cspan id='cnzz_stat_icon_${id}'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/z_stat.php%3Fid%3D${id}%26show%3Dpic' type='text/javascript'%3E%3C/script%3E"));`,
    injectTo: 'head',
  };
}

function plausibleSnippet(domain: string, apiHost?: string) {
  return {
    tag: 'script',
    attrs: {
      'defer': true,
      'data-domain': domain,
      'src': `${apiHost || 'https://plausible.io'}/js/plausible.js`,
    },
    injectTo: 'head',
  };
}

function umamiSnippet(id: string, src: string) {
  return {
    tag: 'script',
    attrs: {
      'defer': true,
      'data-website-id': id,
      src,
    },
    injectTo: 'head',
  };
}

function ackeeSnippet(server: string, domainId: string) {
  return {
    tag: 'script',
    attrs: {
      'async': true,
      'src': `${server}/tracker.js`,
      'data-ackee-server': server,
      'data-ackee-domain-id': domainId,
    },
    injectTo: 'head',
  };
}

function vercelSnippet(id: string) {
  return {
    tag: 'script',
    attrs: {
      'defer': true,
      'src': `https://vercel.analytics.com/script.js`,
      'data-id': id,
    },
    injectTo: 'head',
  };
}

function customSnippet(snippet: string) {
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
      const tags: any[] = [];
      if (options.google) tags.push(...gaSnippets(options.google.id));
      if (options.baidu) tags.push(baiduSnippet(options.baidu.id));
      if (options.tencent) tags.push(tencentSnippet(options.tencent.sid, options.tencent.cid));
      if (options.ali) tags.push(aliSnippet(options.ali.id));
      if (options.plausible)
        tags.push(plausibleSnippet(options.plausible.domain, options.plausible.apiHost));
      if (options.umami) tags.push(umamiSnippet(options.umami.id, options.umami.src));
      if (options.ackee) tags.push(ackeeSnippet(options.ackee.server, options.ackee.domainId));
      if (options.vercel) tags.push(vercelSnippet(options.vercel.id));
      if (options.custom) tags.push(customSnippet(options.custom.snippet));

      return tags;
    },
  };
}
