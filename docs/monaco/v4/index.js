import { initRightEditor } from './components/right/js/index.js';
import { initLeftWorkspace } from './components/left/js/index.js';

const definitionsUrl = 'https://keshavsoft.github.io/declarative-definitions/dist/v1/min.js';
const editorStatus = document.getElementById('editorStatus');

async function loadDefinitions() {
  const mod = await import(definitionsUrl);
  return mod.default || mod.definitions || mod;
}

async function boot() {
  try {
    const definitions = await loadDefinitions();
    const editor = await initRightEditor(definitions);

    await initLeftWorkspace({ definitions, editor });
    editorStatus.textContent = 'Source loaded';
  } catch (error) {
    editorStatus.textContent = 'Unable to load';
    console.error('[Definitions Explorer V3]', error);
  }
}

boot();
