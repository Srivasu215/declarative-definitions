const definitionsUrl = '../../../../src/v1/definitions.json';
const rootSelect = document.getElementById('rootSelect');
const variantSelect = document.getElementById('variantSelect');
const contractSelect = document.getElementById('contractSelect');
const meaningTitle = document.getElementById('meaningTitle');
const meaningText = document.getElementById('meaningText');
const selectedPath = document.getElementById('selectedPath');
const editorTitle = document.getElementById('editorTitle');
const editorPath = document.getElementById('editorPath');
const stepRoot = document.getElementById('stepRoot');
const stepVariant = document.getElementById('stepVariant');
const stepContract = document.getElementById('stepContract');

let definitions;
let editor;

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function showInEditor(value, title, path) {
  editor.setValue(pretty(value));
  editorTitle.textContent = title;
  editorPath.textContent = path;
}

function fillSelect(select, values, placeholder) {
  select.replaceChildren(new Option(placeholder, ''));
  values.forEach((value) => select.add(new Option(value, value)));
  select.disabled = values.length === 0;
}

function setMeaning(title, text, path) {
  meaningTitle.textContent = title;
  meaningText.textContent = text;
  selectedPath.textContent = path;
}

function activate(step) {
  [stepRoot, stepVariant, stepContract].forEach((element) => element.classList.remove('active'));
  step.classList.add('active');
}

function resetToAll() {
  rootSelect.value = '';
  fillSelect(variantSelect, [], 'Choose a variation…');
  fillSelect(contractSelect, [], 'Choose a contract key…');
  variantSelect.disabled = true;
  contractSelect.disabled = true;
  showInEditor(definitions, 'definitions.json', 'Complete definitions');
  setMeaning('The complete definitions library', 'Every control type and every variation lives in this library. Choose a root key to begin exploring its structure.', 'definitions');
  activate(stepRoot);
  stepVariant.classList.add('locked');
  stepContract.classList.add('locked');
}

rootSelect.addEventListener('change', () => {
  const rootKey = rootSelect.value;
  fillSelect(contractSelect, [], 'Choose a contract key…');
  contractSelect.disabled = true;
  if (!rootKey) {
    resetToAll();
    return;
  }

  const rootValue = definitions[rootKey];
  fillSelect(variantSelect, Object.keys(rootValue), 'Choose a variation…');
  variantSelect.disabled = false;
  stepVariant.classList.remove('locked');
  stepContract.classList.add('locked');
  showInEditor(rootValue, `${rootKey}`, `definitions.${rootKey}`);
  setMeaning(`Control type: ${rootKey}`, `This is the first level. “${rootKey}” groups the available definitions for this kind of control. Choose one variation to continue.`, `definitions.${rootKey}`);
  activate(stepVariant);
});

variantSelect.addEventListener('change', () => {
  const rootKey = rootSelect.value;
  const variantKey = variantSelect.value;
  if (!rootKey || !variantKey) return;

  const variantValue = definitions[rootKey][variantKey];
  fillSelect(contractSelect, Object.keys(variantValue), 'Choose a contract key…');
  contractSelect.disabled = false;
  stepContract.classList.remove('locked');
  showInEditor(variantValue, `${rootKey}.${variantKey}`, `definitions.${rootKey}.${variantKey}`);
  setMeaning(`Variation: ${variantKey}`, `This is the second level. It selects a particular flavor of the “${rootKey}” control. Its contents follow the definition contract.`, `definitions.${rootKey}.${variantKey}`);
  activate(stepContract);
});

contractSelect.addEventListener('change', () => {
  const rootKey = rootSelect.value;
  const variantKey = variantSelect.value;
  const contractKey = contractSelect.value;
  if (!rootKey || !variantKey || !contractKey) return;

  const contractValue = definitions[rootKey][variantKey][contractKey];
  showInEditor(contractValue, contractKey, `definitions.${rootKey}.${variantKey}.${contractKey}`);
  const descriptions = {
    baseFromSpec: 'Identifies the starting specification from which this definition is based.',
    instructions: 'Describes the instructions associated with this particular variation.',
    options: 'Holds the options associated with this particular variation.'
  };
  setMeaning(`Contract part: ${contractKey}`, descriptions[contractKey] || `This is the “${contractKey}” part of the selected definition. Inspect its value in the editor.`, `definitions.${rootKey}.${variantKey}.${contractKey}`);
  activate(stepContract);
});

document.getElementById('showAll').addEventListener('click', resetToAll);

async function init() {
  try {
    const response = await fetch(definitionsUrl);
    if (!response.ok) throw new Error(`Could not load definitions.json (${response.status}).`);
    definitions = await response.json();

    window.require.config({
      paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }
    });
    window.require(['vs/editor/editor.main'], () => {
      editor = window.monaco.editor.create(document.getElementById('monacoEditor'), {
        value: pretty(definitions),
        language: 'json',
        theme: 'vs-dark',
        readOnly: true,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        folding: true,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 }
      });
      Object.keys(definitions).forEach((key) => rootSelect.add(new Option(key, key)));
      resetToAll();
    });
  } catch (error) {
    console.error('[Definitions Explorer]', error);
    setMeaning('Unable to load definitions', error.message, 'definitions.json');
  }
}

init();
