export const createSuccessResponseRuntime = (ctx) => {
  const {
    form,
    state,
    successStatusTabs,
  } = ctx;

  const clearSuccessStatusError = (...args) => ctx.clearSuccessStatusError(...args);
  const renderRows = (...args) => ctx.renderRows(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const setStatus = (...args) => ctx.setStatus(...args);
  const showWarningToast = (...args) => ctx.showWarningToast(...args);

  let createSuccessResponse,
    normalizeSuccessResponses,
    getSuccessResponses,
    getActiveSuccessResponse,
    normalizeSuccessStatusValue,
    sanitizeSuccessStatusValue,
    hasDuplicateSuccessStatus,
    clearSuccessStatusDragIndicators,
    getSuccessStatusPointerOwner,
    getSuccessStatusDropTarget,
    updateSuccessStatusDropIndicator,
    endSuccessStatusDrag,
    setActiveSuccessResponseIndex,
    renderSuccessStatusTabs,
    focusSuccessStatusInput,
    addSuccessResponse,
    removeSuccessResponse,
    moveSuccessResponse;

  ctx.createSuccessResponse = createSuccessResponse = (values = {}) => ({
    status: String(values.status ?? '').replace(/\D/g, '').slice(0, 3),
    fields: Array.isArray(values.fields)
      ? values.fields.map((row) => ({ ...row, nullable: row.nullable || 'N' }))
      : [],
  });

  ctx.normalizeSuccessResponses = normalizeSuccessResponses = (responses, fallbackStatus = '200', fallbackFields = []) => {
    const normalized = Array.isArray(responses)
      ? responses.map(createSuccessResponse).filter((response) => response.status || response.fields.length > 0)
      : [];

    if (normalized.length > 0) {
      return normalized.reduce((acc, response) => {
        const existing = response.status
          ? acc.find((item) => item.status === response.status)
          : null;
        if (existing) {
          existing.fields.push(...response.fields);
          return acc;
        }
        acc.push(response);
        return acc;
      }, []);
    }
    return [createSuccessResponse({ status: fallbackStatus, fields: fallbackFields })];
  };

  ctx.getSuccessResponses = getSuccessResponses = () => {
    state.successResponses = normalizeSuccessResponses(
      state.successResponses,
      form.elements.successStatus?.value || '200',
      state.rows.responseFields || [],
    );
    state.activeSuccessResponseIndex = Math.min(
      Math.max(0, state.activeSuccessResponseIndex),
      state.successResponses.length - 1,
    );
    return state.successResponses;
  };

  ctx.getActiveSuccessResponse = getActiveSuccessResponse = () => getSuccessResponses()[state.activeSuccessResponseIndex];

  ctx.normalizeSuccessStatusValue = normalizeSuccessStatusValue = (value) => String(value ?? '').trim();

  ctx.sanitizeSuccessStatusValue = sanitizeSuccessStatusValue = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 3);

  ctx.hasDuplicateSuccessStatus = hasDuplicateSuccessStatus = (status, exceptIndex = state.activeSuccessResponseIndex) => {
    const normalizedStatus = normalizeSuccessStatusValue(status);
    if (!normalizedStatus) return false;
    return getSuccessResponses().some((response, index) => index !== exceptIndex && response.status === normalizedStatus);
  };

  ctx.clearSuccessStatusDragIndicators = clearSuccessStatusDragIndicators = () => {
    successStatusTabs?.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
      element.classList.remove('drag-over-before', 'drag-over-after');
    });
  };

  ctx.getSuccessStatusPointerOwner = getSuccessStatusPointerOwner = (event) =>
    event.target instanceof Element ? event.target.closest('.success-status-tab') : null;

  ctx.getSuccessStatusDropTarget = getSuccessStatusDropTarget = (clientX, clientY) => {
    const tabs = [...(successStatusTabs?.querySelectorAll('.draggable-status-tab') || [])];
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

  ctx.updateSuccessStatusDropIndicator = updateSuccessStatusDropIndicator = (clientX, clientY) => {
    if (!ctx.successStatusDragState) return null;
    const target = getSuccessStatusDropTarget(clientX, clientY);
    clearSuccessStatusDragIndicators();
    if (target?.element) {
      target.element.classList.add(target.position === 'before' ? 'drag-over-before' : 'drag-over-after');
    }
    return target;
  };

  ctx.endSuccessStatusDrag = endSuccessStatusDrag = (event, shouldMove = false) => {
    if (!ctx.successStatusDragState) return;
    const dragState = ctx.successStatusDragState;
    if (dragState.pointerId !== event.pointerId) return;
    const target = shouldMove ? updateSuccessStatusDropIndicator(event.clientX, event.clientY) : null;

    dragState.tab.classList.remove('dragging');
    if (dragState.owner.hasPointerCapture?.(dragState.pointerId)) {
      dragState.owner.releasePointerCapture(dragState.pointerId);
    }
    ctx.successStatusDragState = null;
    clearSuccessStatusDragIndicators();

    if (shouldMove && target && target.index >= 0) {
      moveSuccessResponse(dragState.fromIndex, target.index, target.position);
    }
  };

  ctx.setActiveSuccessResponseIndex = setActiveSuccessResponseIndex = (index) => {
    clearSuccessStatusError();
    const responses = getSuccessResponses();
    state.activeSuccessResponseIndex = Math.min(Math.max(0, index), responses.length - 1);
    renderSuccessStatusTabs();
    renderRows('responseFields');
    refresh();
  };

  ctx.renderSuccessStatusTabs = renderSuccessStatusTabs = function() {
    if (!successStatusTabs) return;
    const responses = getSuccessResponses();
    successStatusTabs.replaceChildren();

    responses.forEach((response, index) => {
      const tab = document.createElement('div');
      tab.className = `success-status-tab ${responses.length > 1 ? 'draggable-status-tab' : ''} ${index === state.activeSuccessResponseIndex ? 'active' : ''}`.trim();
      tab.dataset.index = String(index);
      tab.setAttribute('role', 'presentation');

      if (responses.length > 1) {
        tab.addEventListener('pointerdown', (event) => {
          if (event.button !== 0) return;
          if (event.target instanceof Element && event.target.closest('.success-status-remove')) return;
          const pointerOwner = getSuccessStatusPointerOwner(event);
          if (!pointerOwner) return;
          ctx.successStatusDragState = {
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
          if (!ctx.successStatusDragState || ctx.successStatusDragState.pointerId !== event.pointerId) return;
          const distance = Math.hypot(event.clientX - ctx.successStatusDragState.startX, event.clientY - ctx.successStatusDragState.startY);
          if (!ctx.successStatusDragState.moved && distance < 4) return;
          ctx.successStatusDragState.moved = true;
          ctx.successStatusDragState.tab.classList.add('dragging');
          updateSuccessStatusDropIndicator(event.clientX, event.clientY);
        });
        tab.addEventListener('pointerup', (event) => {
          if (event.target instanceof Element && event.target.closest('.success-status-remove')) return;
          const shouldMove = Boolean(ctx.successStatusDragState?.moved);
          endSuccessStatusDrag(event, shouldMove);
          if (!shouldMove) setActiveSuccessResponseIndex(index);
        });
        tab.addEventListener('pointercancel', (event) => endSuccessStatusDrag(event));
      }

      const button = document.createElement('button');
      button.className = 'success-status-tab-button';
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === state.activeSuccessResponseIndex ? 'true' : 'false');
      button.textContent = response.status || '200';
      button.addEventListener('click', () => setActiveSuccessResponseIndex(index));
      tab.append(button);

      if (responses.length > 1) {
        const removeButton = document.createElement('button');
        removeButton.className = 'success-status-remove';
        removeButton.type = 'button';
        removeButton.textContent = '×';
        removeButton.setAttribute('aria-label', `${response.status || '200'} 상태 삭제`);
        removeButton.addEventListener('pointerdown', (event) => {
          event.stopPropagation();
        });
        removeButton.addEventListener('pointerup', (event) => {
          event.stopPropagation();
        });
        removeButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          removeSuccessResponse(index);
        });
        tab.append(removeButton);
      }

      successStatusTabs.append(tab);
    });
  };

  ctx.focusSuccessStatusInput = focusSuccessStatusInput = () => {
    window.requestAnimationFrame(() => {
      form.elements.successStatus?.focus();
      form.elements.successStatus?.select?.();
    });
  };

  ctx.addSuccessResponse = addSuccessResponse = () => {
    const responses = getSuccessResponses();
    const usedStatuses = new Set(responses.map((response) => response.status));
    const candidates = ['201', '202', '204', '206'];
    let nextStatus = candidates.find((status) => !usedStatuses.has(status)) || '';
    if (!nextStatus) {
      for (let statusNumber = 200; statusNumber < 300; statusNumber += 1) {
        if (!usedStatuses.has(String(statusNumber))) {
          nextStatus = String(statusNumber);
          break;
        }
      }
    }
    if (!nextStatus) {
      showWarningToast('상태 추가 실패', '추가할 수 있는 2xx 상태 코드가 없습니다.');
      return;
    }
    responses.push(createSuccessResponse({ status: nextStatus, fields: ctx.createDefaultSuccessFields?.() || [] }));
    state.activeSuccessResponseIndex = responses.length - 1;
    clearSuccessStatusError();
    renderSuccessStatusTabs();
    renderRows('responseFields');
    refresh();
    focusSuccessStatusInput();
    setStatus('Success 상태 추가됨');
  };

  ctx.removeSuccessResponse = removeSuccessResponse = (index) => {
    const responses = getSuccessResponses();
    if (responses.length <= 1) return;
    responses.splice(index, 1);
    state.activeSuccessResponseIndex = Math.min(state.activeSuccessResponseIndex, responses.length - 1);
    clearSuccessStatusError();
    renderSuccessStatusTabs();
    renderRows('responseFields');
    refresh();
  };

  ctx.moveSuccessResponse = moveSuccessResponse = (fromIndex, targetIndex, position) => {
    const responses = getSuccessResponses();
    if (fromIndex < 0 || targetIndex < 0) return;
    if (fromIndex >= responses.length || targetIndex >= responses.length) return;
    const activeResponse = responses[state.activeSuccessResponseIndex];

    let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    if (fromIndex < insertIndex) insertIndex -= 1;
    if (fromIndex === insertIndex) return;

    const [movedResponse] = responses.splice(fromIndex, 1);
    responses.splice(insertIndex, 0, movedResponse);
    state.activeSuccessResponseIndex = Math.max(0, responses.indexOf(activeResponse));
    clearSuccessStatusError();
    renderSuccessStatusTabs();
    renderRows('responseFields');
    refresh();
    setStatus('Success 상태 순서 변경됨');
  };

  return {
    addSuccessResponse,
    clearSuccessStatusDragIndicators,
    createSuccessResponse,
    endSuccessStatusDrag,
    focusSuccessStatusInput,
    getActiveSuccessResponse,
    getSuccessResponses,
    getSuccessStatusDropTarget,
    getSuccessStatusPointerOwner,
    hasDuplicateSuccessStatus,
    moveSuccessResponse,
    normalizeSuccessResponses,
    normalizeSuccessStatusValue,
    removeSuccessResponse,
    renderSuccessStatusTabs,
    sanitizeSuccessStatusValue,
    setActiveSuccessResponseIndex,
    updateSuccessStatusDropIndicator,
  };
};
