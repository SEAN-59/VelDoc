// Mechanical API editor segment from the v1.1.0 monolith.
// Keep this segment behavior-identical until the second refactor pass.
export const isMeaningfulMarkdownTableRow = (row, headers = []) => {
  const hasKeyColumn = headers.some((header) => header.key === 'key') ||
    Object.prototype.hasOwnProperty.call(row, 'key');
  if (hasKeyColumn) return String(row.key ?? '').trim() !== '';

  return Object.entries(row).some(
    ([key, value]) =>
      !['required', 'nullable', 'beforeAction', 'pathKey'].includes(key) &&
      String(value ?? '').trim() !== '',
  );
};

export const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const decodeMarkdownCell = (value) => {
  let decoded = String(value ?? '').trim();
  decoded = decoded.replaceAll('<br>', '\n').replaceAll('\\|', '|');
  if (decoded.startsWith('`') && decoded.endsWith('`')) {
    decoded = decoded.slice(1, -1);
  }
  return decoded.trim();
};

export const blankIfPlaceholder = (value) => {
  const decoded = decodeMarkdownCell(value);
  return ['미정', '없음', '해당 없음'].includes(decoded) ? '' : decoded;
};

export const splitMarkdownTableRow = (line) => {
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
      cells.push(decodeMarkdownCell(current));
      current = '';
      return;
    }
    current += char;
  });
  cells.push(decodeMarkdownCell(current));
  return cells;
};

export const isTableDivider = (cells) =>
  cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(String(cell).trim()));

export const getMarkdownSection = (markdown, title) => {
  const headingPattern = new RegExp(`^##\\s+\\d+\\.\\s+${escapeRegExp(title)}\\s*$`, 'm');
  const match = headingPattern.exec(markdown);
  if (!match) return '';

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+\d+\.\s+/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
};

export const parseMarkdownTables = (section) => {
  const lines = section.split('\n');
  const tables = [];
  let current = [];

  lines.forEach((line) => {
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
    .filter((parsedTable) => parsedTable.headers.length > 0);
};

export const parseInfoTable = (section) => {
  const tableData = parseMarkdownTables(section)[0];
  if (!tableData) return {};

  return tableData.rows.reduce((acc, row) => {
    const key = decodeMarkdownCell(row[0]);
    if (key) acc[key] = decodeMarkdownCell(row[1]);
    return acc;
  }, {});
};

export const parseRowsByHeaders = (section, mapping) => {
  const tableData = parseMarkdownTables(section)[0];
  if (!tableData) return [];

  const indexes = mapping.map(([, header]) => {
    const aliases = Array.isArray(header) ? header : [header];
    return tableData.headers.findIndex((cell) => aliases.includes(cell));
  });
  return tableData.rows
    .map((row) =>
      mapping.reduce((acc, [key], index) => {
        const tableIndex = indexes[index];
        acc[key] = tableIndex >= 0 ? decodeMarkdownCell(row[tableIndex]) : '';
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

export const responseFieldMapping = [
  ['parentKey', 'UpKey'],
  ['key', 'Key'],
  ['type', 'Type'],
  ['nullable', 'Nullable'],
  ['example', '예시'],
  ['description', '설명'],
];

export const extractJsonBlock = (section) => {
  const match = /```json\s*([\s\S]*?)```/i.exec(section);
  return decodeMarkdownCell(match?.[1] ?? '');
};

export const splitApiPath = (value) =>
  blankIfPlaceholder(value)
    .replace(/^https?:\/\/[^/]+/i, '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

export const isEmptySpecGroupValue = (value) => {
  const text = blankIfPlaceholder(value);
  return !text || text === 'UNKNOWN';
};

export const startsWithSegments = (segments, prefixSegments) =>
  prefixSegments.length > 0 && prefixSegments.every((segment, index) => segments[index] === segment);

import { createMarkdownGenerateRuntime } from './markdown/generate.js';
import { createMarkdownLoadSpecRuntime } from './markdown/load_spec.js';
import { createMarkdownResponseParseRuntime } from './markdown/response_parse.js';
import { createMarkdownRowsRuntime } from './markdown/rows.js';
import { createMarkdownSuccessFormatRuntime } from './markdown/success_format.js';
import { createMarkdownTableRuntime } from './markdown/table_runtime.js';

export const createMarkdownRuntime = (ctx) => {
  const runtime = {};
  const attach = (partial) => {
    Object.assign(runtime, partial);
    Object.assign(ctx, partial);
  };

  attach(createMarkdownTableRuntime(ctx));
  attach(createMarkdownResponseParseRuntime(ctx));
  attach(createMarkdownLoadSpecRuntime(ctx));
  attach(createMarkdownRowsRuntime(ctx));
  attach(createMarkdownSuccessFormatRuntime(ctx));
  attach(createMarkdownGenerateRuntime(ctx));

  return runtime;
};
