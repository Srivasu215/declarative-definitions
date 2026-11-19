function setOptions(select, values, placeholder) {
  select.length = 0;
  select.add(new Option(placeholder, ''));
  values.forEach((value) => select.add(new Option(value, value)));
  select.disabled = values.length === 0;
}

export function createActions({ definitions, editor, elements }) {
  const showSource = (value, title, path) => {
    editor.setValue(JSON.stringify(value, null, 2));
    if (elements.editorTitle) elements.editorTitle.textContent = title;
    if (elements.editorPath) elements.editorPath.textContent = path;
  };

  const clearAfterRoot = () => {
    setOptions(elements.variantSelect, [], 'Select Variation');
    setOptions(elements.contractSelect, [], 'Select Part');
  };

  const clearAfterVariant = () => {
    setOptions(elements.contractSelect, [], 'Select Part');
  };

  const actions = {
    initialize: () => {
      setOptions(elements.rootSelect, Object.keys(definitions), 'Select Control');
      showSource(definitions, 'definitions.json', 'Complete library');
    },

    selectRoot: (event, targetElement) => {
      const rootKey = targetElement.value;
      clearAfterRoot();
      if (!rootKey) {
        actions.showAll();
        return;
      }

      const rootDefinition = definitions[rootKey];
      setOptions(elements.variantSelect, Object.keys(rootDefinition), 'Select Variation');
      showSource(rootDefinition, rootKey, `definitions.${rootKey}`);
    },

    selectVariant: (event, targetElement) => {
      const rootKey = elements.rootSelect.value;
      const variantKey = targetElement.value;
      clearAfterVariant();

      if (!variantKey) {
        actions.selectRoot(null, elements.rootSelect);
        return;
      }

      const variantDefinition = definitions[rootKey][variantKey];
      setOptions(elements.contractSelect, Object.keys(variantDefinition), 'Select Part');
      showSource(variantDefinition, `${rootKey}.${variantKey}`, `definitions.${rootKey}.${variantKey}`);
    },

    selectContract: (event, targetElement) => {
      const rootKey = elements.rootSelect.value;
      const variantKey = elements.variantSelect.value;
      const contractKey = targetElement.value;

      if (!contractKey) {
        actions.selectVariant(null, elements.variantSelect);
        return;
      }

      const contractValue = definitions[rootKey][variantKey][contractKey];
      showSource(contractValue, `${rootKey}.${variantKey}.${contractKey}`, `definitions.${rootKey}.${variantKey}.${contractKey}`);
    },

    showAll: () => {
      elements.rootSelect.value = '';
      clearAfterRoot();
      showSource(definitions, 'definitions.json', 'Complete library');
    }
  };

  return actions;
}

export default createActions;