export const createMarkdownLoadSpecRuntime = (ctx) => {
  const {
    form,
    state,
    blankIfPlaceholder,
    getMarkdownSection,
    parseInfoTable,
    parseRowsByHeaders,
    startsWithSegments,
  } = ctx;

  const parseSuccessResponsesFromMarkdown = (...args) => ctx.parseSuccessResponsesFromMarkdown(...args);

  let
    getSubCategoryTableValue,
    parsePathPartsFromMarkdown,
    requiredMarkdownSections,
    isApiSpecMarkdown,
    assertApiSpecMarkdown,
    applyMarkdownSpec;

  ctx.getSubCategoryTableValue = getSubCategoryTableValue = (section) =>
    ctx.getMarkdownTableValue(section, '소분류');

  ctx.parsePathPartsFromMarkdown = parsePathPartsFromMarkdown = (path, subCategory, pathParamRows) => {
    const segments = ctx.splitPathPart(blankIfPlaceholder(path));
    const pathParamTokens = new Set(
      pathParamRows
        .filter((row) => row.beforeAction === 'Y' || row.beforeAction === 'N')
        .map((row) => ctx.toPathParamToken(row.key)),
    );

    const pathBase = segments[0] ? `/${segments[0]}` : '/api';
    const pathVersion = segments[1] ? `/${segments[1]}` : '/v1';
    let remaining = segments.slice(2);
    let pathSubCategory = '';
    const subCategorySegments = ctx.splitPathPart(blankIfPlaceholder(subCategory));

    if (startsWithSegments(remaining, subCategorySegments)) {
      pathSubCategory = `/${subCategorySegments.join('/')}`;
      remaining = remaining.slice(subCategorySegments.length);
    } else if (remaining[0] && !remaining[0].startsWith('{')) {
      pathSubCategory = `/${remaining.shift()}`;
    }

    const actionSegments = remaining.filter((segment) => !pathParamTokens.has(segment));
    return {
      pathBase,
      pathVersion,
      pathSubCategory,
      pathAction: actionSegments.length > 0 ? `/${actionSegments.join('/')}` : '',
    };
  };

  ctx.requiredMarkdownSections = requiredMarkdownSections = [
    '기본 정보',
    '인증 / 권한',
    'Headers',
    'Path Params',
    'Query Params',
    'Body',
    'Success Response',
    'Error Response',
  ];

  ctx.isApiSpecMarkdown = isApiSpecMarkdown = (markdown) => {
    if (!/^#\s+.+$/m.test(markdown)) return false;
    if (!requiredMarkdownSections.every((section) => getMarkdownSection(markdown, section))) return false;

    const basic = parseInfoTable(getMarkdownSection(markdown, '기본 정보'));
    const method = String(blankIfPlaceholder(basic.Method)).toUpperCase();
    return ctx.BASIC_API_METHOD_SET.has(method) && Boolean(blankIfPlaceholder(basic.Path));
  };

  ctx.assertApiSpecMarkdown = assertApiSpecMarkdown = (markdown) => {
    if (!isApiSpecMarkdown(markdown)) {
      throw new Error('INVALID_API_SPEC_MARKDOWN');
    }
  };

  ctx.applyMarkdownSpec = applyMarkdownSpec = (markdown) => {
    assertApiSpecMarkdown(markdown);
    ctx.isAuthPolicyScopeManuallySelected = false;
    ctx.clearValidationErrors();

    const basic = parseInfoTable(getMarkdownSection(markdown, '기본 정보'));
    const auth = parseInfoTable(getMarkdownSection(markdown, '인증 / 권한'));
    const title = blankIfPlaceholder(markdown.match(/^#\s+(.+)$/m)?.[1] || '');

    const headers = parseRowsByHeaders(getMarkdownSection(markdown, 'Headers'), [
      ['key', 'Key'],
      ['value', ['Value', 'Value 예시']],
      ['required', '필수'],
      ['description', '설명'],
    ]);
    const parsedPathParams = parseRowsByHeaders(getMarkdownSection(markdown, 'Path Params'), [
      ['key', 'Key'],
      ['type', 'Type'],
      ['required', '필수'],
      ['beforeAction', '실동작 앞'],
      ['example', '예시'],
      ['description', '설명'],
    ]);
    const queryParams = parseRowsByHeaders(getMarkdownSection(markdown, 'Query Params'), [
      ['key', 'Key'],
      ['type', 'Type'],
      ['required', '필수'],
      ['defaultValue', '기본값'],
      ['example', '예시'],
      ['description', '설명'],
    ]);
    const bodyFields = parseRowsByHeaders(getMarkdownSection(markdown, 'Body'), [
      ['parentKey', 'UpKey'],
      ['key', 'Key'],
      ['type', 'Type'],
      ['required', '필수'],
      ['example', '예시'],
      ['description', '설명'],
    ]);
    const successResponses = parseSuccessResponsesFromMarkdown(getMarkdownSection(markdown, 'Success Response'));
    const errors = parseRowsByHeaders(getMarkdownSection(markdown, 'Error Response'), [
      ['status', 'Status'],
      ['code', 'Code'],
      ['message', 'Message'],
      ['condition', '발생 상황'],
    ]);
    const normalPathParams = parsedPathParams.filter((row) => row.beforeAction === 'Y' || row.beforeAction === 'N');
    const actionPathParams = parsedPathParams
      .filter((row) => row.key && row.beforeAction !== 'Y' && row.beforeAction !== 'N')
      .map((row) => ({
        key: ctx.normalizePathParamKey(row.key),
        pathKey: ctx.normalizePathParamKey(row.key),
        type: row.type || 'string',
        required: row.required || 'N',
        example: row.example || '',
        description: row.description || '',
      }));
    const pathParts = parsePathPartsFromMarkdown(
      basic.Path,
      basic['소분류'],
      normalPathParams,
    );
    const authRequired = blankIfPlaceholder(auth['인증 필요 여부']) === '불필요' ? '불필요' : '필요';
    const authSchemeState = ctx.getAuthSchemeState(blankIfPlaceholder(auth['인증 방식']));

    form.reset();
    ctx.setFormValue('apiName', blankIfPlaceholder(basic['API 이름']) || title);
    ctx.setFormValue('method', ctx.normalizeLoadedMethod(blankIfPlaceholder(basic.Method)));
    ctx.setFormValue('pathBase', pathParts.pathBase);
    ctx.setFormValue('pathVersion', pathParts.pathVersion);
    ctx.setFormValue('pathSubCategory', pathParts.pathSubCategory);
    ctx.setFormValue('pathAction', pathParts.pathAction);
    ctx.setFormValue('purpose', blankIfPlaceholder(basic['목적']));
    ctx.isAuthPolicyScopeManuallySelected = Boolean(
      ctx.selectAuthPolicyScopeByValue(auth['적용 범위'] || auth['권한 적용 범위']),
    );
    ctx.setFormValue('authRequired', authRequired);
    ctx.setFormValue('authScheme', authSchemeState.scheme);
    ctx.setFormValue('authSchemeCustom', authSchemeState.custom);
    const markdownRoles = ctx.parseCsvValues(auth['접근 가능 Role']);
    const authPolicyScopeOption = ctx.getSelectedAuthPolicyScopeOption();
    ctx.renderAuthRoles(ctx.createAuthRoleItemsWithCatalog(markdownRoles, authPolicyScopeOption.path), {
      scopePath: authPolicyScopeOption.path,
    });
    ctx.setFormValue('permissionRules', blankIfPlaceholder(auth['권한 규칙']));

    state.rows = {
      ...structuredClone(ctx.defaultRows),
      headers,
      pathParams: normalPathParams.map((row) => ({
        ...row,
        key: ctx.normalizePathParamKey(row.key),
        required: row.required || 'N',
        beforeAction: row.beforeAction || 'N',
      })),
      actionPathParams,
      queryParams: queryParams.map((row) => ({ ...row, required: row.required || 'N' })),
      bodyFields: bodyFields.map((row) => ({ ...row, required: row.required || 'Y' })),
      responseFields: [],
      errors,
    };
    state.successResponses = successResponses;
    state.activeSuccessResponseIndex = 0;
    ctx.setFormValue('successStatus', ctx.getActiveSuccessResponse().status || '200');

    ctx.syncHeaderRowsWithControls();
    Object.keys(ctx.rowDefinitions).filter((type) => type !== 'actionPathParams').forEach(ctx.renderRows);
    ctx.renderSuccessStatusTabs();
    ctx.renderActionPathParams();
    ctx.refresh();
  };

  return {
    getSubCategoryTableValue,
    parsePathPartsFromMarkdown,
    requiredMarkdownSections,
    isApiSpecMarkdown,
    assertApiSpecMarkdown,
    applyMarkdownSpec,
  };
};
