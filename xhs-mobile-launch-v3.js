(() => {
  const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const extractId = (url = '') => {
    const m = String(url).match(/\/(?:explore|discovery\/item)\/([0-9a-f]{24})/i);
    return m ? m[1] : '';
  };

  const ensureSheet = () => {
    let sheet = document.getElementById('xhsLaunchSheet');
    if (sheet) return sheet;
    sheet = document.createElement('div');
    sheet.id = 'xhsLaunchSheet';
    sheet.innerHTML = `
      <div class="xhs-sheet-backdrop" data-xhs-close></div>
      <section class="xhs-sheet" role="dialog" aria-modal="true" aria-labelledby="xhsSheetTitle">
        <button class="xhs-sheet-close" type="button" data-xhs-close>×</button>
        <div class="xhs-sheet-kicker">小红书入口又开始玄学了</div>
        <h2 id="xhsSheetTitle">选一个能动的打开方式</h2>
        <p>不同手机和小红书版本会抽不同的风。第一种优先进入单条视频详情；还是只给封面，就试第二种视频流。</p>
        <div class="xhs-sheet-actions">
          <button type="button" data-xhs-mode="detail">▶ 视频详情播放（推荐）</button>
          <button type="button" data-xhs-mode="feed">📱 视频流播放（备选）</button>
          <a data-xhs-mode="web" target="_blank" rel="noopener noreferrer">🌐 网页原帖</a>
        </div>
        <small>说明：网站能精确送到笔记，但无法替小红书 App 强制开启自动播放或声音。</small>
      </section>`;
    document.body.appendChild(sheet);
    sheet.querySelectorAll('[data-xhs-close]').forEach(el => el.addEventListener('click', () => sheet.classList.remove('show')));
    return sheet;
  };

  const openScheme = (scheme, webUrl) => {
    const started = Date.now();
    window.location.href = scheme;
    setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - started < 4500) {
        window.location.href = webUrl;
      }
    }, 1800);
  };

  const showChooser = (url) => {
    const id = extractId(url);
    if (!id) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    const sheet = ensureSheet();
    const web = sheet.querySelector('[data-xhs-mode="web"]');
    web.href = url;
    sheet.querySelector('[data-xhs-mode="detail"]').onclick = () => {
      sheet.classList.remove('show');
      const scheme = `xhsdiscover://item/discovery.${id}?type=vedio&source=explore&sourceID=explore&single=true`;
      openScheme(scheme, url);
    };
    sheet.querySelector('[data-xhs-mode="feed"]').onclick = () => {
      sheet.classList.remove('show');
      const scheme = `xhsdiscover://video_feed/discovery.${id}?sourceID=explore`;
      openScheme(scheme, url);
    };
    sheet.classList.add('show');
  };

  document.addEventListener('click', (event) => {
    if (!isMobile()) return;
    const link = event.target.closest('a[href*="xiaohongshu.com/explore/"]');
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showChooser(link.href);
  }, true);

  const style = document.createElement('style');
  style.textContent = `
    #xhsLaunchSheet{position:fixed;inset:0;z-index:99999;display:none;font-family:inherit}
    #xhsLaunchSheet.show{display:block}
    .xhs-sheet-backdrop{position:absolute;inset:0;background:rgba(25,18,27,.68);backdrop-filter:blur(4px)}
    .xhs-sheet{position:absolute;left:10px;right:10px;bottom:10px;background:#fffdf7;border:3px solid #211b25;box-shadow:7px 7px 0 #211b25;padding:22px 18px calc(18px + env(safe-area-inset-bottom));max-height:84vh;overflow:auto}
    .xhs-sheet-close{position:absolute;right:10px;top:10px;width:38px;height:38px;border:2px solid #211b25;background:#fff;font-size:24px;font-weight:900}
    .xhs-sheet-kicker{font-size:12px;font-weight:950;color:#7759e8;margin-right:44px}
    .xhs-sheet h2{font-size:27px;line-height:1.08;margin:8px 42px 10px 0}
    .xhs-sheet p{font-size:14px;line-height:1.65;margin:0 0 14px;color:#5f5361}
    .xhs-sheet-actions{display:grid;gap:10px}
    .xhs-sheet-actions button,.xhs-sheet-actions a{display:flex;align-items:center;justify-content:center;min-height:50px;border:3px solid #211b25;padding:11px 12px;text-decoration:none;color:#211b25;font:inherit;font-weight:950;text-align:center}
    .xhs-sheet-actions button:first-child{background:#ff4f87;color:#fff;box-shadow:4px 4px 0 #211b25}
    .xhs-sheet-actions button:nth-child(2){background:#caff4a}
    .xhs-sheet-actions a{background:#fff}
    .xhs-sheet small{display:block;margin-top:13px;color:#726873;line-height:1.5}
  `;
  document.head.appendChild(style);
})();