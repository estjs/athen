import type { Feature } from '@/shared/types';

export function HomeFeature({ features }: { features: Feature[] }) {
  return (
    <div class="grid grid-cols-3 mx-auto max-w-screen-xl gap-10px">
      {features?.map((feature, index) => (
        <div class="rounded-md p-3" >
          <article class="h-full border b-[var(--at-c-divider)] rounded-xl border-solid p-6">
            <div class="mb-5 h-12 w-12 flex items-center justify-center border rounded-md bg-gray-100 text-3xl dark:bg-white">
              {feature.icon}
            </div>
            <h2 class="font-bold">{feature.title}</h2>
            <p class="pt-2 text-sm text-gray-500 font-medium leading-6">{feature.details}</p>
          </article>
        </div>
      ))}
    </div>
  );
}
