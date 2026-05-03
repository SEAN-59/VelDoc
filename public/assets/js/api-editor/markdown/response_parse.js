export const createMarkdownResponseParseRuntime = (ctx) => {
  const {
    blankIfPlaceholder,
    parseRowsByHeaders,
    responseFieldMapping,
    extractJsonBlock,
  } = ctx;

  let
    parseResponseFields,
    parseSuccessResponsesFromMarkdown,
    parseViewerSuccessResponsesFromMarkdown;

  ctx.parseResponseFields = parseResponseFields = (section) =>
    parseRowsByHeaders(section, responseFieldMapping).map((row) => ({ ...row, nullable: row.nullable || 'N' }));

  ctx.parseSuccessResponsesFromMarkdown = parseSuccessResponsesFromMarkdown = (section) => {
    const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
    const matches = [...section.matchAll(blockPattern)];

    if (matches.length === 0) {
      const status = blankIfPlaceholder(section.match(/Status:\s*`?([^`\n]+)`?/)?.[1] || '200') || '200';
      return ctx.normalizeSuccessResponses(null, status, parseResponseFields(section));
    }

    return ctx.normalizeSuccessResponses(
      matches.map((match, index) => {
        const start = match.index + match[0].length;
        const end = matches[index + 1]?.index ?? section.length;
        const block = section.slice(start, end).trim();
        return {
          status: blankIfPlaceholder(match[1]) || '200',
          fields: parseResponseFields(block),
        };
      }),
    );
  };

  ctx.parseViewerSuccessResponsesFromMarkdown = parseViewerSuccessResponsesFromMarkdown = (section) => {
    const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
    const matches = [...section.matchAll(blockPattern)];

    if (matches.length === 0) {
      return [
        {
          status: blankIfPlaceholder(section.match(/Status:\s*`?([^`\n]+)`?/)?.[1] || '200') || '200',
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
        status: blankIfPlaceholder(match[1]) || '200',
        json: extractJsonBlock(block),
        fields: parseResponseFields(block),
      };
    });
  };

  return {
    parseResponseFields,
    parseSuccessResponsesFromMarkdown,
    parseViewerSuccessResponsesFromMarkdown,
  };
};
