import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { version as _version } from '../package.json';

export const TEMPLATE_PACKAGE_PATH = join(
  resolve(),
  'packages/create-athen',
  'template',
  'package.json',
);

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function updateTemplatePackageJson(source: string, version: string) {
  const packageJson = JSON.parse(source) as PackageJson;
  const dependencyVersion = `^${version}`;

  if (packageJson.devDependencies?.athen) {
    packageJson.devDependencies.athen = dependencyVersion;
  } else if (packageJson.dependencies?.athen) {
    packageJson.dependencies.athen = dependencyVersion;
  } else {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      athen: dependencyVersion,
    };
  }

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

function updateTemplateVersion(version: string, packagePath = TEMPLATE_PACKAGE_PATH) {
  const source = readFileSync(packagePath, 'utf8');
  const updated = updateTemplatePackageJson(source, version);

  if (source === updated) {
    return false;
  }

  writeFileSync(packagePath, updated);
  return true;
}

function main() {
  console.log(` package.json version: ${_version}\n`);

  updateTemplateVersion(_version);
  console.log('update template version done.');
}

(() => {
  main();
})();
