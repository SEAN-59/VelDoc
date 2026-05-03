export const createDropdownRuntime = (ctx) => {
  const {
    appShell,
    floatingMenu,
    menuBackdrop,
    menuButton,
    previewPanel,
    previewToggleButton,
    saveDropdown,
    saveMenuButton,
  } = ctx;

  const setFloatingMenuOpen = (isOpen) => {
    menuButton?.classList.toggle('active', isOpen);
    menuButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (floatingMenu) {
      floatingMenu.classList.toggle('open', isOpen);
      floatingMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      floatingMenu.inert = !isOpen;
    }
    if (menuBackdrop) {
      menuBackdrop.hidden = !isOpen;
    }
  };

  const isFloatingMenuOpen = () => Boolean(floatingMenu?.classList.contains('open'));

  const toggleFloatingMenu = () => {
    setFloatingMenuOpen(!isFloatingMenuOpen());
  };

  const setPreviewOpen = (isOpen) => {
    appShell?.classList.toggle('preview-closed', !isOpen);
    previewToggleButton?.classList.toggle('active', isOpen);
    previewToggleButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (previewPanel) {
      previewPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      previewPanel.inert = !isOpen;
    }
  };

  const setDropdownOpen = (button, menu, isOpen) => {
    if (!button || !menu) return;
    menu.hidden = !isOpen;
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const isDropdownOpen = (menu) => Boolean(menu && !menu.hidden);

  const closeActionDropdowns = () => {
    setDropdownOpen(saveMenuButton, saveDropdown, false);
  };

  return {
    closeActionDropdowns,
    isDropdownOpen,
    isFloatingMenuOpen,
    setDropdownOpen,
    setFloatingMenuOpen,
    setPreviewOpen,
    toggleFloatingMenu,
  };
};
