// ==UserScript==
// @name         哔轻反屏蔽解锁
// @namespace    bilinovel-unlock
// @version      1.0.0
// @description  去掉哔哩轻小说移动版的「广告屏蔽器」弹窗，恢复页面滚动，无需关闭去广告插件。
// @match        *://*.linovelib.com/*
// @match        *://*.bilinovel.com/*
// @match        *://*.bilinovel.net/*
// @match        *://*.bilinovel.org/*
// @match        *://*.bilinovel.de/*
// @match        *://*.bilinovel.co.uk/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// ==/UserScript==

// Runs in the page's own JS context before any site script.
// The site (readtools.js on chapter pages, newread.js on catalog pages) only shows the
// anti-adblock dialog when it finds an `ins.adsbygoogle` slot that stayed empty, or when
// a window-level capture `error` listener sees the adsbygoogle script fail to load.
// Removing the slots and hiding those load errors from window listeners defuses both paths.
(() => {
  const AD_RESOURCE = /googlesyndication|adsbygoogle|doubleclick|googletagservices|adservice\.google/i;
  const AD_SLOT = 'ins.adsbygoogle';

  const isAdResourceError = (event) => {
    const target = event && event.target;
    if (!target || target === window) return false;
    const url = target.src || target.href;
    return typeof url === 'string' && AD_RESOURCE.test(url);
  };

  const wrappedListeners = new WeakMap();
  const wrapErrorListener = (listener) => {
    const callable = typeof listener === 'function';
    if (!callable && !(listener && typeof listener.handleEvent === 'function')) return listener;
    let wrapped = wrappedListeners.get(listener);
    if (!wrapped) {
      wrapped = function (event) {
        if (isAdResourceError(event)) return undefined;
        return callable ? listener.call(this, event) : listener.handleEvent(event);
      };
      wrappedListeners.set(listener, wrapped);
    }
    return wrapped;
  };

  const proto = EventTarget.prototype;
  const nativeAdd = proto.addEventListener;
  const nativeRemove = proto.removeEventListener;

  proto.addEventListener = function addEventListener(type, listener, options) {
    if (this === window && type === 'error') listener = wrapErrorListener(listener);
    return nativeAdd.call(this, type, listener, options);
  };
  proto.removeEventListener = function removeEventListener(type, listener, options) {
    if (this === window && type === 'error' && listener) listener = wrappedListeners.get(listener) || listener;
    return nativeRemove.call(this, type, listener, options);
  };

  const removeAdSlots = (root) => {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.matches && root.matches(AD_SLOT)) {
      root.remove();
      return;
    }
    for (const slot of root.querySelectorAll(AD_SLOT)) slot.remove();
  };

  // The site's anti-adblock code touches `document.head` before checking whether any ad
  // slot is empty. Removing slots before <head> exists makes that code throw, so removal
  // only starts once the head element is in the document.
  const start = () => {
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) removeAdSlots(node);
      }
    }).observe(document, { childList: true, subtree: true });

    removeAdSlots(document);
  };

  if (document.head) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();


(() => {
  const css = "#adblock-dialog,\n.fc-ab-root,\n.fc-whitelist-root,\nins.adsbygoogle {\n  display: none !important;\n}\n\n/* Must out-rank the site's `body.no-scroll { overflow: hidden !important; }` from /public/mesp.css. */\nhtml body.no-scroll {\n  overflow-y: auto !important;\n}\n\nhtml body #TextContent,\nhtml body #acontent,\nhtml body #volumes,\nhtml body #volume-list {\n  display: block !important;\n}\n";
  const apply = () => {
    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.documentElement) apply();
  else {
    new MutationObserver((_, observer) => {
      if (document.documentElement) {
        observer.disconnect();
        apply();
      }
    }).observe(document, { childList: true });
  }
})();

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
