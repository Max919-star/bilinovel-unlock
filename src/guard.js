// Fallback layer: undoes the dialog's side effects if the site ever gets past main-world.js.
// Dialogs are hidden instead of removed because the site's countdown timer keeps looking
// them up by id and would throw every second otherwise.
(() => {
  const CONTENT_IDS = ['TextContent', 'acontent', 'volumes', 'volume-list'];
  const DIALOG_MARKERS = '#adblock-dialog, .fc-ab-root, .fc-whitelist-root, [id*="adblock" i], [class*="adblock" i], a[href*="whitelist"], iframe[src*="whitelist"]';
  const DIALOG_TEXT = /广告屏蔽|AdGuard|AdBlock|白名单/i;
  const MAX_DIALOG_TEXT = 500;

  const hide = (el) => el.style.setProperty('display', 'none', 'important');

  // Large containers (the reading area itself) are never treated as dialogs.
  const looksLikeDialog = (el) =>
    el.matches(DIALOG_MARKERS) ||
    (el.textContent.length < MAX_DIALOG_TEXT &&
      (el.querySelector(DIALOG_MARKERS) !== null || DIALOG_TEXT.test(el.textContent)));

  const hideDialogs = (nodes) => {
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE && node.parentElement === document.body && looksLikeDialog(node)) hide(node);
    }
  };

  const unlockScroll = () => {
    const { body } = document;
    if (body && body.classList.contains('no-scroll')) body.classList.remove('no-scroll');
  };

  const isBlockedPlaceholder = (el) => {
    const before = getComputedStyle(el, '::before').content;
    return before !== 'none' && DIALOG_TEXT.test(before);
  };

  const restoreContent = () => {
    for (const id of CONTENT_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.style.display === 'none') el.style.removeProperty('display');
      const prev = el.previousElementSibling;
      if (prev && prev.style.display !== 'none' && isBlockedPlaceholder(prev)) hide(prev);
    }
  };

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') hideDialogs(mutation.addedNodes);
    }
    unlockScroll();
    restoreContent();
  }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
})();
