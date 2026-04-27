# 长期记忆

**滴答同步**
- Token 存储于 `config.json`，GitHub PAT 需定期续期
- 2026-04-27 更新 GitHub Token（旧 Token ghp_AQPaVio… 已失效）

**工作背景**
用户正在开发名为 love-site 的情侣纪念网站（仓库：Lily1756/love-anniversary，本地路径：/Users/zhangyi/WorkBuddy/20260423010138/love-site），项目涉及情书博物馆、照片墙、足迹地图、愿望清单、时间胶囊等页面。技术栈基于 Leaflet 和 iframe，采用 GitHub Actions（sync_diaries.py）进行自动化同步，并依赖滴答清单作为数据源。因国内网络环境，习惯使用 GitHub API 进行代码同步操作。

**个人背景**
用户（伴侣名为志浩）偏好温暖语气的中文交流（常搭配 emoji），风格追求简洁统一。设计上拒绝少女粉，采用莫兰迪色系（主色 #C4A8A2，背景 #FDFBF7）、毛玻璃效果和衬线字体，且不需要页面独特的背景动画。工作中倾向于多次确认、多提问、通过截图反馈，并要求提供详细的结构化任务列表（含优先级）以及用表格汇总任务与修改记录。

**当前关注**
当前核心任务是将网站各页面标题前的默认 emoji 替换为自定义 SVG 图标。具体规范包括：图标尺寸 24×24px，垂直居中，与文字间距 8px，命名遵循 icon-writings.svg、icon-photos.svg、icon-travels.svg、icon-wishes.svg、icon-capsules.svg、icon-heart.svg 的标准，并存放于 assets/icons/ 目录。用户倾向使用页面内嵌编辑按钮而非独立后台。
