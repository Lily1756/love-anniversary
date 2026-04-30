#!/bin/bash
# 推送 Gallery.vue 更新到 GitHub via curl
REPO_OWNER="Lily1756"
REPO_NAME="love-anniversary"
BASE_DIR="/Users/zhangyi/WorkBuddy/20260423010138/love-site"

# 读取 Token
TOKEN=$(python3 -c "import json; print(json.load(open('$BASE_DIR/config.json'))['githubToken'])")

API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/contents"

github_get() {
    local path="$1"
    curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" "$API_URL/$path" 2>/dev/null
}

github_put() {
    local path="$1"
    local content_b64="$2"
    local sha="$3"
    local message="$4"
    
    local json_data="{\"message\":\"$message\",\"content\":\"$content_b64\""
    if [ -n "$sha" ]; then
        json_data="$json_data,\"sha\":\"$sha\""
    fi
    json_data="$json_data}"
    
    curl -s -X PUT -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "Content-Type: application/json" \
        -d "$json_data" "$API_URL/$path" 2>/dev/null
}

push_file() {
    local filepath="$1"
    local full_path="$BASE_DIR/$filepath"
    
    if [ ! -f "$full_path" ]; then
        echo "  ⚠️  本地不存在: $filepath"
        return 1
    fi
    
    local content_b64=$(base64 -i "$full_path" | tr -d '\n')
    local file_size=$(wc -c < "$full_path" | tr -d ' ')
    
    if [ "$file_size" -gt 50000000 ]; then
        echo "  ⚠️  文件过大(${file_size}): $filepath"
        return 1
    fi
    
    # 获取远程 SHA
    local remote_info=$(github_get "$filepath")
    local sha=""
    local is_new=true
    
    if echo "$remote_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null | grep -q .; then
        sha=$(echo "$remote_info" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
        is_new=false
    fi
    
    local message="feat: Gallery照片墙功能补全 - $filepath"
    if [ "$is_new" = true ]; then
        message="feat: 新增 $filepath"
    fi
    
    local result=$(github_put "$filepath" "$content_b64" "$sha" "$message")
    
    if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha',''))" 2>/dev/null | grep -q .; then
        if [ "$is_new" = true ]; then
            echo "  🆕 $filepath"
        else
            echo "  🔄 $filepath"
        fi
        return 0
    else
        local error_msg=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message','')[:100])" 2>/dev/null)
        echo "  ✗ $filepath - $error_msg"
        return 1
    fi
}

echo "🚀 推送 Gallery.vue 更新到 GitHub..."
echo ""

SUCCESS=0
FAIL=0

echo "📋 源文件:"
for f in "src/views/Gallery.vue" "src/composables/useUpload.ts" "src/types/index.ts" "dist/index.html"; do
    if push_file "$f"; then
        SUCCESS=$((SUCCESS+1))
    else
        FAIL=$((FAIL+1))
    fi
done

echo ""
echo "📁 dist/assets/:"
for f in "$BASE_DIR"/dist/assets/*; do
    if [ -f "$f" ]; then
        fname=$(basename "$f")
        if push_file "dist/assets/$fname"; then
            SUCCESS=$((SUCCESS+1))
        else
            FAIL=$((FAIL+1))
        fi
    fi
done

echo ""
echo "📁 dist/css/:"
for f in "$BASE_DIR"/dist/assets/*.css 2>/dev/null; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    if push_file "dist/assets/$fname"; then
        SUCCESS=$((SUCCESS+1))
    else
        FAIL=$((FAIL+1))
    fi
done

echo ""
echo "========================================"
echo "✅ 推送完成: $SUCCESS 成功, $FAIL 失败"
if [ $SUCCESS -gt 0 ]; then
    echo "🔗 线上地址: https://love-anniversary.pages.dev/photos"
    echo "   Cloudflare Pages 将自动部署（约1-2分钟）"
fi
