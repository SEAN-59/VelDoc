const STORAGE_KEY = 'veldoc-draft';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const rowDefinitions = {
  headers: {
    id: 'headersRows',
    className: 'compact',
    fields: [
      ['key', 'Key', 'Authorization'],
      ['value', 'Value 예시', 'Bearer {accessToken}'],
      ['required', '필수', 'Y'],
      ['description', '설명', '로그인 토큰'],
    ],
  },
  pathParams: {
    id: 'pathParamsRows',
    className: 'path-param-row',
    fields: [
      ['key', 'Key', 'noticeId'],
      ['type', 'Type', 'string'],
      ['required', '필수', 'N'],
      ['beforeAction', '실동작 앞', 'N'],
      ['example', '예시', 'not_001'],
      ['description', '설명', '공지 ID'],
    ],
  },
  actionPathParams: {
    id: 'actionPathParamsRows',
    className: 'action-param-row',
    fields: [
      ['key', 'Key', 'noticeId'],
      ['type', 'Type', 'string'],
      ['required', '필수', 'N'],
      ['example', '예시', 'not_001'],
      ['description', '설명', '공지 ID'],
    ],
  },
  queryParams: {
    id: 'queryParamsRows',
    className: 'query-param-row',
    fields: [
      ['key', 'Key', 'month'],
      ['type', 'Type', 'string'],
      ['required', '필수', 'N'],
      ['defaultValue', '기본값', '현재 월'],
      ['example', '예시', '2026-04'],
      ['description', '설명', '조회 월'],
    ],
  },
  bodyFields: {
    id: 'bodyFieldsRows',
    className: 'body-row',
    fields: [
      ['parentKey', 'UpKey', ''],
      ['key', 'Key', 'title'],
      ['type', 'Type', 'string'],
      ['required', '필수', 'Y'],
      ['example', '예시', '5월 근태 마감 일정 안내'],
      ['description', '설명', '제목'],
    ],
  },
  responseFields: {
    id: 'responseFieldsRows',
    className: 'response-row',
    fields: [
      ['parentKey', 'UpKey', ''],
      ['key', 'Key', 'attendance'],
      ['type', 'Type', '{}'],
      ['nullable', 'Nullable', 'N'],
      ['example', '예시', ''],
      ['description', '설명', '근태 상태'],
    ],
  },
  errors: {
    id: 'errorsRows',
    className: 'error-row',
    fields: [
      ['status', 'Status', '401'],
      ['code', 'Code', 'UNAUTHORIZED'],
      ['message', 'Message', '로그인이 필요합니다.'],
      ['condition', '발생 상황', '토큰 없음 또는 만료'],
    ],
  },
};

const form = document.querySelector('#specForm');
const appShell = document.querySelector('#appShell');
const sideMenu = document.querySelector('#sideMenu');
const sideMenuResizer = document.querySelector('#sideMenuResizer');
const workspace = document.querySelector('.workspace');
const workspaceTitle = document.querySelector('#workspaceTitle');
const preview = document.querySelector('#preview');
const previewPanel = document.querySelector('#previewPanel');
const statusText = document.querySelector('#statusText');
const saveButton = document.querySelector('#saveButton');
const saveOverwriteButton = document.querySelector('#saveOverwriteButton');
const saveNewButton = document.querySelector('#saveNewButton');
const copyButton = document.querySelector('#copyButton');
const previewToggleButton = document.querySelector('#previewToggleButton');
const resetButton = document.querySelector('#resetButton');
const newDocumentButton = document.querySelector('#newDocumentButton');
const openButton = document.querySelector('#openButton');
const openMenuButton = document.querySelector('#openMenuButton');
const openDropdown = document.querySelector('#openDropdown');
const openFileInput = document.querySelector('#openFileInput');
const saveMenuButton = document.querySelector('#saveMenuButton');
const saveDropdown = document.querySelector('#saveDropdown');
const pageLoadingOverlay = document.querySelector('#pageLoadingOverlay');
const pageLoadingText = document.querySelector('#pageLoadingText');
const messageDialog = document.querySelector('#messageDialog');
const messageDialogTitle = document.querySelector('#messageDialogTitle');
const messageDialogBody = document.querySelector('#messageDialogBody');
const messageDialogCancelButton = document.querySelector('#messageDialogCancelButton');
const messageDialogCloseButton = document.querySelector('#messageDialogCloseButton');
const toastContainer = document.querySelector('#toastContainer');
const menuButton = document.querySelector('#menuButton');
const floatingMenu = document.querySelector('#floatingMenu');
const menuBackdrop = document.querySelector('#menuBackdrop');
const filePanelBackdrop = document.querySelector('#filePanelBackdrop');
const filePanelRail = document.querySelector('#filePanelRail');
const topButton = document.querySelector('#topButton');
const folderViewerButton = document.querySelector('#folderViewerButton');
const fileTree = document.querySelector('#fileTree');
const fileTreeRoot = document.querySelector('#fileTreeRoot');
const specViewer = document.querySelector('#specViewer');
const specViewerRoot = document.querySelector('#specViewerRoot');
const specViewerCount = document.querySelector('#specViewerCount');
const specViewerFilters = document.querySelector('#specViewerFilters');
const specCommonTabs = document.querySelector('#specCommonTabs');
const specVersionTabs = document.querySelector('#specVersionTabs');
const specViewerNote = document.querySelector('#specViewerNote');
const specViewerList = document.querySelector('#specViewerList');
const specViewerEmpty = document.querySelector('#specViewerEmpty');
const viewerTransitionSkeleton = document.querySelector('#viewerTransitionSkeleton');
const pathPreview = document.querySelector('#pathPreview');
const fileNamePreview = document.querySelector('#fileNamePreview');
const fileLocationPreview = document.querySelector('#fileLocationPreview');
const paramsPathPreview = document.querySelector('#paramsPathPreview');
const queryPathPreview = document.querySelector('#queryPathPreview');
const queryParamsSection = document.querySelector('#queryParamsSection');
const bodySection = document.querySelector('#bodySection');
const actionPathParamsPanel = document.querySelector('#actionPathParamsPanel');
const actionPathParamsRows = document.querySelector('#actionPathParamsRows');
const authRequiredToggle = document.querySelector('#authRequiredToggle');
const authDetails = document.querySelector('#authDetails');
const successStatusTabs = document.querySelector('#successStatusTabs');
const addSuccessStatusButton = document.querySelector('#addSuccessStatusButton');
const successStatusError = document.querySelector('#successStatusError');

const defaultRows = {
  headers: [{ required: 'Y' }],
  pathParams: [],
  actionPathParams: [],
  queryParams: [],
  bodyFields: [],
  responseFields: [],
  errors: [
    { status: '400', code: 'BAD_REQUEST', message: '요청 값이 올바르지 않습니다.', condition: '필수 값 누락 또는 타입 오류' },
    { status: '401', code: 'UNAUTHORIZED', message: '로그인이 필요합니다.', condition: '토큰 없음 또는 만료' },
    { status: '403', code: 'FORBIDDEN', message: '접근 권한이 없습니다.', condition: 'Role 권한 부족' },
    { status: '404', code: 'NOT_FOUND', message: '데이터를 찾을 수 없습니다.', condition: '대상 리소스 없음' },
  ],
};

const defaultSuccessResponses = [{ status: '200', fields: [] }];

const SIDE_MENU_WIDTH_KEY = 'veldoc-side-menu-width';
const SIDE_MENU_MIN_WIDTH = 176;
const SIDE_MENU_MAX_WIDTH = 280;
const SIDE_MENU_DEFAULT_WIDTH = 280;
const SIDE_MENU_SNAP_RANGE = 18;
const SIDE_MENU_COLLAPSE_WIDTH = 134;
const SIDE_MENU_NARROW_WIDTH = 212;
const COMPACT_FILE_PANEL_QUERY = '(max-width: 1180px)';

const normalizeSaveDir = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const normalized = raw
    .replaceAll('\\', '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  if (normalized.startsWith('/')) {
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length === 0 || parts.some((part) => part === '.' || part === '..')) {
      return null;
    }
    return `/${parts.join('/')}`;
  }

  const relativePath = normalized.replace(/^\.\//, '').replace(/^\/+/, '');
  const parts = relativePath.split('/').filter(Boolean);

  if (parts.length === 0 || parts.some((part) => part === '.' || part === '..')) {
    return null;
  }
  return `./${parts.join('/')}`;
};

const getDirectoryPath = (filePath) => {
  const normalized = String(filePath ?? '').replaceAll('\\', '/').replace(/\/+/g, '/');
  const lastSlashIndex = normalized.lastIndexOf('/');
  if (lastSlashIndex <= 0) return '';
  return normalized.slice(0, lastSlashIndex);
};

const state = {
  rows: structuredClone(defaultRows),
  saveDir: '',
  activeTreeFilePath: '',
  currentFile: null,
  browserDirectoryHandle: null,
  browserSaveDirectoryHandle: null,
  fileTreeHandles: new Map(),
  viewerMode: false,
  fileTreeOpened: false,
  sideMenuWidth: SIDE_MENU_DEFAULT_WIDTH,
  sideMenuHidden: false,
  fileDrawerOpen: false,
  successResponses: structuredClone(defaultSuccessResponses),
  activeSuccessResponseIndex: 0,
  viewerCommon: '',
  viewerVersion: '',
};

let isSyncingActionPathParamKey = false;
let messageDialogReturnFocus = null;
let messageDialogResolver = null;
let messageDialogMode = 'alert';
let sideMenuResizeState = null;
let successStatusPreviousValue = '200';
let successStatusDragState = null;

const disableBrowserTextAssist = (element) => {
  element.setAttribute('autocomplete', 'off');
  element.setAttribute('autocapitalize', 'none');
  element.setAttribute('autocorrect', 'off');
  element.setAttribute('spellcheck', 'false');
  element.setAttribute('data-1p-ignore', 'true');
  element.setAttribute('data-lpignore', 'true');
  element.setAttribute('data-form-type', 'other');
};

[...form.querySelectorAll('input[type="text"], textarea')].forEach(disableBrowserTextAssist);

const setStatus = (message) => {
  statusText.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusText.textContent = '자동 저장됨';
  }, 1800);
};

const createSuccessResponse = (values = {}) => ({
  status: String(values.status ?? '').replace(/\D/g, '').slice(0, 3),
  fields: Array.isArray(values.fields)
    ? values.fields.map((row) => ({ ...row, nullable: row.nullable || 'N' }))
    : [],
});

const normalizeSuccessResponses = (responses, fallbackStatus = '200', fallbackFields = []) => {
  const normalized = Array.isArray(responses)
    ? responses.map(createSuccessResponse).filter((response) => response.status || response.fields.length > 0)
    : [];

  if (normalized.length > 0) {
    return normalized.reduce((acc, response) => {
      const existing = response.status
        ? acc.find((item) => item.status === response.status)
        : null;
      if (existing) {
        existing.fields.push(...response.fields);
        return acc;
      }
      acc.push(response);
      return acc;
    }, []);
  }
  return [createSuccessResponse({ status: fallbackStatus, fields: fallbackFields })];
};

const getSuccessResponses = () => {
  state.successResponses = normalizeSuccessResponses(
    state.successResponses,
    form.elements.successStatus?.value || '200',
    state.rows.responseFields || [],
  );
  state.activeSuccessResponseIndex = Math.min(
    Math.max(0, state.activeSuccessResponseIndex),
    state.successResponses.length - 1,
  );
  return state.successResponses;
};

const getActiveSuccessResponse = () => getSuccessResponses()[state.activeSuccessResponseIndex];

const normalizeSuccessStatusValue = (value) => String(value ?? '').trim();

const sanitizeSuccessStatusValue = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 3);

const hasDuplicateSuccessStatus = (status, exceptIndex = state.activeSuccessResponseIndex) => {
  const normalizedStatus = normalizeSuccessStatusValue(status);
  if (!normalizedStatus) return false;
  return getSuccessResponses().some((response, index) => index !== exceptIndex && response.status === normalizedStatus);
};

const clearSuccessStatusError = () => {
  const inputElement = form.elements.successStatus;
  inputElement?.classList.remove('is-error', 'shake');
  inputElement?.removeAttribute('aria-invalid');
  inputElement?.removeAttribute('aria-describedby');
  if (successStatusError) {
    successStatusError.hidden = true;
    successStatusError.textContent = '';
  }
};

const showSuccessStatusError = (message) => {
  const inputElement = form.elements.successStatus;
  if (!inputElement) return;

  inputElement.classList.add('is-error');
  inputElement.setAttribute('aria-invalid', 'true');
  if (successStatusError) {
    successStatusError.textContent = message;
    successStatusError.hidden = false;
    inputElement.setAttribute('aria-describedby', successStatusError.id);
  }

  inputElement.classList.remove('shake');
  requestAnimationFrame(() => {
    inputElement.classList.add('shake');
    inputElement.addEventListener('animationend', () => inputElement.classList.remove('shake'), { once: true });
  });
  inputElement.focus();
};

const clearSuccessStatusDragIndicators = () => {
  successStatusTabs?.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
    element.classList.remove('drag-over-before', 'drag-over-after');
  });
};

const getSuccessStatusPointerOwner = (event) =>
  event.target instanceof Element ? event.target.closest('.success-status-tab') : null;

const getSuccessStatusDropTarget = (clientX, clientY) => {
  const tabs = [...(successStatusTabs?.querySelectorAll('.draggable-status-tab') || [])];
  if (tabs.length === 0) return null;

  const closest = tabs.reduce((best, tab) => {
    const rect = tab.getBoundingClientRect();
    const dx = clientX < rect.left ? rect.left - clientX : clientX > rect.right ? clientX - rect.right : 0;
    const dy = clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
    const distance = dx * dx + dy * dy;
    return !best || distance < best.distance ? { tab, rect, distance } : best;
  }, null);

  if (!closest) return null;
  return {
    element: closest.tab,
    index: Number.parseInt(closest.tab.dataset.index || '-1', 10),
    position: clientX < closest.rect.left + closest.rect.width / 2 ? 'before' : 'after',
  };
};

const updateSuccessStatusDropIndicator = (clientX, clientY) => {
  if (!successStatusDragState) return null;
  const target = getSuccessStatusDropTarget(clientX, clientY);
  clearSuccessStatusDragIndicators();
  if (target?.element) {
    target.element.classList.add(target.position === 'before' ? 'drag-over-before' : 'drag-over-after');
  }
  return target;
};

const endSuccessStatusDrag = (event, shouldMove = false) => {
  if (!successStatusDragState) return;
  const dragState = successStatusDragState;
  if (dragState.pointerId !== event.pointerId) return;
  const target = shouldMove ? updateSuccessStatusDropIndicator(event.clientX, event.clientY) : null;

  dragState.tab.classList.remove('dragging');
  if (dragState.owner.hasPointerCapture?.(dragState.pointerId)) {
    dragState.owner.releasePointerCapture(dragState.pointerId);
  }
  successStatusDragState = null;
  clearSuccessStatusDragIndicators();

  if (shouldMove && target && target.index >= 0) {
    moveSuccessResponse(dragState.fromIndex, target.index, target.position);
  }
};

const getMutableRows = (type) => {
  if (type === 'responseFields') return getActiveSuccessResponse().fields;
  return state.rows[type];
};

const setActiveSuccessResponseIndex = (index) => {
  clearSuccessStatusError();
  const responses = getSuccessResponses();
  state.activeSuccessResponseIndex = Math.min(Math.max(0, index), responses.length - 1);
  renderSuccessStatusTabs();
  renderRows('responseFields');
  refresh();
};

const scrollPageToTop = (behavior = 'smooth') => {
  if (behavior === 'smooth') {
    window.scrollTo({ top: 0, left: 0, behavior });
    return;
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const clampSideMenuWidth = (value) =>
  Math.min(SIDE_MENU_MAX_WIDTH, Math.max(SIDE_MENU_MIN_WIDTH, Number(value) || SIDE_MENU_DEFAULT_WIDTH));

const isCompactFilePanelLayout = () => window.matchMedia(COMPACT_FILE_PANEL_QUERY).matches;

const setSideMenuWidth = (width, { persist = true } = {}) => {
  state.sideMenuWidth = clampSideMenuWidth(width);
  document.documentElement.style.setProperty('--side-menu-width', `${state.sideMenuWidth}px`);
  sideMenu?.classList.toggle('is-narrow', state.sideMenuWidth < SIDE_MENU_NARROW_WIDTH);
  sideMenuResizer?.setAttribute('aria-valuenow', String(Math.round(state.sideMenuWidth)));
  if (persist) localStorage.setItem(SIDE_MENU_WIDTH_KEY, String(Math.round(state.sideMenuWidth)));
};

const setFileDrawerOpen = (isOpen) => {
  state.fileDrawerOpen = isOpen;
  appShell?.classList.toggle('file-drawer-open', isOpen);
  document.body.classList.toggle('file-drawer-open', isOpen);
  if (filePanelBackdrop) filePanelBackdrop.hidden = !isOpen;
  filePanelRail?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (sideMenu && isCompactFilePanelLayout()) {
    sideMenu.inert = !isOpen;
    sideMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }
  updateFilePanelRail();
};

const setSideMenuHidden = (isHidden) => {
  state.sideMenuHidden = isHidden;
  appShell?.classList.toggle('side-menu-hidden', isHidden);
  appShell?.classList.remove('side-menu-collapsing');
  if (sideMenu && !isCompactFilePanelLayout()) {
    sideMenu.inert = isHidden;
    sideMenu.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
  }
  updateFilePanelRail();
};

function updateFilePanelRail() {
  const shouldShow = isCompactFilePanelLayout()
    ? !state.fileDrawerOpen
    : state.sideMenuHidden || Boolean(appShell?.classList.contains('side-menu-collapsing'));
  document.body.classList.toggle('file-rail-visible', shouldShow);
}

const syncFilePanelLayoutMode = () => {
  const isCompact = isCompactFilePanelLayout();
  document.body.classList.toggle('compact-file-panel', isCompact);

  if (isCompact) {
    appShell?.classList.remove('side-menu-hidden', 'side-menu-collapsing');
    state.sideMenuHidden = false;
    if (sideMenu) {
      sideMenu.inert = !state.fileDrawerOpen;
      sideMenu.setAttribute('aria-hidden', state.fileDrawerOpen ? 'false' : 'true');
    }
  } else {
    setFileDrawerOpen(false);
    if (sideMenu) {
      sideMenu.inert = state.sideMenuHidden;
      sideMenu.setAttribute('aria-hidden', state.sideMenuHidden ? 'true' : 'false');
    }
  }
  updateFilePanelRail();
};

const restoreSideMenuWidth = () => {
  localStorage.removeItem(SIDE_MENU_WIDTH_KEY);
  setSideMenuWidth(SIDE_MENU_DEFAULT_WIDTH, { persist: false });
};

const showPageLoading = (message = '처리 중...') => {
  if (pageLoadingText) pageLoadingText.textContent = message;
  if (pageLoadingOverlay) pageLoadingOverlay.hidden = false;
};

const hidePageLoading = () => {
  if (pageLoadingOverlay) pageLoadingOverlay.hidden = true;
};

const delay = (duration) => new Promise((resolve) => {
  window.setTimeout(resolve, duration);
});

const waitForViewTransitionPreview = () => delay(1000);

const setViewTransitionSkeleton = (isVisible, mode = 'viewer') => {
  workspace?.classList.toggle('is-view-transitioning', isVisible);
  if (viewerTransitionSkeleton) {
    viewerTransitionSkeleton.dataset.mode = mode;
    viewerTransitionSkeleton.hidden = !isVisible;
  }
};

const removeToast = (toast) => {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  window.setTimeout(() => toast.remove(), 240);
};

const showToast = (type, title, message) => {
  if (!toastContainer) return;
  const icons = { success: '✓', warning: '!', danger: '✕', info: 'i' };
  const existingToasts = toastContainer.querySelectorAll('.toast');
  if (existingToasts.length >= 4) existingToasts[0].remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', type === 'danger' ? 'alert' : 'status');

  const icon = document.createElement('div');
  icon.className = `toast-icon ${type}`;
  icon.textContent = icons[type] || 'i';

  const content = document.createElement('div');
  content.className = 'toast-content';
  content.append(
    createTextElement('div', 'toast-title', title),
    createTextElement('div', 'toast-msg', message),
  );

  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', '토스트 닫기');
  closeButton.addEventListener('click', () => removeToast(toast));

  toast.append(icon, content, closeButton);
  toastContainer.append(toast);
  window.setTimeout(() => removeToast(toast), 4000);
};

const showSaveSuccessToast = (message = '변경사항이 저장되었습니다.') => {
  showToast('success', '저장 완료', message);
};

const showSaveFailureToast = (message = '저장하지 못했습니다.') => {
  showToast('danger', '저장 실패', message);
};

const showWarningToast = (title, message) => {
  showToast('warning', title, message);
};

const showErrorToast = (title, message) => {
  showToast('danger', title, message);
};

const closeMessageDialog = (confirmed = false) => {
  if (messageDialog) messageDialog.hidden = true;
  if (messageDialogCancelButton) {
    messageDialogCancelButton.hidden = true;
    messageDialogCancelButton.textContent = '취소';
  }
  if (messageDialogCloseButton) messageDialogCloseButton.textContent = '확인';
  const resolver = messageDialogResolver;
  messageDialogResolver = null;
  messageDialogMode = 'alert';
  messageDialogReturnFocus?.focus();
  messageDialogReturnFocus = null;
  resolver?.(confirmed);
};

const hideMessageDialog = () => {
  closeMessageDialog(false);
};

const showConfirmDialog = (title, message, options = {}) => {
  messageDialogResolver?.(false);
  return new Promise((resolve) => {
    messageDialogResolver = resolve;
    messageDialogMode = 'confirm';
    messageDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (messageDialogTitle) messageDialogTitle.textContent = title;
    if (messageDialogBody) messageDialogBody.textContent = message;
    if (messageDialogCancelButton) {
      messageDialogCancelButton.hidden = false;
      messageDialogCancelButton.textContent = options.cancelText || '취소';
    }
    if (messageDialogCloseButton) messageDialogCloseButton.textContent = options.confirmText || '확인';
    if (messageDialog) messageDialog.hidden = false;
    messageDialogCancelButton?.focus();
  });
};

const setFloatingMenuOpen = (isOpen) => {
  menuButton?.classList.toggle('active', isOpen);
  menuButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (floatingMenu) {
    floatingMenu.classList.toggle('open', isOpen);
    floatingMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    floatingMenu.inert = !isOpen;
  }
  if (menuBackdrop) {
    menuBackdrop.hidden = !isOpen;
  }
};

const isFloatingMenuOpen = () => Boolean(floatingMenu?.classList.contains('open'));

const toggleFloatingMenu = () => {
  setFloatingMenuOpen(!isFloatingMenuOpen());
};

const setPreviewOpen = (isOpen) => {
  appShell?.classList.toggle('preview-closed', !isOpen);
  previewToggleButton?.classList.toggle('active', isOpen);
  previewToggleButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (previewPanel) {
    previewPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    previewPanel.inert = !isOpen;
  }
};

const setDropdownOpen = (button, menu, isOpen) => {
  if (!button || !menu) return;
  menu.hidden = !isOpen;
  button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const isDropdownOpen = (menu) => Boolean(menu && !menu.hidden);

const closeActionDropdowns = () => {
  setDropdownOpen(openMenuButton, openDropdown, false);
  setDropdownOpen(saveMenuButton, saveDropdown, false);
};

const setSpecViewerMode = (isOpen) => {
  state.viewerMode = isOpen;
  if (isOpen) clearSuccessStatusError();
  form.hidden = isOpen;
  if (specViewer) specViewer.hidden = !isOpen;
  workspace?.classList.toggle('viewer-mode', isOpen);
  folderViewerButton?.classList.toggle('active', isOpen);
  folderViewerButton?.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
  if (workspaceTitle) workspaceTitle.textContent = isOpen ? 'API 명세서 뷰어' : 'API 명세서 작성기';
  if (isOpen) setPreviewOpen(false);
};

const escapePipes = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');

const normalizeFileName = (value) => {
  const source = value.trim() || 'api-spec.md';
  const safeName = source
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return safeName.endsWith('.md') ? safeName : `${safeName}.md`;
};

const input = (name) => form.elements[name]?.value.trim() ?? '';

const splitPathPart = (value) =>
  String(value ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

const getPathPrefixSegments = () => [
  ...splitPathPart(input('pathBase')),
  ...splitPathPart(input('pathVersion')),
  ...splitPathPart(input('pathSwaggerTag')),
];

const getPathActionSegments = () => splitPathPart(input('pathAction'));

const getPathSegments = () => [
  ...getPathPrefixSegments(),
  ...getPathActionSegments(),
];

const buildApiPath = () => {
  const segments = getPathSegments();
  return segments.length > 0 ? `/${segments.join('/')}` : '미정';
};

const getRowsWithKey = (type) =>
  state.rows[type].filter((row) => String(row.key ?? '').trim());

const normalizePathParamKey = (key) =>
  String(key ?? '').trim().replace(/^\{/, '').replace(/\}$/, '');

const toPathParamToken = (key) => `{${normalizePathParamKey(key)}}`;

const getActionPathParamKeys = () => {
  const keys = [...input('pathAction').matchAll(/\{([^{}]+)\}/g)]
    .map((match) => normalizePathParamKey(match[1]))
    .filter(Boolean);
  return [...new Set(keys)];
};

const removeActionPathParam = (key) => {
  const token = toPathParamToken(key);
  const segments = getPathActionSegments().filter((segment) => segment !== token);
  form.elements.pathAction.value = segments.length > 0 ? `/${segments.join('/')}` : '';
  state.rows.actionPathParams = state.rows.actionPathParams.filter(
    (row) => normalizePathParamKey(row.key) !== normalizePathParamKey(key),
  );
  renderActionPathParams();
  refresh();
};

const syncActionPathParamRows = () => {
  const keys = getActionPathParamKeys();
  const existingRows = new Map();
  state.rows.actionPathParams.forEach((row) => {
    const pathKey = normalizePathParamKey(row.pathKey);
    const key = normalizePathParamKey(row.key);
    if (pathKey) existingRows.set(pathKey, row);
    if (key) existingRows.set(key, row);
  });
  state.rows.actionPathParams = keys.map((key) => ({
    ...(existingRows.get(key) || { key, type: 'string', required: 'N' }),
    key: normalizePathParamKey(existingRows.get(key)?.key) || key,
    pathKey: key,
  }));
  return keys;
};

const buildPathParamPreview = () => {
  const prefixSegments = getPathPrefixSegments();
  const actionSegments = getPathActionSegments();
  const currentPath = buildApiPath();
  if (currentPath === '미정') return currentPath;

  const beforeActionParams = [];
  const afterActionParams = [];
  getRowsWithKey('pathParams').forEach((row) => {
    const key = normalizePathParamKey(row.key);
    const token = toPathParamToken(key);
    if (!key || currentPath.includes(token)) return;
    if (row.beforeAction === 'Y') {
      beforeActionParams.push(token);
      return;
    }
    afterActionParams.push(token);
  });

  const segments = [
    ...prefixSegments,
    ...beforeActionParams,
    ...actionSegments,
    ...afterActionParams,
  ];
  return segments.length > 0 ? `/${segments.join('/')}` : '미정';
};

const buildQueryParamPreview = () => {
  const path = buildPathParamPreview();
  if (path === '미정') return path;

  const queryParams = getRowsWithKey('queryParams').map((row) => {
    const key = String(row.key).trim();
    const value = String(row.example || '{value}').trim();
    return `${key}=${value}`;
  });

  return queryParams.length > 0 ? `${path}?${queryParams.join('&')}` : path;
};

const buildSwaggerTag = () => {
  const segments = splitPathPart(input('pathSwaggerTag'));
  return segments.join('/') || '미정';
};

const buildFileNameFromPath = () => {
  const segments = getPathSegments().map((segment) => normalizePathParamKey(segment));
  return normalizeFileName(segments.length > 0 ? segments.join('-') : 'api-spec');
};

const hasSaveDir = () => Boolean(String(state.saveDir ?? '').trim());
const isBrowserFileSystemSupported = () =>
  window.isSecureContext && 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
const isBrowserFileSystemFile = (file) => String(file?.origin ?? '').startsWith('browser');
const isMarkdownFileName = (fileName) => /\.(md|markdown)$/i.test(String(fileName ?? ''));
const localFileLabel = (...parts) => ['내 컴퓨터', ...parts].filter(Boolean).join('/');

const buildFileLocation = () => {
  if (state.currentFile?.displayPath) return state.currentFile.displayPath;
  return hasSaveDir() ? `${state.saveDir}/${buildFileNameFromPath()}` : '파일 위치 미정';
};

const isFileLocationReady = () => hasSaveDir() || Boolean(state.currentFile);

const checkedValues = (name) =>
  [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((item) => item.value);

const isQueryParamsEnabled = () => input('method') !== 'POST';
const isBodyEnabled = () => input('method') === 'POST';

const syncMethodState = () => {
  if (queryParamsSection) {
    queryParamsSection.hidden = !isQueryParamsEnabled();
  }
  if (bodySection) {
    bodySection.hidden = !isBodyEnabled();
  }
};

const isAuthRequired = () => input('authRequired') !== '불필요';

const syncAuthState = () => {
  const required = isAuthRequired();
  if (authRequiredToggle) {
    authRequiredToggle.textContent = required ? '필요' : '불필요';
    authRequiredToggle.classList.toggle('active', required);
    authRequiredToggle.setAttribute('aria-pressed', required ? 'true' : 'false');
  }
  if (authDetails) {
    authDetails.classList.toggle('collapsed', !required);
    authDetails.setAttribute('aria-hidden', required ? 'false' : 'true');
    authDetails.querySelectorAll('input, select, textarea, button').forEach((element) => {
      element.tabIndex = required ? 0 : -1;
    });
  }
};

const linesToBullets = (value) => {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join('\n') : '- 없음';
};

const formatJsonBlock = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '없음';

  try {
    return `\`\`\`json\n${JSON.stringify(JSON.parse(trimmed), null, 2)}\n\`\`\``;
  } catch {
    return `\`\`\`json\n${trimmed}\n\`\`\``;
  }
};

const parseExampleValue = (type, example) => {
  const normalizedType = String(type || 'string').toLowerCase();
  const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
  const trimmedExample = String(example ?? '').trim();
  const arrayItemType = getArrayItemType(scalarType);
  const isArray = arrayItemType !== null;
  const isObject = scalarType === '{}' || scalarType.includes('object');

  if (trimmedExample) {
    if (isArray) return parseArrayExample(arrayItemType, trimmedExample);
    if (isIntegerType(scalarType)) {
      const value = Number.parseInt(trimmedExample, 10);
      return Number.isNaN(value) ? 0 : value;
    }
    if (isNumberType(scalarType)) {
      const value = Number(trimmedExample);
      return Number.isNaN(value) ? 0 : value;
    }
    if (isBooleanType(scalarType)) {
      return ['true', '1', 'y', 'yes'].includes(trimmedExample.toLowerCase());
    }
    if (isObject) {
      try {
        return JSON.parse(trimmedExample);
      } catch {
        return {};
      }
    }
    if (scalarType.includes('null')) return null;
    return trimmedExample;
  }

  if (isArray) return [];
  if (isIntegerType(scalarType) || isNumberType(scalarType)) return 0;
  if (isBooleanType(scalarType)) return false;
  if (isObject) return {};
  if (scalarType.includes('null')) return null;
  return '';
};

const getScalarTypeFromShorthand = (marker) => {
  const value = marker.trim().toLowerCase();
  if (value === 'bool' || value === 'boolean') return 'boolean';
  if (/^[0-9]$/.test(value)) return 'integer';
  if (/^[0-9]\.[0-9]$/.test(value)) return 'double';
  if (/^[a-z]$/.test(value)) return 'string';
  if (/^[ㄱ-ㅎㅏ-ㅣ가-힣]$/.test(value)) return 'string';
  return null;
};

const getArrayItemType = (type) => {
  if (type === '[]' || type === 'array') return 'object';
  const shorthandMatch = type.match(/^\[(.+)\]$/);
  if (shorthandMatch) return getArrayItemTypeFromShorthand(shorthandMatch[1]);
  if (type.endsWith('[]')) return type.slice(0, -2) || 'object';
  const genericMatch = type.match(/^array\s*<\s*(.+?)\s*>$/);
  if (genericMatch) return genericMatch[1];
  return null;
};

const getArrayItemTypeFromShorthand = (marker) => {
  return getScalarTypeFromShorthand(marker);
};

const parseArrayExample = (itemType, example) => {
  try {
    const parsed = JSON.parse(example);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // 쉼표 입력 방식으로 이어서 처리한다.
  }

  if (itemType === 'object' || itemType === '{}') {
    try {
      return [JSON.parse(example)];
    } catch {
      return [{}];
    }
  }

  return example
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value !== '')
    .map((value) => parseExampleValue(itemType, value));
};

const isIntegerType = (type) => ['int', 'integer'].some((keyword) => type.includes(keyword));

const isNumberType = (type) => ['number', 'float', 'double', 'decimal'].some((keyword) => type.includes(keyword));

const isBooleanType = (type) => ['bool', 'boolean'].some((keyword) => type.includes(keyword));

const ensureArrayObject = (array) => {
  if (array.length === 0 || typeof array[0] !== 'object' || array[0] === null || Array.isArray(array[0])) {
    array[0] = {};
  }
  return array[0];
};

const setChildValue = (container, key, value) => {
  if (Array.isArray(container)) {
    ensureArrayObject(container)[key] = value;
    return;
  }
  if (typeof container === 'object' && container !== null) {
    container[key] = value;
  }
};

const getParentKeys = (rows) =>
  new Set(
    rows
      .map((row) => String(row.parentKey ?? '').trim())
      .filter(Boolean),
  );

const parseContainerValue = (type, example) => {
  const normalizedType = String(type || '').toLowerCase();
  const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
  const arrayItemType = getArrayItemType(scalarType);

  if (arrayItemType !== null) {
    const value = parseExampleValue(type, example);
    if (
      Array.isArray(value) &&
      (value.length === 0 || (typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])))
    ) {
      return value;
    }
    return [];
  }

  const value = parseExampleValue(type || '{}', example);
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value;
  }
  return {};
};

const buildJsonFromRows = (rowType, rowsOverride = null) => {
  const sourceRows = rowsOverride ?? getFieldRows(rowType);
  const rows = sourceRows.filter((row) => String(row.key ?? '').trim());
  if (rows.length === 0) return '';

  const payload = {};
  const valuesByKey = new Map();
  const parentKeys = getParentKeys(rows);

  rows.forEach((row) => {
    const key = row.key.trim();
    const value = parentKeys.has(key)
      ? parseContainerValue(row.type, row.example)
      : parseExampleValue(row.type, row.example);
    valuesByKey.set(key, value);
  });

  rows.forEach((row) => {
    const key = row.key.trim();
    const parentKey = String(row.parentKey ?? '').trim();
    const value = valuesByKey.get(key);
    const parent = parentKey ? valuesByKey.get(parentKey) : null;

    if (parentKey && parent !== undefined) {
      setChildValue(parent, key, value);
      return;
    }

    setChildValue(payload, key, value);
  });

  return JSON.stringify(payload, null, 2);
};

const buildBodyJson = () => buildJsonFromRows('bodyFields');

const buildSuccessJson = (successResponse = getActiveSuccessResponse()) =>
  buildJsonFromRows('responseFields', successResponse.fields || []);

const table = (headers, rows, emptyText = '없음') => {
  const visibleRows = rows.filter((row) =>
    Object.entries(row).some(
      ([key, value]) =>
        !['required', 'nullable', 'beforeAction', 'pathKey'].includes(key) &&
        String(value ?? '').trim() !== '',
    ),
  );
  if (visibleRows.length === 0) return emptyText;

  const head = `| ${headers.map((header) => header.label).join(' | ')} |`;
  const divider = `| ${headers.map((header) => (header.alignRight ? '---:' : '---')).join(' | ')} |`;
  const body = visibleRows
    .map((row) => `| ${headers.map((header) => escapePipes(row[header.key] || '')).join(' | ')} |`)
    .join('\n');
  return `${head}\n${divider}\n${body}`;
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const decodeMarkdownCell = (value) => {
  let decoded = String(value ?? '').trim();
  decoded = decoded.replaceAll('<br>', '\n').replaceAll('\\|', '|');
  if (decoded.startsWith('`') && decoded.endsWith('`')) {
    decoded = decoded.slice(1, -1);
  }
  return decoded.trim();
};

const blankIfPlaceholder = (value) => {
  const decoded = decodeMarkdownCell(value);
  return ['미정', '없음', '해당 없음'].includes(decoded) ? '' : decoded;
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
      cells.push(decodeMarkdownCell(current));
      current = '';
      return;
    }
    current += char;
  });
  cells.push(decodeMarkdownCell(current));
  return cells;
};

const isTableDivider = (cells) =>
  cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(String(cell).trim()));

const getMarkdownSection = (markdown, title) => {
  const headingPattern = new RegExp(`^##\\s+\\d+\\.\\s+${escapeRegExp(title)}\\s*$`, 'm');
  const match = headingPattern.exec(markdown);
  if (!match) return '';

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+\d+\.\s+/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
};

const parseMarkdownTables = (section) => {
  const lines = section.split('\n');
  const tables = [];
  let current = [];

  lines.forEach((line) => {
    if (line.trim().startsWith('|')) {
      current.push(line);
      return;
    }
    if (current.length > 0) {
      tables.push(current);
      current = [];
    }
  });
  if (current.length > 0) tables.push(current);

  return tables
    .map((tableLines) => {
      const rows = tableLines.map(splitMarkdownTableRow);
      const [headers = [], ...bodyRows] = rows;
      return {
        headers,
        rows: bodyRows.filter((row) => !isTableDivider(row)),
      };
    })
    .filter((parsedTable) => parsedTable.headers.length > 0);
};

const parseInfoTable = (section) => {
  const tableData = parseMarkdownTables(section)[0];
  if (!tableData) return {};

  return tableData.rows.reduce((acc, row) => {
    const key = decodeMarkdownCell(row[0]);
    if (key) acc[key] = decodeMarkdownCell(row[1]);
    return acc;
  }, {});
};

const parseRowsByHeaders = (section, mapping) => {
  const tableData = parseMarkdownTables(section)[0];
  if (!tableData) return [];

  const indexes = mapping.map(([, header]) => tableData.headers.findIndex((cell) => cell === header));
  return tableData.rows
    .map((row) =>
      mapping.reduce((acc, [key], index) => {
        const tableIndex = indexes[index];
        acc[key] = tableIndex >= 0 ? decodeMarkdownCell(row[tableIndex]) : '';
        return acc;
      }, {}),
    )
    .filter((row) => Object.values(row).some((value) => String(value ?? '').trim()));
};

const responseFieldMapping = [
  ['parentKey', 'UpKey'],
  ['key', 'Key'],
  ['type', 'Type'],
  ['nullable', 'Nullable'],
  ['example', '예시'],
  ['description', '설명'],
];

const parseResponseFields = (section) =>
  parseRowsByHeaders(section, responseFieldMapping).map((row) => ({ ...row, nullable: row.nullable || 'N' }));

const parseSuccessResponsesFromMarkdown = (section) => {
  const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
  const matches = [...section.matchAll(blockPattern)];

  if (matches.length === 0) {
    const status = blankIfPlaceholder(section.match(/Status:\s*`?([^`\n]+)`?/)?.[1] || '200') || '200';
    return normalizeSuccessResponses(null, status, parseResponseFields(section));
  }

  return normalizeSuccessResponses(
    matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = matches[index + 1]?.index ?? section.length;
      const block = section.slice(start, end).trim();
      return {
        status: blankIfPlaceholder(match[1]) || '200',
        fields: parseResponseFields(block),
      };
    }),
  );
};

const extractJsonBlock = (section) => {
  const match = /```json\s*([\s\S]*?)```/i.exec(section);
  return decodeMarkdownCell(match?.[1] ?? '');
};

const parseViewerSuccessResponsesFromMarkdown = (section) => {
  const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
  const matches = [...section.matchAll(blockPattern)];

  if (matches.length === 0) {
    return [
      {
        status: blankIfPlaceholder(section.match(/Status:\s*`?([^`\n]+)`?/)?.[1] || '200') || '200',
        json: extractJsonBlock(section),
        fields: parseResponseFields(section),
      },
    ];
  }

  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? section.length;
    const block = section.slice(start, end).trim();
    return {
      status: blankIfPlaceholder(match[1]) || '200',
      json: extractJsonBlock(block),
      fields: parseResponseFields(block),
    };
  });
};

const parseBulletLines = (section) =>
  section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => blankIfPlaceholder(line.slice(2)))
    .filter(Boolean)
    .join('\n');

const setFormValue = (name, value) => {
  const elements = form.elements[name];
  if (!elements) return;
  elements.value = value;
};

const setCheckedValues = (name, values) => {
  const selectedValues = new Set(values);
  form.querySelectorAll(`input[name="${name}"]`).forEach((element) => {
    element.checked = selectedValues.has(element.value);
  });
};

const normalizeLoadedMethod = (value) => (String(value).toUpperCase() === 'GET' ? 'GET' : 'POST');

const parseCsvValues = (value) =>
  blankIfPlaceholder(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getMarkdownTableValue = (section, key) => parseInfoTable(section)[key] || '';

const splitApiPath = (value) =>
  blankIfPlaceholder(value)
    .replace(/^https?:\/\/[^/]+/i, '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

const isEmptySpecGroupValue = (value) => {
  const text = blankIfPlaceholder(value);
  return !text || text === 'UNKNOWN';
};

const startsWithSegments = (segments, prefixSegments) =>
  prefixSegments.length > 0 && prefixSegments.every((segment, index) => segments[index] === segment);

const parsePathPartsFromMarkdown = (path, swaggerTag, pathParamRows) => {
  const segments = splitPathPart(blankIfPlaceholder(path));
  const pathParamTokens = new Set(
    pathParamRows
      .filter((row) => row.beforeAction === 'Y' || row.beforeAction === 'N')
      .map((row) => toPathParamToken(row.key)),
  );

  const pathBase = segments[0] ? `/${segments[0]}` : '/api';
  const pathVersion = segments[1] ? `/${segments[1]}` : '/v1';
  let remaining = segments.slice(2);
  let pathSwaggerTag = '';
  const swaggerSegments = splitPathPart(blankIfPlaceholder(swaggerTag));

  if (startsWithSegments(remaining, swaggerSegments)) {
    pathSwaggerTag = `/${swaggerSegments.join('/')}`;
    remaining = remaining.slice(swaggerSegments.length);
  } else if (remaining[0] && !remaining[0].startsWith('{')) {
    pathSwaggerTag = `/${remaining.shift()}`;
  }

  const actionSegments = remaining.filter((segment) => !pathParamTokens.has(segment));
  return {
    pathBase,
    pathVersion,
    pathSwaggerTag,
    pathAction: actionSegments.length > 0 ? `/${actionSegments.join('/')}` : '',
  };
};

const requiredMarkdownSections = [
  '기본 정보',
  '인증 / 권한',
  'Headers',
  'Path Params',
  'Query Params',
  'Body',
  'Success Response',
  'Error Response',
  '비즈니스 규칙',
  '목록 / 페이지네이션 규칙',
  '프론트엔드 처리 메모',
];

const isApiSpecMarkdown = (markdown) => {
  if (!/^#\s+.+$/m.test(markdown)) return false;
  if (!requiredMarkdownSections.every((section) => getMarkdownSection(markdown, section))) return false;

  const basic = parseInfoTable(getMarkdownSection(markdown, '기본 정보'));
  const method = String(blankIfPlaceholder(basic.Method)).toUpperCase();
  return ['GET', 'POST'].includes(method) && Boolean(blankIfPlaceholder(basic.Path));
};

const assertApiSpecMarkdown = (markdown) => {
  if (!isApiSpecMarkdown(markdown)) {
    throw new Error('INVALID_API_SPEC_MARKDOWN');
  }
};

const applyMarkdownSpec = (markdown) => {
  assertApiSpecMarkdown(markdown);

  const basic = parseInfoTable(getMarkdownSection(markdown, '기본 정보'));
  const auth = parseInfoTable(getMarkdownSection(markdown, '인증 / 권한'));
  const pagination = parseInfoTable(getMarkdownSection(markdown, '목록 / 페이지네이션 규칙'));
  const title = blankIfPlaceholder(markdown.match(/^#\s+(.+)$/m)?.[1] || '');

  const headers = parseRowsByHeaders(getMarkdownSection(markdown, 'Headers'), [
    ['key', 'Key'],
    ['value', 'Value 예시'],
    ['required', '필수'],
    ['description', '설명'],
  ]);
  const parsedPathParams = parseRowsByHeaders(getMarkdownSection(markdown, 'Path Params'), [
    ['key', 'Key'],
    ['type', 'Type'],
    ['required', '필수'],
    ['beforeAction', '실동작 앞'],
    ['example', '예시'],
    ['description', '설명'],
  ]);
  const queryParams = parseRowsByHeaders(getMarkdownSection(markdown, 'Query Params'), [
    ['key', 'Key'],
    ['type', 'Type'],
    ['required', '필수'],
    ['defaultValue', '기본값'],
    ['example', '예시'],
    ['description', '설명'],
  ]);
  const bodyFields = parseRowsByHeaders(getMarkdownSection(markdown, 'Body'), [
    ['parentKey', 'UpKey'],
    ['key', 'Key'],
    ['type', 'Type'],
    ['required', '필수'],
    ['example', '예시'],
    ['description', '설명'],
  ]);
  const successResponses = parseSuccessResponsesFromMarkdown(getMarkdownSection(markdown, 'Success Response'));
  const errors = parseRowsByHeaders(getMarkdownSection(markdown, 'Error Response'), [
    ['status', 'Status'],
    ['code', 'Code'],
    ['message', 'Message'],
    ['condition', '발생 상황'],
  ]);
  const normalPathParams = parsedPathParams.filter((row) => row.beforeAction === 'Y' || row.beforeAction === 'N');
  const actionPathParams = parsedPathParams
    .filter((row) => row.key && row.beforeAction !== 'Y' && row.beforeAction !== 'N')
    .map((row) => ({
      key: normalizePathParamKey(row.key),
      pathKey: normalizePathParamKey(row.key),
      type: row.type || 'string',
      required: row.required || 'N',
      example: row.example || '',
      description: row.description || '',
    }));
  const pathParts = parsePathPartsFromMarkdown(basic.Path, basic['Swagger Tag'], normalPathParams);
  const authRequired = blankIfPlaceholder(auth['인증 필요 여부']) === '불필요' ? '불필요' : '필요';
  const authScheme = ['JWT Bearer', 'OAuth 2.0', 'API Key'].includes(blankIfPlaceholder(auth['인증 방식']))
    ? blankIfPlaceholder(auth['인증 방식'])
    : 'JWT Bearer';

  form.reset();
  setFormValue('apiName', blankIfPlaceholder(basic['API 이름']) || title);
  setFormValue('method', normalizeLoadedMethod(blankIfPlaceholder(basic.Method)));
  setFormValue('pathBase', pathParts.pathBase);
  setFormValue('pathVersion', pathParts.pathVersion);
  setFormValue('pathSwaggerTag', pathParts.pathSwaggerTag);
  setFormValue('pathAction', pathParts.pathAction);
  setCheckedValues('clients', parseCsvValues(basic['사용처']));
  setFormValue('purpose', blankIfPlaceholder(basic['목적']));
  setFormValue('authRequired', authRequired);
  setFormValue('authScheme', authScheme);
  setCheckedValues('roles', parseCsvValues(auth['접근 가능 Role']));
  setFormValue('permissionRules', blankIfPlaceholder(auth['권한 규칙']));
  setFormValue('businessRules', parseBulletLines(getMarkdownSection(markdown, '비즈니스 규칙')));
  setFormValue('paginationType', blankIfPlaceholder(pagination['페이지 방식']));
  setFormValue('defaultSort', blankIfPlaceholder(pagination['기본 정렬']));
  setFormValue('maxItems', blankIfPlaceholder(pagination['최대 조회 개수']));
  setFormValue(
    'filters',
    blankIfPlaceholder(pagination['검색 / 필터 조건']) ||
      [blankIfPlaceholder(pagination['검색 조건']), blankIfPlaceholder(pagination['필터 조건'])].filter(Boolean).join('\n'),
  );
  setFormValue('frontendNotes', parseBulletLines(getMarkdownSection(markdown, '프론트엔드 처리 메모')));

  state.rows = {
    ...structuredClone(defaultRows),
    headers,
    pathParams: normalPathParams.map((row) => ({
      ...row,
      key: normalizePathParamKey(row.key),
      required: row.required || 'N',
      beforeAction: row.beforeAction || 'N',
    })),
    actionPathParams,
    queryParams: queryParams.map((row) => ({ ...row, required: row.required || 'N' })),
    bodyFields: bodyFields.map((row) => ({ ...row, required: row.required || 'Y' })),
    responseFields: [],
    errors,
  };
  state.successResponses = successResponses;
  state.activeSuccessResponseIndex = 0;
  setFormValue('successStatus', getActiveSuccessResponse().status || '200');

  Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
  renderSuccessStatusTabs();
  renderActionPathParams();
  refresh();
};

const getFieldRows = (type) =>
  getMutableRows(type).map((row) => ({ ...row }));

const normalizeRowsForMarkdown = (rows) => {
  const parentKeys = getParentKeys(rows);
  return rows.map((row) => ({
    ...row,
    type: normalizeTypeForSpec(row.type, parentKeys.has(String(row.key ?? '').trim())),
  }));
};

const getFieldRowsForMarkdown = (type) => {
  const rows = type === 'pathParams'
    ? [...getFieldRows('actionPathParams'), ...getFieldRows('pathParams')]
    : getFieldRows(type);
  return normalizeRowsForMarkdown(rows);
};

const normalizeTypeForSpec = (type, forceContainer = false) => {
  const originalType = String(type ?? '').trim();
  const normalizedType = originalType.toLowerCase();
  const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
  const arrayItemType = getArrayItemType(scalarType);

  if (forceContainer) {
    return arrayItemType !== null ? 'object[]' : 'object';
  }

  if (arrayItemType !== null) {
    return `${normalizeScalarTypeForSpec(arrayItemType)}[]`;
  }

  return normalizeScalarTypeForSpec(scalarType, originalType);
};

const normalizeScalarTypeForSpec = (normalizedType, fallback = normalizedType) => {
  if (normalizedType === '{}') return 'object';
  if (normalizedType === '[]') return 'object[]';
  if (normalizedType === 'bool') return 'boolean';
  if (isIntegerType(normalizedType)) return 'integer';
  if (normalizedType.includes('double')) return 'double';
  if (normalizedType.includes('float')) return 'float';
  if (isNumberType(normalizedType)) return 'number';
  if (isBooleanType(normalizedType)) return 'boolean';
  if (normalizedType.includes('object')) return 'object';
  if (normalizedType.includes('string')) return 'string';
  return fallback || 'string';
};

const formatSuccessResponseMarkdown = (successResponse, { includeStatusLine = true } = {}) => {
  const status = escapePipes(successResponse.status || '200');
  const fields = normalizeRowsForMarkdown(successResponse.fields || []);

  return `${includeStatusLine ? `Status: \`${status}\`\n\n` : ''}${formatJsonBlock(buildSuccessJson(successResponse))}

${table(
    [
      { key: 'parentKey', label: 'UpKey' },
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'nullable', label: 'Nullable', alignRight: true },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    fields,
  )}`;
};

const formatSuccessResponsesMarkdown = () => {
  const responses = getSuccessResponses();
  if (responses.length === 1) return formatSuccessResponseMarkdown(responses[0]);

  return responses
    .map((response, index) => `### ${index + 1}. Status \`${escapePipes(response.status || '200')}\`

${formatSuccessResponseMarkdown(response, { includeStatusLine: false })}`)
    .join('\n\n');
};

const generateMarkdown = () => {
  const clients = checkedValues('clients');
  const roles = checkedValues('roles');
  const apiName = input('apiName') || '미정';
  const method = input('method') || 'POST';
  const path = buildPathParamPreview();
  const swaggerTag = buildSwaggerTag();
  const authRequired = isAuthRequired() ? '필요' : '불필요';
  const authScheme = authRequired === '필요' ? input('authScheme') || 'JWT Bearer' : '해당 없음';
  const roleText = authRequired === '필요' ? roles.join(', ') || '미정' : '해당 없음';
  const permissionRules = authRequired === '필요' ? input('permissionRules') || '미정' : '해당 없음';
  const authHeaderLine = authRequired === '필요' ? " \\\n  -H 'Authorization: Bearer {accessToken}'" : '';

  const paginationRows = [
    { key: '페이지 방식', value: input('paginationType') || '해당 없음' },
    { key: '기본 정렬', value: input('defaultSort') || '해당 없음' },
    { key: '최대 조회 개수', value: input('maxItems') || '해당 없음' },
    { key: '검색 / 필터 조건', value: input('filters') || '해당 없음' },
  ];

  return `# ${apiName}

## 1. 기본 정보

| 항목 | 내용 |
|---|---|
| API 이름 | ${escapePipes(apiName)} |
| Path | \`${escapePipes(path)}\` |
| Method | \`${escapePipes(method)}\` |
| 사용처 | ${escapePipes(clients.join(', ') || '미정')} |
| 목적 | ${escapePipes(input('purpose') || '미정')} |
| Swagger Tag | \`${escapePipes(swaggerTag)}\` |

## 2. 인증 / 권한

| 항목 | 내용 |
|---|---|
| 인증 필요 여부 | ${escapePipes(authRequired)} |
| 인증 방식 | ${escapePipes(authScheme)} |
| 접근 가능 Role | ${escapePipes(roleText)} |
| 권한 규칙 | ${escapePipes(permissionRules)} |

## 3. Headers

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'value', label: 'Value 예시' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'description', label: '설명' },
    ],
    getFieldRows('headers'),
  )}

## 4. Path Params

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'beforeAction', label: '실동작 앞', alignRight: true },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    getFieldRowsForMarkdown('pathParams'),
  )}

## 5. Query Params

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'defaultValue', label: '기본값' },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    isQueryParamsEnabled() ? getFieldRowsForMarkdown('queryParams') : [],
  )}

## 6. Body

${isBodyEnabled() ? formatJsonBlock(buildBodyJson()) : '없음'}

${table(
    [
      { key: 'parentKey', label: 'UpKey' },
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    isBodyEnabled() ? getFieldRowsForMarkdown('bodyFields') : [],
  )}

## 7. Success Response

${formatSuccessResponsesMarkdown()}

## 8. Error Response

${table(
    [
      { key: 'status', label: 'Status', alignRight: true },
      { key: 'code', label: 'Code' },
      { key: 'message', label: 'Message' },
      { key: 'condition', label: '발생 상황' },
    ],
    getFieldRows('errors'),
  )}

## 9. 비즈니스 규칙

${linesToBullets(input('businessRules'))}

## 10. 목록 / 페이지네이션 규칙

${table(
    [
      { key: 'key', label: '항목' },
      { key: 'value', label: '내용' },
    ],
    paginationRows,
  )}

## 11. 프론트엔드 처리 메모

${linesToBullets(input('frontendNotes'))}

## 12. 예시 호출

\`\`\`bash
curl -X ${method} 'https://example.com${path === '미정' ? '' : path}'${authHeaderLine}
\`\`\`
`;
};

const collectFormData = () => {
  const formData = {};
  [...form.elements].forEach((element) => {
    if (!element.name) return;
    if (element.type === 'checkbox') {
      formData[element.name] ??= [];
      if (element.checked) formData[element.name].push(element.value);
      return;
    }
    if (element.type === 'radio') {
      formData[element.name] ??= '';
      if (element.checked) formData[element.name] = element.value;
      return;
    }
    formData[element.name] = element.value;
  });
  return {
    formData,
    rows: state.rows,
    successResponses: getSuccessResponses(),
    activeSuccessResponseIndex: state.activeSuccessResponseIndex,
  };
};

const saveDraft = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectFormData()));
};

const resizeJsonPreview = (textarea) => {
  if (!textarea) return;
  const style = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(style.lineHeight) || 20;
  const paddingY = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  const minRows = Number.parseInt(textarea.dataset.minRows || textarea.getAttribute('rows') || '1', 10);
  const maxRows = Number.parseInt(textarea.dataset.maxRows || '0', 10);
  const minHeight = lineHeight * minRows + paddingY;
  const maxHeight = maxRows > 0 ? lineHeight * maxRows + paddingY : Infinity;

  textarea.style.height = 'auto';
  const nextHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
};

function renderSuccessStatusTabs() {
  if (!successStatusTabs) return;
  const responses = getSuccessResponses();
  successStatusTabs.replaceChildren();

  responses.forEach((response, index) => {
    const tab = document.createElement('div');
    tab.className = `success-status-tab ${responses.length > 1 ? 'draggable-status-tab' : ''} ${index === state.activeSuccessResponseIndex ? 'active' : ''}`.trim();
    tab.dataset.index = String(index);
    tab.setAttribute('role', 'presentation');

    if (responses.length > 1) {
      tab.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        if (event.target instanceof Element && event.target.closest('.success-status-remove')) return;
        const pointerOwner = getSuccessStatusPointerOwner(event);
        if (!pointerOwner) return;
        successStatusDragState = {
          fromIndex: index,
          owner: pointerOwner,
          pointerId: event.pointerId,
          tab,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        };
        pointerOwner.setPointerCapture?.(event.pointerId);
      });
      tab.addEventListener('pointermove', (event) => {
        if (!successStatusDragState || successStatusDragState.pointerId !== event.pointerId) return;
        const distance = Math.hypot(event.clientX - successStatusDragState.startX, event.clientY - successStatusDragState.startY);
        if (!successStatusDragState.moved && distance < 4) return;
        successStatusDragState.moved = true;
        successStatusDragState.tab.classList.add('dragging');
        updateSuccessStatusDropIndicator(event.clientX, event.clientY);
      });
      tab.addEventListener('pointerup', (event) => {
        const shouldMove = Boolean(successStatusDragState?.moved);
        endSuccessStatusDrag(event, shouldMove);
      });
      tab.addEventListener('pointercancel', (event) => endSuccessStatusDrag(event));
    }

    const button = document.createElement('button');
    button.className = 'success-status-tab-button';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === state.activeSuccessResponseIndex ? 'true' : 'false');
    button.textContent = response.status || '200';
    button.addEventListener('click', () => setActiveSuccessResponseIndex(index));
    tab.append(button);

    if (responses.length > 1) {
      const removeButton = document.createElement('button');
      removeButton.className = 'success-status-remove';
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', `${response.status || '200'} 상태 삭제`);
      removeButton.addEventListener('click', () => removeSuccessResponse(index));
      tab.append(removeButton);
    }

    successStatusTabs.append(tab);
  });
}

const renderActionPathParams = () => {
  if (!actionPathParamsPanel || !actionPathParamsRows) return;
  const keys = syncActionPathParamRows();
  actionPathParamsPanel.hidden = keys.length === 0;
  actionPathParamsRows.replaceChildren();
  renderFieldTableRows('actionPathParams', rowDefinitions.actionPathParams, actionPathParamsRows);
};

const refresh = () => {
  const fileLocationReady = isFileLocationReady();
  const canOverwriteCurrentFile = fileLocationReady && Boolean(state.currentFile);
  form?.classList.toggle('is-file-location-unset', !fileLocationReady);
  if (!fileLocationReady) {
    setPreviewOpen(false);
  }
  if (previewToggleButton) previewToggleButton.disabled = !fileLocationReady;
  if (resetButton) resetButton.disabled = !fileLocationReady;
  if (newDocumentButton) newDocumentButton.disabled = !fileLocationReady;
  if (saveButton) saveButton.disabled = !fileLocationReady;
  if (saveMenuButton) saveMenuButton.disabled = !fileLocationReady;
  if (saveOverwriteButton) {
    saveOverwriteButton.disabled = !canOverwriteCurrentFile;
    saveOverwriteButton.title = canOverwriteCurrentFile ? '현재 열린 파일에 저장' : '현재 열린 파일이 있을 때 사용할 수 있습니다.';
  }
  if (saveNewButton) saveNewButton.disabled = !fileLocationReady;
  saveDropdown?.querySelectorAll('[data-save-action]').forEach((button) => {
    button.disabled = button.dataset.saveAction === 'overwrite' ? !canOverwriteCurrentFile : !fileLocationReady;
  });
  if (!fileLocationReady && isDropdownOpen(saveDropdown)) {
    setDropdownOpen(saveMenuButton, saveDropdown, false);
  }

  syncMethodState();
  syncAuthState();
  if (pathPreview) {
    pathPreview.textContent = buildApiPath();
  }
  if (paramsPathPreview) {
    paramsPathPreview.textContent = buildPathParamPreview();
  }
  if (queryPathPreview) {
    queryPathPreview.textContent = buildQueryParamPreview();
  }
  if (fileNamePreview) {
    fileNamePreview.textContent = buildFileNameFromPath();
  }
  if (fileLocationPreview) {
    const fileLocation = buildFileLocation();
    fileLocationPreview.textContent = fileLocation;
    fileLocationPreview.title = fileLocation;
  }
  if (form.elements.bodyJson) {
    form.elements.bodyJson.value = buildBodyJson();
    resizeJsonPreview(form.elements.bodyJson);
  }
  if (form.elements.successStatus) {
    form.elements.successStatus.value = getActiveSuccessResponse().status;
  }
  if (form.elements.successJson) {
    form.elements.successJson.value = buildSuccessJson();
    resizeJsonPreview(form.elements.successJson);
  }
  renderSuccessStatusTabs();
  preview.textContent = generateMarkdown();
  saveDraft();
};

const focusFirstInputInRow = (type, index) => {
  window.requestAnimationFrame(() => {
    const definition = rowDefinitions[type];
    const container = document.querySelector(`#${definition.id}`);
    const rowElement = container?.querySelectorAll('.row, .header-card')[index];
    rowElement?.querySelector('input')?.focus();
  });
};

const focusSuccessStatusInput = () => {
  window.requestAnimationFrame(() => {
    form.elements.successStatus?.focus();
    form.elements.successStatus?.select?.();
  });
};

const addSuccessResponse = () => {
  const responses = getSuccessResponses();
  const usedStatuses = new Set(responses.map((response) => response.status));
  const candidates = ['201', '202', '204', '206'];
  let nextStatus = candidates.find((status) => !usedStatuses.has(status)) || '';
  if (!nextStatus) {
    for (let statusNumber = 200; statusNumber < 300; statusNumber += 1) {
      if (!usedStatuses.has(String(statusNumber))) {
        nextStatus = String(statusNumber);
        break;
      }
    }
  }
  if (!nextStatus) {
    showWarningToast('상태 추가 실패', '추가할 수 있는 2xx 상태 코드가 없습니다.');
    return;
  }
  responses.push(createSuccessResponse({ status: nextStatus, fields: [] }));
  state.activeSuccessResponseIndex = responses.length - 1;
  clearSuccessStatusError();
  renderSuccessStatusTabs();
  renderRows('responseFields');
  refresh();
  focusSuccessStatusInput();
  setStatus('Success 상태 추가됨');
};

const removeSuccessResponse = (index) => {
  const responses = getSuccessResponses();
  if (responses.length <= 1) return;
  responses.splice(index, 1);
  state.activeSuccessResponseIndex = Math.min(state.activeSuccessResponseIndex, responses.length - 1);
  clearSuccessStatusError();
  renderSuccessStatusTabs();
  renderRows('responseFields');
  refresh();
};

const moveSuccessResponse = (fromIndex, targetIndex, position) => {
  const responses = getSuccessResponses();
  if (fromIndex < 0 || targetIndex < 0) return;
  if (fromIndex >= responses.length || targetIndex >= responses.length) return;
  const activeResponse = responses[state.activeSuccessResponseIndex];

  let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
  if (fromIndex < insertIndex) insertIndex -= 1;
  if (fromIndex === insertIndex) return;

  const [movedResponse] = responses.splice(fromIndex, 1);
  responses.splice(insertIndex, 0, movedResponse);
  state.activeSuccessResponseIndex = Math.max(0, responses.indexOf(activeResponse));
  clearSuccessStatusError();
  renderSuccessStatusTabs();
  renderRows('responseFields');
  refresh();
  setStatus('Success 상태 순서 변경됨');
};

const addRow = (type, values = {}, options = {}) => {
  const insertIndex = Number.isInteger(options.afterIndex)
    ? options.afterIndex + 1
    : getMutableRows(type).length;
  getMutableRows(type).splice(insertIndex, 0, values);
  renderRows(type);
  refresh();
  if (options.focusNewRow) {
    focusFirstInputInRow(type, insertIndex);
  }
};

const updateRow = (type, index, key, value) => {
  const rows = getMutableRows(type);
  if (type === 'actionPathParams' && key === 'key') {
    const previousKey = normalizePathParamKey(rows[index]?.pathKey || rows[index]?.key);
    const nextKey = normalizePathParamKey(value);
    if (previousKey && nextKey && previousKey !== nextKey) {
      const previousToken = toPathParamToken(previousKey);
      const nextToken = toPathParamToken(nextKey);
      const segments = getPathActionSegments().map((segment) => (segment === previousToken ? nextToken : segment));
      isSyncingActionPathParamKey = true;
      form.elements.pathAction.value = segments.length > 0 ? `/${segments.join('/')}` : '';
      isSyncingActionPathParamKey = false;
      rows[index].pathKey = nextKey;
    }
  }
  rows[index][key] = type === 'actionPathParams' && key === 'key'
    ? normalizePathParamKey(value)
    : value;
  refresh();
};

const removeRow = (type, index) => {
  if (type === 'actionPathParams') {
    const row = state.rows.actionPathParams[index];
    removeActionPathParam(row?.pathKey || row?.key);
    return;
  }
  getMutableRows(type).splice(index, 1);
  renderRows(type);
  refresh();
};

const clearDragIndicators = (container) => {
  container.querySelectorAll('.drag-over-before, .drag-over-after').forEach((element) => {
    element.classList.remove('drag-over-before', 'drag-over-after');
  });
};

const getDropPosition = (event, rowElement) => {
  const rect = rowElement.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
};

const moveRow = (type, fromIndex, targetIndex, position) => {
  if (fromIndex < 0 || targetIndex < 0) return;
  const rows = getMutableRows(type);
  if (fromIndex >= rows.length || targetIndex >= rows.length) return;
  let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
  if (fromIndex < insertIndex) insertIndex -= 1;
  if (fromIndex === insertIndex) return;

  const [row] = rows.splice(fromIndex, 1);
  rows.splice(insertIndex, 0, row);
  renderRows(type);
  refresh();
};

const addEnterRowHandler = (inputElement, type, index) => {
  inputElement.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    addRow(type, {}, { afterIndex: index, focusNewRow: true });
  });
};

const renderHeaderRows = (definition, container) => {
  state.rows.headers.forEach((row, index) => {
    const card = document.createElement('div');
    card.className = 'header-card';

    const topRow = document.createElement('div');
    topRow.className = 'header-card-top';

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button header-remove';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', '헤더 삭제');
    removeButton.addEventListener('click', () => removeRow('headers', index));

    definition.fields.forEach(([key, label, placeholder]) => {
      if (key === 'description') return;

      const wrapper = document.createElement(['required'].includes(key) ? 'div' : 'label');
      wrapper.className = 'row-label';
      const labelElement = document.createElement('span');
      labelElement.textContent = key === 'required' ? 'Req' : label;

      if (key === 'required') {
        row[key] = row[key] || placeholder || 'Y';
        const toggleButton = document.createElement('button');
        toggleButton.className = `toggle-button ${row[key] === 'Y' ? 'active' : ''}`;
        toggleButton.type = 'button';
        toggleButton.textContent = row[key];
        toggleButton.setAttribute('aria-pressed', row[key] === 'Y' ? 'true' : 'false');
        toggleButton.addEventListener('click', () => {
          const nextValue = state.rows.headers[index][key] === 'Y' ? 'N' : 'Y';
          updateRow('headers', index, key, nextValue);
          toggleButton.textContent = nextValue;
          toggleButton.classList.toggle('active', nextValue === 'Y');
          toggleButton.setAttribute('aria-pressed', nextValue === 'Y' ? 'true' : 'false');
        });
        wrapper.append(labelElement, toggleButton);
        topRow.append(wrapper);
        return;
      }

      const inputElement = document.createElement('input');
      disableBrowserTextAssist(inputElement);
      inputElement.value = row[key] || '';
      inputElement.placeholder = placeholder || '';
      inputElement.addEventListener('input', () => updateRow('headers', index, key, inputElement.value));
      addEnterRowHandler(inputElement, 'headers', index);
      wrapper.append(labelElement, inputElement);
      topRow.append(wrapper);
    });

    const descriptionWrapper = document.createElement('label');
    descriptionWrapper.className = 'row-label header-description';
    const descriptionLabel = document.createElement('span');
    descriptionLabel.textContent = '설명';
    const descriptionInput = document.createElement('input');
    disableBrowserTextAssist(descriptionInput);
    descriptionInput.value = row.description || '';
    descriptionInput.placeholder = definition.fields.find(([key]) => key === 'description')?.[2] || '';
    descriptionInput.addEventListener('input', () => updateRow('headers', index, 'description', descriptionInput.value));
    addEnterRowHandler(descriptionInput, 'headers', index);
    descriptionWrapper.append(descriptionLabel, descriptionInput);

    card.append(removeButton, topRow, descriptionWrapper);
    container.append(card);
  });
};

function renderFieldTableRows(type, definition, container) {
  const rows = getMutableRows(type);
  if (rows.length === 0) return;
  const canDrag = type === 'pathParams';

  const tableElement = document.createElement('div');
  tableElement.className = 'field-table';

  const headerElement = document.createElement('div');
  headerElement.className = `field-table-head ${definition.className || ''}`.trim();
  if (canDrag) {
    const dragHeaderCell = document.createElement('span');
    dragHeaderCell.setAttribute('aria-hidden', 'true');
    headerElement.append(dragHeaderCell);
  }
  definition.fields.forEach(([, label]) => {
    const headerCell = document.createElement('span');
    headerCell.textContent = label;
    headerElement.append(headerCell);
  });
  const actionHeaderCell = document.createElement('span');
  actionHeaderCell.setAttribute('aria-hidden', 'true');
  headerElement.append(actionHeaderCell);
  tableElement.append(headerElement);

  rows.forEach((row, index) => {
    const rowElement = document.createElement('div');
    rowElement.className = `row ${definition.className || ''} ${canDrag ? 'draggable-row' : ''}`.trim();
    if (canDrag) {
      rowElement.dataset.index = String(index);
      rowElement.addEventListener('dragover', (event) => {
        event.preventDefault();
        const position = getDropPosition(event, rowElement);
        clearDragIndicators(tableElement);
        rowElement.classList.add(position === 'before' ? 'drag-over-before' : 'drag-over-after');
      });
      rowElement.addEventListener('dragleave', () => {
        rowElement.classList.remove('drag-over-before', 'drag-over-after');
      });
      rowElement.addEventListener('drop', (event) => {
        event.preventDefault();
        const position = getDropPosition(event, rowElement);
        rowElement.classList.remove('drag-over-before', 'drag-over-after');
        const fromIndex = Number.parseInt(event.dataTransfer.getData('text/plain'), 10);
        moveRow(type, fromIndex, index, position);
      });

      const dragHandle = document.createElement('button');
      dragHandle.className = 'drag-handle';
      dragHandle.type = 'button';
      dragHandle.draggable = true;
      dragHandle.textContent = '::';
      dragHandle.setAttribute('aria-label', '행 순서 변경');
      dragHandle.addEventListener('dragstart', (event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
        rowElement.classList.add('dragging');
      });
      dragHandle.addEventListener('dragend', () => {
        rowElement.classList.remove('dragging');
        clearDragIndicators(tableElement);
      });
      rowElement.append(dragHandle);
    }

    definition.fields.forEach(([key, label, placeholder]) => {
      if (['required', 'nullable', 'beforeAction'].includes(key)) {
        row[key] = row[key] || placeholder || 'N';
        const toggleButton = document.createElement('button');
        toggleButton.className = `toggle-button ${row[key] === 'Y' ? 'active' : ''}`;
        toggleButton.type = 'button';
        toggleButton.tabIndex = 0;
        toggleButton.textContent = row[key];
        toggleButton.setAttribute('aria-label', label);
        toggleButton.setAttribute('aria-pressed', row[key] === 'Y' ? 'true' : 'false');
        toggleButton.addEventListener('click', () => {
          const nextValue = getMutableRows(type)[index][key] === 'Y' ? 'N' : 'Y';
          updateRow(type, index, key, nextValue);
          toggleButton.textContent = nextValue;
          toggleButton.classList.toggle('active', nextValue === 'Y');
          toggleButton.setAttribute('aria-pressed', nextValue === 'Y' ? 'true' : 'false');
        });
        rowElement.append(toggleButton);
        return;
      }

      const inputElement = document.createElement('input');
      disableBrowserTextAssist(inputElement);
      inputElement.value = row[key] || '';
      inputElement.placeholder = placeholder || '';
      inputElement.setAttribute('aria-label', label);
      inputElement.addEventListener('input', (event) => {
        if (type === 'actionPathParams') {
          event.stopPropagation();
        }
        updateRow(type, index, key, inputElement.value);
      });
      if (type !== 'actionPathParams') {
        addEnterRowHandler(inputElement, type, index);
      }
      rowElement.append(inputElement);
    });

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', '행 삭제');
    removeButton.addEventListener('click', () => removeRow(type, index));
    rowElement.append(removeButton);
    tableElement.append(rowElement);
  });

  container.append(tableElement);
}

const renderRows = (type) => {
  const definition = rowDefinitions[type];
  const container = document.querySelector(`#${definition.id}`);
  container.replaceChildren();

  if (['headers', 'pathParams', 'actionPathParams', 'queryParams', 'bodyFields', 'responseFields', 'errors'].includes(type)) {
    renderFieldTableRows(type, definition, container);
    return;
  }

  state.rows[type].forEach((row, index) => {
    const rowElement = document.createElement('div');
    rowElement.className = `row ${definition.className || ''}`.trim();

    definition.fields.forEach(([key, label, placeholder]) => {
      const wrapper = document.createElement(['required', 'nullable', 'beforeAction'].includes(key) ? 'div' : 'label');
      wrapper.className = 'row-label';
      const labelElement = document.createElement('span');
      labelElement.textContent = label;

      if (['required', 'nullable', 'beforeAction'].includes(key)) {
        row[key] = row[key] || placeholder || 'N';
        const toggleButton = document.createElement('button');
        toggleButton.className = `toggle-button ${row[key] === 'Y' ? 'active' : ''}`;
        toggleButton.type = 'button';
        toggleButton.tabIndex = 0;
        toggleButton.textContent = row[key];
        toggleButton.setAttribute('aria-pressed', row[key] === 'Y' ? 'true' : 'false');
        toggleButton.addEventListener('click', () => {
          const nextValue = state.rows[type][index][key] === 'Y' ? 'N' : 'Y';
          updateRow(type, index, key, nextValue);
          toggleButton.textContent = nextValue;
          toggleButton.classList.toggle('active', nextValue === 'Y');
          toggleButton.setAttribute('aria-pressed', nextValue === 'Y' ? 'true' : 'false');
        });
        wrapper.append(labelElement, toggleButton);
        rowElement.append(wrapper);
        return;
      }

      const inputElement = document.createElement('input');
      disableBrowserTextAssist(inputElement);
      inputElement.value = row[key] || '';
      inputElement.placeholder = placeholder || '';
      inputElement.addEventListener('input', () => updateRow(type, index, key, inputElement.value));
      addEnterRowHandler(inputElement, type, index);
      wrapper.append(labelElement, inputElement);
      rowElement.append(wrapper);
    });

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', '행 삭제');
    removeButton.addEventListener('click', () => removeRow(type, index));
    rowElement.append(removeButton);
    container.append(rowElement);
  });
};

const markActiveTreeFile = () => {
  fileTree?.querySelectorAll('.file-tree-file').forEach((button) => {
    button.classList.toggle('active', button.dataset.path === state.activeTreeFilePath);
  });
};

const createFileTreeNode = (node) => {
  if (node.type === 'directory') {
    const details = document.createElement('details');
    details.className = 'file-tree-folder';
    details.open = true;

    const summary = document.createElement('summary');
    summary.textContent = node.name;
    details.append(summary);

    const children = document.createElement('div');
    children.className = 'file-tree-children';
    (node.children || []).forEach((childNode) => {
      children.append(createFileTreeNode(childNode));
    });
    details.append(children);
    return details;
  }

  const fileButton = document.createElement('button');
  fileButton.className = 'file-tree-file';
  fileButton.type = 'button';
  fileButton.textContent = node.label || node.name;
  fileButton.title = node.name;
  fileButton.dataset.path = node.path;
  fileButton.addEventListener('click', () => openTreeMarkdownFile(node.path, node.name));
  return fileButton;
};

const renderFileTree = (tree = []) => {
  if (!fileTree) return;
  fileTree.replaceChildren();

  if (tree.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'file-tree-empty';
    empty.textContent = '표시할 파일이 없습니다.';
    fileTree.append(empty);
    return;
  }

  const content = document.createElement('div');
  content.className = 'file-tree-content';
  tree.forEach((node) => {
    content.append(createFileTreeNode(node));
  });
  fileTree.append(content);
  markActiveTreeFile();
};

const compareBrowserGroupName = (a, b) => {
  if (a === '/' && b !== '/') return -1;
  if (a !== '/' && b === '/') return 1;
  if (a === 'UNKNOWN' && b !== 'UNKNOWN') return 1;
  if (a !== 'UNKNOWN' && b === 'UNKNOWN') return -1;
  return a.localeCompare(b, 'ko');
};

const getGroupedTreeSortName = (node) => (node.type === 'file' ? node.label || node.name : node.name);
const isGroupedTreeRootFile = (node) => node.type === 'file' && getGroupedTreeSortName(node) === '/';

const getSpecGroupingFromMarkdown = (markdown, fallbackName) => {
  try {
    const basicSection = getMarkdownSection(markdown, '기본 정보');
    const pathValue = getMarkdownTableValue(basicSection, 'Path');
    if (!pathValue || pathValue.includes('예:')) throw new Error('Invalid spec path');

    const segments = splitApiPath(pathValue);
    const swaggerTagSegments = splitApiPath(getMarkdownTableValue(basicSection, 'Swagger Tag'));
    const common = segments[0] || '/';
    const version = segments[1] || '/';
    const rawSwaggerTag = segments[2] || swaggerTagSegments[0] || '';
    const swaggerTag = isEmptySpecGroupValue(rawSwaggerTag) ? '' : rawSwaggerTag;
    const actionSegments = segments.slice(3);

    return {
      groups: [common, version, swaggerTag].filter(Boolean),
      label: actionSegments.length > 0 ? `/${actionSegments.join('/')}` : '/',
    };
  } catch {
    return {
      groups: ['양식 외', '미정', '미정'],
      label: fallbackName,
    };
  }
};

const toGroupedFileTree = (files) => {
  const rootGroups = new Map();

  files.forEach((file) => {
    let currentGroups = rootGroups;
    file.groups.forEach((groupName) => {
      if (!currentGroups.has(groupName)) {
        currentGroups.set(groupName, {
          type: 'directory',
          name: groupName,
          childrenMap: new Map(),
        });
      }
      currentGroups = currentGroups.get(groupName).childrenMap;
    });

    currentGroups.set(`__file__${file.path}`, {
      type: 'file',
      name: file.name,
      label: file.label,
      path: file.path,
    });
  });

  const serialize = (groups) =>
    [...groups.values()]
      .sort((a, b) => {
        if (isGroupedTreeRootFile(a) !== isGroupedTreeRootFile(b)) {
          return isGroupedTreeRootFile(a) ? -1 : 1;
        }
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        const sortResult = compareBrowserGroupName(getGroupedTreeSortName(a), getGroupedTreeSortName(b));
        return sortResult || a.name.localeCompare(b.name, 'ko');
      })
      .map((node) => {
        if (node.type === 'file') return node;
        return {
          type: 'directory',
          name: node.name,
          children: serialize(node.childrenMap),
        };
      });

  return serialize(rootGroups);
};

const browserFileExists = async (directoryHandle, fileName) => {
  try {
    await directoryHandle.getFileHandle(fileName, { create: false });
    return true;
  } catch {
    return false;
  }
};

const ensureBrowserWritePermission = async (handle) => {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
};

const writeBrowserFile = async (fileHandle, markdown) => {
  if (!(await ensureBrowserWritePermission(fileHandle))) {
    throw new Error('FILE_PERMISSION_DENIED');
  }
  const writable = await fileHandle.createWritable();
  await writable.write(markdown);
  await writable.close();
};

const collectBrowserMarkdownFiles = async (
  directoryHandle,
  options = {},
  relativeDir = '',
  depth = 0,
  counter = { count: 0 },
) => {
  const { rootName = directoryHandle.name, handles = new Map() } = options;
  if (depth > 8 || counter.count >= 1500) return [];

  const entries = [];
  for await (const [name, handle] of directoryHandle.entries()) {
    if (name.startsWith('.')) continue;
    entries.push([name, handle]);
  }

  entries.sort(([nameA, handleA], [nameB, handleB]) => {
    if (handleA.kind !== handleB.kind) return handleA.kind === 'directory' ? -1 : 1;
    return nameA.localeCompare(nameB, 'ko');
  });

  const files = [];
  for (const [name, handle] of entries) {
    if (counter.count >= 1500) break;
    const entryRelativePath = relativeDir ? `${relativeDir}/${name}` : name;

    if (handle.kind === 'directory') {
      files.push(...(await collectBrowserMarkdownFiles(
        handle,
        { rootName, handles },
        entryRelativePath,
        depth + 1,
        counter,
      )));
      continue;
    }

    if (handle.kind !== 'file' || !isMarkdownFileName(name)) continue;

    counter.count += 1;
    const file = await handle.getFile();
    const markdown = await file.text();
    const directoryLabel = relativeDir
      ? localFileLabel(rootName, relativeDir)
      : localFileLabel(rootName);
    handles.set(entryRelativePath, {
      fileHandle: handle,
      directoryHandle,
      saveDir: directoryLabel,
      displayPath: localFileLabel(rootName, entryRelativePath),
    });
    files.push({
      type: 'file',
      name,
      path: entryRelativePath,
      markdown,
      ...getSpecGroupingFromMarkdown(markdown, name),
    });
  }

  return files;
};

const readBrowserFileTree = async (directoryHandle) => {
  const handles = new Map();
  const files = await collectBrowserMarkdownFiles(directoryHandle, { rootName: directoryHandle.name, handles });
  return {
    tree: toGroupedFileTree(files),
    handles,
  };
};

const getBrowserSpecSummary = (markdown, fileName, relativePath) => {
  const title = decodeMarkdownCell(markdown.match(/^#\s+(.+)$/m)?.[1] ?? '');
  const basicSection = getMarkdownSection(markdown, '기본 정보');
  const authSection = getMarkdownSection(markdown, '인증 / 권한');
  const bodySectionText = getMarkdownSection(markdown, 'Body');
  const successSection = getMarkdownSection(markdown, 'Success Response');
  const successResponses = parseViewerSuccessResponsesFromMarkdown(successSection);
  const primarySuccessResponse = successResponses[0] || { status: '200', json: '', fields: [] };
  const pathValue = getMarkdownTableValue(basicSection, 'Path');

  if (!pathValue || pathValue.includes('예:')) {
    throw new Error('Invalid spec path');
  }

  const segments = splitApiPath(pathValue);
  const rawSwaggerTag = segments[2] || getMarkdownTableValue(basicSection, 'Swagger Tag');
  const swaggerTag = isEmptySpecGroupValue(rawSwaggerTag) ? '/' : rawSwaggerTag;
  const method = getMarkdownTableValue(basicSection, 'Method').toUpperCase();
  const normalizedMethod = ['GET', 'POST'].includes(method) ? method : 'POST';

  return {
    fileName,
    relativePath,
    name: getMarkdownTableValue(basicSection, 'API 이름') || title || fileName,
    method: normalizedMethod,
    path: pathValue,
    commonPath: segments[0] || '/',
    versionPath: segments[1] || '/',
    clients: getMarkdownTableValue(basicSection, '사용처') || '미정',
    purpose: getMarkdownTableValue(basicSection, '목적') || '미정',
    swaggerTag,
    authRequired: getMarkdownTableValue(authSection, '인증 필요 여부') || '미정',
    authScheme: getMarkdownTableValue(authSection, '인증 방식') || '미정',
    roles: getMarkdownTableValue(authSection, '접근 가능 Role') || '미정',
    permissionRules: getMarkdownTableValue(authSection, '권한 규칙') || '미정',
    successStatus: primarySuccessResponse.status,
    successResponses,
    headers: parseRowsByHeaders(getMarkdownSection(markdown, 'Headers'), [
      ['key', 'Key'],
      ['value', 'Value 예시'],
      ['required', '필수'],
      ['description', '설명'],
    ]),
    pathParams: parseRowsByHeaders(getMarkdownSection(markdown, 'Path Params'), [
      ['key', 'Key'],
      ['type', 'Type'],
      ['required', '필수'],
      ['beforeAction', '실동작 앞'],
      ['example', '예시'],
      ['description', '설명'],
    ]),
    queryParams: parseRowsByHeaders(getMarkdownSection(markdown, 'Query Params'), [
      ['key', 'Key'],
      ['type', 'Type'],
      ['required', '필수'],
      ['defaultValue', '기본값'],
      ['example', '예시'],
      ['description', '설명'],
    ]),
    bodyJson: extractJsonBlock(bodySectionText),
    bodyFields: parseRowsByHeaders(bodySectionText, [
      ['parentKey', 'UpKey'],
      ['key', 'Key'],
      ['type', 'Type'],
      ['required', '필수'],
      ['example', '예시'],
      ['description', '설명'],
    ]),
    successJson: primarySuccessResponse.json,
    responseFields: primarySuccessResponse.fields,
    errors: parseRowsByHeaders(getMarkdownSection(markdown, 'Error Response'), [
      ['status', 'Status'],
      ['code', 'Code'],
      ['message', 'Message'],
      ['condition', '발생 상황'],
    ]),
  };
};

const readBrowserSpecSummaries = async () => {
  const rootHandle = state.browserDirectoryHandle;
  if (!rootHandle) {
    throw new Error('NO_BROWSER_FOLDER');
  }

  const files = await collectBrowserMarkdownFiles(rootHandle, { rootName: rootHandle.name, handles: new Map() });
  const specs = [];
  const invalidFiles = [];

  files.forEach((file) => {
    try {
      specs.push(getBrowserSpecSummary(file.markdown, file.name, file.path));
    } catch {
      invalidFiles.push(file.path);
    }
  });

  specs.sort((a, b) => a.path.localeCompare(b.path, 'ko') || a.method.localeCompare(b.method, 'ko'));
  return {
    ok: true,
    rootName: rootHandle.name,
    rootPath: localFileLabel(rootHandle.name),
    specs,
    invalidFiles,
  };
};

const refreshBrowserFileTree = async () => {
  if (!state.browserDirectoryHandle) return;
  const { tree, handles } = await readBrowserFileTree(state.browserDirectoryHandle);
  state.fileTreeHandles = handles;
  renderFileTree(tree);
};

const isBlankViewerValue = (value) => {
  const text = String(value ?? '').trim();
  return !text || ['미정', '없음', '해당 없음'].includes(text);
};

const viewerValue = (value, fallback = '-') => (isBlankViewerValue(value) ? fallback : String(value).trim());

const compareViewerGroupName = (a, b) => {
  if (a === '/' && b !== '/') return -1;
  if (a !== '/' && b === '/') return 1;
  if (a === 'UNKNOWN' && b !== 'UNKNOWN') return 1;
  if (a !== 'UNKNOWN' && b === 'UNKNOWN') return -1;
  return a.localeCompare(b, 'ko');
};

const formatPathGroupValue = (value) => {
  const text = viewerValue(value, '/');
  return text === '/' ? '/' : `/${text.replace(/^\/+/, '')}`;
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
};

const appendViewerMeta = (container, label, value) => {
  const item = document.createElement('div');
  item.className = 'spec-meta-item';
  item.append(createTextElement('span', '', label), createTextElement('strong', '', viewerValue(value)));
  container.append(item);
};

const createSpecDetailTable = (title, columns, rows = [], options = {}) => {
  const { limit = 8, rowFilter } = typeof options === 'number' ? { limit: options } : options;
  const visibleRows = rows.filter(rowFilter || ((row) => columns.some(([key]) => !isBlankViewerValue(row[key]))));
  if (visibleRows.length === 0) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'spec-detail-table';
  wrapper.append(createTextElement('h4', '', title));

  const scroll = document.createElement('div');
  scroll.className = 'spec-detail-scroll';

  const tableElement = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  columns.forEach(([, label]) => {
    const cell = document.createElement('th');
    cell.textContent = label;
    headRow.append(cell);
  });
  thead.append(headRow);
  tableElement.append(thead);

  const tbody = document.createElement('tbody');
  visibleRows.slice(0, limit).forEach((row) => {
    const bodyRow = document.createElement('tr');
    columns.forEach(([key]) => {
      const cell = document.createElement('td');
      cell.textContent = viewerValue(row[key]);
      bodyRow.append(cell);
    });
    tbody.append(bodyRow);
  });
  tableElement.append(tbody);
  scroll.append(tableElement);
  wrapper.append(scroll);

  if (visibleRows.length > limit) {
    wrapper.append(createTextElement('p', 'spec-detail-more', `외 ${visibleRows.length - limit}개 더 있음`));
  }

  return wrapper;
};

const createSpecJsonPreview = (title, value) => {
  if (isBlankViewerValue(value)) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'spec-json-preview';
  wrapper.append(createTextElement('h4', '', title), createTextElement('pre', '', value));
  return wrapper;
};

const hasViewerKey = (row) => !isBlankViewerValue(row?.key);

const countViewerKeyRows = (rows = []) => rows.filter(hasViewerKey).length;

const countViewerErrorRows = (rows = []) =>
  rows.filter((row) => ['status', 'code', 'message', 'condition'].some((key) => !isBlankViewerValue(row[key]))).length;

const countViewerSuccessResponses = (responses = []) =>
  responses.filter((response) =>
    !isBlankViewerValue(response.status) ||
    !isBlankViewerValue(response.json) ||
    countViewerKeyRows(response.fields) > 0,
  ).length;

const createSpecChip = (label, value) => {
  const chip = document.createElement('div');
  chip.className = 'spec-chip';
  chip.append(createTextElement('span', '', label), createTextElement('strong', '', viewerValue(value)));
  return chip;
};

const createSpecCounter = (label, count) => {
  const counter = document.createElement('div');
  counter.className = 'spec-counter';
  counter.append(createTextElement('strong', '', String(count)), createTextElement('span', '', label));
  return counter;
};

const getSpecSuccessResponses = (spec) => {
  if (Array.isArray(spec.successResponses) && spec.successResponses.length > 0) {
    return spec.successResponses.map((response) => ({
      status: response.status || '200',
      json: response.json || '',
      fields: Array.isArray(response.fields) ? response.fields : [],
    }));
  }

  return [{
    status: spec.successStatus || '200',
    json: spec.successJson || '',
    fields: Array.isArray(spec.responseFields) ? spec.responseFields : [],
  }];
};

const createSpecDetailSection = (title, elements = []) => {
  const visibleElements = elements.filter(Boolean);
  if (visibleElements.length === 0) return null;

  const section = document.createElement('section');
  section.className = `spec-detail-section spec-detail-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  section.append(createTextElement('h4', 'spec-detail-section-title', title));

  const content = document.createElement('div');
  content.className = 'spec-section-grid';
  visibleElements.forEach((element) => content.append(element));
  section.append(content);
  return section;
};

const createSpecSuccessResponseDetail = (response) => {
  const status = response.status || '200';
  const fieldCount = countViewerKeyRows(response.fields);
  const hasJson = !isBlankViewerValue(response.json);
  const fieldTable = createSpecDetailTable('Fields', [
    ['parentKey', 'UpKey'],
    ['key', 'Key'],
    ['type', 'Type'],
    ['nullable', 'Nullable'],
    ['description', '설명'],
  ], response.fields, { rowFilter: hasViewerKey });
  const jsonPreview = createSpecJsonPreview('JSON', response.json);

  const wrapper = document.createElement('div');
  wrapper.className = 'spec-success-response';

  const head = document.createElement('div');
  head.className = 'spec-success-response-head';
  head.append(
    createTextElement('span', 'spec-success-status', `Status ${status}`),
    createTextElement('span', 'spec-success-meta', `필드 ${fieldCount}개${hasJson ? ' / JSON' : ''}`),
  );
  wrapper.append(head);

  const body = document.createElement('div');
  body.className = 'spec-success-response-body';
  [fieldTable, jsonPreview].filter(Boolean).forEach((element) => body.append(element));
  if (body.children.length > 0) wrapper.append(body);

  return wrapper;
};

const createSpecCard = (spec) => {
  const card = document.createElement('article');
  const method = String(spec.method || 'POST').toUpperCase();
  const successResponses = getSpecSuccessResponses(spec);
  card.className = `spec-endpoint-card method-card-${method.toLowerCase()}`;

  const top = document.createElement('div');
  top.className = 'spec-card-top';

  const route = document.createElement('div');
  route.className = 'spec-route';
  const methodBadge = createTextElement('span', `method-badge method-${method.toLowerCase()}`, method);
  const path = createTextElement('code', 'spec-path', viewerValue(spec.path));
  route.append(methodBadge, path);

  top.append(route);

  const titleBlock = document.createElement('div');
  titleBlock.className = 'spec-title-block';
  const title = createTextElement('h3', '', viewerValue(spec.name, spec.fileName || '이름 없음'));
  const purpose = createTextElement('p', 'spec-purpose', viewerValue(spec.purpose));
  titleBlock.append(title, purpose);

  const authText = viewerValue(spec.authRequired) === '불필요'
    ? '불필요'
    : `${viewerValue(spec.authRequired)} / ${viewerValue(spec.authScheme)}`;

  const chips = document.createElement('div');
  chips.className = 'spec-chip-row';
  chips.append(
    createSpecChip('파일', spec.fileName),
    createSpecChip('사용처', spec.clients),
    createSpecChip('인증', authText),
    createSpecChip('Role', spec.roles),
  );

  const counters = document.createElement('div');
  counters.className = 'spec-counter-row';
  counters.append(
    createSpecCounter('Headers', countViewerKeyRows(spec.headers)),
    createSpecCounter('Path', countViewerKeyRows(spec.pathParams)),
    createSpecCounter('Query', countViewerKeyRows(spec.queryParams)),
    createSpecCounter('Body', countViewerKeyRows(spec.bodyFields)),
    createSpecCounter('Response', countViewerSuccessResponses(successResponses)),
    createSpecCounter('Errors', countViewerErrorRows(spec.errors)),
  );

  const detailStack = document.createElement('div');
  detailStack.className = 'spec-detail-stack';
  [
    createSpecDetailSection('Request', [
      createSpecDetailTable('Headers', [
        ['key', 'Key'],
        ['value', 'Value'],
        ['required', 'Req'],
        ['description', '설명'],
      ], spec.headers, { rowFilter: hasViewerKey }),
      createSpecDetailTable('Path Params', [
        ['key', 'Key'],
        ['type', 'Type'],
        ['required', 'Req'],
        ['example', '예시'],
        ['description', '설명'],
      ], spec.pathParams, { rowFilter: hasViewerKey }),
      createSpecDetailTable('Query Params', [
        ['key', 'Key'],
        ['type', 'Type'],
        ['required', 'Req'],
        ['defaultValue', '기본값'],
        ['example', '예시'],
      ], spec.queryParams, { rowFilter: hasViewerKey }),
      createSpecDetailTable('Body Fields', [
        ['parentKey', 'UpKey'],
        ['key', 'Key'],
        ['type', 'Type'],
        ['required', 'Req'],
        ['description', '설명'],
      ], spec.bodyFields, { rowFilter: hasViewerKey }),
      createSpecJsonPreview('Body JSON', spec.bodyJson),
    ]),
    createSpecDetailSection('Response', successResponses.map(createSpecSuccessResponseDetail)),
    createSpecDetailSection('Error', [
      createSpecDetailTable('Error Response', [
        ['status', 'Status'],
        ['code', 'Code'],
        ['message', 'Message'],
        ['condition', '발생 상황'],
      ], spec.errors),
    ]),
  ].filter(Boolean).forEach((element) => detailStack.append(element));

  card.append(top, titleBlock, chips, counters);
  if (detailStack.children.length > 0) {
    const details = document.createElement('details');
    details.className = 'spec-detail-panel';
    details.open = false;
    const detailsSummary = document.createElement('summary');
    detailsSummary.append(
      createTextElement('span', 'spec-detail-summary-title', '상세 명세'),
      createTextElement('span', 'spec-detail-summary-meta', 'Request / Response / Error'),
    );
    details.append(detailsSummary, detailStack);
    card.append(details);
  }
  return card;
};

const renderViewerTabs = (container, items, selectedItem, onSelect) => {
  if (!container) return;
  container.replaceChildren();

  const indicator = document.createElement('span');
  indicator.className = 'viewer-tab-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  container.append(indicator);

  const selectedIndex = Math.max(0, items.indexOf(selectedItem));
  container.style.setProperty('--tab-count', String(Math.max(items.length, 1)));
  container.style.setProperty('--tab-index', String(selectedIndex));

  items.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'viewer-tab';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.textContent = formatPathGroupValue(item);
    button.setAttribute('aria-selected', item === selectedItem ? 'true' : 'false');
    button.addEventListener('click', () => {
      if (item === selectedItem) return;
      onSelect(item);
    });
    container.append(button);
  });
};

const renderSpecViewer = (payload = {}) => {
  if (!specViewerList) return;

  const specs = Array.isArray(payload.specs) ? payload.specs : [];
  const invalidFiles = Array.isArray(payload.invalidFiles) ? payload.invalidFiles : [];
  if (specViewerRoot) {
    specViewerRoot.textContent = payload.rootPath || payload.rootName || '현재 파일 폴더';
    specViewerRoot.title = payload.rootPath || '';
  }
  if (specViewerCount) {
    specViewerCount.textContent = `${specs.length} APIs`;
  }
  if (specViewerNote) {
    specViewerNote.hidden = invalidFiles.length === 0;
    specViewerNote.textContent = invalidFiles.length > 0
      ? `작성기 양식과 맞지 않는 파일 ${invalidFiles.length}개는 뷰어에서 제외했습니다.`
      : '';
  }

  specViewerList.replaceChildren();
  if (specViewerEmpty) specViewerEmpty.hidden = specs.length > 0;
  if (specViewerFilters) specViewerFilters.hidden = specs.length === 0;
  if (specs.length === 0) return;

  const groupedSpecs = specs.reduce((commonGroups, spec) => {
    const common = viewerValue(spec.commonPath, '/');
    const version = viewerValue(spec.versionPath, '/');
    const tag = viewerValue(spec.swaggerTag, '/');
    if (!commonGroups.has(common)) commonGroups.set(common, new Map());
    const versionGroups = commonGroups.get(common);
    if (!versionGroups.has(version)) versionGroups.set(version, new Map());
    const tagGroups = versionGroups.get(version);
    if (!tagGroups.has(tag)) tagGroups.set(tag, []);
    tagGroups.get(tag).push(spec);
    return commonGroups;
  }, new Map());

  const commonNames = [...groupedSpecs.keys()].sort(compareViewerGroupName);
  if (!commonNames.includes(state.viewerCommon)) {
    state.viewerCommon = commonNames[0] || '';
  }

  const selectedVersionGroups = groupedSpecs.get(state.viewerCommon) || new Map();
  const versionNames = [...selectedVersionGroups.keys()].sort(compareViewerGroupName);
  if (!versionNames.includes(state.viewerVersion)) {
    state.viewerVersion = versionNames[0] || '';
  }

  renderViewerTabs(specCommonTabs, commonNames, state.viewerCommon, (nextCommon) => {
    state.viewerCommon = nextCommon;
    state.viewerVersion = '';
    renderSpecViewer(payload);
  });
  renderViewerTabs(specVersionTabs, versionNames, state.viewerVersion, (nextVersion) => {
    state.viewerVersion = nextVersion;
    renderSpecViewer(payload);
  });

  const selectedTagGroups = selectedVersionGroups.get(state.viewerVersion) || new Map();
  [...selectedTagGroups.entries()]
    .sort(([tagA], [tagB]) => compareViewerGroupName(tagA, tagB))
    .forEach(([tag, tagSpecs]) => {
      const tagGroup = document.createElement('section');
      tagGroup.className = 'spec-tag-group';
      const heading = document.createElement('button');
      heading.className = 'spec-tag-heading';
      heading.type = 'button';
      heading.setAttribute('aria-expanded', 'true');

      const tagContent = document.createElement('div');
      tagContent.className = 'spec-tag-content';
      heading.append(createTextElement('h3', '', tag), createTextElement('span', '', `${tagSpecs.length}개`));
      tagSpecs.forEach((spec) => {
        tagContent.append(createSpecCard(spec));
      });
      heading.addEventListener('click', () => {
        const isCollapsed = tagGroup.classList.toggle('collapsed');
        heading.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      });
      tagGroup.append(heading, tagContent);
      specViewerList.append(tagGroup);
    });
};

const openFolderViewer = async () => {
  if (state.viewerMode) {
    setViewTransitionSkeleton(true, 'editor');
    try {
      await waitForViewTransitionPreview();
      setSpecViewerMode(false);
      setStatus('작성기 보기');
    } finally {
      setViewTransitionSkeleton(false);
    }
    return;
  }

  if (!state.fileTreeOpened) {
    showWarningToast('뷰어를 열 수 없음', '먼저 상단 열기 버튼으로 명세서 폴더를 열어주세요.');
    setStatus('뷰어 열기 실패');
    return;
  }

  setViewTransitionSkeleton(true, 'viewer');
  try {
    const result = state.browserDirectoryHandle
      ? await readBrowserSpecSummaries()
      : await (async () => {
          const response = await fetch('/api/spec-viewer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            const errorResult = await response.json().catch(() => ({}));
            throw new Error(errorResult.message || '현재 파일 폴더의 명세서를 읽지 못했습니다.');
          }
          return response.json();
        })();
    state.viewerCommon = '';
    state.viewerVersion = '';
    renderSpecViewer(result);
    setSpecViewerMode(true);
    setStatus(`${result.specs?.length || 0}개 명세서 표시`);
  } catch (error) {
    showErrorToast(
      '뷰어를 열 수 없음',
      error instanceof Error ? error.message : '현재 파일 폴더의 명세서를 읽지 못했습니다.',
    );
    setStatus('뷰어 열기 실패');
  } finally {
    await waitForViewTransitionPreview();
    setViewTransitionSkeleton(false);
  }
};

const focusFileLocation = () => {
  window.requestAnimationFrame(() => {
    fileLocationPreview?.focus();
  });
};

const setCurrentFile = (file) => {
  state.currentFile = file;
  if (isBrowserFileSystemFile(file)) {
    if (file.directoryHandle) {
      state.browserSaveDirectoryHandle = file.directoryHandle;
    }
    if (file.saveDir) {
      state.saveDir = file.saveDir;
    }
  } else {
    const currentFileDir = normalizeSaveDir(file.saveDir || getDirectoryPath(file.displayPath || file.path));
    if (currentFileDir) {
      state.saveDir = currentFileDir;
    }
  }
  state.activeTreeFilePath = '';
  markActiveTreeFile();
  refresh();
  focusFileLocation();
};

const clearCurrentFile = () => {
  state.currentFile = null;
  state.activeTreeFilePath = '';
  markActiveTreeFile();
};

const loadDraft = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);
    const formData = draft.formData || {};
    state.saveDir = '';
    if (formData.path && !formData.pathBase && !formData.pathVersion && !formData.pathSwaggerTag && !formData.pathAction) {
      const pathParts = splitPathPart(formData.path);
      formData.pathBase = pathParts[0] ? `/${pathParts[0]}` : '/api';
      formData.pathVersion = pathParts[1] ? `/${pathParts[1]}` : '/v1';
      formData.pathSwaggerTag = pathParts[2] ? `/${pathParts[2]}` : formData.swaggerTag ? `/${formData.swaggerTag}` : '';
      formData.pathAction = pathParts.length > 3 ? `/${pathParts.slice(3).join('/')}` : '';
    }
    if (!formData.authRequired) {
      formData.authRequired = '필요';
    }
    if (formData.method && !['GET', 'POST'].includes(formData.method)) {
      formData.method = 'POST';
    }
    if (formData.authScheme === 'Bearer JWT') {
      formData.authScheme = 'JWT Bearer';
    }
    if (!formData.authScheme) {
      formData.authScheme = 'JWT Bearer';
    }

    Object.entries(formData).forEach(([name, value]) => {
      const elements = form.elements[name];
      if (!elements) return;

      if (Array.isArray(value)) {
        [...form.querySelectorAll(`input[name="${name}"]`)].forEach((item) => {
          item.checked = value.includes(item.value);
        });
        return;
      }

      elements.value = value;
    });

    if (!form.elements.method.value) {
      form.elements.method.value = 'POST';
    }

    state.rows = {
      ...structuredClone(defaultRows),
      ...(draft.rows || {}),
    };
    state.successResponses = normalizeSuccessResponses(
      draft.successResponses,
      formData.successStatus || '200',
      state.rows.responseFields || [],
    );
    state.activeSuccessResponseIndex = Number.isInteger(draft.activeSuccessResponseIndex)
      ? Math.min(Math.max(0, draft.activeSuccessResponseIndex), state.successResponses.length - 1)
      : 0;
    state.rows.responseFields = [];
    setFormValue('successStatus', getActiveSuccessResponse().status || '200');
    if (
      state.rows.headers.length === 1 &&
      state.rows.headers[0].key === 'Authorization' &&
      state.rows.headers[0].value === 'Bearer {accessToken}' &&
      state.rows.headers[0].description === '로그인 토큰'
    ) {
      state.rows.headers = [{ required: 'Y' }];
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const saveMarkdown = async () => {
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
            ? localFileLabel(state.browserDirectoryHandle.name, nextPath)
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
        });
        if (state.browserDirectoryHandle) {
          await refreshBrowserFileTree();
          state.activeTreeFilePath = nextPath;
          markActiveTreeFile();
        }
        setStatus(`${nextDisplayPath} 저장됨`);
        showSaveSuccessToast('현재 파일에 덮어썼습니다.');
        return;
      } catch (error) {
        const message = error instanceof Error && error.message === 'Target file already exists.'
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
      });
      if (result.tree) {
        renderFileTree(result.tree);
      }
      setStatus(`${result.absolutePath || result.path} 저장됨`);
      showSaveSuccessToast('현재 파일에 덮어썼습니다.');
      return;
    } catch (error) {
      const message = error instanceof Error && error.message === 'Target file already exists.'
        ? '변경된 파일명과 같은 파일이 이미 있습니다.'
        : '현재 열려 있는 파일을 저장하지 못했습니다.';
      showSaveFailureToast(message);
      setStatus('저장 실패');
      return;
    }
  }

  await saveMarkdownAsNew();
};

const saveMarkdownAsNew = async () => {
  const markdown = generateMarkdown();
  const fileName = buildFileNameFromPath();

  if (!hasSaveDir()) {
    showWarningToast('파일 위치 필요', '먼저 상단 열기 버튼으로 명세서 폴더를 열어주세요.');
    setStatus('파일 위치 미정');
    openButton?.focus();
    return;
  }

  try {
    if (state.browserSaveDirectoryHandle) {
      if (await browserFileExists(state.browserSaveDirectoryHandle, fileName)) {
        throw new Error('Target file already exists.');
      }
      const fileHandle = await state.browserSaveDirectoryHandle.getFileHandle(fileName, { create: true });
      await writeBrowserFile(fileHandle, markdown);
      const rootName = state.browserDirectoryHandle?.name || '';
      const displayPath = rootName ? localFileLabel(rootName, fileName) : localFileLabel(fileName);
      setCurrentFile({
        origin: state.browserDirectoryHandle ? 'browser-tree' : 'browser-file',
        path: fileName,
        displayPath,
        fileName,
        saveDir: state.saveDir,
        fileHandle,
        directoryHandle: state.browserSaveDirectoryHandle,
      });
      if (state.browserDirectoryHandle) {
        await refreshBrowserFileTree();
        state.activeTreeFilePath = fileName;
        markActiveTreeFile();
      }
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
      });
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
    });
    if (result.tree) {
      renderFileTree(result.tree);
    }
    setStatus(`${result.absolutePath || result.path} 새 파일 저장됨`);
    showSaveSuccessToast('새 파일로 저장했습니다.');
  } catch (error) {
    const message = error instanceof Error && error.message === 'Target file already exists.'
      ? '같은 이름의 파일이 이미 있습니다.'
      : '새 파일로 저장하지 못했습니다.';
    showSaveFailureToast(message);
    setStatus('저장 실패');
  }
};

const copyMarkdown = async () => {
  await navigator.clipboard.writeText(generateMarkdown());
  setStatus('복사됨');
};

const showMarkdownLoadError = (fileName = '선택한 파일') => {
  clearSuccessStatusError();
  showErrorToast('파일을 열 수 없음', `${fileName}은 API 명세서 작성기 양식과 맞지 않는 Markdown 파일입니다.`);
  setStatus('불러오기 실패');
};

const loadMarkdownSpec = (markdown, fileName) => {
  clearSuccessStatusError();
  applyMarkdownSpec(markdown);
  setStatus(`${fileName} 불러옴`);
};

const applyOpenedFolder = (result, options = {}) => {
  const {
    clearFile = true,
    focusLocation = true,
    updateStatus = true,
  } = options;

  if (clearFile) clearCurrentFile();
  if (result.origin === 'browser') {
    state.browserDirectoryHandle = result.directoryHandle || null;
    state.browserSaveDirectoryHandle = result.directoryHandle || null;
    state.fileTreeHandles = result.fileHandles || new Map();
    state.saveDir = result.saveDir || result.rootPath || result.rootName || '';
  } else {
    state.browserDirectoryHandle = null;
    state.browserSaveDirectoryHandle = null;
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

const openFileTreeFolder = async () => {
  setSpecViewerMode(false);
  showPageLoading('파일 폴더 여는 중...');
  try {
    if (isBrowserFileSystemSupported()) {
      const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      if (!(await ensureBrowserWritePermission(directoryHandle))) {
        throw new Error('FILE_PERMISSION_DENIED');
      }
      const { tree, handles } = await readBrowserFileTree(directoryHandle);
      applyOpenedFolder({
        ok: true,
        origin: 'browser',
        rootName: directoryHandle.name,
        rootPath: localFileLabel(directoryHandle.name),
        saveDir: localFileLabel(directoryHandle.name),
        directoryHandle,
        fileHandles: handles,
        tree,
      });
      showToast('info', '폴더 열림', `${directoryHandle.name} 폴더를 열었습니다.`);
      return;
    }

    const response = await fetch('/api/choose-tree-root', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Directory selection failed');

    const result = await response.json();
    applyOpenedFolder(result);
  } catch {
    setStatus('파일 폴더 열기 취소됨');
  } finally {
    hidePageLoading();
  }
};

const openTreeMarkdownFile = async (path, fileName) => {
  setSpecViewerMode(false);
  showPageLoading('명세서 파일 여는 중...');
  try {
    const browserFile = state.fileTreeHandles.get(path);
    if (browserFile?.fileHandle) {
      const file = await browserFile.fileHandle.getFile();
      const markdown = await file.text();
      loadMarkdownSpec(markdown || '', file.name || fileName);
      setCurrentFile({
        origin: 'browser-tree',
        path,
        displayPath: browserFile.displayPath || localFileLabel(state.browserDirectoryHandle?.name, path),
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

const openMarkdownFile = async () => {
  const file = openFileInput?.files?.[0];
  if (!file) return;

  try {
    setSpecViewerMode(false);
    const markdown = await file.text();
    loadMarkdownSpec(markdown, file.name);
    clearCurrentFile();
    refresh();
    focusFileLocation();
  } catch {
    showMarkdownLoadError(file.name);
  } finally {
    openFileInput.value = '';
  }
};

const openMarkdownFromSaveDir = async () => {
  setSpecViewerMode(false);
  if (isBrowserFileSystemSupported()) {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: 'Markdown',
            accept: { 'text/markdown': ['.md', '.markdown'] },
          },
        ],
      });
      const file = await fileHandle.getFile();
      const markdown = await file.text();
      loadMarkdownSpec(markdown || '', file.name || '선택한 파일');
      setCurrentFile({
        origin: 'browser-file',
        path: file.name || '',
        displayPath: localFileLabel(file.name || '선택한 파일'),
        fileName: file.name || '선택한 파일',
        saveDir: state.saveDir || localFileLabel('선택한 파일'),
        fileHandle,
      });
      return;
    } catch {
      setStatus('파일 열기 취소됨');
      return;
    }
  }

  showPageLoading('파일 선택창 여는 중...');
  let result = null;
  try {
    const openResponse = await fetch('/api/choose-open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDir: state.saveDir || '' }),
    });
    if (!openResponse.ok) throw new Error('Open failed');

    result = await openResponse.json();
  } catch {
    openFileInput.click();
    return;
  } finally {
    hidePageLoading();
  }

  try {
    loadMarkdownSpec(result.markdown || '', result.fileName || '선택한 파일');
    setCurrentFile({
      origin: result.origin || 'root',
      path: result.path || '',
      displayPath: result.absolutePath || result.path || result.fileName || '선택한 파일',
      fileName: result.fileName || '선택한 파일',
      saveDir: result.saveDir,
    });
  } catch {
    showMarkdownLoadError(result.fileName || '선택한 파일');
  }
};

const restoreOpenedFolder = async () => {
  if (isBrowserFileSystemSupported()) {
    return;
  }

  try {
    const response = await fetch('/api/current-tree-root');
    if (!response.ok) return;

    const result = await response.json();
    if (!result.opened) return;

    applyOpenedFolder(result, {
      clearFile: false,
      focusLocation: false,
      updateStatus: false,
    });
  } catch {
    // 서버 세션에 열린 폴더가 없으면 조용히 새 작업 상태로 둔다.
  }
};

const resetForm = async () => {
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
  form.reset();
  clearSuccessStatusError();
  state.rows = structuredClone(defaultRows);
  state.successResponses = structuredClone(defaultSuccessResponses);
  state.activeSuccessResponseIndex = 0;
  Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
  renderSuccessStatusTabs();
  renderActionPathParams();
  localStorage.removeItem(STORAGE_KEY);
  refresh();
  setStatus('API 정보 초기화됨');
  showToast('info', '초기화 완료', '입력 중인 내용을 처음 상태로 되돌렸습니다.');
};

const createNewDocument = () => {
  setSpecViewerMode(false);
  form.reset();
  clearSuccessStatusError();
  state.rows = structuredClone(defaultRows);
  state.successResponses = structuredClone(defaultSuccessResponses);
  state.activeSuccessResponseIndex = 0;
  clearCurrentFile();
  Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
  renderSuccessStatusTabs();
  renderActionPathParams();
  refresh();
  focusFileLocation();
  setStatus('새 문서');
  showToast('info', '새 문서', '기존 파일 연결 없이 새 문서 작성 상태로 전환했습니다.');
};

const startSideMenuResize = (event) => {
  if (isCompactFilePanelLayout()) return;
  event.preventDefault();
  sideMenuResizeState = {
    startX: event.clientX,
    startWidth: state.sideMenuWidth,
    shouldCollapse: false,
  };
  document.body.classList.add('resizing-side-menu');
  sideMenuResizer?.setPointerCapture?.(event.pointerId);
};

const moveSideMenuResize = (event) => {
  if (!sideMenuResizeState) return;

  const nextWidth = sideMenuResizeState.startWidth + event.clientX - sideMenuResizeState.startX;
  const shouldCollapse = nextWidth < SIDE_MENU_COLLAPSE_WIDTH;
  sideMenuResizeState.shouldCollapse = shouldCollapse;

  if (shouldCollapse) {
    appShell?.classList.add('side-menu-collapsing');
    updateFilePanelRail();
    return;
  }

  appShell?.classList.remove('side-menu-collapsing');
  const snappedWidth = nextWidth < SIDE_MENU_MIN_WIDTH + SIDE_MENU_SNAP_RANGE
    ? SIDE_MENU_MIN_WIDTH
    : nextWidth;
  setSideMenuWidth(snappedWidth);
  if (state.sideMenuHidden) setSideMenuHidden(false);
};

const stopSideMenuResize = (event) => {
  if (!sideMenuResizeState) return;
  document.body.classList.remove('resizing-side-menu');
  sideMenuResizer?.releasePointerCapture?.(event.pointerId);
  const shouldCollapse = sideMenuResizeState.shouldCollapse;
  sideMenuResizeState = null;

  if (shouldCollapse) {
    setSideMenuHidden(true);
    setStatus('파일 패널 접힘');
    return;
  }

  appShell?.classList.remove('side-menu-collapsing');
  updateFilePanelRail();
};

const openFilePanelFromRail = () => {
  if (isCompactFilePanelLayout()) {
    setFileDrawerOpen(true);
    return;
  }

  setSideMenuWidth(SIDE_MENU_DEFAULT_WIDTH);
  setSideMenuHidden(false);
  setStatus('파일 패널 표시');
};

const adjustSideMenuFromKeyboard = (event) => {
  if (isCompactFilePanelLayout()) return;
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

  event.preventDefault();
  if (event.key === 'Home') {
    setSideMenuWidth(SIDE_MENU_MIN_WIDTH);
    return;
  }
  if (event.key === 'End') {
    setSideMenuWidth(SIDE_MENU_MAX_WIDTH);
    return;
  }

  const delta = event.key === 'ArrowRight' ? 12 : -12;
  const nextWidth = state.sideMenuWidth + delta;
  if (nextWidth < SIDE_MENU_COLLAPSE_WIDTH) {
    setSideMenuHidden(true);
    return;
  }
  setSideMenuWidth(nextWidth);
};

document.querySelectorAll('[data-add-row]').forEach((button) => {
  button.addEventListener('click', () => addRow(button.dataset.addRow));
});

authRequiredToggle?.addEventListener('click', () => {
  form.elements.authRequired.value = isAuthRequired() ? '불필요' : '필요';
  refresh();
});

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
messageDialogCancelButton?.addEventListener('click', () => closeMessageDialog(false));
messageDialogCloseButton?.addEventListener('click', () => closeMessageDialog(messageDialogMode === 'confirm'));
messageDialog?.addEventListener('click', (event) => {
  if (event.target === messageDialog) hideMessageDialog();
});

const closeFloatingMenuOnOutsideAction = (event) => {
  if (!isFloatingMenuOpen()) return;
  const target = event.target;
  if (floatingMenu?.contains(target) || menuButton?.contains(target)) return;
  setFloatingMenuOpen(false);
};

document.addEventListener('pointerdown', closeFloatingMenuOnOutsideAction, true);
document.addEventListener('click', closeFloatingMenuOnOutsideAction, true);
document.addEventListener('pointerdown', (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('#openSplitButton, #saveSplitButton')) return;
  closeActionDropdowns();
});

form.elements.pathAction?.addEventListener('input', () => {
  if (isSyncingActionPathParamKey) return;
  renderActionPathParams();
});

form.elements.successStatus?.addEventListener('focus', () => {
  successStatusPreviousValue = getActiveSuccessResponse().status || '200';
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
    form.elements.successStatus.value = successStatusPreviousValue;
    getActiveSuccessResponse().status = successStatusPreviousValue;
    refresh();
    showSuccessStatusError(`${nextStatus} 상태는 이미 등록되어 있습니다.`);
    return;
  }
  clearSuccessStatusError();
  getActiveSuccessResponse().status = nextStatus;
  successStatusPreviousValue = nextStatus;
  refresh();
});

addSuccessStatusButton?.addEventListener('click', addSuccessResponse);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && (isDropdownOpen(openDropdown) || isDropdownOpen(saveDropdown))) {
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

window.addEventListener('resize', () => {
  syncFilePanelLayoutMode();
  resizeJsonPreview(form.elements.bodyJson);
  resizeJsonPreview(form.elements.successJson);
});

window.addEventListener('beforeunload', () => scrollPageToTop('auto'));
window.addEventListener('pageshow', () => {
  window.requestAnimationFrame(() => scrollPageToTop('auto'));
});

form.addEventListener('input', refresh);
form.addEventListener('change', refresh);
saveButton.addEventListener('click', saveMarkdown);
copyButton.addEventListener('click', copyMarkdown);
previewToggleButton?.addEventListener('click', () => {
  const isOpen = !appShell?.classList.contains('preview-closed');
  setPreviewOpen(!isOpen);
});
resetButton.addEventListener('click', resetForm);
newDocumentButton?.addEventListener('click', createNewDocument);
openButton.addEventListener('click', openFileTreeFolder);
openMenuButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  const nextOpen = !isDropdownOpen(openDropdown);
  setDropdownOpen(saveMenuButton, saveDropdown, false);
  setDropdownOpen(openMenuButton, openDropdown, nextOpen);
});
openDropdown?.querySelectorAll('[data-open-action]').forEach((button) => {
  button.addEventListener('click', async () => {
    closeActionDropdowns();
    if (button.dataset.openAction === 'file') {
      await openMarkdownFromSaveDir();
      return;
    }
    await openFileTreeFolder();
  });
});
saveMenuButton?.addEventListener('click', (event) => {
  if (saveMenuButton.disabled) return;
  event.stopPropagation();
  const nextOpen = !isDropdownOpen(saveDropdown);
  setDropdownOpen(openMenuButton, openDropdown, false);
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
openFileInput.addEventListener('change', openMarkdownFile);
restoreSideMenuWidth();
syncFilePanelLayoutMode();
loadDraft();
Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
renderSuccessStatusTabs();
renderActionPathParams();
refresh();
restoreOpenedFolder();
window.requestAnimationFrame(() => scrollPageToTop('auto'));
