export const createMarkdownSuccessFormatRuntime = (ctx) => {
  const table = (...args) => ctx.table(...args);
  const normalizeRowsForMarkdown = (...args) => ctx.normalizeRowsForMarkdown(...args);

  let
    formatSuccessResponseMarkdown,
    formatSuccessResponsesMarkdown;

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

  return {
    formatSuccessResponseMarkdown,
    formatSuccessResponsesMarkdown,
  };
};
