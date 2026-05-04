export const createDefaultRows = () => ({
  headers: [{ required: 'Y' }],
  pathParams: [],
  actionPathParams: [],
  queryParams: [],
  bodyFields: [],
  responseFields: [],
  errorFields: [],
  errors: [],
});

export const createDefaultSuccessFields = () => [
  {
    parentKey: '',
    key: 'requestId',
    type: 'string',
    nullable: 'N',
    example: 'req_123456',
    description: '요청 추적 ID',
  },
];

export const createDefaultSuccessResponses = () => [{ status: '200', fields: createDefaultSuccessFields() }];

export const createDefaultErrorFields = (preset = {}) => [
  {
    parentKey: '',
    key: 'requestId',
    type: 'string',
    nullable: 'N',
    example: 'req_123456',
    description: '요청 추적 ID',
  },
  {
    parentKey: '',
    key: 'code',
    type: 'string',
    nullable: 'N',
    example: preset.code || 'BAD_REQUEST',
    description: '에러 코드',
  },
  {
    parentKey: '',
    key: 'message',
    type: 'string',
    nullable: 'N',
    example: preset.message || '요청 값이 올바르지 않습니다.',
    description: '에러 메시지',
  },
  {
    parentKey: '',
    key: 'errors',
    type: 'object[]',
    nullable: 'Y',
    example: '[]',
    description: '상세 오류 목록',
  },
  {
    parentKey: 'errors',
    key: 'field',
    type: 'string',
    nullable: 'Y',
    example: 'example',
    description: '오류 필드',
  },
  {
    parentKey: 'errors',
    key: 'reason',
    type: 'string',
    nullable: 'Y',
    example: 'example',
    description: '오류 사유',
  },
];

export const createDefaultErrorResponses = (errorResponsePresets) =>
  errorResponsePresets.slice(0, 4).map((preset) => ({
    ...preset,
    fields: createDefaultErrorFields(preset),
  }));

export const createEditorState = ({
  defaultRows,
  defaultSuccessResponses,
  defaultErrorResponses,
  sideMenuDefaultWidth,
  authPolicyVersion,
}) => ({
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
  hasActiveDocument: false,
  fileTreeOpened: false,
  sideMenuWidth: sideMenuDefaultWidth,
  sideMenuHidden: false,
  fileDrawerOpen: false,
  successResponses: structuredClone(defaultSuccessResponses),
  activeSuccessResponseIndex: 0,
  errorResponses: structuredClone(defaultErrorResponses),
  activeErrorResponseIndex: 0,
  viewerCommon: '',
  viewerVersion: '',
  pendingCurrentFileMeta: null,
  authPolicies: {
    version: authPolicyVersion,
    policies: {},
  },
  authSelectedRoles: [],
  authSelectedRoleOrigins: {},
  authRoleVisibleScopePath: '',
});

export const createEditorTransientFlags = () => ({
  isSyncingActionPathParamKey: false,
  messageDialogReturnFocus: null,
  messageDialogResolver: null,
  messageDialogMode: 'alert',
  sideMenuResizeState: null,
  successStatusPreviousValue: '200',
  successStatusDragState: null,
  errorStatusPreviousValue: '400',
  errorStatusDragState: null,
  isSaveShortcutRunning: false,
  isAuthPolicyScopeManuallySelected: false,
  transientErrorClearTimer: null,
});

export const createStateRuntime = ({
  ERROR_RESPONSE_PRESETS,
  SIDE_MENU_DEFAULT_WIDTH,
  AUTH_POLICY_VERSION,
}) => {
  const defaultRows = createDefaultRows();
  const defaultSuccessResponses = createDefaultSuccessResponses();
  const defaultErrorResponses = createDefaultErrorResponses(ERROR_RESPONSE_PRESETS);

  return {
    createDefaultSuccessFields,
    createDefaultErrorFields,
    defaultRows,
    defaultSuccessResponses,
    defaultErrorResponses,
    state: createEditorState({
      defaultRows,
      defaultSuccessResponses,
      defaultErrorResponses,
      sideMenuDefaultWidth: SIDE_MENU_DEFAULT_WIDTH,
      authPolicyVersion: AUTH_POLICY_VERSION,
    }),
    ...createEditorTransientFlags(),
  };
};
