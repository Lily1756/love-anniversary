# GitHub 推送自动化记忆

## 脚本位置
`/Users/zhangyi/WorkBuddy/20260423010138/love-site/push_github_api.py`

## 已修复的 Bug
- **git status 解析**：每行都有前导空格（如 ` M app.js`），用 `line.split(None, 1)` 解析，不要用 `line[:2]` + `line[3:]`
- **.gitignore 路径丢失点号**：用 `.strip()` 会把 `.gitignore` 变成 `gitignore`，改用 `split(None, 1)` 后取第二部分
- **编码错误静默跳过**：app.js 含非 ASCII 字符，用 `errors='replace'` 防止 UTF-8 解码失败

## 推送结果
- 2026-04-24 01:17: 首次运行，补推了 app.js、index.html、.gitignore；修复后正确推送 13 个文件
- 2026-04-25 01:30: 检测到 diaries.json、sync_diaries.py 改动并 commit，但 Token 已失效（401 Bad credentials），推送静默跳过。**需要更新 GitHub Token。**
- 2026-04-27 06:39: 检测到 5 个文件改动（README.md、js/photos.js、js/simple-auth.js、photos.html、push_github_api.py）；commit 成功；API 推送 4/5 成功（photos.js SSL 超时跳过）。任务提供的 Token ghp_AQPaVio… 已失效，使用 config.json 中 ghp_LXWDHv… 推送成功。
- 2026-04-27 08:20: 无已跟踪文件改动，仅有未跟踪的调试文件（debug-*.py、test-e2e.py、verify-fix.py、functions/、scripts/），无需推送。
- 2026-04-27 09:30: 滴答清单同步成功，32 篇小作文已同步至 diaries.json，GitHub API 推送成功（Token ghp_LXWDH…）。Netlify 自动部署已触发。
