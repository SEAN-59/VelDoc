const FOLDER_SESSION_KEY = 'veldoc-opened-folder-session';
const FOLDER_HANDLE_DB_NAME = 'veldoc-session-folders';
const FOLDER_HANDLE_STORE_NAME = 'folders';
const HOME_TOAST_SESSION_KEY = 'veldoc-home-toast';
const TABLE_CURRENT_FILE_STORAGE_KEY = 'veldoc-table-current-file';
const WORKSPACE_REQUIRED_NOTICE = 'workspace-required';
const VELDOC_WORKSPACE_DIR_NAME = 'veldoc';
const TABLE_EDITOR_DIR_NAME = 'table';
const SIDE_MENU_WIDTH_KEY = 'veldoc-side-menu-width';
const SIDE_MENU_MIN_WIDTH = 176;
const SIDE_MENU_MAX_WIDTH = 280;
const SIDE_MENU_DEFAULT_WIDTH = 280;
const SIDE_MENU_SNAP_RANGE = 18;
const SIDE_MENU_COLLAPSE_WIDTH = 134;
const SIDE_MENU_NARROW_WIDTH = 212;
const TABLE_ROW_DRAG_DATA_TYPE = 'application/x-veldoc-table-row';
const INVALID_INDEX_COLUMN_CHIP_REMOVE_DELAY = 500;
const CONSTRAINT_TYPE_OPTIONS = ['', 'FK', 'Composite PK', 'Unique', 'Check'];
const FK_ACTION_OPTIONS = ['', 'NO ACTION', 'RESTRICT', 'CASCADE', 'SET NULL', 'SET DEFAULT'];
const FK_ACTION_CUSTOM_VALUE = '__custom__';
const CONSTRAINT_REFERENCE_FIELDS = new Set(['referenceTable', 'referenceColumn', 'onUpdate', 'onDelete']);
const CONSTRAINT_COLUMN_REQUIRED_TYPES = new Set(['FK', 'Composite PK', 'Unique']);

const dom = {
  appShell: document.querySelector('#tableAppShell'),
  workspace: document.querySelector('.workspace'),
  workspaceTitle: document.querySelector('#tableWorkspaceTitle'),
  sideMenu: document.querySelector('#tableSideMenu'),
  sideMenuResizer: document.querySelector('#tableSideMenuResizer'),
  filePanelBackdrop: document.querySelector('#tableFilePanelBackdrop'),
  filePanelRail: document.querySelector('#tableFilePanelRail'),
  topButton: document.querySelector('#tableTopButton'),
  viewerTransitionSkeleton: document.querySelector('#tableViewerTransitionSkeleton'),
  toastContainer: document.querySelector('#tableToastContainer'),
  fileList: document.querySelector('#tableFileList'),
  form: document.querySelector('#tableEditorForm'),
  emptyState: document.querySelector('#tableEmptyState'),
  emptyNewButton: document.querySelector('#tableEmptyNewButton'),
  previewToggleButton: document.querySelector('#tablePreviewToggleButton'),
  previewPanel: document.querySelector('#tablePreviewPanel'),
  preview: document.querySelector('#tablePreview'),
  generatedSql: document.querySelector('#tableGeneratedSql'),
  copyButton: document.querySelector('#tableCopyButton'),
  statusText: document.querySelector('#tableStatusText'),
  resetButton: document.querySelector('#tableResetButton'),
  viewerButton: document.querySelector('#tableViewerButton'),
  viewer: document.querySelector('#tableViewer'),
  viewerCount: document.querySelector('#tableViewerCount'),
  viewerList: document.querySelector('#tableViewerList'),
  viewerEmpty: document.querySelector('#tableViewerEmpty'),
  newButton: document.querySelector('#tableNewButton'),
  deleteButton: document.querySelector('#tableDeleteButton'),
  saveButton: document.querySelector('#tableSaveButton'),
  saveMenuButton: document.querySelector('#tableSaveMenuButton'),
  saveDropdown: document.querySelector('#tableSaveDropdown'),
  saveOverwriteButton: document.querySelector('#tableSaveOverwriteButton'),
  saveNewButton: document.querySelector('#tableSaveNewButton'),
  messageDialog: document.querySelector('#tableMessageDialog'),
  messageDialogTitle: document.querySelector('#tableMessageDialogTitle'),
  messageDialogBody: document.querySelector('#tableMessageDialogBody'),
  messageDialogCancelButton: document.querySelector('#tableMessageDialogCancelButton'),
  messageDialogCloseButton: document.querySelector('#tableMessageDialogCloseButton'),
  helpButton: document.querySelector('#tableHelpButton'),
  helpDialog: document.querySelector('#tableHelpDialog'),
  helpDialogCloseButton: document.querySelector('#tableHelpDialogCloseButton'),
  helpTopicButtons: [...document.querySelectorAll('[data-table-help-topic]')],
  helpSections: [...document.querySelectorAll('[data-table-help-section]')],
  basicHelpButton: document.querySelector('#tableBasicHelpButton'),
  basicHelpPopover: document.querySelector('#tableBasicHelpPopover'),
  basicHelpCloseButton: document.querySelector('#tableBasicHelpCloseButton'),
  columnHelpButton: document.querySelector('#tableColumnHelpButton'),
  columnHelpPopover: document.querySelector('#tableColumnHelpPopover'),
  columnHelpCloseButton: document.querySelector('#tableColumnHelpCloseButton'),
  indexHelpButton: document.querySelector('#tableIndexHelpButton'),
  indexHelpPopover: document.querySelector('#tableIndexHelpPopover'),
  indexHelpCloseButton: document.querySelector('#tableIndexHelpCloseButton'),
  constraintHelpButton: document.querySelector('#tableConstraintHelpButton'),
  constraintHelpPopover: document.querySelector('#tableConstraintHelpPopover'),
  constraintHelpCloseButton: document.querySelector('#tableConstraintHelpCloseButton'),
  rows: {
    columns: document.querySelector('#tableColumnRows'),
    indexes: document.querySelector('#tableIndexRows'),
    constraints: document.querySelector('#tableConstraintRows'),
  },
};

const rowDefinitions = {
  columns: [
    ['property', 'text'],
    ['column', 'text'],
    ['type', 'text'],
    ['length', 'text'],
    ['pk', 'checkbox'],
    ['fk', 'checkbox'],
    ['nullable', 'checkbox'],
    ['unique', 'checkbox'],
    ['defaultValue', 'text'],
    ['example', 'text'],
    ['description', 'text'],
    ['standard', 'text'],
    ['remark', 'text'],
  ],
  indexes: [
    ['name', 'text'],
    ['columns', 'text'],
    ['unique', 'checkbox'],
    ['sort', 'text'],
    ['description', 'text'],
    ['remark', 'text'],
  ],
  constraints: [
    ['name', 'text'],
    ['type', 'constraintType'],
    ['columns', 'text'],
    ['referenceTable', 'text'],
    ['referenceColumn', 'text'],
    ['onUpdate', 'text'],
    ['onDelete', 'text'],
    ['condition', 'text'],
    ['description', 'text'],
    ['remark', 'text'],
  ],
};

const markdownTables = {
  columns: {
    title: '컬럼 정의',
    headers: [
      '한글명',
      'Column',
      'Type',
      'Length',
      'PK',
      'FK',
      'Nullable',
      'Unique',
      'Default',
      'Example',
      '설명',
      '규칙',
      '메모',
    ],
    keys: [
      'property',
      'column',
      'type',
      'length',
      'pk',
      'fk',
      'nullable',
      'unique',
      'defaultValue',
      'example',
      'description',
      'standard',
      'remark',
    ],
  },
  indexes: {
    title: '인덱스 정의',
    headers: ['Index Name', 'Columns', 'Unique', 'Sort', '설명', '메모'],
    keys: ['name', 'columns', 'unique', 'sort', 'description', 'remark'],
  },
  constraints: {
    title: '제약조건',
    headers: [
      '제약명',
      '종류',
      '대상 컬럼',
      '참조 테이블',
      '참조 컬럼',
      'On Update',
      'On Delete',
      '조건',
      '설명',
      '메모',
    ],
    keys: [
      'name',
      'type',
      'columns',
      'referenceTable',
      'referenceColumn',
      'onUpdate',
      'onDelete',
      'condition',
      'description',
      'remark',
    ],
  },
};

const tableUiDefinitions = {
  columns: {
    className: 'table-column-row',
    headers: [
      '한글명',
      { label: 'Column', required: true },
      'Type',
      'Length',
      'PK',
      'FK',
      'Nullable',
      'Unique',
      'Default',
      'Example',
      '설명',
      '규칙',
      '메모',
    ],
    fields: [
      ['property', 'text'],
      ['column', 'text'],
      ['type', 'text'],
      ['length', 'text'],
      ['pk', 'checkbox'],
      ['fk', 'checkbox'],
      ['nullable', 'checkbox'],
      ['unique', 'checkbox'],
      ['defaultValue', 'text'],
      ['example', 'text'],
      ['description', 'text'],
      ['standard', 'text'],
      ['remark', 'text'],
    ],
  },
  indexes: {
    className: 'table-index-row',
    headers: ['Index Name', { label: 'Columns', required: true }, 'Unique', 'Sort', '설명', '메모'],
    fields: [
      ['name', 'text'],
      ['columns', 'text'],
      ['unique', 'checkbox'],
      ['sort', 'text'],
      ['description', 'text'],
      ['remark', 'text'],
    ],
  },
  constraints: {
    className: 'table-constraint-row',
    headers: [
      '제약명',
      '종류',
      '대상 컬럼',
      '참조 테이블',
      '참조 컬럼',
      'On Update',
      'On Delete',
      '설명',
      '메모',
    ],
    fields: [
      ['name', 'text'],
      ['type', 'constraintType'],
      ['columns', 'text'],
      ['referenceTable', 'text'],
      ['referenceColumn', 'text'],
      ['onUpdate', 'text'],
      ['onDelete', 'text'],
      ['description', 'text'],
      ['remark', 'text'],
    ],
  },
};

const state = {
  mode: 'browser',
  browserRootHandle: null,
  browserTableHandle: null,
  serverRootPath: '',
  currentFile: null,
  pendingCurrentFileMeta: null,
  files: [],
  fileSummaries: new Map(),
  data: null,
  viewMode: 'editor',
  hasActiveDocument: false,
  sideMenuWidth: SIDE_MENU_DEFAULT_WIDTH,
  sideMenuHidden: false,
  fileDrawerOpen: false,
  sideMenuResizeState: null,
  messageDialogReturnFocus: null,
  messageDialogResolver: null,
  messageDialogMode: 'alert',
};

const createDefaultData = () => ({
  basic: {
    entity: '',
    tableName: '',
    category: '',
    description: '',
    createdAtColumn: '',
    updatedAtColumn: '',
    deletedAtColumn: '',
    deletePolicy: '',
    retention: '',
    sensitiveData: '',
    operationMemo: '',
  },
  columns: [],
  indexes: [],
  constraints: [],
});

const createEmptyRow = (section) =>
  rowDefinitions[section].reduce((row, [key, type]) => {
    row[key] = type === 'checkbox' ? false : '';
    return row;
  }, {});

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
    const request = callback(store);

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
  });
};

const getFolderSessionId = () => {
  try {
    return sessionStorage.getItem(FOLDER_SESSION_KEY);
  } catch {
    return '';
  }
};

const isReloadNavigation = () => {
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  if (navigationEntry?.type) return navigationEntry.type === 'reload';
  return performance.navigation?.type === performance.navigation?.TYPE_RELOAD;
};

const serializeCurrentFileForStorage = (file) => {
  if (!file?.path) return null;
  if (file.mode === 'browser') {
    return {
      mode: 'browser',
      path: file.path,
      fileName: file.fileName || file.path,
    };
  }
  if (file.mode === 'server' && file.origin) {
    return {
      mode: 'server',
      origin: file.origin,
      path: file.path,
      fileName: file.fileName || '',
      saveDir: file.saveDir || '',
    };
  }
  return null;
};

const normalizeStoredCurrentFile = (file) => {
  if (!file || typeof file !== 'object' || Array.isArray(file)) return null;
  const mode = String(file.mode || '').trim();
  const path = String(file.path || '').trim();
  if (!mode || !path) return null;
  if (mode === 'browser') {
    return {
      mode,
      path,
      fileName: String(file.fileName || path).trim(),
    };
  }
  if (mode === 'server') {
    const origin = String(file.origin || '').trim();
    if (!origin) return null;
    return {
      mode,
      origin,
      path,
      fileName: String(file.fileName || '').trim(),
      saveDir: String(file.saveDir || '').trim(),
    };
  }
  return null;
};

const saveCurrentFileConnection = () => {
  const currentFile = serializeCurrentFileForStorage(state.currentFile);
  if (!currentFile) {
    localStorage.removeItem(TABLE_CURRENT_FILE_STORAGE_KEY);
    return;
  }
  localStorage.setItem(TABLE_CURRENT_FILE_STORAGE_KEY, JSON.stringify({ currentFile }));
};

const clearCurrentFileConnection = () => {
  state.pendingCurrentFileMeta = null;
  localStorage.removeItem(TABLE_CURRENT_FILE_STORAGE_KEY);
};

const loadPendingCurrentFileConnection = () => {
  state.pendingCurrentFileMeta = null;
  if (!isReloadNavigation()) {
    localStorage.removeItem(TABLE_CURRENT_FILE_STORAGE_KEY);
    return;
  }
  const raw = localStorage.getItem(TABLE_CURRENT_FILE_STORAGE_KEY);
  if (!raw) return;
  try {
    const stored = JSON.parse(raw);
    state.pendingCurrentFileMeta = normalizeStoredCurrentFile(stored.currentFile);
    if (!state.pendingCurrentFileMeta) {
      localStorage.removeItem(TABLE_CURRENT_FILE_STORAGE_KEY);
    }
  } catch {
    localStorage.removeItem(TABLE_CURRENT_FILE_STORAGE_KEY);
  }
};

const readPersistedBrowserOpenedFolder = async () => {
  const sessionId = getFolderSessionId();
  if (!sessionId) return null;
  const record = await withFolderHandleStore('readonly', (store) => store.get(sessionId));
  return record?.directoryHandle || null;
};

const ensureBrowserWritePermission = async (directoryHandle) => {
  const queryOptions = { mode: 'readwrite' };
  if ((await directoryHandle.queryPermission(queryOptions)) === 'granted') return true;
  return (await directoryHandle.requestPermission(queryOptions)) === 'granted';
};

const getBrowserTableDirectoryHandle = async (directoryHandle) => {
  const veldocHandle = await directoryHandle.getDirectoryHandle(VELDOC_WORKSPACE_DIR_NAME, { create: true });
  return veldocHandle.getDirectoryHandle(TABLE_EDITOR_DIR_NAME, { create: true });
};

const redirectHomeForWorkspace = () => {
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
    // URL 알림만으로 처리한다.
  }
  window.location.replace(`../home.html?notice=${WORKSPACE_REQUIRED_NOTICE}`);
};

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

const showToast = (type, title, message) => {
  if (!dom.toastContainer) return;
  const existingToasts = dom.toastContainer.querySelectorAll('.toast');
  if (existingToasts.length >= 3) removeToast(existingToasts[0]);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', type === 'danger' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = `toast-icon ${type}`;
  icon.textContent = type === 'success' ? '✓' : type === 'danger' ? '!' : type === 'warning' ? '!' : 'i';

  const content = document.createElement('div');
  content.className = 'toast-content';
  content.append(createTextElement('div', 'toast-title', title), createTextElement('div', 'toast-msg', message));

  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '알림 닫기');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => removeToast(toast));

  toast.append(icon, content, closeButton);
  dom.toastContainer.append(toast);
  window.setTimeout(() => removeToast(toast), 4000);
};

const clampSideMenuWidth = (value) =>
  Math.min(SIDE_MENU_MAX_WIDTH, Math.max(SIDE_MENU_MIN_WIDTH, Number(value) || SIDE_MENU_DEFAULT_WIDTH));

const setSideMenuWidth = (width, options = {}) => {
  state.sideMenuWidth = clampSideMenuWidth(width);
  document.documentElement.style.setProperty('--side-menu-width', `${state.sideMenuWidth}px`);
  dom.sideMenu?.classList.toggle('is-narrow', state.sideMenuWidth < SIDE_MENU_NARROW_WIDTH);
  dom.sideMenuResizer?.setAttribute('aria-valuenow', String(Math.round(state.sideMenuWidth)));
  if (options.persist !== false) {
    localStorage.setItem(SIDE_MENU_WIDTH_KEY, String(Math.round(state.sideMenuWidth)));
  }
};

const isCompactFilePanelLayout = () => window.matchMedia('(max-width: 1180px)').matches;

const setFileDrawerOpen = (isOpen) => {
  state.fileDrawerOpen = isOpen;
  dom.appShell?.classList.toggle('file-drawer-open', isOpen);
  document.body.classList.toggle('file-drawer-open', isOpen);
  if (dom.filePanelBackdrop) dom.filePanelBackdrop.hidden = !isOpen;
  dom.filePanelRail?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (dom.sideMenu && isCompactFilePanelLayout()) {
    dom.sideMenu.inert = !isOpen;
    dom.sideMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }
};

const setSideMenuHidden = (isHidden) => {
  state.sideMenuHidden = isHidden;
  dom.appShell?.classList.toggle('side-menu-hidden', isHidden);
  document.body.classList.toggle('file-rail-visible', isHidden || isCompactFilePanelLayout());
  if (dom.sideMenu && !isCompactFilePanelLayout()) {
    dom.sideMenu.inert = isHidden;
    dom.sideMenu.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
  }
  if (!isHidden && !isCompactFilePanelLayout()) {
    setFileDrawerOpen(false);
  }
};

const syncFilePanelLayoutMode = () => {
  if (isCompactFilePanelLayout()) {
    document.body.classList.add('file-rail-visible');
    dom.appShell?.classList.add('side-menu-hidden');
    if (dom.sideMenu) {
      dom.sideMenu.inert = !state.fileDrawerOpen;
      dom.sideMenu.setAttribute('aria-hidden', state.fileDrawerOpen ? 'false' : 'true');
    }
    return;
  }

  setFileDrawerOpen(false);
  document.body.classList.toggle('file-rail-visible', state.sideMenuHidden);
  dom.appShell?.classList.toggle('side-menu-hidden', state.sideMenuHidden);
  if (dom.sideMenu) {
    dom.sideMenu.inert = state.sideMenuHidden;
    dom.sideMenu.setAttribute('aria-hidden', state.sideMenuHidden ? 'true' : 'false');
  }
};

const openFilePanelFromRail = () => {
  if (isCompactFilePanelLayout()) {
    setFileDrawerOpen(true);
    return;
  }
  setSideMenuHidden(false);
};

const startSideMenuResize = (event) => {
  if (isCompactFilePanelLayout()) return;
  event.preventDefault();
  state.sideMenuResizeState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startWidth: state.sideMenuWidth,
    shouldCollapse: false,
  };
  dom.sideMenuResizer?.setPointerCapture?.(event.pointerId);
  document.body.classList.add('resizing-side-menu');
};

const moveSideMenuResize = (event) => {
  if (!state.sideMenuResizeState) return;
  const nextWidth = state.sideMenuResizeState.startWidth + event.clientX - state.sideMenuResizeState.startX;
  const shouldCollapse = nextWidth < SIDE_MENU_COLLAPSE_WIDTH;
  state.sideMenuResizeState.shouldCollapse = shouldCollapse;
  dom.appShell?.classList.toggle('side-menu-collapsing', shouldCollapse);
  if (shouldCollapse) return;

  const snappedWidth = nextWidth < SIDE_MENU_MIN_WIDTH + SIDE_MENU_SNAP_RANGE
    ? SIDE_MENU_MIN_WIDTH
    : nextWidth;
  if (state.sideMenuHidden) setSideMenuHidden(false);
  setSideMenuWidth(snappedWidth);
};

const stopSideMenuResize = (event) => {
  if (!state.sideMenuResizeState) return;
  dom.sideMenuResizer?.releasePointerCapture?.(event.pointerId);
  const shouldCollapse = state.sideMenuResizeState.shouldCollapse;
  state.sideMenuResizeState = null;
  dom.appShell?.classList.remove('side-menu-collapsing');
  document.body.classList.remove('resizing-side-menu');
  if (shouldCollapse) setSideMenuHidden(true);
};

const adjustSideMenuFromKeyboard = (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') {
    setSideMenuWidth(SIDE_MENU_MIN_WIDTH);
    setSideMenuHidden(false);
    return;
  }
  if (event.key === 'End') {
    setSideMenuWidth(SIDE_MENU_MAX_WIDTH);
    setSideMenuHidden(false);
    return;
  }
  const delta = event.key === 'ArrowLeft' ? -16 : 16;
  const nextWidth = state.sideMenuWidth + delta;
  if (nextWidth < SIDE_MENU_COLLAPSE_WIDTH) {
    setSideMenuHidden(true);
    return;
  }
  setSideMenuHidden(false);
  setSideMenuWidth(nextWidth);
};

const restoreSideMenuWidth = () => {
  setSideMenuWidth(SIDE_MENU_DEFAULT_WIDTH, { persist: false });
  setSideMenuHidden(false);
};

const updatePreview = () => {
  if (!dom.preview) return;
  dom.preview.textContent = state.data ? createMarkdown() : '';
  if (dom.generatedSql) {
    dom.generatedSql.textContent = state.data ? generateTableSql(state.data) : '문서를 작성하면 SQL이 자동으로 생성됩니다.';
  }
  if (dom.statusText) dom.statusText.textContent = state.hasActiveDocument ? '자동 저장됨' : '문서 없음';
};

const setPreviewOpen = (isOpen) => {
  dom.appShell?.classList.toggle('preview-closed', !isOpen);
  dom.previewToggleButton?.classList.toggle('active', isOpen);
  dom.previewToggleButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (dom.previewPanel) {
    dom.previewPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    dom.previewPanel.inert = !isOpen;
  }
  if (isOpen) updatePreview();
};

const togglePreviewPanel = () => {
  const isOpen = !dom.appShell?.classList.contains('preview-closed');
  setPreviewOpen(!isOpen);
};

const setViewTransitionSkeleton = (isVisible, mode = 'viewer') => {
  dom.workspace?.classList.toggle('is-view-transitioning', isVisible);
  if (!dom.viewerTransitionSkeleton) return;
  dom.viewerTransitionSkeleton.dataset.mode = mode;
  dom.viewerTransitionSkeleton.hidden = !isVisible;
};

const setHelpDialogOpen = (isOpen) => {
  if (!dom.helpDialog) return;
  dom.helpDialog.hidden = !isOpen;
  dom.helpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (isOpen) {
    setHelpTopic('shortcuts');
    dom.helpDialogCloseButton?.focus();
    return;
  }
  dom.helpButton?.focus();
};

const setHelpTopic = (topic) => {
  const nextTopic = topic || 'shortcuts';
  dom.helpTopicButtons.forEach((button) => {
    const isActive = button.dataset.tableHelpTopic === nextTopic;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  dom.helpSections.forEach((section) => {
    section.classList.toggle('active', section.dataset.tableHelpSection === nextTopic);
  });
};

const setBasicHelpOpen = (isOpen) => {
  if (!dom.basicHelpPopover) return;
  dom.basicHelpPopover.hidden = !isOpen;
  dom.basicHelpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isBasicHelpOpen = () => Boolean(dom.basicHelpPopover && !dom.basicHelpPopover.hidden);

const setColumnHelpOpen = (isOpen) => {
  if (!dom.columnHelpPopover) return;
  dom.columnHelpPopover.hidden = !isOpen;
  dom.columnHelpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isColumnHelpOpen = () => Boolean(dom.columnHelpPopover && !dom.columnHelpPopover.hidden);

const setIndexHelpOpen = (isOpen) => {
  if (!dom.indexHelpPopover) return;
  dom.indexHelpPopover.hidden = !isOpen;
  dom.indexHelpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isIndexHelpOpen = () => Boolean(dom.indexHelpPopover && !dom.indexHelpPopover.hidden);

const setConstraintHelpOpen = (isOpen) => {
  if (!dom.constraintHelpPopover) return;
  dom.constraintHelpPopover.hidden = !isOpen;
  dom.constraintHelpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isConstraintHelpOpen = () => Boolean(dom.constraintHelpPopover && !dom.constraintHelpPopover.hidden);

const setFormVisible = (isVisible) => {
  if (state.viewMode === 'viewer') {
    dom.form.hidden = true;
    dom.emptyState.hidden = true;
    return;
  }

  dom.form.hidden = !isVisible;
  dom.emptyState.hidden = isVisible;
  dom.deleteButton.disabled = !state.currentFile;
  dom.resetButton.disabled = !state.hasActiveDocument;
  dom.saveButton.disabled = !state.hasActiveDocument;
  dom.saveMenuButton.disabled = !state.hasActiveDocument;
  dom.saveOverwriteButton.disabled = !state.currentFile;
  dom.saveNewButton.disabled = !state.hasActiveDocument;
};

const normalizeText = (value) => String(value ?? '').trim();
const normalizeCategory = (value) => normalizeText(value) || '미분류';
const normalizeEntityGroup = (value) => normalizeText(value) || '엔티티 미지정';
const toYesNo = (value) => (value ? 'Y' : 'N');
const fromYesNo = (value) => normalizeText(value).toUpperCase() === 'Y';
const normalizeDeletePolicy = (value) => {
  const text = normalizeText(value);
  if (!text) return '';
  const upperText = text.toUpperCase();
  if (upperText === 'Y') return '논리 삭제';
  if (upperText === 'N') return '물리 삭제';
  return text;
};
const normalizeSensitiveDataPolicy = (value) => {
  const text = normalizeText(value);
  if (!text) return '';
  const upperText = text.toUpperCase();
  if (upperText === 'Y') return '포함';
  if (upperText === 'N') return '미포함';
  return text;
};
const parseColumnTokens = (value) =>
  String(value ?? '')
    .split(',')
    .map((token) => normalizeText(token))
    .filter(Boolean);
const normalizeCommaSeparatedValue = (value) => parseColumnTokens(value).join(', ');
const compareTableGroupName = (a, b) => {
  const fallbackNames = new Set(['미분류', '엔티티 미지정']);
  const aIsFallback = fallbackNames.has(a);
  const bIsFallback = fallbackNames.has(b);
  if (aIsFallback && !bIsFallback) return 1;
  if (bIsFallback && !aIsFallback) return -1;
  return String(a).localeCompare(String(b), 'ko', { numeric: true, sensitivity: 'base' });
};

const escapeMarkdownCell = (value) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', '<br>');

const cleanMarkdownValue = (value) => {
  let text = String(value ?? '').trim().replaceAll('<br>', '\n').replaceAll('\\|', '|').replaceAll('\\\\', '\\');
  if (text.startsWith('`') && text.endsWith('`')) text = text.slice(1, -1);
  return text.trim();
};

const splitMarkdownTableRow = (line) => {
  const trimmed = String(line ?? '').trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let current = '';
  let escaping = false;

  [...trimmed].forEach((char) => {
    if (escaping) {
      current += char;
      escaping = false;
      return;
    }
    if (char === '\\') {
      escaping = true;
      current += char;
      return;
    }
    if (char === '|') {
      cells.push(cleanMarkdownValue(current));
      current = '';
      return;
    }
    current += char;
  });
  cells.push(cleanMarkdownValue(current));
  return cells;
};

const isTableDivider = (cells) =>
  cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(String(cell).trim()));

const getMarkdownSection = (markdown, title) => {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^##\\s+\\d+\\.\\s+${escapedTitle}\\s*$`, 'm').exec(markdown);
  if (!match) return '';

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+\d+\.\s+/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
};

const parseMarkdownTable = (section) => {
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  if (lines.length < 2) return { headers: [], rows: [] };

  const [headers = [], ...bodyRows] = lines.map(splitMarkdownTableRow);
  return {
    headers,
    rows: bodyRows.filter((row) => !isTableDivider(row)),
  };
};

const getTableValue = (section, key) => {
  const table = parseMarkdownTable(section);
  const row = table.rows.find((item) => item[0] === key);
  return cleanMarkdownValue(row?.[1] ?? '');
};

const syncDeletedAtColumnState = () => {
  const deletePolicyField = dom.form?.elements.deletePolicy;
  const deletedAtColumnField = dom.form?.elements.deletedAtColumn;
  if (!deletePolicyField || !deletedAtColumnField) return;
  const isLogicalDelete = deletePolicyField.value === '논리 삭제';
  deletedAtColumnField.disabled = !isLogicalDelete;
  deletedAtColumnField.placeholder = isLogicalDelete ? '예: deleted_at' : '논리 삭제 시 입력';
};

const setBasicFieldValues = () => {
  Object.entries(state.data.basic).forEach(([key, value]) => {
    const field = dom.form.elements[key];
    if (!field) return;
    field.value = value;
  });
  syncDeletedAtColumnState();
};

const readBasicFieldValues = () => {
  Object.keys(state.data.basic).forEach((key) => {
    const field = dom.form.elements[key];
    if (!field) return;
    state.data.basic[key] = field.value;
  });
};

const isRowMeaningful = (section, row) =>
  rowDefinitions[section].some(([key, type]) => {
    if (type === 'checkbox') return false;
    return normalizeText(row[key]);
  });

const getPersistedRows = (section) =>
  state.data[section].filter((row) => isRowMeaningful(section, row));

const buildMarkdownTable = (headers, rows) => {
  const divider = headers.map(() => '---');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${divider.join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeMarkdownCell).join(' | ')} |`),
  ].join('\n');
};

const buildKeyValueTable = (rows) =>
  buildMarkdownTable(['항목', '내용'], rows.map(([key, value]) => [key, value]));

const normalizeSqlName = (value, fallback = '') =>
  normalizeText(value)
    .replace(/[`"']/g, '')
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || fallback;

const formatSqlIdentifier = (value) => normalizeText(value).replace(/[`"']/g, '');

const formatSqlColumnList = (value) =>
  parseColumnTokens(value)
    .map(formatSqlIdentifier)
    .filter(Boolean);

const getMeaningfulRowsFromData = (data, section) =>
  (data?.[section] || []).filter((row) => isRowMeaningful(section, row));

const formatSqlColumnType = (column) => {
  const type = normalizeText(column.type) || 'TEXT';
  const length = normalizeText(column.length);
  if (!length || type.includes('(')) return type;
  return `${type}(${length})`;
};

const formatSqlColumnDefinition = (column) => {
  const columnName = formatSqlIdentifier(column.column);
  if (!columnName) return '';
  const parts = [columnName, formatSqlColumnType(column)];
  if (!column.nullable) parts.push('NOT NULL');
  if (normalizeText(column.defaultValue)) parts.push(`DEFAULT ${normalizeText(column.defaultValue)}`);
  return `  ${parts.join(' ')}`;
};

const createSqlConstraintName = (prefix, tableName, fallbackParts = []) => {
  const safeTableName = normalizeSqlName(tableName, 'table');
  const suffix = fallbackParts.map((part) => normalizeSqlName(part)).filter(Boolean).join('_');
  return [prefix, safeTableName, suffix].filter(Boolean).join('_');
};

const createPrimaryKeySql = (data, tableName, constraintRows) => {
  const compositePkRows = constraintRows.filter((row) => normalizeText(row.type) === 'Composite PK');
  if (compositePkRows.length > 0) {
    return compositePkRows
      .map((row) => {
        const columns = formatSqlColumnList(row.columns);
        if (columns.length === 0) return '';
        const constraintName = formatSqlIdentifier(row.name)
          || createSqlConstraintName('pk', tableName, columns);
        return `  CONSTRAINT ${constraintName} PRIMARY KEY (${columns.join(', ')})`;
      })
      .filter(Boolean);
  }

  const primaryKeyColumns = getMeaningfulRowsFromData(data, 'columns')
    .filter((column) => column.pk)
    .map((column) => formatSqlIdentifier(column.column))
    .filter(Boolean);
  if (primaryKeyColumns.length === 0) return [];
  return [
    `  CONSTRAINT ${createSqlConstraintName('pk', tableName)} PRIMARY KEY (${primaryKeyColumns.join(', ')})`,
  ];
};

const createUniqueSql = (data, tableName, constraintRows) => {
  const uniqueColumnConstraints = getMeaningfulRowsFromData(data, 'columns')
    .filter((column) => column.unique && !column.pk)
    .map((column) => {
      const columnName = formatSqlIdentifier(column.column);
      if (!columnName) return '';
      return `  CONSTRAINT ${createSqlConstraintName('uq', tableName, [columnName])} UNIQUE (${columnName})`;
    })
    .filter(Boolean);

  const uniqueConstraints = constraintRows
    .filter((row) => normalizeText(row.type) === 'Unique')
    .map((row) => {
      const columns = formatSqlColumnList(row.columns);
      if (columns.length === 0) return '';
      const constraintName = formatSqlIdentifier(row.name)
        || createSqlConstraintName('uq', tableName, columns);
      return `  CONSTRAINT ${constraintName} UNIQUE (${columns.join(', ')})`;
    })
    .filter(Boolean);

  return [...uniqueColumnConstraints, ...uniqueConstraints];
};

const createCheckSql = (tableName, constraintRows) =>
  constraintRows
    .filter((row) => normalizeText(row.type) === 'Check')
    .map((row) => {
      const condition = normalizeText(row.condition);
      if (!condition) return '';
      const constraintName = formatSqlIdentifier(row.name)
        || createSqlConstraintName('chk', tableName, formatSqlColumnList(row.columns));
      return `  CONSTRAINT ${constraintName} CHECK (${condition})`;
    })
    .filter(Boolean);

const createForeignKeySql = (tableName, constraintRows) =>
  constraintRows
    .filter((row) => normalizeText(row.type) === 'FK')
    .map((row) => {
      const columns = formatSqlColumnList(row.columns);
      const referenceTable = formatSqlIdentifier(row.referenceTable);
      const referenceColumns = formatSqlColumnList(row.referenceColumn);
      if (columns.length === 0 || !referenceTable || referenceColumns.length === 0) return '';
      const constraintName = formatSqlIdentifier(row.name)
        || createSqlConstraintName('fk', tableName, columns);
      const actions = [
        normalizeText(row.onUpdate) ? `ON UPDATE ${normalizeText(row.onUpdate)}` : '',
        normalizeText(row.onDelete) ? `ON DELETE ${normalizeText(row.onDelete)}` : '',
      ].filter(Boolean);
      return [
        `  CONSTRAINT ${constraintName} FOREIGN KEY (${columns.join(', ')})`,
        `REFERENCES ${referenceTable} (${referenceColumns.join(', ')})`,
        ...actions,
      ].join(' ');
    })
    .filter(Boolean);

const createIndexSql = (data, tableName) =>
  getMeaningfulRowsFromData(data, 'indexes')
    .map((row) => {
      const columns = formatSqlColumnList(row.columns);
      if (columns.length === 0) return '';
      const sort = normalizeText(row.sort);
      const indexColumns = columns.map((column) => [column, sort].filter(Boolean).join(' ')).join(', ');
      const indexName = formatSqlIdentifier(row.name)
        || createSqlConstraintName(row.unique ? 'uqidx' : 'idx', tableName, columns);
      return `CREATE ${row.unique ? 'UNIQUE ' : ''}INDEX ${indexName} ON ${formatSqlIdentifier(tableName)} (${indexColumns});`;
    })
    .filter(Boolean);

const generateTableSql = (data) => {
  const tableName = formatSqlIdentifier(data?.basic?.tableName) || 'table_name';
  const columns = getMeaningfulRowsFromData(data, 'columns');
  if (columns.length === 0) return '-- 컬럼 정의를 추가하면 SQL이 자동으로 생성됩니다.';

  const constraintRows = getMeaningfulRowsFromData(data, 'constraints');
  const tableElements = [
    ...columns.map(formatSqlColumnDefinition).filter(Boolean),
    ...createPrimaryKeySql(data, tableName, constraintRows),
    ...createUniqueSql(data, tableName, constraintRows),
    ...createForeignKeySql(tableName, constraintRows),
    ...createCheckSql(tableName, constraintRows),
  ];
  const createTableSql = [
    `CREATE TABLE ${tableName} (`,
    tableElements.join(',\n'),
    ');',
  ].join('\n');
  const indexSql = createIndexSql(data, tableName);
  return [createTableSql, ...indexSql].filter(Boolean).join('\n\n');
};

const buildSqlCodeBlock = (sql) => ['```sql', normalizeText(sql), '```'].join('\n');

const createMarkdown = () => {
  readBasicFieldValues();
  const { basic } = state.data;
  const title = basic.entity || basic.tableName || 'DB 테이블 정의서';
  const sections = [
    `# ${title}`,
    '## 1. 기본 정보',
    buildKeyValueTable([
      ['Table', basic.tableName],
      ['Category', basic.category],
      ['Entity', basic.entity],
      ['Description', basic.description],
    ]),
  ];

  const columnRows = getPersistedRows('columns').map((row) =>
    markdownTables.columns.keys.map((key) => (typeof row[key] === 'boolean' ? toYesNo(row[key]) : row[key])),
  );
  sections.push('## 2. 컬럼 정의', buildMarkdownTable(markdownTables.columns.headers, columnRows));

  ['indexes', 'constraints'].forEach((section, index) => {
    const config = markdownTables[section];
    const rows = getPersistedRows(section).map((row) =>
      config.keys.map((key) => {
        if (section === 'constraints' && row.type !== 'FK' && CONSTRAINT_REFERENCE_FIELDS.has(key)) return '';
        if (section === 'constraints' && row.type !== 'Check' && key === 'condition') return '';
        if (section === 'constraints' && key === 'referenceColumn') {
          return normalizeCommaSeparatedValue(row[key]);
        }
        return typeof row[key] === 'boolean' ? toYesNo(row[key]) : row[key];
      }),
    );
    sections.push(`## ${index + 3}. ${config.title}`, buildMarkdownTable(config.headers, rows));
  });

  sections.push(
    '## 5. 운영 / 관리 정보',
    buildKeyValueTable([
      ['생성일시 컬럼', basic.createdAtColumn],
      ['수정일시 컬럼', basic.updatedAtColumn],
      ['삭제 방식', basic.deletePolicy],
      ['삭제일시 컬럼', basic.deletePolicy === '논리 삭제' ? basic.deletedAtColumn : ''],
      ['보관 / 파기 기준', basic.retention],
      ['개인정보 / 민감정보', basic.sensitiveData],
      ['운영 메모', basic.operationMemo],
    ]),
  );
  sections.push('## 6. SQL', buildSqlCodeBlock(generateTableSql(state.data)));

  return `${sections.join('\n\n')}\n`;
};

const parseRows = (markdown, sectionName, sectionKey) => {
  const table = parseMarkdownTable(getMarkdownSection(markdown, sectionName));
  const config = markdownTables[sectionKey];
  if (!table.headers.length) return [];

  const headerAliases = {
    columns: {
      '한글명': ['Property'],
      설명: ['Description'],
      Nullable: ['NULL'],
      규칙: ['규격', 'Standard'],
      메모: ['Remark'],
    },
    indexes: {
      설명: ['Description'],
      메모: ['Remark'],
    },
    constraints: {
      제약명: ['Constraint Name'],
      종류: ['Type'],
      '대상 컬럼': ['Columns'],
      '참조 테이블': ['Reference Table'],
      '참조 컬럼': ['Reference Column'],
      조건: ['Condition'],
      설명: ['Description'],
      메모: ['Remark'],
    },
  };
  const indexes = config.headers.map((header) => {
    const candidates = [header, ...(headerAliases[sectionKey]?.[header] || [])];
    return candidates.reduce((foundIndex, candidate) => {
      if (foundIndex >= 0) return foundIndex;
      return table.headers.findIndex((cell) => cell === candidate);
    }, -1);
  });
  return table.rows
    .map((cells) => {
      const row = createEmptyRow(sectionKey);
      config.keys.forEach((key, index) => {
        if (!key) return;
        const value = indexes[index] >= 0 ? cells[indexes[index]] : '';
        const fieldType = rowDefinitions[sectionKey].find(([fieldKey]) => fieldKey === key)?.[1];
        const parsedValue = fieldType === 'checkbox' ? fromYesNo(value) : cleanMarkdownValue(value);
        row[key] = sectionKey === 'constraints' && key === 'referenceColumn'
          ? normalizeCommaSeparatedValue(parsedValue)
          : parsedValue;
      });
      return row;
    })
    .filter((row) => isRowMeaningful(sectionKey, row));
};

const parseMarkdown = (markdown) => {
  const basicSection = getMarkdownSection(markdown, '기본 정보');
  const operationSection = getMarkdownSection(markdown, '운영 / 관리 정보');
  const data = createDefaultData();
  const description = getTableValue(basicSection, 'Description');
  const note = getTableValue(basicSection, 'Note');
  data.basic = {
    ...data.basic,
    entity: getTableValue(basicSection, 'Entity'),
    tableName: getTableValue(basicSection, 'Table'),
    category: getTableValue(basicSection, 'Category'),
    description: [description, note].filter(Boolean).join('\n'),
    createdAtColumn: getTableValue(operationSection, '생성일시 컬럼')
      || getTableValue(operationSection, 'Created At Column'),
    updatedAtColumn: getTableValue(operationSection, '수정일시 컬럼')
      || getTableValue(operationSection, 'Updated At Column'),
    deletePolicy: normalizeDeletePolicy(
      getTableValue(operationSection, '삭제 방식') || getTableValue(operationSection, 'Soft Delete'),
    ),
    deletedAtColumn: getTableValue(operationSection, '삭제일시 컬럼')
      || getTableValue(operationSection, 'Deleted At Column'),
    retention: getTableValue(operationSection, '보관 / 파기 기준')
      || getTableValue(operationSection, '데이터 보관 기간'),
    sensitiveData: normalizeSensitiveDataPolicy(getTableValue(operationSection, '개인정보 / 민감정보')),
    operationMemo: getTableValue(operationSection, '운영 메모'),
  };
  data.columns = parseRows(markdown, '컬럼 정의', 'columns');
  data.indexes = parseRows(markdown, '인덱스 정의', 'indexes');
  data.constraints = parseRows(markdown, '제약조건', 'constraints');
  return data;
};

const createCellInput = (section, row, rowIndex, key, type) => {
  const input = document.createElement('input');
  input.className = 'table-cell-input';
  input.type = type;
  input.value = row[key] || '';
  if (section === 'constraints' && CONSTRAINT_REFERENCE_FIELDS.has(key) && row.type !== 'FK') {
    input.disabled = true;
    input.placeholder = 'FK 선택 시 입력';
  }
  input.addEventListener('input', () => {
    row[key] = input.value;
    updatePreview();
  });
  input.addEventListener('change', () => {
    if (section === 'constraints' && key === 'referenceColumn') {
      input.value = normalizeCommaSeparatedValue(input.value);
    }
    row[key] = input.value;
    updatePreview();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    if (section === 'constraints' && key === 'referenceColumn') {
      input.value = normalizeCommaSeparatedValue(input.value);
      row[key] = input.value;
      updatePreview();
    }
    addRow(section, {}, { afterIndex: rowIndex, focusNewRow: true });
  });
  input.dataset.section = section;
  input.dataset.rowIndex = String(rowIndex);
  input.dataset.key = key;
  return input;
};

const createCellSelect = (section, row, rowIndex, key, options) => {
  const select = document.createElement('select');
  select.className = 'table-cell-input';
  options.forEach((optionValue) => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue || '선택';
    select.append(option);
  });
  select.value = row[key] || '';
  select.addEventListener('change', () => {
    row[key] = select.value;
    if (section === 'constraints' && key === 'type') {
      row._expanded = Boolean(row[key]);
      if (row[key] !== 'FK') {
        CONSTRAINT_REFERENCE_FIELDS.forEach((fieldKey) => {
          row[fieldKey] = '';
        });
      }
      if (row[key] !== 'Check') {
        row.condition = '';
      }
    }
    renderRows(section);
    updatePreview();
    window.requestAnimationFrame(() => {
      dom.rows[section]?.querySelector(`[data-row-index="${rowIndex}"][data-key="${key}"]`)?.focus();
    });
  });
  select.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    addRow(section, {}, { afterIndex: rowIndex, focusNewRow: true });
  });
  select.dataset.section = section;
  select.dataset.rowIndex = String(rowIndex);
  select.dataset.key = key;
  return select;
};

const getDefinedColumnNames = () => {
  const seen = new Set();
  return (state.data?.columns || [])
    .map((column) => normalizeText(column.column))
    .filter(Boolean)
    .filter((column) => {
      const lowerColumn = column.toLowerCase();
      if (seen.has(lowerColumn)) return false;
      seen.add(lowerColumn);
      return true;
    });
};

const findDefinedColumnName = (value) => {
  const lowerValue = normalizeText(value).toLowerCase();
  if (!lowerValue) return '';
  return getDefinedColumnNames().find((column) => column.toLowerCase() === lowerValue) || '';
};

const isDefinedColumnName = (value) => Boolean(findDefinedColumnName(value));

const getColumnNameSuggestions = (query, selectedColumns) => {
  const lowerQuery = normalizeText(query).toLowerCase();
  if (!lowerQuery) return [];
  const selectedSet = new Set(selectedColumns.map((column) => column.toLowerCase()));
  return getDefinedColumnNames()
    .filter((column) => !selectedSet.has(column.toLowerCase()))
    .filter((column) => column.toLowerCase().startsWith(lowerQuery))
    .slice(0, 8);
};

const expandConstraintRow = (rowIndex) => {
  const row = state.data?.constraints?.[rowIndex];
  if (!row || row._expanded) return false;
  row._expanded = true;
  renderRows('constraints');
  return true;
};

const setColumnPickerError = (section, rowIndex, key = 'columns', { scroll = false } = {}) => {
  const picker = dom.rows[section]?.querySelector(
    `.index-column-picker[data-row-index="${rowIndex}"][data-key="${key}"]`,
  );
  if (!picker) {
    if (section === 'constraints' && expandConstraintRow(rowIndex)) {
      window.requestAnimationFrame(() => setColumnPickerError(section, rowIndex, key, { scroll }));
    }
    return;
  }
  picker.classList.remove('is-error', 'shake');
  window.requestAnimationFrame(() => {
    picker.classList.add('is-error', 'shake');
    if (scroll) picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  window.setTimeout(() => picker.classList.remove('is-error', 'shake'), 1500);
};

const setIndexColumnPickerError = (rowIndex, options) => {
  setColumnPickerError('indexes', rowIndex, 'columns', options);
};

const setTableRowFieldError = (section, rowIndex, key) => {
  const field = dom.rows[section]?.querySelector(
    `.table-cell-input[data-row-index="${rowIndex}"][data-key="${key}"]`,
  );
  if (!field) {
    if (section === 'constraints' && expandConstraintRow(rowIndex)) {
      window.requestAnimationFrame(() => setTableRowFieldError(section, rowIndex, key));
    }
    return;
  }
  field.classList.remove('is-error', 'shake');
  window.requestAnimationFrame(() => {
    field.classList.add('is-error', 'shake');
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  window.setTimeout(() => field.classList.remove('is-error', 'shake'), 1500);
};

const appendColumnPickerTokens = (section, rowIndex, key, value, { keepInvalidTokens = false } = {}) => {
  const row = state.data?.[section]?.[rowIndex];
  if (!row) return { hasTokens: false, hasInvalidToken: false, invalidTokens: [] };
  const rawTokens = parseColumnTokens(value);
  if (rawTokens.length === 0) return { hasTokens: false, hasInvalidToken: false, invalidTokens: [] };
  const currentTokens = parseColumnTokens(row[key]);
  const invalidTokens = [];
  rawTokens.forEach((token) => {
    const definedColumn = findDefinedColumnName(token);
    if (!definedColumn) {
      invalidTokens.push(token);
      if (keepInvalidTokens) {
        const alreadySelected = currentTokens.some((column) => column.toLowerCase() === token.toLowerCase());
        if (!alreadySelected) currentTokens.push(token);
      }
      return;
    }
    const nextToken = definedColumn;
    const alreadySelected = currentTokens.some(
      (column) => column.toLowerCase() === nextToken.toLowerCase(),
    );
    if (!alreadySelected) currentTokens.push(nextToken);
  });
  row[key] = currentTokens.join(', ');
  return {
    hasTokens: rawTokens.length > 0,
    hasInvalidToken: invalidTokens.length > 0,
    invalidTokens,
  };
};

const removeInvalidColumnPickerTokens = (section, rowIndex, key) => {
  const row = state.data?.[section]?.[rowIndex];
  if (!row) return;
  const nextTokens = parseColumnTokens(row[key]).filter((column) => isDefinedColumnName(column));
  row[key] = nextTokens.join(', ');
  renderRows(section);
  updatePreview();
};

const commitPendingColumnPickerInputs = () => {
  let hasCommittedInput = false;
  let hasInvalidToken = false;
  ['indexes', 'constraints'].forEach((sectionName) => {
    dom.rows[sectionName]?.querySelectorAll('.index-column-input').forEach((input) => {
      if (!normalizeText(input.value)) return;
      const picker = input.closest('.index-column-picker');
      const section = picker?.dataset.section || sectionName;
      const key = picker?.dataset.key || 'columns';
      const rowIndex = Number.parseInt(String(picker?.dataset.rowIndex), 10);
      const result = appendColumnPickerTokens(section, rowIndex, key, input.value);
      input.value = '';
      hasCommittedInput = hasCommittedInput || result.hasTokens;
      hasInvalidToken = hasInvalidToken || result.hasInvalidToken;
      if (result.hasInvalidToken) setColumnPickerError(section, rowIndex, key, { scroll: true });
    });
  });
  if (hasCommittedInput) {
    renderRows('indexes');
    renderRows('constraints');
    updatePreview();
  }
  return !hasInvalidToken;
};

const createColumnPicker = (section, row, rowIndex, key) => {
  const picker = document.createElement('div');
  picker.className = 'index-column-picker';
  picker.dataset.section = section;
  picker.dataset.rowIndex = String(rowIndex);
  picker.dataset.key = key;

  const chipList = document.createElement('div');
  chipList.className = 'index-column-chip-list';

  const input = document.createElement('input');
  input.className = 'index-column-input';
  input.type = 'text';
  input.placeholder = '컬럼 입력';
  input.setAttribute('aria-label', '인덱스 컬럼 입력');

  const suggestions = document.createElement('div');
  suggestions.className = 'index-column-suggestions';
  suggestions.dataset.indexColumnPortal = 'true';
  suggestions.hidden = true;
  document.body.append(suggestions);

  const syncValue = (tokens) => {
    row[key] = tokens.join(', ');
    updatePreview();
  };

  const positionSuggestions = () => {
    const rect = picker.getBoundingClientRect();
    suggestions.style.left = `${rect.left}px`;
    suggestions.style.top = `${rect.bottom + 4}px`;
    suggestions.style.width = `${rect.width}px`;
  };

  const renderSuggestions = () => {
    const tokens = parseColumnTokens(row[key]);
    const suggestionItems = getColumnNameSuggestions(input.value, tokens);
    suggestions.replaceChildren();
    suggestions.hidden = suggestionItems.length === 0;
    if (suggestionItems.length === 0) return;
    positionSuggestions();
    suggestionItems.forEach((suggestion) => {
      const button = document.createElement('button');
      button.className = 'index-column-suggestion';
      button.type = 'button';
      button.textContent = suggestion;
      button.addEventListener('mousedown', (event) => event.preventDefault());
      button.addEventListener('click', () => {
        const nextTokens = [...parseColumnTokens(row[key]), suggestion];
        syncValue(nextTokens);
        input.value = '';
        renderChips();
        renderSuggestions();
        input.focus();
      });
      suggestions.append(button);
    });
  };

  const commitInputValue = () => {
    const result = appendColumnPickerTokens(section, rowIndex, key, input.value, { keepInvalidTokens: true });
    if (!result.hasTokens) return true;
    input.value = '';
    renderChips();
    renderSuggestions();
    updatePreview();
    if (result.hasInvalidToken) {
      setColumnPickerError(section, rowIndex, key);
      window.setTimeout(
        () => removeInvalidColumnPickerTokens(section, rowIndex, key),
        INVALID_INDEX_COLUMN_CHIP_REMOVE_DELAY,
      );
    }
    return !result.hasInvalidToken;
  };

  const removeToken = (tokenIndex) => {
    const nextTokens = parseColumnTokens(row[key]).filter((_, index) => index !== tokenIndex);
    syncValue(nextTokens);
    renderChips();
    renderSuggestions();
  };

  const renderChips = () => {
    chipList.replaceChildren();
    parseColumnTokens(row[key]).forEach((token, tokenIndex) => {
      const chip = document.createElement('span');
      chip.className = `index-column-chip ${isDefinedColumnName(token) ? '' : 'invalid'}`.trim();
      chip.textContent = token;
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', `${token} 제거`);
      removeButton.addEventListener('click', () => removeToken(tokenIndex));
      chip.append(removeButton);
      chipList.append(chip);
    });
  };

  input.addEventListener('input', () => {
    if (input.value.includes(',')) commitInputValue();
    renderSuggestions();
  });
  input.addEventListener('focus', () => {
    renderChips();
    renderSuggestions();
  });
  input.addEventListener('blur', () => {
    window.setTimeout(() => {
      commitInputValue();
      suggestions.hidden = true;
    }, 120);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const firstSuggestion = suggestions.querySelector('.index-column-suggestion');
      if (firstSuggestion && normalizeText(input.value)) {
        firstSuggestion.click();
        return;
      }
      if (commitInputValue()) {
        addRow(section, {}, { afterIndex: rowIndex, focusNewRow: true });
      }
      return;
    }
    if (event.key === 'Backspace' && !input.value) {
      const tokens = parseColumnTokens(row.columns);
      if (tokens.length === 0) return;
      removeToken(tokens.length - 1);
    }
  });
  picker.addEventListener('click', (event) => {
    if (event.target instanceof HTMLButtonElement) return;
    input.focus();
  });

  renderChips();
  picker.append(chipList, input);
  return picker;
};

const createCellToggle = (section, row, rowIndex, key) => {
  const button = document.createElement('button');
  button.className = `toggle-button ${row[key] ? 'active' : ''}`;
  button.type = 'button';
  button.textContent = toYesNo(row[key]);
  button.setAttribute('aria-label', key);
  button.setAttribute('aria-pressed', row[key] ? 'true' : 'false');
  button.dataset.section = section;
  button.dataset.rowIndex = String(rowIndex);
  button.dataset.key = key;
  button.addEventListener('click', () => {
    row[key] = !row[key];
    button.textContent = toYesNo(row[key]);
    button.classList.toggle('active', row[key]);
    button.setAttribute('aria-pressed', row[key] ? 'true' : 'false');
    updatePreview();
  });
  return button;
};

const clearRowDragIndicators = (container) => {
  container?.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
    element.classList.remove('drag-over-before', 'drag-over-after');
  });
};

const getRowDropPosition = (event, rowElement) => {
  const rect = rowElement.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
};

const moveRow = (section, fromIndex, targetIndex, position) => {
  const rows = state.data[section];
  if (fromIndex < 0 || targetIndex < 0 || fromIndex >= rows.length || targetIndex >= rows.length) return;
  let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
  if (fromIndex < insertIndex) insertIndex -= 1;
  if (fromIndex === insertIndex) return;
  const [movedRow] = rows.splice(fromIndex, 1);
  rows.splice(insertIndex, 0, movedRow);
  renderRows(section);
  updatePreview();
};

const bindRowDropEvents = (section, rowElement, scopeElement, index) => {
  rowElement.addEventListener('dragover', (event) => {
    if (![...event.dataTransfer.types].includes(TABLE_ROW_DRAG_DATA_TYPE)) return;
    event.preventDefault();
    const position = getRowDropPosition(event, rowElement);
    clearRowDragIndicators(scopeElement);
    rowElement.classList.add(position === 'before' ? 'drag-over-before' : 'drag-over-after');
  });
  rowElement.addEventListener('dragleave', () => {
    rowElement.classList.remove('drag-over-before', 'drag-over-after');
  });
  rowElement.addEventListener('drop', (event) => {
    event.preventDefault();
    const position = getRowDropPosition(event, rowElement);
    rowElement.classList.remove('drag-over-before', 'drag-over-after');
    const dragData = JSON.parse(event.dataTransfer.getData(TABLE_ROW_DRAG_DATA_TYPE) || '{}');
    if (dragData.section !== section) return;
    const fromIndex = Number.parseInt(String(dragData.index), 10);
    moveRow(section, fromIndex, index, position);
  });
};

const createRowDragHandle = (section, index, rowElement, scopeElement) => {
  const dragHandle = document.createElement('button');
  dragHandle.className = 'drag-handle table-row-drag-handle';
  dragHandle.type = 'button';
  dragHandle.draggable = true;
  dragHandle.textContent = '::';
  dragHandle.setAttribute('aria-label', '행 순서 변경');
  dragHandle.addEventListener('dragstart', (event) => {
    event.dataTransfer.effectAllowed = 'move';
    const dragData = JSON.stringify({ section, index });
    event.dataTransfer.setData(TABLE_ROW_DRAG_DATA_TYPE, dragData);
    event.dataTransfer.setData('text/plain', dragData);
    rowElement.classList.add('dragging');
  });
  dragHandle.addEventListener('dragend', () => {
    rowElement.classList.remove('dragging');
    clearRowDragIndicators(scopeElement);
  });
  return dragHandle;
};

const createConstraintInput = (row, rowIndex, key, placeholder = '') => {
  const input = createCellInput('constraints', row, rowIndex, key, 'text');
  input.placeholder = placeholder;
  return input;
};

const createConstraintActionControl = (row, rowIndex, key) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'constraint-action-control';
  const normalizedValue = normalizeText(row[key]);
  const customModeKey = `_${key}Custom`;
  const isCustomValue = Boolean(row[customModeKey])
    || (Boolean(normalizedValue) && !FK_ACTION_OPTIONS.includes(normalizedValue));

  const input = createConstraintInput(row, rowIndex, key, isCustomValue ? '직접 입력' : '선택');
  input.classList.add('constraint-action-input');
  input.readOnly = !isCustomValue;
  input.value = row[key] || '';
  input.addEventListener('click', () => {
    if (!isCustomValue) openMenu();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    addRow('constraints', {}, { afterIndex: rowIndex, focusNewRow: true });
  });

  const toggleButton = document.createElement('button');
  toggleButton.className = 'constraint-action-toggle';
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-label', 'FK 동작 선택');
  toggleButton.setAttribute('aria-expanded', 'false');
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'constraint-action-toggle-icon';
  toggleIcon.setAttribute('aria-hidden', 'true');
  toggleButton.append(toggleIcon);

  const menu = document.createElement('div');
  menu.className = 'constraint-action-menu';
  menu.hidden = true;

  let outsideHandler = null;
  const closeMenu = () => {
    wrapper.classList.remove('is-open');
    menu.hidden = true;
    toggleButton.setAttribute('aria-expanded', 'false');
    if (outsideHandler) {
      document.removeEventListener('pointerdown', outsideHandler);
      outsideHandler = null;
    }
  };
  const openMenu = () => {
    document.querySelectorAll('.constraint-action-control.is-open').forEach((control) => {
      if (control === wrapper) return;
      control.classList.remove('is-open');
      control.querySelector('.constraint-action-menu')?.setAttribute('hidden', '');
      control.querySelector('.constraint-action-toggle')?.setAttribute('aria-expanded', 'false');
    });
    wrapper.classList.add('is-open');
    menu.hidden = false;
    toggleButton.setAttribute('aria-expanded', 'true');
    outsideHandler = (event) => {
      if (!wrapper.contains(event.target)) closeMenu();
    };
    window.setTimeout(() => document.addEventListener('pointerdown', outsideHandler), 0);
  };
  const selectAction = (value) => {
    closeMenu();
    if (value === FK_ACTION_CUSTOM_VALUE) {
      row[customModeKey] = true;
      row[key] = FK_ACTION_OPTIONS.includes(normalizeText(row[key])) ? '' : row[key] || '';
    } else {
      row[customModeKey] = false;
      row[key] = value;
    }
    renderRows('constraints');
    updatePreview();
    window.requestAnimationFrame(() => {
      const nextInput = dom.rows.constraints
        ?.querySelector(`[data-row-index="${rowIndex}"][data-key="${key}"]`);
      nextInput?.focus();
    });
  };

  [...FK_ACTION_OPTIONS, FK_ACTION_CUSTOM_VALUE].forEach((optionValue) => {
    const optionButton = document.createElement('button');
    optionButton.className = 'constraint-action-option';
    optionButton.type = 'button';
    optionButton.textContent = optionValue === FK_ACTION_CUSTOM_VALUE ? 'Custom' : optionValue || '선택';
    optionButton.dataset.value = optionValue;
    if ((isCustomValue && optionValue === FK_ACTION_CUSTOM_VALUE)
      || (!isCustomValue && optionValue === normalizedValue)) {
      optionButton.classList.add('active');
    }
    optionButton.addEventListener('click', () => selectAction(optionValue));
    menu.append(optionButton);
  });

  toggleButton.addEventListener('click', () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });
  toggleButton.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
    input.focus();
  });

  wrapper.append(input, toggleButton, menu);
  return wrapper;
};

const createConstraintField = (label, control, {
  wide = false,
  required = false,
  helper = '',
  className = '',
} = {}) => {
  const field = document.createElement('div');
  field.className = `constraint-card-field ${wide ? 'wide' : ''} ${className}`.trim();
  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  if (required) {
    const requiredMarker = document.createElement('span');
    requiredMarker.className = 'table-required-marker';
    requiredMarker.textContent = '*';
    labelElement.append(requiredMarker);
  }
  field.append(labelElement, control);
  if (helper) {
    const helperElement = document.createElement('small');
    helperElement.textContent = helper;
    field.append(helperElement);
  }
  return field;
};

const appendConstraintFields = (container, fields) => {
  fields.forEach((field) => container.append(field));
};

const createConstraintTypeFields = (row, index) => {
  const fields = document.createElement('div');
  fields.className = 'constraint-card-fields';

  if (!row.type) {
    const hint = document.createElement('p');
    hint.className = 'constraint-card-hint wide';
    hint.textContent = '종류를 선택하면 필요한 입력 항목이 나타납니다.';
    fields.append(hint);
    return fields;
  }

  if (row.type === 'FK') {
    appendConstraintFields(fields, [
      createConstraintField('대상 컬럼', createColumnPicker('constraints', row, index, 'columns'), {
        wide: true,
        required: true,
        helper: '현재 테이블에서 참조 관계를 거는 컬럼입니다.\n복합 FK는 순서대로 여러 컬럼을 넣습니다.',
      }),
      createConstraintField('참조 테이블', createConstraintInput(row, index, 'referenceTable', 'users'), {
        required: true,
        helper: ' ',
        className: 'constraint-card-field-aligned',
      }),
      createConstraintField('참조 컬럼', createConstraintInput(row, index, 'referenceColumn', 'id'), {
        required: true,
        helper: '복합 FK라면 대상 컬럼 순서에 맞춰 쉼표로 입력합니다.',
        className: 'constraint-card-field-aligned',
      }),
      createConstraintField('On Update', createConstraintActionControl(row, index, 'onUpdate')),
      createConstraintField('On Delete', createConstraintActionControl(row, index, 'onDelete')),
    ]);
    return fields;
  }

  if (row.type === 'Composite PK') {
    appendConstraintFields(fields, [
      createConstraintField('대상 컬럼', createColumnPicker('constraints', row, index, 'columns'), {
        wide: true,
        required: true,
        helper: '두 개 이상의 컬럼을 하나의 기본키로 묶을 때 사용합니다.',
      }),
    ]);
    return fields;
  }

  if (row.type === 'Unique') {
    appendConstraintFields(fields, [
      createConstraintField('대상 컬럼', createColumnPicker('constraints', row, index, 'columns'), {
        wide: true,
        required: true,
        helper: '여러 컬럼 조합의 중복을 막을 때 사용합니다.\n단일 컬럼이면 컬럼 정의의 Unique로도 충분합니다.',
      }),
    ]);
    return fields;
  }

  if (row.type === 'Check') {
    appendConstraintFields(fields, [
      createConstraintField('대상 컬럼', createColumnPicker('constraints', row, index, 'columns'), {
        wide: true,
        helper: '조건과 관련된 컬럼을 적습니다.\n테이블 전체 조건이면 비워둘 수 있습니다.',
      }),
      createConstraintField('조건', createConstraintInput(row, index, 'condition', 'amount > 0'), {
        wide: true,
        required: true,
        helper: 'DB CHECK 절에 들어갈 조건을 적습니다.',
      }),
    ]);
  }

  return fields;
};

const renderConstraintCards = (container) => {
  const tableElement = document.createElement('div');
  tableElement.className = 'field-table table-definition-field-table constraint-field-table';

  const headerElement = document.createElement('div');
  headerElement.className = 'field-table-head table-constraint-summary-row';
  const dragHeaderCell = document.createElement('span');
  dragHeaderCell.setAttribute('aria-hidden', 'true');
  headerElement.append(dragHeaderCell);
  [
    { label: '종류', required: true },
    '제약명',
    '설명',
  ].forEach((header) => {
    const headerCell = document.createElement('span');
    const label = typeof header === 'string' ? header : header.label;
    headerCell.textContent = label;
    if (typeof header !== 'string' && header.required) {
      const requiredMarker = document.createElement('span');
      requiredMarker.className = 'table-required-marker';
      requiredMarker.textContent = '*';
      headerCell.append(requiredMarker);
    }
    headerElement.append(headerCell);
  });
  const expandHeaderCell = document.createElement('span');
  expandHeaderCell.setAttribute('aria-hidden', 'true');
  const actionHeaderCell = document.createElement('span');
  actionHeaderCell.setAttribute('aria-hidden', 'true');
  headerElement.append(expandHeaderCell, actionHeaderCell);
  tableElement.append(headerElement);

  state.data.constraints.forEach((row, index) => {
    const rowGroup = document.createElement('div');
    rowGroup.className = 'constraint-row-group draggable-row';
    bindRowDropEvents('constraints', rowGroup, tableElement, index);

    const rowElement = document.createElement('div');
    rowElement.className = 'row table-constraint-summary-row';
    rowElement.append(createRowDragHandle('constraints', index, rowGroup, tableElement));

    const typeSelect = createCellSelect('constraints', row, index, 'type', CONSTRAINT_TYPE_OPTIONS);
    rowElement.append(typeSelect);
    rowElement.append(createConstraintInput(row, index, 'name', 'fk_orders_user_id'));
    rowElement.append(createConstraintInput(row, index, 'description', '관계 또는 규칙 설명'));

    const expandButton = document.createElement('button');
    expandButton.className = 'constraint-expand-button';
    expandButton.type = 'button';
    expandButton.setAttribute('aria-label', row._expanded ? '상세 접기' : '상세 펼치기');
    expandButton.setAttribute('aria-expanded', row._expanded ? 'true' : 'false');
    const expandIcon = document.createElement('span');
    expandIcon.className = 'constraint-expand-icon';
    expandIcon.setAttribute('aria-hidden', 'true');
    expandButton.append(expandIcon);
    expandButton.addEventListener('click', () => {
      row._expanded = !row._expanded;
      renderRows('constraints');
    });
    rowElement.append(expandButton);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', '제약조건 삭제');
    removeButton.addEventListener('click', () => {
      state.data.constraints.splice(index, 1);
      renderRows('constraints');
      updatePreview();
    });
    rowElement.append(removeButton);
    rowGroup.append(rowElement);

    if (row._expanded) {
      const detailPanel = document.createElement('div');
      detailPanel.className = 'constraint-detail-panel';
      const detailFields = createConstraintTypeFields(row, index);
      detailFields.append(
        createConstraintField('메모', createConstraintInput(row, index, 'remark', '운영 메모'), { wide: true }),
      );
      detailPanel.append(detailFields);
      rowGroup.append(detailPanel);
    }

    tableElement.append(rowGroup);
  });

  container.append(tableElement);
};

const renderRows = (section) => {
  const container = dom.rows[section];
  if (!container) return;
  if (section === 'indexes' || section === 'constraints') {
    document.querySelectorAll('.index-column-suggestions[data-index-column-portal="true"]').forEach((element) => {
      element.remove();
    });
  }
  container.replaceChildren();
  if (section === 'constraints') {
    renderConstraintCards(container);
    return;
  }
  const uiDefinition = tableUiDefinitions[section];
  const tableElement = document.createElement('div');
  tableElement.className = 'field-table table-definition-field-table';

  const headerElement = document.createElement('div');
  headerElement.className = `field-table-head ${uiDefinition.className}`.trim();
  const dragHeaderCell = document.createElement('span');
  dragHeaderCell.setAttribute('aria-hidden', 'true');
  headerElement.append(dragHeaderCell);
  uiDefinition.headers.forEach((header) => {
    const headerCell = document.createElement('span');
    const label = typeof header === 'string' ? header : header.label;
    headerCell.textContent = label;
    if (typeof header !== 'string' && header.required) {
      const requiredMarker = document.createElement('span');
      requiredMarker.className = 'table-required-marker';
      requiredMarker.textContent = '*';
      headerCell.append(requiredMarker);
    }
    headerElement.append(headerCell);
  });
  const actionHeaderCell = document.createElement('span');
  actionHeaderCell.setAttribute('aria-hidden', 'true');
  headerElement.append(actionHeaderCell);
  tableElement.append(headerElement);

  state.data[section].forEach((row, index) => {
    const rowElement = document.createElement('div');
    rowElement.className = `row ${uiDefinition.className} draggable-row`;
    rowElement.addEventListener('dragover', (event) => {
      if (![...event.dataTransfer.types].includes(TABLE_ROW_DRAG_DATA_TYPE)) return;
      event.preventDefault();
      const position = getRowDropPosition(event, rowElement);
      clearRowDragIndicators(tableElement);
      rowElement.classList.add(position === 'before' ? 'drag-over-before' : 'drag-over-after');
    });
    rowElement.addEventListener('dragleave', () => {
      rowElement.classList.remove('drag-over-before', 'drag-over-after');
    });
    rowElement.addEventListener('drop', (event) => {
      event.preventDefault();
      const position = getRowDropPosition(event, rowElement);
      rowElement.classList.remove('drag-over-before', 'drag-over-after');
      const dragData = JSON.parse(event.dataTransfer.getData(TABLE_ROW_DRAG_DATA_TYPE) || '{}');
      if (dragData.section !== section) return;
      const fromIndex = Number.parseInt(String(dragData.index), 10);
      moveRow(section, fromIndex, index, position);
    });

    const dragHandle = document.createElement('button');
    dragHandle.className = 'drag-handle table-row-drag-handle';
    dragHandle.type = 'button';
    dragHandle.draggable = true;
    dragHandle.textContent = '::';
    dragHandle.setAttribute('aria-label', '행 순서 변경');
    dragHandle.addEventListener('dragstart', (event) => {
      event.dataTransfer.effectAllowed = 'move';
      const dragData = JSON.stringify({ section, index });
      event.dataTransfer.setData(TABLE_ROW_DRAG_DATA_TYPE, dragData);
      event.dataTransfer.setData('text/plain', dragData);
      rowElement.classList.add('dragging');
    });
    dragHandle.addEventListener('dragend', () => {
      rowElement.classList.remove('dragging');
      clearRowDragIndicators(tableElement);
    });
    rowElement.append(dragHandle);

    uiDefinition.fields.forEach(([key, type]) => {
      if ((section === 'indexes' || section === 'constraints') && key === 'columns') {
        rowElement.append(createColumnPicker(section, row, index, key));
        return;
      }
      if (type === 'constraintType') {
        rowElement.append(createCellSelect(section, row, index, key, CONSTRAINT_TYPE_OPTIONS));
        return;
      }
      if (type === 'checkbox') {
        rowElement.append(createCellToggle(section, row, index, key));
        return;
      }
      rowElement.append(createCellInput(section, row, index, key, type));
    });

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', '행 삭제');
    removeButton.addEventListener('click', () => {
      state.data[section].splice(index, 1);
      renderRows(section);
      updatePreview();
    });
    rowElement.append(removeButton);
    tableElement.append(rowElement);
  });

  container.append(tableElement);
};

const renderAll = () => {
  setBasicFieldValues();
  Object.keys(rowDefinitions).forEach(renderRows);
};

const focusFirstInputInRow = (section, rowIndex) => {
  window.requestAnimationFrame(() => {
    const rowElement = dom.rows[section]?.querySelectorAll('.row, .constraint-card')[rowIndex];
    rowElement?.querySelector('input')?.focus();
  });
};

const addRow = (section, values = {}, options = {}) => {
  const insertIndex = Number.isInteger(options.afterIndex) ? options.afterIndex + 1 : state.data[section].length;
  state.data[section].splice(insertIndex, 0, { ...createEmptyRow(section), ...values });
  renderRows(section);
  updatePreview();
  if (options.focusNewRow ?? true) {
    focusFirstInputInRow(section, insertIndex);
  }
};

const createFileNameSegment = (value) => String(value || '')
    .trim()
    .replace(/[{}]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const buildFileName = () => {
  readBasicFieldValues();
  const safeParts = [
    state.data.basic.category,
    state.data.basic.entity,
    state.data.basic.tableName,
  ].map(createFileNameSegment).filter(Boolean);
  return `${safeParts.join('-') || 'table-definition'}.md`;
};

const setFieldError = (fieldName) => {
  const field = dom.form.elements[fieldName];
  field?.classList.remove('is-error', 'shake');
  window.requestAnimationFrame(() => {
    field?.classList.add('is-error', 'shake');
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  window.setTimeout(() => field?.classList.remove('is-error', 'shake'), 1500);
};

const validateIndexColumns = () => {
  const incompleteIndex = state.data.indexes.findIndex((indexRow) => {
    if (!isRowMeaningful('indexes', indexRow)) return false;
    return !normalizeText(indexRow.name) || parseColumnTokens(indexRow.columns).length === 0;
  });
  if (incompleteIndex >= 0) {
    const incompleteRow = state.data.indexes[incompleteIndex];
    if (!normalizeText(incompleteRow.name)) {
      setTableRowFieldError('indexes', incompleteIndex, 'name');
      showToast('warning', '인덱스 정보 누락', 'Index Name 값을 입력해주세요.');
      return false;
    }
    setIndexColumnPickerError(incompleteIndex, { scroll: true });
    showToast('warning', '인덱스 정보 누락', 'Columns 값을 입력해주세요.');
    return false;
  }
  const invalidIndex = state.data.indexes.findIndex((indexRow) =>
    parseColumnTokens(indexRow.columns).some((column) => !isDefinedColumnName(column)),
  );
  if (invalidIndex < 0) return true;
  const invalidColumn = parseColumnTokens(state.data.indexes[invalidIndex].columns).find(
    (column) => !isDefinedColumnName(column),
  );
  setIndexColumnPickerError(invalidIndex, { scroll: true });
  showToast('warning', '인덱스 컬럼 오류', `${invalidColumn} 컬럼이 컬럼 정의에 없습니다.`);
  return false;
};

const validateConstraintColumns = () => {
  const incompleteIndex = state.data.constraints.findIndex((constraintRow) => {
    if (!isRowMeaningful('constraints', constraintRow)) return false;
    const type = normalizeText(constraintRow.type);
    if (!type) return true;
    if (CONSTRAINT_COLUMN_REQUIRED_TYPES.has(type) && parseColumnTokens(constraintRow.columns).length === 0) {
      return true;
    }
    if (type === 'Check' && !normalizeText(constraintRow.condition)) return true;
    return false;
  });
  if (incompleteIndex >= 0) {
    const incompleteRow = state.data.constraints[incompleteIndex];
    if (!normalizeText(incompleteRow.type)) {
      setTableRowFieldError('constraints', incompleteIndex, 'type');
      showToast('warning', '제약조건 정보 누락', '종류 값을 선택해주세요.');
      return false;
    }
    if (incompleteRow.type === 'Check') {
      setTableRowFieldError('constraints', incompleteIndex, 'condition');
      showToast('warning', '제약조건 정보 누락', '조건 값을 입력해주세요.');
      return false;
    }
    setColumnPickerError('constraints', incompleteIndex, 'columns', { scroll: true });
    showToast('warning', '제약조건 정보 누락', '대상 컬럼 값을 입력해주세요.');
    return false;
  }

  const invalidIndex = state.data.constraints.findIndex((constraintRow) =>
    parseColumnTokens(constraintRow.columns).some((column) => !isDefinedColumnName(column)),
  );
  if (invalidIndex >= 0) {
    const invalidColumn = parseColumnTokens(state.data.constraints[invalidIndex].columns).find(
      (column) => !isDefinedColumnName(column),
    );
    setColumnPickerError('constraints', invalidIndex, 'columns', { scroll: true });
    showToast('warning', '제약조건 컬럼 오류', `${invalidColumn} 컬럼이 컬럼 정의에 없습니다.`);
    return false;
  }

  const incompleteFkIndex = state.data.constraints.findIndex(
    (constraintRow) =>
      constraintRow.type === 'FK' &&
      (parseColumnTokens(constraintRow.columns).length > 0 ||
        normalizeText(constraintRow.referenceTable) ||
        normalizeText(constraintRow.referenceColumn)) &&
      (!normalizeText(constraintRow.referenceTable) || !normalizeText(constraintRow.referenceColumn)),
  );
  if (incompleteFkIndex >= 0) {
    const incompleteFk = state.data.constraints[incompleteFkIndex];
    if (!normalizeText(incompleteFk.referenceTable)) {
      setTableRowFieldError('constraints', incompleteFkIndex, 'referenceTable');
      showToast('warning', 'FK 정보 누락', '참조 테이블 값을 입력해주세요.');
      return false;
    }
    setTableRowFieldError('constraints', incompleteFkIndex, 'referenceColumn');
    showToast('warning', 'FK 정보 누락', '참조 컬럼 값을 입력해주세요.');
    return false;
  }

  return true;
};

const validateBeforeSave = () => {
  readBasicFieldValues();
  const requiredFields = [
    ['tableName', 'Table'],
    ['category', 'Category'],
    ['entity', 'Entity'],
  ];
  const missingField = requiredFields.find(([fieldName]) => !normalizeText(state.data.basic[fieldName]));
  if (missingField) {
    const [fieldName, label] = missingField;
    setFieldError(fieldName);
    showToast('warning', '필수 값 누락', `${label} 값을 입력해주세요.`);
    return false;
  }
  if (!commitPendingColumnPickerInputs()) {
    showToast('warning', '컬럼 오류', '컬럼 정의에 없는 값은 등록할 수 없습니다.');
    return false;
  }
  if (!validateIndexColumns()) return false;
  if (!validateConstraintColumns()) return false;
  return true;
};

const resetDocument = () => {
  if (!state.hasActiveDocument) return;
  state.data = createDefaultData();
  renderAll();
  setFormVisible(true);
  updatePreview();
  showToast('info', '초기화', '입력 중인 내용을 모두 지우고 처음 상태로 돌아갑니다.');
};

const copyMarkdown = async () => {
  if (!state.data) return;
  try {
    await navigator.clipboard.writeText(createMarkdown());
    showToast('success', '복사 완료', 'Markdown 내용을 복사했습니다.');
  } catch {
    showToast('danger', '복사 실패', 'Markdown 내용을 복사하지 못했습니다.');
  }
};

const setSaveDropdownOpen = (isOpen) => {
  if (!dom.saveMenuButton || !dom.saveDropdown) return;
  if (isOpen && dom.saveMenuButton.disabled) return;
  dom.saveDropdown.hidden = !isOpen;
  dom.saveMenuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isSaveDropdownOpen = () => Boolean(dom.saveDropdown && !dom.saveDropdown.hidden);

const closeActionDropdowns = () => {
  setSaveDropdownOpen(false);
};

const collectTableFileSummaries = async () => {
  const summaries = new Map();
  for (const file of state.files) {
    try {
      summaries.set(file.path, summarizeTableDocument(parseMarkdown(await readFileMarkdown(file)), file));
    } catch {
      summaries.set(file.path, {
        fileName: file.fileName,
        path: file.path,
        category: '미분류',
        entity: '미정',
        tableName: file.fileName,
        description: '미정',
        columns: [],
        indexes: [],
        constraints: [],
      });
    }
  }
  state.fileSummaries = summaries;
};

const refreshFileList = async () => {
  if (state.mode === 'browser') {
    const files = [];
    for await (const [name, handle] of state.browserTableHandle.entries()) {
      if (handle.kind === 'file' && /\.(md|markdown)$/i.test(name) && !name.startsWith('.')) {
        files.push({ fileName: name, path: name, handle });
      }
    }
    state.files = files.sort((a, b) => a.fileName.localeCompare(b.fileName, 'ko'));
  } else {
    const response = await fetch('/api/editor-file-list', { method: 'POST' });
    if (!response.ok) throw new Error('FILE_LIST_FAILED');
    const result = await response.json();
    state.files = result.files || [];
  }
  await collectTableFileSummaries();
  renderFileList();
  if (state.viewMode === 'viewer') await renderTableViewer();
};

const restorePendingCurrentFileConnection = async () => {
  const fileMeta = state.pendingCurrentFileMeta;
  if (!fileMeta) return false;
  const targetFile = state.files.find((file) =>
    file.path === fileMeta.path ||
    file.fileName === fileMeta.fileName ||
    (fileMeta.fileName && file.path === fileMeta.fileName),
  );

  if (!targetFile) {
    clearCurrentFileConnection();
    showToast('warning', '문서 복구 실패', '새로고침 전 열려 있던 문서 파일을 다시 읽지 못했습니다.');
    return false;
  }

  return openFile(targetFile, { restoredFromReload: true });
};

const renderFileList = () => {
  if (!dom.fileList) return;
  dom.fileList.replaceChildren();
  if (state.files.length === 0) {
    dom.fileList.append(createTextElement('p', 'file-tree-empty', '아직 저장된 문서가 없습니다.'));
    return;
  }

  const content = document.createElement('div');
  content.className = 'file-tree-content';
  const groupedFiles = state.files.reduce((groups, file) => {
    const summary = state.fileSummaries.get(file.path);
    const category = normalizeCategory(summary?.category);
    const entity = normalizeEntityGroup(summary?.entity);
    if (!groups.has(category)) groups.set(category, new Map());
    const entityGroups = groups.get(category);
    if (!entityGroups.has(entity)) entityGroups.set(entity, []);
    entityGroups.get(entity).push(file);
    return groups;
  }, new Map());

  [...groupedFiles.entries()]
    .sort(([categoryA], [categoryB]) => compareTableGroupName(categoryA, categoryB))
    .forEach(([category, entityGroups]) => {
      const categoryFolder = document.createElement('details');
      categoryFolder.className = 'file-tree-folder';
      categoryFolder.open = true;
      const categorySummary = document.createElement('summary');
      categorySummary.textContent = category;
      categoryFolder.append(categorySummary);

      const categoryChildren = document.createElement('div');
      categoryChildren.className = 'file-tree-children';
      [...entityGroups.entries()]
        .sort(([entityA], [entityB]) => compareTableGroupName(entityA, entityB))
        .forEach(([entity, files]) => {
          const entityFolder = document.createElement('details');
          entityFolder.className = 'file-tree-folder';
          entityFolder.open = true;
          const entitySummary = document.createElement('summary');
          entitySummary.textContent = entity;
          entityFolder.append(entitySummary);

          const entityChildren = document.createElement('div');
          entityChildren.className = 'file-tree-children';
          files
            .slice()
            .sort((fileA, fileB) => {
              const tableA = state.fileSummaries.get(fileA.path)?.tableName || fileA.fileName;
              const tableB = state.fileSummaries.get(fileB.path)?.tableName || fileB.fileName;
              return tableA.localeCompare(tableB, 'ko', { numeric: true, sensitivity: 'base' });
            })
            .forEach((file) => {
              const button = document.createElement('button');
              button.className = 'file-tree-file';
              button.type = 'button';
              const fileSummary = state.fileSummaries.get(file.path);
              const label = createTextElement('span', 'file-tree-file-label', fileSummary?.tableName || file.fileName);
              button.append(label);
              button.classList.toggle('active', state.currentFile?.path === file.path);
              button.addEventListener('click', () => {
                if (state.viewMode === 'viewer') {
                  scrollViewerCard(file.path);
                  return;
                }
                openFile(file);
              });
              entityChildren.append(button);
            });
          entityFolder.append(entityChildren);
          categoryChildren.append(entityFolder);
        });
      categoryFolder.append(categoryChildren);
      content.append(categoryFolder);
    });

  dom.fileList.append(content);
};

const readFileMarkdown = async (file) => {
  if (state.mode === 'browser') {
    const targetFile = await file.handle.getFile();
    return targetFile.text();
  }

  const response = await fetch('/api/read-tree-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: file.path }),
  });
  if (!response.ok) throw new Error('READ_FAILED');
  const result = await response.json();
  return result.markdown || '';
};

const summarizeTableDocument = (data, file) => ({
  fileName: file.fileName,
  path: file.path,
  category: normalizeCategory(data.basic.category),
  entity: data.basic.entity || '미정',
  tableName: data.basic.tableName || '미정',
  description: data.basic.description || '미정',
  columns: getPersistedRowsFromData(data, 'columns'),
  indexes: getPersistedRowsFromData(data, 'indexes'),
  constraints: getPersistedRowsFromData(data, 'constraints'),
  sql: generateTableSql(data),
});

const getPersistedRowsFromData = (data, section) =>
  data[section].filter((row) => isRowMeaningful(section, row));

const createViewerMeta = (label, value) => {
  const item = document.createElement('div');
  item.className = 'table-viewer-meta-item';
  item.append(createTextElement('dt', '', label), createTextElement('dd', '', value || '미정'));
  return item;
};

const createViewerColumnTable = (columns) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-viewer-table';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['한글명', 'Column', 'Type', 'PK', 'Nullable', '설명'].forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = document.createElement('tbody');
  columns.slice(0, 12).forEach((column) => {
    const row = document.createElement('tr');
    [
      column.property,
      column.column,
      [column.type, column.length].filter(Boolean).join(' '),
      toYesNo(column.pk),
      toYesNo(column.nullable),
      column.description,
    ].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value || '';
      row.append(td);
    });
    tbody.append(row);
  });
  table.append(thead, tbody);
  wrapper.append(table);
  return wrapper;
};

const createViewerSqlBlock = (sql) => {
  const wrapper = document.createElement('section');
  wrapper.className = 'table-viewer-sql';
  wrapper.append(createTextElement('h4', '', 'SQL'));
  const pre = document.createElement('pre');
  pre.textContent = sql;
  wrapper.append(pre);
  return wrapper;
};

const createViewerCard = (summary) => {
  const card = document.createElement('article');
  card.className = 'table-viewer-card';
  card.dataset.path = summary.path;

  const head = document.createElement('div');
  head.className = 'table-viewer-card-head';
  const titleGroup = document.createElement('div');
  titleGroup.append(createTextElement('h3', '', summary.tableName), createTextElement('p', '', summary.entity));
  const fileBadge = createTextElement('span', 'badge badge-neutral', summary.fileName);
  head.append(titleGroup, fileBadge);

  const meta = document.createElement('dl');
  meta.className = 'table-viewer-meta';
  meta.append(
    createViewerMeta('Category', summary.category),
    createViewerMeta('Description', summary.description),
    createViewerMeta('Columns', String(summary.columns.length)),
    createViewerMeta('Indexes', String(summary.indexes.length)),
    createViewerMeta('Constraints', String(summary.constraints.length)),
  );

  card.append(head, meta);
  if (summary.columns.length > 0) {
    card.append(createViewerColumnTable(summary.columns));
  }
  if (normalizeText(summary.sql)) {
    card.append(createViewerSqlBlock(summary.sql));
  }
  return card;
};

const renderTableViewer = async () => {
  if (state.fileSummaries.size !== state.files.length) {
    await collectTableFileSummaries();
  }
  const summaries = state.files
    .map((file) => state.fileSummaries.get(file.path))
    .filter(Boolean);

  const groupedSummaries = summaries.reduce((groups, summary) => {
    const category = normalizeCategory(summary.category);
    const entity = normalizeEntityGroup(summary.entity);
    if (!groups.has(category)) groups.set(category, new Map());
    const entityGroups = groups.get(category);
    if (!entityGroups.has(entity)) entityGroups.set(entity, []);
    entityGroups.get(entity).push(summary);
    return groups;
  }, new Map());

  const fragment = document.createDocumentFragment();
  [...groupedSummaries.entries()]
    .sort(([categoryA], [categoryB]) => compareTableGroupName(categoryA, categoryB))
    .forEach(([category, entityGroups]) => {
      const group = document.createElement('section');
      group.className = 'spec-tag-group';
      const tableCount = [...entityGroups.values()].reduce((count, entitySummaries) => count + entitySummaries.length, 0);

      const heading = document.createElement('button');
      heading.className = 'spec-tag-heading';
      heading.type = 'button';
      heading.setAttribute('aria-expanded', 'true');
      heading.append(createTextElement('h3', '', category), createTextElement('span', '', `${tableCount}개`));

      const content = document.createElement('div');
      content.className = 'spec-tag-content';
      [...entityGroups.entries()]
        .sort(([entityA], [entityB]) => compareTableGroupName(entityA, entityB))
        .forEach(([entity, entitySummaries]) => {
          const entityGroup = document.createElement('section');
          entityGroup.className = 'spec-tag-group table-entity-group';

          const entityHeading = document.createElement('button');
          entityHeading.className = 'spec-tag-heading';
          entityHeading.type = 'button';
          entityHeading.setAttribute('aria-expanded', 'true');
          entityHeading.append(createTextElement('h3', '', entity), createTextElement('span', '', `${entitySummaries.length}개`));

          const entityContent = document.createElement('div');
          entityContent.className = 'spec-tag-content';
          entitySummaries
            .slice()
            .sort((summaryA, summaryB) =>
              String(summaryA.tableName).localeCompare(String(summaryB.tableName), 'ko', { numeric: true, sensitivity: 'base' }),
            )
            .forEach((summary) => {
              entityContent.append(createViewerCard(summary));
            });

          entityHeading.addEventListener('click', () => {
            const isCollapsed = entityGroup.classList.toggle('collapsed');
            entityHeading.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
          });

          entityGroup.append(entityHeading, entityContent);
          content.append(entityGroup);
        });

      heading.addEventListener('click', () => {
        const isCollapsed = group.classList.toggle('collapsed');
        heading.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      });

      group.append(heading, content);
      fragment.append(group);
    });

  dom.viewerList.replaceChildren(fragment);
  dom.viewerEmpty.hidden = summaries.length > 0;
  dom.viewerCount.textContent = `${summaries.length} Tables`;
};

const scrollViewerCard = (path) => {
  const card = dom.viewerList?.querySelector(`[data-path="${CSS.escape(path)}"]`);
  card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const setViewMode = async (mode) => {
  if (state.viewMode === mode) return;
  const isViewer = mode === 'viewer';
  setViewTransitionSkeleton(true, isViewer ? 'viewer' : 'editor');
  try {
    if (isViewer) await renderTableViewer();
    state.viewMode = mode;
    dom.workspace?.classList.toggle('viewer-mode', isViewer);
    dom.viewerButton?.classList.toggle('active', isViewer);
    dom.viewerButton?.setAttribute('aria-pressed', isViewer ? 'true' : 'false');
    if (dom.workspaceTitle) dom.workspaceTitle.textContent = isViewer ? 'DB 테이블 정의서 뷰어' : 'DB 테이블 정의서 작성기';
    if (isViewer) setPreviewOpen(false);
    dom.viewer.hidden = !isViewer;
    if (isViewer) {
      dom.form.hidden = true;
      dom.emptyState.hidden = true;
      return;
    }
    setFormVisible(state.hasActiveDocument);
  } finally {
    setViewTransitionSkeleton(false);
  }
};

const restoreEditorMode = () => {
  state.viewMode = 'editor';
  dom.workspace?.classList.remove('viewer-mode');
  dom.viewer.hidden = true;
  dom.viewerButton?.classList.remove('active');
  dom.viewerButton?.setAttribute('aria-pressed', 'false');
  if (dom.workspaceTitle) dom.workspaceTitle.textContent = 'DB 테이블 정의서 작성기';
};

const openFile = async (file, options = {}) => {
  try {
    let markdown = '';
    if (state.mode === 'browser') {
      markdown = await readFileMarkdown(file);
      state.currentFile = { ...file, mode: 'browser' };
    } else {
      const response = await fetch('/api/read-tree-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path }),
      });
      if (!response.ok) throw new Error('READ_FAILED');
      const result = await response.json();
      markdown = result.markdown || '';
      state.currentFile = {
        mode: 'server',
        fileName: result.fileName,
        path: result.path,
        origin: result.origin,
        saveDir: result.saveDir,
      };
    }
    state.data = parseMarkdown(markdown);
    restoreEditorMode();
    state.hasActiveDocument = true;
    saveCurrentFileConnection();
    state.pendingCurrentFileMeta = null;
    renderAll();
    setFormVisible(true);
    updatePreview();
    renderFileList();
    if (options.restoredFromReload) {
      showToast('info', '새로고침', `${state.currentFile.fileName || '문서'}의 저장된 내용을 다시 불러왔습니다.`);
    }
    return true;
  } catch {
    if (options.restoredFromReload) clearCurrentFileConnection();
    showToast('danger', '열기 실패', '문서를 열지 못했습니다.');
    return false;
  }
};

const createNewDocument = () => {
  state.currentFile = null;
  clearCurrentFileConnection();
  state.data = createDefaultData();
  restoreEditorMode();
  state.hasActiveDocument = true;
  renderAll();
  setFormVisible(true);
  renderFileList();
  updatePreview();
  dom.form.elements.entity?.focus();
  showToast('info', '새문서', '새 테이블 정의서 작성 상태입니다.');
};

const saveBrowserFile = async (markdown, fileName, options = {}) => {
  let handle = options.forceNew ? null : state.currentFile?.handle || null;
  if (!handle) {
    try {
      await state.browserTableHandle.getFileHandle(fileName, { create: false });
      showToast('warning', '저장 실패', '같은 이름의 파일이 이미 있습니다.');
      return false;
    } catch {
      handle = await state.browserTableHandle.getFileHandle(fileName, { create: true });
    }
  }

  const writable = await handle.createWritable();
  await writable.write(markdown);
  await writable.close();
  state.currentFile = {
    mode: 'browser',
    fileName,
    path: fileName,
    handle,
  };
  state.hasActiveDocument = true;
  saveCurrentFileConnection();
  return true;
};

const saveServerFile = async (markdown, fileName, options = {}) => {
  const isExisting = Boolean(state.currentFile?.origin) && !options.forceNew;
  const response = await fetch(isExisting ? '/api/save-current-file' : '/api/save-new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      isExisting
        ? {
            origin: state.currentFile.origin,
            path: state.currentFile.path,
            fileName,
            markdown,
          }
        : {
            saveDir: state.serverRootPath,
            fileName,
            markdown,
          },
    ),
  });

  if (response.status === 409) {
    showToast('warning', '저장 실패', '같은 이름의 파일이 이미 있습니다.');
    return false;
  }
  if (!response.ok) throw new Error('SAVE_FAILED');

  const result = await response.json();
  state.currentFile = {
    mode: 'server',
    fileName: result.fileName,
    path: result.path,
    origin: result.origin,
    saveDir: result.saveDir,
  };
  state.hasActiveDocument = true;
  saveCurrentFileConnection();
  return true;
};

const saveDocument = async (options = {}) => {
  if (!state.hasActiveDocument || !state.data) {
    setFormVisible(false);
    showToast('warning', '저장할 문서 없음', '파일 구조에서 문서를 선택하거나 새문서를 눌러주세요.');
    return;
  }
  if (!state.data || !validateBeforeSave()) return;
  const markdown = createMarkdown();
  const fileName = options.forceNew ? buildFileName() : state.currentFile?.fileName || buildFileName();

  try {
    const saved = state.mode === 'browser'
      ? await saveBrowserFile(markdown, fileName, options)
      : await saveServerFile(markdown, fileName, options);
    if (!saved) return;

    await refreshFileList();
    setFormVisible(true);
    updatePreview();
    showToast('success', '저장 완료', `${fileName} 문서를 저장했습니다.`);
  } catch {
    showToast('danger', '저장 실패', '테이블 정의서를 저장하지 못했습니다.');
  }
};

const closeMessageDialog = (confirmed = false) => {
  if (dom.messageDialog) dom.messageDialog.hidden = true;
  if (dom.messageDialogCancelButton) {
    dom.messageDialogCancelButton.hidden = true;
    dom.messageDialogCancelButton.textContent = '취소';
  }
  if (dom.messageDialogCloseButton) dom.messageDialogCloseButton.textContent = '확인';
  const resolver = state.messageDialogResolver;
  state.messageDialogResolver = null;
  state.messageDialogMode = 'alert';
  state.messageDialogReturnFocus?.focus();
  state.messageDialogReturnFocus = null;
  resolver?.(confirmed);
};

const hideMessageDialog = () => {
  closeMessageDialog(false);
};

const setMessageDialogBody = (message) => {
  if (!dom.messageDialogBody) return;
  const parts = String(message ?? '').split('<br>');
  dom.messageDialogBody.replaceChildren();
  parts.forEach((part, index) => {
    if (index > 0) dom.messageDialogBody.append(document.createElement('br'));
    dom.messageDialogBody.append(document.createTextNode(part));
  });
};

const showConfirmDialog = (title, message, options = {}) => {
  state.messageDialogResolver?.(false);
  return new Promise((resolve) => {
    state.messageDialogResolver = resolve;
    state.messageDialogMode = 'confirm';
    state.messageDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dom.messageDialogTitle) dom.messageDialogTitle.textContent = title;
    setMessageDialogBody(message);
    if (dom.messageDialogCancelButton) {
      dom.messageDialogCancelButton.hidden = false;
      dom.messageDialogCancelButton.textContent = options.cancelText || '취소';
    }
    if (dom.messageDialogCloseButton) dom.messageDialogCloseButton.textContent = options.confirmText || '확인';
    if (dom.messageDialog) dom.messageDialog.hidden = false;
    dom.messageDialogCancelButton?.focus();
  });
};

const deleteDocument = async () => {
  if (!state.currentFile) return;
  const confirmed = await showConfirmDialog(
    '경고',
    '현재 열린 문서를 완전히 삭제합니다.<br>휴지통으로 이동하지 않으며 되돌릴 수 없습니다.',
    { confirmText: '삭제', cancelText: '취소' },
  );
  if (!confirmed) return;
  await confirmDeleteDocument();
};

const confirmDeleteDocument = async () => {
  if (!state.currentFile) {
    return;
  }

  const deletedFileName = state.currentFile.fileName;
  try {
    if (state.mode === 'browser') {
      await state.browserTableHandle.removeEntry(state.currentFile.path);
    } else {
      const response = await fetch('/api/delete-current-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: state.currentFile.origin,
          path: state.currentFile.path,
        }),
      });
      if (!response.ok) throw new Error('DELETE_FAILED');
    }
    state.currentFile = null;
    clearCurrentFileConnection();
    state.data = null;
    state.hasActiveDocument = false;
    setFormVisible(false);
    updatePreview();
    await refreshFileList();
    showToast('success', '삭제 완료', `${deletedFileName} 문서를 삭제했습니다.`);
  } catch {
    showToast('danger', '삭제 실패', '문서를 삭제하지 못했습니다.');
  }
};

const initializeBrowserWorkspace = async () => {
  const directoryHandle = await readPersistedBrowserOpenedFolder();
  if (!directoryHandle) {
    redirectHomeForWorkspace();
    return false;
  }
  if (!(await ensureBrowserWritePermission(directoryHandle))) {
    redirectHomeForWorkspace();
    return false;
  }
  state.mode = 'browser';
  state.browserRootHandle = directoryHandle;
  state.browserTableHandle = await getBrowserTableDirectoryHandle(directoryHandle);
  return true;
};

const initializeServerWorkspace = async () => {
  const currentResponse = await fetch('/api/current-workspace-root');
  if (!currentResponse.ok) {
    redirectHomeForWorkspace();
    return false;
  }
  const currentResult = await currentResponse.json();
  if (!currentResult.opened) {
    redirectHomeForWorkspace();
    return false;
  }

  const response = await fetch('/api/open-editor-root', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editor: TABLE_EDITOR_DIR_NAME }),
  });
  if (!response.ok) {
    redirectHomeForWorkspace();
    return false;
  }

  const result = await response.json();
  state.mode = 'server';
  state.serverRootPath = result.rootPath || result.saveDir || '';
  state.files = result.files || [];
  return true;
};

const initialize = async () => {
  loadPendingCurrentFileConnection();
  restoreSideMenuWidth();
  syncFilePanelLayoutMode();
  state.data = createDefaultData();
  try {
    const opened = isBrowserFileSystemSupported()
      ? await initializeBrowserWorkspace()
      : await initializeServerWorkspace();
    if (!opened) return;
    await refreshFileList();
    if (await restorePendingCurrentFileConnection()) return;
    setFormVisible(false);
    updatePreview();
  } catch {
    redirectHomeForWorkspace();
  }
};

Object.keys(rowDefinitions).forEach((section) => {
  document.querySelector(`[data-add-table-row="${section}"]`)?.addEventListener('click', () => addRow(section));
});

dom.form?.addEventListener('input', () => {
  if (state.data) readBasicFieldValues();
  syncDeletedAtColumnState();
  updatePreview();
});
dom.form?.addEventListener('change', () => {
  if (state.data) readBasicFieldValues();
  syncDeletedAtColumnState();
  updatePreview();
});
dom.previewToggleButton?.addEventListener('click', togglePreviewPanel);
dom.resetButton?.addEventListener('click', resetDocument);
dom.newButton?.addEventListener('click', createNewDocument);
dom.emptyNewButton?.addEventListener('click', createNewDocument);
dom.viewerButton?.addEventListener('click', () => {
  setViewMode(state.viewMode === 'viewer' ? 'editor' : 'viewer');
});
dom.saveButton?.addEventListener('click', () => saveDocument());
dom.copyButton?.addEventListener('click', copyMarkdown);
dom.helpButton?.addEventListener('click', () => setHelpDialogOpen(true));
dom.helpDialogCloseButton?.addEventListener('click', () => setHelpDialogOpen(false));
dom.helpDialog?.addEventListener('click', (event) => {
  if (event.target === dom.helpDialog) setHelpDialogOpen(false);
});
dom.helpTopicButtons.forEach((button) => {
  button.addEventListener('click', () => setHelpTopic(button.dataset.tableHelpTopic));
});
dom.basicHelpButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setColumnHelpOpen(false);
  setIndexHelpOpen(false);
  setConstraintHelpOpen(false);
  setBasicHelpOpen(!isBasicHelpOpen());
});
dom.basicHelpCloseButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setBasicHelpOpen(false);
  dom.basicHelpButton?.focus();
});
dom.columnHelpButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setBasicHelpOpen(false);
  setIndexHelpOpen(false);
  setConstraintHelpOpen(false);
  setColumnHelpOpen(!isColumnHelpOpen());
});
dom.columnHelpCloseButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setColumnHelpOpen(false);
  dom.columnHelpButton?.focus();
});
dom.indexHelpButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setBasicHelpOpen(false);
  setColumnHelpOpen(false);
  setConstraintHelpOpen(false);
  setIndexHelpOpen(!isIndexHelpOpen());
});
dom.indexHelpCloseButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setIndexHelpOpen(false);
  dom.indexHelpButton?.focus();
});
dom.constraintHelpButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setBasicHelpOpen(false);
  setColumnHelpOpen(false);
  setIndexHelpOpen(false);
  setConstraintHelpOpen(!isConstraintHelpOpen());
});
dom.constraintHelpCloseButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setConstraintHelpOpen(false);
  dom.constraintHelpButton?.focus();
});
dom.saveMenuButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setSaveDropdownOpen(!isSaveDropdownOpen());
});
dom.saveDropdown?.querySelectorAll('[data-save-action]').forEach((button) => {
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    closeActionDropdowns();
    if (button.dataset.saveAction === 'new') {
      await saveDocument({ forceNew: true });
      return;
    }
    await saveDocument();
  });
});
dom.deleteButton?.addEventListener('click', deleteDocument);
dom.messageDialogCloseButton?.addEventListener('click', () => closeMessageDialog(state.messageDialogMode === 'confirm'));
dom.messageDialogCancelButton?.addEventListener('click', () => closeMessageDialog(false));
dom.messageDialog?.addEventListener('click', (event) => {
  if (event.target === dom.messageDialog) hideMessageDialog();
});
dom.filePanelRail?.addEventListener('click', openFilePanelFromRail);
dom.filePanelBackdrop?.addEventListener('click', () => setFileDrawerOpen(false));
dom.sideMenuResizer?.addEventListener('pointerdown', startSideMenuResize);
dom.sideMenuResizer?.addEventListener('keydown', adjustSideMenuFromKeyboard);
dom.topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('pointermove', moveSideMenuResize);
window.addEventListener('pointerup', stopSideMenuResize);
window.addEventListener('pointercancel', stopSideMenuResize);
window.addEventListener('resize', syncFilePanelLayoutMode);
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const code = event.code;
  const hasPrimaryModifier = (event.metaKey || event.ctrlKey) && !event.altKey;
  const isSaveShortcut = hasPrimaryModifier && key === 's';
  const isNewDocumentShortcut = hasPrimaryModifier && key === 'd';
  const isPreviewShortcut = event.altKey && !event.metaKey && !event.ctrlKey && code === 'KeyV';
  const isResetShortcut = event.altKey && !event.metaKey && !event.ctrlKey && code === 'KeyR';

  if (isSaveShortcut) {
    event.preventDefault();
    closeActionDropdowns();
    saveDocument();
    return;
  }
  if (isNewDocumentShortcut) {
    event.preventDefault();
    closeActionDropdowns();
    createNewDocument();
    return;
  }
  if (isPreviewShortcut) {
    event.preventDefault();
    closeActionDropdowns();
    togglePreviewPanel();
    return;
  }
  if (isResetShortcut) {
    event.preventDefault();
    closeActionDropdowns();
    resetDocument();
    return;
  }
  if (event.key === 'Escape' && dom.helpDialog && !dom.helpDialog.hidden) {
    setHelpDialogOpen(false);
    return;
  }
  if (event.key === 'Escape' && dom.messageDialog && !dom.messageDialog.hidden) {
    hideMessageDialog();
    return;
  }
  if (event.key === 'Escape' && isSaveDropdownOpen()) {
    closeActionDropdowns();
    return;
  }
  if (event.key === 'Escape' && isBasicHelpOpen()) {
    setBasicHelpOpen(false);
    dom.basicHelpButton?.focus();
    return;
  }
  if (event.key === 'Escape' && isColumnHelpOpen()) {
    setColumnHelpOpen(false);
    dom.columnHelpButton?.focus();
    return;
  }
  if (event.key === 'Escape' && isIndexHelpOpen()) {
    setIndexHelpOpen(false);
    dom.indexHelpButton?.focus();
    return;
  }
  if (event.key === 'Escape' && isConstraintHelpOpen()) {
    setConstraintHelpOpen(false);
    dom.constraintHelpButton?.focus();
    return;
  }
  if (event.key === 'Escape' && state.fileDrawerOpen) {
    setFileDrawerOpen(false);
    dom.filePanelRail?.focus();
  }
});
document.addEventListener('pointerdown', (event) => {
  const target = event.target;
  if (target instanceof Element && !target.closest('.table-section-help')) {
    setBasicHelpOpen(false);
    setColumnHelpOpen(false);
    setIndexHelpOpen(false);
    setConstraintHelpOpen(false);
  }
  if (target instanceof Element && target.closest('#tableSaveSplitButton')) return;
  closeActionDropdowns();
});

initialize();
