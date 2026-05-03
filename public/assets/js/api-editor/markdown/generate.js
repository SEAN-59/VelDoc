export const createMarkdownGenerateRuntime = (ctx) => {
  const table = (...args) => ctx.table(...args);
  const getFieldRows = (...args) => ctx.getFieldRows(...args);
  const getFieldRowsForMarkdown = (...args) => ctx.getFieldRowsForMarkdown(...args);
  const formatSuccessResponsesMarkdown = (...args) => ctx.formatSuccessResponsesMarkdown(...args);

  let
    generateMarkdown;

  ctx.generateMarkdown = generateMarkdown = () => {
    const authRequired = ctx.isAuthRequired() ? '필요' : '불필요';
    const authPolicyScopeOption = ctx.isAuthRequired() ? ctx.getSelectedAuthPolicyScopeOption() : null;
    const authPolicyScopePath = authPolicyScopeOption?.path || ctx.buildApiPath();
    const roles = authRequired === '필요' ? ctx.getSelectedAuthRolesForScope(authPolicyScopePath) : [];
    const apiName = ctx.input('apiName') || '미정';
    const method = ctx.input('method') || 'POST';
    const path = ctx.buildPathParamPreview();
    const subCategory = ctx.buildSubCategory();
    const authScheme = authRequired === '필요' ? ctx.getEffectiveAuthScheme() : '해당 없음';
    const authPolicyScopeText = authPolicyScopeOption?.enabled
      ? `${authPolicyScopeOption.label} (${authPolicyScopeOption.value}: ${authPolicyScopeOption.path})`
      : '해당 없음';
    const roleText = authRequired === '필요' ? roles.join(', ') || '없음' : '해당 없음';
    const permissionRules = authRequired === '필요' ? ctx.input('permissionRules') || '미정' : '해당 없음';
    const headerRows = ctx.buildHeaderRowsForMarkdown({ authRequired, authScheme, method });

    return `# ${apiName}

## 1. 기본 정보

| 항목 | 내용 |
|---|---|
| API 이름 | ${ctx.escapePipes(apiName)} |
| Path | \`${ctx.escapePipes(path)}\` |
| Method | \`${ctx.escapePipes(method)}\` |
| 목적 | ${ctx.escapePipes(ctx.input('purpose') || '미정')} |
| 소분류 | \`${ctx.escapePipes(subCategory)}\` |

## 2. 인증 / 권한

| 항목 | 내용 |
|---|---|
| 인증 필요 여부 | ${ctx.escapePipes(authRequired)} |
| 인증 방식 | ${ctx.escapePipes(authScheme)} |
| 적용 범위 | ${ctx.escapePipes(authPolicyScopeText)} |
| 접근 가능 Role | ${ctx.escapePipes(roleText)} |
| 권한 규칙 | ${ctx.escapePipes(permissionRules)} |

## 3. Headers

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'value', label: 'Value' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'description', label: '설명' },
    ],
    headerRows,
  )}

## 4. Path Params

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'beforeAction', label: '실동작 앞', alignRight: true },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    getFieldRowsForMarkdown('pathParams'),
  )}

## 5. Query Params

${table(
    [
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'defaultValue', label: '기본값' },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    ctx.isQueryParamsEnabled() ? getFieldRowsForMarkdown('queryParams') : [],
  )}

## 6. Body

${ctx.isBodyEnabled() ? ctx.formatJsonBlock(ctx.buildBodyJson()) : '없음'}

${table(
    [
      { key: 'parentKey', label: 'UpKey' },
      { key: 'key', label: 'Key' },
      { key: 'type', label: 'Type' },
      { key: 'required', label: '필수', alignRight: true },
      { key: 'example', label: '예시' },
      { key: 'description', label: '설명' },
    ],
    ctx.isBodyEnabled() ? getFieldRowsForMarkdown('bodyFields') : [],
  )}

## 7. Success Response

${formatSuccessResponsesMarkdown()}

## 8. Error Response

${table(
    [
      { key: 'status', label: 'Status', alignRight: true },
      { key: 'code', label: 'Code' },
      { key: 'message', label: 'Message' },
      { key: 'condition', label: '발생 상황' },
    ],
    getFieldRows('errors'),
  )}
  `;
  };

  return {
    generateMarkdown,
  };
};
