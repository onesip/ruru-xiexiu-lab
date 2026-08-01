(() => {
  const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || ((navigator.maxTouchPoints || 0) > 1 && innerWidth < 1024);
  if (!isMobile()) return;

  const extractNoteId = (url) => {
    const value = String(url || '');
    const match = value.match(/(?:explore|discovery\/item)\/([0-9a-f]{24})/i) || value.match(/\b([0-9a-f]{24})\b/i);
    return match ? match[1] : '';
  };

  const openScheme = (scheme, fallbackUrl) => {
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
    window.location.href = scheme;
    timer = setTimeout(() => {
      clean();
      if (!leftPage && fallbackUrl) window.location.href = fallbackUrl;
    }, 1800);
  };

  const ensureSheet = () => {
    let sheet = document.getElementById('xhsLaunchSheet');
    if (sheet) return sheet;

    const style = document.createElement('style');
    style.textContent = `
      #xhsLaunchSheet{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;background:rgba(20,14,24,.62);backdrop-filter:blur(4px);padding:12px;font-family:inherit}
      #xhsLaunchSheet.show{display:flex}
      #xhsLaunchSheet .xhs-sheet{width:100%;max-width:560px;margin:0 auto;background:#fffdf7;border:3px solid #211b25;box-shadow:7px 7px 0 #211b25;padding:18px;border-radius:18px 18px 8px 8px;max-height:88vh;overflow:auto;position:relative}
      #xhsLaunchSheet .xhs-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}
      #xhsLaunchSheet h2{margin:0;font-size:23px;line-height:1.15}
      #xhsLaunchSheet p{margin:6px 0 0;color:#726873;font-size:13px;line-height:1.55}
      #xhsLaunchSheet .xhs-close{border:2px solid #211b25;background:#fff;width:38px;height:38px;font-size:22px;font-weight:900;flex:0 0 auto}
      #xhsLaunchSheet .xhs-actions{display:grid;gap:10px}
      #xhsLaunchSheet .xhs-option{display:block;width:100%;border:3px solid #211b25;padding:14px 13px;font:inherit;font-weight:950;text-align:left;color:#211b25;text-decoration:none;background:#fff;box-shadow:4px 4px 0 #211b25}
      #xhsLaunchSheet .xhs-option strong{display:block;font-size:16px}
      #xhsLaunchSheet .xhs-option span{display:block;margin-top:3px;font-size:12px;font-weight:700;opacity:.75}
      #xhsLaunchSheet .xhs-primary{background:#ff4f87;color:#fff}
      #xhsLaunchSheet .xhs-secondary{background:#caff4a}
      #xhsLaunchSheet .xhs-web{background:#72c8ff}
      #xhsLaunchSheet .xhs-note{margin-top:13px;padding:10px;border:2px dashed #211b25;background:#fff2a7;font-size:12px;font-weight:750}
    `;
    document.head.appendChild(style);

    sheet = document.createElement('div');
    sheet.id = 'xhsLaunchSheet';
    sheet.innerHTML = `
      <section class="xhs-sheet" role="dialog" aria-modal="true" aria-labelledby="xhsSheetTitle">
        <div class="xhs-head">
          <div>
            <h2 id="xhsSheetTitle">这条视频打算怎么开？</h2>
            <p>不同手机和小红书版本吃的路由不一样。先点第一种；还是一张封面，就返回试第二种。</p>
          </div>
          <button class="xhs-close" type="button" aria-label="关闭">×</button>
        </div>
        <div class="xhs-actions">
          <button class="xhs-option xhs-primary" type="button" data-xhs-mode="detail"><strong>▶ 视频详情播放（先点这个）</strong><span>尝试打开这篇单独的视频详情。</span></button>
          <button class="xhs-option xhs-secondary" type="button" data-xhs-mode="feed"><strong>📱 视频流播放（上面不动再点）</strong><span>尝试进入上下滑的视频流并定位到这篇。</span></button>
          <a class="xhs-option xhs-web" data-xhs-mode="web" href="#"><strong>🌐 网页原帖</strong><span>保留完整笔记地址作为兜底。</span></a>
        </div>
        <div class="xhs-note">网站能把你送到指定入口，但是否自动播放、是否有声音，最终仍由小红书 App 决定。</div>
      </section>`;
    document.body.appendChild(sheet);

    sheet.addEventListener('click', (event) => {
      if (event.target === sheet || event.target.closest('.xhs-close')) sheet.classList.remove('show');
    });
    return sheet;
  };

  const showChooser = (webUrl) => {
    const noteId = extractNoteId(webUrl);
    if (!noteId) {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const sheet = ensureSheet();
    sheet.dataset.noteId = noteId;
    sheet.dataset.webUrl = webUrl;
    sheet.querySelector('[data-xhs-mode="web"]').href = webUrl;
    sheet.classList.add('show');
  };

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-post], .watch-btn, .direct-watch, .open-external');
    if (!opener) return;
    const href = opener.getAttribute('href') || '';
    if (!extractNoteId(href)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showChooser(href);
  }, true);

  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-xhs-mode]');
    if (!action || !action.closest('#xhsLaunchSheet')) return;
    const sheet = document.getElementById('xhsLaunchSheet');
    const noteId = sheet.dataset.noteId;
    const webUrl = sheet.dataset.webUrl;

    if (action.dataset.xhsMode === 'web') {
      sheet.classList.remove('show');
      return;
    }

    event.preventDefault();
    sheet.classList.remove('show');
    if (action.dataset.xhsMode === 'detail') {
      openScheme(`xhsdiscover://item/${noteId}?type=vedio&source=deeplink`, webUrl);
    } else if (action.dataset.xhsMode === 'feed') {
      openScheme(`xhsdiscover://video_feed/${noteId}?sourceID=explore`, webUrl);
    }
  });
})();
