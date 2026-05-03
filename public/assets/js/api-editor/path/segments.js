import {
  normalizeFileName,
  normalizePathParamKey,
  splitPathPart,
  toPathParamToken,
} from '../path.js';

export const createPathSegmentsRuntime = (ctx) => {
  const { form, state } = ctx;

  const input = (name) => form.elements[name]?.value.trim() ?? '';

  const getPathPrefixSegments = () => [
    ...splitPathPart(input('pathBase')),
    ...splitPathPart(input('pathVersion')),
    ...splitPathPart(input('pathSubCategory')),
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

  const getRowsWithKey = (type) =>
    state.rows[type].filter((row) => String(row.key ?? '').trim());

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
    ctx.renderActionPathParams();
    ctx.refresh();
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
    const segments = splitPathPart(input('pathSubCategory'));
    return segments.join('/') || '미정';
  };

  const buildFileNameFromPath = () => {
    const segments = getPathSegments().map((segment) => normalizePathParamKey(segment));
    return normalizeFileName(segments.length > 0 ? segments.join('-') : 'api-spec');
  };

  return {
    input,
    getPathPrefixSegments,
    getPathActionSegments,
    getPathSegments,
    buildApiPath,
    getRowsWithKey,
    getActionPathParamKeys,
    removeActionPathParam,
    syncActionPathParamRows,
    buildPathParamPreview,
    buildQueryParamPreview,
    buildSubCategory,
    buildFileNameFromPath,
  };
};
