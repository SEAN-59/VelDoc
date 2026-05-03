// Mechanical API editor segment from the v1.1.0 monolith.
// Keep this segment behavior-identical until the second refactor pass.
export const createValidationRuntime = (ctx) => {
  const { form } = ctx;

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
    if (field === 'successStatus') return form.elements.successStatus;
    return null;
  };

  const getValidationFocusTarget = (field) => {
    if (field === 'method') {
      return form.querySelector('input[name="method"]:checked') || form.querySelector('input[name="method"]');
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
    if (field === 'successStatus') {
      clearSuccessStatusError();
    }
  };

  const clearValidationErrors = () => {
    ['apiName', 'method', 'successStatus'].forEach(clearValidationFieldError);
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
    ctx.showWarningToast(
      '필수 값 누락',
      errors.length === 1 ? errors[0].message : `${errors.length}개의 필수 값을 확인해주세요.`,
    );
    scrollToValidationField(errors[0].field);
    ctx.setStatus('필수 값 누락');
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
    clearFileNameConflictError,
    scheduleTransientErrorClear,
    markFileNameConflictError,
    isTargetFileExistsError,
    collectValidationErrors,
    validateSpecBeforeSave,
  };
};
