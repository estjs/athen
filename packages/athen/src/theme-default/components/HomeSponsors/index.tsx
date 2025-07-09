import type { Sponsor } from '@/shared/types';

export function HomeSponsors({ sponsors }: { sponsors?: Sponsor[] }) {
  if (!sponsors?.length) return null;
  return (
    <section class="mx-auto max-w-screen-xl py-12 text-center">
      <h2 class="text-3xl font-bold mb-6">Sponsors</h2>
      <div class="flex flex-wrap justify-center gap-6">
        {sponsors.map(s => (
          <a
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            key={s.link}
            class="block opacity-80 hover:opacity-100"
          >
            <img src={s.logo} alt={s.name} class="h-12" />
          </a>
        ))}
      </div>
    </section>
  );
}
