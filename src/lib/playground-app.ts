import './monaco-env';
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/language/css/monaco.contribution';

import { processCss } from './playground-process';
import { playgroundPreset, type PluginFlags } from './playgrounds';

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
  const id = root.dataset.presetId ?? 'default';
  const preset = playgroundPreset(id);
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
    language: 'css',
    theme: currentTheme(),
    fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    wordWrap: 'on',
    tabSize: 2,
    renderLineHighlight: 'line',
  };

  const input = monaco.editor.create(inputHost, {
    ...options,
    value: decodeHash() || preset.input,
  });
  const output = monaco.editor.create(outputHost, {
    ...options,
    value: '',
    readOnly: true,
    domReadOnly: true,
  });

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
    const css = input.getValue();
    status && (status.textContent = 'Running…');
    errorBox && (errorBox.hidden = true);
    monaco.editor.setModelMarkers(input.getModel()!, 'postcss-go', []);
    try {
      const result = await processCss(css, pluginFlags(root));
      latestCss = result.css;
      output.setValue(result.css);
      if (preview) {
        preview.srcdoc = previewDocument(result.css, preset.previewHtml);
      }
      if (status) {
        status.textContent = `${result.backend} · ${result.ms.toFixed(1)}ms`;
      }
    } catch (error) {
      const err = error as { message?: string; reason?: string; line?: number; column?: number };
      const message = err.reason || err.message || String(error);
      latestCss = '';
      output.setValue('');
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = message;
      }
      if (status) status.textContent = 'error';
      if (err.line && input.getModel()) {
        monaco.editor.setModelMarkers(input.getModel()!, 'postcss-go', [
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

  input.onDidChangeModelContent(schedule);
  root.querySelectorAll<HTMLInputElement>('[data-plugin]').forEach((box) => {
    box.addEventListener('change', () => {
      void run();
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
    url.hash = new URLSearchParams({ css: encodeCss(input.getValue()) }).toString();
    await navigator.clipboard.writeText(url.toString());
    share.textContent = 'Copied link';
    window.setTimeout(() => {
      share.textContent = 'Share';
    }, 1400);
  });

  reset?.addEventListener('click', () => {
    history.replaceState(null, '', location.pathname + location.search);
    input.setValue(preset.input);
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
