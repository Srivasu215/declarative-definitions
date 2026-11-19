import { initRightEditor } from './components/right/js/index.js';
import { initLeftWorkspace } from './components/left/js/index.js';

const definitionsUrl = '../../../src/v1/definitions.json';
const editorStatus = document.getElementById('editorStatus');

async function loadDefinitions() {
  const response = await fetch(definitionsUrl);
  if (!response.ok) {
    throw new Error(`Unable to load definitions.json (${response.status}).`);
  }
  return response.json();
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
