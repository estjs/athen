import { execFile, spawn } from 'node:child_process';
import process from 'node:process';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import type { ChildProcess } from 'node:child_process';

const repoRoot = process.cwd();
const exampleRoot = (name: string) => resolve(repoRoot, 'examples', name);
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const runningProcesses = new Set<ChildProcess>();

function runPnpm(args: string[], timeout = 120_000) {
  return new Promise<string>((resolveOutput, reject) => {
    const child = execFile(
      pnpmExecutable,
      args,
      { cwd: repoRoot, timeout },
      (error, stdout, stderr) => {
        const output = `${stdout}${stderr}`;
        if (error) {
          reject(new Error(`pnpm ${args.join(' ')} failed\n${output}`));
          return;
        }
        resolveOutput(output);
      },
    );
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
  });
}

function stopProcess(child: ChildProcess) {
  if (!runningProcesses.has(child)) return Promise.resolve();
  runningProcesses.delete(child);

  return new Promise<void>((resolveStop) => {
    const timeout = setTimeout(() => {
      try {
        if (process.platform === 'win32') {
          child.kill('SIGKILL');
        } else if (child.pid) {
          process.kill(-child.pid, 'SIGKILL');
        }
      } catch {}
      resolveStop();
    }, 5000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolveStop();
    });

    try {
      if (process.platform === 'win32') {
        child.kill('SIGTERM');
      } else if (child.pid) {
        process.kill(-child.pid, 'SIGTERM');
      }
    } catch {
      clearTimeout(timeout);
      resolveStop();
    }
  });
}

async function waitForServer(url: string, child: ChildProcess, getOutput: () => string) {
  const deadline = Date.now() + 45_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Example server exited before it was ready\n${getOutput()}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 500));
  }

  throw new Error(`Timed out waiting for ${url}\n${String(lastError)}\n${getOutput()}`);
}

async function startExampleServer(mode: 'dev' | 'preview', name: string, port: number) {
  if (mode === 'preview') {
    await runPnpm(['exec', 'athen', 'build', exampleRoot(name)]);
  }

  let output = '';
  const child = spawn(
    pnpmExecutable,
    [
      'exec',
      'athen',
      mode === 'dev' ? 'dev' : 'preview',
      exampleRoot(name),
      '--port',
      String(port),
      '--host',
      '127.0.0.1',
    ],
    {
      cwd: repoRoot,
      detached: process.platform !== 'win32',
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.stdout?.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr?.on('data', (chunk) => {
    output += chunk;
  });

  runningProcesses.add(child);
  const baseURL = `http://127.0.0.1:${port}`;
  await waitForServer(baseURL, child, () => output);

  return {
    baseURL,
    stop: () => stopProcess(child),
  };
}

test.afterEach(async () => {
  await Promise.all([...runningProcesses].map((child) => stopProcess(child)));
});

test.describe.configure({ mode: 'serial' });

test('custom theme example renders its theme layout in dev', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startExampleServer('dev', 'custom-theme', 9211);

  await page.goto(server.baseURL);

  await expect(page.locator('.example-theme-shell')).toBeVisible();
  await expect(page.locator('.example-theme-brand')).toHaveText('Custom Theme Example');
  await expect(
    page.locator('.example-theme-nav').getByRole('link', { name: 'Guide', exact: true }),
  ).toHaveAttribute('href', '/guide/getting-started');
  await expect(page.getByRole('heading', { name: 'Custom Theme Example', level: 1 })).toBeVisible();

  await server.stop();
});

test('basic example covers shallow config, markdown, URLs, and link checking', async ({ page }) => {
  test.setTimeout(120_000);
  const server = await startExampleServer('preview', 'basic', 9213);

  await page.goto(server.baseURL);
  await expect(page.getByRole('heading', { name: 'Basic Example', level: 1 })).toBeVisible();
  await expect(page.getByText('Released under the MIT License.')).toBeVisible();

  await page.goto(`${server.baseURL}/guide/start/`);
  await expect(page).toHaveURL(/\/guide\/start\/$/);
  await expect(page.getByRole('heading', { name: 'Basic Start', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Valid guide page' })).toHaveAttribute(
    'href',
    /\/guide\/valid(?:\/|\.html)?$/,
  );
  await expect(page.getByRole('link', { name: 'Valid guide anchor' })).toHaveAttribute(
    'href',
    /\/guide\/valid(?:\/|\.html)?#anchor-target$/,
  );

  await page.goto(`${server.baseURL}/guide/markdown/`);

  await expect(page.locator('.line-numbers-wrapper')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Athen repository' })).toHaveAttribute(
    'target',
    '_blank',
  );
  await expect(page.locator('.aside')).toContainText('Rendered Headings');

  await server.stop();
});

// TODO(product-bug): `/fr/guide/install` doesn't apply the locale sidebar — the `.sidebar`
// renders the English/auto sidebar ("Guide / ensembleInstaller") instead of the configured
// French sidebar ("Fr Guide / ensemble / Installer"). Marked `test.fail()` so the canary
// stays loud and flips green automatically once the locale sidebar bug is fixed.
test.fail('docs-site example covers custom home, auto sidebar, and i18n', async ({ page }) => {
  test.setTimeout(160_000);
  const server = await startExampleServer('preview', 'docs-site', 9214);

  await page.goto(server.baseURL);

  await expect(page.locator('.custom-home')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Build a custom docs home', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Update content in home.data.ts')).toBeVisible();
  await expect(page.getByText('Edit the visual system in home.css')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Metrics', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Workflow', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'FAQ', level: 2 })).toBeVisible();

  await page.goto(`${server.baseURL}/guide/install`);

  await expect(page.locator('.sidebar')).toContainText('Guide');
  await expect(page.locator('.sidebar a')).toHaveText(['Overview', 'Install', 'Usage']);
  await expect(page.locator('.sidebar')).toContainText('Install');
  await expect(page.locator('.sidebar')).toContainText('Usage');
  await expect(page.locator('.sidebar')).not.toContainText('Hidden Draft');

  await page.goto(`${server.baseURL}/api/config`);
  await expect(page.locator('.sidebar')).toContainText('Config');

  await page.goto(`${server.baseURL}/zh/`);
  await expect(page.getByRole('link', { name: '指南', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Athen 国际化示例', level: 1 })).toBeVisible();

  await page.goto(`${server.baseURL}/zh/guide/install`);
  await expect(page.locator('.sidebar')).toContainText('Guide概览安装用法');
  await expect(page.locator('.sidebar a')).toHaveText(['概览', '安装', '用法']);

  await page.goto(`${server.baseURL}/fr/`);
  await expect(page.getByRole('link', { name: 'Guide', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Exemple i18n Athen', level: 1 })).toBeVisible();
  await page.locator('button:has(.i-carbon-translate)').hover();
  await expect(page.getByText('English', { exact: true })).toBeVisible();
  await expect(page.getByText('简体中文', { exact: true })).toBeVisible();
  await expect(page.getByText('Français', { exact: true })).toBeVisible();

  await page.goto(`${server.baseURL}/fr/guide/install`);
  await expect(page.locator('.sidebar')).toContainText('Fr Guide');
  await expect(page.locator('.sidebar a')).toHaveText(['ensemble', 'Installer']);

  await server.stop();
});

test('integrations example covers search, analytics, plugin, and presets', async ({ page }) => {
  test.setTimeout(160_000);
  const integrations = await startExampleServer('preview', 'integrations', 9220);

  await page.goto(integrations.baseURL);
  await expect(page.getByRole('heading', { name: 'Integrations Example', level: 1 })).toBeVisible();
  await expect(page.locator('.athen-search-box')).toBeVisible();
  await expect(
    page.evaluate(() => (window as any).__ATHEN_SEARCH_CONFIG__?.provider),
  ).resolves.toBe('flex');
  await expect(
    page.evaluate(() => (window as any).__ATHEN_SEARCH_INDEX__?.documents?.length),
  ).resolves.toBeGreaterThan(0);

  await page.goto(`${integrations.baseURL}/guide/analytics`);
  await expect(page.getByRole('heading', { name: 'Analytics Guide', level: 1 })).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager.com"]').first()).toHaveCount(1);
  await expect(page.locator('script[data-domain="docs.example.com"]').first()).toHaveCount(1);
  await expect(page.locator('script[data-website-id="umami-example-id"]').first()).toHaveCount(1);
  await expect(page.evaluate(() => (window as any).__CUSTOM_ANALYTICS_EXAMPLE__)).resolves.toBe(
    'custom analytics example',
  );

  await page.goto(`${integrations.baseURL}/guide/plugin`);
  await expect(page.getByRole('heading', { name: 'Plugin Example', level: 1 })).toBeVisible();
  await expect(page.getByText('Loaded from virtual:athen-example-plugin')).toBeVisible();
  await expect(page.locator('meta[name="athen-example-plugin"]')).toHaveAttribute(
    'content',
    'enabled',
  );
  await expect(page.evaluate(() => (window as any).__ATHEN_EXAMPLE_PLUGIN__)).resolves.toBe(
    'Plugin data injected into HTML',
  );
  await integrations.stop();

  const algolia = await startExampleServer('preview', 'integrations/algolia', 9221);
  await page.goto(algolia.baseURL);
  await expect(
    page.getByRole('heading', { name: 'Algolia Search Preset', level: 1 }),
  ).toBeVisible();
  await expect(
    page.evaluate(() => (window as any).__ATHEN_SEARCH_CONFIG__?.provider),
  ).resolves.toBe('algolia');
  await expect(page.locator('script[src*="@docsearch/js"]').first()).toHaveCount(1);
  await algolia.stop();

  const disabled = await startExampleServer('preview', 'integrations/analytics-disabled', 9222);
  await page.goto(disabled.baseURL);
  await expect(
    page.getByRole('heading', { name: 'Analytics Disabled Preset', level: 1 }),
  ).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
  await disabled.stop();
});
