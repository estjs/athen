import { join } from 'node:path';
import fs from 'fs-extra';
import { CLIENT_ENTRY_PATH, DEFAULT_HTML_PATH } from '../../constants';
import type { SiteConfig } from '../../../shared/types';
import type { Plugin } from 'vite';

export function pluginIndexHtml(config: SiteConfig): Plugin {
  return {
    name: 'athen:index-html',
    apply: 'serve',
    transformIndexHtml(html) {
      // Insert client entry script in development
      // And in production, we will insert it in ssr render
      const head =
        config.siteData?.head?.map(item => {
          const [tag, attrs, children] = item;
          return {
            tag,
            attrs,
            children,
          };
        }) ?? [];
      return {
        html,
        tags: [
          ...head,
          {
            tag: 'link',
            attrs: {
              rel: 'icon',
              href: `${config.siteData?.icon}`,
              type: 'image/image/svg+xml',
            },
            injectTo: 'head',
          },
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: `/@fs/${CLIENT_ENTRY_PATH}`,
            },
            injectTo: 'body',
          },
        ],
      };
    },
    configureServer(server) {
      if (config.configPath) {
        server.watcher.add(config.configPath);
        config.configDeps?.forEach(dep => {
          server.watcher.add(dep);
        });
      }
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (res.writableEnded) {
            return next();
          }
          const indexHtmlInRoot = join(config.root, 'athen', 'index.html');
          const templatePath = (await fs.pathExists(indexHtmlInRoot))
            ? indexHtmlInRoot
            : DEFAULT_HTML_PATH;

          if (req.url?.replace(/\?.*/, '')) {
            let html = fs.readFileSync(templatePath, 'utf8');

            try {
              html = await server.transformIndexHtml(req.url, html, req.originalUrl);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              res.end(html);
            } catch (error) {
              return next(error);
            }
          }
        });
      };
    },
  };
}
