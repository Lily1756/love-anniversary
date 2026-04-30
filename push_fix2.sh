#!/bin/bash
# 推送所有修复
BASE_DIR="/Users/zhangyi/WorkBuddy/20260423010138/love-site"
TOKEN=$(python3 -c "import json; print(json.load(open('$BASE_DIR/config.json'))['githubToken'])")
API_URL="https://api.github.com/repos/Lily1756/love-anniversary/contents"

push_file() {
    local filepath="$1"
    local full_path="$BASE_DIR/$filepath"
    [ -f "$full_path" ] || { echo "  ⚠️  跳过: $filepath"; return; }
    
    local content_b64=$(base64 -i "$full_path" | tr -d '\n')
    local remote_info=$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" "$API_URL/$filepath" 2>/dev/null)
    local sha=""
    if echo "$remote_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null | grep -q .; then
        sha=$(echo "$remote_info" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
    fi
    
    local result=$(curl -s -X PUT -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "Content-Type: application/json" \
        -d "{\"message\":\"fix: 照片墙完整修复 - $filepath\",\"content\":\"$content_b64\",\"sha\":\"$sha\"}" "$API_URL/$filepath" 2>/dev/null)
    
    if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha',''))" 2>/dev/null | grep -q .; then
        echo "  ✅ $filepath"
    else
        echo "  ✗ $filepath"
    fi
}

echo "🚀 推送修复..."
echo ""

echo "📋 源文件:"
push_file "src/views/Gallery.vue"
push_file "src/stores/index.ts"
push_file "src/composables/useUpload.ts"
push_file "functions/save-photos.js"

echo ""
echo "📁 构建产物:"
push_file "dist/index.html"
for f in "$BASE_DIR"/dist/assets/*; do
    [ -f "$f" ] || continue
    push_file "dist/assets/$(basename "$f")"
done
for f in "$BASE_DIR"/dist/data/*; do
    [ -f "$f" ] || continue
    push_file "dist/data/$(basename "$f")"
done

echo ""
echo "📁 数据文件 (根目录):"
for f in "$BASE_DIR"/public/data/*; do
    [ -f "$f" ] || continue
    push_file "data/$(basename "$f")"
done

echo ""
echo "✅ 推送完成！等待 Cloudflare Pages 部署..."
echo "🔗 https://love-anniversary.pages.dev/photos"
