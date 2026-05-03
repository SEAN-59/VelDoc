export const createMarkdownTableRuntime = (ctx) => {
  const {
    isMeaningfulMarkdownTableRow,
  } = ctx;

  let
    table;

  ctx.table = table = (headers, rows, emptyText = '없음') => {
    const visibleRows = rows.filter((row) => isMeaningfulMarkdownTableRow(row, headers));
    if (visibleRows.length === 0) return emptyText;

    const head = `| ${headers.map((header) => header.label).join(' | ')} |`;
    const divider = `| ${headers.map((header) => (header.alignRight ? '---:' : '---')).join(' | ')} |`;
    const body = visibleRows
      .map((row) => `| ${headers.map((header) => ctx.escapePipes(row[header.key] || '')).join(' | ')} |`)
      .join('\n');
    return `${head}\n${divider}\n${body}`;
  };

  return {
    table,
  };
};
