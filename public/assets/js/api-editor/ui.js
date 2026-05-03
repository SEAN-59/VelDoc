import { createDialogRuntime } from './ui/dialog.js';
import { createDropdownRuntime } from './ui/dropdown.js';
import { createHelpRuntime } from './ui/help.js';
import { createLoadingRuntime } from './ui/loading.js';
import { createSideMenuRuntime } from './ui/side_menu.js';
import { createToastRuntime } from './ui/toast.js';

export const createUiRuntime = (ctx) => {
  const {
    documentEmptyState,
    folderViewerButton,
    form,
    isFileLocationReady,
    specViewer,
    state,
    statusText,
    workspace,
    workspaceTitle,
  } = ctx;

  const runtime = {};
  const attach = (partial) => {
    Object.assign(runtime, partial);
    Object.assign(ctx, partial);
  };

  function setStatus(message) {
    statusText.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      statusText.textContent = '자동 저장됨';
    }, 1800);
  }

  const scrollPageToTop = (behavior = 'smooth') => {
    if (behavior === 'smooth') {
      window.scrollTo({ top: 0, left: 0, behavior });
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  attach({
    scrollPageToTop,
    setStatus,
  });
  attach(createLoadingRuntime(ctx));
  attach(createToastRuntime(ctx));
  attach(createDialogRuntime(ctx));
  attach(createDropdownRuntime(ctx));
  attach(createHelpRuntime(ctx));
  attach(createSideMenuRuntime(ctx));

  const setSpecViewerMode = (isOpen) => {
    state.viewerMode = isOpen;
    if (isOpen) ctx.clearSuccessStatusError?.();
    form.hidden = isOpen || (isFileLocationReady() && !state.hasActiveDocument);
    documentEmptyState.hidden = isOpen || !isFileLocationReady() || state.hasActiveDocument;
    if (specViewer) specViewer.hidden = !isOpen;
    workspace?.classList.toggle('viewer-mode', isOpen);
    folderViewerButton?.classList.toggle('active', isOpen);
    folderViewerButton?.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    if (workspaceTitle) workspaceTitle.textContent = isOpen ? 'API 명세서 뷰어' : 'API 명세서 작성기';
    if (isOpen) ctx.setPreviewOpen(false);
  };

  attach({
    setSpecViewerMode,
  });

  return runtime;
};
