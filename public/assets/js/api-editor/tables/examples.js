export const createTableExamplesRuntime = (ctx) => {
  const {
    AUTO_EXAMPLE_FIELD,
    EXAMPLE_TOUCHED_FIELD,
  } = ctx;

  const getActiveSuccessResponse = (...args) => ctx.getActiveSuccessResponse(...args);
  const getFieldRows = (...args) => ctx.getFieldRows(...args);

  let formatJsonBlock,
    parseExampleValue,
    getScalarTypeFromShorthand,
    getArrayItemType,
    getArrayItemTypeFromShorthand,
    parseArrayExample,
    isIntegerType,
    isNumberType,
    isBooleanType,
    getDefaultExampleForType,
    shouldUseAutoExample,
    applyAutoExampleForRow,
    ensureArrayObject,
    setChildValue,
    getParentKeys,
    parseContainerValue,
    buildJsonFromRows,
    buildBodyJson,
    buildSuccessJson;

  ctx.formatJsonBlock = formatJsonBlock = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return '없음';

    try {
      return `\`\`\`json\n${JSON.stringify(JSON.parse(trimmed), null, 2)}\n\`\`\``;
    } catch {
      return `\`\`\`json\n${trimmed}\n\`\`\``;
    }
  };

  ctx.parseExampleValue = parseExampleValue = (type, example) => {
    const normalizedType = String(type || 'string').toLowerCase();
    const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
    const trimmedExample = String(example ?? '').trim();
    const arrayItemType = getArrayItemType(scalarType);
    const isArray = arrayItemType !== null;
    const isObject = scalarType === '{}' || scalarType.includes('object');

    if (trimmedExample) {
      if (isArray) return parseArrayExample(arrayItemType, trimmedExample);
      if (isIntegerType(scalarType)) {
        const value = Number.parseInt(trimmedExample, 10);
        return Number.isNaN(value) ? 0 : value;
      }
      if (isNumberType(scalarType)) {
        const value = Number(trimmedExample);
        return Number.isNaN(value) ? 0 : value;
      }
      if (isBooleanType(scalarType)) {
        return ['true', '1', 'y', 'yes'].includes(trimmedExample.toLowerCase());
      }
      if (isObject) {
        try {
          return JSON.parse(trimmedExample);
        } catch {
          return {};
        }
      }
      if (scalarType.includes('null')) return null;
      return trimmedExample;
    }

    if (isArray) return [];
    if (isIntegerType(scalarType) || isNumberType(scalarType)) return 0;
    if (isBooleanType(scalarType)) return false;
    if (isObject) return {};
    if (scalarType.includes('null')) return null;
    return '';
  };

  ctx.getScalarTypeFromShorthand = getScalarTypeFromShorthand = (marker) => {
    const value = marker.trim().toLowerCase();
    if (value === 'bool' || value === 'boolean') return 'boolean';
    if (/^[0-9]$/.test(value)) return 'integer';
    if (/^[0-9]\.[0-9]$/.test(value)) return 'double';
    if (/^[a-z]$/.test(value)) return 'string';
    if (/^[ㄱ-ㅎㅏ-ㅣ가-힣]$/.test(value)) return 'string';
    return null;
  };

  ctx.getArrayItemType = getArrayItemType = (type) => {
    if (type === '[]' || type === 'array') return 'object';
    const shorthandMatch = type.match(/^\[(.+)\]$/);
    if (shorthandMatch) return getArrayItemTypeFromShorthand(shorthandMatch[1]);
    if (type.endsWith('[]')) return type.slice(0, -2) || 'object';
    const genericMatch = type.match(/^array\s*<\s*(.+?)\s*>$/);
    if (genericMatch) return genericMatch[1];
    return null;
  };

  ctx.getArrayItemTypeFromShorthand = getArrayItemTypeFromShorthand = (marker) => {
    return getScalarTypeFromShorthand(marker);
  };

  ctx.parseArrayExample = parseArrayExample = (itemType, example) => {
    try {
      const parsed = JSON.parse(example);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // 쉼표 입력 방식으로 이어서 처리한다.
    }

    if (itemType === 'object' || itemType === '{}') {
      try {
        return [JSON.parse(example)];
      } catch {
        return [{}];
      }
    }

    return example
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== '')
      .map((value) => parseExampleValue(itemType, value));
  };

  ctx.isIntegerType = isIntegerType = (type) => ['int', 'integer'].some((keyword) => type.includes(keyword));

  ctx.isNumberType = isNumberType = (type) =>
    ['number', 'float', 'double', 'decimal'].some((keyword) => type.includes(keyword));

  ctx.isBooleanType = isBooleanType = (type) => ['bool', 'boolean'].some((keyword) => type.includes(keyword));

  ctx.getDefaultExampleForType = getDefaultExampleForType = (type) => {
    const normalizedType = String(type || 'string').trim().toLowerCase();
    const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
    const arrayItemType = getArrayItemType(scalarType);
    if (arrayItemType !== null) return getDefaultExampleForType(arrayItemType);
    if (isIntegerType(scalarType)) return '0';
    if (isNumberType(scalarType)) return '0.0';
    if (isBooleanType(scalarType)) return 'true';
    if (scalarType === '{}' || scalarType.includes('object')) return '{}';
    if (scalarType.includes('null')) return 'null';
    return 'example';
  };

  ctx.shouldUseAutoExample = shouldUseAutoExample = (row) =>
    !row?.[EXAMPLE_TOUCHED_FIELD] && (!String(row?.example ?? '').trim() || row?.[AUTO_EXAMPLE_FIELD]);

  ctx.applyAutoExampleForRow = applyAutoExampleForRow = (row) => {
    if (!row || !shouldUseAutoExample(row)) return;
    row.example = getDefaultExampleForType(row.type);
    row[AUTO_EXAMPLE_FIELD] = true;
  };

  ctx.ensureArrayObject = ensureArrayObject = (array) => {
    if (array.length === 0 || typeof array[0] !== 'object' || array[0] === null || Array.isArray(array[0])) {
      array[0] = {};
    }
    return array[0];
  };

  ctx.setChildValue = setChildValue = (container, key, value) => {
    if (Array.isArray(container)) {
      ensureArrayObject(container)[key] = value;
      return;
    }
    if (typeof container === 'object' && container !== null) {
      container[key] = value;
    }
  };

  ctx.getParentKeys = getParentKeys = (rows) =>
    new Set(
      rows
        .map((row) => String(row.parentKey ?? '').trim())
        .filter(Boolean),
    );

  ctx.parseContainerValue = parseContainerValue = (type, example) => {
    const normalizedType = String(type || '').toLowerCase();
    const scalarType = getScalarTypeFromShorthand(normalizedType) ?? normalizedType;
    const arrayItemType = getArrayItemType(scalarType);

    if (arrayItemType !== null) {
      const value = parseExampleValue(type, example);
      if (
        Array.isArray(value) &&
        (value.length === 0 || (typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])))
      ) {
        return value;
      }
      return [];
    }

    const value = parseExampleValue(type || '{}', example);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value;
    }
    return {};
  };

  ctx.buildJsonFromRows = buildJsonFromRows = (rowType, rowsOverride = null) => {
    const sourceRows = rowsOverride ?? getFieldRows(rowType);
    const rows = sourceRows.filter((row) => String(row.key ?? '').trim());
    if (rows.length === 0) return '';

    const payload = {};
    const valuesByKey = new Map();
    const parentKeys = getParentKeys(rows);

    rows.forEach((row) => {
      const key = row.key.trim();
      const value = parentKeys.has(key)
        ? parseContainerValue(row.type, row.example)
        : parseExampleValue(row.type, row.example);
      valuesByKey.set(key, value);
    });

    rows.forEach((row) => {
      const key = row.key.trim();
      const parentKey = String(row.parentKey ?? '').trim();
      const value = valuesByKey.get(key);
      const parent = parentKey ? valuesByKey.get(parentKey) : null;

      if (parentKey && parent !== undefined) {
        setChildValue(parent, key, value);
        return;
      }

      setChildValue(payload, key, value);
    });

    return JSON.stringify(payload, null, 2);
  };

  ctx.buildBodyJson = buildBodyJson = () => buildJsonFromRows('bodyFields');

  ctx.buildSuccessJson = buildSuccessJson = (successResponse = getActiveSuccessResponse()) =>
    buildJsonFromRows('responseFields', successResponse.fields || []);

  return {
    applyAutoExampleForRow,
    buildBodyJson,
    buildJsonFromRows,
    buildSuccessJson,
    ensureArrayObject,
    formatJsonBlock,
    getArrayItemType,
    getArrayItemTypeFromShorthand,
    getDefaultExampleForType,
    getParentKeys,
    getScalarTypeFromShorthand,
    isBooleanType,
    isIntegerType,
    isNumberType,
    parseArrayExample,
    parseContainerValue,
    parseExampleValue,
    setChildValue,
    shouldUseAutoExample,
  };
};
