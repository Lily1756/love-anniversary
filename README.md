# Love Story 恋爱纪念网站

> 记录每一刻的甜蜜与感动

---

## 🤖 AI Agent 须知

在开始工作前，**必须**先阅读 [.github/AI_AGENT_GUIDELINES.md](.github/AI_AGENT_GUIDELINES.md) 中的协作规范。

快速初始化：
```bash
bash .ai_agent_init.sh
```

**核心约束（必须记住）：**
- ❌ 禁止 `git push` → ✅ 使用 `python3 push_all_api.py`
- ❌ 禁止全量覆盖写 JSON → ✅ 保持读→改→写三步流程
- ❌ 禁止删除 `localStorage` 缓存逻辑（`LS_KEYS` / `lsGet` / `lsSet`）

---

## 项目简介

这是一个为情侣设计的恋爱纪念网站，包含情书馆、照片墙、足迹地图、愿望清单、时间胶囊等功能模块。

## 网站地址

| 环境 | 地址 |
|------|------|
| Cloudflare Pages（主站） | https://love-anniversary.pages.dev/ |

## 快速开始

### 本地开发
```bash
cd love-site
npm install
npm run dev
```

### 构建 + 部署
```bash
npm run build
python3 push_all_api.py
```
> ⚠️ 不要使用 `git push`，网络不稳定。`push_all_api.py` 通过 GitHub API 增量推送，只传变化的文件。

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 密码锁、倒计时 |
| 情书馆 | `/letters` | 日记/小作文，支持筛选和星光图联动 |
| 照片墙 | `/gallery` | 相册管理，Cloudinary 上传 |
| 足迹地图 | `/footprints` | Leaflet + OpenStreetMap |
| 愿望清单 | `/wishlist` | 愿望管理 |
| 时间胶囊 | `/capsules` | 未来留言 |

## 技术栈

- **框架**：Vue 3 + Vite + TypeScript + Pinia
- **路由**：Vue Router
- **地图**：Leaflet + OpenStreetMap
- **图床**：Cloudinary（cloud name: `dcpzdsdxc`）
- **数据存储**：GitHub 仓库 JSON 文件（`public/data/`）
- **部署**：Cloudflare Pages（监听 main 分支自动构建）

## 文件结构

```
love-site/
├── src/
│   ├── views/             # 页面组件
│   ├── components/        # 通用/功能组件
│   ├── stores/index.ts    # Pinia Store（含 localStorage 缓存架构）
│   ├── composables/       # 组合式函数
│   └── router/            # 路由配置
├── public/data/           # 静态数据文件
│   ├── diaries.json       # 情书数据
│   ├── photos.json        # 照片元数据
│   ├── travels.json       # 足迹数据
│   ├── wishes.json        # 愿望数据
│   └── capsules.json      # 时间胶囊数据
├── dist/                  # 构建产物（由 push_all_api.py 推送）
├── push_all_api.py        # GitHub API 增量推送脚本
├── .ai_agent_init.sh      # AI Agent 初始化脚本
└── .github/
    └── AI_AGENT_GUIDELINES.md  # AI Agent 协作规范
```

## 数据管理

- **编辑密码**：`2025`
- **数据读取**：GitHub Contents API（生产环境直连，开发环境走 Vite 代理）
- **数据写入**：读→改→写三步流程（获取 SHA → 合并 → PUT）
- **缓存策略**：localStorage 优先读，写入成功后同步更新缓存

## 版本历史

- **2026-05-13**：完善 localStorage 缓存架构，修复 wishes/capsules 缓存写入 bug
- **2026-05-12**：修复 base64 中文乱码（TextDecoder），修复 loadWishes/loadCapsules 空数据
- **2026-05-11**：修复 Cloudinary 上传 SSL 证书问题，修复幽灵保存 bug
- **2026-05-10**：迁移到 Vue 3 + Vite，强制推送修复 Git 分叉
- **2026-04-28**：TimeDNA 组件，按月聚合展示
- **2026-04-26**：Cloudflare Pages 部署，照片迁移到 Cloudinary
