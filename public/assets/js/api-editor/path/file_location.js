export const createPathFileLocationRuntime = (ctx) => {
  const { state } = ctx;

  const buildFileNameFromPath = (...args) => ctx.buildFileNameFromPath(...args);

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

  return {
    hasSaveDir,
    isBrowserFileSystemSupported,
    isBrowserFileSystemFile,
    isDeletableCurrentFile,
    isMarkdownFileName,
    localFileLabel,
    buildFileLocation,
    isFileLocationReady,
  };
};
