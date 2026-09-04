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
        { label: 'Vite', href: `${base}examples/vite/`, key: 'vite' },
        { label: 'webpack', href: `${base}examples/webpack/`, key: 'webpack' },
        { label: 'Rspack', href: `${base}examples/rspack/`, key: 'rspack' },
      ],
    },
  ];
}
