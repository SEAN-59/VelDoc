export const createHelpRuntime = (ctx) => {
  const {
    helpButton,
    helpDialog,
    helpDialogCloseButton,
    helpSections,
    helpTopicButtons,
  } = ctx;

  const closeActionDropdowns = (...args) => ctx.closeActionDropdowns(...args);

  const setHelpTopic = (topic) => {
    const nextTopic = topic || 'shortcuts';
    helpTopicButtons.forEach((button) => {
      const isActive = button.dataset.helpTopic === nextTopic;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    helpSections.forEach((section) => {
      section.classList.toggle('active', section.dataset.helpSection === nextTopic);
    });
  };

  const setHelpDialogOpen = (isOpen) => {
    if (!helpDialog) return;
    helpDialog.hidden = !isOpen;
    helpButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      closeActionDropdowns();
      setHelpTopic('shortcuts');
      helpDialogCloseButton?.focus();
      return;
    }
    helpButton?.focus();
  };

  return {
    setHelpDialogOpen,
    setHelpTopic,
  };
};
