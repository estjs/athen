import { describe, expect, it } from 'vitest';
import { formatDevStartupInfo } from '../../src/node/dev';

describe('dev server startup info', () => {
  it('formats the command, project root, and server urls with the Athen icon', () => {
    const message = formatDevStartupInfo({
      root: '/workspace/docs',
      command: 'athen dev docs',
      urls: {
        local: ['http://localhost:8730/'],
        network: ['http://192.168.1.10:8730/'],
      },
      siteTitle: 'Athen Docs',
    });

    expect(message).toContain('✨ Athen dev server ready');
    expect(message).toContain('Site    Athen Docs');
    expect(message).toContain('Root    /workspace/docs');
    expect(message).toContain('Command athen dev docs');
    expect(message).toContain('Local   http://localhost:8730/');
    expect(message).toContain('Network http://192.168.1.10:8730/');
  });

  it('omits the network line when Vite has no network url', () => {
    const message = formatDevStartupInfo({
      root: '/workspace/docs',
      command: 'athen dev docs',
      urls: { local: ['http://localhost:8730/'], network: [] },
    });

    expect(message).toContain('Local   http://localhost:8730/');
    expect(message).not.toContain('Network');
  });
});
