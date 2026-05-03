export const createDefaultRows = (errorResponsePresets) => ({
  headers: [{ required: 'Y' }],
  pathParams: [],
  actionPathParams: [],
  queryParams: [],
  bodyFields: [],
  responseFields: [],
  errors: errorResponsePresets.slice(0, 4).map((preset) => ({ ...preset })),
});

export const createDefaultSuccessResponses = () => [{ status: '200', fields: [] }];

export const createEditorState = ({
  defaultRows,
  defaultSuccessResponses,
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
  isSaveShortcutRunning: false,
  isAuthPolicyScopeManuallySelected: false,
  transientErrorClearTimer: null,
});

export const createStateRuntime = ({
  ERROR_RESPONSE_PRESETS,
  SIDE_MENU_DEFAULT_WIDTH,
  AUTH_POLICY_VERSION,
}) => {
  const defaultRows = createDefaultRows(ERROR_RESPONSE_PRESETS);
  const defaultSuccessResponses = createDefaultSuccessResponses();

  return {
    defaultRows,
    defaultSuccessResponses,
    state: createEditorState({
      defaultRows,
      defaultSuccessResponses,
      sideMenuDefaultWidth: SIDE_MENU_DEFAULT_WIDTH,
      authPolicyVersion: AUTH_POLICY_VERSION,
    }),
    ...createEditorTransientFlags(),
  };
};
