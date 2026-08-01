(() => {
  const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || ((navigator.maxTouchPoints || 0) > 1 && innerWidth < 1024);
  if (!isMobile()) return;

  const extractNoteId = (url) => {
    const value = String(url || '');
    const match = value.match(/(?:explore|discovery\/item)\/([0-9a-f]{24})/i) || value.match(/\b([0-9a-f]{24})\b/i);
    return match ? match[1] : '';
  };

  const openVideoFeed = (noteId, fallbackUrl) => {
    let leftPage = false;
    let timer;

    const clean = () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', watch);
      window.removeEventListener('pagehide', leave);
    };
    const leave = () => {
      leftPage = true;
      clean();
    };
    const watch = () => {
      if (document.hidden) leave();
    };

    document.addEventListener('visibilitychange', watch);
    window.addEventListener('pagehide', leave, { once: true });
    window.location.href = `xhsdiscover://video_feed/${noteId}?sourceID=explore`;

    timer = setTimeout(() => {
      clean();
      if (!leftPage && fallbackUrl) window.location.href = fallbackUrl;
    }, 1800);
  };

  const renameOne = (el, text) => {
    if (el && el.textContent !== text) el.textContent = text;
  };

  const renameOpeners = (root = document) => {
    if (!root.querySelectorAll) return;
    root.querySelectorAll('.watch-btn').forEach(el => renameOne(el, '视频流开演 ↗'));
    root.querySelectorAll('.direct-watch').forEach(el => renameOne(el, '🎬 视频流开演'));
    root.querySelectorAll('.open-external').forEach(el => renameOne(el, '立刻进视频流 ↗'));
  };

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-post], .watch-btn, .direct-watch, .open-external');
    if (!opener) return;

    const href = opener.getAttribute('href') || '';
    const noteId = extractNoteId(href);
    if (!noteId) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openVideoFeed(noteId, href);
  }, true);

  renameOpeners(document);

  // Only inspect newly inserted element nodes. Text changes are ignored, so this
  // cannot trigger the recursive mutation loop that froze iPhone Safari.
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.('.watch-btn')) renameOne(node, '视频流开演 ↗');
        if (node.matches?.('.direct-watch')) renameOne(node, '🎬 视频流开演');
        if (node.matches?.('.open-external')) renameOne(node, '立刻进视频流 ↗');
        renameOpeners(node);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
