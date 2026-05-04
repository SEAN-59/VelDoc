export const createErrorResponseRuntime = (ctx) => {
  const {
    ERROR_RESPONSE_PRESETS,
    defaultErrorResponses,
    errorStatusTabs,
    form,
    state,
  } = ctx;

  const renderRows = (...args) => ctx.renderRows(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const setStatus = (...args) => ctx.setStatus(...args);
  const showWarningToast = (...args) => ctx.showWarningToast(...args);

  let createErrorResponse,
    normalizeErrorResponses,
    getErrorResponses,
    getActiveErrorResponse,
    normalizeErrorStatusValue,
    sanitizeErrorStatusValue,
    normalizeErrorCodeValue,
    hasDuplicateErrorResponse,
    clearErrorStatusDragIndicators,
    getErrorStatusPointerOwner,
    getErrorStatusDropTarget,
    updateErrorStatusDropIndicator,
    endErrorStatusDrag,
    setActiveErrorResponseIndex,
    renderErrorStatusTabs,
    focusErrorStatusInput,
    addErrorResponse,
    removeErrorResponse,
    moveErrorResponse;

  ctx.createErrorResponse = createErrorResponse = (values = {}) => {
    const hasFields = Array.isArray(values.fields);
    return {
      status: String(values.status ?? '').replace(/\D/g, '').slice(0, 3),
      code: String(values.code ?? '').trim(),
      message: String(values.message ?? '').trim(),
      condition: String(values.condition ?? '').trim(),
      fields: hasFields
        ? values.fields.map((row) => ({ ...row, nullable: row.nullable || 'N' }))
        : ctx.createDefaultErrorFields(values),
    };
  };

  ctx.normalizeErrorResponses = normalizeErrorResponses = (responses, fallbackRows = []) => {
    const normalized = Array.isArray(responses)
      ? responses
        .map(createErrorResponse)
        .filter((response) =>
          response.status ||
          response.code ||
          response.message ||
          response.condition ||
          response.fields.length > 0,
        )
      : [];

    const legacyRows = Array.isArray(fallbackRows)
      ? fallbackRows
        .filter((row) => ['status', 'code', 'message', 'condition'].some((key) => String(row?.[key] ?? '').trim()))
        .map((row) => createErrorResponse(row))
      : [];

    const source = normalized.length > 0 ? normalized : legacyRows;
    if (source.length === 0) return structuredClone(defaultErrorResponses);

    return source.reduce((acc, response) => {
      const existing = acc.find((item) => item.status === response.status);
      if (existing) {
        existing.fields.push(...response.fields);
        return acc;
      }
      acc.push(response);
      return acc;
    }, []);
  };

  ctx.getErrorResponses = getErrorResponses = () => {
    state.errorResponses = normalizeErrorResponses(state.errorResponses, state.rows.errors || []);
    state.activeErrorResponseIndex = Math.min(
      Math.max(0, state.activeErrorResponseIndex),
      state.errorResponses.length - 1,
    );
    return state.errorResponses;
  };

  ctx.getActiveErrorResponse = getActiveErrorResponse = () => getErrorResponses()[state.activeErrorResponseIndex];

  ctx.normalizeErrorStatusValue = normalizeErrorStatusValue = (value) => String(value ?? '').trim();

  ctx.sanitizeErrorStatusValue = sanitizeErrorStatusValue = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 3);

  ctx.normalizeErrorCodeValue = normalizeErrorCodeValue = (value) => String(value ?? '').trim().toUpperCase();

  ctx.hasDuplicateErrorResponse = hasDuplicateErrorResponse = (
    status,
    exceptIndex = state.activeErrorResponseIndex,
  ) => {
    const normalizedStatus = normalizeErrorStatusValue(status);
    if (!normalizedStatus) return false;
    return getErrorResponses().some((response, index) =>
      index !== exceptIndex && response.status === normalizedStatus,
    );
  };

  ctx.clearErrorStatusDragIndicators = clearErrorStatusDragIndicators = () => {
    errorStatusTabs?.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
      element.classList.remove('drag-over-before', 'drag-over-after');
    });
  };

  ctx.getErrorStatusPointerOwner = getErrorStatusPointerOwner = (event) =>
    event.target instanceof Element ? event.target.closest('.success-status-tab') : null;

  ctx.getErrorStatusDropTarget = getErrorStatusDropTarget = (clientX, clientY) => {
    const tabs = [...(errorStatusTabs?.querySelectorAll('.draggable-status-tab') || [])];
    if (tabs.length === 0) return null;

    const closest = tabs.reduce((best, tab) => {
      const rect = tab.getBoundingClientRect();
      const dx = clientX < rect.left ? rect.left - clientX : clientX > rect.right ? clientX - rect.right : 0;
      const dy = clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
      const distance = dx * dx + dy * dy;
      return !best || distance < best.distance ? { tab, rect, distance } : best;
    }, null);

    if (!closest) return null;
    return {
      element: closest.tab,
      index: Number.parseInt(closest.tab.dataset.index || '-1', 10),
      position: clientX < closest.rect.left + closest.rect.width / 2 ? 'before' : 'after',
    };
  };

  ctx.updateErrorStatusDropIndicator = updateErrorStatusDropIndicator = (clientX, clientY) => {
    if (!ctx.errorStatusDragState) return null;
    const target = getErrorStatusDropTarget(clientX, clientY);
    clearErrorStatusDragIndicators();
    if (target?.element) {
      target.element.classList.add(target.position === 'before' ? 'drag-over-before' : 'drag-over-after');
    }
    return target;
  };

  ctx.endErrorStatusDrag = endErrorStatusDrag = (event, shouldMove = false) => {
    if (!ctx.errorStatusDragState) return;
    const dragState = ctx.errorStatusDragState;
    if (dragState.pointerId !== event.pointerId) return;
    const target = shouldMove ? updateErrorStatusDropIndicator(event.clientX, event.clientY) : null;

    dragState.tab.classList.remove('dragging');
    if (dragState.owner.hasPointerCapture?.(dragState.pointerId)) {
      dragState.owner.releasePointerCapture(dragState.pointerId);
    }
    ctx.errorStatusDragState = null;
    clearErrorStatusDragIndicators();

    if (shouldMove && target && target.index >= 0) {
      moveErrorResponse(dragState.fromIndex, target.index, target.position);
    }
  };

  ctx.setActiveErrorResponseIndex = setActiveErrorResponseIndex = (index) => {
    const responses = getErrorResponses();
    state.activeErrorResponseIndex = Math.min(Math.max(0, index), responses.length - 1);
    renderErrorStatusTabs();
    renderRows('errorFields');
    refresh();
  };

  ctx.renderErrorStatusTabs = renderErrorStatusTabs = function() {
    if (!errorStatusTabs) return;
    const responses = getErrorResponses();
    errorStatusTabs.replaceChildren();

    responses.forEach((response, index) => {
      const tab = document.createElement('div');
      tab.className = `success-status-tab ${responses.length > 1 ? 'draggable-status-tab' : ''} ${index === state.activeErrorResponseIndex ? 'active' : ''}`.trim();
      tab.dataset.index = String(index);
      tab.setAttribute('role', 'presentation');

      if (responses.length > 1) {
        tab.addEventListener('pointerdown', (event) => {
          if (event.button !== 0) return;
          if (event.target instanceof Element && event.target.closest('.success-status-remove')) return;
          const pointerOwner = getErrorStatusPointerOwner(event);
          if (!pointerOwner) return;
          ctx.errorStatusDragState = {
            fromIndex: index,
            owner: pointerOwner,
            pointerId: event.pointerId,
            tab,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
          };
          pointerOwner.setPointerCapture?.(event.pointerId);
        });
        tab.addEventListener('pointermove', (event) => {
          if (!ctx.errorStatusDragState || ctx.errorStatusDragState.pointerId !== event.pointerId) return;
          const distance = Math.hypot(event.clientX - ctx.errorStatusDragState.startX, event.clientY - ctx.errorStatusDragState.startY);
          if (!ctx.errorStatusDragState.moved && distance < 4) return;
          ctx.errorStatusDragState.moved = true;
          ctx.errorStatusDragState.tab.classList.add('dragging');
          updateErrorStatusDropIndicator(event.clientX, event.clientY);
        });
        tab.addEventListener('pointerup', (event) => {
          if (event.target instanceof Element && event.target.closest('.success-status-remove')) return;
          const shouldMove = Boolean(ctx.errorStatusDragState?.moved);
          endErrorStatusDrag(event, shouldMove);
          if (!shouldMove) setActiveErrorResponseIndex(index);
        });
        tab.addEventListener('pointercancel', (event) => endErrorStatusDrag(event));
      }

      const button = document.createElement('button');
      button.className = 'success-status-tab-button';
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === state.activeErrorResponseIndex ? 'true' : 'false');
      button.textContent = response.status || '400';
      button.addEventListener('click', () => setActiveErrorResponseIndex(index));
      tab.append(button);

      if (responses.length > 1) {
        const removeButton = document.createElement('button');
        removeButton.className = 'success-status-remove';
        removeButton.type = 'button';
        removeButton.textContent = '×';
        removeButton.setAttribute('aria-label', `${response.status || '400'} 상태 삭제`);
        removeButton.addEventListener('pointerdown', (event) => {
          event.stopPropagation();
        });
        removeButton.addEventListener('pointerup', (event) => {
          event.stopPropagation();
        });
        removeButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          removeErrorResponse(index);
        });
        tab.append(removeButton);
      }

      errorStatusTabs.append(tab);
    });
  };

  ctx.focusErrorStatusInput = focusErrorStatusInput = () => {
    window.requestAnimationFrame(() => {
      form.elements.errorStatus?.focus();
      form.elements.errorStatus?.select?.();
    });
  };

  ctx.addErrorResponse = addErrorResponse = () => {
    const responses = getErrorResponses();
    const nextPreset = ERROR_RESPONSE_PRESETS.find((preset) =>
      !responses.some((response) => response.status === preset.status),
    );
    const nextResponse = createErrorResponse(nextPreset || {
      status: '400',
      code: 'ERROR_CODE',
      message: '오류 메시지를 입력해주세요.',
      condition: '',
    });
    responses.push(nextResponse);
    state.activeErrorResponseIndex = responses.length - 1;
    renderErrorStatusTabs();
    renderRows('errorFields');
    refresh();
    focusErrorStatusInput();
    setStatus('Error 상태 추가됨');
  };

  ctx.removeErrorResponse = removeErrorResponse = (index) => {
    const responses = getErrorResponses();
    if (responses.length <= 1) return;
    responses.splice(index, 1);
    state.activeErrorResponseIndex = Math.min(state.activeErrorResponseIndex, responses.length - 1);
    renderErrorStatusTabs();
    renderRows('errorFields');
    refresh();
  };

  ctx.moveErrorResponse = moveErrorResponse = (fromIndex, targetIndex, position) => {
    const responses = getErrorResponses();
    if (fromIndex < 0 || targetIndex < 0) return;
    if (fromIndex >= responses.length || targetIndex >= responses.length) return;
    const activeResponse = responses[state.activeErrorResponseIndex];

    let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    if (fromIndex < insertIndex) insertIndex -= 1;
    if (fromIndex === insertIndex) return;

    const [movedResponse] = responses.splice(fromIndex, 1);
    responses.splice(insertIndex, 0, movedResponse);
    state.activeErrorResponseIndex = Math.max(0, responses.indexOf(activeResponse));
    renderErrorStatusTabs();
    renderRows('errorFields');
    refresh();
    setStatus('Error 상태 순서 변경됨');
  };

  return {
    addErrorResponse,
    clearErrorStatusDragIndicators,
    createErrorResponse,
    endErrorStatusDrag,
    focusErrorStatusInput,
    getActiveErrorResponse,
    getErrorResponses,
    getErrorStatusDropTarget,
    getErrorStatusPointerOwner,
    hasDuplicateErrorResponse,
    moveErrorResponse,
    normalizeErrorCodeValue,
    normalizeErrorResponses,
    normalizeErrorStatusValue,
    removeErrorResponse,
    renderErrorStatusTabs,
    sanitizeErrorStatusValue,
    setActiveErrorResponseIndex,
    updateErrorStatusDropIndicator,
  };
};
