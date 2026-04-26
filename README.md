# Love Story 恋爱纪念网站

> 记录每一刻的甜蜜与感动

## 项目简介

这是一个为情侣设计的恋爱纪念网站，包含情书博物馆、照片墙、足迹地图、愿望清单、时间胶囊等功能模块。

## 快速开始

### 本地预览
```bash
cd love-site
python3 -m http.server 8080
# 访问 http://localhost:8080/
```

### 部署更新
```bash
./push.sh "更新说明"
```

## 网站地址

| 环境 | 地址 |
|------|------|
| Cloudflare Pages (主站) | https://love-anniversary.pages.dev/ |
| GitHub Pages (备站) | https://Lily1756.github.io/love-anniversary/ |

## 功能模块

| 模块 | 文件 | 说明 |
|------|------|------|
| 首页 | `index.html` | 密码锁、计时器、精选内容入口 |
| 情书博物馆 | `writings.html` | 32篇小作文，支持筛选和搜索 |
| 照片墙 | `photos.html` | 瀑布流布局，支持上传和灯箱 |
| 足迹地图 | `travels.html` | Leaflet + OpenStreetMap 地图 |
| 愿望清单 | `wishes.html` | 愿望管理和进度追踪 |
| 时间胶囊 | `time-capsule.html` | 未来时光留言 |
| 婚礼手册 | `wedding.html` | 旅行婚礼全程执行手册 |
| 音乐播放器 | `music-player.html` | 全局背景音乐 |

## 文件结构

```
love-site/
├── index.html              # 首页
├── writings.html           # 情书博物馆
├── photos.html             # 照片墙
├── travels.html            # 足迹地图
├── wishes.html             # 愿望清单
├── time-capsule.html       # 时间胶囊
├── music-player.html       # 音乐播放器
│
├── assets/                 # 静态资源
│   ├── icons/              # SVG 图标
│   │   ├── icon-writings.svg    # 情书图标
│   │   ├── icon-photos.svg      # 照片图标
│   │   ├── icon-travels.svg     # 足迹图标
│   │   ├── icon-wishes.svg     # 愿望图标
│   │   └── nav-logo.svg        # 导航 Logo
│   └── logo/               # Logo 图片
│
├── js/                     # JavaScript 模块
│   ├── simple-auth.js      # 认证模块（GitHub PAT）
│   ├── simple-edit.js      # 编辑模式（密码 2025）
│   └── photos.js           # 照片墙业务逻辑（Cloudinary 上传）
│
├── data/                   # JSON 数据
│   ├── diaries.json        # 情书数据（32篇）
│   ├── photos.json         # 照片元数据
│   ├── travels.json        # 足迹数据
│   ├── wishes.json         # 愿望数据
│   └── capsules.json       # 时间胶囊数据
│
├── music/                  # 背景音乐
│   └── once.mp3
│
├── style.css               # 全局样式
├── app.js                  # 共享功能
├── push.sh                 # 推送脚本
└── sync_diaries.py         # 滴答同步脚本
```

## 数据管理

### 认证方式
- **编辑密码**: `2025`
- **GitHub PAT**: 需要在 GitHub Settings → Developer settings 生成

### 数据存储
内容通过 GitHub API 存储到仓库的 JSON 文件中，照片通过 Cloudinary 上传：
- 照片上传到 Cloudinary（免费 25GB/月）
- 元数据保存在 `data/photos.json`

## 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **地图**: Leaflet + OpenStreetMap
- **存储**: GitHub API (REST) + Cloudinary（图片）
- **部署**: GitHub Pages

## 开发指南

### 添加新页面
1. 在项目根目录创建 `xxx.html`
2. 引入共享样式和脚本：
   ```html
   <link rel="stylesheet" href="style.css">
   <script src="js/simple-auth.js"></script>
   <script src="js/simple-edit.js"></script>
   ```
3. 添加页面内容

### 更新图标
图标文件位于 `assets/icons/`，所有图标使用统一的 SVG 格式：
- viewBox: 24x24 或自定义
- 颜色: 使用 CSS 变量或固定颜色
- 命名: `icon-{module}.svg`

### 同步滴答清单
```bash
python3 sync_diaries.py
```
- 自动同步滴答清单到 GitHub
- 每天北京时间 08:00 自动运行

## 版本历史

- **2026-04-26**: 代码重构（提取 photos.js，清理无用文件），照片上传迁移到 Cloudinary
- **2026-04-25**: 完成照片上传、图标更新、Cloudflare Pages 部署
- **2026-04-24**: 完成 GitHub OAuth 编辑系统、滴答同步
- **2026-04-23**: 完成足迹地图、情书博物馆、照片墙基础功能
