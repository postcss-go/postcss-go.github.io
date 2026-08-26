export interface ExampleLink {
  label: string;
  href: string;
  key: string;
}

export interface ExampleGroup {
  label: string;
  items: ExampleLink[];
}

export function exampleGroups(base: string): ExampleGroup[] {
  return [
    {
      label: 'Usage',
      items: [{ label: 'Default', href: `${base}examples/default/`, key: 'default' }],
    },
    {
      label: 'Frameworks',
      items: [
        { label: 'Tailwind CSS', href: `${base}examples/tailwindcss/`, key: 'tailwindcss' },
        { label: 'Vite', href: `${base}examples/vite/`, key: 'vite' },
        { label: 'Next.js', href: `${base}examples/nextjs/`, key: 'nextjs' },
        { label: 'Nuxt', href: `${base}examples/nuxt/`, key: 'nuxt' },
        { label: 'Vue', href: `${base}examples/vue/`, key: 'vue' },
        { label: 'Astro', href: `${base}examples/astro/`, key: 'astro' },
        { label: 'SvelteKit', href: `${base}examples/sveltekit/`, key: 'sveltekit' },
        { label: 'webpack', href: `${base}examples/webpack/`, key: 'webpack' },
      ],
    },
    {
      label: 'Plugins',
      items: [
        { label: 'Autoprefixer', href: `${base}examples/autoprefixer/`, key: 'autoprefixer' },
        { label: 'postcss-import', href: `${base}examples/import/`, key: 'import' },
        { label: 'postcss-nested', href: `${base}examples/nested/`, key: 'nested' },
        { label: 'cssnano', href: `${base}examples/cssnano/`, key: 'cssnano' },
      ],
    },
  ];
}
