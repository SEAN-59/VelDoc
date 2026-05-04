export const createMarkdownSuccessFormatRuntime = (ctx) => {
  const table = (...args) => ctx.table(...args);
  const normalizeRowsForMarkdown = (...args) => ctx.normalizeRowsForMarkdown(...args);

  let
    formatSuccessResponseMarkdown,
    formatSuccessResponsesMarkdown,
    formatErrorResponseMarkdown,
    formatErrorResponsesMarkdown;

  ctx.formatSuccessResponseMarkdown = formatSuccessResponseMarkdown = (successResponse, { includeStatusLine = true } = {}) => {
    const status = ctx.escapePipes(successResponse.status || '200');
    const fields = normalizeRowsForMarkdown(successResponse.fields || []);

    return `${includeStatusLine ? `Status: \`${status}\`\n\n` : ''}${ctx.formatJsonBlock(ctx.buildSuccessJson(successResponse))}

${table(
      [
        { key: 'parentKey', label: 'UpKey' },
        { key: 'key', label: 'Key' },
        { key: 'type', label: 'Type' },
        { key: 'nullable', label: 'Nullable', alignRight: true },
        { key: 'example', label: '예시' },
        { key: 'description', label: '설명' },
      ],
      fields,
    )}`;
  };

  ctx.formatSuccessResponsesMarkdown = formatSuccessResponsesMarkdown = () => {
    const responses = ctx.getSuccessResponses();
    if (responses.length === 1) return formatSuccessResponseMarkdown(responses[0]);

    return responses
      .map((response, index) => `### ${index + 1}. Status \`${ctx.escapePipes(response.status || '200')}\`

${formatSuccessResponseMarkdown(response, { includeStatusLine: false })}`)
      .join('\n\n');
  };

  ctx.formatErrorResponseMarkdown = formatErrorResponseMarkdown = (errorResponse, { includeStatusLine = true } = {}) => {
    const status = ctx.escapePipes(errorResponse.status || '400');
    const fields = normalizeRowsForMarkdown(errorResponse.fields || []);

    return `${includeStatusLine ? `Status: \`${status}\`\n\n` : ''}| 항목 | 내용 |
|---|---|
| Code | ${ctx.escapePipes(errorResponse.code || 'ERROR_CODE')} |
| Message | ${ctx.escapePipes(errorResponse.message || '오류 메시지를 입력해주세요.')} |
| 발생 상황 | ${ctx.escapePipes(errorResponse.condition || '미정')} |

${ctx.formatJsonBlock(ctx.buildErrorJson(errorResponse))}

${table(
      [
        { key: 'parentKey', label: 'UpKey' },
        { key: 'key', label: 'Key' },
        { key: 'type', label: 'Type' },
        { key: 'nullable', label: 'Nullable', alignRight: true },
        { key: 'example', label: '예시' },
        { key: 'description', label: '설명' },
      ],
      fields,
    )}`;
  };

  ctx.formatErrorResponsesMarkdown = formatErrorResponsesMarkdown = () => {
    const responses = ctx.getErrorResponses();
    if (responses.length === 1) return formatErrorResponseMarkdown(responses[0]);

    return responses
      .map((response, index) => `### ${index + 1}. Status \`${ctx.escapePipes(response.status || '400')}\`

${formatErrorResponseMarkdown(response, { includeStatusLine: false })}`)
      .join('\n\n');
  };

  return {
    formatErrorResponseMarkdown,
    formatErrorResponsesMarkdown,
    formatSuccessResponseMarkdown,
    formatSuccessResponsesMarkdown,
  };
};
