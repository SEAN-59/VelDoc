// Mechanical API editor segment from the v1.1.0 monolith.
// Keep this segment behavior-identical until the second refactor pass.
export const escapePipes = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');

export const normalizeFileTreeMethod = (value) => String(value ?? '').trim().toUpperCase();

export const getFileTreeMethodClassName = (method) => method.replace(/[^A-Z0-9-]/g, '-').toLowerCase();

export const normalizeBasicApiMethod = (
  value,
  fallback = 'POST',
  methodSet = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
) => {
  const method = String(value ?? '').trim().toUpperCase();
  return methodSet.has(method) ? method : fallback;
};

export const normalizeAuthScheme = (
  value,
  fallback = 'JWT Bearer',
  schemeSet = new Set(['JWT Bearer', 'API Key', 'OAuth 2.0', 'Cookie Session']),
) => {
  const scheme = String(value ?? '').trim();
  if (scheme === 'Bearer JWT') return 'JWT Bearer';
  return schemeSet.has(scheme) ? scheme : fallback;
};

export const normalizeHeaderKey = (value) => String(value ?? '').trim().toLowerCase();

export const isAuthorizationHeaderRow = (row) => normalizeHeaderKey(row?.key) === 'authorization';

export const buildAuthorizationHeaderValue = (authScheme) => {
  const scheme = String(authScheme ?? '').trim();
  if (scheme === 'JWT Bearer' || scheme === 'OAuth 2.0') return 'Bearer {token}';
  if (scheme === 'API Key') return 'API Key {token}';
  if (scheme === 'Cookie Session') return 'Cookie Session {token}';
  return 'Custom {token}';
};

export const isFilledHeaderRow = (row) =>
  ['key', 'value', 'description'].some((key) => String(row?.[key] ?? '').trim() !== '');

export const markAutomaticHeaderRow = (row, autoHeaderField) => ({ ...row, [autoHeaderField]: true });

export const createHeadersRuntime = (ctx) => {
  const { state } = ctx;

  const normalizeBasicMethod = (value, fallback = 'POST') =>
    normalizeBasicApiMethod(value, fallback, ctx.BASIC_API_METHOD_SET);

  const normalizeScheme = (value, fallback = 'JWT Bearer') =>
    normalizeAuthScheme(value, fallback, ctx.AUTH_SCHEME_SET);

  const getAuthSchemeState = (value) => {
    const scheme = String(value ?? '').trim();
    if (!scheme) return { scheme: 'JWT Bearer', custom: '' };
    if (scheme === ctx.CUSTOM_AUTH_SCHEME) return { scheme: ctx.CUSTOM_AUTH_SCHEME, custom: '' };
    if (scheme === 'Bearer JWT') return { scheme: 'JWT Bearer', custom: '' };
    if (ctx.AUTH_SCHEME_SET.has(scheme)) return { scheme, custom: '' };
    return { scheme: ctx.CUSTOM_AUTH_SCHEME, custom: scheme };
  };

  const getEffectiveAuthScheme = () => {
    const selectedScheme = ctx.input('authScheme') || 'JWT Bearer';
    if (selectedScheme !== ctx.CUSTOM_AUTH_SCHEME) return normalizeScheme(selectedScheme);
    return ctx.input('authSchemeCustom') || ctx.CUSTOM_AUTH_SCHEME;
  };

  const getHeaderPreset = (key) =>
    ctx.HEADER_PRESETS.find((preset) => normalizeHeaderKey(preset.key) === normalizeHeaderKey(key));

  const buildAutomaticHeaderRows = ({ authRequired, authScheme, method, includeAuthorization = true }) => {
    const rows = [];

    if (authRequired === '필요' && includeAuthorization) {
      rows.push({
        key: 'Authorization',
        value: buildAuthorizationHeaderValue(authScheme),
        required: 'Y',
        description: '인증 토큰',
      });
    }

    if (ctx.BODY_API_METHOD_SET.has(normalizeBasicMethod(method))) {
      rows.push({
        key: 'Content-Type',
        value: 'application/json',
        required: 'Y',
        description: '요청 Body 형식',
      });
    }

    rows.push({
      key: 'Accept',
      value: '*/*',
      required: 'N',
      description: '응답 형식',
    });

    return rows;
  };

  const getAutomaticHeaderCandidateRows = () => [
    {
      key: 'Authorization',
      value: 'Bearer {token}',
      required: 'Y',
      description: '인증 토큰',
    },
    {
      key: 'Authorization',
      value: 'API Key {token}',
      required: 'Y',
      description: '인증 토큰',
    },
    {
      key: 'Authorization',
      value: 'Cookie Session {token}',
      required: 'Y',
      description: '인증 토큰',
    },
    {
      key: 'Authorization',
      value: 'Custom {token}',
      required: 'Y',
      description: '인증 토큰',
    },
    {
      key: 'Content-Type',
      value: 'application/json',
      required: 'Y',
      description: '요청 Body 형식',
    },
    {
      key: 'Accept',
      value: '*/*',
      required: 'N',
      description: '응답 형식',
    },
  ];

  const markAutoHeaderRow = (row) => markAutomaticHeaderRow(row, ctx.AUTO_HEADER_FIELD);

  const isAutomaticHeaderRow = (row) => Boolean(row?.[ctx.AUTO_HEADER_FIELD]);

  const isAutomaticHeaderCandidateRow = (row) =>
    getAutomaticHeaderCandidateRows().some((candidate) => areHeaderRowsEqual(row, candidate));

  const areHeaderRowsEqual = (a, b) =>
    ['key', 'value', 'required', 'description'].every((key) => String(a?.[key] ?? '') === String(b?.[key] ?? '')) &&
    isAutomaticHeaderRow(a) === isAutomaticHeaderRow(b);

  const isManagedAutomaticHeaderRow = (row) =>
    isAutomaticHeaderRow(row) || (!isAuthorizationHeaderRow(row) && isAutomaticHeaderCandidateRow(row));

  const buildHeaderRowsForMarkdown = ({ authRequired, authScheme, method }) => {
    const existingRows = ctx.getFieldRows('headers');
    const hasAuthorizationHeader = existingRows.some(isAuthorizationHeaderRow);
    const automaticRows = buildAutomaticHeaderRows({
      authRequired,
      authScheme,
      method,
      includeAuthorization: hasAuthorizationHeader,
    });
    const manualRows = existingRows.filter((row) => isFilledHeaderRow(row) && !isManagedAutomaticHeaderRow(row));
    const manualHeaderKeys = new Set(manualRows.map((row) => normalizeHeaderKey(row.key)).filter(Boolean));
    const missingAutomaticRows = automaticRows.filter((row) => !manualHeaderKeys.has(normalizeHeaderKey(row.key)));

    return [...missingAutomaticRows, ...manualRows];
  };

  const syncHeaderRowsWithControls = ({ render = false, allowAuthorization = false } = {}) => {
    const existingRows = state.rows.headers || [];
    const hasAutoAuthorizationHeader = existingRows.some((row) => isAutomaticHeaderRow(row) && isAuthorizationHeaderRow(row));
    const automaticRows = buildAutomaticHeaderRows({
      authRequired: ctx.isAuthRequired() ? '필요' : '불필요',
      authScheme: getEffectiveAuthScheme(),
      method: ctx.input('method') || 'POST',
      includeAuthorization: allowAuthorization || hasAutoAuthorizationHeader,
    }).map(markAutoHeaderRow);
    const manualRows = existingRows.filter((row) => isFilledHeaderRow(row) && !isManagedAutomaticHeaderRow(row));
    const manualHeaderKeys = new Set(manualRows.map((row) => normalizeHeaderKey(row.key)).filter(Boolean));
    const nextRows = [
      ...automaticRows.filter((row) => !manualHeaderKeys.has(normalizeHeaderKey(row.key))),
      ...manualRows,
    ];
    const changed =
      existingRows.length !== nextRows.length ||
      existingRows.some((row, index) => !areHeaderRowsEqual(row, nextRows[index]));

    if (!changed) return false;
    state.rows.headers = nextRows;
    if (render) ctx.renderRows('headers');
    return true;
  };

  const syncHeaderRowsAndRefresh = (options = {}) => {
    syncHeaderRowsWithControls({ ...options, render: true });
    ctx.refresh();
  };

  return {
    escapePipes,
    normalizeFileTreeMethod,
    getFileTreeMethodClassName,
    normalizeBasicApiMethod: normalizeBasicMethod,
    normalizeAuthScheme: normalizeScheme,
    getAuthSchemeState,
    getEffectiveAuthScheme,
    normalizeHeaderKey,
    isAuthorizationHeaderRow,
    getHeaderPreset,
    buildAuthorizationHeaderValue,
    buildAutomaticHeaderRows,
    isFilledHeaderRow,
    markAutomaticHeaderRow: markAutoHeaderRow,
    isAutomaticHeaderRow,
    isAutomaticHeaderCandidateRow,
    isManagedAutomaticHeaderRow,
    areHeaderRowsEqual,
    buildHeaderRowsForMarkdown,
    syncHeaderRowsWithControls,
    syncHeaderRowsAndRefresh,
  };
};
