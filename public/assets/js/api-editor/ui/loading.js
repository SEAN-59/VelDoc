export const createLoadingRuntime = (ctx) => {
  const {
    pageLoadingOverlay,
    pageLoadingText,
    viewerTransitionSkeleton,
    workspace,
  } = ctx;

  const showPageLoading = (message = '처리 중...') => {
    if (pageLoadingText) pageLoadingText.textContent = message;
    if (pageLoadingOverlay) pageLoadingOverlay.hidden = false;
  };

  const hidePageLoading = () => {
    if (pageLoadingOverlay) pageLoadingOverlay.hidden = true;
  };

  const delay = (duration) => new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

  const waitForViewTransitionPreview = () => Promise.resolve();

  const setViewTransitionSkeleton = (isVisible, mode = 'viewer') => {
    workspace?.classList.toggle('is-view-transitioning', isVisible);
    if (viewerTransitionSkeleton) {
      viewerTransitionSkeleton.dataset.mode = mode;
      viewerTransitionSkeleton.hidden = !isVisible;
    }
  };

  return {
    delay,
    hidePageLoading,
    setViewTransitionSkeleton,
    showPageLoading,
    waitForViewTransitionPreview,
  };
};
