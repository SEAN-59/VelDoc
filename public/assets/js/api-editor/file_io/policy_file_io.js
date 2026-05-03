export const createPolicyFileIoRuntime = (ctx) => {
  const {
    AUTH_POLICY_FILE_NAME,
    state,
  } = ctx;

  const buildApiPath = (...args) => ctx.buildApiPath(...args);
  const buildFileNameFromPath = (...args) => ctx.buildFileNameFromPath(...args);
  const collectAuthPolicyFromForm = (...args) => ctx.collectAuthPolicyFromForm(...args);
  const createDefaultAuthPolicies = (...args) => ctx.createDefaultAuthPolicies(...args);
  const getSelectedAuthPolicyScopeOption = (...args) => ctx.getSelectedAuthPolicyScopeOption(...args);
  const normalizeAuthPolicies = (...args) => ctx.normalizeAuthPolicies(...args);
  const normalizeAuthPolicyPath = (...args) => ctx.normalizeAuthPolicyPath(...args);
  const normalizeAuthPolicyRecord = (...args) => ctx.normalizeAuthPolicyRecord(...args);
  const normalizeFolderSpecFiles = (...args) => ctx.normalizeFolderSpecFiles(...args);
  const normalizeRelativeFilePath = (...args) => ctx.normalizeRelativeFilePath(...args);
  const pruneAuthPoliciesByFolderSpecFiles = (...args) => ctx.pruneAuthPoliciesByFolderSpecFiles(...args);
  const renderAuthPolicyScopes = (...args) => ctx.renderAuthPolicyScopes(...args);
  const showErrorToast = (...args) => ctx.showErrorToast(...args);
  const showWarningToast = (...args) => ctx.showWarningToast(...args);
  const stageAuthPolicyForScopeFromVisibleCards = (...args) => ctx.stageAuthPolicyForScopeFromVisibleCards(...args);
  const syncAuthRolesForSelectedScope = (...args) => ctx.syncAuthRolesForSelectedScope(...args);
  const ensureBrowserWritePermission = (...args) => ctx.ensureBrowserWritePermission(...args);
  const writeBrowserFile = (...args) => ctx.writeBrowserFile(...args);

  let
    readBrowserAuthPolicies,
    writeBrowserAuthPolicies,
    readServerAuthPolicies,
    writeServerAuthPolicies,
    loadAuthPoliciesForOpenedFolder,
    writeAuthPoliciesForOpenedFolder,
    getCurrentSpecFileForAuthPolicy,
    getFolderSpecFilesForAuthPolicySave,
    syncAuthPoliciesWithOpenedFolder,
    saveCurrentAuthPolicy;

  
  ctx.readBrowserAuthPolicies = readBrowserAuthPolicies = async () => {
  if (!state.browserDirectoryHandle) return createDefaultAuthPolicies();

  try {
    const policyFileHandle = await state.browserDirectoryHandle.getFileHandle(AUTH_POLICY_FILE_NAME);
    const policyFile = await policyFileHandle.getFile();
    return normalizeAuthPolicies(JSON.parse(await policyFile.text()));
  } catch {
    return createDefaultAuthPolicies();
  }
  };

  
  ctx.writeBrowserAuthPolicies = writeBrowserAuthPolicies = async (authPolicies) => {
  if (!state.browserDirectoryHandle) throw new Error('NO_BROWSER_FOLDER');
  if (!(await ensureBrowserWritePermission(state.browserDirectoryHandle))) {
    throw new Error('FILE_PERMISSION_DENIED');
  }

  const policyFileHandle = await state.browserDirectoryHandle.getFileHandle(AUTH_POLICY_FILE_NAME, { create: true });
  await writeBrowserFile(policyFileHandle, `${JSON.stringify(normalizeAuthPolicies(authPolicies), null, 2)}\n`);
  };

  
  ctx.readServerAuthPolicies = readServerAuthPolicies = async () => {
  try {
    const response = await fetch('/api/auth-policies');
    if (!response.ok) return createDefaultAuthPolicies();
    const result = await response.json();
    return normalizeAuthPolicies(result.authPolicies);
  } catch {
    return createDefaultAuthPolicies();
  }
  };

  
  ctx.writeServerAuthPolicies = writeServerAuthPolicies = async (authPolicies) => {
  const response = await fetch('/api/auth-policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authPolicies: normalizeAuthPolicies(authPolicies) }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || 'AUTH_POLICY_SAVE_FAILED');
  }
  };

  
  ctx.loadAuthPoliciesForOpenedFolder = loadAuthPoliciesForOpenedFolder = async () => {
  if (!state.fileTreeOpened) {
    state.authPolicies = createDefaultAuthPolicies();
    renderAuthPolicyScopes();
    return;
  }

  state.authPolicies = state.browserDirectoryHandle
    ? await readBrowserAuthPolicies()
    : await readServerAuthPolicies();
  await syncAuthPoliciesWithOpenedFolder();
  renderAuthPolicyScopes();
  syncAuthRolesForSelectedScope();
  };

  
  ctx.writeAuthPoliciesForOpenedFolder = writeAuthPoliciesForOpenedFolder = async (authPolicies) => {
  if (!state.fileTreeOpened) throw new Error('NO_OPENED_FOLDER');
  if (state.browserDirectoryHandle) {
    await writeBrowserAuthPolicies(authPolicies);
    return;
  }
  await writeServerAuthPolicies(authPolicies);
  };

  
  ctx.getCurrentSpecFileForAuthPolicy = getCurrentSpecFileForAuthPolicy = () => {
  if (!state.hasActiveDocument) return null;

  const apiPath = buildApiPath();
  if (!apiPath || apiPath === '미정') return null;

  const path = normalizeRelativeFilePath(
    state.currentFile?.path ||
    state.currentFile?.fileName ||
    buildFileNameFromPath(),
  );
  if (!path) return null;

  return {
    path,
    apiPath: normalizeAuthPolicyPath(apiPath),
  };
  };

  
  ctx.getFolderSpecFilesForAuthPolicySave = getFolderSpecFilesForAuthPolicySave = () => {
  const specFiles = normalizeFolderSpecFiles(state.folderSpecFiles);
  const currentSpecFile = getCurrentSpecFileForAuthPolicy();
  if (!currentSpecFile) return specFiles;

  return normalizeFolderSpecFiles([
    ...specFiles.filter((file) => file.path !== currentSpecFile.path),
    currentSpecFile,
  ]);
  };

  
  ctx.syncAuthPoliciesWithOpenedFolder = syncAuthPoliciesWithOpenedFolder = async (options = {}) => {
  const { shouldWrite = false } = options;
  if (!state.fileTreeOpened) return false;

  const { authPolicies, changed } = pruneAuthPoliciesByFolderSpecFiles(state.authPolicies);
  if (!changed) return false;

  try {
    if (shouldWrite) {
      await writeAuthPoliciesForOpenedFolder(authPolicies);
    }
    state.authPolicies = authPolicies;
    renderAuthPolicyScopes();
    return true;
  } catch {
    showWarningToast('권한 정책 정리 실패', `${AUTH_POLICY_FILE_NAME}을 현재 폴더의 문서 목록과 맞추지 못했습니다.`);
    return false;
  }
  };

  
  ctx.saveCurrentAuthPolicy = saveCurrentAuthPolicy = async () => {
  const scopeOption = getSelectedAuthPolicyScopeOption();
  if (!state.fileTreeOpened || !scopeOption?.enabled) return true;

  stageAuthPolicyForScopeFromVisibleCards(scopeOption.path);
  const nextPolicies = normalizeAuthPolicies(state.authPolicies);
  const nextPolicy = normalizeAuthPolicyRecord(collectAuthPolicyFromForm(scopeOption));
  if ((nextPolicy.roles || []).length > 0) {
    nextPolicies.policies[scopeOption.path] = nextPolicy;
  } else {
    delete nextPolicies.policies[scopeOption.path];
  }
  const specFilesForPrune = getFolderSpecFilesForAuthPolicySave();
  const { authPolicies } = pruneAuthPoliciesByFolderSpecFiles(nextPolicies, specFilesForPrune);

  try {
    await writeAuthPoliciesForOpenedFolder(authPolicies);
    state.authPolicies = authPolicies;
    state.folderSpecFiles = normalizeFolderSpecFiles(specFilesForPrune);
    renderAuthPolicyScopes();
    return true;
  } catch {
    showErrorToast('권한 정책 저장 실패', `${AUTH_POLICY_FILE_NAME} 파일을 저장하지 못했습니다.`);
    return false;
  }
  };

  return {
    readBrowserAuthPolicies,
    writeBrowserAuthPolicies,
    readServerAuthPolicies,
    writeServerAuthPolicies,
    loadAuthPoliciesForOpenedFolder,
    writeAuthPoliciesForOpenedFolder,
    getCurrentSpecFileForAuthPolicy,
    getFolderSpecFilesForAuthPolicySave,
    syncAuthPoliciesWithOpenedFolder,
    saveCurrentAuthPolicy,
  };
};
