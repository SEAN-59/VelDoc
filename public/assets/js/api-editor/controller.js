// Mechanical API editor controller from the v1.1.0 monolith.
// Keep this behavior-identical until the second refactor pass.
export const createControllerRuntime = (ctx) => {
  const {
    CUSTOM_AUTH_SCHEME,
    addErrorStatusButton,
    addSuccessStatusButton,
    appShell,
    authPolicyScopeGrid,
    authRequiredToggle,
    authRoleAddButton,
    authRoleInput,
    copyButton,
    deleteDocumentButton,
    emptyNewDocumentButton,
    filePanelBackdrop,
    filePanelRail,
    floatingMenu,
    folderViewerButton,
    form,
    helpButton,
    helpDialog,
    helpDialogCloseButton,
    helpTopicButtons,
    menuBackdrop,
    menuButton,
    messageDialog,
    messageDialogCancelButton,
    messageDialogCloseButton,
    newDocumentButton,
    previewToggleButton,
    resetButton,
    rowDefinitions,
    saveButton,
    saveDropdown,
    saveMenuButton,
    sideMenuResizer,
    state,
    topButton,
  } = ctx;

  const addAuthRole = (...args) => ctx.addAuthRole(...args);
  const addErrorPreset = (...args) => ctx.addErrorPreset(...args);
  const addErrorResponse = (...args) => ctx.addErrorResponse(...args);
  const addHeaderPreset = (...args) => ctx.addHeaderPreset(...args);
  const addRow = (...args) => ctx.addRow(...args);
  const addSuccessResponse = (...args) => ctx.addSuccessResponse(...args);
  const adjustSideMenuFromKeyboard = (...args) => ctx.adjustSideMenuFromKeyboard(...args);
  const clearFileNameConflictError = (...args) => ctx.clearFileNameConflictError(...args);
  const clearSuccessStatusError = (...args) => ctx.clearSuccessStatusError(...args);
  const clearValidationFieldError = (...args) => ctx.clearValidationFieldError(...args);
  const closeActionDropdowns = (...args) => ctx.closeActionDropdowns(...args);
  const closeMessageDialog = (...args) => ctx.closeMessageDialog(...args);
  const copyMarkdown = (...args) => ctx.copyMarkdown(...args);
  const createNewDocument = (...args) => ctx.createNewDocument(...args);
  const deleteCurrentDocument = (...args) => ctx.deleteCurrentDocument(...args);
  const getActiveSuccessResponse = (...args) => ctx.getActiveSuccessResponse(...args);
  const getActiveErrorResponse = (...args) => ctx.getActiveErrorResponse(...args);
  const getHeaderPreset = (...args) => ctx.getHeaderPreset(...args);
  const hasDuplicateErrorResponse = (...args) => ctx.hasDuplicateErrorResponse(...args);
  const hasDuplicateSuccessStatus = (...args) => ctx.hasDuplicateSuccessStatus(...args);
  const hideMessageDialog = (...args) => ctx.hideMessageDialog(...args);
  const isAuthRequired = (...args) => ctx.isAuthRequired(...args);
  const isDropdownOpen = (...args) => ctx.isDropdownOpen(...args);
  const isFloatingMenuOpen = (...args) => ctx.isFloatingMenuOpen(...args);
  const loadDraft = (...args) => ctx.loadDraft(...args);
  const moveSideMenuResize = (...args) => ctx.moveSideMenuResize(...args);
  const openFilePanelFromRail = (...args) => ctx.openFilePanelFromRail(...args);
  const openFolderViewer = (...args) => ctx.openFolderViewer(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const renderActionPathParams = (...args) => ctx.renderActionPathParams(...args);
  const renderRows = (...args) => ctx.renderRows(...args);
  const renderErrorStatusTabs = (...args) => ctx.renderErrorStatusTabs(...args);
  const renderSuccessStatusTabs = (...args) => ctx.renderSuccessStatusTabs(...args);
  const resetForm = (...args) => ctx.resetForm(...args);
  const resizeJsonPreview = (...args) => ctx.resizeJsonPreview(...args);
  const restoreOpenedFolder = (...args) => ctx.restoreOpenedFolder(...args);
  const restoreSideMenuWidth = (...args) => ctx.restoreSideMenuWidth(...args);
  const sanitizeErrorStatusValue = (...args) => ctx.sanitizeErrorStatusValue(...args);
  const sanitizeSuccessStatusValue = (...args) => ctx.sanitizeSuccessStatusValue(...args);
  const saveMarkdown = (...args) => ctx.saveMarkdown(...args);
  const saveMarkdownAsNew = (...args) => ctx.saveMarkdownAsNew(...args);
  const scrollPageToTop = (...args) => ctx.scrollPageToTop(...args);
  const setDropdownOpen = (...args) => ctx.setDropdownOpen(...args);
  const setFileDrawerOpen = (...args) => ctx.setFileDrawerOpen(...args);
  const setFloatingMenuOpen = (...args) => ctx.setFloatingMenuOpen(...args);
  const setHelpDialogOpen = (...args) => ctx.setHelpDialogOpen(...args);
  const setHelpTopic = (...args) => ctx.setHelpTopic(...args);
  const setPreviewOpen = (...args) => ctx.setPreviewOpen(...args);
  const showSuccessStatusError = (...args) => ctx.showSuccessStatusError(...args);
  const showWarningToast = (...args) => ctx.showWarningToast(...args);
  const startSideMenuResize = (...args) => ctx.startSideMenuResize(...args);
  const stopSideMenuResize = (...args) => ctx.stopSideMenuResize(...args);
  const syncAuthRolesForSelectedScope = (...args) => ctx.syncAuthRolesForSelectedScope(...args);
  const syncFilePanelLayoutMode = (...args) => ctx.syncFilePanelLayoutMode(...args);
  const syncHeaderRowsAndRefresh = (...args) => ctx.syncHeaderRowsAndRefresh(...args);
  const syncHeaderRowsWithControls = (...args) => ctx.syncHeaderRowsWithControls(...args);
  const toggleFloatingMenu = (...args) => ctx.toggleFloatingMenu(...args);

  const closeFloatingMenuOnOutsideAction = (event) => {
    if (!isFloatingMenuOpen()) return;
    const target = event.target;
    if (floatingMenu?.contains(target) || menuButton?.contains(target)) return;
    setFloatingMenuOpen(false);
  };

  const togglePreviewPanel = () => {
    const isOpen = !appShell?.classList.contains('preview-closed');
    setPreviewOpen(!isOpen);
  };

  const bindPresetButtons = () => {
    document.querySelectorAll('[data-add-row]').forEach((button) => {
      button.addEventListener('click', () => addRow(button.dataset.addRow, {}, { focusNewRow: true }));
    });
    document.querySelectorAll('[data-header-preset]').forEach((button) => {
      const preset = getHeaderPreset(button.dataset.headerPreset);
      if (preset) {
        button.dataset.tooltip = `용도: ${preset.description}\n누락 시: ${preset.risk}`;
        button.setAttribute('aria-label', `${preset.key} 헤더 추가. 용도: ${preset.description}. 누락 시: ${preset.risk}`);
      }
      button.addEventListener('click', () => addHeaderPreset(button.dataset.headerPreset));
    });
    document.querySelectorAll('[data-error-preset]').forEach((button) => {
      button.addEventListener('click', () => addErrorPreset(button.dataset.errorPreset));
    });
  };

  const bindAuthControls = () => {
    authRequiredToggle?.addEventListener('click', () => {
      const wasRequired = isAuthRequired();
      form.elements.authRequired.value = wasRequired ? '불필요' : '필요';
      syncHeaderRowsAndRefresh({ allowAuthorization: !wasRequired });
    });
    form.querySelectorAll('input[name="method"]').forEach((element) => {
      element.addEventListener('change', () => {
        clearValidationFieldError('method');
        syncHeaderRowsAndRefresh();
      });
    });
    form.querySelectorAll('input[name="authScheme"]').forEach((element) => {
      element.addEventListener('change', syncHeaderRowsAndRefresh);
    });
    form.elements.authSchemeCustom?.addEventListener('focus', () => {
      if (form.elements.authScheme.value !== CUSTOM_AUTH_SCHEME) {
        form.elements.authScheme.value = CUSTOM_AUTH_SCHEME;
        syncHeaderRowsAndRefresh();
      }
    });
    form.elements.authSchemeCustom?.addEventListener('input', () => {
      if (form.elements.authScheme.value !== CUSTOM_AUTH_SCHEME) {
        form.elements.authScheme.value = CUSTOM_AUTH_SCHEME;
        syncHeaderRowsWithControls({ render: true });
      }
    });
    authRoleAddButton?.addEventListener('click', addAuthRole);
    authRoleInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      addAuthRole();
    });
    authPolicyScopeGrid?.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'authPolicyScope') return;
      event.stopPropagation();
      ctx.isAuthPolicyScopeManuallySelected = true;
      syncAuthRolesForSelectedScope();
      refresh({ shouldSaveDraft: false });
    });
  };

  const bindShellControls = () => {
    menuButton?.addEventListener('click', () => {
      toggleFloatingMenu();
    });
    floatingMenu?.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        setFloatingMenuOpen(false);
      });
    });
    ['pointerdown', 'click'].forEach((eventName) => {
      menuBackdrop?.addEventListener(eventName, () => setFloatingMenuOpen(false));
    });
    filePanelRail?.addEventListener('click', openFilePanelFromRail);
    filePanelBackdrop?.addEventListener('click', () => setFileDrawerOpen(false));
    sideMenuResizer?.addEventListener('pointerdown', startSideMenuResize);
    sideMenuResizer?.addEventListener('keydown', adjustSideMenuFromKeyboard);
    window.addEventListener('pointermove', moveSideMenuResize);
    window.addEventListener('pointerup', stopSideMenuResize);
    window.addEventListener('pointercancel', stopSideMenuResize);
    topButton?.addEventListener('click', () => scrollPageToTop('smooth'));
    folderViewerButton?.addEventListener('click', openFolderViewer);
  };

  const bindDialogControls = () => {
    messageDialogCancelButton?.addEventListener('click', () => closeMessageDialog(false));
    messageDialogCloseButton?.addEventListener('click', () => closeMessageDialog(ctx.messageDialogMode === 'confirm'));
    messageDialog?.addEventListener('click', (event) => {
      if (event.target === messageDialog) hideMessageDialog();
    });
  };

  const bindGlobalDismissControls = () => {
    document.addEventListener('pointerdown', closeFloatingMenuOnOutsideAction, true);
    document.addEventListener('click', closeFloatingMenuOnOutsideAction, true);
    document.addEventListener('pointerdown', (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('#saveSplitButton')) return;
      closeActionDropdowns();
    });
  };

  const bindPathControls = () => {
    form.elements.pathAction?.addEventListener('input', () => {
      clearFileNameConflictError();
      if (ctx.isSyncingActionPathParamKey) return;
      renderActionPathParams();
      syncAuthRolesForSelectedScope();
    });
    form.elements.apiName?.addEventListener('input', () => clearValidationFieldError('apiName'));
    ['pathBase', 'pathVersion', 'pathSubCategory'].forEach((name) => {
      form.elements[name]?.addEventListener('input', () => {
        clearFileNameConflictError();
        syncAuthRolesForSelectedScope();
      });
    });
  };

  const bindSuccessStatusControls = () => {
    form.elements.successStatus?.addEventListener('focus', () => {
      ctx.successStatusPreviousValue = getActiveSuccessResponse().status || '200';
    });

    form.elements.successStatus?.addEventListener('input', (event) => {
      const nextStatus = sanitizeSuccessStatusValue(form.elements.successStatus.value);
      form.elements.successStatus.value = nextStatus;
      event.stopPropagation();
      clearSuccessStatusError();
    });

    form.elements.successStatus?.addEventListener('change', (event) => {
      const nextStatus = sanitizeSuccessStatusValue(form.elements.successStatus.value) || '200';
      form.elements.successStatus.value = nextStatus;
      event.stopPropagation();
      if (hasDuplicateSuccessStatus(nextStatus)) {
        form.elements.successStatus.value = ctx.successStatusPreviousValue;
        getActiveSuccessResponse().status = ctx.successStatusPreviousValue;
        refresh();
        showSuccessStatusError(`${nextStatus} 상태는 이미 등록되어 있습니다.`);
        return;
      }
      clearSuccessStatusError();
      getActiveSuccessResponse().status = nextStatus;
      ctx.successStatusPreviousValue = nextStatus;
      refresh();
    });

    addSuccessStatusButton?.addEventListener('click', addSuccessResponse);
  };

  const bindErrorStatusControls = () => {
    form.elements.errorStatus?.addEventListener('focus', () => {
      ctx.errorStatusPreviousValue = getActiveErrorResponse().status || '400';
    });

    form.elements.errorStatus?.addEventListener('input', (event) => {
      const nextStatus = sanitizeErrorStatusValue(form.elements.errorStatus.value);
      form.elements.errorStatus.value = nextStatus;
      event.stopPropagation();
    });

    form.elements.errorStatus?.addEventListener('change', (event) => {
      const response = getActiveErrorResponse();
      const nextStatus = sanitizeErrorStatusValue(form.elements.errorStatus.value) || '400';
      form.elements.errorStatus.value = nextStatus;
      event.stopPropagation();
      if (hasDuplicateErrorResponse(nextStatus)) {
        form.elements.errorStatus.value = ctx.errorStatusPreviousValue;
        response.status = ctx.errorStatusPreviousValue;
        refresh();
        showWarningToast('Error 상태 중복', `${nextStatus} 상태가 이미 있습니다.`);
        return;
      }
      response.status = nextStatus;
      ctx.errorStatusPreviousValue = nextStatus;
      renderErrorStatusTabs();
      refresh();
    });

    form.elements.errorCode?.addEventListener('input', () => {
      const response = getActiveErrorResponse();
      response.code = form.elements.errorCode.value;
      renderErrorStatusTabs();
    });
    form.elements.errorMessage?.addEventListener('input', () => {
      getActiveErrorResponse().message = form.elements.errorMessage.value;
    });
    form.elements.errorCondition?.addEventListener('input', () => {
      getActiveErrorResponse().condition = form.elements.errorCondition.value;
    });

    addErrorStatusButton?.addEventListener('click', addErrorResponse);
  };

  const bindHelpControls = () => {
    helpButton?.addEventListener('click', () => setHelpDialogOpen(true));
    helpDialogCloseButton?.addEventListener('click', () => setHelpDialogOpen(false));
    helpDialog?.addEventListener('click', (event) => {
      if (event.target === helpDialog) setHelpDialogOpen(false);
    });
    helpTopicButtons.forEach((button) => {
      button.addEventListener('click', () => setHelpTopic(button.dataset.helpTopic));
    });
  };

  const bindKeyboardShortcuts = () => {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const code = event.code;
      const hasPrimaryModifier = (event.metaKey || event.ctrlKey) && !event.altKey;
      const isSaveShortcut = hasPrimaryModifier && key === 's';
      const isNewDocumentShortcut = hasPrimaryModifier && key === 'd';
      const isPreviewShortcut = event.altKey && !event.metaKey && !event.ctrlKey && code === 'KeyV';
      const isResetShortcut = event.altKey && !event.metaKey && !event.ctrlKey && code === 'KeyR';
      if (isSaveShortcut) {
        event.preventDefault();
        event.stopPropagation();
        closeActionDropdowns();

        if (ctx.isSaveShortcutRunning) return;
        ctx.isSaveShortcutRunning = true;
        saveMarkdown().finally(() => {
          ctx.isSaveShortcutRunning = false;
        });
        return;
      }
      if (isNewDocumentShortcut) {
        event.preventDefault();
        event.stopPropagation();
        closeActionDropdowns();
        createNewDocument();
        return;
      }
      if (isPreviewShortcut) {
        event.preventDefault();
        event.stopPropagation();
        closeActionDropdowns();
        togglePreviewPanel();
        return;
      }
      if (isResetShortcut) {
        event.preventDefault();
        event.stopPropagation();
        closeActionDropdowns();
        resetForm();
        return;
      }

      if (event.key === 'Escape' && helpDialog && !helpDialog.hidden) {
        setHelpDialogOpen(false);
        return;
      }
      if (event.key === 'Escape' && isDropdownOpen(saveDropdown)) {
        closeActionDropdowns();
        return;
      }
      if (event.key === 'Escape' && messageDialog && !messageDialog.hidden) {
        hideMessageDialog();
        return;
      }
      if (event.key === 'Escape' && state.fileDrawerOpen) {
        setFileDrawerOpen(false);
        filePanelRail?.focus();
        return;
      }
      if (event.key === 'Escape' && isFloatingMenuOpen()) {
        setFloatingMenuOpen(false);
        menuButton?.focus();
      }
    });
  };

  const bindWindowLifecycle = () => {
    window.addEventListener('resize', () => {
      syncFilePanelLayoutMode();
      resizeJsonPreview(form.elements.bodyJson);
      resizeJsonPreview(form.elements.successJson);
      resizeJsonPreview(form.elements.errorJson);
    });

    window.addEventListener('beforeunload', () => scrollPageToTop('auto'));
    window.addEventListener('pageshow', () => {
      window.requestAnimationFrame(() => scrollPageToTop('auto'));
    });
  };

  const bindDocumentActionControls = () => {
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    saveButton.addEventListener('click', saveMarkdown);
    copyButton.addEventListener('click', copyMarkdown);
    previewToggleButton?.addEventListener('click', togglePreviewPanel);
    resetButton.addEventListener('click', resetForm);
    deleteDocumentButton?.addEventListener('click', deleteCurrentDocument);
    newDocumentButton?.addEventListener('click', createNewDocument);
    emptyNewDocumentButton?.addEventListener('click', createNewDocument);
    saveMenuButton?.addEventListener('click', (event) => {
      if (saveMenuButton.disabled) return;
      event.stopPropagation();
      const nextOpen = !isDropdownOpen(saveDropdown);
      setDropdownOpen(saveMenuButton, saveDropdown, nextOpen);
    });
    saveDropdown?.querySelectorAll('[data-save-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (button.disabled) return;
        closeActionDropdowns();
        if (button.dataset.saveAction === 'new') {
          await saveMarkdownAsNew();
          return;
        }
        await saveMarkdown();
      });
    });
  };

  const initializeEditor = () => {
    restoreSideMenuWidth();
    syncFilePanelLayoutMode();
    loadDraft();
    syncHeaderRowsWithControls();
    Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
    renderSuccessStatusTabs();
    renderErrorStatusTabs();
    renderActionPathParams();
    refresh();
    restoreOpenedFolder();
    window.requestAnimationFrame(() => scrollPageToTop('auto'));
  };

  bindPresetButtons();
  bindAuthControls();
  bindShellControls();
  bindDialogControls();
  bindGlobalDismissControls();
  bindPathControls();
  bindSuccessStatusControls();
  bindErrorStatusControls();
  bindHelpControls();
  bindKeyboardShortcuts();
  bindWindowLifecycle();
  bindDocumentActionControls();
  initializeEditor();

  ctx.closeFloatingMenuOnOutsideAction = closeFloatingMenuOnOutsideAction;
  ctx.togglePreviewPanel = togglePreviewPanel;

  return {
    closeFloatingMenuOnOutsideAction,
    togglePreviewPanel,
  };
};
