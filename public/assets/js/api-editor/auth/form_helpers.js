export const createAuthFormRuntime = (ctx) => {
  const {
    form,
  } = ctx;

  const blankIfPlaceholder = (...args) => ctx.blankIfPlaceholder(...args);
  const normalizeBasicApiMethod = (...args) => ctx.normalizeBasicApiMethod(...args);
  const parseInfoTable = (...args) => ctx.parseInfoTable(...args);

  let
    setFormValue,
    setCheckedValues,
    normalizeLoadedMethod,
    parseCsvValues,
    getMarkdownTableValue;

  
  ctx.setFormValue = setFormValue = (name, value) => {
    const elements = form.elements[name];
    if (!elements) return;
    elements.value = value;
  };

  
  ctx.setCheckedValues = setCheckedValues = (name, values) => {
    const selectedValues = new Set(values);
    form.querySelectorAll(`input[name="${name}"]`).forEach((element) => {
      element.checked = selectedValues.has(element.value);
    });
  };

  
  ctx.normalizeLoadedMethod = normalizeLoadedMethod = (value) => normalizeBasicApiMethod(value);

  
  ctx.parseCsvValues = parseCsvValues = (value) =>
    blankIfPlaceholder(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  
  ctx.getMarkdownTableValue = getMarkdownTableValue = (section, key) => parseInfoTable(section)[key] || '';

  return {
    setFormValue,
    setCheckedValues,
    normalizeLoadedMethod,
    parseCsvValues,
    getMarkdownTableValue,
  };
};
