import PageLink from '../Link';
import type { Hero } from '@/shared/types';
export function HomeHero({ hero }: { hero: Partial<Hero> }) {
  return (
    <div class="mx-auto px-10 pb-16 pt-20">
      <div class="mx-auto max-w-screen-xl flex justify-between">
        <div class="max-w-xl flex flex-1 flex-col text-left">
          <h1 class="max-w-3xl text-6xl font-bold">
            <span class="bg-[--at-home-hero-name-background] bg-clip-text text-transparent">
              {hero.name}
            </span>
          </h1>
          <p class="max-w-3xl text-6xl font-bold">{hero.text}</p>
          <p class="max-w-3xl whitespace-pre-wrap pt-3 text-2xl text-gray-500 font-medium">
            {hero.tagline}
          </p>
          <div class="flex flex-wrap justify-start pt-8">
            {hero.actions?.map(action => (
              <div class="p-1" key={action.link}>
                <PageLink className={'at-button medium brand'} href={action.link}>
                  <span>{action.text}</span>
                </PageLink>
              </div>
            ))}
          </div>
        </div>
        {hero.image && (
          <div class="mx-auto h-270px flex justify-center">
            <img src={hero.image.src} alt={hero.image.alt} class="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
