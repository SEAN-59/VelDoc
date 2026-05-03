export const createRowActionsRuntime = (ctx) => {
  const {
    AUTO_EXAMPLE_FIELD,
    AUTO_EXAMPLE_ROW_TYPES,
    AUTO_HEADER_FIELD,
    ERROR_RESPONSE_PRESETS,
    EXAMPLE_TOUCHED_FIELD,
    form,
    rowDefinitions,
    state,
  } = ctx;

  const applyAutoExampleForRow = (...args) => ctx.applyAutoExampleForRow(...args);
  const getActiveSuccessResponse = (...args) => ctx.getActiveSuccessResponse(...args);
  const getHeaderPreset = (...args) => ctx.getHeaderPreset(...args);
  const getPathActionSegments = (...args) => ctx.getPathActionSegments(...args);
  const isAutomaticHeaderRow = (...args) => ctx.isAutomaticHeaderRow(...args);
  const normalizeHeaderKey = (...args) => ctx.normalizeHeaderKey(...args);
  const normalizePathParamKey = (...args) => ctx.normalizePathParamKey(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const removeActionPathParam = (...args) => ctx.removeActionPathParam(...args);
  const renderRows = (...args) => ctx.renderRows(...args);
  const setStatus = (...args) => ctx.setStatus(...args);
  const syncHeaderRowsWithControls = (...args) => ctx.syncHeaderRowsWithControls(...args);
  const toPathParamToken = (...args) => ctx.toPathParamToken(...args);

  let getMutableRows,
    focusFirstInputInRow,
    addRow,
    findHeaderRowIndexByKey,
    addHeaderPreset,
    getErrorPreset,
    findErrorRowIndex,
    addErrorPreset,
    updateRow,
    removeRow,
    clearDragIndicators,
    getDropPosition,
    moveRow,
    addEnterRowHandler;

  ctx.getMutableRows = getMutableRows = (type) => {
    if (type === 'responseFields') return getActiveSuccessResponse().fields;
    return state.rows[type];
  };

  ctx.focusFirstInputInRow = focusFirstInputInRow = (type, index) => {
    window.requestAnimationFrame(() => {
      const definition = rowDefinitions[type];
      const container = document.querySelector(`#${definition.id}`);
      const rowElement = container?.querySelectorAll('.row, .header-card')[index];
      rowElement?.querySelector('input')?.focus();
    });
  };

  ctx.addRow = addRow = (type, values = {}, options = {}) => {
    const insertIndex = Number.isInteger(options.afterIndex)
      ? options.afterIndex + 1
      : getMutableRows(type).length;
    const nextValues = { ...values };
    if (AUTO_EXAMPLE_ROW_TYPES.has(type)) {
      applyAutoExampleForRow(nextValues);
    }
    getMutableRows(type).splice(insertIndex, 0, nextValues);
    renderRows(type);
    refresh();
    if (options.focusNewRow) {
      focusFirstInputInRow(type, insertIndex);
    }
  };

  ctx.findHeaderRowIndexByKey = findHeaderRowIndexByKey = (key) =>
    (state.rows.headers || []).findIndex((row) => normalizeHeaderKey(row.key) === normalizeHeaderKey(key));

  ctx.addHeaderPreset = addHeaderPreset = (key) => {
    const preset = getHeaderPreset(key);
    if (!preset) return;

    syncHeaderRowsWithControls();
    const existingIndex = findHeaderRowIndexByKey(preset.key);
    if (existingIndex >= 0) {
      renderRows('headers');
      focusFirstInputInRow('headers', existingIndex);
      setStatus(`${preset.key} 헤더가 이미 있습니다.`);
      return;
    }

    state.rows.headers.push({ ...preset });
    renderRows('headers');
    refresh();
    focusFirstInputInRow('headers', state.rows.headers.length - 1);
    setStatus(`${preset.key} 헤더 추가됨`);
  };

  ctx.getErrorPreset = getErrorPreset = (id) => {
    const [status, code] = String(id ?? '').split(':');
    return ERROR_RESPONSE_PRESETS.find((preset) => preset.status === status && preset.code === code);
  };

  ctx.findErrorRowIndex = findErrorRowIndex = (preset) =>
    (state.rows.errors || []).findIndex((row) => row.status === preset.status && row.code === preset.code);

  ctx.addErrorPreset = addErrorPreset = (id) => {
    const preset = getErrorPreset(id);
    if (!preset) return;

    const existingIndex = findErrorRowIndex(preset);
    if (existingIndex >= 0) {
      focusFirstInputInRow('errors', existingIndex);
      setStatus(`${preset.status} ${preset.code} 에러가 이미 있습니다.`);
      return;
    }

    state.rows.errors.push({ ...preset });
    renderRows('errors');
    refresh();
    focusFirstInputInRow('errors', state.rows.errors.length - 1);
    setStatus(`${preset.status} ${preset.code} 에러 추가됨`);
  };

  ctx.updateRow = updateRow = (type, index, key, value) => {
    const rows = getMutableRows(type);
    if (type === 'headers' && isAutomaticHeaderRow(rows[index])) {
      delete rows[index][AUTO_HEADER_FIELD];
    }
    if (type === 'actionPathParams' && key === 'key') {
      const previousKey = normalizePathParamKey(rows[index]?.pathKey || rows[index]?.key);
      const nextKey = normalizePathParamKey(value);
      if (previousKey && nextKey && previousKey !== nextKey) {
        const previousToken = toPathParamToken(previousKey);
        const nextToken = toPathParamToken(nextKey);
        const segments = getPathActionSegments().map((segment) => (segment === previousToken ? nextToken : segment));
        ctx.isSyncingActionPathParamKey = true;
        form.elements.pathAction.value = segments.length > 0 ? `/${segments.join('/')}` : '';
        ctx.isSyncingActionPathParamKey = false;
        rows[index].pathKey = nextKey;
      }
    }
    rows[index][key] = type === 'actionPathParams' && key === 'key'
      ? normalizePathParamKey(value)
      : value;
    if (AUTO_EXAMPLE_ROW_TYPES.has(type)) {
      if (key === 'example') {
        rows[index][EXAMPLE_TOUCHED_FIELD] = true;
        delete rows[index][AUTO_EXAMPLE_FIELD];
      }
      if (key === 'type') {
        applyAutoExampleForRow(rows[index]);
      }
    }
    refresh();
    return rows[index];
  };

  ctx.removeRow = removeRow = (type, index) => {
    if (type === 'actionPathParams') {
      const row = state.rows.actionPathParams[index];
      removeActionPathParam(row?.pathKey || row?.key);
      return;
    }
    getMutableRows(type).splice(index, 1);
    if (type === 'headers') {
      syncHeaderRowsWithControls();
    }
    renderRows(type);
    refresh();
  };

  ctx.clearDragIndicators = clearDragIndicators = (container) => {
    container.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
      element.classList.remove('drag-over-before', 'drag-over-after');
    });
  };

  ctx.getDropPosition = getDropPosition = (event, rowElement) => {
    const rect = rowElement.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  };

  ctx.moveRow = moveRow = (type, fromIndex, targetIndex, position) => {
    if (fromIndex < 0 || targetIndex < 0) return;
    const rows = getMutableRows(type);
    if (fromIndex >= rows.length || targetIndex >= rows.length) return;
    let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    if (fromIndex < insertIndex) insertIndex -= 1;
    if (fromIndex === insertIndex) return;

    const [row] = rows.splice(fromIndex, 1);
    rows.splice(insertIndex, 0, row);
    renderRows(type);
    refresh();
  };

  ctx.addEnterRowHandler = addEnterRowHandler = (inputElement, type, index) => {
    inputElement.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.isComposing) return;
      event.preventDefault();
      addRow(type, {}, { afterIndex: index, focusNewRow: true });
    });
  };

  return {
    addEnterRowHandler,
    addErrorPreset,
    addHeaderPreset,
    addRow,
    clearDragIndicators,
    findErrorRowIndex,
    findHeaderRowIndexByKey,
    focusFirstInputInRow,
    getDropPosition,
    getErrorPreset,
    getMutableRows,
    moveRow,
    removeRow,
    updateRow,
  };
};
