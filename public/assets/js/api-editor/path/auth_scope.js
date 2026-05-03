import { splitPathPart } from '../path.js';

export const createPathAuthScopeRuntime = (ctx) => {
  const { form, state } = ctx;

  const input = (...args) => ctx.input(...args);
  const getPathSegments = (...args) => ctx.getPathSegments(...args);
  const getPathActionSegments = (...args) => ctx.getPathActionSegments(...args);

  const getAuthPolicyScopeOptions = () => {
    const pathSegments = getPathSegments();
    const actionSegments = getPathActionSegments();

    return ctx.AUTH_POLICY_SCOPES.map((scope) => {
      const isRoot = scope.segmentCount === 0;
      const segmentCount = scope.value === 'action' ? pathSegments.length : scope.segmentCount;
      const scopeSegments = isRoot ? [] : pathSegments.slice(0, segmentCount);
      const hasEnoughSegments = isRoot || scopeSegments.length === segmentCount;
      const hasAction = scope.value !== 'action' || actionSegments.length > 0;
      const enabled = hasEnoughSegments && hasAction;
      const path = enabled && scopeSegments.length > 0 ? `/${scopeSegments.join('/')}` : '/';

      return {
        ...scope,
        enabled,
        path,
      };
    });
  };

  const getDefaultAuthPolicyScope = (options = getAuthPolicyScopeOptions()) =>
    [...options].reverse().find((option) => option.enabled) ||
    options[0];

  const getSelectedAuthPolicyScopeOption = () => {
    const options = getAuthPolicyScopeOptions();
    if (!ctx.isAuthPolicyScopeManuallySelected) return getDefaultAuthPolicyScope(options);

    const selectedValue = input('authPolicyScope');
    const selectedOption = options.find((option) => option.value === selectedValue && option.enabled);
    return selectedOption || getDefaultAuthPolicyScope(options);
  };

  const parseAuthPolicyScopeValue = (value) => {
    const text = ctx.blankIfPlaceholder(value);
    if (!text) return '';

    const valueMatch = text.match(/\b(root|base|middle|subCategory|action)\b/i);
    if (valueMatch) {
      const normalizedScope = ctx.normalizeAuthPolicyScope(valueMatch[1]);
      if (ctx.AUTH_POLICY_SCOPE_SET.has(normalizedScope)) return normalizedScope;
    }

    const labelScope = ctx.AUTH_POLICY_SCOPES.find((scope) => text.includes(scope.label));
    return labelScope?.value || '';
  };

  const selectAuthPolicyScopeByValue = (value) => {
    const scopeValue = parseAuthPolicyScopeValue(value);
    if (!scopeValue) return null;

    const scopeOption = getAuthPolicyScopeOptions().find((option) => option.value === scopeValue && option.enabled);
    if (!scopeOption) return null;

    form.elements.authPolicyScope.value = scopeOption.value;
    return scopeOption;
  };

  const getAuthPolicyPathChain = (path) => {
    const segments = splitPathPart(path);
    const chain = ['/'];
    segments.forEach((_, index) => {
      chain.push(`/${segments.slice(0, index + 1).join('/')}`);
    });
    return chain;
  };

  const resolveAuthPolicyFromPolicyMap = (policies, path, options = {}) => {
    const { includeSelf = true } = options;
    const normalizedPath = ctx.normalizeAuthPolicyPath(path);
    const chain = includeSelf
      ? getAuthPolicyPathChain(normalizedPath)
      : getAuthPolicyPathChain(normalizedPath).slice(0, -1);
    const resolved = {};
    const roleMap = new Map();
    let sourcePath = '';

    chain.forEach((policyPath) => {
      const policy = policies[policyPath];
      if (!policy) return;

      if (Object.hasOwn(policy, 'roles')) {
        policy.roles.forEach((role) => roleMap.set(role, role));
        resolved.roles = [...roleMap.values()];
        sourcePath = policyPath;
      }
    });

    return sourcePath ? { policy: resolved, sourcePath, targetPath: normalizedPath } : null;
  };

  const resolveAuthPolicyForPath = (path) =>
    resolveAuthPolicyFromPolicyMap(state.authPolicies.policies, path);

  const getParentAuthPolicyPath = (path) => {
    const segments = splitPathPart(ctx.normalizeAuthPolicyPath(path));
    if (segments.length === 0) return '';
    if (segments.length === 1) return '/';
    return `/${segments.slice(0, -1).join('/')}`;
  };

  const resolveParentAuthPolicyForPath = (path) => {
    const parentPath = getParentAuthPolicyPath(path);
    return parentPath ? resolveAuthPolicyForPath(parentPath) : null;
  };

  const renderAuthPolicyScopes = () => {
    if (!ctx.authPolicyScopeGrid) return;

    const options = getAuthPolicyScopeOptions();
    const selectedOption = getSelectedAuthPolicyScopeOption();
    if (selectedOption && form.elements.authPolicyScope.value !== selectedOption.value) {
      form.elements.authPolicyScope.value = selectedOption.value;
    }

    options.forEach((option) => {
      const card = ctx.authPolicyScopeGrid.querySelector(`[data-auth-policy-scope-card="${option.value}"]`);
      if (!card) return;

      const inputElement = card.querySelector('input');
      const pathElement = card.querySelector(`[data-auth-policy-scope-path="${option.value}"]`);
      const directPolicy = option.enabled ? state.authPolicies.policies[option.path] : null;
      const hasDirectRoles = Boolean(directPolicy?.roles?.length);

      if (inputElement) {
        inputElement.disabled = !option.enabled;
        inputElement.checked = option.value === selectedOption?.value;
      }
      if (pathElement) {
        pathElement.textContent = option.enabled ? option.path : '-';
      }
      card.classList.toggle('disabled', !option.enabled);
      card.classList.toggle('has-auth-roles', hasDirectRoles);
      card.title = option.enabled ? option.path : 'Path 구성 값을 먼저 입력하세요.';
    });
  };

  return {
    getAuthPolicyScopeOptions,
    getDefaultAuthPolicyScope,
    getSelectedAuthPolicyScopeOption,
    parseAuthPolicyScopeValue,
    selectAuthPolicyScopeByValue,
    getAuthPolicyPathChain,
    resolveAuthPolicyFromPolicyMap,
    resolveAuthPolicyForPath,
    getParentAuthPolicyPath,
    resolveParentAuthPolicyForPath,
    renderAuthPolicyScopes,
  };
};
