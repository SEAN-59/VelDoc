export const disableBrowserTextAssist = (element) => {
  element.setAttribute('autocomplete', 'off');
  element.setAttribute('autocapitalize', 'none');
  element.setAttribute('autocorrect', 'off');
  element.setAttribute('spellcheck', 'false');
  element.setAttribute('data-1p-ignore', 'true');
  element.setAttribute('data-lpignore', 'true');
  element.setAttribute('data-form-type', 'other');
};

export const getEditorDom = () => ({
  form: document.querySelector('#specForm'),
  appShell: document.querySelector('#appShell'),
  sideMenu: document.querySelector('#sideMenu'),
  sideMenuResizer: document.querySelector('#sideMenuResizer'),
  workspace: document.querySelector('.workspace'),
  workspaceTitle: document.querySelector('#workspaceTitle'),
  preview: document.querySelector('#preview'),
  previewPanel: document.querySelector('#previewPanel'),
  statusText: document.querySelector('#statusText'),
  saveButton: document.querySelector('#saveButton'),
  saveOverwriteButton: document.querySelector('#saveOverwriteButton'),
  saveNewButton: document.querySelector('#saveNewButton'),
  copyButton: document.querySelector('#copyButton'),
  previewToggleButton: document.querySelector('#previewToggleButton'),
  resetButton: document.querySelector('#resetButton'),
  deleteDocumentButton: document.querySelector('#deleteDocumentButton'),
  newDocumentButton: document.querySelector('#newDocumentButton'),
  saveMenuButton: document.querySelector('#saveMenuButton'),
  saveDropdown: document.querySelector('#saveDropdown'),
  helpButton: document.querySelector('#helpButton'),
  helpDialog: document.querySelector('#helpDialog'),
  helpDialogCloseButton: document.querySelector('#helpDialogCloseButton'),
  helpTopicButtons: [...document.querySelectorAll('[data-help-topic]')],
  helpSections: [...document.querySelectorAll('[data-help-section]')],
  pageLoadingOverlay: document.querySelector('#pageLoadingOverlay'),
  pageLoadingText: document.querySelector('#pageLoadingText'),
  messageDialog: document.querySelector('#messageDialog'),
  messageDialogTitle: document.querySelector('#messageDialogTitle'),
  messageDialogBody: document.querySelector('#messageDialogBody'),
  messageDialogCancelButton: document.querySelector('#messageDialogCancelButton'),
  messageDialogCloseButton: document.querySelector('#messageDialogCloseButton'),
  toastContainer: document.querySelector('#toastContainer'),
  menuButton: document.querySelector('#menuButton'),
  floatingMenu: document.querySelector('#floatingMenu'),
  menuBackdrop: document.querySelector('#menuBackdrop'),
  filePanelBackdrop: document.querySelector('#filePanelBackdrop'),
  filePanelRail: document.querySelector('#filePanelRail'),
  topButton: document.querySelector('#topButton'),
  folderViewerButton: document.querySelector('#folderViewerButton'),
  fileTree: document.querySelector('#fileTree'),
  fileTreeRoot: document.querySelector('#fileTreeRoot'),
  specViewer: document.querySelector('#specViewer'),
  specViewerRoot: document.querySelector('#specViewerRoot'),
  specViewerCount: document.querySelector('#specViewerCount'),
  specViewerFilters: document.querySelector('#specViewerFilters'),
  specCommonTabs: document.querySelector('#specCommonTabs'),
  specVersionTabs: document.querySelector('#specVersionTabs'),
  specViewerNote: document.querySelector('#specViewerNote'),
  specViewerList: document.querySelector('#specViewerList'),
  specViewerEmpty: document.querySelector('#specViewerEmpty'),
  viewerTransitionSkeleton: document.querySelector('#viewerTransitionSkeleton'),
  documentEmptyState: document.querySelector('#documentEmptyState'),
  emptyNewDocumentButton: document.querySelector('#emptyNewDocumentButton'),
  pathPreview: document.querySelector('#pathPreview'),
  fileNamePreview: document.querySelector('#fileNamePreview'),
  pathGrid: document.querySelector('.path-grid'),
  fileLocationPreview: document.querySelector('#fileLocationPreview'),
  paramsPathPreview: document.querySelector('#paramsPathPreview'),
  queryPathPreview: document.querySelector('#queryPathPreview'),
  queryParamsSection: document.querySelector('#queryParamsSection'),
  bodySection: document.querySelector('#bodySection'),
  actionPathParamsPanel: document.querySelector('#actionPathParamsPanel'),
  actionPathParamsRows: document.querySelector('#actionPathParamsRows'),
  authTopGrid: document.querySelector('#authTopGrid'),
  authRequiredToggle: document.querySelector('#authRequiredToggle'),
  authDetails: document.querySelector('#authDetails'),
  authPolicyScopeField: document.querySelector('#authPolicyScopeField'),
  authPolicyScopeGrid: document.querySelector('#authPolicyScopeGrid'),
  authRoleGrid: document.querySelector('#authRoleGrid'),
  authRoleAddCard: document.querySelector('#authRoleAddCard'),
  authRoleAddButton: document.querySelector('#authRoleAddButton'),
  authRoleInput: document.querySelector('#authRoleInput'),
  successStatusTabs: document.querySelector('#successStatusTabs'),
  addSuccessStatusButton: document.querySelector('#addSuccessStatusButton'),
  successStatusError: document.querySelector('#successStatusError'),
  errorStatusTabs: document.querySelector('#errorStatusTabs'),
  addErrorStatusButton: document.querySelector('#addErrorStatusButton'),
  methodPickerGrid: document.querySelector('.method-picker-grid'),
});

export const initializeEditorDom = () => {
  const dom = getEditorDom();
  [...dom.form.querySelectorAll('input[type="text"], textarea')].forEach(disableBrowserTextAssist);
  return {
    ...dom,
    disableBrowserTextAssist,
  };
};
