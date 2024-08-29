import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { version as _version } from '../package.json';
const execPromise = promisify(exec);

const TEMPLATE_PATH = join(resolve(), 'packages/create-athen', 'template');

async function updateTemplateVersion() {
  console.log(` package.json version: ${_version}\n`);

  const packages = readFileSync(join(TEMPLATE_PATH, 'package.json'), 'utf8');

  const pack = packages.replaceAll(/"athen.*("\^?\d+\.\d+\.\d.*)/g, `"athen": "^${_version}"`);

  writeFileSync(join(TEMPLATE_PATH, 'package.json'), pack);

  console.log('update template version done.');

  await execPromise(`git add ${TEMPLATE_PATH} package.json`);
  await execPromise(`git commit -m "chore: update changelog"`);
  await execPromise('git push');
}

(() => {
  updateTemplateVersion();
})();
