#!/bin/bash
# 推送修复更新到 GitHub
REPO_OWNER="Lily1756"
REPO_NAME="love-anniversary"
BASE_DIR="/Users/zhangyi/WorkBuddy/20260423010138/love-site"
TOKEN=$(python3 -c "import json; print(json.load(open('$BASE_DIR/config.json'))['githubToken'])")
API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/contents"

push_file() {
    local filepath="$1"
    local full_path="$BASE_DIR/$filepath"
    
    if [ ! -f "$full_path" ]; then
        echo "  ⚠️  跳过(不存在): $filepath"
        return
    fi
    
    local content_b64=$(base64 -i "$full_path" | tr -d '\n')
    local file_size=$(wc -c < "$full_path" | tr -d ' ')
    
    if [ "$file_size" -gt 50000000 ]; then
        echo "  ⚠️  跳过(过大): $filepath ($file_size bytes)"
        return
    fi
    
    local remote_info=$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" "$API_URL/$filepath" 2>/dev/null)
    local sha=""
    local is_new=true
    
    if echo "$remote_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null | grep -q .; then
        sha=$(echo "$remote_info" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
        is_new=false
    fi
    
    local message="fix: 照片墙保存&预览修复 - $filepath"
    if [ "$is_new" = true ]; then
        message="feat: 新增 $filepath"
    fi
    
    local result=$(curl -s -X PUT -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "Content-Type: application/json" \
        -d "{\"message\":\"$message\",\"content\":\"$content_b64\",\"sha\":\"$sha\"}" "$API_URL/$filepath" 2>/dev/null)
    
    if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha',''))" 2>/dev/null | grep -q .; then
        if [ "$is_new" = true ]; then
            echo "  🆕 $filepath"
        else
            echo "  🔄 $filepath"
        fi
    else
        local error_msg=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message','')[:100])" 2>/dev/null)
        echo "  ✗ $filepath - $error_msg"
    fi
}

echo "🚀 推送修复更新..."
echo ""

echo "📋 源文件:"
push_file "src/views/Gallery.vue"
push_file "functions/save-photos.js"

echo ""
echo "📁 构建产物:"
push_file "dist/index.html"

for f in "$BASE_DIR"/dist/assets/*; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    push_file "dist/assets/$fname"
done

# 推送 dist/data
for f in "$BASE_DIR"/dist/data/*; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    push_file "dist/data/$fname"
done

echo ""
echo "📁 public/data (根目录数据):"
for f in "$BASE_DIR"/public/data/*; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    # 推送到仓库根目录的 data/
    full_path="$f"
    content_b64=$(base64 -i "$full_path" | tr -d '\n')
    remote_info=$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" "$API_URL/data/$fname" 2>/dev/null)
    sha=""
    if echo "$remote_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null | grep -q .; then
        sha=$(echo "$remote_info" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
    fi
    result=$(curl -s -X PUT -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "Content-Type: application/json" \
        -d "{\"message\":\"fix: 数据同步 - data/$fname\",\"content\":\"$content_b64\",\"sha\":\"$sha\"}" "$API_URL/data/$fname" 2>/dev/null)
    if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha',''))" 2>/dev/null | grep -q .; then
        echo "  🔄 data/$fname"
    else
        echo "  ✗ data/$fname"
    fi
done

echo ""
echo "✅ 推送完成"
