export const createSideMenuRuntime = (ctx) => {
  const {
    COMPACT_FILE_PANEL_QUERY,
    SIDE_MENU_COLLAPSE_WIDTH,
    SIDE_MENU_DEFAULT_WIDTH,
    SIDE_MENU_MAX_WIDTH,
    SIDE_MENU_MIN_WIDTH,
    SIDE_MENU_NARROW_WIDTH,
    SIDE_MENU_SNAP_RANGE,
    SIDE_MENU_WIDTH_KEY,
    appShell,
    filePanelBackdrop,
    filePanelRail,
    sideMenu,
    sideMenuResizer,
    state,
  } = ctx;

  const setStatus = (...args) => ctx.setStatus(...args);

  const clampSideMenuWidth = (value) =>
    Math.min(SIDE_MENU_MAX_WIDTH, Math.max(SIDE_MENU_MIN_WIDTH, Number(value) || SIDE_MENU_DEFAULT_WIDTH));

  const isCompactFilePanelLayout = () => window.matchMedia(COMPACT_FILE_PANEL_QUERY).matches;

  const setSideMenuWidth = (width, { persist = true } = {}) => {
    state.sideMenuWidth = clampSideMenuWidth(width);
    document.documentElement.style.setProperty('--side-menu-width', `${state.sideMenuWidth}px`);
    sideMenu?.classList.toggle('is-narrow', state.sideMenuWidth < SIDE_MENU_NARROW_WIDTH);
    sideMenuResizer?.setAttribute('aria-valuenow', String(Math.round(state.sideMenuWidth)));
    if (persist) localStorage.setItem(SIDE_MENU_WIDTH_KEY, String(Math.round(state.sideMenuWidth)));
  };

  const setFileDrawerOpen = (isOpen) => {
    state.fileDrawerOpen = isOpen;
    appShell?.classList.toggle('file-drawer-open', isOpen);
    document.body.classList.toggle('file-drawer-open', isOpen);
    if (filePanelBackdrop) filePanelBackdrop.hidden = !isOpen;
    filePanelRail?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (sideMenu && isCompactFilePanelLayout()) {
      sideMenu.inert = !isOpen;
      sideMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
    updateFilePanelRail();
  };

  const setSideMenuHidden = (isHidden) => {
    state.sideMenuHidden = isHidden;
    appShell?.classList.toggle('side-menu-hidden', isHidden);
    appShell?.classList.remove('side-menu-collapsing');
    if (sideMenu && !isCompactFilePanelLayout()) {
      sideMenu.inert = isHidden;
      sideMenu.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
    }
    updateFilePanelRail();
  };

  function updateFilePanelRail() {
    const shouldShow = isCompactFilePanelLayout()
      ? !state.fileDrawerOpen
      : state.sideMenuHidden || Boolean(appShell?.classList.contains('side-menu-collapsing'));
    document.body.classList.toggle('file-rail-visible', shouldShow);
  }

  const syncFilePanelLayoutMode = () => {
    const isCompact = isCompactFilePanelLayout();
    document.body.classList.toggle('compact-file-panel', isCompact);

    if (isCompact) {
      appShell?.classList.remove('side-menu-hidden', 'side-menu-collapsing');
      state.sideMenuHidden = false;
      if (sideMenu) {
        sideMenu.inert = !state.fileDrawerOpen;
        sideMenu.setAttribute('aria-hidden', state.fileDrawerOpen ? 'false' : 'true');
      }
    } else {
      setFileDrawerOpen(false);
      if (sideMenu) {
        sideMenu.inert = state.sideMenuHidden;
        sideMenu.setAttribute('aria-hidden', state.sideMenuHidden ? 'true' : 'false');
      }
    }
    updateFilePanelRail();
  };

  const restoreSideMenuWidth = () => {
    localStorage.removeItem(SIDE_MENU_WIDTH_KEY);
    setSideMenuWidth(SIDE_MENU_DEFAULT_WIDTH, { persist: false });
  };

  const startSideMenuResize = (event) => {
    if (isCompactFilePanelLayout()) return;
    event.preventDefault();
    ctx.sideMenuResizeState = {
      startX: event.clientX,
      startWidth: state.sideMenuWidth,
      shouldCollapse: false,
    };
    document.body.classList.add('resizing-side-menu');
    sideMenuResizer?.setPointerCapture?.(event.pointerId);
  };

  const moveSideMenuResize = (event) => {
    if (!ctx.sideMenuResizeState) return;

    const nextWidth = ctx.sideMenuResizeState.startWidth + event.clientX - ctx.sideMenuResizeState.startX;
    const shouldCollapse = nextWidth < SIDE_MENU_COLLAPSE_WIDTH;
    ctx.sideMenuResizeState.shouldCollapse = shouldCollapse;

    if (shouldCollapse) {
      appShell?.classList.add('side-menu-collapsing');
      updateFilePanelRail();
      return;
    }

    appShell?.classList.remove('side-menu-collapsing');
    const snappedWidth = nextWidth < SIDE_MENU_MIN_WIDTH + SIDE_MENU_SNAP_RANGE
      ? SIDE_MENU_MIN_WIDTH
      : nextWidth;
    setSideMenuWidth(snappedWidth);
    if (state.sideMenuHidden) setSideMenuHidden(false);
  };

  const stopSideMenuResize = (event) => {
    if (!ctx.sideMenuResizeState) return;
    document.body.classList.remove('resizing-side-menu');
    sideMenuResizer?.releasePointerCapture?.(event.pointerId);
    const shouldCollapse = ctx.sideMenuResizeState.shouldCollapse;
    ctx.sideMenuResizeState = null;

    if (shouldCollapse) {
      setSideMenuHidden(true);
      setStatus('파일 패널 접힘');
      return;
    }

    appShell?.classList.remove('side-menu-collapsing');
    updateFilePanelRail();
  };

  const openFilePanelFromRail = () => {
    if (isCompactFilePanelLayout()) {
      setFileDrawerOpen(true);
      return;
    }

    setSideMenuWidth(SIDE_MENU_DEFAULT_WIDTH);
    setSideMenuHidden(false);
    setStatus('파일 패널 표시');
  };

  const adjustSideMenuFromKeyboard = (event) => {
    if (isCompactFilePanelLayout()) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'Home') {
      setSideMenuWidth(SIDE_MENU_MIN_WIDTH);
      return;
    }
    if (event.key === 'End') {
      setSideMenuWidth(SIDE_MENU_MAX_WIDTH);
      return;
    }

    const delta = event.key === 'ArrowRight' ? 12 : -12;
    const nextWidth = state.sideMenuWidth + delta;
    if (nextWidth < SIDE_MENU_COLLAPSE_WIDTH) {
      setSideMenuHidden(true);
      return;
    }
    setSideMenuWidth(nextWidth);
  };

  return {
    adjustSideMenuFromKeyboard,
    clampSideMenuWidth,
    isCompactFilePanelLayout,
    moveSideMenuResize,
    openFilePanelFromRail,
    restoreSideMenuWidth,
    setFileDrawerOpen,
    setSideMenuHidden,
    setSideMenuWidth,
    startSideMenuResize,
    stopSideMenuResize,
    syncFilePanelLayoutMode,
    updateFilePanelRail,
  };
};
