export const createViewerRuntime = (ctx) => {
  const {
    fileTree,
    specCommonTabs,
    specVersionTabs,
    specViewerCount,
    specViewerEmpty,
    specViewerFilters,
    specViewerList,
    specViewerNote,
    specViewerRoot,
    state,
  } = ctx;

  const getFileTreeMethodClassName = (...args) => ctx.getFileTreeMethodClassName(...args);
  const getMarkdownSection = (...args) => ctx.getMarkdownSection(...args);
  const getMarkdownTableValue = (...args) => ctx.getMarkdownTableValue(...args);
  const getSubCategoryTableValue = (...args) => ctx.getSubCategoryTableValue(...args);
  const isEmptySpecGroupValue = (...args) => ctx.isEmptySpecGroupValue(...args);
  const loadAuthPoliciesForOpenedFolder = (...args) => ctx.loadAuthPoliciesForOpenedFolder(...args);
  const normalizeAuthPolicyPath = (...args) => ctx.normalizeAuthPolicyPath(...args);
  const normalizeFileTreeMethod = (...args) => ctx.normalizeFileTreeMethod(...args);
  const normalizeFolderApiPaths = (...args) => ctx.normalizeFolderApiPaths(...args);
  const normalizeFolderSpecFiles = (...args) => ctx.normalizeFolderSpecFiles(...args);
  const openTreeMarkdownFile = (...args) => ctx.openTreeMarkdownFile(...args);
  const readBrowserSpecSummaries = (...args) => ctx.readBrowserSpecSummaries(...args);
  const refreshOpenedFileTree = (...args) => ctx.refreshOpenedFileTree(...args);
  const setSpecViewerMode = (...args) => ctx.setSpecViewerMode(...args);
  const setStatus = (...args) => ctx.setStatus(...args);
  const setViewTransitionSkeleton = (...args) => ctx.setViewTransitionSkeleton(...args);
  const showErrorToast = (...args) => ctx.showErrorToast(...args);
  const showWarningToast = (...args) => ctx.showWarningToast(...args);
  const splitApiPath = (...args) => ctx.splitApiPath(...args);
  const syncAuthPoliciesWithOpenedFolder = (...args) => ctx.syncAuthPoliciesWithOpenedFolder(...args);
  const waitForViewTransitionPreview = (...args) => ctx.waitForViewTransitionPreview(...args);

  let markActiveTreeFile,
    createFileTreeNode,
    renderFileTree,
    compareBrowserGroupName,
    getGroupedTreeSortName,
    isGroupedTreeRootFile,
    getSpecGroupingFromMarkdown,
    toGroupedFileTree,
    isBlankViewerValue,
    viewerValue,
    compareViewerGroupName,
    formatPathGroupValue,
    createTextElement,
    appendViewerMeta,
    createSpecDetailTable,
    createSpecJsonPreview,
    hasViewerKey,
    countViewerKeyRows,
    countViewerErrorRows,
    countViewerSuccessResponses,
    countViewerErrorResponses,
    createSpecChip,
    createSpecCounter,
    getSpecSuccessResponses,
    getSpecErrorResponses,
    createSpecDetailSection,
    createSpecSuccessResponseDetail,
    createSpecErrorResponseDetail,
    createSpecCard,
    getViewerTabIndicatorMetrics,
    setViewerTabIndicatorPosition,
    restoreViewerTabIndicatorPosition,
    refreshViewerTabIndicator,
    observeViewerTabContainer,
    moveViewerTabIndicator,
    renderViewerTabs,
    renderSpecViewer,
    openFolderViewer;

  const viewerTabResizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver((entries) => {
        entries.forEach((entry) => refreshViewerTabIndicator?.(entry.target));
      })
    : null;


  ctx.markActiveTreeFile = markActiveTreeFile = () => {
    fileTree?.querySelectorAll('.file-tree-file').forEach((button) => {
      button.classList.toggle('active', button.dataset.path === state.activeTreeFilePath);
    });
  };

  ctx.createFileTreeNode = createFileTreeNode = (node) => {
    if (node.type === 'directory') {
      const details = document.createElement('details');
      details.className = 'file-tree-folder';
      details.open = true;

      const summary = document.createElement('summary');
      summary.textContent = node.name;
      details.append(summary);

      const children = document.createElement('div');
      children.className = 'file-tree-children';
      (node.children || []).forEach((childNode) => {
        children.append(createFileTreeNode(childNode));
      });
      details.append(children);
      return details;
    }

    const fileButton = document.createElement('button');
    fileButton.className = 'file-tree-file';
    fileButton.type = 'button';
    fileButton.title = node.name;
    fileButton.dataset.path = node.path;

    const method = normalizeFileTreeMethod(node.method);
    if (method) {
      const methodBadge = document.createElement('span');
      methodBadge.className = `file-tree-method file-tree-method-${getFileTreeMethodClassName(method)}`;
      methodBadge.textContent = method;
      fileButton.append(methodBadge);
    }

    const label = document.createElement('span');
    label.className = 'file-tree-file-label';
    label.textContent = node.label || node.name;
    fileButton.append(label);

    fileButton.addEventListener('click', () => openTreeMarkdownFile(node.path, node.name));
    return fileButton;
  };

  ctx.renderFileTree = renderFileTree = (tree = []) => {
    if (!fileTree) return;
    fileTree.replaceChildren();

    if (tree.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'file-tree-empty';
      empty.textContent = '표시할 파일이 없습니다.';
      fileTree.append(empty);
      return;
    }

    const content = document.createElement('div');
    content.className = 'file-tree-content';
    tree.forEach((node) => {
      content.append(createFileTreeNode(node));
    });
    fileTree.append(content);
    markActiveTreeFile();
  };

  ctx.compareBrowserGroupName = compareBrowserGroupName = (a, b) => {
    if (a === '/' && b !== '/') return -1;
    if (a !== '/' && b === '/') return 1;
    if (a === 'UNKNOWN' && b !== 'UNKNOWN') return 1;
    if (a !== 'UNKNOWN' && b === 'UNKNOWN') return -1;
    return a.localeCompare(b, 'ko');
  };

  ctx.getGroupedTreeSortName = getGroupedTreeSortName = (node) => (node.type === 'file' ? node.label || node.name : node.name);
  ctx.isGroupedTreeRootFile = isGroupedTreeRootFile = (node) => node.type === 'file' && getGroupedTreeSortName(node) === '/';

  ctx.getSpecGroupingFromMarkdown = getSpecGroupingFromMarkdown = (markdown, fallbackName) => {
    try {
      const basicSection = getMarkdownSection(markdown, '기본 정보');
      const pathValue = getMarkdownTableValue(basicSection, 'Path');
      if (!pathValue || pathValue.includes('예:')) throw new Error('Invalid spec path');

      const method = normalizeFileTreeMethod(getMarkdownTableValue(basicSection, 'Method'));
      const segments = splitApiPath(pathValue);
      const subCategorySegments = splitApiPath(getSubCategoryTableValue(basicSection));
      const common = segments[0] || '/';
      const version = segments[1] || '/';
      const rawSubCategory = segments[2] || subCategorySegments[0] || '';
      const subCategory = isEmptySpecGroupValue(rawSubCategory) ? '' : rawSubCategory;
      const actionSegments = segments.slice(3);

      return {
        apiPath: normalizeAuthPolicyPath(pathValue),
        groups: [common, version, subCategory].filter(Boolean),
        label: actionSegments.length > 0 ? `/${actionSegments.join('/')}` : '/',
        method,
      };
    } catch {
      return {
        groups: ['양식 외', '미정', '미정'],
        label: fallbackName,
        method: '',
      };
    }
  };

  ctx.toGroupedFileTree = toGroupedFileTree = (files) => {
    const rootGroups = new Map();

    files.forEach((file) => {
      let currentGroups = rootGroups;
      file.groups.forEach((groupName) => {
        if (!currentGroups.has(groupName)) {
          currentGroups.set(groupName, {
            type: 'directory',
            name: groupName,
            childrenMap: new Map(),
          });
        }
        currentGroups = currentGroups.get(groupName).childrenMap;
      });

      currentGroups.set(`__file__${file.path}`, {
        type: 'file',
        name: file.name,
        label: file.label,
        method: file.method,
        path: file.path,
      });
    });

    const serialize = (groups) =>
      [...groups.values()]
        .sort((a, b) => {
          if (isGroupedTreeRootFile(a) !== isGroupedTreeRootFile(b)) {
            return isGroupedTreeRootFile(a) ? -1 : 1;
          }
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          const sortResult = compareBrowserGroupName(getGroupedTreeSortName(a), getGroupedTreeSortName(b));
          return sortResult || a.name.localeCompare(b.name, 'ko');
        })
        .map((node) => {
          if (node.type === 'file') return node;
          return {
            type: 'directory',
            name: node.name,
            children: serialize(node.childrenMap),
          };
        });

    return serialize(rootGroups);
  };

  ctx.isBlankViewerValue = isBlankViewerValue = (value) => {
    const text = String(value ?? '').trim();
    return !text || ['미정', '없음', '해당 없음'].includes(text);
  };

  ctx.viewerValue = viewerValue = (value, fallback = '-') => (isBlankViewerValue(value) ? fallback : String(value).trim());

  ctx.compareViewerGroupName = compareViewerGroupName = (a, b) => {
    if (a === '/' && b !== '/') return -1;
    if (a !== '/' && b === '/') return 1;
    if (a === 'UNKNOWN' && b !== 'UNKNOWN') return 1;
    if (a !== 'UNKNOWN' && b === 'UNKNOWN') return -1;
    return a.localeCompare(b, 'ko');
  };

  ctx.formatPathGroupValue = formatPathGroupValue = (value) => {
    const text = viewerValue(value, '/');
    return text === '/' ? '/' : `/${text.replace(/^\/+/, '')}`;
  };

  ctx.createTextElement = createTextElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  };

  ctx.appendViewerMeta = appendViewerMeta = (container, label, value) => {
    const item = document.createElement('div');
    item.className = 'spec-meta-item';
    item.append(createTextElement('span', '', label), createTextElement('strong', '', viewerValue(value)));
    container.append(item);
  };

  ctx.createSpecDetailTable = createSpecDetailTable = (title, columns, rows = [], options = {}) => {
    const { limit = 8, rowFilter } = typeof options === 'number' ? { limit: options } : options;
    const visibleRows = rows.filter(rowFilter || ((row) => columns.some(([key]) => !isBlankViewerValue(row[key]))));
    if (visibleRows.length === 0) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'spec-detail-table';
    wrapper.append(createTextElement('h4', '', title));

    const scroll = document.createElement('div');
    scroll.className = 'spec-detail-scroll';

    const tableElement = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach(([, label]) => {
      const cell = document.createElement('th');
      cell.textContent = label;
      headRow.append(cell);
    });
    thead.append(headRow);
    tableElement.append(thead);

    const tbody = document.createElement('tbody');
    visibleRows.slice(0, limit).forEach((row) => {
      const bodyRow = document.createElement('tr');
      columns.forEach(([key]) => {
        const cell = document.createElement('td');
        cell.textContent = viewerValue(row[key]);
        bodyRow.append(cell);
      });
      tbody.append(bodyRow);
    });
    tableElement.append(tbody);
    scroll.append(tableElement);
    wrapper.append(scroll);

    if (visibleRows.length > limit) {
      wrapper.append(createTextElement('p', 'spec-detail-more', `외 ${visibleRows.length - limit}개 더 있음`));
    }

    return wrapper;
  };

  ctx.createSpecJsonPreview = createSpecJsonPreview = (title, value) => {
    if (isBlankViewerValue(value)) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'spec-json-preview';
    wrapper.append(createTextElement('h4', '', title), createTextElement('pre', '', value));
    return wrapper;
  };

  ctx.hasViewerKey = hasViewerKey = (row) => !isBlankViewerValue(row?.key);

  ctx.countViewerKeyRows = countViewerKeyRows = (rows = []) => rows.filter(hasViewerKey).length;

  ctx.countViewerErrorRows = countViewerErrorRows = (rows = []) =>
    rows.filter((row) => ['status', 'code', 'message', 'condition'].some((key) => !isBlankViewerValue(row[key]))).length;

  ctx.countViewerSuccessResponses = countViewerSuccessResponses = (responses = []) =>
    responses.filter((response) =>
      !isBlankViewerValue(response.status) ||
      !isBlankViewerValue(response.json) ||
      countViewerKeyRows(response.fields) > 0,
    ).length;

  ctx.countViewerErrorResponses = countViewerErrorResponses = (responses = []) =>
    responses.filter((response) =>
      !isBlankViewerValue(response.status) ||
      !isBlankViewerValue(response.code) ||
      !isBlankViewerValue(response.message) ||
      !isBlankViewerValue(response.condition) ||
      !isBlankViewerValue(response.json) ||
      countViewerKeyRows(response.fields) > 0,
    ).length;

  ctx.createSpecChip = createSpecChip = (label, value) => {
    const chip = document.createElement('div');
    chip.className = 'spec-chip';
    chip.append(createTextElement('span', '', label), createTextElement('strong', '', viewerValue(value)));
    return chip;
  };

  ctx.createSpecCounter = createSpecCounter = (label, count) => {
    const counter = document.createElement('div');
    counter.className = 'spec-counter';
    counter.append(createTextElement('strong', '', String(count)), createTextElement('span', '', label));
    return counter;
  };

  ctx.getSpecSuccessResponses = getSpecSuccessResponses = (spec) => {
    if (Array.isArray(spec.successResponses) && spec.successResponses.length > 0) {
      return spec.successResponses.map((response) => ({
        status: response.status || '200',
        json: response.json || '',
        fields: Array.isArray(response.fields) ? response.fields : [],
      }));
    }

    return [{
      status: spec.successStatus || '200',
      json: spec.successJson || '',
      fields: Array.isArray(spec.responseFields) ? spec.responseFields : [],
    }];
  };

  ctx.getSpecErrorResponses = getSpecErrorResponses = (spec) => {
    if (Array.isArray(spec.errorResponses) && spec.errorResponses.length > 0) {
      return spec.errorResponses.map((response) => ({
        status: response.status || '400',
        code: response.code || '',
        message: response.message || '',
        condition: response.condition || '',
        json: response.json || '',
        fields: Array.isArray(response.fields) ? response.fields : [],
      }));
    }

    if (Array.isArray(spec.errors) && spec.errors.length > 0) {
      return spec.errors.map((row) => ({
        status: row.status || '400',
        code: row.code || '',
        message: row.message || '',
        condition: row.condition || '',
        json: '',
        fields: [],
      }));
    }

    return [];
  };

  ctx.createSpecDetailSection = createSpecDetailSection = (title, elements = []) => {
    const visibleElements = elements.filter(Boolean);
    if (visibleElements.length === 0) return null;

    const section = document.createElement('section');
    section.className = `spec-detail-section spec-detail-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
    section.append(createTextElement('h4', 'spec-detail-section-title', title));

    const content = document.createElement('div');
    content.className = 'spec-section-grid';
    visibleElements.forEach((element) => content.append(element));
    section.append(content);
    return section;
  };

  ctx.createSpecSuccessResponseDetail = createSpecSuccessResponseDetail = (response) => {
    const status = response.status || '200';
    const fieldCount = countViewerKeyRows(response.fields);
    const hasJson = !isBlankViewerValue(response.json);
    const fieldTable = createSpecDetailTable('Fields', [
      ['parentKey', 'UpKey'],
      ['key', 'Key'],
      ['type', 'Type'],
      ['nullable', 'Nullable'],
      ['description', '설명'],
    ], response.fields, { rowFilter: hasViewerKey });
    const jsonPreview = createSpecJsonPreview('JSON', response.json);

    const wrapper = document.createElement('div');
    wrapper.className = 'spec-success-response';

    const head = document.createElement('div');
    head.className = 'spec-success-response-head';
    head.append(
      createTextElement('span', 'spec-success-status', `Status ${status}`),
      createTextElement('span', 'spec-success-meta', `필드 ${fieldCount}개${hasJson ? ' / JSON' : ''}`),
    );
    wrapper.append(head);

    const body = document.createElement('div');
    body.className = 'spec-success-response-body';
    [fieldTable, jsonPreview].filter(Boolean).forEach((element) => body.append(element));
    if (body.children.length > 0) wrapper.append(body);

    return wrapper;
  };

  ctx.createSpecErrorResponseDetail = createSpecErrorResponseDetail = (response) => {
    const status = response.status || '400';
    const fieldCount = countViewerKeyRows(response.fields);
    const hasJson = !isBlankViewerValue(response.json);
    const metaTable = createSpecDetailTable('Meta', [
      ['code', 'Code'],
      ['message', 'Message'],
      ['condition', '발생 상황'],
    ], [response]);
    const fieldTable = createSpecDetailTable('Fields', [
      ['parentKey', 'UpKey'],
      ['key', 'Key'],
      ['type', 'Type'],
      ['nullable', 'Nullable'],
      ['description', '설명'],
    ], response.fields, { rowFilter: hasViewerKey });
    const jsonPreview = createSpecJsonPreview('JSON', response.json);

    const wrapper = document.createElement('div');
    wrapper.className = 'spec-success-response';

    const head = document.createElement('div');
    head.className = 'spec-success-response-head';
    head.append(
      createTextElement('span', 'spec-success-status', `Status ${status}`),
      createTextElement('span', 'spec-success-meta', `${viewerValue(response.code, 'ERROR')}${fieldCount ? ` / 필드 ${fieldCount}개` : ''}${hasJson ? ' / JSON' : ''}`),
    );
    wrapper.append(head);

    const body = document.createElement('div');
    body.className = 'spec-success-response-body';
    [metaTable, fieldTable, jsonPreview].filter(Boolean).forEach((element) => body.append(element));
    if (body.children.length > 0) wrapper.append(body);

    return wrapper;
  };

  ctx.createSpecCard = createSpecCard = (spec) => {
    const card = document.createElement('article');
    const method = String(spec.method || 'POST').toUpperCase();
    const successResponses = getSpecSuccessResponses(spec);
    const errorResponses = getSpecErrorResponses(spec);
    card.className = `spec-endpoint-card method-card-${method.toLowerCase()}`;

    const top = document.createElement('div');
    top.className = 'spec-card-top';

    const route = document.createElement('div');
    route.className = 'spec-route';
    const methodBadge = createTextElement('span', `method-badge method-${method.toLowerCase()}`, method);
    const path = createTextElement('code', 'spec-path', viewerValue(spec.path));
    route.append(methodBadge, path);

    top.append(route);

    const titleBlock = document.createElement('div');
    titleBlock.className = 'spec-title-block';
    const title = createTextElement('h3', '', viewerValue(spec.name, spec.fileName || '이름 없음'));
    const purpose = createTextElement('p', 'spec-purpose', viewerValue(spec.purpose));
    titleBlock.append(title, purpose);

    const authText = viewerValue(spec.authRequired) === '불필요'
      ? '불필요'
      : `${viewerValue(spec.authRequired)} / ${viewerValue(spec.authScheme)}`;

    const chips = document.createElement('div');
    chips.className = 'spec-chip-row';
    chips.append(
      createSpecChip('파일', spec.fileName),
      createSpecChip('소분류', spec.subCategory),
      createSpecChip('인증', authText),
      createSpecChip('Role', spec.roles),
    );

    const counters = document.createElement('div');
    counters.className = 'spec-counter-row';
    counters.append(
      createSpecCounter('Headers', countViewerKeyRows(spec.headers)),
      createSpecCounter('Path', countViewerKeyRows(spec.pathParams)),
      createSpecCounter('Query', countViewerKeyRows(spec.queryParams)),
      createSpecCounter('Body', countViewerKeyRows(spec.bodyFields)),
      createSpecCounter('Response', countViewerSuccessResponses(successResponses)),
      createSpecCounter('Errors', countViewerErrorResponses(errorResponses) || countViewerErrorRows(spec.errors)),
    );

    const detailStack = document.createElement('div');
    detailStack.className = 'spec-detail-stack';
    [
      createSpecDetailSection('Request', [
        createSpecDetailTable('Headers', [
          ['key', 'Key'],
          ['value', 'Value'],
          ['required', 'Req'],
          ['description', '설명'],
        ], spec.headers, { rowFilter: hasViewerKey }),
        createSpecDetailTable('Path Params', [
          ['key', 'Key'],
          ['type', 'Type'],
          ['required', 'Req'],
          ['example', '예시'],
          ['description', '설명'],
        ], spec.pathParams, { rowFilter: hasViewerKey }),
        createSpecDetailTable('Query Params', [
          ['key', 'Key'],
          ['type', 'Type'],
          ['required', 'Req'],
          ['defaultValue', '기본값'],
          ['example', '예시'],
        ], spec.queryParams, { rowFilter: hasViewerKey }),
        createSpecDetailTable('Body Fields', [
          ['parentKey', 'UpKey'],
          ['key', 'Key'],
          ['type', 'Type'],
          ['required', 'Req'],
          ['description', '설명'],
        ], spec.bodyFields, { rowFilter: hasViewerKey }),
        createSpecJsonPreview('Body JSON', spec.bodyJson),
      ]),
      createSpecDetailSection('Response', successResponses.map(createSpecSuccessResponseDetail)),
      createSpecDetailSection('Error', errorResponses.map(createSpecErrorResponseDetail)),
    ].filter(Boolean).forEach((element) => detailStack.append(element));

    card.append(top, titleBlock, chips, counters);
    if (detailStack.children.length > 0) {
      const details = document.createElement('details');
      details.className = 'spec-detail-panel';
      details.open = false;
      const detailsSummary = document.createElement('summary');
      detailsSummary.append(
        createTextElement('span', 'spec-detail-summary-title', '상세 명세'),
        createTextElement('span', 'spec-detail-summary-meta', 'Request / Response / Error'),
      );
      details.append(detailsSummary, detailStack);
      card.append(details);
    }
    return card;
  };

  ctx.getViewerTabIndicatorMetrics = getViewerTabIndicatorMetrics = (container, targetButton) => {
    if (!container || !targetButton) return null;
    return {
      left: targetButton.offsetLeft,
      width: targetButton.offsetWidth,
    };
  };

  ctx.setViewerTabIndicatorPosition = setViewerTabIndicatorPosition = (container, targetButton) => {
    const indicator = container?.querySelector('.viewer-tab-indicator');
    const metrics = getViewerTabIndicatorMetrics(container, targetButton);
    if (!indicator || !metrics) return;
    indicator.style.left = metrics.left + 'px';
    indicator.style.width = metrics.width + 'px';
    container.dataset.viewerIndicatorLeft = String(metrics.left);
    container.dataset.viewerIndicatorWidth = String(metrics.width);
  };

  ctx.restoreViewerTabIndicatorPosition = restoreViewerTabIndicatorPosition = (container) => {
    const indicator = container?.querySelector('.viewer-tab-indicator');
    const cachedLeft = Number(container?.dataset.viewerIndicatorLeft);
    const cachedWidth = Number(container?.dataset.viewerIndicatorWidth);
    if (!indicator || !Number.isFinite(cachedLeft) || !Number.isFinite(cachedWidth) || cachedWidth <= 0) return false;
    indicator.style.left = cachedLeft + 'px';
    indicator.style.width = cachedWidth + 'px';
    return true;
  };

  ctx.refreshViewerTabIndicator = refreshViewerTabIndicator = (container) => {
    const activeButton = container?.querySelector('.viewer-tab[aria-selected="true"]')
      || container?.querySelector('.viewer-tab');
    if (!activeButton) return;
    setViewerTabIndicatorPosition(container, activeButton);
  };

  ctx.observeViewerTabContainer = observeViewerTabContainer = (container) => {
    if (!container) return;
    if (viewerTabResizeObserver) {
      viewerTabResizeObserver.unobserve(container);
      viewerTabResizeObserver.observe(container);
      return;
    }

    if (container.dataset.viewerResizeFallbackBound === 'true') return;
    container.dataset.viewerResizeFallbackBound = 'true';
    window.addEventListener('resize', () => refreshViewerTabIndicator(container));
  };

  ctx.moveViewerTabIndicator = moveViewerTabIndicator = (container, activeButton, previousButton = null, { animate = true } = {}) => {
    const indicator = container?.querySelector('.viewer-tab-indicator');
    if (!indicator || !activeButton) return;

    if (!animate) {
      indicator.classList.remove('is-ready');
      restoreViewerTabIndicatorPosition(container);
      window.requestAnimationFrame(() => {
        setViewerTabIndicatorPosition(container, activeButton);
        indicator.classList.add('is-ready');
      });
      return;
    }

    indicator.classList.remove('is-ready');
    setViewerTabIndicatorPosition(container, previousButton || activeButton);
    window.requestAnimationFrame(() => {
      indicator.classList.add('is-ready');
      setViewerTabIndicatorPosition(container, activeButton);
    });
  };

  ctx.renderViewerTabs = renderViewerTabs = (container, items, selectedItem, onSelect) => {
    if (!container) return;
    const previousSelectedItem = container.dataset.viewerSelectedItem || selectedItem;
    container.replaceChildren();

    const indicator = document.createElement('span');
    indicator.className = 'viewer-tab-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    container.append(indicator);
    restoreViewerTabIndicatorPosition(container);

    const selectedIndex = Math.max(0, items.indexOf(selectedItem));
    container.style.setProperty('--tab-count', String(Math.max(items.length, 1)));
    container.style.setProperty('--tab-index', String(selectedIndex));

    const buttonsByItem = new Map();
    items.forEach((item) => {
      const button = document.createElement('button');
      button.className = 'viewer-tab';
      button.classList.toggle('active', item === selectedItem);
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.textContent = formatPathGroupValue(item);
      button.setAttribute('aria-selected', item === selectedItem ? 'true' : 'false');
      button.dataset.viewerTabValue = item;
      button.addEventListener('click', () => {
        if (item === selectedItem) return;
        onSelect(item);
      });
      buttonsByItem.set(item, button);
      container.append(button);
    });

    const activeButton = buttonsByItem.get(selectedItem) || container.querySelector('.viewer-tab');
    const previousButton = buttonsByItem.get(previousSelectedItem) || activeButton;
    const shouldAnimate = previousSelectedItem !== selectedItem && buttonsByItem.has(previousSelectedItem);
    activeButton?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    moveViewerTabIndicator(container, activeButton, previousButton, { animate: shouldAnimate });
    observeViewerTabContainer(container);
    container.dataset.viewerSelectedItem = selectedItem;
  };

  ctx.renderSpecViewer = renderSpecViewer = (payload = {}) => {
    if (!specViewerList) return;

    const specs = Array.isArray(payload.specs) ? payload.specs : [];
    const invalidFiles = Array.isArray(payload.invalidFiles) ? payload.invalidFiles : [];
    if (specViewerRoot) {
      specViewerRoot.textContent = payload.rootPath || payload.rootName || '현재 파일 폴더';
      specViewerRoot.title = payload.rootPath || '';
    }
    if (specViewerCount) {
      specViewerCount.textContent = `${specs.length} APIs`;
    }
    if (specViewerNote) {
      specViewerNote.hidden = invalidFiles.length === 0;
      specViewerNote.textContent = invalidFiles.length > 0
        ? `작성기 양식과 맞지 않는 파일 ${invalidFiles.length}개는 뷰어에서 제외했습니다.`
        : '';
    }

    specViewerList.replaceChildren();
    if (specViewerEmpty) specViewerEmpty.hidden = specs.length > 0;
    if (specViewerFilters) specViewerFilters.hidden = specs.length === 0;
    if (specs.length === 0) return;

    const groupedSpecs = specs.reduce((commonGroups, spec) => {
      const common = viewerValue(spec.commonPath, '/');
      const version = viewerValue(spec.versionPath, '/');
      const subCategory = viewerValue(spec.subCategory, '/');
      if (!commonGroups.has(common)) commonGroups.set(common, new Map());
      const versionGroups = commonGroups.get(common);
      if (!versionGroups.has(version)) versionGroups.set(version, new Map());
      const subCategoryGroups = versionGroups.get(version);
      if (!subCategoryGroups.has(subCategory)) subCategoryGroups.set(subCategory, []);
      subCategoryGroups.get(subCategory).push(spec);
      return commonGroups;
    }, new Map());

    const commonNames = [...groupedSpecs.keys()].sort(compareViewerGroupName);
    if (!commonNames.includes(state.viewerCommon)) {
      state.viewerCommon = commonNames[0] || '';
    }

    const selectedVersionGroups = groupedSpecs.get(state.viewerCommon) || new Map();
    const versionNames = [...selectedVersionGroups.keys()].sort(compareViewerGroupName);
    if (!versionNames.includes(state.viewerVersion)) {
      state.viewerVersion = versionNames[0] || '';
    }

    renderViewerTabs(specCommonTabs, commonNames, state.viewerCommon, (nextCommon) => {
      state.viewerCommon = nextCommon;
      state.viewerVersion = '';
      renderSpecViewer(payload);
    });
    renderViewerTabs(specVersionTabs, versionNames, state.viewerVersion, (nextVersion) => {
      state.viewerVersion = nextVersion;
      renderSpecViewer(payload);
    });

    const selectedTagGroups = selectedVersionGroups.get(state.viewerVersion) || new Map();
    [...selectedTagGroups.entries()]
      .sort(([tagA], [tagB]) => compareViewerGroupName(tagA, tagB))
      .forEach(([tag, tagSpecs]) => {
        const tagGroup = document.createElement('section');
        tagGroup.className = 'spec-tag-group';
        const heading = document.createElement('button');
        heading.className = 'spec-tag-heading';
        heading.type = 'button';
        heading.setAttribute('aria-expanded', 'true');

        const tagContent = document.createElement('div');
        tagContent.className = 'spec-tag-content';
        heading.append(createTextElement('h3', '', tag), createTextElement('span', '', `${tagSpecs.length}개`));
        tagSpecs.forEach((spec) => {
          tagContent.append(createSpecCard(spec));
        });
        heading.addEventListener('click', () => {
          const isCollapsed = tagGroup.classList.toggle('collapsed');
          heading.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
        });
        tagGroup.append(heading, tagContent);
        specViewerList.append(tagGroup);
      });
  };

  ctx.openFolderViewer = openFolderViewer = async () => {
    if (state.viewerMode) {
      setViewTransitionSkeleton(true, 'editor');
      try {
        await waitForViewTransitionPreview();
        setSpecViewerMode(false);
        setStatus('작성기 보기');
      } finally {
        setViewTransitionSkeleton(false);
      }
      return;
    }

    if (!state.fileTreeOpened) {
      showWarningToast('뷰어를 열 수 없음', '홈에서 먼저 API 명세서 폴더를 열어주세요.');
      setStatus('뷰어 열기 실패');
      return;
    }

    setViewTransitionSkeleton(true, 'viewer');
    try {
      await refreshOpenedFileTree();
      await loadAuthPoliciesForOpenedFolder();
      const result = state.browserDirectoryHandle
        ? await readBrowserSpecSummaries()
        : await (async () => {
            const response = await fetch('/api/spec-viewer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
              const errorResult = await response.json().catch(() => ({}));
              throw new Error(errorResult.message || '현재 파일 폴더의 명세서를 읽지 못했습니다.');
            }
            return response.json();
          })();
      if (Array.isArray(result.apiPaths)) {
        state.folderApiPaths = normalizeFolderApiPaths(result.apiPaths);
        state.folderSpecFiles = normalizeFolderSpecFiles(result.specFiles);
        await syncAuthPoliciesWithOpenedFolder();
      }
      state.viewerCommon = '';
      state.viewerVersion = '';
      renderSpecViewer(result);
      setSpecViewerMode(true);
      setStatus(`${result.specs?.length || 0}개 명세서 표시`);
    } catch (error) {
      showErrorToast(
        '뷰어를 열 수 없음',
        error instanceof Error ? error.message : '현재 파일 폴더의 명세서를 읽지 못했습니다.',
      );
      setStatus('뷰어 열기 실패');
    } finally {
      await waitForViewTransitionPreview();
      setViewTransitionSkeleton(false);
    }
  };


  return {
    markActiveTreeFile,
    createFileTreeNode,
    renderFileTree,
    compareBrowserGroupName,
    getGroupedTreeSortName,
    isGroupedTreeRootFile,
    getSpecGroupingFromMarkdown,
    toGroupedFileTree,
    isBlankViewerValue,
    viewerValue,
    compareViewerGroupName,
    formatPathGroupValue,
    createTextElement,
    appendViewerMeta,
    createSpecDetailTable,
    createSpecJsonPreview,
    hasViewerKey,
    countViewerKeyRows,
    countViewerErrorRows,
    countViewerSuccessResponses,
    createSpecChip,
    createSpecCounter,
    getSpecSuccessResponses,
    createSpecDetailSection,
    createSpecSuccessResponseDetail,
    createSpecCard,
    getViewerTabIndicatorMetrics,
    setViewerTabIndicatorPosition,
    restoreViewerTabIndicatorPosition,
    refreshViewerTabIndicator,
    observeViewerTabContainer,
    moveViewerTabIndicator,
    renderViewerTabs,
    renderSpecViewer,
    openFolderViewer,
  };
};
