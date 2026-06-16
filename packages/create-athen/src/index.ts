/* eslint-disable no-console -- create-athen is a CLI and console output is its user interface. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import minimist from 'minimist';
import prompts from 'prompts';
import { execa } from 'execa';
import { blue, bold, cyan, dim, green, yellow } from 'kolorist';
import packageInfo from '../package.json';

const { version } = packageInfo;

const argv = minimist<{
  t?: string;
  template?: string;
  y?: boolean;
  yes?: boolean;
  i?: boolean;
  install?: boolean;
}>(process.argv.slice(2), {
  string: ['_'],
  boolean: ['y', 'yes', 'i', 'install'],
});

const cwd = process.cwd();

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
};

const skipPrompts = argv.y || argv.yes;
const autoInstall = argv.i || argv.install;

/** Detect the package manager that invoked this CLI, from npm's env hints. */
export function detectPackageManager(): 'pnpm' | 'yarn' | 'npm' {
  const hint = `${process.env.npm_execpath ?? ''} ${process.env.npm_config_user_agent ?? ''}`;
  if (/pnpm/.test(hint)) return 'pnpm';
  if (/yarn/.test(hint)) return 'yarn';
  return 'npm';
}

/** A valid npm package name (optionally scoped). */
export const PACKAGE_NAME_REGEXP = /^(?:@[\d*a-z~-][\d*._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/;

/** Slugify an arbitrary project name into a valid npm package name. */
export function toValidPackageName(projectName: string): string {
  return projectName
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replaceAll(/[^\da-z~-]+/g, '-');
}

async function init() {
  console.log(`  ${cyan('●') + blue('■') + yellow('▲')}`);
  console.log(`${bold('  athen') + dim(' Creator')}  ${blue(`v${version}`)}`);
  console.log();
  let targetDir = argv._[0];
  if (!targetDir && !skipPrompts) {
    const { projectName } = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'athen',
    });
    targetDir = projectName.trim();
  }
  if (!targetDir) {
    targetDir = 'athen';
  }
  const packageName = skipPrompts
    ? toValidPackageName(path.basename(targetDir))
    : await getValidPackageName(targetDir);
  const root = path.join(cwd, targetDir);

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  } else {
    const existing = fs.readdirSync(root);
    if (existing.length > 0) {
      console.log(yellow(`  Target directory "${targetDir}" is not empty.`));
      if (skipPrompts) {
        emptyDir(root);
      } else {
        /**
         * @type {{ yes: boolean }}
         */
        const { yes } = await prompts({
          type: 'confirm',
          name: 'yes',
          initial: 'Y',
          message: 'Remove existing files and continue?',
        });
        if (yes) emptyDir(root);
        else return;
      }
    }
  }

  console.log(dim('  Scaffolding project in ') + targetDir + dim(' ...'));

  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../..', 'template');

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) fs.writeFileSync(targetPath, content);
    else copy(path.join(templateDir, file), targetPath);
  };
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file);
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'));
  pkg.name = packageName;

  write('package.json', JSON.stringify(pkg, null, 2));

  const pkgManager = detectPackageManager();

  const related = path.relative(cwd, root);

  console.log(green('  Done.\n'));

  let installNow = autoInstall;
  if (!skipPrompts && !autoInstall) {
    const { yes } = await prompts({
      type: 'confirm',
      name: 'yes',
      initial: 'Y',
      message: 'Install and start it now?',
    });
    installNow = yes;
  }

  if (installNow) {
    await execa(pkgManager, ['install'], { stdio: 'inherit', cwd: root });
    // do not auto run dev in CI mode
    if (!skipPrompts) {
      await execa(pkgManager, pkgManager === 'yarn' ? ['dev'] : ['run', 'dev'], {
        stdio: 'inherit',
        cwd: root,
      });
    }
  } else {
    console.log(dim('\n  start it later by:\n'));
    if (root !== cwd) console.log(blue(`  cd ${bold(related)}`));

    console.log(blue(`  ${pkgManager === 'yarn' ? 'yarn' : `${pkgManager} install`}`));
    console.log(blue(`  ${pkgManager === 'yarn' ? 'yarn dev' : `${pkgManager} run dev`}`));
    console.log();
    console.log(`  ${cyan('●')} ${blue('■')} ${yellow('▲')}`);
    console.log();
  }
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) copyDir(src, dest);
  else fs.copyFileSync(src, dest);
}

async function getValidPackageName(projectName: string) {
  projectName = path.basename(projectName);
  if (PACKAGE_NAME_REGEXP.test(projectName)) {
    return projectName;
  } else {
    const suggestedPackageName = toValidPackageName(projectName);

    /**
     * @type {{ inputPackageName: string }}
     */
    const { inputPackageName } = await prompts({
      type: 'text',
      name: 'inputPackageName',
      message: 'Package name:',
      initial: suggestedPackageName,
      validate: (input) => (PACKAGE_NAME_REGEXP.test(input) ? true : 'Invalid package.json name'),
    });
    return inputPackageName;
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file);
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      fs.rmdirSync(abs);
    } else {
      fs.unlinkSync(abs);
    }
  }
}

// Skip the auto-run under Vitest so the module's pure helpers can be imported
// and unit-tested without launching the interactive CLI.
if (!process.env.VITEST) {
  (() => {
    init().catch((error) => {
      console.error(error);
    });
  })();
}
