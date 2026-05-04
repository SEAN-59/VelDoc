export const createDocumentActionsRuntime = (ctx) => {
  const {
    AUTH_POLICY_FILE_NAME,
    HOME_PAGE_URL,
    HOME_TOAST_SESSION_KEY,
    STORAGE_KEY,
    WORKSPACE_REQUIRED_NOTICE,
    defaultRows,
    defaultSuccessResponses,
    fileTreeRoot,
    form,
    rowDefinitions,
    saveButton,
    state,
  } = ctx;

  const applyMarkdownSpec = (...args) => ctx.applyMarkdownSpec(...args);
  const buildApiPath = (...args) => ctx.buildApiPath(...args);
  const buildFileNameFromPath = (...args) => ctx.buildFileNameFromPath(...args);
  const clearSuccessStatusError = (...args) => ctx.clearSuccessStatusError(...args);
  const clearValidationErrors = (...args) => ctx.clearValidationErrors(...args);
  const generateMarkdown = (...args) => ctx.generateMarkdown(...args);
  const getDirectoryPath = (...args) => ctx.getDirectoryPath(...args);
  const getSelectedAuthPolicyScopeOption = (...args) => ctx.getSelectedAuthPolicyScopeOption(...args);
  const hasSaveDir = (...args) => ctx.hasSaveDir(...args);
  const hidePageLoading = (...args) => ctx.hidePageLoading(...args);
  const isBrowserFileSystemFile = (...args) => ctx.isBrowserFileSystemFile(...args);
  const isBrowserFileSystemSupported = (...args) => ctx.isBrowserFileSystemSupported(...args);
  const isDeletableCurrentFile = (...args) => ctx.isDeletableCurrentFile(...args);
  const isTargetFileExistsError = (...args) => ctx.isTargetFileExistsError(...args);
  const localFileLabel = (...args) => ctx.localFileLabel(...args);
  const markActiveTreeFile = (...args) => ctx.markActiveTreeFile(...args);
  const markFileNameConflictError = (...args) => ctx.markFileNameConflictError(...args);
  const normalizeAuthPolicies = (...args) => ctx.normalizeAuthPolicies(...args);
  const normalizeAuthPolicyPath = (...args) => ctx.normalizeAuthPolicyPath(...args);
  const normalizeFolderApiPaths = (...args) => ctx.normalizeFolderApiPaths(...args);
  const normalizeFolderSpecFiles = (...args) => ctx.normalizeFolderSpecFiles(...args);
  const normalizeSaveDir = (...args) => ctx.normalizeSaveDir(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const renderActionPathParams = (...args) => ctx.renderActionPathParams(...args);
  const renderAuthPolicyScopes = (...args) => ctx.renderAuthPolicyScopes(...args);
  const renderAuthRoles = (...args) => ctx.renderAuthRoles(...args);
  const renderFileTree = (...args) => ctx.renderFileTree(...args);
  const renderRows = (...args) => ctx.renderRows(...args);
  const renderSuccessStatusTabs = (...args) => ctx.renderSuccessStatusTabs(...args);
  const setSpecViewerMode = (...args) => ctx.setSpecViewerMode(...args);
  const setStatus = (...args) => ctx.setStatus(...args);
  const showConfirmDialog = (...args) => ctx.showConfirmDialog(...args);
  const showErrorToast = (...args) => ctx.showErrorToast(...args);
  const showPageLoading = (...args) => ctx.showPageLoading(...args);
  const showSaveFailureToast = (...args) => ctx.showSaveFailureToast(...args);
  const showSaveSuccessToast = (...args) => ctx.showSaveSuccessToast(...args);
  const showToast = (...args) => ctx.showToast(...args);
  const showWarningToast = (...args) => ctx.showWarningToast(...args);
  const syncHeaderRowsWithControls = (...args) => ctx.syncHeaderRowsWithControls(...args);
  const validateSpecBeforeSave = (...args) => ctx.validateSpecBeforeSave(...args);
  const browserFileExists = (...args) => ctx.browserFileExists(...args);
  const readPersistedBrowserOpenedFolder = (...args) => ctx.readPersistedBrowserOpenedFolder(...args);
  const ensureBrowserReadPermission = (...args) => ctx.ensureBrowserReadPermission(...args);
  const ensureBrowserWritePermission = (...args) => ctx.ensureBrowserWritePermission(...args);
  const writeBrowserFile = (...args) => ctx.writeBrowserFile(...args);
  const getBrowserEditorRootLabel = (...args) => ctx.getBrowserEditorRootLabel(...args);
  const getBrowserApiEditorDirectoryHandle = (...args) => ctx.getBrowserApiEditorDirectoryHandle(...args);
  const loadAuthPoliciesForOpenedFolder = (...args) => ctx.loadAuthPoliciesForOpenedFolder(...args);
  const writeAuthPoliciesForOpenedFolder = (...args) => ctx.writeAuthPoliciesForOpenedFolder(...args);
  const syncAuthPoliciesWithOpenedFolder = (...args) => ctx.syncAuthPoliciesWithOpenedFolder(...args);
  const saveCurrentAuthPolicy = (...args) => ctx.saveCurrentAuthPolicy(...args);
  const readBrowserFileTree = (...args) => ctx.readBrowserFileTree(...args);
  const refreshBrowserFileTree = (...args) => ctx.refreshBrowserFileTree(...args);
  const applyFileTreePayload = (...args) => ctx.applyFileTreePayload(...args);
  const focusFileLocation = (...args) => ctx.focusFileLocation(...args);
  const setCurrentFile = (...args) => ctx.setCurrentFile(...args);
  const clearCurrentFile = (...args) => ctx.clearCurrentFile(...args);
  const createAuthRoleItemsWithCatalog = (...args) => ctx.createAuthRoleItemsWithCatalog(...args);

  let
    saveMarkdown,
    saveMarkdownAsNew,
    deleteAuthPolicyForPath,
    resetEditorAfterFileDelete,
    deleteBrowserCurrentFile,
    deleteServerCurrentFile,
    deleteCurrentDocument,
    copyMarkdown,
    showMarkdownLoadError,
    loadMarkdownSpec,
    applyOpenedFolder,
    openTreeMarkdownFile,
    readServerCurrentFile,
    showCurrentFileRestoredToast,
    reloadCurrentFileFromStorage,
    reloadCurrentFileAfterSave,
    restorePendingCurrentFileConnection,
    redirectToHomeForWorkspace,
    restoreBrowserOpenedFolder,
    restoreOpenedFolder,
    resetForm,
    createNewDocument;

  
  ctx.saveMarkdown = saveMarkdown = async () => {
  if (!state.hasActiveDocument) {
    showWarningToast('문서 선택 필요', '파일 구조에서 문서를 선택하거나 새문서를 눌러주세요.');
    setStatus('문서 선택 필요');
    return;
  }

  if (!validateSpecBeforeSave()) return;

  const markdown = generateMarkdown();
  const fileName = buildFileNameFromPath();

  if (state.currentFile) {
    if (isBrowserFileSystemFile(state.currentFile)) {
      try {
        let nextFileHandle = state.currentFile.fileHandle;
        let nextPath = state.currentFile.path || state.currentFile.fileName || fileName;
        let nextDisplayPath = state.currentFile.displayPath || localFileLabel(fileName);
        let nextFileName = state.currentFile.fileName || fileName;
        const directoryHandle = state.currentFile.directoryHandle || state.browserSaveDirectoryHandle;
        const shouldRename = directoryHandle && state.currentFile.fileName && state.currentFile.fileName !== fileName;

        if (shouldRename) {
          if (await browserFileExists(directoryHandle, fileName)) {
            throw new Error('Target file already exists.');
          }
          nextFileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        }

        await writeBrowserFile(nextFileHandle, markdown);

        if (shouldRename) {
          await directoryHandle.removeEntry(state.currentFile.fileName).catch(() => {});
          const currentDirPath = getDirectoryPath(state.currentFile.path);
          nextPath = currentDirPath ? `${currentDirPath}/${fileName}` : fileName;
          nextFileName = fileName;
          nextDisplayPath = state.browserDirectoryHandle
            ? localFileLabel(state.browserEditorRootLabel || state.browserDirectoryHandle.name, nextPath)
            : localFileLabel(fileName);
        }

        setCurrentFile({
          ...state.currentFile,
          path: nextPath,
          displayPath: nextDisplayPath,
          fileName: nextFileName,
          fileHandle: nextFileHandle,
          directoryHandle,
          saveDir: state.currentFile.saveDir || state.saveDir,
          authPolicyPath: buildApiPath(),
        });
        if (state.browserDirectoryHandle) {
          await refreshBrowserFileTree();
          state.activeTreeFilePath = nextPath;
          markActiveTreeFile();
        }
        await saveCurrentAuthPolicy();
        await reloadCurrentFileAfterSave();
        setStatus(`${nextDisplayPath} 저장됨`);
        showSaveSuccessToast('현재 파일에 덮어썼습니다.');
        return;
      } catch (error) {
        if (isTargetFileExistsError(error)) markFileNameConflictError();
        const message = isTargetFileExistsError(error)
          ? '변경된 파일명과 같은 파일이 이미 있습니다.'
          : '현재 열려 있는 파일을 저장하지 못했습니다.';
        showSaveFailureToast(message);
        setStatus('저장 실패');
        return;
      }
    }

    try {
      const response = await fetch('/api/save-current-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: state.currentFile.origin,
          path: state.currentFile.path,
          fileName,
          markdown,
        }),
      });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || 'Current file save failed');
      }

      const result = await response.json();
      setCurrentFile({
        origin: result.origin || state.currentFile.origin,
        path: result.path || state.currentFile.path,
        displayPath: result.absolutePath || result.path || fileName,
        fileName: result.fileName || fileName,
        saveDir: result.saveDir || state.saveDir,
        authPolicyPath: buildApiPath(),
      });
      applyFileTreePayload(result);
      state.activeTreeFilePath = result.origin === 'tree' ? result.path || '' : '';
      markActiveTreeFile();
      await saveCurrentAuthPolicy();
      await reloadCurrentFileAfterSave();
      setStatus(`${result.absolutePath || result.path} 저장됨`);
      showSaveSuccessToast('현재 파일에 덮어썼습니다.');
      return;
    } catch (error) {
      if (isTargetFileExistsError(error)) markFileNameConflictError();
      const message = isTargetFileExistsError(error)
        ? '변경된 파일명과 같은 파일이 이미 있습니다.'
        : '현재 열려 있는 파일을 저장하지 못했습니다.';
      showSaveFailureToast(message);
      setStatus('저장 실패');
      return;
    }
  }

  await saveMarkdownAsNew();
  };

  
  ctx.saveMarkdownAsNew = saveMarkdownAsNew = async () => {
  if (!state.hasActiveDocument) {
    showWarningToast('문서 선택 필요', '파일 구조에서 문서를 선택하거나 새문서를 눌러주세요.');
    setStatus('문서 선택 필요');
    return;
  }

  if (!hasSaveDir()) {
    showWarningToast('파일 위치 필요', '홈에서 먼저 API 명세서 폴더를 열어주세요.');
    setStatus('파일 위치 미정');
    saveButton?.focus();
    return;
  }

  if (!validateSpecBeforeSave()) return;

  const markdown = generateMarkdown();
  const fileName = buildFileNameFromPath();

  try {
    if (state.browserSaveDirectoryHandle) {
      if (await browserFileExists(state.browserSaveDirectoryHandle, fileName)) {
        throw new Error('Target file already exists.');
      }
      const fileHandle = await state.browserSaveDirectoryHandle.getFileHandle(fileName, { create: true });
      await writeBrowserFile(fileHandle, markdown);
      const rootName = state.browserEditorRootLabel || state.browserDirectoryHandle?.name || '';
      const displayPath = rootName ? localFileLabel(rootName, fileName) : localFileLabel(fileName);
      setCurrentFile({
        origin: state.browserDirectoryHandle ? 'browser-tree' : 'browser-file',
        path: fileName,
        displayPath,
        fileName,
        saveDir: state.saveDir,
        fileHandle,
        directoryHandle: state.browserSaveDirectoryHandle,
        authPolicyPath: buildApiPath(),
      });
      if (state.browserDirectoryHandle) {
        await refreshBrowserFileTree();
        state.activeTreeFilePath = fileName;
        markActiveTreeFile();
      }
      await saveCurrentAuthPolicy();
      await reloadCurrentFileAfterSave();
      setStatus(`${displayPath} 새 파일 저장됨`);
      showSaveSuccessToast('새 파일로 저장했습니다.');
      return;
    }

    if ('showSaveFilePicker' in window) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Markdown',
            accept: { 'text/markdown': ['.md', '.markdown'] },
          },
        ],
      });
      await writeBrowserFile(fileHandle, markdown);
      setCurrentFile({
        origin: 'browser-file',
        path: fileHandle.name || fileName,
        displayPath: localFileLabel(fileHandle.name || fileName),
        fileName: fileHandle.name || fileName,
        saveDir: localFileLabel('선택한 파일'),
        fileHandle,
        authPolicyPath: buildApiPath(),
      });
      await saveCurrentAuthPolicy();
      await reloadCurrentFileAfterSave();
      setStatus(`${fileHandle.name || fileName} 새 파일 저장됨`);
      showSaveSuccessToast('새 파일로 저장했습니다.');
      return;
    }

    const response = await fetch('/api/save-new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, markdown, saveDir: state.saveDir }),
    });
    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({}));
      throw new Error(errorResult.message || 'New file save failed');
    }

    const result = await response.json();
    setCurrentFile({
      origin: result.origin || 'root',
      path: result.path || fileName,
      displayPath: result.absolutePath || result.path || fileName,
      fileName: result.fileName || fileName,
      saveDir: result.saveDir || state.saveDir,
      authPolicyPath: buildApiPath(),
    });
    applyFileTreePayload(result);
    state.activeTreeFilePath = result.origin === 'tree' ? result.path || '' : '';
    markActiveTreeFile();
    await saveCurrentAuthPolicy();
    await reloadCurrentFileAfterSave();
    setStatus(`${result.absolutePath || result.path} 새 파일 저장됨`);
    showSaveSuccessToast('새 파일로 저장했습니다.');
  } catch (error) {
    if (isTargetFileExistsError(error)) markFileNameConflictError();
    const message = isTargetFileExistsError(error)
      ? '같은 이름의 파일이 이미 있습니다.'
      : '새 파일로 저장하지 못했습니다.';
    showSaveFailureToast(message);
    setStatus('저장 실패');
  }
  };

  
  ctx.deleteAuthPolicyForPath = deleteAuthPolicyForPath = async (path) => {
  if (!state.fileTreeOpened || !path || path === '미정') return true;

  const normalizedPath = normalizeAuthPolicyPath(path);
  const nextPolicies = normalizeAuthPolicies(state.authPolicies);
  if (!nextPolicies.policies[normalizedPath]) return true;

  delete nextPolicies.policies[normalizedPath];

  try {
    await writeAuthPoliciesForOpenedFolder(nextPolicies);
    state.authPolicies = nextPolicies;
    renderAuthPolicyScopes();
    return true;
  } catch {
    showWarningToast('권한 정책 정리 실패', `${AUTH_POLICY_FILE_NAME}에서 삭제된 문서의 정책을 정리하지 못했습니다.`);
    return false;
  }
  };

  
  ctx.resetEditorAfterFileDelete = resetEditorAfterFileDelete = () => {
  setSpecViewerMode(false);
  ctx.isAuthPolicyScopeManuallySelected = false;
  form.reset();
  clearValidationErrors();
  state.rows = structuredClone(defaultRows);
  state.successResponses = structuredClone(defaultSuccessResponses);
  state.activeSuccessResponseIndex = 0;
  clearCurrentFile();
  renderAuthRoles();
  Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
  renderSuccessStatusTabs();
  renderActionPathParams();
  localStorage.removeItem(STORAGE_KEY);
  refresh();
  focusFileLocation();
  };

  
  ctx.deleteBrowserCurrentFile = deleteBrowserCurrentFile = async (file) => {
  const directoryHandle = file.directoryHandle || state.browserSaveDirectoryHandle;
  if (!directoryHandle || !file.fileName) throw new Error('DELETE_NOT_SUPPORTED');
  if (!(await ensureBrowserWritePermission(directoryHandle))) {
    throw new Error('FILE_PERMISSION_DENIED');
  }

  await directoryHandle.removeEntry(file.fileName);
  if (state.browserDirectoryHandle) {
    await refreshBrowserFileTree();
  }
  };

  
  ctx.deleteServerCurrentFile = deleteServerCurrentFile = async (file) => {
  const response = await fetch('/api/delete-current-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: file.origin,
      path: file.path,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || 'DELETE_FAILED');
  }

  const result = await response.json();
  applyFileTreePayload(result);
  };

  
  ctx.deleteCurrentDocument = deleteCurrentDocument = async () => {
  if (!isDeletableCurrentFile()) {
    showWarningToast('삭제할 파일 없음', '현재 열린 문서 파일이 있을 때 삭제할 수 있습니다.');
    return;
  }

  const confirmed = await showConfirmDialog(
    '경고',
    '현재 열린 문서를 완전히 삭제합니다.<br>휴지통으로 이동하지 않으며 되돌릴 수 없습니다.',
    { confirmText: '삭제', cancelText: '취소' },
  );
  if (!confirmed) {
    setStatus('삭제 취소됨');
    return;
  }

  const file = state.currentFile;
  const deletedDisplayPath = file.displayPath || file.path || file.fileName || '현재 문서';
  const deletedPolicyPath = file.authPolicyPath || buildApiPath();

  showPageLoading('파일 삭제 중...');
  try {
    if (isBrowserFileSystemFile(file)) {
      await deleteBrowserCurrentFile(file);
    } else {
      await deleteServerCurrentFile(file);
    }

    await deleteAuthPolicyForPath(deletedPolicyPath);
    await syncAuthPoliciesWithOpenedFolder({ shouldWrite: true });
    resetEditorAfterFileDelete();
    setStatus(`${deletedDisplayPath} 삭제됨`);
    showToast('success', '삭제 완료', `${deletedDisplayPath} 파일을 완전히 삭제했습니다.`);
  } catch (error) {
    const message = error instanceof Error && error.message === 'DELETE_NOT_SUPPORTED'
      ? '이 파일은 브라우저에서 부모 폴더 권한이 없어 삭제할 수 없습니다.'
      : '현재 열린 파일을 삭제하지 못했습니다.';
    showErrorToast('삭제 실패', message);
    setStatus('삭제 실패');
  } finally {
    hidePageLoading();
  }
  };

  
  ctx.copyMarkdown = copyMarkdown = async () => {
  await navigator.clipboard.writeText(generateMarkdown());
  setStatus('복사됨');
  };

  
  ctx.showMarkdownLoadError = showMarkdownLoadError = (fileName = '선택한 파일') => {
  clearSuccessStatusError();
  showErrorToast('파일을 열 수 없음', `${fileName}은 API 명세서 작성기 양식과 맞지 않는 Markdown 파일입니다.`);
  setStatus('불러오기 실패');
  };

  
  ctx.loadMarkdownSpec = loadMarkdownSpec = (markdown, fileName) => {
  clearSuccessStatusError();
  applyMarkdownSpec(markdown);
  setStatus(`${fileName} 불러옴`);
  };

  
  ctx.applyOpenedFolder = applyOpenedFolder = (result, options = {}) => {
  const {
    clearFile = true,
    focusLocation = true,
    updateStatus = true,
  } = options;

  if (clearFile) clearCurrentFile();
  state.folderApiPaths = normalizeFolderApiPaths(result.apiPaths);
  state.folderSpecFiles = normalizeFolderSpecFiles(result.specFiles);
  if (result.origin === 'browser') {
    state.browserWorkspaceDirectoryHandle = result.workspaceDirectoryHandle || null;
    state.browserDirectoryHandle = result.directoryHandle || null;
    state.browserSaveDirectoryHandle = result.directoryHandle || null;
    state.browserEditorRootLabel = result.editorRootLabel || result.rootName || result.directoryHandle?.name || '';
    state.fileTreeHandles = result.fileHandles || new Map();
    state.saveDir = result.saveDir || result.rootPath || result.rootName || '';
  } else {
    state.browserWorkspaceDirectoryHandle = null;
    state.browserDirectoryHandle = null;
    state.browserSaveDirectoryHandle = null;
    state.browserEditorRootLabel = '';
    state.fileTreeHandles = new Map();
    const openedFolderSaveDir = normalizeSaveDir(result.saveDir || result.rootPath);
    if (openedFolderSaveDir) {
      state.saveDir = openedFolderSaveDir;
    }
  }
  if (fileTreeRoot) {
    fileTreeRoot.textContent = result.rootPath || result.rootName || '선택한 폴더';
    fileTreeRoot.title = result.rootPath || '';
  }
  state.fileTreeOpened = true;
  renderFileTree(result.tree || []);
  refresh();
  if (focusLocation) focusFileLocation();
  if (updateStatus) setStatus(`${result.rootName || '폴더'} 열림`);
  };

  
  ctx.openTreeMarkdownFile = openTreeMarkdownFile = async (path, fileName) => {
  setSpecViewerMode(false);
  showPageLoading('명세서 파일 여는 중...');
  try {
    const browserFile = state.fileTreeHandles.get(path);
    if (browserFile?.fileHandle) {
      const file = await browserFile.fileHandle.getFile();
      const markdown = await file.text();
      await loadAuthPoliciesForOpenedFolder();
      loadMarkdownSpec(markdown || '', file.name || fileName);
      setCurrentFile({
        origin: 'browser-tree',
        path,
        displayPath: browserFile.displayPath || localFileLabel(state.browserEditorRootLabel || state.browserDirectoryHandle?.name, path),
        fileName: file.name || fileName,
        saveDir: browserFile.saveDir || state.saveDir,
        fileHandle: browserFile.fileHandle,
        directoryHandle: browserFile.directoryHandle,
      });
      state.activeTreeFilePath = path;
      markActiveTreeFile();
      return;
    }

    const response = await fetch('/api/read-tree-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!response.ok) throw new Error('Open failed');

    const result = await response.json();
    await loadAuthPoliciesForOpenedFolder();
    loadMarkdownSpec(result.markdown || '', result.fileName || fileName);
    setCurrentFile({
      origin: result.origin || 'tree',
      path: result.path || path,
      displayPath: result.absolutePath || result.path || path,
      fileName: result.fileName || fileName,
      saveDir: result.saveDir,
    });
  } catch {
    showMarkdownLoadError(fileName);
  } finally {
    hidePageLoading();
  }
  };

  
  ctx.readServerCurrentFile = readServerCurrentFile = async (fileMeta) => {
  const response = await fetch('/api/read-current-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: fileMeta.origin,
      path: fileMeta.path,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || 'READ_CURRENT_FILE_FAILED');
  }

  return response.json();
  };

  
  ctx.showCurrentFileRestoredToast = showCurrentFileRestoredToast = (fileName = '문서') => {
  showToast('info', '새로고침', `${fileName}의 저장된 내용을 다시 불러왔습니다.`);
  };

  
  ctx.reloadCurrentFileFromStorage = reloadCurrentFileFromStorage = async (fileMeta = state.currentFile, options = {}) => {
  if (!fileMeta) return false;
  const {
    showToast: shouldShowToast = true,
    updateStatus: shouldUpdateStatus = true,
    showFailureToast: shouldShowFailureToast = true,
  } = options;

  const applyReloadedFile = (markdown, nextFile, statusFileName = '문서') => {
    loadMarkdownSpec(markdown || '', statusFileName);
    setCurrentFile(nextFile);
    if (shouldUpdateStatus) setStatus(`${statusFileName} 다시 불러옴`);
    if (shouldShowToast) showCurrentFileRestoredToast(statusFileName);
  };

  try {
    if (fileMeta.origin === 'browser-tree') {
      const browserFile = state.fileTreeHandles.get(fileMeta.path);
      const fileHandle = browserFile?.fileHandle || fileMeta.fileHandle;
      if (!fileHandle) return false;

      const file = await fileHandle.getFile();
      const fileName = file.name || fileMeta.fileName || fileMeta.path.split('/').pop() || '선택한 파일';
      applyReloadedFile(await file.text(), {
        ...fileMeta,
        displayPath: browserFile?.displayPath || fileMeta.displayPath || localFileLabel(state.browserEditorRootLabel || state.browserDirectoryHandle?.name, fileMeta.path),
        fileName,
        saveDir: browserFile?.saveDir || fileMeta.saveDir || state.saveDir,
        fileHandle,
        directoryHandle: browserFile?.directoryHandle || fileMeta.directoryHandle,
      }, fileName);
      state.activeTreeFilePath = fileMeta.path;
      markActiveTreeFile();
      return true;
    }

    if (fileMeta.origin === 'browser-file') {
      const fileHandle = fileMeta.fileHandle;
      if (!fileHandle) return false;

      const file = await fileHandle.getFile();
      const fileName = file.name || fileMeta.fileName || '선택한 파일';
      applyReloadedFile(await file.text(), {
        ...fileMeta,
        path: fileName,
        displayPath: fileMeta.displayPath || localFileLabel(fileName),
        fileName,
        saveDir: fileMeta.saveDir || state.saveDir || localFileLabel('선택한 파일'),
        fileHandle,
      }, fileName);
      return true;
    }

    if (fileMeta.origin === 'tree') {
      if (!state.fileTreeOpened) return false;

      const response = await fetch('/api/read-tree-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fileMeta.path }),
      });
      if (!response.ok) throw new Error('READ_TREE_FILE_FAILED');

      const result = await response.json();
      const fileName = result.fileName || fileMeta.fileName || '선택한 파일';
      applyReloadedFile(result.markdown || '', {
        ...fileMeta,
        origin: result.origin || fileMeta.origin,
        path: result.path || fileMeta.path,
        displayPath: result.absolutePath || result.path || fileMeta.displayPath || fileMeta.path,
        fileName,
        saveDir: result.saveDir || fileMeta.saveDir,
      }, fileName);
      state.activeTreeFilePath = result.path || fileMeta.path;
      markActiveTreeFile();
      return true;
    }

    if (['root', 'absolute'].includes(fileMeta.origin)) {
      const result = await readServerCurrentFile(fileMeta);
      const fileName = result.fileName || fileMeta.fileName || '선택한 파일';
      applyReloadedFile(result.markdown || '', {
        ...fileMeta,
        origin: result.origin || fileMeta.origin,
        path: result.path || fileMeta.path,
        displayPath: result.absolutePath || result.path || fileMeta.displayPath || fileMeta.path,
        fileName,
        saveDir: result.saveDir || fileMeta.saveDir,
      }, fileName);
      return true;
    }
  } catch {
    if (shouldShowFailureToast) {
      showWarningToast('문서 복구 실패', '새로고침 전 열려 있던 문서 파일을 다시 읽지 못했습니다.');
    }
    if (shouldUpdateStatus) setStatus('문서 복구 실패');
  }

  return false;
  };

  
  ctx.reloadCurrentFileAfterSave = reloadCurrentFileAfterSave = async () => {
  await reloadCurrentFileFromStorage(state.currentFile, {
    showToast: false,
    updateStatus: false,
    showFailureToast: false,
  });
  };

  
  ctx.restorePendingCurrentFileConnection = restorePendingCurrentFileConnection = async () => {
  const fileMeta = state.pendingCurrentFileMeta;
  if (!fileMeta) return false;

  return reloadCurrentFileFromStorage(fileMeta);
  };

  
  ctx.redirectToHomeForWorkspace = redirectToHomeForWorkspace = () => {
  try {
    sessionStorage.setItem(
      HOME_TOAST_SESSION_KEY,
      JSON.stringify({
        type: 'warning',
        title: '작업 공간 필요',
        message: '작업 공간을 선택해주세요.',
      }),
    );
  } catch {
    // 홈 리다이렉트는 토스트 저장 실패와 무관하게 진행한다.
  }
  window.location.replace(`${HOME_PAGE_URL}?notice=${encodeURIComponent(WORKSPACE_REQUIRED_NOTICE)}`);
  };

  
  ctx.restoreBrowserOpenedFolder = restoreBrowserOpenedFolder = async () => {
  const directoryHandle = await readPersistedBrowserOpenedFolder();
  if (!directoryHandle) return false;

  try {
    if (!(await ensureBrowserReadPermission(directoryHandle))) {
      showWarningToast('폴더 권한 필요', '브라우저 권한이 만료되었습니다.\n홈에서 폴더를 다시 허용해주세요.');
      setStatus('폴더 권한 필요');
      return false;
    }

    const apiDirectoryHandle = await getBrowserApiEditorDirectoryHandle(directoryHandle);
    const editorRootLabel = getBrowserEditorRootLabel(directoryHandle);
    const { tree, handles, apiPaths, specFiles } = await readBrowserFileTree(apiDirectoryHandle, {
      rootName: editorRootLabel,
    });
    applyOpenedFolder(
      {
        ok: true,
        origin: 'browser',
        rootName: editorRootLabel,
        rootPath: localFileLabel(editorRootLabel),
        saveDir: localFileLabel(editorRootLabel),
        workspaceDirectoryHandle: directoryHandle,
        directoryHandle: apiDirectoryHandle,
        editorRootLabel,
        fileHandles: handles,
        tree,
        apiPaths,
        specFiles,
      },
      {
        clearFile: false,
        focusLocation: false,
        updateStatus: false,
      },
    );
    await loadAuthPoliciesForOpenedFolder();
    setStatus(`${editorRootLabel} 폴더 복구됨`);
    return true;
  } catch {
    showWarningToast('폴더 복구 실패', '브라우저 권한이 만료되었습니다.\n홈에서 폴더를 다시 선택해주세요.');
    setStatus('폴더 복구 실패');
    return false;
  }
  };

  
  ctx.restoreOpenedFolder = restoreOpenedFolder = async () => {
  let isRestored = false;

  if (isBrowserFileSystemSupported()) {
    isRestored = await restoreBrowserOpenedFolder();
    if (!isRestored) {
      redirectToHomeForWorkspace();
      return false;
    }
    await restorePendingCurrentFileConnection();
    return true;
  }

  try {
    const response = await fetch('/api/current-tree-root');
    if (!response.ok) throw new Error('NO_OPENED_FOLDER');

    const result = await response.json();
    if (result.opened) {
      applyOpenedFolder(result, {
        clearFile: false,
        focusLocation: false,
        updateStatus: false,
      });
      await loadAuthPoliciesForOpenedFolder();
      isRestored = true;
    }
  } catch {
    // 서버 세션에 열린 폴더가 없으면 조용히 새 작업 상태로 둔다.
  }

  if (!isRestored) {
    redirectToHomeForWorkspace();
    return false;
  }

  await restorePendingCurrentFileConnection();
  return true;
  };

  
  ctx.resetForm = resetForm = async () => {
  if (!state.hasActiveDocument) {
    showWarningToast('문서 선택 필요', '파일 구조에서 문서를 선택하거나 새문서를 눌러주세요.');
    setStatus('문서 선택 필요');
    return;
  }

  const shouldReset = await showConfirmDialog(
    '경고',
    '입력 중인 내용을 모두 지우고 처음 상태로 돌아갑니다.',
    { confirmText: '초기화', cancelText: '취소' },
  );
  if (!shouldReset) {
    setStatus('초기화 취소됨');
    return;
  }

  setSpecViewerMode(false);
  ctx.isAuthPolicyScopeManuallySelected = false;
  form.reset();
  clearValidationErrors();
  state.rows = structuredClone(defaultRows);
  state.successResponses = structuredClone(defaultSuccessResponses);
  state.activeSuccessResponseIndex = 0;
  renderAuthRoles();
  syncHeaderRowsWithControls();
  Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
  renderSuccessStatusTabs();
  renderActionPathParams();
  localStorage.removeItem(STORAGE_KEY);
  refresh();
  setStatus('API 정보 초기화됨');
  showToast('info', '초기화 완료', '입력 중인 내용을 처음 상태로 되돌렸습니다.');
  };

  
  ctx.createNewDocument = createNewDocument = () => {
  setSpecViewerMode(false);
  ctx.isAuthPolicyScopeManuallySelected = false;
  form.reset();
  ctx.setFormValue('pathBase', '');
  ctx.setFormValue('pathVersion', '');
  ctx.setFormValue('pathSubCategory', '');
  ctx.setFormValue('pathAction', '');
  clearSuccessStatusError();
  state.rows = structuredClone(defaultRows);
  state.successResponses = structuredClone(defaultSuccessResponses);
  state.activeSuccessResponseIndex = 0;
  clearCurrentFile();
  state.hasActiveDocument = true;
  state.authSelectedRoles = [];
  state.authSelectedRoleOrigins = {};
  state.authRoleVisibleScopePath = '';
  const authPolicyScopeOption = getSelectedAuthPolicyScopeOption();
  renderAuthRoles(createAuthRoleItemsWithCatalog([], authPolicyScopeOption.path), {
    scopePath: authPolicyScopeOption.path,
    updateSelectionMemory: false,
  });
  syncHeaderRowsWithControls();
  Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
  renderSuccessStatusTabs();
  renderActionPathParams();
  refresh();
  focusFileLocation();
  setStatus('새 문서');
  showToast('info', '새 문서', '기존 파일 연결 없이 새 문서 작성 상태로 전환했습니다.');
  };

  return {
    saveMarkdown,
    saveMarkdownAsNew,
    deleteAuthPolicyForPath,
    resetEditorAfterFileDelete,
    deleteBrowserCurrentFile,
    deleteServerCurrentFile,
    deleteCurrentDocument,
    copyMarkdown,
    showMarkdownLoadError,
    loadMarkdownSpec,
    applyOpenedFolder,
    openTreeMarkdownFile,
    readServerCurrentFile,
    showCurrentFileRestoredToast,
    reloadCurrentFileFromStorage,
    reloadCurrentFileAfterSave,
    restorePendingCurrentFileConnection,
    redirectToHomeForWorkspace,
    restoreBrowserOpenedFolder,
    restoreOpenedFolder,
    resetForm,
    createNewDocument,
  };
};
