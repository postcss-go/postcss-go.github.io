import './browser-env';

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
let closing: Promise<void> | undefined;

function pluginList(flags: PluginFlags): BrowserPlugins {
  const plugins: BrowserPlugins = [];
  if (flags.nested) plugins.push(nested());
  if (flags.autoprefixer) plugins.push(autoprefixer());
  return plugins;
}

async function resetProcessor(flags: PluginFlags) {
  const key = `${flags.nested}:${flags.autoprefixer}`;
  if (processor && processorKey === key) return;

  if (closing) await closing;
  if (processor) {
    closing = processor.close().finally(() => {
      closing = undefined;
    });
    await closing;
    processor = undefined;
  }

  processor = createBrowserProcessor(pluginList(flags), {
    workerUrl,
    wasmUrl,
    wasmExecUrl,
  });
  processorKey = key;
}

function isAutoprefixerStackOverflow(error: unknown, flags: PluginFlags) {
  if (!flags.autoprefixer) return false;
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Maximum call stack size exceeded');
}

export async function processCss(css: string, flags: PluginFlags) {
  await resetProcessor(flags);

  const started = performance.now();
  try {
    const result = await processor!.process(css, { from: 'input.css', map: false });
    return {
      css: result.css,
      backend: result.backend ?? 'wasm-worker',
      ms: performance.now() - started,
    };
  } catch (error) {
    if (!isAutoprefixerStackOverflow(error, flags)) throw error;

    await resetProcessor({ ...flags, autoprefixer: false });
    const result = await processor!.process(css, { from: 'input.css', map: false });
    return {
      css: result.css,
      backend: result.backend ?? 'wasm-worker',
      ms: performance.now() - started,
      warning:
        'autoprefixer was skipped: @postcss-go/core currently fails on some properties (e.g. user-select, appearance).',
    };
  }
}
