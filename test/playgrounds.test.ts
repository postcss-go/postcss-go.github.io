import { describe, expect, it } from 'vitest';

import {
  PLAYGROUND_LINKS,
  PLAYGROUND_PRESETS,
  playgroundGroups,
  playgroundInputFile,
  playgroundPreset,
} from '../src/lib/playgrounds';

describe('playgrounds', () => {
  it('lists the Vite preset', () => {
    expect(PLAYGROUND_LINKS.map((item) => item.id)).toEqual(['default', 'vite', 'webpack']);
  });

  it('builds playground nav links from the site base', () => {
    const groups = playgroundGroups('/postcss-go/');
    const defaultLink = groups[0]?.items.find((item) => item.key === 'default');
    const vite = groups[1]?.items.find((item) => item.key === 'vite');
    expect(defaultLink?.href).toBe('/postcss-go/playground/default/');
    expect(vite?.href).toBe('/postcss-go/playground/vite/');
  });

  it('links the Vite preset to the Vite example', () => {
    expect(PLAYGROUND_PRESETS.vite.exampleId).toBe('vite');
  });

  it('includes Vite config and CSS input files', () => {
    const preset = playgroundPreset('vite');
    expect(preset.files.map((file) => file.filename)).toEqual([
      'postcss.config.js',
      'vite.config.js',
      'src/styles.css',
    ]);
    expect(playgroundInputFile(preset).filename).toBe('src/styles.css');
  });

  it('falls back to the default preset for unknown ids', () => {
    expect(playgroundPreset('missing').id).toBe('default');
  });
});
