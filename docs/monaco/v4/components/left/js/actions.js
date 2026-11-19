function setOptions(select, values, placeholder) {
  select.length = 0;
  select.add(new Option(placeholder, ''));
  values.forEach((value) => select.add(new Option(value, value)));
  select.disabled = values.length === 0;
}

export function createActions({ definitions, editor, elements }) {
  const showSource = (value, title, path) => {
    editor.setValue(JSON.stringify(value, null, 2));
    elements.editorTitle.textContent = title;
    elements.editorPath.textContent = path;
  };

  const explain = (title, message, path) => {
    elements.meaningTitle.textContent = title;
    elements.meaningText.textContent = message;
    elements.selectedPath.textContent = path;
  };

  const clearAfterRoot = () => {
    setOptions(elements.variantSelect, [], 'Choose a variation');
    setOptions(elements.contractSelect, [], 'Choose a contract part');
    elements.variantStep.classList.add('is-locked');
    elements.contractStep.classList.add('is-locked');
  };

  const clearAfterVariant = () => {
    setOptions(elements.contractSelect, [], 'Choose a contract part');
    elements.contractStep.classList.add('is-locked');
  };

  const actions = {
    initialize: () => {
      setOptions(elements.rootSelect, Object.keys(definitions), 'Choose a control type');
      showSource(definitions, 'definitions.json', 'Complete definitions library');
    },

    selectRoot: (event, targetElement) => {
      const rootKey = targetElement.value;
      clearAfterRoot();
      if (!rootKey) {
        actions.showAll();
        return;
      }

      const rootDefinition = definitions[rootKey];
      setOptions(elements.variantSelect, Object.keys(rootDefinition), 'Choose a variation');
      elements.variantStep.classList.remove('is-locked');
      showSource(rootDefinition, rootKey, `definitions.${rootKey}`);
      explain(
        `Control type: ${rootKey}`,
        `The first level identifies the kind of control. The variations available for ${rootKey} are now shown in the next step.`,
        `definitions.${rootKey}`
      );
    },

    selectVariant: (event, targetElement) => {
      const rootKey = elements.rootSelect.value;
      const variantKey = targetElement.value;
      clearAfterVariant();
      if (!rootKey || !variantKey) return;

      const variantDefinition = definitions[rootKey][variantKey];
      setOptions(elements.contractSelect, Object.keys(variantDefinition), 'Choose a contract part');
      elements.contractStep.classList.remove('is-locked');
      showSource(variantDefinition, `${rootKey}.${variantKey}`, `definitions.${rootKey}.${variantKey}`);
      explain(
        `Variation: ${variantKey}`,
        `This is the ${variantKey} variation of the ${rootKey} control. Its contents follow the shared definition contract.`,
        `definitions.${rootKey}.${variantKey}`
      );
    },

    selectContract: (event, targetElement) => {
      const rootKey = elements.rootSelect.value;
      const variantKey = elements.variantSelect.value;
      const contractKey = targetElement.value;
      if (!rootKey || !variantKey || !contractKey) return;

      const contractValue = definitions[rootKey][variantKey][contractKey];
      const descriptions = {
        baseFromSpec: 'Identifies the base specification from which this definition starts.',
        instructions: 'Lists the instructions that describe how this variation is assembled.',
        options: 'Contains the options associated with this particular variation.'
      };

      showSource(contractValue, contractKey, `definitions.${rootKey}.${variantKey}.${contractKey}`);
      explain(
        `Contract part: ${contractKey}`,
        descriptions[contractKey] || `This is the ${contractKey} part of the selected definition.`,
        `definitions.${rootKey}.${variantKey}.${contractKey}`
      );
    },

    showAll: () => {
      elements.rootSelect.value = '';
      setOptions(elements.variantSelect, [], 'Choose a variation');
      setOptions(elements.contractSelect, [], 'Choose a contract part');
      elements.variantStep.classList.add('is-locked');
      elements.contractStep.classList.add('is-locked');
      showSource(definitions, 'definitions.json', 'Complete definitions library');
      explain(
        'The complete definitions library',
        'Every control type and variation starts here. Choose a control type to discover how the library is organized.',
        'definitions'
      );
    }
  };

  return actions;
}

export default createActions;
