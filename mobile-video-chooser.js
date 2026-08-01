(() => {
  const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || ((navigator.maxTouchPoints || 0) > 1 && innerWidth < 1024);
  if (!isMobile()) return;

  const extractNoteId = (url) => {
    const match = String(url || '').match(/(?:explore|discovery\/item)\/([0-9a-f]{24})/i) || String(url || '').match(/\b([0-9a-f]{24})\b/i);
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
    let sheet = document.getElementById('xhsVideoChooser');
    if (sheet) return sheet;
    const style = document.createElement('style');
    style.textContent = `
      #xhsVideoChooser{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;background:rgba(20,14,24,.62);backdrop-filter:blur(4px);padding:12px}
      #xhsVideoChooser.show{display:flex}
      #xhsVideoChooser .xvc-panel{width:100%;max-width:560px;margin:0 auto;background:#fffdf7;border:3px solid #211b25;box-shadow:7px 7px 0 #211b25;padding:18px;border-radius:18px 18px 8px 8px;max-height:88vh;overflow:auto}
      #xhsVideoChooser .xvc-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}
      #xhsVideoChooser h3{margin:0;font-size:22px;line-height:1.15}
      #xhsVideoChooser p{margin:6px 0 0;color:#726873;font-size:13px}
      #xhsVideoChooser .xvc-close{border:2px solid #211b25;background:#fff;width:38px;height:38px;font-size:22px;font-weight:900;flex:0 0 auto}
      #xhsVideoChooser .xvc-actions{display:grid;gap:10px}
      #xhsVideoChooser .xvc-btn{display:block;width:100%;border:3px solid #211b25;padding:14px 13px;font:inherit;font-weight:950;text-align:left;color:#211b25;text-decoration:none;background:#fff;box-shadow:4px 4px 0 #211b25}
      #xhsVideoChooser .xvc-btn strong{display:block;font-size:16px}
      #xhsVideoChooser .xvc-btn span{display:block;margin-top:3px;font-size:12px;font-weight:700;opacity:.72}
      #xhsVideoChooser .xvc-primary{background:#ff4f87;color:#fff}
      #xhsVideoChooser .xvc-secondary{background:#caff4a}
      #xhsVideoChooser .xvc-web{background:#72c8ff}
      #xhsVideoChooser .xvc-note{margin-top:13px;padding:10px;border:2px dashed #211b25;background:#fff2a7;font-size:12px;font-weight:750}
    `;
    document.head.appendChild(style);
    sheet = document.createElement('div');
    sheet.id = 'xhsVideoChooser';
    sheet.innerHTML = `
      <div class="xvc-panel" role="dialog" aria-modal="true" aria-labelledby="xvcTitle">
        <div class="xvc-head">
          <div><h3 id="xvcTitle">这条视频打算怎么开？</h3><p>小红书不同手机版本吃的路由不一样，别让一张封面图把你打发了。</p></div>
          <button class="xvc-close" type="button" aria-label="关闭">×</button>
        </div>
        <div class="xvc-actions">
          <button class="xvc-btn xvc-primary" type="button" data-xvc="detail"><strong>▶ 视频详情播放（先点这个）</strong><span>直接打开单条视频详情，适合大多数手机。</span></button>
          <button class="xvc-btn xvc-secondary" type="button" data-xvc="feed"><strong>📱 视频流播放（上面不动再点）</strong><span>进入小红书上下滑视频流，并定位到这篇。</span></button>
          <a class="xvc-btn xvc-web" data-xvc="web" href="#"><strong>🌐 网页原帖</strong><span>不走 App 深链，保留具体网页地址作为兜底。</span></a>
        </div>
        <div class="xvc-note">说明：网站可以把你送到正确的视频入口，但自动播放、声音和省流量策略仍由小红书 App 决定。</div>
      </div>`;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', (event) => {
      if (event.target === sheet || event.target.closest('.xvc-close')) sheet.classList.remove('show');
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
    sheet.querySelector('[data-xvc="web"]').href = webUrl;
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
    const action = event.target.closest('[data-xvc]');
    if (!action || !action.closest('#xhsVideoChooser')) return;
    const sheet = document.getElementById('xhsVideoChooser');
    const noteId = sheet.dataset.noteId;
    const webUrl = sheet.dataset.webUrl;
    if (action.dataset.xvc === 'web') {
      sheet.classList.remove('show');
      return;
    }
    event.preventDefault();
    sheet.classList.remove('show');
    if (action.dataset.xvc === 'detail') {
      openScheme(`xhsdiscover://item/${noteId}?type=vedio&source=deeplink`, webUrl);
    } else if (action.dataset.xvc === 'feed') {
      openScheme(`xhsdiscover://video_feed/${noteId}?sourceID=explore`, webUrl);
    }
  });
})();
