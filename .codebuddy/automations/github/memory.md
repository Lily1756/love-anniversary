# GitHub 推送自动化记忆

## 脚本位置
`/Users/zhangyi/WorkBuddy/20260423010138/love-site/push_github_api.py`

## 已修复的 Bug
- **git status 解析**：每行都有前导空格（如 ` M app.js`），用 `line.split(None, 1)` 解析，不要用 `line[:2]` + `line[3:]`
- **.gitignore 路径丢失点号**：用 `.strip()` 会把 `.gitignore` 变成 `gitignore`，改用 `split(None, 1)` 后取第二部分
- **编码错误静默跳过**：app.js 含非 ASCII 字符，用 `errors='replace'` 防止 UTF-8 解码失败

## 推送结果
- 2026-04-24 01:17: 首次运行，补推了 app.js、index.html、.gitignore；修复后正确推送 13 个文件
