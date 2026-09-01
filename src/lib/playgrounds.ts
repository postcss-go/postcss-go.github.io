export interface PlaygroundLink {
  id: string;
  label: string;
}

export interface PluginFlags {
  nested: boolean;
  autoprefixer: boolean;
}

export interface PlaygroundFile {
  id: string;
  filename: string;
  language: 'css' | 'javascript' | 'json';
  content: string;
  input?: boolean;
}

export interface PlaygroundPreset {
  id: string;
  title: string;
  description: string;
  exampleId: string;
  files: PlaygroundFile[];
  previewHtml: string;
  plugins: PluginFlags;
}

export function playgroundInputFile(preset: PlaygroundPreset): PlaygroundFile {
  const file = preset.files.find((item) => item.input);
  if (!file) {
    throw new Error(`Playground "${preset.id}" has no input file`);
  }
  return file;
}

export const PLAYGROUND_LINKS: PlaygroundLink[] = [
  { id: 'default', label: 'Default' },
  { id: 'vite', label: 'Vite' },
  { id: 'webpack', label: 'webpack' },
  { id: 'rspack', label: 'Rspack' },
];

export function playgroundGroups(base: string) {
  const link = (id: string, label: string) => ({
    label,
    href: `${base}playground/${id}/`,
    key: id,
  });

  return [
    {
      label: 'Usage',
      items: [link('default', 'Default')],
    },
    {
      label: 'Frameworks',
      items: [link('vite', 'Vite'), link('webpack', 'webpack'), link('rspack', 'Rspack')],
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

const postcssConfig = `export default {
  plugins: {
    autoprefixer: {},
  },
};`;

const viteConfig = `import postcssGo from '@postcss-go/vite-loader';

export default {
  plugins: [postcssGo()],
};`;

const webpackConfig = `export default {
  module: {
    rules: [
      {
        test: /\\.css$/i,
        use: ['style-loader', 'css-loader', '@postcss-go/webpack-loader'],
      },
    ],
  },
};`;

const rspackConfig = `export default {
  module: {
    rules: [
      {
        test: /\\.css$/i,
        use: ['style-loader', 'css-loader', '@postcss-go/rspack-loader'],
      },
    ],
  },
};`;

const demoInput = `.hero {
  display: flex;
  gap: 1rem;
  align-items: center;
  min-height: 100vh;
  justify-content: center;
  backdrop-filter: blur(12px);

  & h1 {
    margin: 0;
    letter-spacing: -0.06em;
  }
}

.cta {
  border: 0;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  background: #c8ff3d;
  color: #0a0b0d;
}
`;

const viteInput = `.hero {
  display: flex;
  gap: 0.5rem;
  min-height: 100vh;
  align-items: center;
  justify-content: center;

  & h1 span {
    color: #c8ff3d;
  }
}
`;

const webpackInput = `.hero {
  display: flex;
  gap: 0.5rem;
  min-height: 100vh;
  align-items: center;
  justify-content: center;

  & h1 span {
    color: #c8ff3d;
  }
}
`;

const rspackInput = `.hero {
  display: flex;
  gap: 0.5rem;
  min-height: 100vh;
  align-items: center;
  justify-content: center;

  & h1 span {
    color: #c8ff3d;
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
    files: [
      {
        id: 'postcss',
        filename: 'postcss.config.js',
        language: 'javascript',
        content: postcssConfig,
      },
      {
        id: 'css',
        filename: 'src/index.css',
        language: 'css',
        content: demoInput,
        input: true,
      },
    ],
    previewHtml: `<main class="hero"><h1>PostCSS, rebuilt.</h1><button class="cta">Get started</button></main>`,
  },
  vite: {
    id: 'vite',
    title: 'Vite',
    description: 'CSS as @postcss-go/vite-loader would hand to the engine.',
    exampleId: 'vite',
    plugins: { nested: true, autoprefixer: true },
    files: [
      {
        id: 'postcss',
        filename: 'postcss.config.js',
        language: 'javascript',
        content: postcssConfig,
      },
      {
        id: 'vite',
        filename: 'vite.config.js',
        language: 'javascript',
        content: viteConfig,
      },
      {
        id: 'css',
        filename: 'src/styles.css',
        language: 'css',
        content: viteInput,
        input: true,
      },
    ],
    previewHtml: `<main class="hero"><h1>Vite <span>+ PostCSS</span></h1></main>`,
  },
  webpack: {
    id: 'webpack',
    title: 'webpack',
    description: 'CSS as @postcss-go/webpack-loader would hand to the engine.',
    exampleId: 'webpack',
    plugins: { nested: true, autoprefixer: true },
    files: [
      {
        id: 'postcss',
        filename: 'postcss.config.js',
        language: 'javascript',
        content: postcssConfig,
      },
      {
        id: 'webpack',
        filename: 'webpack.config.js',
        language: 'javascript',
        content: webpackConfig,
      },
      {
        id: 'css',
        filename: 'src/styles.css',
        language: 'css',
        content: webpackInput,
        input: true,
      },
    ],
    previewHtml: `<main class="hero"><h1>webpack <span>+ PostCSS</span></h1></main>`,
  },
  rspack: {
    id: 'rspack',
    title: 'Rspack',
    description: 'CSS as @postcss-go/rspack-loader would hand to the engine.',
    exampleId: 'rspack',
    plugins: { nested: true, autoprefixer: true },
    files: [
      {
        id: 'postcss',
        filename: 'postcss.config.js',
        language: 'javascript',
        content: postcssConfig,
      },
      {
        id: 'rspack',
        filename: 'rspack.config.js',
        language: 'javascript',
        content: rspackConfig,
      },
      {
        id: 'css',
        filename: 'src/styles.css',
        language: 'css',
        content: rspackInput,
        input: true,
      },
    ],
    previewHtml: `<main class="hero"><h1>Rspack <span>+ PostCSS</span></h1></main>`,
  },
};
