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

const postcssConfig = `export default {
  plugins: {
    autoprefixer: {},
  },
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
  webpack: {
    id: 'webpack',
    title: 'webpack',
    description: 'CSS as @postcss-go/webpack-loader would hand to the engine.',
    exampleId: 'webpack',
    plugins: { nested: true, autoprefixer: false },
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
};
