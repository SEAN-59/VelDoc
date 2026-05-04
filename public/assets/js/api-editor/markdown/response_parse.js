export const createMarkdownResponseParseRuntime = (ctx) => {
  const {
    blankIfPlaceholder,
    parseInfoTable,
    parseMarkdownTables,
    parseRowsByHeaders,
    responseFieldMapping,
    extractJsonBlock,
  } = ctx;

  let
    parseRowsByHeadersFromMatchingTable,
    parseResponseFields,
    parseLegacyErrorRows,
    parseErrorResponseBlock,
    parseErrorResponsesFromMarkdown,
    parseSuccessResponsesFromMarkdown,
    parseViewerErrorResponsesFromMarkdown,
    parseViewerSuccessResponsesFromMarkdown;

  ctx.parseRowsByHeadersFromMatchingTable = parseRowsByHeadersFromMatchingTable = (section, mapping, predicate) => {
    const tableData = parseMarkdownTables(section).find(predicate);
    if (!tableData) return [];

    const indexes = mapping.map(([, header]) => {
      const aliases = Array.isArray(header) ? header : [header];
      return tableData.headers.findIndex((cell) => aliases.includes(cell));
    });
    return tableData.rows
      .map((row) =>
        mapping.reduce((acc, [key], index) => {
          const tableIndex = indexes[index];
          acc[key] = tableIndex >= 0 ? ctx.decodeMarkdownCell(row[tableIndex]) : '';
          return acc;
        }, {}),
      )
      .filter((row) => {
        if (Object.prototype.hasOwnProperty.call(row, 'key')) {
          return String(row.key ?? '').trim() !== '';
        }
        return Object.values(row).some((value) => String(value ?? '').trim());
      });
  };

  ctx.parseResponseFields = parseResponseFields = (section) =>
    parseRowsByHeadersFromMatchingTable(
      section,
      responseFieldMapping,
      (table) => table.headers.includes('Key') && table.headers.includes('Type') && table.headers.includes('Nullable'),
    ).map((row) => ({ ...row, nullable: row.nullable || 'N' }));

  ctx.parseLegacyErrorRows = parseLegacyErrorRows = (section) =>
    parseRowsByHeadersFromMatchingTable(
      section,
      [
        ['status', 'Status'],
        ['code', 'Code'],
        ['message', 'Message'],
        ['condition', '발생 상황'],
      ],
      (table) => table.headers.includes('Status') && table.headers.includes('Code'),
    );

  ctx.parseErrorResponseBlock = parseErrorResponseBlock = (block, fallbackStatus = '400') => {
    const info = parseInfoTable(block);
    return {
      status: blankIfPlaceholder(block.match(/Status:\s*`?([^`\n]+)`?/)?.[1] || fallbackStatus) || fallbackStatus,
      code: blankIfPlaceholder(info.Code) || 'ERROR_CODE',
      message: blankIfPlaceholder(info.Message) || '오류 메시지를 입력해주세요.',
      condition: blankIfPlaceholder(info['발생 상황']),
      json: extractJsonBlock(block),
      fields: parseResponseFields(block),
    };
  };

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

  ctx.parseErrorResponsesFromMarkdown = parseErrorResponsesFromMarkdown = (section) => {
    const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
    const matches = [...section.matchAll(blockPattern)];

    if (matches.length === 0) {
      const legacyRows = parseLegacyErrorRows(section);
      if (legacyRows.length > 0) return ctx.normalizeErrorResponses(null, legacyRows);
      return ctx.normalizeErrorResponses([parseErrorResponseBlock(section)]);
    }

    return ctx.normalizeErrorResponses(
      matches.map((match, index) => {
        const start = match.index + match[0].length;
        const end = matches[index + 1]?.index ?? section.length;
        const block = section.slice(start, end).trim();
        return parseErrorResponseBlock(block, blankIfPlaceholder(match[1]) || '400');
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

  ctx.parseViewerErrorResponsesFromMarkdown = parseViewerErrorResponsesFromMarkdown = (section) => {
    const blockPattern = /^###\s+(?:\d+\.\s+)?Status\s+`?([^`\n]+)`?\s*$/gmi;
    const matches = [...section.matchAll(blockPattern)];

    if (matches.length === 0) {
      const legacyRows = parseLegacyErrorRows(section);
      if (legacyRows.length > 0) {
        return legacyRows.map((row) => ({
          ...row,
          json: '',
          fields: [],
        }));
      }
      return [parseErrorResponseBlock(section)];
    }

    return matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = matches[index + 1]?.index ?? section.length;
      const block = section.slice(start, end).trim();
      return parseErrorResponseBlock(block, blankIfPlaceholder(match[1]) || '400');
    });
  };

  return {
    parseErrorResponseBlock,
    parseErrorResponsesFromMarkdown,
    parseLegacyErrorRows,
    parseResponseFields,
    parseRowsByHeadersFromMatchingTable,
    parseViewerErrorResponsesFromMarkdown,
    parseSuccessResponsesFromMarkdown,
    parseViewerSuccessResponsesFromMarkdown,
  };
};
