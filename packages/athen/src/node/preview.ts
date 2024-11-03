import path, { join } from 'node:path';
import compression from '@polka/compression';
import polka from 'polka';
import sirv from 'sirv';
import { DIST_DIR } from './constants';
import { resolveConfig } from './config';
export async function serve(root: string) {
  const port = 4173;
  const host = 'localhost';
  const config = await resolveConfig(root, 'serve', 'production');
  const base = config.base?.replace(/^\//, '').replace(/\/$/, '') || '';

  const notAnAsset = (pathname: string) => !pathname.includes('/assets/');

  let distPath = '';
  if (config.outDir) {
    distPath = path.isAbsolute(config.outDir) ? config.outDir : join(config.root, DIST_DIR);
  } else {
    distPath = join(config.root, DIST_DIR);
  }
  const onNoMatch: polka.IOptions['onNoMatch'] = (req, res) => {
    res.statusCode = 404;
    if (notAnAsset(req.path)) {
      res.end('404');
    }
  };

  const compress = compression();
  const serve = sirv(distPath, {
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
    polka({ onNoMatch })
      .use(base, serve, compression)
      .listen(port, host, (err: Error) => {
        if (err) throw err;
        console.log(`Built site served at http://${host}:${port}/${base}/\n`);
      });
  } else {
    polka({ onNoMatch })
      .use(compress, serve)
      .listen(port, host, (err: Error) => {
        if (err) throw err;
        console.log(`Built site served at http://${host}:${port}/\n`);
      });
  }
}
