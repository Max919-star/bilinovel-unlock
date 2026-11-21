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
