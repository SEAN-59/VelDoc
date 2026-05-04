export const createAuthRolesRuntime = (ctx) => {
  const {
    authRoleGrid,
    state,
  } = ctx;

  const buildApiPath = (...args) => ctx.buildApiPath(...args);
  const getAuthPolicyPathChain = (...args) => ctx.getAuthPolicyPathChain(...args);
  const getSelectedAuthPolicyScopeOption = (...args) => ctx.getSelectedAuthPolicyScopeOption(...args);
  const resolveParentAuthPolicyForPath = (...args) => ctx.resolveParentAuthPolicyForPath(...args);
  const normalizeAuthPolicyPath = (...args) => ctx.normalizeAuthPolicyPath(...args);
  const normalizeAuthPolicyRecord = (...args) => ctx.normalizeAuthPolicyRecord(...args);
  const normalizeAuthPolicies = (...args) => ctx.normalizeAuthPolicies(...args);
  const renderAuthRoles = (...args) => ctx.renderAuthRoles(...args);

  let
    normalizeRoleValue,
    getAuthRoleItems,
    normalizeAuthRoleRenderItems,
    getCheckedRoleValuesFromItems,
    mergeAuthRoleValues,
    findAuthRoleOriginPathForScope,
    resolveAuthRoleOriginForScope,
    rememberAuthSelectedRoles,
    forgetAuthSelectedRole,
    getAuthRoleCatalogForPath,
    isAuthRoleVisibleAtScopePath,
    ensureAuthPolicyRolesFromOrigins,
    stageAuthPolicyForScopeFromVisibleCards,
    syncAuthRoleSelectionMemoryFromVisibleCards,
    sortAuthRolesByScopeOrder,
    isAuthRoleSelectedRoleAvailableForScope,
    getSelectedAuthRolesForScope,
    createAuthRoleItemsWithCatalog,
    syncAuthRolesForSelectedScope,
    collectAuthPolicyFromForm;

  
  ctx.normalizeRoleValue = normalizeRoleValue = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

  
  ctx.getAuthRoleItems = getAuthRoleItems = () =>
    [...authRoleGrid?.querySelectorAll('[data-auth-role-card]') || []].map((card) => {
      const checkbox = card.querySelector('input[name="roles"]');
      return {
        value: checkbox?.value || '',
        checked: Boolean(checkbox?.checked),
      };
    }).filter((item) => item.value);

  
  ctx.normalizeAuthRoleRenderItems = normalizeAuthRoleRenderItems = (roleItems = []) => {
    const seen = new Set();
    const items = [];

    roleItems.forEach((roleItem) => {
      const value = normalizeRoleValue(typeof roleItem === 'string' ? roleItem : roleItem.value);
      if (!value || seen.has(value)) return;
      seen.add(value);
      items.push({
        value,
        checked: typeof roleItem === 'string' ? true : roleItem.checked !== false,
      });
    });

    return items;
  };

  
  ctx.getCheckedRoleValuesFromItems = getCheckedRoleValuesFromItems = (roleItems = []) =>
    normalizeAuthRoleRenderItems(roleItems)
      .filter((roleItem) => roleItem.checked)
      .map((roleItem) => roleItem.value);

  
  ctx.mergeAuthRoleValues = mergeAuthRoleValues = (...roleGroups) => {
    const seen = new Set();
    const roles = [];

    roleGroups.flat().forEach((role) => {
      const value = normalizeRoleValue(role);
      if (!value || seen.has(value)) return;
      seen.add(value);
      roles.push(value);
    });

    return roles;
  };

  
  ctx.findAuthRoleOriginPathForScope = findAuthRoleOriginPathForScope = (role, path = buildApiPath()) => {
    const normalizedRole = normalizeRoleValue(role);
    if (!normalizedRole) return '';

    const chain = getAuthPolicyPathChain(normalizeAuthPolicyPath(path));
    return chain.find((policyPath) => {
      const policy = state.authPolicies.policies[policyPath];
      return (policy?.roles || []).some((policyRole) => normalizeRoleValue(policyRole) === normalizedRole);
    }) || '';
  };

  
  ctx.resolveAuthRoleOriginForScope = resolveAuthRoleOriginForScope = (role, path = buildApiPath()) => {
    const normalizedRole = normalizeRoleValue(role);
    if (!normalizedRole) return '';

    const scopePath = normalizeAuthPolicyPath(path);
    const policyOriginPath = findAuthRoleOriginPathForScope(normalizedRole, scopePath);
    const selectedOriginPath = state.authSelectedRoleOrigins[normalizedRole]
      ? normalizeAuthPolicyPath(state.authSelectedRoleOrigins[normalizedRole])
      : '';

    return policyOriginPath || selectedOriginPath || scopePath;
  };


  ctx.rememberAuthSelectedRoles = rememberAuthSelectedRoles = (roles = [], options = {}) => {
    const scopePath = normalizeAuthPolicyPath(options.scopePath || state.authRoleVisibleScopePath || buildApiPath());
    const selectedRoles = mergeAuthRoleValues(roles);
    const selectedRoleSet = new Set(selectedRoles);
    const nextOrigins = {};

    selectedRoles.forEach((role) => {
      nextOrigins[role] = resolveAuthRoleOriginForScope(role, scopePath);
    });

    Object.keys(state.authSelectedRoleOrigins).forEach((role) => {
      if (selectedRoleSet.has(role) && !nextOrigins[role]) nextOrigins[role] = state.authSelectedRoleOrigins[role];
    });

    state.authSelectedRoles = selectedRoles;
    state.authSelectedRoleOrigins = nextOrigins;
    return state.authSelectedRoles;
  };

  
  ctx.forgetAuthSelectedRole = forgetAuthSelectedRole = (role) => {
    const normalizedRole = normalizeRoleValue(role);
    if (!normalizedRole) return;

    state.authSelectedRoles = state.authSelectedRoles.filter((selectedRole) => selectedRole !== normalizedRole);
    delete state.authSelectedRoleOrigins[normalizedRole];
  };

  
  ctx.getAuthRoleCatalogForPath = getAuthRoleCatalogForPath = (path) => {
    const roles = [];

    getAuthPolicyPathChain(normalizeAuthPolicyPath(path)).forEach((policyPath) => {
      const policy = state.authPolicies.policies[policyPath];
      if (!policy) return;
      roles.push(...(policy.roles || []));
    });

    return mergeAuthRoleValues(roles);
  };

  
  ctx.isAuthRoleVisibleAtScopePath = isAuthRoleVisibleAtScopePath = (role, path = buildApiPath()) => {
    const normalizedRole = normalizeRoleValue(role);
    if (!normalizedRole) return false;

    if (getAuthRoleCatalogForPath(path).includes(normalizedRole)) return true;

    const rawOriginPath = state.authSelectedRoleOrigins[normalizedRole];
    if (!rawOriginPath) return false;

    const originPath = normalizeAuthPolicyPath(rawOriginPath);
    return Boolean(originPath && getAuthPolicyPathChain(normalizeAuthPolicyPath(path)).includes(originPath));
  };

  ctx.ensureAuthPolicyRolesFromOrigins = ensureAuthPolicyRolesFromOrigins = (roles = [], origins = {}, fallbackPath = buildApiPath()) => {
    const selectedRoles = mergeAuthRoleValues(roles);
    if (selectedRoles.length === 0) return false;

    const nextPolicies = normalizeAuthPolicies(state.authPolicies);
    let changed = false;

    selectedRoles.forEach((role) => {
      const originPath = normalizeAuthPolicyPath(origins[role] || fallbackPath);
      const policy = normalizeAuthPolicyRecord(nextPolicies.policies[originPath]);
      const policyRoles = mergeAuthRoleValues(policy.roles || []);
      if (policyRoles.includes(role)) return;

      policy.roles = mergeAuthRoleValues(policyRoles, role);
      nextPolicies.policies[originPath] = policy;
      changed = true;
    });

    if (changed) state.authPolicies = nextPolicies;
    return changed;
  };

  ctx.stageAuthPolicyForScopeFromVisibleCards = stageAuthPolicyForScopeFromVisibleCards = (scopePath = state.authRoleVisibleScopePath, options = {}) => {
    const { deleteWhenEmpty = false } = options;
    const normalizedScopePath = normalizeAuthPolicyPath(scopePath);
    if (!normalizedScopePath) return false;

    const nextPolicies = normalizeAuthPolicies(state.authPolicies);
    const nextPolicy = normalizeAuthPolicyRecord(collectAuthPolicyFromForm(normalizedScopePath));
    if ((nextPolicy.roles || []).length > 0) {
      nextPolicies.policies[normalizedScopePath] = nextPolicy;
    } else if (deleteWhenEmpty) {
      delete nextPolicies.policies[normalizedScopePath];
    }
    state.authPolicies = nextPolicies;
    return true;
  };

  
  ctx.syncAuthRoleSelectionMemoryFromVisibleCards = syncAuthRoleSelectionMemoryFromVisibleCards = (options = {}) => {
    const visibleItems = getAuthRoleItems();
    const visibleRoleSet = new Set(visibleItems.map((item) => item.value));
    const checkedVisibleRoles = visibleItems.filter((item) => item.checked).map((item) => item.value);
    const hiddenSelectedRoles = state.authSelectedRoles.filter((role) => !visibleRoleSet.has(role));

    stageAuthPolicyForScopeFromVisibleCards(state.authRoleVisibleScopePath, {
      deleteWhenEmpty: Boolean(options.deleteWhenEmpty),
    });
    rememberAuthSelectedRoles(mergeAuthRoleValues(hiddenSelectedRoles, checkedVisibleRoles), {
      scopePath: state.authRoleVisibleScopePath,
    });
  };

  
  ctx.sortAuthRolesByScopeOrder = sortAuthRolesByScopeOrder = (roles = [], path = buildApiPath()) => {
    const sortableRoles = mergeAuthRoleValues(roles);
    const sortableRoleSet = new Set(sortableRoles);
    const orderedRoles = [];
    const seen = new Set();

    const appendRole = (role) => {
      const value = normalizeRoleValue(role);
      if (!value || !sortableRoleSet.has(value) || seen.has(value)) return;
      seen.add(value);
      orderedRoles.push(value);
    };

    getAuthPolicyPathChain(normalizeAuthPolicyPath(path)).forEach((policyPath) => {
      const policy = state.authPolicies.policies[policyPath];
      (policy?.roles || []).forEach(appendRole);
      sortableRoles.forEach((role) => {
        const value = normalizeRoleValue(role);
        const originPath = state.authSelectedRoleOrigins[value]
          ? normalizeAuthPolicyPath(state.authSelectedRoleOrigins[value])
          : '';
        if (originPath === policyPath) appendRole(value);
      });
    });
    sortableRoles.forEach(appendRole);

    return orderedRoles;
  };

  
  ctx.isAuthRoleSelectedRoleAvailableForScope = isAuthRoleSelectedRoleAvailableForScope = (role, path = buildApiPath()) => {
    const normalizedRole = normalizeRoleValue(role);
    if (!normalizedRole) return false;
    if (isAuthRoleVisibleAtScopePath(normalizedRole, path)) return true;

    const hasSelectedOrigin = Boolean(state.authSelectedRoleOrigins[normalizedRole]);
    const hasPolicyOrigin = Boolean(findAuthRoleOriginPathForScope(normalizedRole, path));
    return !hasSelectedOrigin && !hasPolicyOrigin;
  };

  ctx.getSelectedAuthRolesForScope = getSelectedAuthRolesForScope = (path = buildApiPath()) => {
    syncAuthRoleSelectionMemoryFromVisibleCards();
    return sortAuthRolesByScopeOrder(
      state.authSelectedRoles.filter((role) => isAuthRoleVisibleAtScopePath(role, path)),
      path,
    );
  };

  
  ctx.createAuthRoleItemsWithCatalog = createAuthRoleItemsWithCatalog = (checkedRoles = [], path = buildApiPath()) => {
    const normalizedPath = normalizeAuthPolicyPath(path);
    const selectedRoles = mergeAuthRoleValues(checkedRoles)
      .filter((role) => isAuthRoleSelectedRoleAvailableForScope(role, normalizedPath));
    const selectedRoleSet = new Set(selectedRoles);

    return sortAuthRolesByScopeOrder(
      mergeAuthRoleValues(getAuthRoleCatalogForPath(normalizedPath), selectedRoles),
      normalizedPath,
    ).map((value) => ({
      value,
      checked: selectedRoleSet.has(value),
    }));
  };

  
  ctx.syncAuthRolesForSelectedScope = syncAuthRolesForSelectedScope = () => {
    syncAuthRoleSelectionMemoryFromVisibleCards();
    const scopeOption = getSelectedAuthPolicyScopeOption();
    const catalogPath = scopeOption?.path || buildApiPath();

    const scopedCheckedRoles = state.authSelectedRoles
      .filter((role) => isAuthRoleSelectedRoleAvailableForScope(role, catalogPath));
    renderAuthRoles(createAuthRoleItemsWithCatalog(scopedCheckedRoles, catalogPath), {
      scopePath: catalogPath,
      updateSelectionMemory: false,
    });
  };

  
  ctx.collectAuthPolicyFromForm = collectAuthPolicyFromForm = (scopeOptionOrPath = buildApiPath()) => {
    const scopePath = typeof scopeOptionOrPath === 'object'
      ? scopeOptionOrPath.path
      : scopeOptionOrPath;
    const policy = {};
    const catalogRoles = sortAuthRolesByScopeOrder(
      getAuthRoleItems().map((roleItem) => roleItem.value),
      scopePath,
    );
    const parentRoles = resolveParentAuthPolicyForPath(scopePath)?.policy?.roles || [];
    const parentRoleSet = new Set(parentRoles);

    const localRoles = catalogRoles.filter((role) => {
      if (parentRoleSet.has(role)) return false;

      const originPath = resolveAuthRoleOriginForScope(role, scopePath);
      return !originPath || originPath === scopePath;
    });
    if (localRoles.length > 0) policy.roles = localRoles;

    return policy;
  };

  return {
    normalizeRoleValue,
    getAuthRoleItems,
    normalizeAuthRoleRenderItems,
    getCheckedRoleValuesFromItems,
    mergeAuthRoleValues,
    findAuthRoleOriginPathForScope,
    resolveAuthRoleOriginForScope,
    rememberAuthSelectedRoles,
    forgetAuthSelectedRole,
    getAuthRoleCatalogForPath,
    isAuthRoleVisibleAtScopePath,
    ensureAuthPolicyRolesFromOrigins,
    stageAuthPolicyForScopeFromVisibleCards,
    syncAuthRoleSelectionMemoryFromVisibleCards,
    sortAuthRolesByScopeOrder,
    isAuthRoleSelectedRoleAvailableForScope,
    getSelectedAuthRolesForScope,
    createAuthRoleItemsWithCatalog,
    syncAuthRolesForSelectedScope,
    collectAuthPolicyFromForm,
  };
};
