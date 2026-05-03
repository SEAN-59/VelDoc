export const createToastRuntime = (ctx) => {
  const { toastContainer } = ctx;

  const removeToast = (toast) => {
    if (!toast || toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    window.setTimeout(() => toast.remove(), 240);
  };

  const createToastTextElement = (tagName, className, text) => {
    if (typeof ctx.createTextElement === 'function') {
      return ctx.createTextElement(tagName, className, text);
    }
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  };

  const showToast = (type, title, message) => {
    if (!toastContainer) return;
    const icons = { success: '✓', warning: '!', danger: '✕', info: 'i' };
    const existingToasts = toastContainer.querySelectorAll('.toast');
    if (existingToasts.length >= 4) existingToasts[0].remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', type === 'danger' ? 'alert' : 'status');

    const icon = document.createElement('div');
    icon.className = `toast-icon ${type}`;
    icon.textContent = icons[type] || 'i';

    const content = document.createElement('div');
    content.className = 'toast-content';
    content.append(
      createToastTextElement('div', 'toast-title', title),
      createToastTextElement('div', 'toast-msg', message),
    );

    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', '토스트 닫기');
    closeButton.addEventListener('click', () => removeToast(toast));

    toast.append(icon, content, closeButton);
    toastContainer.append(toast);
    window.setTimeout(() => removeToast(toast), 4000);
  };

  const showSaveSuccessToast = (message = '변경사항이 저장되었습니다.') => {
    showToast('success', '저장 완료', message);
  };

  const showSaveFailureToast = (message = '저장하지 못했습니다.') => {
    showToast('danger', '저장 실패', message);
  };

  const showWarningToast = (title, message) => {
    showToast('warning', title, message);
  };

  const showErrorToast = (title, message) => {
    showToast('danger', title, message);
  };

  return {
    removeToast,
    showErrorToast,
    showSaveFailureToast,
    showSaveSuccessToast,
    showToast,
    showWarningToast,
  };
};
