export const createPathFormStateRuntime = (ctx) => {
  const { form } = ctx;

  const input = (...args) => ctx.input(...args);

  const checkedValues = (name) =>
    [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((item) => item.value);

  const isQueryParamsEnabled = () => input('method') !== 'POST';

  const isBodyEnabled = () => ctx.BODY_API_METHOD_SET.has(input('method'));

  const syncMethodState = () => {
    if (ctx.queryParamsSection) {
      ctx.queryParamsSection.hidden = !isQueryParamsEnabled();
    }
    if (ctx.bodySection) {
      ctx.bodySection.hidden = !isBodyEnabled();
    }
  };

  const isAuthRequired = () => input('authRequired') !== '불필요';

  const syncAuthState = () => {
    const required = isAuthRequired();
    ctx.authTopGrid?.classList.toggle('auth-not-required', !required);
    if (ctx.authRequiredToggle) {
      ctx.authRequiredToggle.textContent = required ? '필요' : '불필요';
      ctx.authRequiredToggle.classList.toggle('active', required);
      ctx.authRequiredToggle.setAttribute('aria-pressed', required ? 'true' : 'false');
    }
    if (ctx.authPolicyScopeField) {
      ctx.authPolicyScopeField.hidden = !required;
      ctx.authPolicyScopeField.querySelectorAll('input, button').forEach((element) => {
        element.tabIndex = required ? 0 : -1;
      });
    }
    if (ctx.authDetails) {
      ctx.authDetails.classList.toggle('collapsed', !required);
      ctx.authDetails.setAttribute('aria-hidden', required ? 'false' : 'true');
      ctx.authDetails.querySelectorAll('input, select, textarea, button').forEach((element) => {
        element.tabIndex = required ? 0 : -1;
      });
    }
  };

  return {
    checkedValues,
    isQueryParamsEnabled,
    isBodyEnabled,
    syncMethodState,
    isAuthRequired,
    syncAuthState,
  };
};
