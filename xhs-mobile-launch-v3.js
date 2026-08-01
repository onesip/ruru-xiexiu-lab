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

  const renameOpeners = (root = document) => {
    root.querySelectorAll('.watch-btn').forEach(el => { el.textContent = '视频流开演 ↗'; });
    root.querySelectorAll('.direct-watch').forEach(el => { el.textContent = '🎬 视频流开演'; });
    root.querySelectorAll('.open-external').forEach(el => { el.textContent = '立刻进视频流 ↗'; });
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

  renameOpeners();
  const observer = new MutationObserver(() => renameOpeners());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
