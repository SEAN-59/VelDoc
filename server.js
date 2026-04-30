import { createServer } from 'node:http';
import { readFile, writeFile, readdir, rename, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { basename, dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname);
const publicDir = resolve(rootDir, 'public');
const userDocumentsDir = process.platform === 'darwin' ? resolve(homedir(), 'Documents') : resolve(rootDir, 'docs');
const port = 6006;
const host = '0.0.0.0';
const serverFileApiEnabled = process.platform === 'darwin';
const sessionCookieName = 'veldoc_session';
const sessions = new Map();

const staticPathAliases = new Map([
  ['/index.html', '/home.html'],
  ['/apieditor.html', '/pages/apieditor.html'],
]);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};

const safeFileName = (value) => {
  const name = String(value || 'api-spec.md')
    .trim()
    .replace(/[{}]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const withExtension = name.endsWith('.md') ? name : `${name}.md`;
  return withExtension || 'api-spec.md';
};

const isInside = (parentDir, targetPath) => {
  const relativePath = relative(parentDir, targetPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !relativePath.startsWith('/'));
};

const isMarkdownFile = (filePath) => ['.md', '.markdown'].includes(extname(filePath).toLowerCase());

const safeOutputDir = (value) => {
  const raw = String(value ?? '')
    .trim()
    .replaceAll('\\', '/')
    .replace(/\/+/g, '/');

  if (!raw) return null;

  if (raw.startsWith('/')) {
    return resolve(raw);
  }

  const relativeDir = raw.replace(/^\.\//, '').replace(/^\/+/, '');
  const parts = relativeDir.split('/').filter(Boolean);

  if (parts.length === 0 || parts.some((part) => part === '.' || part === '..')) {
    return null;
  }

  const outputDir = resolve(rootDir, ...parts);
  return isInside(rootDir, outputDir) ? outputDir : null;
};

const parseCookies = (cookieHeader = '') =>
  String(cookieHeader)
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex === -1) return cookies;
      const name = cookie.slice(0, separatorIndex).trim();
      const value = cookie.slice(separatorIndex + 1).trim();
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});

const createSessionState = () => ({
  fileTreeRoot: null,
  isFileTreeRootOpened: false,
  updatedAt: Date.now(),
});

const getSessionState = (request, response) => {
  const cookies = parseCookies(request.headers.cookie || '');
  let sessionId = cookies[sessionCookieName];

  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = randomUUID();
    sessions.set(sessionId, createSessionState());
    response.setHeader(
      'Set-Cookie',
      `${sessionCookieName}=${encodeURIComponent(sessionId)}; Path=/; SameSite=Lax; HttpOnly`,
    );
  }

  const sessionState = sessions.get(sessionId);
  sessionState.updatedAt = Date.now();
  return sessionState;
};

const buildFileResponsePath = (filePath, fileTreeRoot = null) => {
  if (isInside(rootDir, filePath)) {
    return {
      origin: 'root',
      path: `./${relative(rootDir, filePath).replaceAll('\\', '/')}`,
      saveDir: `./${relative(rootDir, resolve(filePath, '..')).replaceAll('\\', '/')}`,
    };
  }

  if (fileTreeRoot && isInside(fileTreeRoot, filePath)) {
    return {
      origin: 'tree',
      path: relative(fileTreeRoot, filePath).replaceAll('\\', '/'),
      saveDir: resolve(filePath, '..'),
    };
  }

  return {
    origin: 'absolute',
    path: filePath,
    saveDir: dirname(filePath),
  };
};

const buildAbsoluteFileResponsePath = (filePath) => ({
  origin: 'absolute',
  path: filePath,
  saveDir: dirname(filePath),
});

const readJsonBody = async (request) => {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 2_000_000) {
      throw new Error('Payload too large');
    }
  }
  return JSON.parse(raw || '{}');
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
};

const sendServerFileApiDisabled = (response) => {
  sendJson(response, 403, {
    ok: false,
    message: 'Server file APIs are disabled. Use the browser file picker.',
  });
};

const escapeAppleScriptString = (value) => String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');

const chooseFileFromFinder = (defaultDir) =>
  new Promise((resolvePromise, rejectPromise) => {
    if (process.platform !== 'darwin') {
      rejectPromise(new Error('Server-side file picker is only available on macOS.'));
      return;
    }

    const script = [
      `set defaultFolder to POSIX file "${escapeAppleScriptString(defaultDir)}" as alias`,
      'set selectedFile to choose file with prompt "열 명세서 파일을 선택하세요." default location defaultFolder',
      'POSIX path of selectedFile',
    ];
    const child = spawn('osascript', script.flatMap((line) => ['-e', line]));
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise(stdout.trim());
        return;
      }
      rejectPromise(new Error(stderr.trim() || 'File selection canceled.'));
    });
  });

const chooseFolderFromFinder = (defaultDir, prompt = '명세서 폴더를 선택하세요.') =>
  new Promise((resolvePromise, rejectPromise) => {
    if (process.platform !== 'darwin') {
      resolvePromise(defaultDir);
      return;
    }

    const script = [
      `set defaultFolder to POSIX file "${escapeAppleScriptString(defaultDir)}" as alias`,
      `set selectedFolder to choose folder with prompt "${escapeAppleScriptString(prompt)}" default location defaultFolder`,
      'POSIX path of selectedFolder',
    ];
    const child = spawn('osascript', script.flatMap((line) => ['-e', line]));
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise(stdout.trim());
        return;
      }
      rejectPromise(new Error(stderr.trim() || 'Folder selection canceled.'));
    });
  });

const cleanMarkdownValue = (value) => {
  let cleaned = String(value ?? '').trim().replaceAll('<br>', '\n').replaceAll('\\|', '|');
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

const getMarkdownTableValue = (markdown, key) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^\\|\\s*${escapedKey}\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, 'm').exec(markdown);
  return cleanMarkdownValue(match?.[1] ?? '');
};

const getMarkdownSection = (markdown, title) => {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^##\\s+\\d+\\.\\s+${escapedTitle}\\s*$`, 'm').exec(markdown);
  if (!match) return '';

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+\d+\.\s+/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
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
      cells.push(cleanMarkdownValue(current));
      current = '';
      return;
    }
    current += char;
  });
  cells.push(cleanMarkdownValue(current));
  return cells;
};

const isTableDivider = (cells) =>
  cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(String(cell).trim()));

const parseMarkdownTables = (section) => {
  const tables = [];
  let current = [];

  section.split('\n').forEach((line) => {
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
    .filter((table) => table.headers.length > 0);
};

const parseRowsByHeaders = (section, mapping) => {
  const tableData = parseMarkdownTables(section)[0];
  if (!tableData) return [];

  const indexes = mapping.map(([, header]) => tableData.headers.findIndex((cell) => cell === header));
  return tableData.rows
    .map((row) =>
      mapping.reduce((acc, [key], index) => {
        const tableIndex = indexes[index];
        acc[key] = tableIndex >= 0 ? cleanMarkdownValue(row[tableIndex]) : '';
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

const extractJsonBlock = (section) => {
  const match = /```json\s*([\s\S]*?)```/i.exec(section);
  return cleanMarkdownValue(match?.[1] ?? '');
};

const parseSuccessResponsesFromMarkdown = (section) => {
  const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
  const matches = [...section.matchAll(blockPattern)];

  if (matches.length === 0) {
    return [
      {
        status: cleanMarkdownValue(section.match(/Status:\s*`?([^`\n]+)`?/)?.[1] ?? '200') || '200',
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
      status: cleanMarkdownValue(match[1]) || '200',
      json: extractJsonBlock(block),
      fields: parseResponseFields(block),
    };
  });
};

const getSpecSummary = async (filePath, fileTreeRoot) => {
  const markdown = await readFile(filePath, 'utf8');
  const title = cleanMarkdownValue(markdown.match(/^#\s+(.+)$/m)?.[1] ?? '');
  const basicSection = getMarkdownSection(markdown, '기본 정보');
  const authSection = getMarkdownSection(markdown, '인증 / 권한');
  const bodySection = getMarkdownSection(markdown, 'Body');
  const successSection = getMarkdownSection(markdown, 'Success Response');
  const successResponses = parseSuccessResponsesFromMarkdown(successSection);
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
    fileName: basename(filePath),
    relativePath: relative(fileTreeRoot, filePath).replaceAll('\\', '/'),
    name: getMarkdownTableValue(basicSection, 'API 이름') || title || basename(filePath),
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
    bodyJson: extractJsonBlock(bodySection),
    bodyFields: parseRowsByHeaders(bodySection, [
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

const readSpecSummaries = async (directory) => {
  const files = await collectMarkdownFiles(directory);
  const specs = [];
  const invalidFiles = [];

  for (const file of files) {
    const filePath = resolve(directory, file.path);
    try {
      specs.push(await getSpecSummary(filePath, directory));
    } catch {
      invalidFiles.push(file.path);
    }
  }

  specs.sort((a, b) => a.path.localeCompare(b.path, 'ko') || a.method.localeCompare(b.method, 'ko'));
  return { specs, invalidFiles };
};

const splitApiPath = (value) =>
  cleanMarkdownValue(value)
    .replace(/^https?:\/\/[^/]+/i, '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

const isEmptySpecGroupValue = (value) => {
  const text = cleanMarkdownValue(value);
  return !text || ['미정', '없음', '해당 없음', 'UNKNOWN'].includes(text);
};

const getSpecGrouping = async (filePath) => {
  try {
    const markdown = await readFile(filePath, 'utf8');
    const basicSection = getMarkdownSection(markdown, '기본 정보');
    const pathValue = getMarkdownTableValue(basicSection, 'Path');
    if (!pathValue || pathValue.includes('예:')) throw new Error('Invalid spec path');

    const segments = splitApiPath(pathValue);
    const swaggerTagSegments = splitApiPath(getMarkdownTableValue(basicSection, 'Swagger Tag'));
    const common = segments[0] || '/';
    const version = segments[1] || '/';
    const rawSwaggerTag = segments[2] || swaggerTagSegments[0] || '';
    const hasSwaggerTag = !isEmptySpecGroupValue(rawSwaggerTag);
    const swaggerTag = hasSwaggerTag ? rawSwaggerTag : '';
    const actionSegments = segments.slice(3);

    return {
      groups: [common, version, swaggerTag].filter(Boolean),
      label: actionSegments.length > 0 ? `/${actionSegments.join('/')}` : '/',
    };
  } catch {
    return {
      groups: ['양식 외', '미정', '미정'],
      label: basename(filePath),
    };
  }
};

const compareGroupedName = (a, b) => {
  if (a === '/' && b !== '/') return -1;
  if (a !== '/' && b === '/') return 1;
  if (a === 'UNKNOWN' && b !== 'UNKNOWN') return 1;
  if (a !== 'UNKNOWN' && b === 'UNKNOWN') return -1;
  return a.localeCompare(b, 'ko');
};

const getGroupedTreeSortName = (node) => (node.type === 'file' ? node.label || node.name : node.name);
const isGroupedTreeRootFile = (node) => node.type === 'file' && getGroupedTreeSortName(node) === '/';

const collectMarkdownFiles = async (directory, relativeDir = '', depth = 0, counter = { count: 0 }) => {
  if (depth > 8 || counter.count >= 1500) return [];

  let entries = [];
  try {
    entries = await readdir(resolve(directory, relativeDir), { withFileTypes: true });
  } catch {
    return [];
  }

  const sortedEntries = entries
    .filter((entry) => !entry.name.startsWith('.'))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name, 'ko');
    });

  const files = [];
  for (const entry of sortedEntries) {
    if (counter.count >= 1500) break;

    const entryRelativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    const entryPath = resolve(directory, entryRelativePath);
    if (!isInside(directory, entryPath)) continue;

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(directory, entryRelativePath, depth + 1, counter)));
      continue;
    }

    if (entry.isFile() && isMarkdownFile(entryPath)) {
      counter.count += 1;
      files.push({
        type: 'file',
        name: entry.name,
        path: entryRelativePath,
        ...(await getSpecGrouping(entryPath)),
      });
    }
  }

  return files;
};

const toGroupedTree = (files) => {
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
        const sortResult = compareGroupedName(getGroupedTreeSortName(a), getGroupedTreeSortName(b));
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

const readFileTree = async (directory) => {
  const files = await collectMarkdownFiles(directory);
  return toGroupedTree(files);
};

const fileExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const getExistingDirectory = async (...candidates) => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const stats = await stat(candidate);
      if (stats.isDirectory()) return candidate;
    } catch {
      // 다음 후보 경로를 사용한다.
    }
  }

  return rootDir;
};

const serveStatic = async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`);
  const aliasedPathname = staticPathAliases.get(requestUrl.pathname) ?? requestUrl.pathname;
  const pathname = aliasedPathname === '/' ? '/home.html' : aliasedPathname;
  const filePath = resolve(publicDir, `.${normalize(pathname)}`);

  if (!isInside(publicDir, filePath)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`);
    if (requestUrl.pathname.startsWith('/api/') && !serverFileApiEnabled) {
      sendServerFileApiDisabled(response);
      return;
    }

    const sessionState = requestUrl.pathname.startsWith('/api/')
      ? getSessionState(request, response)
      : null;

    if (request.method === 'POST' && requestUrl.pathname === '/api/choose-tree-root') {
      const defaultDir = await getExistingDirectory(sessionState.fileTreeRoot, userDocumentsDir, rootDir);
      const selectedPath = resolve(
        await chooseFolderFromFinder(defaultDir, '파일 목록으로 열 폴더를 선택하세요.'),
      );

      sessionState.fileTreeRoot = selectedPath;
      sessionState.isFileTreeRootOpened = true;
      const tree = await readFileTree(sessionState.fileTreeRoot);
      sendJson(response, 200, {
        ok: true,
        rootName: basename(sessionState.fileTreeRoot),
        rootPath: sessionState.fileTreeRoot,
        saveDir: sessionState.fileTreeRoot,
        tree,
      });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/current-tree-root') {
      const { fileTreeRoot } = sessionState;
      if (!fileTreeRoot) {
        sendJson(response, 200, {
          ok: true,
          opened: false,
        });
        return;
      }

      const tree = await readFileTree(fileTreeRoot);
      sendJson(response, 200, {
        ok: true,
        opened: true,
        rootName: basename(fileTreeRoot),
        rootPath: fileTreeRoot,
        saveDir: fileTreeRoot,
        tree,
      });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/spec-viewer') {
      const { fileTreeRoot, isFileTreeRootOpened } = sessionState;
      if (!isFileTreeRootOpened || !fileTreeRoot) {
        sendJson(response, 409, {
          ok: false,
          message: '먼저 상단 열기 버튼으로 명세서 폴더를 열어주세요.',
        });
        return;
      }

      const { specs, invalidFiles } = await readSpecSummaries(fileTreeRoot);
      sendJson(response, 200, {
        ok: true,
        rootName: basename(fileTreeRoot),
        rootPath: fileTreeRoot,
        specs,
        invalidFiles,
      });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/read-tree-file') {
      const { fileTreeRoot } = sessionState;
      if (!fileTreeRoot) {
        sendJson(response, 409, { ok: false, message: '먼저 명세서 폴더를 열어주세요.' });
        return;
      }

      const payload = await readJsonBody(request);
      const relativePath = String(payload.path ?? '').replaceAll('\\', '/');
      const selectedPath = resolve(fileTreeRoot, relativePath);

      if (!isInside(fileTreeRoot, selectedPath) || !isMarkdownFile(selectedPath)) {
        sendJson(response, 400, { ok: false, message: 'Invalid markdown file.' });
        return;
      }

      const markdown = await readFile(selectedPath, 'utf8');
      sendJson(response, 200, {
        ok: true,
        fileName: basename(selectedPath),
        origin: 'tree',
        path: relative(fileTreeRoot, selectedPath).replaceAll('\\', '/'),
        saveDir: resolve(selectedPath, '..'),
        absolutePath: selectedPath,
        markdown,
      });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/save-open-file') {
      const payload = await readJsonBody(request);
      const origin = String(payload.origin ?? '');
      const relativePath = String(payload.path ?? '').replaceAll('\\', '/');
      const markdown = String(payload.markdown ?? '');
      const fileTreeRoot = sessionState.fileTreeRoot;
      const baseDir = origin === 'tree' ? fileTreeRoot : origin === 'root' ? rootDir : null;

      if (!baseDir) {
        sendJson(response, 400, { ok: false, message: 'Invalid file origin.' });
        return;
      }

      const selectedPath = resolve(baseDir, relativePath.replace(/^\.\//, ''));
      if (!isInside(baseDir, selectedPath) || !isMarkdownFile(selectedPath)) {
        sendJson(response, 400, { ok: false, message: 'Invalid markdown file.' });
        return;
      }

      await writeFile(selectedPath, markdown, 'utf8');
      const fileMeta = buildFileResponsePath(selectedPath, fileTreeRoot);
      sendJson(response, 200, {
        ok: true,
        fileName: basename(selectedPath),
        ...fileMeta,
        absolutePath: selectedPath,
      });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/save-current-file') {
      const payload = await readJsonBody(request);
      const origin = String(payload.origin ?? '');
      const relativePath = String(payload.path ?? '').replaceAll('\\', '/');
      const nextFileName = safeFileName(payload.fileName);
      const markdown = String(payload.markdown ?? '');
      const fileTreeRoot = sessionState.fileTreeRoot;
      const baseDir = origin === 'tree'
        ? fileTreeRoot
        : origin === 'root'
          ? rootDir
          : origin === 'absolute'
            ? dirname(resolve(relativePath))
            : null;

      if (!baseDir) {
        sendJson(response, 400, { ok: false, message: 'Invalid file origin.' });
        return;
      }

      const currentPath = origin === 'absolute'
        ? resolve(relativePath)
        : resolve(baseDir, relativePath.replace(/^\.\//, ''));

      if (!isInside(baseDir, currentPath) || !isMarkdownFile(currentPath)) {
        sendJson(response, 400, { ok: false, message: 'Invalid markdown file.' });
        return;
      }

      const nextPath = resolve(dirname(currentPath), nextFileName);
      if (!isInside(baseDir, nextPath) || !isMarkdownFile(nextPath)) {
        sendJson(response, 400, { ok: false, message: 'Invalid file name.' });
        return;
      }

      const isSamePath = currentPath === nextPath;
      if (!isSamePath && (await fileExists(nextPath))) {
        sendJson(response, 409, { ok: false, message: 'Target file already exists.' });
        return;
      }

      await writeFile(currentPath, markdown, 'utf8');
      if (!isSamePath) {
        await rename(currentPath, nextPath);
      }

      const fileMeta = origin === 'absolute'
        ? buildAbsoluteFileResponsePath(nextPath)
        : origin === 'tree'
          ? {
              origin: 'tree',
              path: relative(fileTreeRoot, nextPath).replaceAll('\\', '/'),
              saveDir: dirname(nextPath),
            }
          : {
              ...buildFileResponsePath(nextPath, fileTreeRoot),
              saveDir: dirname(nextPath),
            };
      const tree = fileTreeRoot ? await readFileTree(fileTreeRoot) : [];
      sendJson(response, 200, {
        ok: true,
        fileName: basename(nextPath),
        ...fileMeta,
        absolutePath: nextPath,
        rootName: fileTreeRoot ? basename(fileTreeRoot) : '',
        rootPath: fileTreeRoot,
        tree,
      });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/choose-open') {
      const payload = await readJsonBody(request);
      const outputDir = await getExistingDirectory(
        safeOutputDir(payload.startDir || payload.saveDir),
        userDocumentsDir,
        rootDir,
      );
      const selectedPath = resolve(await chooseFileFromFinder(outputDir));
      const extension = extname(selectedPath).toLowerCase();
      if (!['.md', '.markdown'].includes(extension)) {
        sendJson(response, 400, { ok: false, message: 'Markdown file required.' });
        return;
      }

      const markdown = await readFile(selectedPath, 'utf8');
      const fileMeta = buildAbsoluteFileResponsePath(selectedPath);
      sendJson(response, 200, {
        ok: true,
        fileName: basename(selectedPath),
        markdown,
        ...fileMeta,
        absolutePath: selectedPath,
      });
      return;
    }

    if (request.method === 'POST' && ['/api/save', '/api/save-new'].includes(requestUrl.pathname)) {
      const payload = await readJsonBody(request);
      const fileName = safeFileName(payload.fileName);
      const markdown = String(payload.markdown ?? '');
      const outputDir = safeOutputDir(payload.saveDir);
      const preventOverwrite = requestUrl.pathname === '/api/save-new';
      const fileTreeRoot = sessionState.fileTreeRoot;

      if (!outputDir) {
        sendJson(response, 400, { ok: false, message: 'Invalid save directory.' });
        return;
      }

      const outputPath = resolve(outputDir, fileName);

      if (!isInside(outputDir, outputPath)) {
        sendJson(response, 400, { ok: false, message: 'Invalid file name.' });
        return;
      }

      if (preventOverwrite && (await fileExists(outputPath))) {
        sendJson(response, 409, { ok: false, message: 'Target file already exists.' });
        return;
      }

      await writeFile(outputPath, markdown, 'utf8');
      const fileMeta = buildFileResponsePath(outputPath, fileTreeRoot);
      const requestedSaveDir = String(payload.saveDir ?? '').trim().replaceAll('\\', '/');
      if (requestedSaveDir.startsWith('/')) {
        fileMeta.saveDir = outputDir;
      }
      sendJson(response, 200, {
        ok: true,
        fileName,
        ...fileMeta,
        absolutePath: outputPath,
        tree: fileTreeRoot ? await readFileTree(fileTreeRoot) : [],
        rootName: fileTreeRoot ? basename(fileTreeRoot) : '',
        rootPath: fileTreeRoot,
      });
      return;
    }

    if (request.method === 'GET') {
      await serveStatic(request, response);
      return;
    }

    response.writeHead(405);
    response.end('Method not allowed');
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(port, host, async () => {
  const homePath = await readFile(resolve(publicDir, 'home.html')).then(() => 'home.html');
  const displayHost = host === '0.0.0.0' ? '127.0.0.1' : host;
  console.log(`VelDoc: http://${displayHost}:${port}/${homePath}`);
  console.log('Markdown output: open a folder or file first');
});
