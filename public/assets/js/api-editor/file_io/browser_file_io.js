export const createBrowserFileIoRuntime = (ctx) => {
  const {
    API_EDITOR_DIR_NAME,
    FOLDER_HANDLE_DB_NAME,
    FOLDER_HANDLE_STORE_NAME,
    FOLDER_SESSION_KEY,
    VELDOC_WORKSPACE_DIR_NAME,
  } = ctx;

  let
    browserFileExists,
    createSessionId,
    getFolderSessionId,
    openFolderHandleDb,
    withFolderHandleStore,
    persistBrowserOpenedFolder,
    readPersistedBrowserOpenedFolder,
    ensureBrowserReadPermission,
    ensureBrowserWritePermission,
    writeBrowserFile,
    getBrowserEditorRootLabel,
    getBrowserApiEditorDirectoryHandle;

  
  ctx.browserFileExists = browserFileExists = async (directoryHandle, fileName) => {
  try {
    await directoryHandle.getFileHandle(fileName, { create: false });
    return true;
  } catch {
    return false;
  }
  };

  
  ctx.createSessionId = createSessionId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  
  ctx.getFolderSessionId = getFolderSessionId = ({ create = false } = {}) => {
  try {
    const existingSessionId = sessionStorage.getItem(FOLDER_SESSION_KEY);
    if (existingSessionId || !create) return existingSessionId || '';

    const sessionId = createSessionId();
    sessionStorage.setItem(FOLDER_SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return '';
  }
  };

  
  ctx.openFolderHandleDb = openFolderHandleDb = () =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('INDEXED_DB_UNSUPPORTED'));
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

  
  ctx.withFolderHandleStore = withFolderHandleStore = async (mode, callback) => {
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

  
  ctx.persistBrowserOpenedFolder = persistBrowserOpenedFolder = async (directoryHandle) => {
  try {
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
  } catch {
    // 폴더 핸들 저장이 실패해도 현재 열기 흐름은 그대로 유지한다.
  }
  };

  
  ctx.readPersistedBrowserOpenedFolder = readPersistedBrowserOpenedFolder = async () => {
  try {
    const sessionId = getFolderSessionId();
    if (!sessionId) return null;

    const entry = await withFolderHandleStore('readonly', (store) => store.get(sessionId));
    return entry?.directoryHandle || null;
  } catch {
    return null;
  }
  };

  
  ctx.ensureBrowserReadPermission = ensureBrowserReadPermission = async (handle) => {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  const options = { mode: 'read' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
  };

  
  ctx.ensureBrowserWritePermission = ensureBrowserWritePermission = async (handle) => {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
  };

  
  ctx.writeBrowserFile = writeBrowserFile = async (fileHandle, markdown) => {
  if (!(await ensureBrowserWritePermission(fileHandle))) {
    throw new Error('FILE_PERMISSION_DENIED');
  }
  const writable = await fileHandle.createWritable();
  await writable.write(markdown);
  await writable.close();
  };

  
  ctx.getBrowserEditorRootLabel = getBrowserEditorRootLabel = (workspaceDirectoryHandle) =>
  [
    workspaceDirectoryHandle?.name,
    VELDOC_WORKSPACE_DIR_NAME,
    API_EDITOR_DIR_NAME,
  ].filter(Boolean).join('/');

  
  ctx.getBrowserApiEditorDirectoryHandle = getBrowserApiEditorDirectoryHandle = async (workspaceDirectoryHandle) => {
  const veldocDirectoryHandle = await workspaceDirectoryHandle.getDirectoryHandle(VELDOC_WORKSPACE_DIR_NAME, {
    create: true,
  });
  const apiDirectoryHandle = await veldocDirectoryHandle.getDirectoryHandle(API_EDITOR_DIR_NAME, {
    create: true,
  });
  return apiDirectoryHandle;
  };

  return {
    browserFileExists,
    createSessionId,
    getFolderSessionId,
    openFolderHandleDb,
    withFolderHandleStore,
    persistBrowserOpenedFolder,
    readPersistedBrowserOpenedFolder,
    ensureBrowserReadPermission,
    ensureBrowserWritePermission,
    writeBrowserFile,
    getBrowserEditorRootLabel,
    getBrowserApiEditorDirectoryHandle,
  };
};
