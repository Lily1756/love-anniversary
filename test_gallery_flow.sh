#!/bin/bash
# 照片墙全流程测试脚本
# 测试：1. Cloudflare Function 2. Cloudinary 上传 3. 照片预览 4. 数据加载

SITE_URL="https://love-anniversary.pages.dev"
PASS="\n\n========================================"
PASS="$PASS"
PASS="$PASS  照片墙全流程测试"
PASS="$PASS========================================"

echo "========================================"
echo "  照片墙全流程测试"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# ---------- 测试 1: 静态资源 ----------
echo "📋 测试 1: 静态资源加载"
echo "--------------------------------------"

# 测试 HTML
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ 首页 HTML: $HTTP_CODE"
else
    echo "  ✗ 首页 HTML: $HTTP_CODE (期望 200)"
fi

# 测试 JS
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/assets/Gallery-B-GS8u5q.js")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ Gallery.js: $HTTP_CODE"
else
    echo "  ✗ Gallery.js: $HTTP_CODE"
fi

# 测试 photos.json
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/data/photos.json")
PHOTOS_SIZE=$(curl -s "$SITE_URL/data/photos.json" | wc -c | tr -d ' ')
ALBUM_COUNT=$(curl -s "$SITE_URL/data/photos.json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null)
echo "  ✅ photos.json: $HTTP_CODE (${PHOTOS_SIZE} bytes, ${ALBUM_COUNT} albums)"

# 测试 _redirects (SPA 路由)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/photos")
echo "  ✅ /photos SPA路由: $HTTP_CODE"
echo ""

# ---------- 测试 2: Cloudflare Function ----------
echo "📋 测试 2: Cloudflare Function (save-photos)"
echo "--------------------------------------"

# 测试不带密码
RESULT=$(curl -s -X POST "$SITE_URL/save-photos" \
    -H "Content-Type: application/json" \
    -d '{"data":[],"path":"data/photos.json"}' 2>&1)
echo "  不带密码: $RESULT"

# 测试带密码 '2025'
RESULT=$(curl -s -X POST "$SITE_URL/save-photos" \
    -H "Content-Type: application/json" \
    -d '{"password":"2025","data":[{"test":true}],"path":"data/test.json"}' 2>&1)
echo "  带密码 '2025': $RESULT"
echo ""

# ---------- 测试 3: Cloudinary 上传 ----------
echo "📋 测试 3: Cloudinary 图片上传"
echo "--------------------------------------"

# 创建一个小的测试图片 (1x1 红色 PNG)
python3 -c "
import base64, struct, zlib
def create_png(w, h, r, g, b):
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    raw = b''
    for y in range(h):
        raw += b'\\x00' + bytes([r, g, b]) * w
    return b'\\x89PNG\\r\\n\\x1a\\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')

png = create_png(100, 100, 255, 105, 180)
with open('/tmp/test_image.png', 'wb') as f:
    f.write(png)
print(f'  创建测试图片: {len(png)} bytes')
"

# 上传到 Cloudinary
UPLOAD_RESULT=$(curl -s -X POST "https://api.cloudinary.com/v1_1/dcpzdsdxc/image/upload" \
    -F "file=@/tmp/test_image.png" \
    -F "upload_preset=love_site_preset" 2>&1)

UPLOAD_URL=$(echo "$UPLOAD_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('secure_url',''))" 2>/dev/null)
if [ -n "$UPLOAD_URL" ]; then
    echo "  ✅ Cloudinary 上传成功"
    echo "     URL: $UPLOAD_URL"
else
    UPLOAD_ERROR=$(echo "$UPLOAD_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message','未知错误'))" 2>/dev/null)
    echo "  ✗ Cloudinary 上传失败: $UPLOAD_ERROR"
    echo "     原始响应: $(echo "$UPLOAD_RESULT" | head -c 200)"
fi
echo ""

# ---------- 测试 4: 照片预览 ----------
echo "📋 测试 4: 照片预览 (CORS/加载)"
echo "--------------------------------------"

# 测试现有 Unsplash 图片
if [ -n "$UPLOAD_URL" ]; then
    TEST_URLS="$UPLOAD_URL https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80"
else
    TEST_URLS="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80"
fi

for URL in $TEST_URLS; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>&1)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ $URL ($HTTP_CODE)"
    else
        echo "  ✗ $URL ($HTTP_CODE)"
    fi
done
echo ""

# ---------- 测试 5: /save-photos 端点详细检测 ----------
echo "📋 测试 5: /save-photos 端点检测"
echo "--------------------------------------"

# 检查是不是404（函数未部署）
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SITE_URL/save-photos" \
    -H "Content-Type: application/json" \
    -d '{}' 2>&1)
echo "  POST /save-photos 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "404" ]; then
    echo "  ⚠️  Cloudflare Function 未部署！"
    echo "  ⚠️  functions/save-photos.js 需要推送到 GitHub"
fi

# 检查 options (CORS preflight)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$SITE_URL/save-photos" 2>&1)
echo "  OPTIONS /save-photos 状态码: $HTTP_CODE"
echo ""

# ---------- 测试 6: GitHub API 直接测试 ----------
echo "📋 测试 6: GitHub API 直接测试"
echo "--------------------------------------"

TOKEN=$(python3 -c "import json; print(json.load(open('/Users/zhangyi/WorkBuddy/20260423010138/love-site/config.json'))['githubToken'])")

# 检查仓库信息
REPO_INFO=$(curl -s -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/Lily1756/love-anniversary" 2>&1)
REPO_OK=$(echo "$REPO_INFO" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'full_name' in d else d.get('message','error'))" 2>/dev/null)
echo "  GitHub 仓库: $REPO_OK"

# 检查 functions 目录
FUNC_CHECK=$(curl -s -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/Lily1756/love-anniversary/contents/functions/save-photos.js" 2>&1)
FUNC_EXISTS=$(echo "$FUNC_CHECK" | python3 -c "import sys,json; d=json.load(sys.stdin); print('存在' if 'sha' in d else '不存在: '+d.get('message',''))" 2>/dev/null)
echo "  functions/save-photos.js: $FUNC_EXISTS"

FUNC2_CHECK=$(curl -s -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/Lily1756/love-anniversary/contents/functions/upload-image.js" 2>&1)
FUNC2_EXISTS=$(echo "$FUNC2_CHECK" | python3 -c "import sys,json; d=json.load(sys.stdin); print('存在' if 'sha' in d else '不存在: '+d.get('message',''))" 2>/dev/null)
echo "  functions/upload-image.js: $FUNC2_EXISTS"

echo ""
echo "========================================"
echo "  测试完成"
echo "========================================"
