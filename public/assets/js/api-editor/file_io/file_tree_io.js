export const createFileTreeIoRuntime = (ctx) => {
  const {
    fileLocationPreview,
    state,
  } = ctx;

  const buildApiPath = (...args) => ctx.buildApiPath(...args);
  const decodeMarkdownCell = (...args) => ctx.decodeMarkdownCell(...args);
  const extractJsonBlock = (...args) => ctx.extractJsonBlock(...args);
  const getDirectoryPath = (...args) => ctx.getDirectoryPath(...args);
  const getMarkdownSection = (...args) => ctx.getMarkdownSection(...args);
  const getMarkdownTableValue = (...args) => ctx.getMarkdownTableValue(...args);
  const getSpecGroupingFromMarkdown = (...args) => ctx.getSpecGroupingFromMarkdown(...args);
  const getSubCategoryTableValue = (...args) => ctx.getSubCategoryTableValue(...args);
  const isBrowserFileSystemFile = (...args) => ctx.isBrowserFileSystemFile(...args);
  const isEmptySpecGroupValue = (...args) => ctx.isEmptySpecGroupValue(...args);
  const isMarkdownFileName = (...args) => ctx.isMarkdownFileName(...args);
  const localFileLabel = (...args) => ctx.localFileLabel(...args);
  const markActiveTreeFile = (...args) => ctx.markActiveTreeFile(...args);
  const normalizeBasicApiMethod = (...args) => ctx.normalizeBasicApiMethod(...args);
  const normalizeFolderApiPaths = (...args) => ctx.normalizeFolderApiPaths(...args);
  const normalizeFolderSpecFiles = (...args) => ctx.normalizeFolderSpecFiles(...args);
  const normalizeSaveDir = (...args) => ctx.normalizeSaveDir(...args);
  const parseRowsByHeaders = (...args) => ctx.parseRowsByHeaders(...args);
  const parseViewerSuccessResponsesFromMarkdown = (...args) => ctx.parseViewerSuccessResponsesFromMarkdown(...args);
  const refresh = (...args) => ctx.refresh(...args);
  const renderFileTree = (...args) => ctx.renderFileTree(...args);
  const splitApiPath = (...args) => ctx.splitApiPath(...args);
  const toGroupedFileTree = (...args) => ctx.toGroupedFileTree(...args);
  const applyOpenedFolder = (...args) => ctx.applyOpenedFolder(...args);

  let
    collectBrowserMarkdownFiles,
    readBrowserFileTree,
    getBrowserSpecSummary,
    readBrowserSpecSummaries,
    refreshBrowserFileTree,
    applyFileTreePayload,
    refreshOpenedFileTree,
    focusFileLocation,
    setCurrentFile,
    clearCurrentFile;

  
  ctx.collectBrowserMarkdownFiles = collectBrowserMarkdownFiles = async (
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

  
  ctx.readBrowserFileTree = readBrowserFileTree = async (directoryHandle, options = {}) => {
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

  
  ctx.getBrowserSpecSummary = getBrowserSpecSummary = (markdown, fileName, relativePath) => {
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
  const rawSubCategory = segments[2] || getSubCategoryTableValue(basicSection);
  const subCategory = isEmptySpecGroupValue(rawSubCategory) ? '/' : rawSubCategory;
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
    subCategory,
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

  
  ctx.readBrowserSpecSummaries = readBrowserSpecSummaries = async () => {
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

  
  ctx.refreshBrowserFileTree = refreshBrowserFileTree = async () => {
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

  
  ctx.applyFileTreePayload = applyFileTreePayload = (result) => {
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

  
  ctx.refreshOpenedFileTree = refreshOpenedFileTree = async () => {
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

  
  ctx.focusFileLocation = focusFileLocation = () => {
  window.requestAnimationFrame(() => {
    fileLocationPreview?.focus();
  });
  };

  
  ctx.setCurrentFile = setCurrentFile = (file) => {
  state.pendingCurrentFileMeta = null;
  state.hasActiveDocument = true;
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

  
  ctx.clearCurrentFile = clearCurrentFile = () => {
  state.hasActiveDocument = false;
  state.currentFile = null;
  state.pendingCurrentFileMeta = null;
  state.activeTreeFilePath = '';
  markActiveTreeFile();
  };

  return {
    collectBrowserMarkdownFiles,
    readBrowserFileTree,
    getBrowserSpecSummary,
    readBrowserSpecSummaries,
    refreshBrowserFileTree,
    applyFileTreePayload,
    refreshOpenedFileTree,
    focusFileLocation,
    setCurrentFile,
    clearCurrentFile,
  };
};
