import { resolve } from 'node:path';
import process from 'node:process';
import cac from 'cac';
import pkg from '../../package.json';
import { build } from './build';
import { createDevServer, formatDevStartupInfo } from './dev';
import { serve } from './preview';

const resolveRoot = (root?: string) => (root ? resolve(root) : process.cwd());

const cli = cac('athen').version(pkg.version).help();

cli
  .command('dev [root]', 'start dev server')
  .option('--port <port>', 'Port to use for dev server')
  .option('--host [host]', 'Host to use for dev server')
  .action(async (root: string, options: { port?: number; host?: string | boolean }) => {
    const resolvedRoot = resolveRoot(root);
    const createServer = async () => {
      const server = await createDevServer(resolvedRoot, options.port, options.host, async () => {
        await server.close();
        await createServer();
      });
      await server.listen();
      if (server.resolvedUrls) {
        console.log(
          formatDevStartupInfo({
            root: resolvedRoot,
            command: ['athen', 'dev', root].filter(Boolean).join(' '),
            urls: server.resolvedUrls,
            siteTitle: server.config.appTitle,
          }),
        );
      } else {
        server.printUrls();
      }
    };
    await createServer();
  });

cli.command('build [root]', 'build in production').action(async (root: string) => {
  try {
    await build(resolveRoot(root));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
});

cli
  .command('preview [root]', 'preview in production')
  .option('--port <port>', 'Port to use for preview server')
  .option('--host [host]', 'Host to use for preview server')
  .action(async (root: string, options: { port?: number; host?: string | boolean }) => {
    try {
      await serve(resolveRoot(root), options.port, options.host);
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });

cli.parse();
