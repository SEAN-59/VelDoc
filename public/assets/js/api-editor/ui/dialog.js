export const createDialogRuntime = (ctx) => {
  const {
    messageDialog,
    messageDialogBody,
    messageDialogCancelButton,
    messageDialogCloseButton,
    messageDialogTitle,
  } = ctx;

  const closeMessageDialog = (confirmed = false) => {
    if (messageDialog) messageDialog.hidden = true;
    if (messageDialogCancelButton) {
      messageDialogCancelButton.hidden = true;
      messageDialogCancelButton.textContent = '취소';
    }
    if (messageDialogCloseButton) messageDialogCloseButton.textContent = '확인';
    const resolver = ctx.messageDialogResolver;
    ctx.messageDialogResolver = null;
    ctx.messageDialogMode = 'alert';
    ctx.messageDialogReturnFocus?.focus();
    ctx.messageDialogReturnFocus = null;
    resolver?.(confirmed);
  };

  const hideMessageDialog = () => {
    closeMessageDialog(false);
  };

  const setMessageDialogBody = (message) => {
    if (!messageDialogBody) return;

    const parts = String(message ?? '').split('<br>');
    messageDialogBody.replaceChildren();
    parts.forEach((part, index) => {
      if (index > 0) messageDialogBody.append(document.createElement('br'));
      messageDialogBody.append(document.createTextNode(part));
    });
  };

  const showConfirmDialog = (title, message, options = {}) => {
    ctx.messageDialogResolver?.(false);
    return new Promise((resolve) => {
      ctx.messageDialogResolver = resolve;
      ctx.messageDialogMode = 'confirm';
      ctx.messageDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (messageDialogTitle) messageDialogTitle.textContent = title;
      setMessageDialogBody(message);
      if (messageDialogCancelButton) {
        messageDialogCancelButton.hidden = false;
        messageDialogCancelButton.textContent = options.cancelText || '취소';
      }
      if (messageDialogCloseButton) messageDialogCloseButton.textContent = options.confirmText || '확인';
      if (messageDialog) messageDialog.hidden = false;
      messageDialogCancelButton?.focus();
    });
  };

  const showAlertDialog = (title, message, options = {}) => {
    ctx.messageDialogResolver?.(false);
    return new Promise((resolve) => {
      ctx.messageDialogResolver = resolve;
      ctx.messageDialogMode = 'alert';
      ctx.messageDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (messageDialogTitle) messageDialogTitle.textContent = title;
      setMessageDialogBody(message);
      if (messageDialogCancelButton) {
        messageDialogCancelButton.hidden = true;
        messageDialogCancelButton.textContent = '취소';
      }
      if (messageDialogCloseButton) messageDialogCloseButton.textContent = options.confirmText || '확인';
      if (messageDialog) messageDialog.hidden = false;
      messageDialogCloseButton?.focus();
    });
  };

  return {
    closeMessageDialog,
    hideMessageDialog,
    setMessageDialogBody,
    showAlertDialog,
    showConfirmDialog,
  };
};
