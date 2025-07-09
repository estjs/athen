import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import minimist from 'minimist';
import prompts from 'prompts';
import { execa } from 'execa';
import { blue, bold, cyan, dim, green, yellow } from 'kolorist';
const { version } = await import('../package.json');

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
    ? targetDir.replaceAll(/\s+/g, '-')
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
  for (const file of files.filter(f => f !== 'package.json')) {
    write(file);
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'));
  pkg.name = packageName;

  write('package.json', JSON.stringify(pkg, null, 2));

  const pkgManager =
    /pnpm/.test(process.env.npm_execpath as string) ||
    /pnpm/.test(process.env.npm_config_user_agent as string)
      ? 'pnpm'
      : /yarn/.test(process.env.npm_execpath as string)
        ? 'yarn'
        : 'npm';

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
    const agent =
      /pnpm/.test(process.env.npm_execpath as string) ||
      /pnpm/.test(process.env.npm_config_user_agent as string)
        ? 'pnpm'
        : /yarn/.test(process.env.npm_execpath as string)
          ? 'yarn'
          : 'npm';

    await execa(agent, ['install'], { stdio: 'inherit', cwd: root });
    // do not auto run dev in CI mode
    if (!skipPrompts) {
      await execa(agent, agent === 'yarn' ? ['dev'] : ['run', 'dev'], {
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
  const packageNameRegExp = /^(?:@[\d*a-z~-][\d*._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/;
  if (packageNameRegExp.test(projectName)) {
    return projectName;
  } else {
    const suggestedPackageName = projectName
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replaceAll(/[^\da-z~-]+/g, '-');

    /**
     * @type {{ inputPackageName: string }}
     */
    const { inputPackageName } = await prompts({
      type: 'text',
      name: 'inputPackageName',
      message: 'Package name:',
      initial: suggestedPackageName,
      validate: input => (packageNameRegExp.test(input) ? true : 'Invalid package.json name'),
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

(() => {
  init().catch(error => {
    console.error(error);
  });
})();
