export const createAuthRoleCardsRuntime = (ctx) => {
  const {
    authRoleAddCard,
    authRoleGrid,
    authRoleInput,
    state,
  } = ctx;

  const buildApiPath = (...args) => ctx.buildApiPath(...args);
  const getSelectedAuthPolicyScopeOption = (...args) => ctx.getSelectedAuthPolicyScopeOption(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const showAlertDialog = (...args) => ctx.showAlertDialog(...args);
  const showConfirmDialog = (...args) => ctx.showConfirmDialog(...args);
  const normalizeAuthPolicyPath = (...args) => ctx.normalizeAuthPolicyPath(...args);
  const normalizeRoleValue = (...args) => ctx.normalizeRoleValue(...args);
  const getAuthRoleItems = (...args) => ctx.getAuthRoleItems(...args);
  const normalizeAuthRoleRenderItems = (...args) => ctx.normalizeAuthRoleRenderItems(...args);
  const getCheckedRoleValuesFromItems = (...args) => ctx.getCheckedRoleValuesFromItems(...args);
  const findAuthRoleOriginPathForScope = (...args) => ctx.findAuthRoleOriginPathForScope(...args);
  const rememberAuthSelectedRoles = (...args) => ctx.rememberAuthSelectedRoles(...args);
  const forgetAuthSelectedRole = (...args) => ctx.forgetAuthSelectedRole(...args);
  const syncAuthRoleSelectionMemoryFromVisibleCards = (...args) => ctx.syncAuthRoleSelectionMemoryFromVisibleCards(...args);

  let
    getAuthRoleDeleteBlockMessage,
    createAuthRoleCard,
    renderAuthRoles,
    addAuthRole;

  
  ctx.getAuthRoleDeleteBlockMessage = getAuthRoleDeleteBlockMessage = (role) => {
    const normalizedRole = normalizeRoleValue(role);
    if (!normalizedRole) return '';

    const scopePath = normalizeAuthPolicyPath(
      state.authRoleVisibleScopePath ||
      getSelectedAuthPolicyScopeOption()?.path ||
      buildApiPath(),
    );
    const selectedOriginPath = state.authSelectedRoleOrigins[normalizedRole]
      ? normalizeAuthPolicyPath(state.authSelectedRoleOrigins[normalizedRole])
      : '';
    const policyOriginPath = findAuthRoleOriginPathForScope(normalizedRole, scopePath);
    const originPath = selectedOriginPath || policyOriginPath;

    if (!originPath || originPath === scopePath) return '';

    return `이 Role은 현재 적용 범위에서 만든 Role이 아닙니다.<br>${originPath} 적용 범위에서 상속된 Role이므로, 해당 범위에서 삭제해주세요.`;
  };

  
  ctx.createAuthRoleCard = createAuthRoleCard = (roleItem) => {
    const value = normalizeRoleValue(typeof roleItem === 'string' ? roleItem : roleItem.value);
    const checked = typeof roleItem === 'string' ? true : roleItem.checked !== false;

    const card = document.createElement('div');
    card.className = 'auth-role-card';
    card.dataset.authRoleCard = 'true';

    const label = document.createElement('label');
    label.className = 'auth-role-card-label';

    const checkbox = document.createElement('input');
    checkbox.name = 'roles';
    checkbox.type = 'checkbox';
    checkbox.value = value;
    checkbox.checked = checked;

    const text = document.createElement('span');
    text.textContent = value;

    const removeButton = document.createElement('button');
    removeButton.className = 'auth-role-remove-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', `${value} Role 삭제`);

    checkbox.addEventListener('change', () => {
      syncAuthRoleSelectionMemoryFromVisibleCards();
      refresh();
    });
    removeButton.addEventListener('click', async () => {
      const blockMessage = getAuthRoleDeleteBlockMessage(value);
      if (blockMessage) {
        await showAlertDialog('삭제할 수 없음', blockMessage);
        return;
      }

      const confirmed = await showConfirmDialog(
        'Role 삭제',
        '이 Role을 현재 적용 범위에서 삭제합니다.<br>다른 문서가 이 Role을 상속 중인 경우, 해당 문서의 권한 표시가 달라질 수 있습니다.',
        { confirmText: '삭제', cancelText: '취소' },
      );
      if (!confirmed) return;

      forgetAuthSelectedRole(value);
      card.remove();
      syncAuthRoleSelectionMemoryFromVisibleCards();
      refresh();
    });

    label.append(checkbox, text);
    card.append(label, removeButton);
    return card;
  };

  
  ctx.renderAuthRoles = renderAuthRoles = (roleItems = [], options = {}) => {
    if (!authRoleGrid || !authRoleAddCard) return;
    const {
      scopePath = getSelectedAuthPolicyScopeOption()?.path || buildApiPath(),
      updateSelectionMemory = true,
    } = options;
    const normalizedRoleItems = normalizeAuthRoleRenderItems(roleItems);

    authRoleGrid.querySelectorAll('[data-auth-role-card]').forEach((card) => card.remove());
    state.authRoleVisibleScopePath = normalizeAuthPolicyPath(scopePath);

    normalizedRoleItems.forEach((roleItem) => {
      authRoleGrid.append(createAuthRoleCard(roleItem));
    });

    if (updateSelectionMemory) {
      rememberAuthSelectedRoles(getCheckedRoleValuesFromItems(normalizedRoleItems), {
        scopePath: state.authRoleVisibleScopePath,
      });
    }
  };

  
  ctx.addAuthRole = addAuthRole = () => {
    const value = normalizeRoleValue(authRoleInput?.value);
    if (!value || !authRoleGrid || !authRoleAddCard) return;

    const existingRole = getAuthRoleItems().find((item) => item.value === value);
    if (existingRole) {
      authRoleGrid.querySelectorAll('input[name="roles"]').forEach((checkbox) => {
        if (checkbox.value === value) checkbox.checked = true;
      });
      authRoleInput.value = '';
      syncAuthRoleSelectionMemoryFromVisibleCards();
      refresh();
      return;
    }

    authRoleGrid.append(createAuthRoleCard({ value, checked: true }));
    authRoleInput.value = '';
    syncAuthRoleSelectionMemoryFromVisibleCards();
    refresh();
  };

  return {
    getAuthRoleDeleteBlockMessage,
    createAuthRoleCard,
    renderAuthRoles,
    addAuthRole,
  };
};
