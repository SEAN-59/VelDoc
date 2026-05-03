export const STORAGE_KEY = 'veldoc-draft';
export const FOLDER_SESSION_KEY = 'veldoc-opened-folder-session';
export const FOLDER_HANDLE_DB_NAME = 'veldoc-session-folders';
export const FOLDER_HANDLE_STORE_NAME = 'folders';
export const HOME_TOAST_SESSION_KEY = 'veldoc-home-toast';
export const VELDOC_WORKSPACE_DIR_NAME = 'veldoc';
export const API_EDITOR_DIR_NAME = 'api';
export const HOME_PAGE_URL = '../home.html';
export const WORKSPACE_REQUIRED_NOTICE = 'workspace-required';
export const BASIC_API_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
export const BASIC_API_METHOD_SET = new Set(BASIC_API_METHODS);
export const BODY_API_METHOD_SET = new Set(['POST', 'PUT', 'PATCH']);
export const CUSTOM_AUTH_SCHEME = 'Custom';
export const AUTH_SCHEMES = ['JWT Bearer', 'API Key', 'OAuth 2.0', 'Cookie Session'];
export const AUTH_SCHEME_SET = new Set(AUTH_SCHEMES);
export const AUTH_POLICY_FILE_NAME = 'veldoc-auth-policies.json';
export const AUTH_POLICY_VERSION = 2;
export const AUTH_POLICY_SCOPES = [
  { value: 'root', label: '주소', segmentCount: 0 },
  { value: 'base', label: '대분류', segmentCount: 1 },
  { value: 'middle', label: '중분류', segmentCount: 2 },
  { value: 'subCategory', label: '소분류', segmentCount: 3 },
  { value: 'action', label: '동작', segmentCount: Number.POSITIVE_INFINITY },
];
export const AUTH_POLICY_SCOPE_SET = new Set(AUTH_POLICY_SCOPES.map((scope) => scope.value));
export const AUTO_HEADER_FIELD = '__veldocAutoHeader';
export const AUTO_EXAMPLE_FIELD = '__veldocAutoExample';
export const EXAMPLE_TOUCHED_FIELD = '__veldocExampleTouched';
export const AUTO_EXAMPLE_ROW_TYPES = new Set([
  'pathParams',
  'actionPathParams',
  'queryParams',
  'bodyFields',
  'responseFields',
]);
export const ERROR_STATE_CLEAR_DELAY_MS = 1500;

export const rowDefinitions = {
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

export const HEADER_PRESETS = [
  { key: 'Authorization', value: 'Bearer {token}', required: 'Y', description: '로그인 인증', risk: '아무나 API 호출 가능' },
  { key: 'Cookie', value: 'session={sessionId}', required: 'Y', description: '로그인 인증', risk: '로그인 세션 전달 불가' },
  { key: 'Content-Type', value: 'application/json', required: 'Y', description: 'Body 파싱', risk: '서버가 JSON을 읽지 못함' },
  { key: 'X-CSRF-Token', value: '{csrfToken}', required: 'Y', description: 'CSRF 방어', risk: '로그인 상태 악용 가능' },
  { key: 'Idempotency-Key', value: '{idempotencyKey}', required: 'Y', description: '중복 요청 방지', risk: '결제나 처리 요청 중복 가능' },
  { key: 'X-Request-Id', value: '{requestId}', required: 'Y', description: '요청 추적', risk: '장애 분석 어려움' },
  { key: 'Origin', value: 'https://example.com', required: 'Y', description: 'CORS 보안', risk: '타 사이트 호출 제어 어려움' },
  { key: 'User-Agent', value: 'VelDoc-Client/1.0', required: 'Y', description: '통계/보안', risk: '봇 탐지와 통계 분석 어려움' },
];

export const ERROR_RESPONSE_PRESETS = [
  { status: '400', code: 'BAD_REQUEST', message: '요청 값이 올바르지 않습니다.', condition: '필수 값 누락 또는 타입 오류' },
  { status: '401', code: 'UNAUTHORIZED', message: '로그인이 필요합니다.', condition: '토큰 없음 또는 만료' },
  { status: '403', code: 'FORBIDDEN', message: '접근 권한이 없습니다.', condition: 'Role 권한 부족' },
  { status: '404', code: 'NOT_FOUND', message: '데이터를 찾을 수 없습니다.', condition: '대상 리소스 없음' },
  { status: '409', code: 'CONFLICT', message: '요청이 현재 상태와 충돌합니다.', condition: '중복 요청 또는 상태 충돌' },
  { status: '500', code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.', condition: '예외 발생' },
];

export const SIDE_MENU_WIDTH_KEY = 'veldoc-side-menu-width';
export const SIDE_MENU_MIN_WIDTH = 176;
export const SIDE_MENU_MAX_WIDTH = 280;
export const SIDE_MENU_DEFAULT_WIDTH = 280;
export const SIDE_MENU_SNAP_RANGE = 18;
export const SIDE_MENU_COLLAPSE_WIDTH = 134;
export const SIDE_MENU_NARROW_WIDTH = 212;
export const COMPACT_FILE_PANEL_QUERY = '(max-width: 1180px)';

export const applyScrollRestorationSetting = () => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
};

export const getConfigRuntime = () => ({
  STORAGE_KEY,
  FOLDER_SESSION_KEY,
  FOLDER_HANDLE_DB_NAME,
  FOLDER_HANDLE_STORE_NAME,
  HOME_TOAST_SESSION_KEY,
  VELDOC_WORKSPACE_DIR_NAME,
  API_EDITOR_DIR_NAME,
  HOME_PAGE_URL,
  WORKSPACE_REQUIRED_NOTICE,
  BASIC_API_METHODS,
  BASIC_API_METHOD_SET,
  BODY_API_METHOD_SET,
  CUSTOM_AUTH_SCHEME,
  AUTH_SCHEMES,
  AUTH_SCHEME_SET,
  AUTH_POLICY_FILE_NAME,
  AUTH_POLICY_VERSION,
  AUTH_POLICY_SCOPES,
  AUTH_POLICY_SCOPE_SET,
  AUTO_HEADER_FIELD,
  AUTO_EXAMPLE_FIELD,
  EXAMPLE_TOUCHED_FIELD,
  AUTO_EXAMPLE_ROW_TYPES,
  ERROR_STATE_CLEAR_DELAY_MS,
  rowDefinitions,
  HEADER_PRESETS,
  ERROR_RESPONSE_PRESETS,
  SIDE_MENU_WIDTH_KEY,
  SIDE_MENU_MIN_WIDTH,
  SIDE_MENU_MAX_WIDTH,
  SIDE_MENU_DEFAULT_WIDTH,
  SIDE_MENU_SNAP_RANGE,
  SIDE_MENU_COLLAPSE_WIDTH,
  SIDE_MENU_NARROW_WIDTH,
  COMPACT_FILE_PANEL_QUERY,
});
