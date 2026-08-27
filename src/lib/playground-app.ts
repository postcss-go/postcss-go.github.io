import './browser-env';
import './monaco-env';
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/language/css/monaco.contribution';

import { processCss } from './playground-process';
import { playgroundInputFile, playgroundPreset, type PluginFlags } from './playgrounds';

const DARK: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#0a0b0d',
    'editor.foreground': '#f5f5f0',
    'editorLineNumber.foreground': '#56606b',
    'editorCursor.foreground': '#c8ff3d',
    focusBorder: '#c8ff3d',
  },
};

const LIGHT: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#f5f5f0',
    'editor.foreground': '#0a0b0d',
    'editorCursor.foreground': '#527800',
  },
};

function currentTheme() {
  return document.documentElement.dataset.theme === 'light'
    ? 'postcss-go-light'
    : 'postcss-go-dark';
}

function decodeHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return '';
  const css = new URLSearchParams(raw).get('css');
  if (!css) return '';
  try {
    return new TextDecoder().decode(
      Uint8Array.from(atob(css.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    );
  } catch {
    return '';
  }
}

function encodeCss(css: string) {
  const bytes = new TextEncoder().encode(css);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pluginFlags(root: HTMLElement): PluginFlags {
  return {
    nested: Boolean(root.querySelector<HTMLInputElement>('[data-plugin="nested"]')?.checked),
    autoprefixer: Boolean(
      root.querySelector<HTMLInputElement>('[data-plugin="autoprefixer"]')?.checked,
    ),
  };
}

function previewDocument(css: string, body: string) {
  const light = document.documentElement.dataset.theme === 'light';
  const background = light ? '#f5f5f0' : '#0a0b0d';
  const color = light ? '#0a0b0d' : '#f5f5f0';
  return `<!doctype html><html><head><style>
html,body{margin:0;min-height:100%;background:${background};color:${color};font-family:ui-sans-serif,system-ui,sans-serif}
${css}
</style></head><body>${body}</body></html>`;
}

export function bootPlayground(root: HTMLElement) {
  const id = root.dataset.presetId ?? 'webpack';
  const preset = playgroundPreset(id);
  const inputFile = playgroundInputFile(preset);
  const inputHost = root.querySelector<HTMLElement>('[data-editor="input"]');
  const outputHost = root.querySelector<HTMLElement>('[data-editor="output"]');
  const preview = root.querySelector<HTMLIFrameElement>('[data-preview]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const errorBox = root.querySelector<HTMLElement>('[data-error]');
  const share = root.querySelector<HTMLButtonElement>('[data-share]');
  const reset = root.querySelector<HTMLButtonElement>('[data-reset]');
  const copy = root.querySelector<HTMLButtonElement>('[data-copy]');
  if (!inputHost || !outputHost) return;

  monaco.editor.defineTheme('postcss-go-dark', DARK);
  monaco.editor.defineTheme('postcss-go-light', LIGHT);

  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    wordWrap: 'on',
    tabSize: 2,
    renderLineHighlight: 'line',
    theme: currentTheme(),
  };

  const fileModels = new Map(
    preset.files.map((file) => [file.id, monaco.editor.createModel(file.content, file.language)]),
  );
  const inputModel = fileModels.get(inputFile.id)!;
  const hashCss = decodeHash();
  if (hashCss) {
    inputModel.setValue(hashCss);
  }

  const input = monaco.editor.create(inputHost, {
    ...options,
    model: inputModel,
  });
  const output = monaco.editor.create(outputHost, {
    ...options,
    language: 'css',
    value: '',
    readOnly: true,
    domReadOnly: true,
  });

  function setInputFile(fileId: string) {
    const file = preset.files.find((item) => item.id === fileId);
    const model = fileModels.get(fileId);
    if (!file || !model) return;
    input.setModel(model);
    input.updateOptions({
      readOnly: !file.input,
      domReadOnly: !file.input,
    });
    root.querySelectorAll<HTMLButtonElement>('[data-file-tab]').forEach((button) => {
      button.setAttribute('aria-selected', String(button.dataset.fileTab === fileId));
    });
  }

  let timer = 0;
  let latestCss = '';

  const observer = new MutationObserver(() => {
    const theme = currentTheme();
    monaco.editor.setTheme(theme);
    input.updateOptions({ theme });
    output.updateOptions({ theme });
    if (latestCss && preview) {
      preview.srcdoc = previewDocument(latestCss, preset.previewHtml);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  async function run() {
    const css = inputModel.getValue();
    if (status) status.textContent = 'Running…';
    if (errorBox) errorBox.hidden = true;
    monaco.editor.setModelMarkers(inputModel, 'postcss-go', []);
    try {
      const result = await processCss(css, pluginFlags(root));
      latestCss = result.css;
      output.setValue(result.css);
      if (preview) {
        preview.srcdoc = previewDocument(result.css, preset.previewHtml);
      }
      if (status) {
        const warning = 'warning' in result && result.warning ? ` · ${result.warning}` : '';
        status.textContent = `${result.backend} · ${result.ms.toFixed(1)}ms${warning}`;
      }
    } catch (error) {
      const err = error as { message?: string; reason?: string; line?: number; column?: number };
      const message =
        err.reason ||
        err.message ||
        String(error) +
          (pluginFlags(root).autoprefixer &&
          String(error).includes('Maximum call stack size exceeded')
            ? ' — try disabling autoprefixer'
            : '');
      latestCss = '';
      output.setValue('');
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = message;
      }
      if (status) status.textContent = 'error';
      if (err.line) {
        monaco.editor.setModelMarkers(inputModel, 'postcss-go', [
          {
            startLineNumber: err.line,
            startColumn: err.column || 1,
            endLineNumber: err.line,
            endColumn: (err.column || 1) + 1,
            message,
            severity: monaco.MarkerSeverity.Error,
          },
        ]);
      }
    }
  }

  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void run();
    }, 200);
  }

  inputModel.onDidChangeContent(schedule);
  root.querySelectorAll<HTMLInputElement>('[data-plugin]').forEach((box) => {
    box.addEventListener('change', () => {
      void run();
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-file-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      setInputFile(button.dataset.fileTab!);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((item) => {
        item.setAttribute('aria-selected', String(item === button));
      });
      root.querySelectorAll<HTMLElement>('[data-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab;
      });
    });
  });

  share?.addEventListener('click', async () => {
    const url = new URL(location.href);
    url.hash = new URLSearchParams({ css: encodeCss(inputModel.getValue()) }).toString();
    await navigator.clipboard.writeText(url.toString());
    share.textContent = 'Copied link';
    window.setTimeout(() => {
      share.textContent = 'Share';
    }, 1400);
  });

  reset?.addEventListener('click', () => {
    history.replaceState(null, '', location.pathname + location.search);
    for (const file of preset.files) {
      fileModels.get(file.id)?.setValue(file.content);
    }
    setInputFile(inputFile.id);
    void run();
  });

  copy?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(latestCss);
    copy.textContent = 'Copied';
    window.setTimeout(() => {
      copy.textContent = 'Copy output';
    }, 1400);
  });

  void run();
}
