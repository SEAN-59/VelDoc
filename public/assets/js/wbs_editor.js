const FOLDER_SESSION_KEY = 'veldoc-opened-folder-session';
const FOLDER_HANDLE_DB_NAME = 'veldoc-session-folders';
const FOLDER_HANDLE_STORE_NAME = 'folders';
const HOME_TOAST_SESSION_KEY = 'veldoc-home-toast';
const WORKSPACE_REQUIRED_NOTICE = 'workspace-required';
const VELDOC_WORKSPACE_DIR_NAME = 'veldoc';
const WBS_EDITOR_DIR_NAME = 'wbs';
const WBS_SIDE_MENU_WIDTH_KEY = 'veldoc-wbs-side-menu-width';
const SIDE_MENU_MIN_WIDTH = 176;
const SIDE_MENU_MAX_WIDTH = 280;
const SIDE_MENU_DEFAULT_WIDTH = 280;
const SIDE_MENU_SNAP_RANGE = 18;
const SIDE_MENU_COLLAPSE_WIDTH = 134;
const SIDE_MENU_NARROW_WIDTH = 212;

const dom = {
  appShell: document.querySelector('#wbsAppShell'),
  toastContainer: document.querySelector('#wbsToastContainer'),
  sideMenu: document.querySelector('#wbsSideMenu'),
  filePanelBackdrop: document.querySelector('#wbsFilePanelBackdrop'),
  filePanelRail: document.querySelector('#wbsFilePanelRail'),
  fileList: document.querySelector('#wbsFileList'),
  sideMenuResizer: document.querySelector('#wbsSideMenuResizer'),
  form: document.querySelector('#wbsEditorForm'),
  emptyState: document.querySelector('#wbsEmptyState'),
  emptyNewButton: document.querySelector('#wbsEmptyNewButton'),
  topButton: document.querySelector('#wbsTopButton'),
  previewToggleButton: document.querySelector('#wbsPreviewToggleButton'),
  previewPanel: document.querySelector('#wbsPreviewPanel'),
  preview: document.querySelector('#wbsPreview'),
  copyButton: document.querySelector('#wbsCopyButton'),
  resetButton: document.querySelector('#wbsResetButton'),
  newButton: document.querySelector('#wbsNewButton'),
  deleteButton: document.querySelector('#wbsDeleteButton'),
  saveButton: document.querySelector('#wbsSaveButton'),
  saveMenuButton: document.querySelector('#wbsSaveMenuButton'),
  saveDropdown: document.querySelector('#wbsSaveDropdown'),
  saveOverwriteButton: document.querySelector('#wbsSaveOverwriteButton'),
  saveNewButton: document.querySelector('#wbsSaveNewButton'),
  addTaskButton: document.querySelector('#wbsAddTaskButton'),
  taskRows: document.querySelector('#wbsTaskRows'),
  taskCount: document.querySelector('#wbsTaskCount'),
  helpButton: document.querySelector('#wbsHelpButton'),
  helpDialog: document.querySelector('#wbsHelpDialog'),
  helpDialogCloseButton: document.querySelector('#wbsHelpDialogCloseButton'),
  helpTopicButtons: [...document.querySelectorAll('[data-wbs-help-topic]')],
  helpSections: [...document.querySelectorAll('[data-wbs-help-section]')],
  messageDialog: document.querySelector('#wbsMessageDialog'),
  messageDialogCancelButton: document.querySelector('#wbsMessageDialogCancelButton'),
  messageDialogConfirmButton: document.querySelector('#wbsMessageDialogConfirmButton'),
};

const state = {
  data: null,
  mode: '',
  wbsDirectoryHandle: null,
  saveDir: '',
  currentFile: null,
  files: [],
  sideMenuWidth: SIDE_MENU_DEFAULT_WIDTH,
  sideMenuHidden: false,
  sideMenuResizeState: null,
  fileDrawerOpen: false,
  messageResolver: null,
};

const getLocalDateString = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const DATE_DAY_MS = 24 * 60 * 60 * 1000;

const toDateOnly = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const normalizeDateInput = (value) => {
  const raw = normalizeText(value).replace(/[./]/g, '-');
  if (!raw) return '';

  const compact = raw.replaceAll('-', '');
  let year = '';
  let month = '';
  let day = '';

  if (/^\d{6}$/.test(compact)) {
    year = `20${compact.slice(0, 2)}`;
    month = compact.slice(2, 4);
    day = compact.slice(4, 6);
  } else if (/^\d{8}$/.test(compact)) {
    year = compact.slice(0, 4);
    month = compact.slice(4, 6);
    day = compact.slice(6, 8);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    [year, month, day] = raw.split('-');
  } else {
    return raw;
  }

  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    parsed.getFullYear() !== Number(year)
    || parsed.getMonth() !== Number(month) - 1
    || parsed.getDate() !== Number(day)
  ) {
    return raw;
  }
  return getLocalDateString(parsed);
};

const parseDateOnly = (value) => {
  const normalized = normalizeDateInput(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  const [year, month, day] = normalized.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
  ) {
    return null;
  }
  return toDateOnly(parsed);
};

const updateTaskSchedule = (task) => {
  const start = parseDateOnly(task.startDate);
  let end = parseDateOnly(task.endDate);

  if (start && end && end < start) {
    task.endDate = getLocalDateString(start);
    end = start;
  }

  if (!start || !end) {
    task.duration = '';
    task.progress = '';
    return;
  }

  const durationDays = Math.floor((end - start) / DATE_DAY_MS) + 1;
  const today = toDateOnly();
  task.duration = `${durationDays}일`;

  if (today < start) {
    task.progress = '-';
    return;
  }

  const elapsedDays = Math.min(Math.floor((today - start) / DATE_DAY_MS) + 1, durationDays);
  task.progress = `${Math.round((elapsedDays / durationDays) * 100)}%`;
};

const openDatePicker = (input) => {
  try {
    input.showPicker?.();
  } catch {
    // 브라우저가 포커스 기반 showPicker 호출을 제한하면 기본 포커스 동작만 사용한다.
  }
};

const createDefaultData = () => ({
  basic: {
    projectName: '',
    internalCode: '',
    version: '',
    owner: '',
    createdDate: getLocalDateString(),
    updatedDate: '',
    goal: '',
    memo: '',
  },
  tasks: [],
});

const createTask = (values = {}) => ({
  wbsNumber: values.wbsNumber || values.wbs || values.number || '',
  taskName: values.taskName || '',
  deliverable: values.deliverable || '',
  owner: values.owner || '',
  startDate: values.startDate || '',
  endDate: values.endDate || '',
  duration: values.duration || '',
  progress: values.progress || '',
});

const isBrowserFileSystemSupported = () =>
  window.isSecureContext && 'showDirectoryPicker' in window;

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
  dom.toastContainer.append(toast);
  window.setTimeout(() => removeToast(toast), 4000);
};

const redirectHomeForWorkspace = () => {
  try {
    sessionStorage.setItem(HOME_TOAST_SESSION_KEY, JSON.stringify({
      type: 'warning',
      title: '작업 공간 필요',
      message: '작업 공간을 선택해주세요.',
    }));
  } catch {
    // 홈에서 URL notice를 처리하므로 세션 저장 실패는 무시한다.
  }
  window.location.replace(`../home.html?notice=${WORKSPACE_REQUIRED_NOTICE}`);
};

const clampSideMenuWidth = (value) =>
  Math.min(SIDE_MENU_MAX_WIDTH, Math.max(SIDE_MENU_MIN_WIDTH, Number(value) || SIDE_MENU_DEFAULT_WIDTH));

const setSideMenuWidth = (width, options = {}) => {
  state.sideMenuWidth = clampSideMenuWidth(width);
  document.documentElement.style.setProperty('--side-menu-width', `${state.sideMenuWidth}px`);
  dom.sideMenu?.classList.toggle('is-narrow', state.sideMenuWidth < SIDE_MENU_NARROW_WIDTH);
  dom.sideMenuResizer?.setAttribute('aria-valuenow', String(Math.round(state.sideMenuWidth)));
  if (options.persist !== false) {
    localStorage.setItem(WBS_SIDE_MENU_WIDTH_KEY, String(Math.round(state.sideMenuWidth)));
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
  const storedWidth = Number.parseInt(localStorage.getItem(WBS_SIDE_MENU_WIDTH_KEY) || '', 10);
  setSideMenuWidth(Number.isFinite(storedWidth) ? storedWidth : SIDE_MENU_DEFAULT_WIDTH, { persist: false });
  setSideMenuHidden(false);
};

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

const getBrowserWbsDirectoryHandle = async (workspaceDirectoryHandle) => {
  const veldocDirectoryHandle = await workspaceDirectoryHandle.getDirectoryHandle(VELDOC_WORKSPACE_DIR_NAME, { create: true });
  return veldocDirectoryHandle.getDirectoryHandle(WBS_EDITOR_DIR_NAME, { create: true });
};

const normalizeText = (value) => String(value ?? '').trim();

const escapePipes = (value) => normalizeText(value).replaceAll('|', '\\|').replace(/\n/g, '<br>');

const buildMarkdownTable = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map(escapePipes).join(' | ')} |`),
].join('\n');

const readFormValues = () => {
  if (!state.data || !dom.form) return;
  Object.keys(state.data.basic).forEach((key) => {
    const field = dom.form.elements[key];
    if (field) state.data.basic[key] = field.value;
  });
};

const writeFormValues = () => {
  if (!state.data || !dom.form) return;
  Object.entries(state.data.basic).forEach(([key, value]) => {
    const field = dom.form.elements[key];
    if (field) field.value = value || '';
  });
};

const getMeaningfulTasks = () =>
  (state.data?.tasks || []).filter((task) =>
    ['wbsNumber', 'taskName', 'owner', 'startDate', 'endDate', 'duration', 'progress', 'deliverable']
      .some((key) => normalizeText(task[key])),
  );

const normalizeWbsNumber = (value) => normalizeText(value)
  .replace(/\s+/g, '');

const isValidWbsNumber = (value) => /^\d+(?:\.\d+)*$/.test(normalizeText(value).replace(/\s+/g, ''));

const getWbsSegments = (value) => {
  const normalized = normalizeWbsNumber(value);
  if (!/^\d+(?:\.\d+)*$/.test(normalized)) return [];
  return normalized.split('.');
};

const getWbsDepth = (value) => getWbsSegments(value).length || 1;

const getWbsNumberFromTreeLabel = (value) => {
  const match = normalizeText(value).match(/(\d+(?:\.\d+)*)$/);
  return match ? match[1] : normalizeWbsNumber(value);
};

const compareWbsNumbers = (leftValue, rightValue) => {
  const leftSegments = getWbsSegments(leftValue);
  const rightSegments = getWbsSegments(rightValue);
  if (leftSegments.length === 0 && rightSegments.length === 0) return 0;
  if (leftSegments.length === 0) return 1;
  if (rightSegments.length === 0) return -1;

  const maxLength = Math.max(leftSegments.length, rightSegments.length);
  for (let index = 0; index < maxLength; index += 1) {
    const left = Number.parseInt(leftSegments[index] || '0', 10);
    const right = Number.parseInt(rightSegments[index] || '0', 10);
    if (left !== right) return left - right;
    if (leftSegments[index] === undefined) return -1;
    if (rightSegments[index] === undefined) return 1;
  }
  return 0;
};

const getTasksInWbsOrder = (tasks) =>
  tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => compareWbsNumbers(left.task.wbsNumber, right.task.wbsNumber) || left.index - right.index)
    .map(({ task }) => task);

const sortStateTasksByWbsNumber = () => {
  if (!state.data) return;
  state.data.tasks = getTasksInWbsOrder(state.data.tasks);
};

const createMarkdown = () => {
  if (!state.data) return '';
  readFormValues();
  state.data.tasks.forEach(updateTaskSchedule);
  const { basic } = state.data;
  const title = basic.projectName || 'WBS';
  const taskRows = getTasksInWbsOrder(getMeaningfulTasks()).map((task) => [
    normalizeWbsNumber(task.wbsNumber) || task.wbsNumber,
    task.taskName,
    task.owner,
    task.startDate,
    task.endDate,
    task.duration,
    task.progress,
    task.deliverable,
  ]);

  return `# ${title}

## 1. 기본 정보

${buildMarkdownTable(
    ['항목', '내용'],
    [
      ['프로젝트명', basic.projectName],
      ['내부 코드', basic.internalCode],
      ['버전', basic.version],
      ['담당자', basic.owner],
      ['작성일', basic.createdDate],
      ['수정일', basic.updatedDate],
      ['목표', basic.goal],
    ],
  )}

## 2. 작업 목록

${buildMarkdownTable(
    ['WBS', '작업', '담당자', '시작일', '종료일', '기간', '진행률', '산출물'],
    taskRows,
  )}

## 3. 메모

${basic.memo || '미정'}
`;
};

const splitMarkdownRow = (line) => {
  const cells = [];
  let current = '';
  let escaping = false;
  const source = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (const char of source) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }
    if (char === '\\') {
      escaping = true;
      continue;
    }
    if (char === '|') {
      cells.push(current.trim().replaceAll('<br>', '\n'));
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim().replaceAll('<br>', '\n'));
  return cells;
};

const parseMarkdownTable = (section) => {
  const lines = section.split('\n').filter((line) => line.trim().startsWith('|'));
  if (lines.length < 2) return { headers: [], rows: [] };
  return {
    headers: splitMarkdownRow(lines[0]),
    rows: lines.slice(2).map(splitMarkdownRow),
  };
};

const getMarkdownSection = (markdown, title) => {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^##\\s+\\d+\\.\\s+${escapedTitle}\\s*$`, 'm').exec(markdown);
  if (!match) return '';
  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+\d+\.\s+/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
};

const getTableValue = (section, key) => {
  const table = parseMarkdownTable(section);
  const row = table.rows.find((cells) => cells[0] === key);
  return row?.[1] || '';
};

const parseMarkdown = (markdown) => {
  const data = createDefaultData();
  const basicSection = getMarkdownSection(markdown, '기본 정보');
  data.basic.projectName = getTableValue(basicSection, '프로젝트명');
  data.basic.internalCode = getTableValue(basicSection, '내부 코드');
  data.basic.version = getTableValue(basicSection, '버전');
  data.basic.owner = getTableValue(basicSection, '담당자');
  data.basic.createdDate = getTableValue(basicSection, '작성일') || getLocalDateString();
  data.basic.updatedDate = getTableValue(basicSection, '수정일');
  data.basic.goal = getTableValue(basicSection, '목표') || getTableValue(basicSection, '목표 / 범위');
  data.basic.memo = getMarkdownSection(markdown, '메모').trim();

  const taskTable = parseMarkdownTable(getMarkdownSection(markdown, '작업 목록'));
  data.tasks = taskTable.rows.map((cells) => {
    const isCurrentFormat = taskTable.headers[0] === 'WBS';
    const isTreeFormat = taskTable.headers[0] === '구조';
    return createTask(isCurrentFormat
      ? {
          wbsNumber: getWbsNumberFromTreeLabel(cells[0]),
          taskName: cells[1],
          owner: cells[2],
          startDate: cells[3],
          endDate: cells[4],
          duration: cells[5],
          progress: cells[6],
          deliverable: cells[7],
        }
      : isTreeFormat
        ? {
            wbsNumber: getWbsNumberFromTreeLabel(cells[0]),
            taskName: cells[1],
            deliverable: cells[2],
            owner: cells[3],
            startDate: cells[4],
            endDate: cells[5],
            progress: cells[7],
          }
        : {
            wbsNumber: getWbsNumberFromTreeLabel(cells[1]),
            taskName: cells[2],
            deliverable: cells[3],
            owner: cells[4],
            startDate: cells[5],
            endDate: cells[6],
            progress: cells[8],
        }
    );
  });

  return data;
};

const updatePreview = () => {
  if (dom.preview) {
    dom.preview.textContent = state.data ? createMarkdown() : '새문서를 눌러 WBS 작성을 시작하세요.';
  }
  if (dom.taskCount) {
    dom.taskCount.textContent = `${getMeaningfulTasks().length} Tasks`;
  }
};

const setFormVisible = (isVisible) => {
  if (dom.form) dom.form.hidden = !isVisible;
  if (dom.emptyState) dom.emptyState.hidden = isVisible;
  const hasData = Boolean(state.data);
  const hasFile = Boolean(state.currentFile);
  if (dom.saveButton) dom.saveButton.disabled = !hasData;
  if (dom.saveMenuButton) dom.saveMenuButton.disabled = !hasData;
  if (dom.saveOverwriteButton) dom.saveOverwriteButton.disabled = !hasFile;
  if (dom.saveNewButton) dom.saveNewButton.disabled = !hasData;
  if (dom.deleteButton) dom.deleteButton.disabled = !hasFile;
  if (dom.resetButton) dom.resetButton.disabled = !hasData;
};

const refreshTaskIndentation = () => {
  if (!dom.taskRows || !state.data) return;
  dom.taskRows.querySelectorAll('.wbs-task-item').forEach((item) => {
    const index = Number.parseInt(item.dataset.taskIndex || '', 10);
    const task = state.data.tasks[index];
    item.style.setProperty('--wbs-depth', String(Math.max(getWbsDepth(task?.wbsNumber) - 1, 0)));
  });
};

const createRequiredMarker = () => {
  const marker = document.createElement('span');
  marker.className = 'table-required-marker';
  marker.setAttribute('aria-label', '필수');
  marker.textContent = '*';
  return marker;
};

const createLabeledField = (labelText, control, options = {}) => {
  const label = document.createElement('label');
  label.className = 'wbs-card-field';
  const labelTitle = document.createElement('span');
  labelTitle.textContent = labelText;
  if (options.required) {
    labelTitle.append(createRequiredMarker());
  }
  label.append(labelTitle, control);
  return label;
};

const addTaskAndFocus = () => {
  if (!state.data) createNewDocument();
  state.data.tasks.push(createTask());
  renderTasks();
  updatePreview();
  dom.taskRows?.lastElementChild?.querySelector('input')?.focus();
};

const renderTasks = () => {
  if (!dom.taskRows || !state.data) return;
  sortStateTasksByWbsNumber();
  dom.taskRows.replaceChildren();

  state.data.tasks.forEach((task, index) => {
    updateTaskSchedule(task);
    const taskItem = document.createElement('div');
    taskItem.className = 'wbs-task-item';
    taskItem.dataset.taskIndex = String(index);
    taskItem.style.setProperty('--wbs-depth', String(Math.max(getWbsDepth(task.wbsNumber) - 1, 0)));

    const card = document.createElement('article');
    card.className = 'wbs-task-card';
    let startDateInput = null;
    let endDateInput = null;
    let durationInput = null;
    let progressInput = null;

    const syncScheduleFields = () => {
      updateTaskSchedule(task);
      if (startDateInput) startDateInput.value = task.startDate || '';
      if (endDateInput) {
        endDateInput.value = task.endDate || '';
        endDateInput.min = task.startDate || '';
      }
      if (durationInput) durationInput.value = task.duration || '';
      if (progressInput) progressInput.value = task.progress || '';
      updatePreview();
    };

    const createInput = (key, type = 'text') => {
      const input = document.createElement('input');
      input.className = 'table-cell-input';
      input.dataset.taskIndex = String(index);
      input.dataset.taskKey = key;
      input.type = type;
      input.value = task[key] || '';
      if (key === 'duration' || key === 'progress') {
        input.readOnly = true;
        input.tabIndex = -1;
        input.setAttribute('aria-readonly', 'true');
      }
      if (key === 'wbsNumber') {
        input.placeholder = '예: 1.1';
        input.inputMode = 'decimal';
      }
      if (key === 'startDate' || key === 'endDate') {
        input.placeholder = 'YYMMDD';
        input.title = '달력으로 선택하거나 YYMMDD로 입력하세요.';
        if (key === 'endDate') input.min = task.startDate || '';
        input.addEventListener('focus', () => openDatePicker(input));
        input.addEventListener('click', () => openDatePicker(input));
      }
      input.addEventListener('input', () => {
        if (key === 'duration' || key === 'progress') return;
        task[key] = input.value;
        if (key === 'wbsNumber') {
          refreshTaskIndentation();
        }
        if (key === 'startDate' || key === 'endDate') {
          syncScheduleFields();
        }
        updatePreview();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addTaskAndFocus();
          return;
        }
        if ((key === 'startDate' || key === 'endDate') && /^\d$/.test(event.key)) {
          const nextDigits = `${input.dataset.rawDateDigits || ''}${event.key}`.slice(-8);
          input.dataset.rawDateDigits = nextDigits;
          const normalized = normalizeDateInput(nextDigits);
          event.preventDefault();
          if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
            task[key] = normalized;
            input.value = normalized;
            input.dataset.rawDateDigits = '';
            syncScheduleFields();
          }
          return;
        }
        if ((key === 'startDate' || key === 'endDate') && ['Backspace', 'Delete', 'Escape'].includes(event.key)) {
          input.dataset.rawDateDigits = '';
        }
      });
      if (key === 'startDate' || key === 'endDate') {
        input.addEventListener('paste', (event) => {
          const pastedText = event.clipboardData?.getData('text') || '';
          const normalized = normalizeDateInput(pastedText);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return;
          event.preventDefault();
          task[key] = normalized;
          input.value = normalized;
          input.dataset.rawDateDigits = '';
          syncScheduleFields();
        });
        input.addEventListener('change', () => {
          const normalized = normalizeDateInput(input.value);
          task[key] = normalized;
          input.value = normalized;
          input.dataset.rawDateDigits = '';
          syncScheduleFields();
        });
        input.addEventListener('blur', () => {
          const normalized = normalizeDateInput(input.value);
          task[key] = normalized;
          input.value = normalized;
          input.dataset.rawDateDigits = '';
          syncScheduleFields();
        });
      }
      if (key === 'wbsNumber') {
        input.addEventListener('blur', () => {
          task[key] = normalizeWbsNumber(input.value);
          renderTasks();
          updatePreview();
        });
      }
      return input;
    };

    const cardRow = document.createElement('div');
    cardRow.className = 'wbs-task-card-row';

    const wbsField = document.createElement('label');
    wbsField.className = 'wbs-number-field';
    const wbsLabel = document.createElement('span');
    wbsLabel.textContent = 'WBS';
    wbsLabel.append(createRequiredMarker());
    const wbsInput = createInput('wbsNumber');
    wbsField.append(wbsLabel, wbsInput);

    const taskNameField = createLabeledField('작업', createInput('taskName'), { required: true });
    taskNameField.classList.add('wbs-task-name-field');

    const removeButton = document.createElement('button');
    removeButton.className = 'table-row-remove';
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', '작업 삭제');
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
      state.data.tasks.splice(index, 1);
      renderTasks();
      updatePreview();
    });

    startDateInput = createInput('startDate', 'date');
    endDateInput = createInput('endDate', 'date');
    durationInput = createInput('duration');
    progressInput = createInput('progress');
    syncScheduleFields();

    cardRow.append(
      wbsField,
      taskNameField,
      createLabeledField('담당자', createInput('owner')),
      createLabeledField('시작일', startDateInput),
      createLabeledField('종료일', endDateInput),
      createLabeledField('기간', durationInput),
      createLabeledField('진행률', progressInput),
      createLabeledField('산출물', createInput('deliverable')),
      removeButton,
    );

    card.append(cardRow);
    taskItem.append(card);
    dom.taskRows.append(taskItem);
  });
  refreshTaskIndentation();
};

const hydrateForm = () => {
  writeFormValues();
  renderTasks();
  updatePreview();
};

const stampDocumentForSave = () => {
  if (!state.data) return;
  readFormValues();
  if (!state.data.basic.createdDate) {
    state.data.basic.createdDate = getLocalDateString();
  }
  state.data.basic.updatedDate = getLocalDateString();
  writeFormValues();
  updatePreview();
};

const triggerFieldError = (field) => {
  if (!field) return;
  field.classList.remove('is-error', 'shake');
  void field.offsetWidth;
  field.classList.add('is-error', 'shake');
  window.setTimeout(() => field.classList.remove('shake'), 1500);
};

const markWbsTaskError = (index, key) => {
  const field = dom.taskRows?.querySelector(`[data-task-index="${index}"][data-task-key="${key}"]`);
  triggerFieldError(field);
  return field;
};

const validateBeforeSave = () => {
  if (!dom.form) return true;
  readFormValues();

  const requiredFields = [
    { name: 'projectName', label: '프로젝트명' },
    { name: 'internalCode', label: '내부 코드' },
    { name: 'version', label: '버전' },
    { name: 'owner', label: '담당자' },
  ];
  const missingFields = requiredFields
    .map((field) => ({
      ...field,
      element: dom.form.elements[field.name],
    }))
    .filter((field) => !normalizeText(field.element?.value));

  if (missingFields.length > 0) {
    missingFields.forEach((field) => triggerFieldError(field.element));
    const firstMissing = missingFields[0];
    firstMissing.element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstMissing.element?.focus({ preventScroll: true });
    showToast('warning', '필수 값 누락', `${firstMissing.label} 값을 입력해주세요.`);
    return false;
  }

  sortStateTasksByWbsNumber();
  renderTasks();

  const meaningfulTasks = getMeaningfulTasks();
  if (meaningfulTasks.length === 0) {
    const target = state.data.tasks.length > 0
      ? markWbsTaskError(0, 'wbsNumber')
      : dom.addTaskButton;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus({ preventScroll: true });
    showToast('warning', '작업 목록 필요', '작업을 1개 이상 추가해주세요.');
    return false;
  }

  const seenWbsNumbers = new Map();
  for (const task of meaningfulTasks) {
    const index = state.data.tasks.indexOf(task);
    const rawNumber = normalizeText(task.wbsNumber);
    const normalizedNumber = normalizeWbsNumber(task.wbsNumber);
    const hasTaskName = Boolean(normalizeText(task.taskName));

    if (!rawNumber) {
      const target = markWbsTaskError(index, 'wbsNumber');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
      showToast('warning', '필수 값 누락', 'WBS 번호를 입력해주세요.');
      return false;
    }

    if (!isValidWbsNumber(rawNumber)) {
      const target = markWbsTaskError(index, 'wbsNumber');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
      showToast('warning', 'WBS 형식 오류', 'WBS 번호는 1 또는 1.1처럼 숫자와 점으로만 입력해주세요.');
      return false;
    }

    if (seenWbsNumbers.has(normalizedNumber)) {
      const firstIndex = seenWbsNumbers.get(normalizedNumber);
      markWbsTaskError(firstIndex, 'wbsNumber');
      const target = markWbsTaskError(index, 'wbsNumber');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
      showToast('warning', 'WBS 중복', `${normalizedNumber} 번호가 중복되었습니다.`);
      return false;
    }
    seenWbsNumbers.set(normalizedNumber, index);

    if (!hasTaskName) {
      const target = markWbsTaskError(index, 'taskName');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
      showToast('warning', '필수 값 누락', `${normalizedNumber} 작업명을 입력해주세요.`);
      return false;
    }
  }

  return true;
};

const createNewDocument = () => {
  state.data = createDefaultData();
  state.currentFile = null;
  hydrateForm();
  setFormVisible(true);
  renderFileList();
  showToast('info', '새 문서', '새 WBS 문서를 작성합니다.');
};

const resetDocument = () => {
  if (!state.data) return;
  state.data = createDefaultData();
  hydrateForm();
  setFormVisible(true);
  showToast('success', '초기화', '입력 중인 내용을 모두 지우고 처음 상태로 돌아갑니다.');
};

const createFileNameSegment = (value) => normalizeText(value)
  .replace(/[{}]/g, '')
  .replace(/[\\/:*?"<>|]/g, '-')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const buildFileName = () => {
  readFormValues();
  const safeProjectName = createFileNameSegment(state.data?.basic?.projectName || '');
  const safeInternalCode = createFileNameSegment(state.data?.basic?.internalCode || '');
  return `${safeProjectName}-${safeInternalCode}-wbs.md`;
};

const ensureServerWbsWorkspace = async () => {
  const workspaceResponse = await fetch('/api/current-workspace-root');
  const workspaceResult = workspaceResponse.ok ? await workspaceResponse.json() : null;
  if (!workspaceResult?.opened) return false;

  const response = await fetch('/api/open-editor-root', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editor: WBS_EDITOR_DIR_NAME }),
  });
  if (!response.ok) return false;
  const result = await response.json();
  state.mode = 'server';
  state.saveDir = result.saveDir || result.rootPath || '';
  return true;
};

const sortWbsFiles = (files) =>
  files.sort((left, right) =>
    String(left.fileName).localeCompare(String(right.fileName), 'ko', { numeric: true, sensitivity: 'base' }),
  );

const readFileMarkdown = async (file) => {
  const sourceFile = await file.handle.getFile();
  return sourceFile.text();
};

const renderFileList = () => {
  if (!dom.fileList) return;
  dom.fileList.replaceChildren();
  if (state.files.length === 0) {
    dom.fileList.append(createTextElement('p', 'file-tree-empty', '아직 저장된 WBS 문서가 없습니다.'));
    return;
  }

  const content = document.createElement('div');
  content.className = 'file-tree-content';
  state.files.forEach((file) => {
    const button = document.createElement('button');
    button.className = 'file-tree-file';
    button.type = 'button';
    const label = createTextElement('span', 'file-tree-file-label', file.fileName.replace(/\.(md|markdown)$/i, ''));
    const meta = createTextElement('span', 'wbs-file-meta', 'MD');
    button.append(label, meta);
    button.classList.toggle('active', (state.currentFile?.path || state.currentFile?.fileName) === (file.path || file.fileName));
    button.addEventListener('click', () => openFile(file));
    content.append(button);
  });
  dom.fileList.append(content);
};

const refreshFileList = async () => {
  if (state.mode === 'browser') {
    const files = [];
    for await (const [name, handle] of state.wbsDirectoryHandle.entries()) {
      if (handle.kind === 'file' && /\.(md|markdown)$/i.test(name) && !name.startsWith('.')) {
        files.push({ fileName: name, path: name, handle });
      }
    }
    state.files = sortWbsFiles(files);
  } else {
    const response = await fetch('/api/editor-file-list', { method: 'POST' });
    if (!response.ok) throw new Error('FILE_LIST_FAILED');
    const result = await response.json();
    state.files = sortWbsFiles(result.files || []);
  }
  renderFileList();
};

const openFile = async (file) => {
  try {
    let markdown = '';
    if (state.mode === 'browser') {
      markdown = await readFileMarkdown(file);
      state.currentFile = {
        ...file,
        mode: 'browser',
        directoryHandle: state.wbsDirectoryHandle,
      };
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
        origin: result.origin || 'tree',
        path: result.path || file.path,
        fileName: result.fileName || file.fileName,
        saveDir: result.saveDir || state.saveDir,
      };
    }
    state.data = parseMarkdown(markdown);
    hydrateForm();
    setFormVisible(true);
    updatePreview();
    renderFileList();
    setFileDrawerOpen(false);
    showToast('info', '문서 불러옴', `${state.currentFile.fileName} 문서를 열었습니다.`);
    return true;
  } catch {
    showToast('danger', '열기 실패', 'WBS 문서를 열지 못했습니다.');
    return false;
  }
};

const initializeWorkspace = async () => {
  if (isBrowserFileSystemSupported()) {
    const workspaceDirectoryHandle = await readPersistedBrowserOpenedFolder();
    if (!workspaceDirectoryHandle) return false;
    if (!(await ensureBrowserWritePermission(workspaceDirectoryHandle))) return false;
    state.wbsDirectoryHandle = await getBrowserWbsDirectoryHandle(workspaceDirectoryHandle);
    state.mode = 'browser';
    return true;
  }
  return ensureServerWbsWorkspace();
};

const saveBrowserDocument = async (fileName, markdown, { preventOverwrite = false } = {}) => {
  if (preventOverwrite) {
    try {
      await state.wbsDirectoryHandle.getFileHandle(fileName);
      throw new Error('FILE_EXISTS');
    } catch (error) {
      if (error.message === 'FILE_EXISTS') throw error;
    }
  }

  const handle = await state.wbsDirectoryHandle.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(markdown);
  await writable.close();
  state.currentFile = {
    mode: 'browser',
    fileName,
    path: fileName,
    handle,
    directoryHandle: state.wbsDirectoryHandle,
  };
};

const saveServerDocument = async (fileName, markdown, { forceNew = false } = {}) => {
  const isExisting = state.currentFile?.mode === 'server' && !forceNew;
  const response = await fetch(isExisting ? '/api/save-current-file' : '/api/save-new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isExisting
      ? {
          origin: state.currentFile.origin,
          path: state.currentFile.path,
          fileName: state.currentFile.fileName,
          markdown,
        }
      : {
          fileName,
          markdown,
          saveDir: state.saveDir,
        }),
  });
  if (!response.ok) {
    const error = new Error('SAVE_FAILED');
    error.status = response.status;
    throw error;
  }
  const result = await response.json();
  state.currentFile = {
    mode: 'server',
    origin: result.origin || 'tree',
    path: result.path || fileName,
    fileName: result.fileName || fileName,
    saveDir: result.saveDir || state.saveDir,
  };
};

const saveDocument = async ({ forceNew = false } = {}) => {
  if (!state.data) {
    showToast('warning', '문서 없음', '새문서를 먼저 만들어주세요.');
    return;
  }

  if (!validateBeforeSave()) return;
  stampDocumentForSave();
  const markdown = createMarkdown();
  const fileName = forceNew || !state.currentFile ? buildFileName() : state.currentFile.fileName;
  try {
    if (state.mode === 'browser') {
      await saveBrowserDocument(fileName, markdown, { preventOverwrite: forceNew || !state.currentFile });
    } else {
      await saveServerDocument(fileName, markdown, { forceNew: forceNew || !state.currentFile });
    }
    setFormVisible(true);
    try {
      await refreshFileList();
    } catch {
      renderFileList();
    }
    showToast('success', '저장 완료', `${fileName} 문서를 저장했습니다.`);
  } catch (error) {
    if (error.message === 'FILE_EXISTS' || error.status === 409) {
      showToast('danger', '저장 실패', '같은 이름의 파일이 이미 있습니다.');
      return;
    }
    showToast('danger', '저장 실패', 'WBS 문서를 저장하지 못했습니다.');
  }
};

const deleteCurrentFile = async () => {
  if (!state.currentFile) return;

  try {
    if (state.currentFile.mode === 'browser') {
      await state.currentFile.directoryHandle.removeEntry(state.currentFile.fileName);
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

    const deletedFileName = state.currentFile.fileName;
    state.currentFile = null;
    state.data = null;
    setFormVisible(false);
    updatePreview();
    try {
      await refreshFileList();
    } catch {
      renderFileList();
    }
    showToast('success', '삭제 완료', `${deletedFileName} 문서를 삭제했습니다.`);
  } catch {
    showToast('danger', '삭제 실패', 'WBS 문서를 삭제하지 못했습니다.');
  }
};

const openConfirmDialog = () =>
  new Promise((resolve) => {
    state.messageResolver = resolve;
    dom.messageDialog.hidden = false;
    dom.messageDialogConfirmButton?.focus();
  });

const closeConfirmDialog = (result) => {
  dom.messageDialog.hidden = true;
  const resolver = state.messageResolver;
  state.messageResolver = null;
  resolver?.(result);
};

const requestDeleteDocument = async () => {
  if (!state.currentFile) {
    showToast('warning', '문서 선택 필요', '삭제할 WBS 문서가 없습니다.');
    return;
  }
  if (await openConfirmDialog()) {
    await deleteCurrentFile();
  }
};

const setPreviewOpen = (isOpen) => {
  dom.appShell?.classList.toggle('preview-closed', !isOpen);
  dom.previewToggleButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (dom.previewPanel) {
    dom.previewPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    dom.previewPanel.inert = !isOpen;
  }
  if (isOpen) updatePreview();
};

const togglePreview = () => {
  const isOpen = !dom.appShell?.classList.contains('preview-closed');
  setPreviewOpen(!isOpen);
};

const closeSaveDropdown = () => {
  if (!dom.saveDropdown) return;
  dom.saveDropdown.hidden = true;
  dom.saveMenuButton?.setAttribute('aria-expanded', 'false');
};

const setSaveDropdownOpen = (isOpen) => {
  if (!dom.saveDropdown) return;
  dom.saveDropdown.hidden = !isOpen;
  dom.saveMenuButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isSaveDropdownOpen = () => Boolean(dom.saveDropdown && !dom.saveDropdown.hidden);

const setHelpDialogOpen = (isOpen) => {
  if (!dom.helpDialog) return;
  dom.helpDialog.hidden = !isOpen;
  dom.helpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (isOpen) dom.helpDialogCloseButton?.focus();
};

const setHelpTopic = (topic) => {
  const nextTopic = topic || 'shortcuts';
  dom.helpTopicButtons.forEach((button) => {
    const isActive = button.dataset.wbsHelpTopic === nextTopic;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  dom.helpSections.forEach((section) => {
    section.classList.toggle('active', section.dataset.wbsHelpSection === nextTopic);
  });
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

const initialize = async () => {
  restoreSideMenuWidth();
  syncFilePanelLayoutMode();
  setFormVisible(false);
  updatePreview();

  try {
    const opened = await initializeWorkspace();
    if (!opened) {
      redirectHomeForWorkspace();
      return;
    }
    await refreshFileList();
    setFormVisible(false);
  } catch {
    redirectHomeForWorkspace();
  }
};

dom.form?.addEventListener('input', () => {
  if (document.activeElement?.classList?.contains('is-error') && normalizeText(document.activeElement.value)) {
    document.activeElement.classList.remove('is-error', 'shake');
  }
  readFormValues();
  updatePreview();
});
dom.form?.addEventListener('change', () => {
  readFormValues();
  updatePreview();
});
dom.addTaskButton?.addEventListener('click', () => {
  addTaskAndFocus();
});
dom.previewToggleButton?.addEventListener('click', togglePreview);
dom.resetButton?.addEventListener('click', resetDocument);
dom.newButton?.addEventListener('click', createNewDocument);
dom.emptyNewButton?.addEventListener('click', createNewDocument);
dom.deleteButton?.addEventListener('click', requestDeleteDocument);
dom.saveButton?.addEventListener('click', () => saveDocument());
dom.saveMenuButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setSaveDropdownOpen(!isSaveDropdownOpen());
});
dom.saveOverwriteButton?.addEventListener('click', () => {
  closeSaveDropdown();
  saveDocument();
});
dom.saveNewButton?.addEventListener('click', () => {
  closeSaveDropdown();
  saveDocument({ forceNew: true });
});
dom.copyButton?.addEventListener('click', copyMarkdown);
dom.filePanelRail?.addEventListener('click', openFilePanelFromRail);
dom.filePanelBackdrop?.addEventListener('click', () => setFileDrawerOpen(false));
dom.sideMenuResizer?.addEventListener('pointerdown', startSideMenuResize);
dom.sideMenuResizer?.addEventListener('keydown', adjustSideMenuFromKeyboard);
dom.helpButton?.addEventListener('click', () => {
  setHelpTopic('shortcuts');
  setHelpDialogOpen(true);
});
dom.helpDialogCloseButton?.addEventListener('click', () => setHelpDialogOpen(false));
dom.helpDialog?.addEventListener('click', (event) => {
  if (event.target === dom.helpDialog) setHelpDialogOpen(false);
});
dom.helpTopicButtons.forEach((button) => {
  button.addEventListener('click', () => setHelpTopic(button.dataset.wbsHelpTopic));
});
dom.messageDialogCancelButton?.addEventListener('click', () => closeConfirmDialog(false));
dom.messageDialogConfirmButton?.addEventListener('click', () => closeConfirmDialog(true));
dom.messageDialog?.addEventListener('click', (event) => {
  if (event.target === dom.messageDialog) closeConfirmDialog(false);
});
dom.topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.addEventListener('click', (event) => {
  if (event.target instanceof Element && !event.target.closest('#wbsSaveSplitButton')) {
    closeSaveDropdown();
  }
});
document.addEventListener('pointermove', moveSideMenuResize);
document.addEventListener('pointerup', stopSideMenuResize);
document.addEventListener('pointercancel', stopSideMenuResize);
window.addEventListener('resize', syncFilePanelLayoutMode);
document.addEventListener('keydown', (event) => {
  const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's';
  const isNewShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd';
  const isPreviewShortcut = event.altKey && event.key.toLowerCase() === 'v';
  const isResetShortcut = event.altKey && event.key.toLowerCase() === 'r';

  if (isSaveShortcut) {
    event.preventDefault();
    saveDocument();
    return;
  }
  if (isNewShortcut) {
    event.preventDefault();
    createNewDocument();
    return;
  }
  if (isPreviewShortcut) {
    event.preventDefault();
    togglePreview();
    return;
  }
  if (isResetShortcut) {
    event.preventDefault();
    resetDocument();
    return;
  }
  if (event.key === 'Escape') {
    if (dom.helpDialog && !dom.helpDialog.hidden) {
      setHelpDialogOpen(false);
      return;
    }
    if (dom.messageDialog && !dom.messageDialog.hidden) {
      closeConfirmDialog(false);
      return;
    }
    if (isSaveDropdownOpen()) {
      closeSaveDropdown();
      return;
    }
    if (dom.appShell?.classList.contains('file-drawer-open')) {
      setFileDrawerOpen(false);
    }
  }
});

initialize();
