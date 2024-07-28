import PageButton from '../Button';
import type { Hero } from '@/shared/types';
export function HomeHero({ hero }: { hero: Hero }) {
  return (
    <div class="mx-auto px-16 pb-16 pt-20">
      <div class="mx-auto max-w-screen-lg flex">
        <div class="max-w-xl flex flex-col text-left">
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
                <PageButton
                  type="a"
                  text={action.text}
                  href={action.link}
                  theme={action.theme}
                  external={true}
                />
              </div>
            ))}
          </div>
        </div>
        {hero.image && (
          <div class="mx-auto max-h-[24rem] max-w-[24rem] flex justify-center">
            <img src={hero.image.src} alt={hero.image.alt} class="h-full w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
