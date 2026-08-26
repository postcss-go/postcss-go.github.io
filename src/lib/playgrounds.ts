export interface PlaygroundLink {
  id: string;
  label: string;
}

export interface PluginFlags {
  nested: boolean;
  autoprefixer: boolean;
}

export interface PlaygroundPreset {
  id: string;
  title: string;
  description: string;
  exampleId: string;
  input: string;
  previewHtml: string;
  plugins: PluginFlags;
}

export const PLAYGROUND_LINKS: PlaygroundLink[] = [
  { id: 'default', label: 'Default' },
  { id: 'tailwindcss', label: 'Tailwind CSS' },
  { id: 'vite', label: 'Vite' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'nuxt', label: 'Nuxt' },
  { id: 'vue', label: 'Vue' },
  { id: 'astro', label: 'Astro' },
  { id: 'sveltekit', label: 'SvelteKit' },
  { id: 'webpack', label: 'webpack' },
];

export function playgroundGroups(base: string) {
  return [
    {
      label: 'Frameworks',
      items: PLAYGROUND_LINKS.map((item) => ({
        label: item.label,
        href: `${base}playground/${item.id}/`,
        key: item.id,
      })),
    },
  ];
}

export function playgroundPreset(id: string): PlaygroundPreset {
  const preset = PLAYGROUND_PRESETS[id] ?? PLAYGROUND_PRESETS.default;
  if (!preset) {
    throw new Error(`Unknown playground: ${id}`);
  }
  return preset;
}

const demoInput = `.hero {
  display: flex;
  gap: 1rem;
  user-select: none;
  backdrop-filter: blur(12px);

  & h1 {
    margin: 0;
    letter-spacing: -0.06em;
  }

  & .cta {
    appearance: none;
    border-radius: 999px;
  }
}
`;

export const PLAYGROUND_PRESETS: Record<string, PlaygroundPreset> = {
  default: {
    id: 'default',
    title: 'Default',
    description: 'Parse, run plugins, stringify — the same pipeline as the CLI.',
    exampleId: 'default',
    plugins: { nested: true, autoprefixer: true },
    input: demoInput,
    previewHtml: `<main class="hero"><h1>PostCSS, rebuilt.</h1><button class="cta">Get started</button></main>`,
  },
  tailwindcss: {
    id: 'tailwindcss',
    title: 'Tailwind CSS',
    description:
      'Sample CSS through nested + Autoprefixer. Tailwind itself is not compiled here — it needs a project file tree.',
    exampleId: 'tailwindcss',
    plugins: { nested: true, autoprefixer: true },
    input: `.page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  background: #0a0b0d;
  color: #f5f5f0;

  & .mark {
    color: #c8ff3d;
  }

  & .btn {
    appearance: none;
    user-select: none;
    border-radius: 999px;
    background: #c8ff3d;
    color: #0a0b0d;
  }
}
`,
    previewHtml: `<div class="page"><div><p class="mark">Tailwind-shaped CSS</p><h1>Utility <span class="mark">first.</span></h1><button class="btn">Try a class</button></div></div>`,
  },
  vite: {
    id: 'vite',
    title: 'Vite',
    description: 'Imported CSS as Vite would send it through PostCSS.',
    exampleId: 'vite',
    plugins: { nested: true, autoprefixer: true },
    input: `#app {
  min-height: 100vh;
  display: grid;
  place-items: center;

  & .card {
    display: flex;
    gap: 0.75rem;
    backdrop-filter: blur(8px);
    user-select: none;
  }
}
`,
    previewHtml: `<div id="app"><div class="card">src/style.css</div></div>`,
  },
  nextjs: {
    id: 'nextjs',
    title: 'Next.js',
    description: 'Global stylesheet shape used from app/layout.',
    exampleId: 'nextjs',
    plugins: { nested: true, autoprefixer: true },
    input: `:root {
  --fg: #f5f5f0;
  --bg: #0a0b0d;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
}

.hero {
  display: grid;
  min-height: 100vh;
  place-items: center;

  & p {
    user-select: none;
  }
}
`,
    previewHtml: `<main class="hero"><div><h1>Next.js</h1><p>app/globals.css</p></div></main>`,
  },
  nuxt: {
    id: 'nuxt',
    title: 'Nuxt',
    description: 'Asset CSS with nested rules, as Nuxt PostCSS would see it.',
    exampleId: 'nuxt',
    plugins: { nested: true, autoprefixer: true },
    input: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.hero {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;

  & h1 {
    letter-spacing: -0.05em;
  }
}
`,
    previewHtml: `<main class="hero"><h1>Nuxt + PostCSS</h1></main>`,
  },
  vue: {
    id: 'vue',
    title: 'Vue',
    description: 'Component-style nested CSS, including scoped-looking selectors.',
    exampleId: 'vue',
    plugins: { nested: true, autoprefixer: true },
    input: `.hero {
  display: grid;
  min-height: 100vh;
  place-items: center;

  & .title {
    user-select: none;
    letter-spacing: 0.02em;
  }
}
`,
    previewHtml: `<main class="hero"><p class="title">Vue scoped styles</p></main>`,
  },
  astro: {
    id: 'astro',
    title: 'Astro',
    description: 'Global CSS plus nested blocks, matching Astro style pipelines.',
    exampleId: 'astro',
    plugins: { nested: true, autoprefixer: true },
    input: `:root {
  --bg: #0a0b0d;
}

html {
  background: var(--bg);
}

.hero {
  display: grid;
  min-height: 100vh;
  place-items: center;

  & .card {
    appearance: none;
    user-select: none;
  }
}
`,
    previewHtml: `<main class="hero"><div class="card">src/styles/global.css</div></main>`,
  },
  sveltekit: {
    id: 'sveltekit',
    title: 'SvelteKit',
    description: 'Imported app.css after vitePreprocess would run PostCSS.',
    exampleId: 'sveltekit',
    plugins: { nested: true, autoprefixer: true },
    input: `:root {
  font-family: system-ui, sans-serif;
}

.hero {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  & h1 {
    letter-spacing: -0.06em;
  }
}
`,
    previewHtml: `<main class="hero"><h1>SvelteKit</h1></main>`,
  },
  webpack: {
    id: 'webpack',
    title: 'webpack',
    description: 'CSS as css-loader + postcss-loader would hand to the engine.',
    exampleId: 'webpack',
    plugins: { nested: true, autoprefixer: true },
    input: `.hero {
  display: flex;
  gap: 0.5rem;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  user-select: none;

  & h1 span {
    color: #c8ff3d;
  }
}
`,
    previewHtml: `<main class="hero"><h1>webpack <span>+ PostCSS</span></h1></main>`,
  },
};
