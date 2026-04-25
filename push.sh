#!/bin/bash
# push.sh - 一键推送到 GitHub，自动更新 Cloudflare Pages
# 用法: ./push.sh "提交信息"

set -e

# 默认提交信息
COMMIT_MSG="${1:-更新网站}"

cd "$(dirname "$0")"

echo "📦 开始推送..."
echo ""

# 添加所有更改
git add -A

# 检查是否有更改
if git diff --cached --quiet; then
    echo "✨ 没有需要推送的更改"
    exit 0
fi

# 提交
echo "📝 提交: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# 推送到 GitHub
echo "🚀 推送到 GitHub..."
git push origin main

echo ""
echo "✅ 推送成功！"
echo "🌐 Cloudflare Pages 将在 1-2 分钟内自动更新"
echo "🔗 https://love-anniversary.pages.dev/"
