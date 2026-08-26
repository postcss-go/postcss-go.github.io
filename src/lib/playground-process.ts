import { createBrowserProcessor, type BrowserProcessor } from '@postcss-go/core/wasm';
import workerUrl from '@postcss-go/core/wasm/worker?url';
import wasmUrl from '@postcss-go/core/wasm/postcss-go.wasm?url';
import wasmExecUrl from '@postcss-go/core/wasm/wasm_exec.js?url';
import autoprefixer from 'autoprefixer';
import nested from 'postcss-nested';

import type { PluginFlags } from './playgrounds';

type BrowserPlugins = NonNullable<Parameters<typeof createBrowserProcessor>[0]>;

let processor: BrowserProcessor | undefined;
let processorKey = '';

function pluginList(flags: PluginFlags): BrowserPlugins {
  const plugins: BrowserPlugins = [];
  if (flags.nested) plugins.push(nested());
  if (flags.autoprefixer) plugins.push(autoprefixer());
  return plugins;
}

export async function processCss(css: string, flags: PluginFlags) {
  const key = `${flags.nested}:${flags.autoprefixer}`;
  if (!processor || processorKey !== key) {
    await processor?.close();
    processor = createBrowserProcessor(pluginList(flags), {
      workerUrl,
      wasmUrl,
      wasmExecUrl,
    });
    processorKey = key;
  }

  const started = performance.now();
  const result = await processor.process(css, { from: 'input.css', map: false });
  return {
    css: result.css,
    backend: result.backend ?? 'wasm-worker',
    ms: performance.now() - started,
  };
}
