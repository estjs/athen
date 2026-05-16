export const homeData = {
  eyebrow: 'Fully custom home',
  title: 'Build a custom docs home',
  subtitle:
    'Use MDX for the route, a small data file for content, and CSS for the visual system.',
  primaryAction: { text: 'Start Building', href: '/guide/install' },
  secondaryAction: { text: 'View Source', href: 'https://github.com/estjs/athen' },
  image: { src: '/home-hero.svg', alt: 'Custom home preview' },
  metrics: [
    { value: '1', label: 'MDX route' },
    { value: '1', label: 'Data file' },
    { value: '1', label: 'CSS file' },
  ],
  features: [
    {
      title: 'Update content in home.data.ts',
      text: 'Change copy, links, features, metrics, workflow, sponsors, and FAQ without editing layout code.',
    },
    {
      title: 'Edit the visual system in home.css',
      text: 'Adjust spacing, colors, grids, and responsive behavior in one scoped stylesheet.',
    },
    {
      title: 'Keep docs routing simple',
      text: 'The page is still just `index.mdx`, so it works with normal Athen routes and builds.',
    },
  ],
  workflow: [
    'Create `index.mdx` and render your home component.',
    'Move editable content into `home.data.ts`.',
    'Scope all home styles under `.custom-home`.',
    'Let `sidebar: auto` generate navigation from route metadata.',
  ],
  sponsors: ['Athen', 'Vite', 'Essor'],
  faq: [
    {
      question: 'Can this replace the built-in home layout?',
      answer: 'Yes. Use this pattern when you need complete control over markup and styling.',
    },
    {
      question: 'Can I still use the default theme navigation?',
      answer: 'Yes. This only customizes the page body; the default nav and footer can stay.',
    },
  ],
};
