import './browser-env';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/language/css/css.worker?worker';

const global = globalThis as typeof globalThis & {
  MonacoEnvironment?: {
    getWorker: (id: string, label: string) => Worker;
  };
};

global.MonacoEnvironment = {
  getWorker(_id, label) {
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker();
    }
    return new EditorWorker();
  },
};
