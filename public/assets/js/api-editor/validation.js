// Mechanical API editor segment from the v1.1.0 monolith.
// Keep this segment behavior-identical until the second refactor pass.
export const createValidationRuntime = (ctx) => {
  const { form } = ctx;
  const pathOrder = [
    { name: 'pathBase', label: '대분류' },
    { name: 'pathVersion', label: '중분류' },
    { name: 'pathSubCategory', label: '소분류' },
    { name: 'pathAction', label: '동작' },
  ];

  const clearSuccessStatusError = () => {
    const inputElement = form.elements.successStatus;
    inputElement?.classList.remove('is-error', 'shake');
    inputElement?.removeAttribute('aria-invalid');
    inputElement?.removeAttribute('aria-describedby');
    if (ctx.successStatusError) {
      ctx.successStatusError.hidden = true;
      ctx.successStatusError.textContent = '';
    }
  };

  const triggerShake = (element) => {
    if (!element) return;
    element.classList.remove('shake');
    requestAnimationFrame(() => {
      element.classList.add('shake');
      element.addEventListener('animationend', () => element.classList.remove('shake'), { once: true });
    });
  };

  const getValidationTarget = (field) => {
    if (field === 'apiName') return form.elements.apiName;
    if (field === 'method') return ctx.methodPickerGrid;
    if (field === 'path') return ctx.pathGrid;
    if (field === 'successStatus') return form.elements.successStatus;
    return null;
  };

  const getValidationFocusTarget = (field) => {
    if (field === 'method') {
      return form.querySelector('input[name="method"]:checked') || form.querySelector('input[name="method"]');
    }
    if (field === 'path') {
      const pathError = getPathHierarchyError();
      return form.elements[pathError?.missingName]
        || form.elements.pathBase
        || form.elements.pathVersion
        || form.elements.pathSubCategory
        || form.elements.pathAction;
    }
    return getValidationTarget(field);
  };

  const clearFileNameConflictError = () => {
    [ctx.pathGrid, ctx.fileNamePreview].forEach((element) => {
      element?.classList.remove('is-error', 'shake');
      element?.removeAttribute('aria-invalid');
    });
    ctx.pathGrid?.querySelectorAll('input').forEach((inputElement) => {
      inputElement.classList.remove('is-error');
      inputElement.removeAttribute('aria-invalid');
    });
  };

  const clearValidationFieldError = (field) => {
    const target = getValidationTarget(field);
    target?.classList.remove('is-error', 'shake');
    target?.removeAttribute('aria-invalid');
    if (field === 'path') {
      ctx.pathGrid?.querySelectorAll('input').forEach((inputElement) => {
        inputElement.classList.remove('is-error', 'shake');
        inputElement.removeAttribute('aria-invalid');
      });
    }
    if (field === 'successStatus') {
      clearSuccessStatusError();
    }
  };

  const clearValidationErrors = () => {
    ['apiName', 'method', 'path', 'successStatus'].forEach(clearValidationFieldError);
    clearFileNameConflictError();
  };

  const scheduleTransientErrorClear = () => {
    window.clearTimeout(ctx.transientErrorClearTimer);
    ctx.transientErrorClearTimer = window.setTimeout(() => {
      clearValidationErrors();
      ctx.transientErrorClearTimer = null;
    }, ctx.ERROR_STATE_CLEAR_DELAY_MS);
  };

  const showSuccessStatusError = (message) => {
    const inputElement = form.elements.successStatus;
    if (!inputElement) return;

    inputElement.classList.add('is-error');
    inputElement.setAttribute('aria-invalid', 'true');
    if (ctx.successStatusError) {
      ctx.successStatusError.textContent = message;
      ctx.successStatusError.hidden = false;
      inputElement.setAttribute('aria-describedby', ctx.successStatusError.id);
    }

    triggerShake(inputElement);
    inputElement.focus();
    scheduleTransientErrorClear();
  };

  const markValidationFieldError = (error, options = {}) => {
    if (error.field === 'path') {
      markPathValidationError(error, options);
      return;
    }
    const target = getValidationTarget(error.field);
    if (!target) return;

    target.classList.add('is-error');
    target.setAttribute('aria-invalid', 'true');
    if (error.field === 'successStatus' && ctx.successStatusError) {
      ctx.successStatusError.textContent = error.message;
      ctx.successStatusError.hidden = false;
      form.elements.successStatus?.setAttribute('aria-describedby', ctx.successStatusError.id);
    }
    if (options.shake) triggerShake(target);
  };

  const getPathHierarchyError = () => {
    const values = pathOrder.map((item) => ({
      ...item,
      value: ctx.input(item.name),
    }));

    for (let index = 1; index < values.length; index += 1) {
      if (!values[index].value) continue;
      const missingBefore = values.find((item, itemIndex) => itemIndex < index && !item.value);
      if (!missingBefore) continue;
      return {
        field: 'path',
        missingName: missingBefore.name,
        missingLabel: missingBefore.label,
        filledName: values[index].name,
        filledLabel: values[index].label,
        message: `${values[index].label} 값을 입력하려면 ${missingBefore.label}를 먼저 입력해주세요.`,
      };
    }
    return null;
  };

  const markPathValidationError = (error, options = {}) => {
    const target = ctx.pathGrid;
    if (!target) return;

    target.classList.add('is-error');
    target.setAttribute('aria-invalid', 'true');
    if (options.shake) triggerShake(target);

    const missingInput = form.elements[error.missingName];
    missingInput?.classList.add('is-error');
    missingInput?.setAttribute('aria-invalid', 'true');
    if (options.shake) triggerShake(missingInput);
  };

  const scrollToValidationField = (field, options = {}) => {
    const target = getValidationTarget(field);
    if (!target) return;
    const scrollTarget = target.closest?.('.field, .panel') || target;
    scrollTarget.scrollIntoView({ behavior: options.behavior || 'smooth', block: 'center' });
    window.setTimeout(() => {
      const focusTarget = getValidationFocusTarget(field);
      focusTarget?.focus?.({ preventScroll: true });
    }, options.focusDelay ?? 220);
  };

  const markFileNameConflictError = () => {
    clearFileNameConflictError();
    [ctx.pathGrid, ctx.fileNamePreview].forEach((element) => {
      element?.classList.add('is-error');
      element?.setAttribute('aria-invalid', 'true');
      triggerShake(element);
    });
    ctx.pathGrid?.querySelectorAll('input').forEach((inputElement) => {
      inputElement.classList.add('is-error');
      inputElement.setAttribute('aria-invalid', 'true');
    });
    (ctx.pathGrid?.closest('.field') || ctx.fileNamePreview?.closest('.field'))?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    window.setTimeout(() => {
      form.elements.pathBase?.focus?.({ preventScroll: true });
    }, 220);
    scheduleTransientErrorClear();
  };

  const isTargetFileExistsError = (error) =>
    error instanceof Error && error.message === 'Target file already exists.';

  const collectValidationErrors = () => {
    const errors = [];
    if (!ctx.input('apiName')) {
      errors.push({ field: 'apiName', message: 'API 이름을 입력해주세요.' });
    }
    if (!ctx.input('method')) {
      errors.push({ field: 'method', message: 'Method를 선택해주세요.' });
    }
    if (ctx.getPathSegments().length === 0) {
      errors.push({ field: 'path', message: 'Path를 하나 이상 입력해주세요.' });
    } else {
      const pathHierarchyError = getPathHierarchyError();
      if (pathHierarchyError) errors.push(pathHierarchyError);
    }
    const successStatus = ctx.normalizeSuccessStatusValue(form.elements.successStatus?.value);
    if (!/^2\d{2}$/.test(successStatus)) {
      errors.push({ field: 'successStatus', message: 'Success Status는 2xx 형태로 입력해주세요.' });
    }
    return errors;
  };

  const validateSpecBeforeSave = () => {
    clearValidationErrors();
    const errors = collectValidationErrors();

    if (errors.length === 0) return true;

    errors.forEach((error) => markValidationFieldError(error, { shake: true }));
    scheduleTransientErrorClear();
    const title = errors.length === 1 && errors[0].field === 'path' && errors[0].missingName
      ? 'Path 구성 오류'
      : '필수 값 누락';
    ctx.showWarningToast(
      title,
      errors.length === 1 ? errors[0].message : `${errors.length}개의 필수 값을 확인해주세요.`,
    );
    scrollToValidationField(errors[0].field);
    ctx.setStatus(title);
    return false;
  };

  return {
    clearSuccessStatusError,
    showSuccessStatusError,
    triggerShake,
    getValidationTarget,
    getValidationFocusTarget,
    clearValidationFieldError,
    clearValidationErrors,
    markValidationFieldError,
    scrollToValidationField,
    getPathHierarchyError,
    clearFileNameConflictError,
    scheduleTransientErrorClear,
    markFileNameConflictError,
    isTargetFileExistsError,
    collectValidationErrors,
    validateSpecBeforeSave,
  };
};
