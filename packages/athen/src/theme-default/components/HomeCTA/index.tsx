import PageLink from '../Link';
import type { CTA } from '@/shared/types';

export function HomeCTA({ cta }: { cta?: CTA }) {
  if (!cta) return null;
  return (
    <section class="mx-auto max-w-screen-xl py-12 text-center">
      <h2 class="text-4xl font-bold">{cta.title}</h2>
      {cta.text && <p class="pt-4 text-xl text-gray-500">{cta.text}</p>}
      {cta.link && (
        <div class="pt-6">
          {/* @ts-ignore props typing */}
          <PageLink className={'at-button large brand'} href={cta.link}>
            <span>{cta.buttonText || 'Get Started'}</span>
          </PageLink>
        </div>
      )}
    </section>
  );
}
