(()=>{
  const legacy=document.createElement('script');
  legacy.src='https://cdn.jsdelivr.net/gh/onesip/ruru-xiexiu-lab@9fdd91544d3a1f37c6457e3d4a264a967987b9ef/app.js';
  legacy.onload=()=>{
    appLinkOf=function(i,mode='video'){
      const id=noteIdOf(i);
      if(!id)return '';
      return mode==='image'
        ?`xhsdiscover://item/${id}?type=normal&source=deeplink`
        :`xhsdiscover://video_feed/${id}?sourceID=explore`;
    };
    openPost=function(i,mode='video'){
      const web=webLinkOf(i)||i.original_post_url;
      if(!isMobileDevice()||!noteIdOf(i)){
        window.open(web,'_blank','noopener,noreferrer');
        return;
      }
      let leftPage=false,timer;
      const done=()=>{
        leftPage=true;
        clearTimeout(timer);
        document.removeEventListener('visibilitychange',watch);
        window.removeEventListener('pagehide',done);
      };
      const watch=()=>{if(document.hidden)done()};
      document.addEventListener('visibilitychange',watch);
      window.addEventListener('pagehide',done,{once:true});
      location.href=appLinkOf(i,mode);
      timer=setTimeout(()=>{
        document.removeEventListener('visibilitychange',watch);
        window.removeEventListener('pagehide',done);
        if(!leftPage)location.href=web;
      },1600);
    };
    bindPostOpeners=function(root=document){
      root.querySelectorAll('[data-open-post]').forEach(el=>{
        el.onclick=e=>{
          e.preventDefault();
          const i=state.all.find(x=>String(x.id)===String(el.dataset.openPost));
          if(i)openPost(i,el.dataset.openMode||'video');
        };
      });
    };
    card=function(i){
      const tags=(i.initial_tags||[]).slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
      return `<article class="card" data-category="${esc(i.initial_category)}"><div class="card-top"></div><span class="stamp">${i.original_post_url?'原帖健在':'待招魂'}</span><div class="card-inner"><div class="card-meta"><span class="school">${esc(i.ui_emoji)} ${esc(i.ui_category)}</span><span class="entry-id">#${String(i.id).padStart(2,'0')}</span></div><h3>${esc(i.visible_title)}</h3><div class="author">@${esc(i.author)}</div><div class="human-line">${esc(i.ui_summary)}</div><div class="tags">${tags}</div><div class="warning ${riskHot(i)?'hot':''}">${esc(friendlyStatus(i))}</div><div class="card-actions"><button class="summary-btn" data-summary="${i.id}">先看人话</button><a class="watch-btn" href="${esc(webLinkOf(i))}" data-open-post="${i.id}" data-open-mode="video">视频原帖开演 ↗</a></div></div></article>`;
    };
    postPane=function(i){
      return `<div class="tab-pane hide" data-pane="post"><div class="post-toolbar"><div><strong>原帖按正确姿势开演</strong><span>视频帖走视频 Feed，图文帖走普通详情。别再把电影送进相册。</span></div><a class="open-external" href="${esc(webLinkOf(i))}" data-open-post="${i.id}" data-open-mode="video">视频开演 ↗</a></div><div class="launch-stage"><div class="launch-copy"><b>同一个笔记，<br>开门姿势不同。</b><p>上一版虽然定位到了正确笔记，但用了图文详情路由，所以视频只露出封面，像电影海报成精。现在主按钮改走小红书的视频 Feed 路由。</p><div class="platform-note"><strong>手机端：</strong>先试视频模式，视频帖会进入播放器；若这条本来就是图文帖，点旁边的图文模式。是否自动有声播放仍受小红书的静音、省流量和系统设置影响。</div></div><div class="launch-card"><div class="big-play">▶</div><h3>选对姿势，少走弯路</h3><p class="small">绝大多数邪修教程是视频，默认先按视频模式开。图文笔记则用备用入口。</p><div class="launch-actions"><a class="direct-watch" href="${esc(webLinkOf(i))}" data-open-post="${i.id}" data-open-mode="video">▶ 视频模式打开</a><a class="secondary-link" href="${esc(webLinkOf(i))}" data-open-post="${i.id}" data-open-mode="image">🖼 图文模式打开</a><a class="secondary-link" href="${esc(i.xiaohongshu_search_url||i.original_post_url)}" target="_blank" rel="noopener noreferrer">还不行？按标题搜</a><button class="copy-post-link" type="button" data-copy-post="${esc(i.original_post_url)}">复制原帖链接</button></div></div></div></div>`;
    };
    apply();
  };
  legacy.onerror=()=>{
    const grid=document.getElementById('cardGrid');
    if(grid)grid.innerHTML='<div class="empty"><strong>数据库今天掉线了。</strong><p>刷新一下，赛博道友马上回来。</p></div>';
  };
  document.head.appendChild(legacy);
})();
