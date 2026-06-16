import { join } from 'node:path';
import process from 'node:process';
import compression from '@polka/compression';
import polka from 'polka';
import sirv from 'sirv';
import { resolveOutDir } from './constants';
import { resolveConfig } from './config';
import type { IncomingMessage, ServerResponse } from 'node:http';

type PolkaRequest = IncomingMessage & { path: string };
type PolkaResponse = ServerResponse;

export async function serve(root: string, port = 4173, hostOption: string | boolean = 'localhost') {
  const host =
    hostOption === true ? '0.0.0.0' : typeof hostOption === 'string' ? hostOption : 'localhost';
  const config = await resolveConfig(root, 'serve', 'production');
  const base = (config.siteData.base || '').replace(/^\//, '').replace(/\/$/, '');
  const distPath = join(root, resolveOutDir(config));

  const notAnAsset = (pathname: string) => !pathname.includes('/assets/');

  const onNoMatch = (req: PolkaRequest, res: PolkaResponse) => {
    res.statusCode = 404;
    if (notAnAsset(req.path)) {
      res.end('404');
    }
  };

  const compress = compression();
  const serveStatic = sirv(distPath, {
    etag: true,
    maxAge: 31536000,
    immutable: true,
    setHeaders(res, pathname) {
      if (notAnAsset(pathname)) {
        // force server validation for non-asset files since they
        // are not fingerprinted
        res.setHeader('cache-control', 'no-cache');
      }
    },
  });

  if (base) {
    const app = polka({ onNoMatch });
    app.use(`/${base}`, compress);
    app.use(`/${base}`, serveStatic);
    app.listen(port, host, () => {
      process.stdout.write(`Built site served at http://${host}:${port}/${base}/\n\n`);
    });
  } else {
    polka({ onNoMatch })
      .use(compress)
      .use(serveStatic)
      .listen(port, host, () => {
        process.stdout.write(`Built site served at http://${host}:${port}/\n\n`);
      });
  }
}
