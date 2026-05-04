export const createTableRenderRuntime = (ctx) => {
  const {
    AUTO_EXAMPLE_FIELD,
    AUTO_EXAMPLE_ROW_TYPES,
    actionPathParamsPanel,
    actionPathParamsRows,
    deleteDocumentButton,
    documentEmptyState,
    fileLocationPreview,
    fileNamePreview,
    form,
    newDocumentButton,
    paramsPathPreview,
    pathPreview,
    preview,
    previewToggleButton,
    queryPathPreview,
    resetButton,
    rowDefinitions,
    saveButton,
    saveDropdown,
    saveMenuButton,
    saveNewButton,
    saveOverwriteButton,
    state,
  } = ctx;

  const addEnterRowHandler = (...args) => ctx.addEnterRowHandler(...args);
  const buildApiPath = (...args) => ctx.buildApiPath(...args);
  const buildBodyJson = (...args) => ctx.buildBodyJson(...args);
  const buildFileLocation = (...args) => ctx.buildFileLocation(...args);
  const buildFileNameFromPath = (...args) => ctx.buildFileNameFromPath(...args);
  const buildPathParamPreview = (...args) => ctx.buildPathParamPreview(...args);
  const buildQueryParamPreview = (...args) => ctx.buildQueryParamPreview(...args);
  const buildSuccessJson = (...args) => ctx.buildSuccessJson(...args);
  const clearDragIndicators = (...args) => ctx.clearDragIndicators(...args);
  const disableBrowserTextAssist = (...args) => ctx.disableBrowserTextAssist(...args);
  const generateMarkdown = (...args) => ctx.generateMarkdown(...args);
  const getActiveSuccessResponse = (...args) => ctx.getActiveSuccessResponse(...args);
  const getDropPosition = (...args) => ctx.getDropPosition(...args);
  const getMutableRows = (...args) => ctx.getMutableRows(...args);
  const isDeletableCurrentFile = (...args) => ctx.isDeletableCurrentFile(...args);
  const isDropdownOpen = (...args) => ctx.isDropdownOpen(...args);
  const isFileLocationReady = (...args) => ctx.isFileLocationReady(...args);
  const moveRow = (...args) => ctx.moveRow(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const removeRow = (...args) => ctx.removeRow(...args);
  const renderAuthPolicyScopes = (...args) => ctx.renderAuthPolicyScopes(...args);
  const renderSuccessStatusTabs = (...args) => ctx.renderSuccessStatusTabs(...args);
  const resizeJsonPreview = (...args) => ctx.resizeJsonPreview(...args);
  const saveDraft = (...args) => ctx.saveDraft(...args);
  const setDropdownOpen = (...args) => ctx.setDropdownOpen(...args);
  const setPreviewOpen = (...args) => ctx.setPreviewOpen(...args);
  const syncActionPathParamRows = (...args) => ctx.syncActionPathParamRows(...args);
  const syncAuthState = (...args) => ctx.syncAuthState(...args);
  const syncMethodState = (...args) => ctx.syncMethodState(...args);
  const updateRow = (...args) => ctx.updateRow(...args);
  const draggableRowTypes = new Set(['pathParams', 'queryParams', 'bodyFields', 'responseFields', 'errors']);
  const rowDragDataType = 'application/x-veldoc-row';

  let renderActionPathParams,
    refreshEditor,
    renderHeaderRows,
    renderFieldTableRows,
    renderRows;

  ctx.renderActionPathParams = renderActionPathParams = () => {
    if (!actionPathParamsPanel || !actionPathParamsRows) return;
    const keys = syncActionPathParamRows();
    actionPathParamsPanel.hidden = keys.length === 0;
    actionPathParamsRows.replaceChildren();
    renderFieldTableRows('actionPathParams', rowDefinitions.actionPathParams, actionPathParamsRows);
  };

  ctx.refresh = refreshEditor = (options = {}) => {
    const { shouldSaveDraft = true } = options;
    const fileLocationReady = isFileLocationReady();
    const activeDocumentReady = fileLocationReady && state.hasActiveDocument;
    const canOverwriteCurrentFile = fileLocationReady && Boolean(state.currentFile);
    const canDeleteCurrentFile = isDeletableCurrentFile();
    form.hidden = state.viewerMode || !activeDocumentReady;
    documentEmptyState.hidden = state.viewerMode || !fileLocationReady || state.hasActiveDocument;
    form?.classList.toggle('is-file-location-unset', !activeDocumentReady);
    if (!activeDocumentReady) {
      setPreviewOpen(false);
    }
    if (previewToggleButton) previewToggleButton.disabled = !activeDocumentReady;
    if (resetButton) resetButton.disabled = !activeDocumentReady;
    if (deleteDocumentButton) {
      deleteDocumentButton.disabled = !canDeleteCurrentFile;
      deleteDocumentButton.title = canDeleteCurrentFile ? '현재 열린 파일을 완전히 삭제' : '현재 열린 파일이 있을 때 사용할 수 있습니다.';
    }
    if (newDocumentButton) newDocumentButton.disabled = !fileLocationReady;
    if (saveButton) saveButton.disabled = !activeDocumentReady;
    if (saveMenuButton) saveMenuButton.disabled = !activeDocumentReady;
    if (saveOverwriteButton) {
      saveOverwriteButton.disabled = !canOverwriteCurrentFile;
      saveOverwriteButton.title = canOverwriteCurrentFile ? '현재 열린 파일에 저장' : '현재 열린 파일이 있을 때 사용할 수 있습니다.';
    }
    if (saveNewButton) saveNewButton.disabled = !activeDocumentReady;
    saveDropdown?.querySelectorAll('[data-save-action]').forEach((button) => {
      button.disabled = button.dataset.saveAction === 'overwrite' ? !canOverwriteCurrentFile : !activeDocumentReady;
    });
    if (!activeDocumentReady && isDropdownOpen(saveDropdown)) {
      setDropdownOpen(saveMenuButton, saveDropdown, false);
    }

    syncMethodState();
    syncAuthState();
    renderAuthPolicyScopes();
    if (pathPreview) {
      pathPreview.textContent = buildApiPath();
    }
    if (paramsPathPreview) {
      paramsPathPreview.textContent = buildPathParamPreview();
    }
    if (queryPathPreview) {
      queryPathPreview.textContent = buildQueryParamPreview();
    }
    if (fileNamePreview) {
      fileNamePreview.textContent = buildFileNameFromPath();
    }
    if (fileLocationPreview) {
      const fileLocation = buildFileLocation();
      fileLocationPreview.textContent = fileLocation;
      fileLocationPreview.title = fileLocation;
    }
    if (form.elements.bodyJson) {
      form.elements.bodyJson.value = buildBodyJson();
      resizeJsonPreview(form.elements.bodyJson);
    }
    if (form.elements.successStatus) {
      form.elements.successStatus.value = getActiveSuccessResponse().status;
    }
    if (form.elements.successJson) {
      form.elements.successJson.value = buildSuccessJson();
      resizeJsonPreview(form.elements.successJson);
    }
    renderSuccessStatusTabs();
    preview.textContent = generateMarkdown();
    if (shouldSaveDraft) saveDraft();
  };

  ctx.renderHeaderRows = renderHeaderRows = (definition, container) => {
    state.rows.headers.forEach((row, index) => {
      const card = document.createElement('div');
      card.className = 'header-card';

      const topRow = document.createElement('div');
      topRow.className = 'header-card-top';

      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button header-remove';
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', '헤더 삭제');
      removeButton.addEventListener('click', () => removeRow('headers', index));

      definition.fields.forEach(([key, label, placeholder]) => {
        if (key === 'description') return;

        const wrapper = document.createElement(['required'].includes(key) ? 'div' : 'label');
        wrapper.className = 'row-label';
        const labelElement = document.createElement('span');
        labelElement.textContent = key === 'required' ? 'Req' : label;

        if (key === 'required') {
          row[key] = row[key] || placeholder || 'Y';
          const toggleButton = document.createElement('button');
          toggleButton.className = `toggle-button ${row[key] === 'Y' ? 'active' : ''}`;
          toggleButton.type = 'button';
          toggleButton.textContent = row[key];
          toggleButton.setAttribute('aria-pressed', row[key] === 'Y' ? 'true' : 'false');
          toggleButton.addEventListener('click', () => {
            const nextValue = state.rows.headers[index][key] === 'Y' ? 'N' : 'Y';
            updateRow('headers', index, key, nextValue);
            toggleButton.textContent = nextValue;
            toggleButton.classList.toggle('active', nextValue === 'Y');
            toggleButton.setAttribute('aria-pressed', nextValue === 'Y' ? 'true' : 'false');
          });
          wrapper.append(labelElement, toggleButton);
          topRow.append(wrapper);
          return;
        }

        const inputElement = document.createElement('input');
        disableBrowserTextAssist(inputElement);
        inputElement.value = row[key] || '';
        inputElement.placeholder = placeholder || '';
        inputElement.addEventListener('input', () => updateRow('headers', index, key, inputElement.value));
        addEnterRowHandler(inputElement, 'headers', index);
        wrapper.append(labelElement, inputElement);
        topRow.append(wrapper);
      });

      const descriptionWrapper = document.createElement('label');
      descriptionWrapper.className = 'row-label header-description';
      const descriptionLabel = document.createElement('span');
      descriptionLabel.textContent = '설명';
      const descriptionInput = document.createElement('input');
      disableBrowserTextAssist(descriptionInput);
      descriptionInput.value = row.description || '';
      descriptionInput.placeholder = definition.fields.find(([key]) => key === 'description')?.[2] || '';
      descriptionInput.addEventListener('input', () => updateRow('headers', index, 'description', descriptionInput.value));
      addEnterRowHandler(descriptionInput, 'headers', index);
      descriptionWrapper.append(descriptionLabel, descriptionInput);

      card.append(removeButton, topRow, descriptionWrapper);
      container.append(card);
    });
  };

  ctx.renderFieldTableRows = renderFieldTableRows = function(type, definition, container) {
    const rows = getMutableRows(type);
    if (rows.length === 0) return;
    const canDrag = draggableRowTypes.has(type);

    const tableElement = document.createElement('div');
    tableElement.className = 'field-table';

    const headerElement = document.createElement('div');
    headerElement.className = `field-table-head ${definition.className || ''}`.trim();
    if (canDrag) {
      const dragHeaderCell = document.createElement('span');
      dragHeaderCell.setAttribute('aria-hidden', 'true');
      headerElement.append(dragHeaderCell);
    }
    definition.fields.forEach(([, label]) => {
      const headerCell = document.createElement('span');
      headerCell.textContent = label;
      headerElement.append(headerCell);
    });
    const actionHeaderCell = document.createElement('span');
    actionHeaderCell.setAttribute('aria-hidden', 'true');
    headerElement.append(actionHeaderCell);
    tableElement.append(headerElement);

    rows.forEach((row, index) => {
      const rowElement = document.createElement('div');
      rowElement.className = `row ${definition.className || ''} ${canDrag ? 'draggable-row' : ''}`.trim();
      if (canDrag) {
        rowElement.dataset.index = String(index);
        rowElement.addEventListener('dragover', (event) => {
          if (![...event.dataTransfer.types].includes(rowDragDataType)) return;
          event.preventDefault();
          const position = getDropPosition(event, rowElement);
          clearDragIndicators(tableElement);
          rowElement.classList.add(position === 'before' ? 'drag-over-before' : 'drag-over-after');
        });
        rowElement.addEventListener('dragleave', () => {
          rowElement.classList.remove('drag-over-before', 'drag-over-after');
        });
        rowElement.addEventListener('drop', (event) => {
          event.preventDefault();
          const position = getDropPosition(event, rowElement);
          rowElement.classList.remove('drag-over-before', 'drag-over-after');
          const dragData = JSON.parse(event.dataTransfer.getData(rowDragDataType) || '{}');
          if (dragData.type !== type) return;
          const fromIndex = Number.parseInt(String(dragData.index), 10);
          moveRow(type, fromIndex, index, position);
        });

        const dragHandle = document.createElement('button');
        dragHandle.className = 'drag-handle';
        dragHandle.type = 'button';
        dragHandle.draggable = true;
        dragHandle.textContent = '::';
        dragHandle.setAttribute('aria-label', '행 순서 변경');
        dragHandle.addEventListener('dragstart', (event) => {
          event.dataTransfer.effectAllowed = 'move';
          const dragData = JSON.stringify({ type, index });
          event.dataTransfer.setData(rowDragDataType, dragData);
          event.dataTransfer.setData('text/plain', dragData);
          rowElement.classList.add('dragging');
        });
        dragHandle.addEventListener('dragend', () => {
          rowElement.classList.remove('dragging');
          clearDragIndicators(tableElement);
        });
        rowElement.append(dragHandle);
      }

      definition.fields.forEach(([key, label, placeholder]) => {
        if (['required', 'nullable', 'beforeAction'].includes(key)) {
          row[key] = row[key] || placeholder || 'N';
          const toggleButton = document.createElement('button');
          toggleButton.className = `toggle-button ${row[key] === 'Y' ? 'active' : ''}`;
          toggleButton.type = 'button';
          toggleButton.tabIndex = 0;
          toggleButton.textContent = row[key];
          toggleButton.setAttribute('aria-label', label);
          toggleButton.setAttribute('aria-pressed', row[key] === 'Y' ? 'true' : 'false');
          toggleButton.addEventListener('click', () => {
            const nextValue = getMutableRows(type)[index][key] === 'Y' ? 'N' : 'Y';
            updateRow(type, index, key, nextValue);
            toggleButton.textContent = nextValue;
            toggleButton.classList.toggle('active', nextValue === 'Y');
            toggleButton.setAttribute('aria-pressed', nextValue === 'Y' ? 'true' : 'false');
          });
          rowElement.append(toggleButton);
          return;
        }

        const inputElement = document.createElement('input');
        disableBrowserTextAssist(inputElement);
        inputElement.value = row[key] || '';
        inputElement.placeholder = placeholder || '';
        inputElement.setAttribute('aria-label', label);
        inputElement.dataset.fieldKey = key;
        inputElement.addEventListener('input', (event) => {
          if (type === 'actionPathParams') {
            event.stopPropagation();
          }
          const updatedRow = updateRow(type, index, key, inputElement.value);
          if (AUTO_EXAMPLE_ROW_TYPES.has(type) && key === 'type' && updatedRow?.[AUTO_EXAMPLE_FIELD]) {
            const exampleInput = rowElement.querySelector('input[data-field-key="example"]');
            if (exampleInput) exampleInput.value = updatedRow.example || '';
          }
        });
        if (type !== 'actionPathParams') {
          addEnterRowHandler(inputElement, type, index);
        }
        rowElement.append(inputElement);
      });

      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button';
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', '행 삭제');
      removeButton.addEventListener('click', () => removeRow(type, index));
      rowElement.append(removeButton);
      tableElement.append(rowElement);
    });

    container.append(tableElement);
  };

  ctx.renderRows = renderRows = (type) => {
    const definition = rowDefinitions[type];
    const container = document.querySelector(`#${definition.id}`);
    container.replaceChildren();

    if (['headers', 'pathParams', 'actionPathParams', 'queryParams', 'bodyFields', 'responseFields', 'errors'].includes(type)) {
      renderFieldTableRows(type, definition, container);
      return;
    }

    state.rows[type].forEach((row, index) => {
      const rowElement = document.createElement('div');
      rowElement.className = `row ${definition.className || ''}`.trim();

      definition.fields.forEach(([key, label, placeholder]) => {
        const wrapper = document.createElement(['required', 'nullable', 'beforeAction'].includes(key) ? 'div' : 'label');
        wrapper.className = 'row-label';
        const labelElement = document.createElement('span');
        labelElement.textContent = label;

        if (['required', 'nullable', 'beforeAction'].includes(key)) {
          row[key] = row[key] || placeholder || 'N';
          const toggleButton = document.createElement('button');
          toggleButton.className = `toggle-button ${row[key] === 'Y' ? 'active' : ''}`;
          toggleButton.type = 'button';
          toggleButton.tabIndex = 0;
          toggleButton.textContent = row[key];
          toggleButton.setAttribute('aria-pressed', row[key] === 'Y' ? 'true' : 'false');
          toggleButton.addEventListener('click', () => {
            const nextValue = state.rows[type][index][key] === 'Y' ? 'N' : 'Y';
            updateRow(type, index, key, nextValue);
            toggleButton.textContent = nextValue;
            toggleButton.classList.toggle('active', nextValue === 'Y');
            toggleButton.setAttribute('aria-pressed', nextValue === 'Y' ? 'true' : 'false');
          });
          wrapper.append(labelElement, toggleButton);
          rowElement.append(wrapper);
          return;
        }

        const inputElement = document.createElement('input');
        disableBrowserTextAssist(inputElement);
        inputElement.value = row[key] || '';
        inputElement.placeholder = placeholder || '';
        inputElement.addEventListener('input', () => updateRow(type, index, key, inputElement.value));
        addEnterRowHandler(inputElement, type, index);
        wrapper.append(labelElement, inputElement);
        rowElement.append(wrapper);
      });

      const removeButton = document.createElement('button');
      removeButton.className = 'remove-button';
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', '행 삭제');
      removeButton.addEventListener('click', () => removeRow(type, index));
      rowElement.append(removeButton);
      container.append(rowElement);
    });
  };

  return {
    refresh: refreshEditor,
    renderActionPathParams,
    renderFieldTableRows,
    renderHeaderRows,
    renderRows,
  };
};
