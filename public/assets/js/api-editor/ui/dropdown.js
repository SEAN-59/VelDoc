export const createDropdownRuntime = (ctx) => {
  const {
    appShell,
    previewPanel,
    previewToggleButton,
    saveDropdown,
    saveMenuButton,
  } = ctx;

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
    setDropdownOpen,
    setPreviewOpen,
  };
};
