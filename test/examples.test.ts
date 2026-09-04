import { describe, expect, it } from 'vitest';

import { exampleGroups } from '../src/lib/examples';

describe('exampleGroups', () => {
  it('includes Vite in Frameworks', () => {
    const groups = exampleGroups('/');
    const frameworks = groups.find((group) => group.label === 'Frameworks');
    expect(frameworks?.items.map((item) => item.key)).toEqual(['vite', 'webpack', 'rspack']);
  });

  it('builds framework hrefs from the site base', () => {
    const groups = exampleGroups('/postcss-go/');
    const vite = groups.flatMap((group) => group.items).find((item) => item.key === 'vite');
    expect(vite?.href).toBe('/postcss-go/examples/vite/');
  });
});
