const STORAGE_KEY = 'veldoc-draft';
const FOLDER_SESSION_KEY = 'veldoc-opened-folder-session';
const FOLDER_HANDLE_DB_NAME = 'veldoc-session-folders';
const FOLDER_HANDLE_STORE_NAME = 'folders';
const HOME_TOAST_SESSION_KEY = 'veldoc-home-toast';
const VELDOC_WORKSPACE_DIR_NAME = 'veldoc';
const API_EDITOR_DIR_NAME = 'api';
const HOME_PAGE_URL = '../home.html';
const WORKSPACE_REQUIRED_NOTICE = 'workspace-required';
const BASIC_API_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const BASIC_API_METHOD_SET = new Set(BASIC_API_METHODS);
const BODY_API_METHOD_SET = new Set(['POST', 'PUT', 'PATCH']);
const CUSTOM_AUTH_SCHEME = 'Custom';
const AUTH_SCHEMES = ['JWT Bearer', 'API Key', 'OAuth 2.0', 'Cookie Session'];
const AUTH_SCHEME_SET = new Set(AUTH_SCHEMES);
const AUTH_POLICY_FILE_NAME = 'veldoc-auth-policies.json';
const LEGACY_AUTH_POLICY_FILE_NAME = 'auth-policies.json';
const LEGACY_AUTH_POLICY_DIRECTORY_NAME = '.veldoc';
const AUTH_POLICY_VERSION = 2;
const AUTH_POLICY_SCOPES = [
  { value: 'root', label: '주소', segmentCount: 0 },
  { value: 'base', label: '대분류', segmentCount: 1 },
  { value: 'middle', label: '중분류', segmentCount: 2 },
  { value: 'subCategory', label: '하분류', segmentCount: 3 },
  { value: 'action', label: '동작', segmentCount: Number.POSITIVE_INFINITY },
];
const AUTH_POLICY_SCOPE_SET = new Set(AUTH_POLICY_SCOPES.map((scope) => scope.value));
const AUTO_HEADER_FIELD = '__veldocAutoHeader';
const AUTO_EXAMPLE_FIELD = '__veldocAutoExample';
const EXAMPLE_TOUCHED_FIELD = '__veldocExampleTouched';
const AUTO_EXAMPLE_ROW_TYPES = new Set(['pathParams', 'actionPathParams', 'queryParams', 'bodyFields', 'responseFields']);
const ERROR_STATE_CLEAR_DELAY_MS = 1500;

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const rowDefinitions = {
  headers: {
    id: 'headersRows',
    className: 'compact',
    fields: [
      ['key', 'Key', 'X-Request-Id'],
      ['value', 'Value', 'req_123'],
      ['required', '필수', 'Y'],
      ['description', '설명', '요청 추적 ID'],
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

const HEADER_PRESETS = [
  { key: 'Authorization', value: 'Bearer {token}', required: 'Y', description: '로그인 인증', risk: '아무나 API 호출 가능' },
  { key: 'Cookie', value: 'session={sessionId}', required: 'Y', description: '로그인 인증', risk: '로그인 세션 전달 불가' },
  { key: 'Content-Type', value: 'application/json', required: 'Y', description: 'Body 파싱', risk: '서버가 JSON을 읽지 못함' },
  { key: 'X-CSRF-Token', value: '{csrfToken}', required: 'Y', description: 'CSRF 방어', risk: '로그인 상태 악용 가능' },
  { key: 'Idempotency-Key', value: '{idempotencyKey}', required: 'Y', description: '중복 요청 방지', risk: '결제나 처리 요청 중복 가능' },
  { key: 'X-Request-Id', value: '{requestId}', required: 'Y', description: '요청 추적', risk: '장애 분석 어려움' },
  { key: 'Origin', value: 'https://example.com', required: 'Y', description: 'CORS 보안', risk: '타 사이트 호출 제어 어려움' },
  { key: 'User-Agent', value: 'VelDoc-Client/1.0', required: 'Y', description: '통계/보안', risk: '봇 탐지와 통계 분석 어려움' },
];

const ERROR_RESPONSE_PRESETS = [
  { status: '400', code: 'BAD_REQUEST', message: '요청 값이 올바르지 않습니다.', condition: '필수 값 누락 또는 타입 오류' },
  { status: '401', code: 'UNAUTHORIZED', message: '로그인이 필요합니다.', condition: '토큰 없음 또는 만료' },
  { status: '403', code: 'FORBIDDEN', message: '접근 권한이 없습니다.', condition: 'Role 권한 부족' },
  { status: '404', code: 'NOT_FOUND', message: '데이터를 찾을 수 없습니다.', condition: '대상 리소스 없음' },
  { status: '409', code: 'CONFLICT', message: '요청이 현재 상태와 충돌합니다.', condition: '중복 요청 또는 상태 충돌' },
  { status: '500', code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.', condition: '예외 발생' },
];

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
const deleteDocumentButton = document.querySelector('#deleteDocumentButton');
const newDocumentButton = document.querySelector('#newDocumentButton');
const saveMenuButton = document.querySelector('#saveMenuButton');
const saveDropdown = document.querySelector('#saveDropdown');
const helpButton = document.querySelector('#helpButton');
const helpDialog = document.querySelector('#helpDialog');
const helpDialogCloseButton = document.querySelector('#helpDialogCloseButton');
const helpTopicButtons = [...document.querySelectorAll('[data-help-topic]')];
const helpSections = [...document.querySelectorAll('[data-help-section]')];
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
const pathGrid = document.querySelector('.path-grid');
const fileLocationPreview = document.querySelector('#fileLocationPreview');
const paramsPathPreview = document.querySelector('#paramsPathPreview');
const queryPathPreview = document.querySelector('#queryPathPreview');
const queryParamsSection = document.querySelector('#queryParamsSection');
const bodySection = document.querySelector('#bodySection');
const actionPathParamsPanel = document.querySelector('#actionPathParamsPanel');
const actionPathParamsRows = document.querySelector('#actionPathParamsRows');
const authTopGrid = document.querySelector('#authTopGrid');
const authRequiredToggle = document.querySelector('#authRequiredToggle');
const authDetails = document.querySelector('#authDetails');
const authPolicyScopeField = document.querySelector('#authPolicyScopeField');
const authPolicyScopeGrid = document.querySelector('#authPolicyScopeGrid');
const authRoleGrid = document.querySelector('#authRoleGrid');
const authRoleAddCard = document.querySelector('#authRoleAddCard');
const authRoleAddButton = document.querySelector('#authRoleAddButton');
const authRoleInput = document.querySelector('#authRoleInput');
const successStatusTabs = document.querySelector('#successStatusTabs');
const addSuccessStatusButton = document.querySelector('#addSuccessStatusButton');
const successStatusError = document.querySelector('#successStatusError');
const methodPickerGrid = document.querySelector('.method-picker-grid');

const defaultRows = {
  headers: [{ required: 'Y' }],
  pathParams: [],
  actionPathParams: [],
  queryParams: [],
  bodyFields: [],
  responseFields: [],
  errors: ERROR_RESPONSE_PRESETS.slice(0, 4).map((preset) => ({ ...preset })),
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
  browserWorkspaceDirectoryHandle: null,
  browserDirectoryHandle: null,
  browserSaveDirectoryHandle: null,
  browserEditorRootLabel: '',
  fileTreeHandles: new Map(),
  folderApiPaths: [],
  folderSpecFiles: [],
  viewerMode: false,
  fileTreeOpened: false,
  sideMenuWidth: SIDE_MENU_DEFAULT_WIDTH,
  sideMenuHidden: false,
  fileDrawerOpen: false,
  successResponses: structuredClone(defaultSuccessResponses),
  activeSuccessResponseIndex: 0,
  viewerCommon: '',
  viewerVersion: '',
  pendingCurrentFileMeta: null,
  authPolicies: {
    version: AUTH_POLICY_VERSION,
    policies: {},
  },
  authSelectedRoles: [],
  authSelectedRoleOrigins: {},
  authRoleVisibleScopePath: '',
};

let isSyncingActionPathParamKey = false;
let messageDialogReturnFocus = null;
let messageDialogResolver = null;
let messageDialogMode = 'alert';
let sideMenuResizeState = null;
let successStatusPreviousValue = '200';
let successStatusDragState = null;
let isSaveShortcutRunning = false;
let isAuthPolicyScopeManuallySelected = false;
let transientErrorClearTimer = null;

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
  scheduleTransientErrorClear();
};

const triggerShake = (element) => {
  if (!element) return;
  element.classList.remove('shake');
  requestAnimationFrame(() => {
    element.classList.add('shake');
    element.addEventListener('animationend', () => element.classList.remove('shake'), { once: true });
  });
};

const getValidationTarget = (field) => {
  if (field === 'apiName') return form.elements.apiName;
  if (field === 'method') return methodPickerGrid;
  if (field === 'successStatus') return form.elements.successStatus;
  return null;
};

const getValidationFocusTarget = (field) => {
  if (field === 'method') {
    return form.querySelector('input[name="method"]:checked') || form.querySelector('input[name="method"]');
  }
  return getValidationTarget(field);
};

const clearValidationFieldError = (field) => {
  const target = getValidationTarget(field);
  target?.classList.remove('is-error', 'shake');
  target?.removeAttribute('aria-invalid');
  if (field === 'successStatus') {
    clearSuccessStatusError();
  }
};

const clearValidationErrors = () => {
  ['apiName', 'method', 'successStatus'].forEach(clearValidationFieldError);
  clearFileNameConflictError();
};

const markValidationFieldError = (error, options = {}) => {
  const target = getValidationTarget(error.field);
  if (!target) return;

  target.classList.add('is-error');
  target.setAttribute('aria-invalid', 'true');
  if (error.field === 'successStatus' && successStatusError) {
    successStatusError.textContent = error.message;
    successStatusError.hidden = false;
    form.elements.successStatus?.setAttribute('aria-describedby', successStatusError.id);
  }
  if (options.shake) triggerShake(target);
};

const scrollToValidationField = (field, options = {}) => {
  const target = getValidationTarget(field);
  if (!target) return;
  const scrollTarget = target.closest?.('.field, .panel') || target;
  scrollTarget.scrollIntoView({ behavior: options.behavior || 'smooth', block: 'center' });
  window.setTimeout(() => {
    const focusTarget = getValidationFocusTarget(field);
    focusTarget?.focus?.({ preventScroll: true });
  }, options.focusDelay ?? 220);
};

const clearFileNameConflictError = () => {
  [pathGrid, fileNamePreview].forEach((element) => {
    element?.classList.remove('is-error', 'shake');
    element?.removeAttribute('aria-invalid');
  });
  pathGrid?.querySelectorAll('input').forEach((inputElement) => {
    inputElement.classList.remove('is-error');
    inputElement.removeAttribute('aria-invalid');
  });
};

const scheduleTransientErrorClear = () => {
  window.clearTimeout(transientErrorClearTimer);
  transientErrorClearTimer = window.setTimeout(() => {
    clearValidationErrors();
    transientErrorClearTimer = null;
  }, ERROR_STATE_CLEAR_DELAY_MS);
};

const markFileNameConflictError = () => {
  clearFileNameConflictError();
  [pathGrid, fileNamePreview].forEach((element) => {
    element?.classList.add('is-error');
    element?.setAttribute('aria-invalid', 'true');
    triggerShake(element);
  });
  pathGrid?.querySelectorAll('input').forEach((inputElement) => {
    inputElement.classList.add('is-error');
    inputElement.setAttribute('aria-invalid', 'true');
  });
  (pathGrid?.closest('.field') || fileNamePreview?.closest('.field'))?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  window.setTimeout(() => {
    form.elements.pathBase?.focus?.({ preventScroll: true });
  }, 220);
  scheduleTransientErrorClear();
};

const isTargetFileExistsError = (error) =>
  error instanceof Error && error.message === 'Target file already exists.';

const collectValidationErrors = () => {
  const errors = [];
  if (!input('apiName')) {
    errors.push({ field: 'apiName', message: 'API 이름을 입력해주세요.' });
  }
  if (!input('method')) {
    errors.push({ field: 'method', message: 'Method를 선택해주세요.' });
  }
  const successStatus = normalizeSuccessStatusValue(form.elements.successStatus?.value);
  if (!/^2\d{2}$/.test(successStatus)) {
    errors.push({ field: 'successStatus', message: 'Success Status는 2xx 형태로 입력해주세요.' });
  }
  return errors;
};

const validateSpecBeforeSave = () => {
  clearValidationErrors();
  const errors = collectValidationErrors();

  if (errors.length === 0) return true;

  errors.forEach((error) => markValidationFieldError(error, { shake: true }));
  scheduleTransientErrorClear();
  showWarningToast('필수 값 누락', errors.length === 1 ? errors[0].message : `${errors.length}개의 필수 값을 확인해주세요.`);
  scrollToValidationField(errors[0].field);
  setStatus('필수 값 누락');
  return false;
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

const setMessageDialogBody = (message) => {
  if (!messageDialogBody) return;

  const parts = String(message ?? '').split('<br>');
  messageDialogBody.replaceChildren();
  parts.forEach((part, index) => {
    if (index > 0) messageDialogBody.append(document.createElement('br'));
    messageDialogBody.append(document.createTextNode(part));
  });
};

const showConfirmDialog = (title, message, options = {}) => {
  messageDialogResolver?.(false);
  return new Promise((resolve) => {
    messageDialogResolver = resolve;
    messageDialogMode = 'confirm';
    messageDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (messageDialogTitle) messageDialogTitle.textContent = title;
    setMessageDialogBody(message);
    if (messageDialogCancelButton) {
      messageDialogCancelButton.hidden = false;
      messageDialogCancelButton.textContent = options.cancelText || '취소';
    }
    if (messageDialogCloseButton) messageDialogCloseButton.textContent = options.confirmText || '확인';
    if (messageDialog) messageDialog.hidden = false;
    messageDialogCancelButton?.focus();
  });
};

const setHelpTopic = (topic) => {
  const nextTopic = topic || 'shortcuts';
  helpTopicButtons.forEach((button) => {
    const isActive = button.dataset.helpTopic === nextTopic;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  helpSections.forEach((section) => {
    section.classList.toggle('active', section.dataset.helpSection === nextTopic);
  });
};

const setHelpDialogOpen = (isOpen) => {
  if (!helpDialog) return;
  helpDialog.hidden = !isOpen;
  helpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (isOpen) {
    closeActionDropdowns();
    setHelpTopic('shortcuts');
    helpDialogCloseButton?.focus();
    return;
  }
  helpButton?.focus();
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

const normalizeFileTreeMethod = (value) => String(value ?? '').trim().toUpperCase();

const getFileTreeMethodClassName = (method) => method.replace(/[^A-Z0-9-]/g, '-').toLowerCase();

const normalizeBasicApiMethod = (value, fallback = 'POST') => {
  const method = String(value ?? '').trim().toUpperCase();
  return BASIC_API_METHOD_SET.has(method) ? method : fallback;
};

const normalizeAuthScheme = (value, fallback = 'JWT Bearer') => {
  const scheme = String(value ?? '').trim();
  if (scheme === 'Bearer JWT') return 'JWT Bearer';
  return AUTH_SCHEME_SET.has(scheme) ? scheme : fallback;
};

const getAuthSchemeState = (value) => {
  const scheme = String(value ?? '').trim();
  if (!scheme) return { scheme: 'JWT Bearer', custom: '' };
  if (scheme === CUSTOM_AUTH_SCHEME) return { scheme: CUSTOM_AUTH_SCHEME, custom: '' };
  if (scheme === 'Bearer JWT') return { scheme: 'JWT Bearer', custom: '' };
  if (AUTH_SCHEME_SET.has(scheme)) return { scheme, custom: '' };
  return { scheme: CUSTOM_AUTH_SCHEME, custom: scheme };
};

const getEffectiveAuthScheme = () => {
  const selectedScheme = input('authScheme') || 'JWT Bearer';
  if (selectedScheme !== CUSTOM_AUTH_SCHEME) return normalizeAuthScheme(selectedScheme);
  return input('authSchemeCustom') || CUSTOM_AUTH_SCHEME;
};

const normalizeHeaderKey = (value) => String(value ?? '').trim().toLowerCase();

const getHeaderPreset = (key) =>
  HEADER_PRESETS.find((preset) => normalizeHeaderKey(preset.key) === normalizeHeaderKey(key));

const buildAuthorizationHeaderValue = (authScheme) => {
  const scheme = String(authScheme ?? '').trim();
  if (scheme === 'JWT Bearer' || scheme === 'OAuth 2.0') return 'Bearer {token}';
  if (scheme === 'API Key') return 'API Key {token}';
  if (scheme === 'Cookie Session') return 'Cookie Session {token}';
  return 'Custom {token}';
};

const buildAutomaticHeaderRows = ({ authRequired, authScheme, method }) => {
  const rows = [];

  if (authRequired === '필요') {
    rows.push({
      key: 'Authorization',
      value: buildAuthorizationHeaderValue(authScheme),
      required: 'Y',
      description: '인증 토큰',
    });
  }

  if (BODY_API_METHOD_SET.has(normalizeBasicApiMethod(method))) {
    rows.push({
      key: 'Content-Type',
      value: 'application/json',
      required: 'Y',
      description: '요청 Body 형식',
    });
  }

  rows.push({
    key: 'Accept',
    value: '*/*',
    required: 'N',
    description: '응답 형식',
  });

  return rows;
};

const isFilledHeaderRow = (row) =>
  ['key', 'value', 'description'].some((key) => String(row?.[key] ?? '').trim() !== '');

const markAutomaticHeaderRow = (row) => ({ ...row, [AUTO_HEADER_FIELD]: true });

const isAutomaticHeaderRow = (row) => Boolean(row?.[AUTO_HEADER_FIELD]);

const areHeaderRowsEqual = (a, b) =>
  ['key', 'value', 'required', 'description'].every((key) => String(a?.[key] ?? '') === String(b?.[key] ?? '')) &&
  isAutomaticHeaderRow(a) === isAutomaticHeaderRow(b);

const buildHeaderRowsForMarkdown = ({ authRequired, authScheme, method }) => {
  const automaticRows = buildAutomaticHeaderRows({ authRequired, authScheme, method });
  const manualRows = getFieldRows('headers').filter((row) => isFilledHeaderRow(row) && !isAutomaticHeaderRow(row));
  const manualHeaderKeys = new Set(manualRows.map((row) => normalizeHeaderKey(row.key)).filter(Boolean));
  const missingAutomaticRows = automaticRows.filter((row) => !manualHeaderKeys.has(normalizeHeaderKey(row.key)));

  return [...missingAutomaticRows, ...manualRows];
};

const syncHeaderRowsWithControls = ({ render = false } = {}) => {
  const automaticRows = buildAutomaticHeaderRows({
    authRequired: isAuthRequired() ? '필요' : '불필요',
    authScheme: getEffectiveAuthScheme(),
    method: input('method') || 'POST',
  }).map(markAutomaticHeaderRow);
  const existingRows = state.rows.headers || [];
  const manualRows = existingRows.filter((row) => isFilledHeaderRow(row) && !isAutomaticHeaderRow(row));
  const manualHeaderKeys = new Set(manualRows.map((row) => normalizeHeaderKey(row.key)).filter(Boolean));
  const nextRows = [
    ...automaticRows.filter((row) => !manualHeaderKeys.has(normalizeHeaderKey(row.key))),
    ...manualRows,
  ];
  const changed =
    existingRows.length !== nextRows.length ||
    existingRows.some((row, index) => !areHeaderRowsEqual(row, nextRows[index]));

  if (!changed) return false;
  state.rows.headers = nextRows;
  if (render) renderRows('headers');
  return true;
};

const syncHeaderRowsAndRefresh = () => {
  syncHeaderRowsWithControls({ render: true });
  refresh();
};

const createDefaultAuthPolicies = () => ({
  version: AUTH_POLICY_VERSION,
  policies: {},
});

const normalizeAuthPolicyPath = (value) => {
  const segments = String(value ?? '')
    .trim()
    .replaceAll('\\', '/')
    .replace(/^https?:\/\/[^/]+/i, '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
};

const normalizeRelativeFilePath = (value) =>
  String(value ?? '')
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/');

const normalizeAuthPolicyScope = (value, path = '/') => {
  const scope = String(value ?? '').trim();
  if (scope === 'tag' || scope === 'swaggerTag' || scope === 'subcategory') return 'subCategory';
  if (AUTH_POLICY_SCOPE_SET.has(scope)) return scope;

  const segmentCount = splitPathPart(normalizeAuthPolicyPath(path)).length;
  if (segmentCount === 0) return 'root';
  if (segmentCount === 1) return 'base';
  if (segmentCount === 2) return 'middle';
  if (segmentCount === 3) return 'subCategory';
  return 'action';
};

const normalizeAuthPolicyRecord = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return {};

  const normalized = {};
  if (Array.isArray(record.roles)) {
    normalized.roles = [...new Set(record.roles.map(normalizeRoleValue).filter(Boolean))];
  }
  return normalized;
};

const normalizeAuthPolicies = (source) => {
  const normalized = createDefaultAuthPolicies();
  const policies = source?.policies && typeof source.policies === 'object' ? source.policies : {};

  Object.entries(policies).forEach(([path, policy]) => {
    const normalizedPath = normalizeAuthPolicyPath(path);
    const normalizedPolicy = normalizeAuthPolicyRecord(policy);
    if ((normalizedPolicy.roles || []).length > 0) {
      normalized.policies[normalizedPath] = normalizedPolicy;
    }
  });

  return normalized;
};

const normalizeFolderApiPaths = (apiPaths = []) =>
  [...new Set(
    (Array.isArray(apiPaths) ? apiPaths : [])
      .map((path) => String(path ?? '').trim())
      .filter(Boolean)
      .map(normalizeAuthPolicyPath),
  )].sort((a, b) => a.localeCompare(b, 'ko'));

const normalizeFolderSpecFiles = (files = []) =>
  (Array.isArray(files) ? files : [])
    .map((file) => {
      const rawApiPath = String(file?.apiPath ?? '').trim();
      const path = normalizeRelativeFilePath(file?.path);
      if (!rawApiPath || !path) return null;
      return {
        path,
        apiPath: normalizeAuthPolicyPath(rawApiPath),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.path.localeCompare(b.path, 'ko') || a.apiPath.localeCompare(b.apiPath, 'ko'));

const areStringArraysEqual = (a = [], b = []) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const getInheritedRolesFromPolicies = (policies, path) => {
  return resolveAuthPolicyFromPolicyMap(policies, path, { includeSelf: false })?.policy?.roles || [];
};

const removeInheritedDuplicateRoles = (authPolicies) => {
  const nextPolicies = normalizeAuthPolicies(authPolicies);
  let changed = false;

  Object.entries(nextPolicies.policies)
    .sort(([pathA], [pathB]) => splitPathPart(pathA).length - splitPathPart(pathB).length)
    .forEach(([policyPath, policy]) => {
      const inheritedRoleSet = new Set(getInheritedRolesFromPolicies(nextPolicies.policies, policyPath));

      if (Array.isArray(policy.roles)) {
        const localRoles = mergeAuthRoleValues(policy.roles.filter((role) => !inheritedRoleSet.has(role)));
        if (!areStringArraysEqual(policy.roles, localRoles)) changed = true;
        if (localRoles.length > 0) {
          policy.roles = localRoles;
        } else {
          delete nextPolicies.policies[policyPath];
          changed = true;
        }
      }
    });

  return { authPolicies: nextPolicies, changed };
};

const findActionPolicySpecFile = (policyPath, specFiles = state.folderSpecFiles) => {
  const normalizedPolicyPath = normalizeAuthPolicyPath(policyPath);
  const normalizedSpecFiles = normalizeFolderSpecFiles(specFiles);

  if (normalizedSpecFiles.length > 0) {
    const pathMatches = normalizedSpecFiles.filter((file) => file.apiPath === normalizedPolicyPath);
    return pathMatches[0] || null;
  }

  return normalizeFolderApiPaths(state.folderApiPaths).includes(normalizedPolicyPath)
    ? { apiPath: normalizedPolicyPath }
    : null;
};

const pruneAuthPoliciesByFolderSpecFiles = (authPolicies, specFiles = state.folderSpecFiles) => {
  const dedupeResult = removeInheritedDuplicateRoles(authPolicies);
  const nextPolicies = dedupeResult.authPolicies;
  let changed = dedupeResult.changed;

  Object.entries(nextPolicies.policies).forEach(([policyPath, policy]) => {
    if (normalizeAuthPolicyScope('', policyPath) !== 'action') return;
    const matchingFile = findActionPolicySpecFile(policyPath, specFiles);
    if (matchingFile) return;
    delete nextPolicies.policies[policyPath];
    changed = true;
  });

  return { authPolicies: nextPolicies, changed };
};

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

const getAuthPolicyScopeOptions = () => {
  const pathSegments = getPathSegments();
  const actionSegments = getPathActionSegments();

  return AUTH_POLICY_SCOPES.map((scope) => {
    const isRoot = scope.segmentCount === 0;
    const segmentCount = scope.value === 'action' ? pathSegments.length : scope.segmentCount;
    const scopeSegments = isRoot ? [] : pathSegments.slice(0, segmentCount);
    const hasEnoughSegments = isRoot || scopeSegments.length === segmentCount;
    const hasAction = scope.value !== 'action' || actionSegments.length > 0;
    const enabled = hasEnoughSegments && hasAction;
    const path = enabled && scopeSegments.length > 0 ? `/${scopeSegments.join('/')}` : '/';

    return {
      ...scope,
      enabled,
      path,
    };
  });
};

const getDefaultAuthPolicyScope = (options = getAuthPolicyScopeOptions()) =>
  [...options].reverse().find((option) => option.enabled) ||
  options[0];

const getSelectedAuthPolicyScopeOption = () => {
  const options = getAuthPolicyScopeOptions();
  if (!isAuthPolicyScopeManuallySelected) return getDefaultAuthPolicyScope(options);

  const selectedValue = input('authPolicyScope');
  const selectedOption = options.find((option) => option.value === selectedValue && option.enabled);
  return selectedOption || getDefaultAuthPolicyScope(options);
};

const parseAuthPolicyScopeValue = (value) => {
  const text = blankIfPlaceholder(value);
  if (!text) return '';

  const valueMatch = text.match(/\b(root|base|middle|subCategory|subcategory|tag|action)\b/i);
  if (valueMatch) {
    const normalizedScope = normalizeAuthPolicyScope(valueMatch[1]);
    if (AUTH_POLICY_SCOPE_SET.has(normalizedScope)) return normalizedScope;
  }

  const labelScope = AUTH_POLICY_SCOPES.find((scope) => text.includes(scope.label));
  return labelScope?.value || '';
};

const selectAuthPolicyScopeByValue = (value) => {
  const scopeValue = parseAuthPolicyScopeValue(value);
  if (!scopeValue) return null;

  const scopeOption = getAuthPolicyScopeOptions().find((option) => option.value === scopeValue && option.enabled);
  if (!scopeOption) return null;

  form.elements.authPolicyScope.value = scopeOption.value;
  return scopeOption;
};

const getAuthPolicyPathChain = (path) => {
  const segments = splitPathPart(path);
  const chain = ['/'];
  segments.forEach((_, index) => {
    chain.push(`/${segments.slice(0, index + 1).join('/')}`);
  });
  return chain;
};

const resolveAuthPolicyFromPolicyMap = (policies, path, options = {}) => {
  const { includeSelf = true } = options;
  const normalizedPath = normalizeAuthPolicyPath(path);
  const chain = includeSelf
    ? getAuthPolicyPathChain(normalizedPath)
    : getAuthPolicyPathChain(normalizedPath).slice(0, -1);
  const resolved = {};
  const roleMap = new Map();
  let sourcePath = '';

  chain.forEach((policyPath) => {
    const policy = policies[policyPath];
    if (!policy) return;

    if (Object.hasOwn(policy, 'roles')) {
      policy.roles.forEach((role) => roleMap.set(role, role));
      resolved.roles = [...roleMap.values()];
      sourcePath = policyPath;
    }
  });

  return sourcePath ? { policy: resolved, sourcePath, targetPath: normalizedPath } : null;
};

const resolveAuthPolicyForPath = (path) =>
  resolveAuthPolicyFromPolicyMap(state.authPolicies.policies, path);

const getParentAuthPolicyPath = (path) => {
  const segments = splitPathPart(normalizeAuthPolicyPath(path));
  if (segments.length === 0) return '';
  if (segments.length === 1) return '/';
  return `/${segments.slice(0, -1).join('/')}`;
};

const resolveParentAuthPolicyForPath = (path) => {
  const parentPath = getParentAuthPolicyPath(path);
  return parentPath ? resolveAuthPolicyForPath(parentPath) : null;
};

const renderAuthPolicyScopes = () => {
  if (!authPolicyScopeGrid) return;

  const options = getAuthPolicyScopeOptions();
  const selectedOption = getSelectedAuthPolicyScopeOption();
  if (selectedOption && form.elements.authPolicyScope.value !== selectedOption.value) {
    form.elements.authPolicyScope.value = selectedOption.value;
  }

  options.forEach((option) => {
    const card = authPolicyScopeGrid.querySelector(`[data-auth-policy-scope-card="${option.value}"]`);
    if (!card) return;

    const inputElement = card.querySelector('input');
    const pathElement = card.querySelector(`[data-auth-policy-scope-path="${option.value}"]`);
    const directPolicy = option.enabled ? state.authPolicies.policies[option.path] : null;
    const hasDirectRoles = Boolean(directPolicy?.roles?.length);

    if (inputElement) {
      inputElement.disabled = !option.enabled;
      inputElement.checked = option.value === selectedOption?.value;
    }
    if (pathElement) {
      pathElement.textContent = option.enabled ? option.path : '-';
    }
    card.classList.toggle('disabled', !option.enabled);
    card.classList.toggle('has-auth-roles', hasDirectRoles);
    card.title = option.enabled ? option.path : 'Path 구성 값을 먼저 입력하세요.';
  });

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

const buildSubCategory = () => {
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
const isDeletableCurrentFile = () => {
  const file = state.currentFile;
  if (!file) return false;
  if (isBrowserFileSystemFile(file)) {
    return Boolean((file.directoryHandle || state.browserSaveDirectoryHandle) && file.fileName);
  }
  return Boolean(file.origin && file.path);
};
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
const isBodyEnabled = () => BODY_API_METHOD_SET.has(input('method'));

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
  authTopGrid?.classList.toggle('auth-not-required', !required);
  if (authRequiredToggle) {
    authRequiredToggle.textContent = required ? '필요' : '불필요';
    authRequiredToggle.classList.toggle('active', required);
    authRequiredToggle.setAttribute('aria-pressed', required ? 'true' : 'false');
  }
  if (authPolicyScopeField) {
    authPolicyScopeField.hidden = !required;
    authPolicyScopeField.querySelectorAll('input, button').forEach((element) => {
      element.tabIndex = required ? 0 : -1;
    });
  }
  if (authDetails) {
    authDetails.classList.toggle('collapsed', !required);
    authDetails.setAttribute('aria-hidden', required ? 'false' : 'true');
    authDetails.querySelectorAll('input, select, textarea, button').forEach((element) => {
      element.tabIndex = required ? 0 : -1;
    });
  }
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

const getDefaultExampleForType = (type) => {
  const normalizedType = String(type || 'string').trim().toLowerCase();
  const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
  const arrayItemType = getArrayItemType(scalarType);
  if (arrayItemType !== null) return getDefaultExampleForType(arrayItemType);
  if (isIntegerType(scalarType)) return '0';
  if (isNumberType(scalarType)) return '0.0';
  if (isBooleanType(scalarType)) return 'true';
  if (scalarType === '{}' || scalarType.includes('object')) return '{}';
  if (scalarType.includes('null')) return 'null';
  return 'example';
};

const shouldUseAutoExample = (row) =>
  !row?.[EXAMPLE_TOUCHED_FIELD] && (!String(row?.example ?? '').trim() || row?.[AUTO_EXAMPLE_FIELD]);

const applyAutoExampleForRow = (row) => {
  if (!row || !shouldUseAutoExample(row)) return;
  row.example = getDefaultExampleForType(row.type);
  row[AUTO_EXAMPLE_FIELD] = true;
};

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

  const indexes = mapping.map(([, header]) => {
    const aliases = Array.isArray(header) ? header : [header];
    return tableData.headers.findIndex((cell) => aliases.includes(cell));
  });
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

const normalizeRoleValue = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

const getAuthRoleItems = () =>
  [...authRoleGrid?.querySelectorAll('[data-auth-role-card]') || []].map((card) => {
    const checkbox = card.querySelector('input[name="roles"]');
    return {
      value: checkbox?.value || '',
      checked: Boolean(checkbox?.checked),
    };
  }).filter((item) => item.value);

const normalizeAuthRoleRenderItems = (roleItems = []) => {
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

const getCheckedRoleValuesFromItems = (roleItems = []) =>
  normalizeAuthRoleRenderItems(roleItems)
    .filter((roleItem) => roleItem.checked)
    .map((roleItem) => roleItem.value);

const createAuthRoleCard = (roleItem) => {
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
  removeButton.addEventListener('click', () => {
    forgetAuthSelectedRole(value);
    card.remove();
    syncAuthRoleSelectionMemoryFromVisibleCards();
    refresh();
  });

  label.append(checkbox, text);
  card.append(label, removeButton);
  return card;
};

const renderAuthRoles = (roleItems = [], options = {}) => {
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

const mergeAuthRoleValues = (...roleGroups) => {
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

const findAuthRoleOriginPathForScope = (role, path = buildApiPath()) => {
  const normalizedRole = normalizeRoleValue(role);
  if (!normalizedRole) return '';

  const chain = getAuthPolicyPathChain(normalizeAuthPolicyPath(path));
  return chain.find((policyPath) => {
    const policy = state.authPolicies.policies[policyPath];
    return (policy?.roles || []).some((policyRole) => normalizeRoleValue(policyRole) === normalizedRole);
  }) || '';
};

const rememberAuthSelectedRoles = (roles = [], options = {}) => {
  const scopePath = normalizeAuthPolicyPath(options.scopePath || state.authRoleVisibleScopePath || buildApiPath());
  const selectedRoles = mergeAuthRoleValues(roles);
  const selectedRoleSet = new Set(selectedRoles);
  const nextOrigins = {};

  selectedRoles.forEach((role) => {
    nextOrigins[role] = state.authSelectedRoleOrigins[role] ||
      findAuthRoleOriginPathForScope(role, scopePath) ||
      scopePath;
  });

  Object.keys(state.authSelectedRoleOrigins).forEach((role) => {
    if (selectedRoleSet.has(role)) nextOrigins[role] = state.authSelectedRoleOrigins[role];
  });

  state.authSelectedRoles = selectedRoles;
  state.authSelectedRoleOrigins = nextOrigins;
  return state.authSelectedRoles;
};

const forgetAuthSelectedRole = (role) => {
  const normalizedRole = normalizeRoleValue(role);
  if (!normalizedRole) return;

  state.authSelectedRoles = state.authSelectedRoles.filter((selectedRole) => selectedRole !== normalizedRole);
  delete state.authSelectedRoleOrigins[normalizedRole];
};

const getAuthRoleCatalogForPath = (path) => {
  const roles = [];

  getAuthPolicyPathChain(normalizeAuthPolicyPath(path)).forEach((policyPath) => {
    const policy = state.authPolicies.policies[policyPath];
    if (!policy) return;
    roles.push(...(policy.roles || []));
  });

  return mergeAuthRoleValues(roles);
};

const isAuthRoleVisibleAtScopePath = (role, path = buildApiPath()) => {
  const normalizedRole = normalizeRoleValue(role);
  if (!normalizedRole) return false;

  if (getAuthRoleCatalogForPath(path).includes(normalizedRole)) return true;

  const rawOriginPath = state.authSelectedRoleOrigins[normalizedRole];
  if (!rawOriginPath) return false;

  const originPath = normalizeAuthPolicyPath(rawOriginPath);
  return Boolean(originPath && getAuthPolicyPathChain(normalizeAuthPolicyPath(path)).includes(originPath));
};

const syncAuthRoleSelectionMemoryFromVisibleCards = () => {
  const visibleItems = getAuthRoleItems();
  const visibleRoleSet = new Set(visibleItems.map((item) => item.value));
  const checkedVisibleRoles = visibleItems.filter((item) => item.checked).map((item) => item.value);
  const hiddenSelectedRoles = state.authSelectedRoles.filter((role) => !visibleRoleSet.has(role));

  rememberAuthSelectedRoles(mergeAuthRoleValues(hiddenSelectedRoles, checkedVisibleRoles), {
    scopePath: state.authRoleVisibleScopePath,
  });
};

const sortAuthRolesByScopeOrder = (roles = [], path = buildApiPath()) => {
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
  });
  sortableRoles.forEach(appendRole);

  return orderedRoles;
};

const getSelectedAuthRolesForScope = (path = buildApiPath()) => {
  syncAuthRoleSelectionMemoryFromVisibleCards();
  return sortAuthRolesByScopeOrder(
    state.authSelectedRoles.filter((role) => isAuthRoleVisibleAtScopePath(role, path)),
    path,
  );
};

const createAuthRoleItemsWithCatalog = (checkedRoles = [], path = buildApiPath()) => {
  const selectedRoles = mergeAuthRoleValues(checkedRoles);
  const selectedRoleSet = new Set(selectedRoles);

  return sortAuthRolesByScopeOrder(
    mergeAuthRoleValues(getAuthRoleCatalogForPath(path), selectedRoles),
    path,
  ).map((value) => ({
    value,
    checked: selectedRoleSet.has(value),
  }));
};

const syncAuthRolesForSelectedScope = () => {
  syncAuthRoleSelectionMemoryFromVisibleCards();
  const scopeOption = getSelectedAuthPolicyScopeOption();
  const catalogPath = scopeOption?.path || buildApiPath();
  const scopedCheckedRoles = state.authSelectedRoles.filter((role) => isAuthRoleVisibleAtScopePath(role, catalogPath));
  renderAuthRoles(createAuthRoleItemsWithCatalog(scopedCheckedRoles, catalogPath), {
    scopePath: catalogPath,
    updateSelectionMemory: false,
  });
};

const addAuthRole = () => {
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

const collectAuthPolicyFromForm = (scopeOptionOrPath = buildApiPath()) => {
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

  const localRoles = catalogRoles.filter((role) => !parentRoleSet.has(role));
  if (localRoles.length > 0) policy.roles = localRoles;

  return policy;
};

const normalizeLoadedMethod = (value) => normalizeBasicApiMethod(value);

const parseCsvValues = (value) =>
  blankIfPlaceholder(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getMarkdownTableValue = (section, key) => parseInfoTable(section)[key] || '';

const getSubCategoryTableValue = (section) =>
  getMarkdownTableValue(section, '하분류') || getMarkdownTableValue(section, 'Swagger Tag');

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
];

const isApiSpecMarkdown = (markdown) => {
  if (!/^#\s+.+$/m.test(markdown)) return false;
  if (!requiredMarkdownSections.every((section) => getMarkdownSection(markdown, section))) return false;

  const basic = parseInfoTable(getMarkdownSection(markdown, '기본 정보'));
  const method = String(blankIfPlaceholder(basic.Method)).toUpperCase();
  return BASIC_API_METHOD_SET.has(method) && Boolean(blankIfPlaceholder(basic.Path));
};

const assertApiSpecMarkdown = (markdown) => {
  if (!isApiSpecMarkdown(markdown)) {
    throw new Error('INVALID_API_SPEC_MARKDOWN');
  }
};

const applyMarkdownSpec = (markdown) => {
  assertApiSpecMarkdown(markdown);
  isAuthPolicyScopeManuallySelected = false;
  clearValidationErrors();

  const basic = parseInfoTable(getMarkdownSection(markdown, '기본 정보'));
  const auth = parseInfoTable(getMarkdownSection(markdown, '인증 / 권한'));
  const title = blankIfPlaceholder(markdown.match(/^#\s+(.+)$/m)?.[1] || '');

  const headers = parseRowsByHeaders(getMarkdownSection(markdown, 'Headers'), [
    ['key', 'Key'],
    ['value', ['Value', 'Value 예시']],
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
  const pathParts = parsePathPartsFromMarkdown(basic.Path, basic['하분류'] || basic['Swagger Tag'], normalPathParams);
  const authRequired = blankIfPlaceholder(auth['인증 필요 여부']) === '불필요' ? '불필요' : '필요';
  const authSchemeState = getAuthSchemeState(blankIfPlaceholder(auth['인증 방식']));

  form.reset();
  setFormValue('apiName', blankIfPlaceholder(basic['API 이름']) || title);
  setFormValue('method', normalizeLoadedMethod(blankIfPlaceholder(basic.Method)));
  setFormValue('pathBase', pathParts.pathBase);
  setFormValue('pathVersion', pathParts.pathVersion);
  setFormValue('pathSwaggerTag', pathParts.pathSwaggerTag);
  setFormValue('pathAction', pathParts.pathAction);
  setFormValue('purpose', blankIfPlaceholder(basic['목적']));
  isAuthPolicyScopeManuallySelected = Boolean(selectAuthPolicyScopeByValue(auth['적용 범위'] || auth['권한 적용 범위']));
  setFormValue('authRequired', authRequired);
  setFormValue('authScheme', authSchemeState.scheme);
  setFormValue('authSchemeCustom', authSchemeState.custom);
  const markdownRoles = parseCsvValues(auth['접근 가능 Role']);
  const authPolicyScopeOption = getSelectedAuthPolicyScopeOption();
  renderAuthRoles(createAuthRoleItemsWithCatalog(markdownRoles, authPolicyScopeOption.path), {
    scopePath: authPolicyScopeOption.path,
  });
  setFormValue('permissionRules', blankIfPlaceholder(auth['권한 규칙']));

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

  syncHeaderRowsWithControls();
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
  const authRequired = isAuthRequired() ? '필요' : '불필요';
  const authPolicyScopeOption = isAuthRequired() ? getSelectedAuthPolicyScopeOption() : null;
  const authPolicyScopePath = authPolicyScopeOption?.path || buildApiPath();
  const roles = authRequired === '필요' ? getSelectedAuthRolesForScope(authPolicyScopePath) : [];
  const apiName = input('apiName') || '미정';
  const method = input('method') || 'POST';
  const path = buildPathParamPreview();
  const subCategory = buildSubCategory();
  const authScheme = authRequired === '필요' ? getEffectiveAuthScheme() : '해당 없음';
  const authPolicyScopeText = authPolicyScopeOption?.enabled
    ? `${authPolicyScopeOption.label} (${authPolicyScopeOption.value}: ${authPolicyScopeOption.path})`
    : '해당 없음';
  const roleText = authRequired === '필요' ? roles.join(', ') || '없음' : '해당 없음';
  const permissionRules = authRequired === '필요' ? input('permissionRules') || '미정' : '해당 없음';
  const headerRows = buildHeaderRowsForMarkdown({ authRequired, authScheme, method });

  return `# ${apiName}

## 1. 기본 정보

| 항목 | 내용 |
|---|---|
| API 이름 | ${escapePipes(apiName)} |
| Path | \`${escapePipes(path)}\` |
| Method | \`${escapePipes(method)}\` |
| 목적 | ${escapePipes(input('purpose') || '미정')} |
| 하분류 | \`${escapePipes(subCategory)}\` |

## 2. 인증 / 권한

| 항목 | 내용 |
|---|---|
| 인증 필요 여부 | ${escapePipes(authRequired)} |
| 인증 방식 | ${escapePipes(authScheme)} |
| 적용 범위 | ${escapePipes(authPolicyScopeText)} |
| 접근 가능 Role | ${escapePipes(roleText)} |
| 권한 규칙 | ${escapePipes(permissionRules)} |

## 3. Headers

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'value', label: 'Value' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'description', label: '설명' },
    ],
    headerRows,
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
  `;
};

const serializeCurrentFileForDraft = (file) => {
  if (!file?.origin || !file.path) return null;
  if (file.origin === 'browser-file') return null;

  return {
    origin: file.origin,
    path: file.path,
    displayPath: file.displayPath || '',
    fileName: file.fileName || '',
    saveDir: file.saveDir || '',
    authPolicyPath: file.authPolicyPath || buildApiPath(),
  };
};

const normalizeDraftCurrentFile = (file) => {
  if (!file || typeof file !== 'object' || Array.isArray(file)) return null;

  const origin = String(file.origin || '').trim();
  const path = String(file.path || '').trim();
  if (!origin || !path) return null;
  if (origin === 'browser-file') return null;

  return {
    origin,
    path,
    displayPath: String(file.displayPath || '').trim(),
    fileName: String(file.fileName || '').trim(),
    saveDir: String(file.saveDir || '').trim(),
    authPolicyPath: String(file.authPolicyPath || '').trim(),
  };
};

const saveDraft = () => {
  const currentFile = serializeCurrentFileForDraft(state.currentFile) || state.pendingCurrentFileMeta;
  if (!currentFile) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentFile }));
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

const refresh = (options = {}) => {
  const { shouldSaveDraft = true } = options;
  const fileLocationReady = isFileLocationReady();
  const canOverwriteCurrentFile = fileLocationReady && Boolean(state.currentFile);
  const canDeleteCurrentFile = isDeletableCurrentFile();
  form?.classList.toggle('is-file-location-unset', !fileLocationReady);
  if (!fileLocationReady) {
    setPreviewOpen(false);
  }
  if (previewToggleButton) previewToggleButton.disabled = !fileLocationReady;
  if (resetButton) resetButton.disabled = !fileLocationReady;
  if (deleteDocumentButton) {
    deleteDocumentButton.disabled = !canDeleteCurrentFile;
    deleteDocumentButton.title = canDeleteCurrentFile ? '현재 열린 파일을 완전히 삭제' : '현재 열린 파일이 있을 때 사용할 수 있습니다.';
  }
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
  renderAuthPolicyScopes();
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
  if (shouldSaveDraft) saveDraft();
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
  const nextValues = { ...values };
  if (AUTO_EXAMPLE_ROW_TYPES.has(type)) {
    applyAutoExampleForRow(nextValues);
  }
  getMutableRows(type).splice(insertIndex, 0, nextValues);
  renderRows(type);
  refresh();
  if (options.focusNewRow) {
    focusFirstInputInRow(type, insertIndex);
  }
};

const findHeaderRowIndexByKey = (key) =>
  (state.rows.headers || []).findIndex((row) => normalizeHeaderKey(row.key) === normalizeHeaderKey(key));

const addHeaderPreset = (key) => {
  const preset = getHeaderPreset(key);
  if (!preset) return;

  syncHeaderRowsWithControls();
  const existingIndex = findHeaderRowIndexByKey(preset.key);
  if (existingIndex >= 0) {
    renderRows('headers');
    focusFirstInputInRow('headers', existingIndex);
    setStatus(`${preset.key} 헤더가 이미 있습니다.`);
    return;
  }

  state.rows.headers.push({ ...preset });
  renderRows('headers');
  refresh();
  focusFirstInputInRow('headers', state.rows.headers.length - 1);
  setStatus(`${preset.key} 헤더 추가됨`);
};

const getErrorPreset = (id) => {
  const [status, code] = String(id ?? '').split(':');
  return ERROR_RESPONSE_PRESETS.find((preset) => preset.status === status && preset.code === code);
};

const findErrorRowIndex = (preset) =>
  (state.rows.errors || []).findIndex((row) => row.status === preset.status && row.code === preset.code);

const addErrorPreset = (id) => {
  const preset = getErrorPreset(id);
  if (!preset) return;

  const existingIndex = findErrorRowIndex(preset);
  if (existingIndex >= 0) {
    focusFirstInputInRow('errors', existingIndex);
    setStatus(`${preset.status} ${preset.code} 에러가 이미 있습니다.`);
    return;
  }

  state.rows.errors.push({ ...preset });
  renderRows('errors');
  refresh();
  focusFirstInputInRow('errors', state.rows.errors.length - 1);
  setStatus(`${preset.status} ${preset.code} 에러 추가됨`);
};

const updateRow = (type, index, key, value) => {
  const rows = getMutableRows(type);
  if (type === 'headers' && isAutomaticHeaderRow(rows[index])) {
    delete rows[index][AUTO_HEADER_FIELD];
  }
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
  if (AUTO_EXAMPLE_ROW_TYPES.has(type)) {
    if (key === 'example') {
      rows[index][EXAMPLE_TOUCHED_FIELD] = true;
      delete rows[index][AUTO_EXAMPLE_FIELD];
    }
    if (key === 'type') {
      applyAutoExampleForRow(rows[index]);
    }
  }
  refresh();
  return rows[index];
};

const removeRow = (type, index) => {
  if (type === 'actionPathParams') {
    const row = state.rows.actionPathParams[index];
    removeActionPathParam(row?.pathKey || row?.key);
    return;
  }
  getMutableRows(type).splice(index, 1);
  if (type === 'headers') {
    syncHeaderRowsWithControls();
  }
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
      inputElement.dataset.fieldKey = key;
      inputElement.addEventListener('input', (event) => {
        if (type === 'actionPathParams') {
          event.stopPropagation();
        }
        const updatedRow = updateRow(type, index, key, inputElement.value);
        if (AUTO_EXAMPLE_ROW_TYPES.has(type) && key === 'type' && updatedRow?.[AUTO_EXAMPLE_FIELD]) {
          const exampleInput = rowElement.querySelector('input[data-field-key="example"]');
          if (exampleInput) exampleInput.value = updatedRow.example || '';
        }
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
  fileButton.title = node.name;
  fileButton.dataset.path = node.path;

  const method = normalizeFileTreeMethod(node.method);
  if (method) {
    const methodBadge = document.createElement('span');
    methodBadge.className = `file-tree-method file-tree-method-${getFileTreeMethodClassName(method)}`;
    methodBadge.textContent = method;
    fileButton.append(methodBadge);
  }

  const label = document.createElement('span');
  label.className = 'file-tree-file-label';
  label.textContent = node.label || node.name;
  fileButton.append(label);

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

    const method = normalizeFileTreeMethod(getMarkdownTableValue(basicSection, 'Method'));
    const segments = splitApiPath(pathValue);
    const swaggerTagSegments = splitApiPath(getSubCategoryTableValue(basicSection));
    const common = segments[0] || '/';
    const version = segments[1] || '/';
    const rawSwaggerTag = segments[2] || swaggerTagSegments[0] || '';
    const swaggerTag = isEmptySpecGroupValue(rawSwaggerTag) ? '' : rawSwaggerTag;
    const actionSegments = segments.slice(3);

    return {
      apiPath: normalizeAuthPolicyPath(pathValue),
      groups: [common, version, swaggerTag].filter(Boolean),
      label: actionSegments.length > 0 ? `/${actionSegments.join('/')}` : '/',
      method,
    };
  } catch {
    return {
      groups: ['양식 외', '미정', '미정'],
      label: fallbackName,
      method: '',
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
      method: file.method,
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

const createSessionId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getFolderSessionId = ({ create = false } = {}) => {
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

const openFolderHandleDb = () =>
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

const ensureBrowserReadPermission = async (handle) => {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  const options = { mode: 'read' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
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

const getBrowserEditorRootLabel = (workspaceDirectoryHandle) =>
  [
    workspaceDirectoryHandle?.name,
    VELDOC_WORKSPACE_DIR_NAME,
    API_EDITOR_DIR_NAME,
  ].filter(Boolean).join('/');

const getBrowserApiEditorDirectoryHandle = async (workspaceDirectoryHandle) => {
  const veldocDirectoryHandle = await workspaceDirectoryHandle.getDirectoryHandle(VELDOC_WORKSPACE_DIR_NAME, {
    create: true,
  });
  const apiDirectoryHandle = await veldocDirectoryHandle.getDirectoryHandle(API_EDITOR_DIR_NAME, {
    create: true,
  });
  return apiDirectoryHandle;
};

const readBrowserAuthPolicies = async () => {
  if (!state.browserDirectoryHandle) return createDefaultAuthPolicies();

  try {
    const policyFileHandle = await state.browserDirectoryHandle.getFileHandle(AUTH_POLICY_FILE_NAME);
    const policyFile = await policyFileHandle.getFile();
    return normalizeAuthPolicies(JSON.parse(await policyFile.text()));
  } catch {
    try {
      const legacyDirectoryHandle = await state.browserDirectoryHandle.getDirectoryHandle(LEGACY_AUTH_POLICY_DIRECTORY_NAME);
      const legacyFileHandle = await legacyDirectoryHandle.getFileHandle(LEGACY_AUTH_POLICY_FILE_NAME);
      const legacyFile = await legacyFileHandle.getFile();
      return normalizeAuthPolicies(JSON.parse(await legacyFile.text()));
    } catch {
      return createDefaultAuthPolicies();
    }
  }
};

const writeBrowserAuthPolicies = async (authPolicies) => {
  if (!state.browserDirectoryHandle) throw new Error('NO_BROWSER_FOLDER');
  if (!(await ensureBrowserWritePermission(state.browserDirectoryHandle))) {
    throw new Error('FILE_PERMISSION_DENIED');
  }

  const policyFileHandle = await state.browserDirectoryHandle.getFileHandle(AUTH_POLICY_FILE_NAME, { create: true });
  await writeBrowserFile(policyFileHandle, `${JSON.stringify(normalizeAuthPolicies(authPolicies), null, 2)}\n`);
};

const readServerAuthPolicies = async () => {
  try {
    const response = await fetch('/api/auth-policies');
    if (!response.ok) return createDefaultAuthPolicies();
    const result = await response.json();
    return normalizeAuthPolicies(result.authPolicies);
  } catch {
    return createDefaultAuthPolicies();
  }
};

const writeServerAuthPolicies = async (authPolicies) => {
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

const loadAuthPoliciesForOpenedFolder = async () => {
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

const writeAuthPoliciesForOpenedFolder = async (authPolicies) => {
  if (!state.fileTreeOpened) throw new Error('NO_OPENED_FOLDER');
  if (state.browserDirectoryHandle) {
    await writeBrowserAuthPolicies(authPolicies);
    return;
  }
  await writeServerAuthPolicies(authPolicies);
};

const syncAuthPoliciesWithOpenedFolder = async (options = {}) => {
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

const saveCurrentAuthPolicy = async () => {
  const scopeOption = getSelectedAuthPolicyScopeOption();
  if (!state.fileTreeOpened || !scopeOption?.enabled) return true;

  const nextPolicies = normalizeAuthPolicies(state.authPolicies);
  const nextPolicy = normalizeAuthPolicyRecord(collectAuthPolicyFromForm(scopeOption));
  if ((nextPolicy.roles || []).length > 0) {
    nextPolicies.policies[scopeOption.path] = nextPolicy;
  } else {
    delete nextPolicies.policies[scopeOption.path];
  }
  const { authPolicies } = pruneAuthPoliciesByFolderSpecFiles(nextPolicies);

  try {
    await writeAuthPoliciesForOpenedFolder(authPolicies);
    state.authPolicies = authPolicies;
    renderAuthPolicyScopes();
    return true;
  } catch {
    showErrorToast('권한 정책 저장 실패', `${AUTH_POLICY_FILE_NAME} 파일을 저장하지 못했습니다.`);
    return false;
  }
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

const readBrowserFileTree = async (directoryHandle, options = {}) => {
  const handles = new Map();
  const rootName = options.rootName || directoryHandle.name;
  const files = await collectBrowserMarkdownFiles(directoryHandle, { rootName, handles });
  return {
    tree: toGroupedFileTree(files),
    handles,
    apiPaths: normalizeFolderApiPaths(files.map((file) => file.apiPath).filter(Boolean)),
    specFiles: normalizeFolderSpecFiles(files),
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
  const rawSwaggerTag = segments[2] || getSubCategoryTableValue(basicSection);
  const swaggerTag = isEmptySpecGroupValue(rawSwaggerTag) ? '/' : rawSwaggerTag;
  const normalizedMethod = normalizeBasicApiMethod(getMarkdownTableValue(basicSection, 'Method'));

  return {
    fileName,
    relativePath,
    name: getMarkdownTableValue(basicSection, 'API 이름') || title || fileName,
    method: normalizedMethod,
    path: pathValue,
    commonPath: segments[0] || '/',
    versionPath: segments[1] || '/',
    purpose: getMarkdownTableValue(basicSection, '목적') || '미정',
    swaggerTag,
    authRequired: getMarkdownTableValue(authSection, '인증 필요 여부') || '미정',
    authScheme: getMarkdownTableValue(authSection, '인증 방식') || '미정',
    authPolicyScope: getMarkdownTableValue(authSection, '적용 범위') || '미정',
    roles: getMarkdownTableValue(authSection, '접근 가능 Role') || '미정',
    permissionRules: getMarkdownTableValue(authSection, '권한 규칙') || '미정',
    successStatus: primarySuccessResponse.status,
    successResponses,
    headers: parseRowsByHeaders(getMarkdownSection(markdown, 'Headers'), [
      ['key', 'Key'],
      ['value', ['Value', 'Value 예시']],
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

  const rootName = state.browserEditorRootLabel || rootHandle.name;
  const files = await collectBrowserMarkdownFiles(rootHandle, { rootName, handles: new Map() });
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
    rootName,
    rootPath: localFileLabel(rootName),
    specs,
    invalidFiles,
    apiPaths: normalizeFolderApiPaths(files.map((file) => file.apiPath).filter(Boolean)),
    specFiles: normalizeFolderSpecFiles(files),
  };
};

const refreshBrowserFileTree = async () => {
  if (!state.browserDirectoryHandle) return null;
  const result = await readBrowserFileTree(state.browserDirectoryHandle, {
    rootName: state.browserEditorRootLabel || state.browserDirectoryHandle.name,
  });
  state.fileTreeHandles = result.handles;
  state.folderApiPaths = normalizeFolderApiPaths(result.apiPaths);
  state.folderSpecFiles = normalizeFolderSpecFiles(result.specFiles);
  renderFileTree(result.tree);
  return result;
};

const applyFileTreePayload = (result) => {
  if (!result) return;
  if (Array.isArray(result.apiPaths)) {
    state.folderApiPaths = normalizeFolderApiPaths(result.apiPaths);
  }
  if (Array.isArray(result.specFiles)) {
    state.folderSpecFiles = normalizeFolderSpecFiles(result.specFiles);
  }
  if (Array.isArray(result.tree)) {
    renderFileTree(result.tree);
  }
};

const refreshOpenedFileTree = async () => {
  if (!state.fileTreeOpened) return null;
  if (state.browserDirectoryHandle) return refreshBrowserFileTree();

  const response = await fetch('/api/current-tree-root');
  if (!response.ok) return null;

  const result = await response.json();
  if (!result.opened) return null;

  applyOpenedFolder(result, {
    clearFile: false,
    focusLocation: false,
    updateStatus: false,
  });
  return result;
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
    createSpecChip('하분류', spec.swaggerTag),
    createSpecChip('인증', authText),
    createSpecChip('범위', spec.authPolicyScope),
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
    showWarningToast('뷰어를 열 수 없음', '홈에서 먼저 API 명세서 폴더를 열어주세요.');
    setStatus('뷰어 열기 실패');
    return;
  }

  setViewTransitionSkeleton(true, 'viewer');
  try {
    await refreshOpenedFileTree();
    await loadAuthPoliciesForOpenedFolder();
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
    if (Array.isArray(result.apiPaths)) {
      state.folderApiPaths = normalizeFolderApiPaths(result.apiPaths);
      state.folderSpecFiles = normalizeFolderSpecFiles(result.specFiles);
      await syncAuthPoliciesWithOpenedFolder();
    }
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
  state.pendingCurrentFileMeta = null;
  state.currentFile = {
    ...file,
    authPolicyPath: file.authPolicyPath || buildApiPath(),
  };
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
  state.pendingCurrentFileMeta = null;
  state.activeTreeFilePath = '';
  markActiveTreeFile();
};

const loadDraft = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);
    state.pendingCurrentFileMeta = normalizeDraftCurrentFile(draft.currentFile);
    if (state.pendingCurrentFileMeta) {
      state.saveDir = '';
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const saveMarkdown = async () => {
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

const saveMarkdownAsNew = async () => {
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

const deleteAuthPolicyForPath = async (path) => {
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

const resetEditorAfterFileDelete = () => {
  setSpecViewerMode(false);
  isAuthPolicyScopeManuallySelected = false;
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

const deleteBrowserCurrentFile = async (file) => {
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

const deleteServerCurrentFile = async (file) => {
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

const deleteCurrentDocument = async () => {
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

const openTreeMarkdownFile = async (path, fileName) => {
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

const readServerCurrentFile = async (fileMeta) => {
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

const showCurrentFileRestoredToast = (fileName = '문서') => {
  showToast('info', '새로고침', `${fileName}의 저장된 내용을 다시 불러왔습니다.`);
};

const reloadCurrentFileFromStorage = async (fileMeta = state.currentFile, options = {}) => {
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

const reloadCurrentFileAfterSave = async () => {
  await reloadCurrentFileFromStorage(state.currentFile, {
    showToast: false,
    updateStatus: false,
    showFailureToast: false,
  });
};

const restorePendingCurrentFileConnection = async () => {
  const fileMeta = state.pendingCurrentFileMeta;
  if (!fileMeta) return false;

  return reloadCurrentFileFromStorage(fileMeta);
};

const redirectToHomeForWorkspace = () => {
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

const restoreBrowserOpenedFolder = async () => {
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

const restoreOpenedFolder = async () => {
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
  isAuthPolicyScopeManuallySelected = false;
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

const createNewDocument = () => {
  setSpecViewerMode(false);
  isAuthPolicyScopeManuallySelected = false;
  form.reset();
  clearSuccessStatusError();
  state.rows = structuredClone(defaultRows);
  state.successResponses = structuredClone(defaultSuccessResponses);
  state.activeSuccessResponseIndex = 0;
  clearCurrentFile();
  renderAuthRoles();
  syncHeaderRowsWithControls();
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

authRequiredToggle?.addEventListener('click', () => {
  form.elements.authRequired.value = isAuthRequired() ? '불필요' : '필요';
  syncHeaderRowsAndRefresh();
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
  isAuthPolicyScopeManuallySelected = true;
  syncAuthRolesForSelectedScope();
  refresh({ shouldSaveDraft: false });
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
  if (target instanceof Element && target.closest('#saveSplitButton')) return;
  closeActionDropdowns();
});

form.elements.pathAction?.addEventListener('input', () => {
  clearFileNameConflictError();
  if (isSyncingActionPathParamKey) return;
  renderActionPathParams();
  syncAuthRolesForSelectedScope();
});
form.elements.apiName?.addEventListener('input', () => clearValidationFieldError('apiName'));
['pathBase', 'pathVersion', 'pathSwaggerTag'].forEach((name) => {
  form.elements[name]?.addEventListener('input', () => {
    clearFileNameConflictError();
    syncAuthRolesForSelectedScope();
  });
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
helpButton?.addEventListener('click', () => setHelpDialogOpen(true));
helpDialogCloseButton?.addEventListener('click', () => setHelpDialogOpen(false));
helpDialog?.addEventListener('click', (event) => {
  if (event.target === helpDialog) setHelpDialogOpen(false);
});
helpTopicButtons.forEach((button) => {
  button.addEventListener('click', () => setHelpTopic(button.dataset.helpTopic));
});

const togglePreviewPanel = () => {
  const isOpen = !appShell?.classList.contains('preview-closed');
  setPreviewOpen(!isOpen);
};

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

    if (isSaveShortcutRunning) return;
    isSaveShortcutRunning = true;
    saveMarkdown().finally(() => {
      isSaveShortcutRunning = false;
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
previewToggleButton?.addEventListener('click', togglePreviewPanel);
resetButton.addEventListener('click', resetForm);
deleteDocumentButton?.addEventListener('click', deleteCurrentDocument);
newDocumentButton?.addEventListener('click', createNewDocument);
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
restoreSideMenuWidth();
syncFilePanelLayoutMode();
loadDraft();
syncHeaderRowsWithControls();
Object.keys(rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(renderRows);
renderSuccessStatusTabs();
renderActionPathParams();
refresh();
restoreOpenedFolder();
window.requestAnimationFrame(() => scrollPageToTop('auto'));
