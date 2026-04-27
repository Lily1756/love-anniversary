#!/usr/bin/env python3
"""
完整诊断脚本：测试 Cloudflare Function + Cloudinary 上传
"""
import json
import urllib.request
import urllib.error
import base64

print("=" * 60)
print("🔍 诊断报告")
print("=" * 60)

# ── 1. 检查 GitHub 仓库里的 functions 文件 ──────────────────────────
print("\n1️⃣  检查 GitHub 仓库文件...")
try:
    req = urllib.request.Request(
        "https://api.github.com/repos/Lily1756/love-anniversary/contents/functions/save-photos.js"
    )
    req.add_header("Accept", "application/vnd.github+json")
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        print(f"   ✅ functions/save-photos.js 存在 (大小: {data.get('size', 0)} bytes)")
except urllib.error.HTTPError as e:
    if e.code == 404:
        print("   ❌ functions/save-photos.js 不存在于仓库根目录")
    else:
        print(f"   ⚠️  检查失败: HTTP {e.code}")

# ── 2. 测试 Cloudflare Function ───────────────────────────────────
print("\n2️⃣  测试 Cloudflare Function...")
function_url = "https://love-anniversary.pages.dev/save-photos"
test_body = json.dumps({
    "password": "2025",
    "data": [{"id": "test", "title": "test-album", "photos": []}],
    "path": "data/photos.json"
}).encode("utf-8")

try:
    req = urllib.request.Request(
        function_url,
        data=test_body,
        method="POST",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode())
        print(f"   ✅ Function 响应成功")
        print(f"      状态: {resp.status}")
        print(f"      返回: {json.dumps(result, ensure_ascii=False)[:200]}")
except urllib.error.HTTPError as e:
    body = e.read().decode() if e.fp else ""
    print(f"   ❌ Function HTTP {e.code}: {body[:300]}")
except Exception as e:
    print(f"   ❌ Function 请求失败: {type(e).__name__}: {e}")

# ── 3. 测试 Cloudinary Upload Preset ───────────────────────────────
print("\n3️⃣  测试 Cloudinary Upload Preset...")
cloud_name = "dcpzdsdxc"
preset = "love_site_preset"
cloudinary_url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"

# 用一个 1x1 透明像素测试
tiny_png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body_lines = [
    f"--{boundary}",
    'Content-Disposition: form-data; name="file"',
    "Content-Type: application/octet-stream",
    "",
    base64.b64decode(tiny_png_b64),
    f"--{boundary}",
    f'Content-Disposition: form-data; name="upload_preset"',
    "",
    preset,
    f"--{boundary}--",
    ""
]

# 构建 multipart body
body = b""
for line in body_lines:
    if isinstance(line, bytes):
        body += line + b"\r\n"
    else:
        body += line.encode("utf-8") + b"\r\n"

try:
    req = urllib.request.Request(
        cloudinary_url,
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode())
        print(f"   ✅ Cloudinary 上传成功")
        print(f"      图片 URL: {result.get('secure_url', 'N/A')[:80]}...")
except urllib.error.HTTPError as e:
    body = e.read().decode() if e.fp else ""
    print(f"   ❌ Cloudinary HTTP {e.code}: {body[:500]}")
except Exception as e:
    print(f"   ❌ Cloudinary 请求失败: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print("诊断完成")
print("=" * 60)
