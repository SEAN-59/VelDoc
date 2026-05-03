export const createDraftRuntime = (ctx) => {
  const {
    STORAGE_KEY,
    state,
  } = ctx;

  const buildApiPath = (...args) => ctx.buildApiPath(...args);

  let
    serializeCurrentFileForDraft,
    normalizeDraftCurrentFile,
    saveDraft,
    isReloadNavigation,
    resizeJsonPreview,
    loadDraft;

  
  ctx.serializeCurrentFileForDraft = serializeCurrentFileForDraft = (file) => {
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

  
  ctx.normalizeDraftCurrentFile = normalizeDraftCurrentFile = (file) => {
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

  
  ctx.saveDraft = saveDraft = () => {
  const currentFile = serializeCurrentFileForDraft(state.currentFile) || state.pendingCurrentFileMeta;
  if (!currentFile) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentFile }));
  };

  
  ctx.isReloadNavigation = isReloadNavigation = () => {
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  if (navigationEntry?.type) return navigationEntry.type === 'reload';
  return performance.navigation?.type === performance.navigation?.TYPE_RELOAD;
  };

  
  ctx.resizeJsonPreview = resizeJsonPreview = (textarea) => {
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

  
  ctx.loadDraft = loadDraft = () => {
  if (!isReloadNavigation()) {
    state.pendingCurrentFileMeta = null;
    return;
  }

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

  return {
    serializeCurrentFileForDraft,
    normalizeDraftCurrentFile,
    saveDraft,
    isReloadNavigation,
    resizeJsonPreview,
    loadDraft,
  };
};
