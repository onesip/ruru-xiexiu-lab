# 如如邪修研究所

把小红书收藏夹整理成可搜索、可分类、可回原帖观看的邪修百科。

## 当前版本

- 65 条收藏已整理
- 支持标题、作者、分类和关键词搜索
- 支持本地记录「封神 / 能用 / 就这 / 翻车」
- 原帖视频不再使用 iframe 嵌入，直接打开作者原帖，避免白屏
- 手机和桌面端适配

## 部署

这是纯静态网站，Vercel 导入本仓库即可部署：

- Framework Preset：Other
- Build Command：留空
- Output Directory：留空
- Root Directory：仓库根目录

## 文件结构

- `index.html`：页面结构
- `style.css`：视觉样式
- `app.js`：搜索、筛选、详情、用户备注
- `data-1.js` 至 `data-5.js`：65 条结构化收藏数据
- `vercel.json`：Vercel 配置

## 原帖说明

小红书通常禁止第三方网站通过 iframe 嵌入其页面，因此本站直接打开原帖。这样能正常播放视频，也保留作者、评论和上下文。
