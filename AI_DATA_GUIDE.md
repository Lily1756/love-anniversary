# AI 数据操作规范

## 🎯 核心原则

1. **线上数据** → 必须放在 `public/data/`
2. **本地测试** → 必须放在 `.local_backup/`
3. **历史备份** → 必须放在 `.local_backup/data_history/`

## 📁 目录结构

```
love-site/
├── .local_backup/          # 🔒 本地隔离区（Git 忽略）
│   ├── test_data/          # 测试数据
│   ├── data_history/       # 历史备份
│   └── archived_versions/  # 旧版本
├── public/                 # 🌐 线上资源
│   └── data/              # 💎 唯一线上数据目录
│       ├── photos.json     # 相册数据
│       ├── travels.json    # 足迹数据
│       ├── diaries.json    # 情书数据
│       ├── wishes.json     # 愿望数据
│       └── capsules.json   # 时间胶囊数据
└── src/                   # 源代码
    ├── constants/
    │   └── paths.ts      # 路径常量定义
    └── ...
```

## 📝 AI 操作指令模板

### 场景 1：添加新相册

**任务**：添加「冬季风景」相册，包含 150 张照片

**操作**：
1. 创建新 JSON 文件：`public/data/photos.json`（追加到现有文件）
2. 本地测试数据放：`.local_backup/test_data/winter_draft.json`
3. 验证无误后，通过 GitHub API 推送

### 场景 2：修复数据错误

**任务**：修复 photos.json 中错误的路径

**操作**：
1. 备份当前：`cp public/data/photos.json .local_backup/data_history/photos_backup_$(date +%Y%m%d).json`
2. 修复文件：编辑 `public/data/photos.json`
3. 测试验证：在 `.local_backup/test_data/` 中创建测试副本

### 场景 3：批量处理照片

**任务**：批量更新照片元数据

**操作**：
1. 备份源文件到：`.local_backup/data_history/`
2. 处理脚本输出到：`.local_backup/test_data/processed.json`
3. 验证无误后，复制到：`public/data/photos.json`

## ⚠️ 绝对禁止

- ❌ 在根目录创建 `data/` 文件夹
- ❌ 在 `dist/` 中存放源数据
- ❌ 使用相对路径 `../data/` 引用数据
- ❌ 提交 `.local_backup/` 中的任何文件

## ✅ 必须遵守

- ✅ 所有线上数据 → `public/data/`
- ✅ 所有测试数据 → `.local_backup/test_data/`
- ✅ 所有历史数据 → `.local_backup/data_history/`
- ✅ 所有数据引用 → 使用绝对路径 `/data/xxx.json` 或通过 `paths.ts` 常量

## 🔍 路径验证

每次数据操作前，必须运行：

```bash
# 检查路径引用是否正确
grep -rn "'data/" src/ --include="*.ts" --include="*.vue" | grep -v "public/data"

# 如果有输出，说明有错误路径引用，必须先修正
```

## 📋 数据推送流程

1. 本地验证：`public/data/xxx.json` 数据正确
2. 备份旧数据：`.local_backup/data_history/xxx_$(date +%Y%m%d).json`
3. 推送 GitHub：使用 `push_all_api.py` 或 GitHub API
4. 验证线上：检查 `https://loveanniversary.com`

## 🚨 紧急情况处理

### 数据丢失
1. 立即检查 `.local_backup/data_history/` 中的备份
2. 检查 GitHub 历史版本（通过 Contents API 的 Git History）
3. 恢复数据到 `public/data/`
4. 推送恢复的数据到 GitHub

### 错误推送
1. 不要 panic
2. 从 `.local_backup/data_history/` 恢复正确版本
3. 推送正确版本到 GitHub
4. 触发 CF Pages 重新部署

## 📞 联系信息

如有疑问，请联系项目维护者：张祎（Lily1756）
