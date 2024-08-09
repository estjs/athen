import { resolve } from 'node:path';
import cac from 'cac';
import { build } from './build';
import { createDevServer } from './dev';
import { serve } from './preview';
const cli = cac('athen').version('0.0.0').help();

cli.command('dev [root]', 'start dev server').action(async (root: string) => {
  console.log('start dev with', root);
  const createServer = async () => {
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    });
    await server.listen();
    server.printUrls();
  };
  await createServer();
});
cli.command('build [root]', 'build in production').action(async (root: string) => {
  try {
    root = resolve(root);
    await build(root);
  } catch (error) {
    console.log(error);
  }
});

cli.command('preview [root]', 'preview in production').action(async root => {
  try {
    root = resolve(root);
    await serve(root);
  } catch (error) {
    console.log(error);
  }
});
cli.parse();
