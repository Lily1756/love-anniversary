#!/bin/bash
# AI Agent 初始化脚本
# 用法：bash .ai_agent_init.sh

echo "🔍 读取 AI Agent 协作规范..."
if [ -f ".github/AI_AGENT_GUIDELINES.md" ]; then
  echo "📄 找到规范文件，核心要点如下："
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🚨 本项目推送规范："
  echo "     禁止 git push，使用 python3 push_all_api.py"
  echo ""
  echo "  📦 构建 + 推送完整流程："
  echo "     1. npm run build"
  echo "     2. python3 push_all_api.py"
  echo ""
  echo "  🔐 localStorage 缓存（核心资产，禁止删除）："
  echo "     LS_KEYS + lsGet/lsSet 在 src/stores/index.ts"
  echo ""
  echo "  💾 数据写入必须保持 读→改→写 三步流程"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  完整规范：cat .github/AI_AGENT_GUIDELINES.md"
  echo ""
  echo "✅ 规范加载完成，请严格遵守上述规定。"
else
  echo "⚠️  警告：未找到规范文件，请从 GitHub 仓库拉取最新代码。"
fi

echo ""
echo "📊 当前本地修改状态："
git status --short
echo ""
