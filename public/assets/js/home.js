const FOLDER_SESSION_KEY = 'veldoc-opened-folder-session';
const FOLDER_HANDLE_DB_NAME = 'veldoc-session-folders';
const FOLDER_HANDLE_STORE_NAME = 'folders';
const HOME_TOAST_SESSION_KEY = 'veldoc-home-toast';
const WORKSPACE_REQUIRED_NOTICE = 'workspace-required';
const VELDOC_WORKSPACE_DIR_NAME = 'veldoc';
const API_EDITOR_DIR_NAME = 'api';
const API_EDITOR_URL = './pages/apieditor.html';
const TABLE_EDITOR_DIR_NAME = 'table';
const HOME_EDITOR_DIRECTORIES = new Set(['wbs', 'srs', 'fsd', 'api', 'table']);

const homeShell = document.querySelector('.home-shell');
const homeFolderOpenButton = document.querySelector('#homeFolderOpenButton');
const homeFolderStatus = document.querySelector('#homeFolderStatus');
const homeFolderGroup = document.querySelector('.home-folder-group');
const homeApiAction = document.querySelector('.home-action-api');
const homeEditorActions = [...document.querySelectorAll('[data-editor-dir]')];
const homeToastContainer = document.querySelector('#homeToastContainer');
const homeHelpButton = document.querySelector('#homeHelpButton');
const homeHelpDialog = document.querySelector('#homeHelpDialog');
const homeHelpDialogCloseButton = document.querySelector('#homeHelpDialogCloseButton');
const homeHelpTopicButtons = [...document.querySelectorAll('[data-home-help-topic]')];
const homeHelpSections = [...document.querySelectorAll('[data-home-help-section]')];

let isHomeFolderBusy = false;
let homeFolderErrorTimer = null;

if (homeShell) {
  homeShell.dataset.ready = 'true';
}

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
};

const removeToast = (toast) => {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  window.setTimeout(() => toast.remove(), 240);
};

const showHomeToast = (type, title, message) => {
  if (!homeToastContainer) return;
  const existingToasts = homeToastContainer.querySelectorAll('.toast');
  if (existingToasts.length >= 3) removeToast(existingToasts[0]);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', type === 'danger' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = `toast-icon ${type}`;
  icon.textContent = type === 'success' ? '✓' : type === 'danger' ? '!' : type === 'warning' ? '!' : 'i';

  const content = document.createElement('div');
  content.className = 'toast-content';
  content.append(
    createTextElement('div', 'toast-title', title),
    createTextElement('div', 'toast-msg', message),
  );

  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '알림 닫기');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => removeToast(toast));

  toast.append(icon, content, closeButton);
  homeToastContainer.append(toast);
  window.setTimeout(() => removeToast(toast), 4000);
};

const showHomeToastDelayed = (type, title, message) => {
  window.setTimeout(() => showHomeToast(type, title, message), 260);
};

const shakeHomeFolderInput = () => {
  if (!homeFolderGroup) return;
  homeFolderGroup.classList.remove('is-error');
  window.requestAnimationFrame(() => {
    homeFolderGroup.classList.add('is-error');
  });
};

const setHomeFolderError = (hasError, options = {}) => {
  if (homeFolderErrorTimer) {
    window.clearTimeout(homeFolderErrorTimer);
    homeFolderErrorTimer = null;
  }
  homeFolderGroup?.classList.toggle('is-error', hasError);
  homeFolderStatus?.classList.toggle('is-error', hasError);
  homeFolderStatus?.setAttribute('aria-invalid', hasError ? 'true' : 'false');
  if (!hasError) homeFolderStatus?.classList.remove('shake');
  if (hasError && options.shake) shakeHomeFolderInput();
  if (hasError) {
    homeFolderErrorTimer = window.setTimeout(() => {
      homeFolderGroup?.classList.remove('is-error');
      homeFolderStatus?.classList.remove('is-error', 'shake');
      homeFolderStatus?.setAttribute('aria-invalid', 'false');
      homeFolderErrorTimer = null;
    }, 1600);
  }
};

const showRedirectToastIfNeeded = () => {
  const currentUrl = new URL(window.location.href);
  const notice = currentUrl.searchParams.get('notice');
  if (notice === WORKSPACE_REQUIRED_NOTICE) {
    currentUrl.searchParams.delete('notice');
    window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    setHomeFolderError(true, { shake: true });
    showHomeToastDelayed('warning', '작업 공간 필요', '작업 공간을 선택해주세요.');
    try {
      sessionStorage.removeItem(HOME_TOAST_SESSION_KEY);
    } catch {
      // URL 알림을 이미 처리했으므로 세션 정리 실패는 무시한다.
    }
    return;
  }

  try {
    const rawToast = sessionStorage.getItem(HOME_TOAST_SESSION_KEY);
    if (!rawToast) return;
    sessionStorage.removeItem(HOME_TOAST_SESSION_KEY);
    const toast = JSON.parse(rawToast);
    setHomeFolderError(true, { shake: true });
    showHomeToastDelayed(toast.type || 'warning', toast.title || '작업 공간 필요', toast.message || '작업 공간을 선택해주세요.');
  } catch {
    setHomeFolderError(true, { shake: true });
    showHomeToastDelayed('warning', '작업 공간 필요', '작업 공간을 선택해주세요.');
  }
};

const setHomeFolderStatus = (message) => {
  if (!homeFolderStatus) return;
  if ('value' in homeFolderStatus) {
    homeFolderStatus.value = message;
  } else {
    homeFolderStatus.textContent = message;
  }
  homeFolderStatus.title = message;
};

const setHomeFolderBusy = (isBusy) => {
  isHomeFolderBusy = isBusy;
  if (homeFolderOpenButton) homeFolderOpenButton.disabled = isBusy;
  homeEditorActions.forEach((action) => {
    action.setAttribute('aria-disabled', isBusy ? 'true' : 'false');
  });
};

const setHomeHelpTopic = (topic) => {
  const nextTopic = topic || 'folder';
  homeHelpTopicButtons.forEach((button) => {
    const isActive = button.dataset.homeHelpTopic === nextTopic;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  homeHelpSections.forEach((section) => {
    section.classList.toggle('active', section.dataset.homeHelpSection === nextTopic);
  });
};

const setHomeHelpDialogOpen = (isOpen) => {
  if (!homeHelpDialog) return;
  homeHelpDialog.hidden = !isOpen;
  homeHelpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (isOpen) {
    setHomeHelpTopic('folder');
    homeHelpDialogCloseButton?.focus();
    return;
  }
  homeHelpButton?.focus();
};

const getFolderSessionId = (options = {}) => {
  try {
    const existingSessionId = sessionStorage.getItem(FOLDER_SESSION_KEY);
    if (existingSessionId || !options.create) return existingSessionId;

    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(FOLDER_SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return '';
  }
};

const isBrowserFileSystemSupported = () =>
  window.isSecureContext && 'showDirectoryPicker' in window;

const openFolderHandleDb = () =>
  new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('INDEXED_DB_NOT_SUPPORTED'));
      return;
    }

    const request = window.indexedDB.open(FOLDER_HANDLE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FOLDER_HANDLE_STORE_NAME)) {
        db.createObjectStore(FOLDER_HANDLE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('INDEXED_DB_OPEN_FAILED'));
  });

const withFolderHandleStore = async (mode, callback) => {
  const db = await openFolderHandleDb();
  return new Promise((resolve, reject) => {
    let requestResult;
    const transaction = db.transaction(FOLDER_HANDLE_STORE_NAME, mode);
    const store = transaction.objectStore(FOLDER_HANDLE_STORE_NAME);
    let request = null;

    try {
      request = callback(store);
    } catch (error) {
      transaction.abort();
      db.close();
      reject(error);
      return;
    }

    request.onsuccess = () => {
      requestResult = request.result;
    };
    request.onerror = () => {
      db.close();
      reject(request.error || new Error('INDEXED_DB_REQUEST_FAILED'));
    };
    transaction.oncomplete = () => {
      db.close();
      resolve(requestResult);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('INDEXED_DB_TRANSACTION_FAILED'));
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error('INDEXED_DB_TRANSACTION_ABORTED'));
    };
  });
};

const persistBrowserOpenedFolder = async (directoryHandle) => {
  const sessionId = getFolderSessionId({ create: true });
  if (!sessionId) return;

  await withFolderHandleStore('readwrite', (store) =>
    store.put(
      {
        directoryHandle,
        rootName: directoryHandle.name,
        savedAt: Date.now(),
      },
      sessionId,
    ));
};

const readPersistedBrowserOpenedFolder = async () => {
  try {
    const sessionId = getFolderSessionId();
    if (!sessionId) return null;

    const entry = await withFolderHandleStore('readonly', (store) => store.get(sessionId));
    return entry?.directoryHandle || null;
  } catch {
    return null;
  }
};

const ensureBrowserWritePermission = async (handle) => {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
};

const getBrowserVelDocDirectoryHandle = async (workspaceDirectoryHandle) =>
  workspaceDirectoryHandle.getDirectoryHandle(VELDOC_WORKSPACE_DIR_NAME, {
    create: true,
  });

const getBrowserEditorDirectoryHandle = async (workspaceDirectoryHandle, editorDirectoryName) => {
  const veldocDirectoryHandle = await getBrowserVelDocDirectoryHandle(workspaceDirectoryHandle);
  return veldocDirectoryHandle.getDirectoryHandle(editorDirectoryName, { create: true });
};

const getBrowserApiEditorDirectoryHandle = async (workspaceDirectoryHandle) =>
  getBrowserEditorDirectoryHandle(workspaceDirectoryHandle, API_EDITOR_DIR_NAME);

const getBrowserWorkspaceRootLabel = (workspaceDirectoryHandle) =>
  [
    workspaceDirectoryHandle?.name,
    VELDOC_WORKSPACE_DIR_NAME,
  ].filter(Boolean).join('/');

const getBrowserEditorRootLabel = (workspaceDirectoryHandle) =>
  [
    getBrowserWorkspaceRootLabel(workspaceDirectoryHandle),
    API_EDITOR_DIR_NAME,
  ].filter(Boolean).join('/');

const restoreHomeFolderStatus = async () => {
  if (!isBrowserFileSystemSupported()) return;

  const directoryHandle = await readPersistedBrowserOpenedFolder();
  if (!directoryHandle) return;

  setHomeFolderError(false);
  setHomeFolderStatus(getBrowserWorkspaceRootLabel(directoryHandle));
};

const ensureVelDocWorkspace = async (options = {}) => {
  const { forcePicker = false } = options;
  setHomeFolderStatus('폴더 선택 중');

  if (isBrowserFileSystemSupported()) {
    let directoryHandle = forcePicker ? null : await readPersistedBrowserOpenedFolder();
    if (!directoryHandle) {
      directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    }

    if (!(await ensureBrowserWritePermission(directoryHandle))) {
      throw new Error('FILE_PERMISSION_DENIED');
    }

    await getBrowserVelDocDirectoryHandle(directoryHandle);
    await persistBrowserOpenedFolder(directoryHandle);
    setHomeFolderStatus(getBrowserWorkspaceRootLabel(directoryHandle));
    return true;
  }

  if (!forcePicker) {
    try {
      const currentResponse = await fetch('/api/current-workspace-root');
      if (currentResponse.ok) {
        const currentResult = await currentResponse.json();
        if (currentResult.opened) {
          setHomeFolderStatus(currentResult.rootName || 'veldoc');
          return true;
        }
      }
    } catch {
      // 서버 세션 확인에 실패하면 아래의 폴더 선택 흐름을 사용한다.
    }
  }

  const response = await fetch('/api/choose-workspace-root', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('DIRECTORY_SELECTION_FAILED');

  const result = await response.json();
  setHomeFolderStatus(result.rootName || 'veldoc');
  return true;
};

const ensureApiEditorWorkspace = async () => {
  setHomeFolderStatus('폴더 선택 중');

  if (isBrowserFileSystemSupported()) {
    let directoryHandle = await readPersistedBrowserOpenedFolder();
    if (!directoryHandle) {
      directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    }

    if (!(await ensureBrowserWritePermission(directoryHandle))) {
      throw new Error('FILE_PERMISSION_DENIED');
    }

    await getBrowserApiEditorDirectoryHandle(directoryHandle);
    await persistBrowserOpenedFolder(directoryHandle);
    setHomeFolderStatus(getBrowserWorkspaceRootLabel(directoryHandle));
    return true;
  }

  const response = await fetch('/api/open-api-editor-root', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('DIRECTORY_SELECTION_FAILED');

  const result = await response.json();
  setHomeFolderStatus(result.workspaceRootName || 'veldoc');
  return true;
};

const ensureHomeEditorWorkspace = async (editorDirectoryName) => {
  if (!HOME_EDITOR_DIRECTORIES.has(editorDirectoryName)) {
    throw new Error('UNKNOWN_EDITOR_DIRECTORY');
  }

  if (editorDirectoryName === API_EDITOR_DIR_NAME) {
    return ensureApiEditorWorkspace();
  }

  setHomeFolderStatus('폴더 선택 중');

  if (isBrowserFileSystemSupported()) {
    let directoryHandle = await readPersistedBrowserOpenedFolder();
    if (!directoryHandle) {
      directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    }

    if (!(await ensureBrowserWritePermission(directoryHandle))) {
      throw new Error('FILE_PERMISSION_DENIED');
    }

    await getBrowserEditorDirectoryHandle(directoryHandle, editorDirectoryName);
    await persistBrowserOpenedFolder(directoryHandle);
    setHomeFolderStatus(getBrowserWorkspaceRootLabel(directoryHandle));
    return true;
  }

  const response = await fetch('/api/open-editor-root', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editor: editorDirectoryName }),
  });
  if (!response.ok) throw new Error('DIRECTORY_SELECTION_FAILED');

  const result = await response.json();
  setHomeFolderStatus(result.workspaceRootName || 'veldoc');
  return true;
};

const openHomeFolder = async () => {
  if (!homeFolderOpenButton || isHomeFolderBusy) return;

  setHomeFolderBusy(true);
  setHomeFolderError(false);

  try {
    await ensureVelDocWorkspace({ forcePicker: true });
  } catch {
    setHomeFolderError(true, { shake: true });
    setHomeFolderStatus('작업 공간을 선택해주세요.');
  } finally {
    setHomeFolderBusy(false);
  }
};

const openApiEditor = async (event) => {
  if (isHomeFolderBusy) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  setHomeFolderBusy(true);
  setHomeFolderError(false);

  try {
    const opened = await ensureApiEditorWorkspace();
    if (opened) {
      window.location.href = homeApiAction?.getAttribute('href') || API_EDITOR_URL;
    }
  } catch {
    setHomeFolderError(true, { shake: true });
    setHomeFolderStatus('작업 공간을 선택해주세요.');
  } finally {
    setHomeFolderBusy(false);
  }
};

const openHomeEditorDirectory = async (event) => {
  event.preventDefault();
  if (event.currentTarget?.disabled) return;
  const editorDirectoryName = event.currentTarget?.dataset?.editorDir || '';
  if (!editorDirectoryName || editorDirectoryName === API_EDITOR_DIR_NAME) return;
  if (isHomeFolderBusy) return;

  setHomeFolderBusy(true);
  setHomeFolderError(false);

  try {
    await ensureHomeEditorWorkspace(editorDirectoryName);
    if (editorDirectoryName === TABLE_EDITOR_DIR_NAME) {
      window.location.href = event.currentTarget?.getAttribute('href') || './pages/tableeditor.html';
    }
  } catch {
    setHomeFolderError(true, { shake: true });
    setHomeFolderStatus('작업 공간을 선택해주세요.');
  } finally {
    setHomeFolderBusy(false);
  }
};

homeFolderOpenButton?.addEventListener('click', openHomeFolder);
homeApiAction?.addEventListener('click', openApiEditor);
homeEditorActions
  .filter((action) => action.dataset.editorDir !== API_EDITOR_DIR_NAME)
  .forEach((action) => {
    action.addEventListener('click', openHomeEditorDirectory);
  });
homeHelpButton?.addEventListener('click', () => setHomeHelpDialogOpen(true));
homeHelpDialogCloseButton?.addEventListener('click', () => setHomeHelpDialogOpen(false));
homeHelpDialog?.addEventListener('click', (event) => {
  if (event.target === homeHelpDialog) setHomeHelpDialogOpen(false);
});
homeHelpTopicButtons.forEach((button) => {
  button.addEventListener('click', () => setHomeHelpTopic(button.dataset.homeHelpTopic));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && homeHelpDialog && !homeHelpDialog.hidden) {
    setHomeHelpDialogOpen(false);
  }
});
showRedirectToastIfNeeded();
restoreHomeFolderStatus();
