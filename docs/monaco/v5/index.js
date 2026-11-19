import { initRightEditor } from './components/right/js/index.js';
import { initLeftWorkspace } from './components/left/js/index.js';

const definitionsUrl = 'https://keshavsoft.github.io/declarative-definitions/dist/v1/min.js';

async function loadDefinitions() {
  const mod = await import(definitionsUrl);
  return mod.default || mod.definitions || mod;
}

async function boot() {
  try {
    const definitions = await loadDefinitions();
    const editor = await initRightEditor(definitions);
    await initLeftWorkspace({ definitions, editor });
  } catch (error) {
    console.error('[Definitions Explorer V5]', error);
  }
}

boot();