import { simpleGit } from 'simple-git';

import { MD_REGEX, appendNamedExport, cleanUrl } from './utils';
import type { Plugin } from 'vite';

export function pluginMdxGit(): Plugin {
  const cache = new Map<string, string>();
  const git = simpleGit();
  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });

  // https://github.com/steveukx/git-js#git-log
  async function getLastUpdatedTime(path: string) {
    try {
      const { latest } = await git.log({ file: path });
      return !latest ? '' : latest.date;
    } catch {
      return '';
    }
  }

  function formatLastUpdatedTime(rawTime: string) {
    if (!rawTime) return '';

    const date = new Date(rawTime);
    if (Number.isNaN(date.getTime())) return '';

    return dateFormatter.format(date);
  }

  return <Plugin>{
    name: 'vite-plugin-mdx-last-update',
    async transform(code, id) {
      id = cleanUrl(id);
      if (!MD_REGEX.test(id)) return;

      let lastUpdatedTime = '';
      if (cache.has(id)) {
        // Use cache to avoid unnecessary git command execution
        lastUpdatedTime = cache.get(id)!;
      } else {
        const rawTime = await getLastUpdatedTime(id);
        lastUpdatedTime = formatLastUpdatedTime(rawTime);
        cache.set(id, lastUpdatedTime);
      }

      return {
        code: appendNamedExport(code, 'lastUpdatedTime', lastUpdatedTime),
        moduleType: 'js',
      };
    },
  };
}
