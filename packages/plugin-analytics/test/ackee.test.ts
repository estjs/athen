import { describe, expect, it } from 'vitest';
import analyticsPlugin from '../src/index';

describe('Ackee provider', () => {
  it('emits an async tracker.js with server and domain attributes', () => {
    const plugin = analyticsPlugin({
      ackee: { server: 'https://ackee.example.com', domainId: 'ackee-domain-id' },
    });
    const tags = (plugin!.transformIndexHtml as () => any[])();

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      tag: 'script',
      injectTo: 'head',
      children: '',
      attrs: {
        'async': true,
        'src': 'https://ackee.example.com/tracker.js',
        'data-ackee-server': 'https://ackee.example.com',
        'data-ackee-domain-id': 'ackee-domain-id',
      },
    });
  });
});
