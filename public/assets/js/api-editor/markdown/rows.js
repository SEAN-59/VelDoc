export const createMarkdownRowsRuntime = (ctx) => {
  let
    getFieldRows,
    normalizeRowsForMarkdown,
    getFieldRowsForMarkdown,
    normalizeTypeForSpec,
    normalizeScalarTypeForSpec;

  ctx.getFieldRows = getFieldRows = (type) =>
    ctx.getMutableRows(type).map((row) => ({ ...row }));

  ctx.normalizeRowsForMarkdown = normalizeRowsForMarkdown = (rows) => {
    const parentKeys = ctx.getParentKeys(rows);
    return rows.map((row) => ({
      ...row,
      type: normalizeTypeForSpec(row.type, parentKeys.has(String(row.key ?? '').trim())),
    }));
  };

  ctx.getFieldRowsForMarkdown = getFieldRowsForMarkdown = (type) => {
    const rows = type === 'pathParams'
      ? [...getFieldRows('actionPathParams'), ...getFieldRows('pathParams')]
      : getFieldRows(type);
    return normalizeRowsForMarkdown(rows);
  };

  ctx.normalizeTypeForSpec = normalizeTypeForSpec = (type, forceContainer = false) => {
    const originalType = String(type ?? '').trim();
    const normalizedType = originalType.toLowerCase();
    const scalarType = ctx.getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
    const arrayItemType = ctx.getArrayItemType(scalarType);

    if (forceContainer) {
      return arrayItemType !== null ? 'object[]' : 'object';
    }

    if (arrayItemType !== null) {
      return `${normalizeScalarTypeForSpec(arrayItemType)}[]`;
    }

    return normalizeScalarTypeForSpec(scalarType, originalType);
  };

  ctx.normalizeScalarTypeForSpec = normalizeScalarTypeForSpec = (normalizedType, fallback = normalizedType) => {
    if (normalizedType === '{}') return 'object';
    if (normalizedType === '[]') return 'object[]';
    if (normalizedType === 'bool') return 'boolean';
    if (ctx.isIntegerType(normalizedType)) return 'integer';
    if (normalizedType.includes('double')) return 'double';
    if (normalizedType.includes('float')) return 'float';
    if (ctx.isNumberType(normalizedType)) return 'number';
    if (ctx.isBooleanType(normalizedType)) return 'boolean';
    if (normalizedType.includes('object')) return 'object';
    if (normalizedType.includes('string')) return 'string';
    return fallback || 'string';
  };

  return {
    getFieldRows,
    normalizeRowsForMarkdown,
    getFieldRowsForMarkdown,
    normalizeTypeForSpec,
    normalizeScalarTypeForSpec,
  };
};
