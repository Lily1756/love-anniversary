#!/usr/bin/env python3
"""
端到端测试脚本
验证 Cloudflare Functions 是否正常部署和工作
"""
import json
import urllib.request

BASE_URL = "https://love-anniversary.pages.dev"

def test_endpoint(name, method, path, body=None, headers=None):
    """测试单个接口"""
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("User-Agent", "Mozilla/5.0 (TestScript)")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    if body:
        req.data = json.dumps(body).encode("utf-8")

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read().decode()
            return resp.status, data
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode() if e.fp else ""
    except Exception as e:
        return -1, str(e)

print("=" * 60)
print("🧪 端到端测试")
print("=" * 60)

# ── 1. 测试 /save-photos ──────────────────────────────────────────
print("\n1️⃣  测试 /save-photos（保存相册元数据）...")
status, body = test_endpoint(
    "save-photos",
    "POST",
    "/save-photos",
    body={
        "password": "2025",
        "data": [{"id": "test-e2e", "title": "端到端测试", "photos": [], "cover": ""}],
        "path": "data/photos.json"
    },
    headers={"Content-Type": "application/json"}
)
if status == 200:
    result = json.loads(body)
    if result.get("success"):
        print("   ✅ /save-photos 工作正常")
        print(f"      返回: {json.dumps(result, ensure_ascii=False)[:100]}")
    else:
        print(f"   ❌ /save-photos 返回异常: {body[:200]}")
elif status == 404:
    print("   ⏳ /save-photos 尚未部署（等待 Cloudflare Pages 重新构建）")
else:
    print(f"   ❌ /save-photos HTTP {status}: {body[:300]}")

# ── 2. 测试 /upload-image ─────────────────────────────────────────
print("\n2️⃣  测试 /upload-image（上传图片到 Cloudinary）...")
# 用 1x1 透明像素测试
tiny_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

status, body = test_endpoint(
    "upload-image",
    "POST",
    "/upload-image",
    body={
        "password": "2025",
        "file": tiny_png_b64
    },
    headers={"Content-Type": "application/json"}
)
if status == 200:
    result = json.loads(body)
    if result.get("success"):
        print("   ✅ /upload-image 工作正常")
        print(f"      Cloudinary URL: {result.get('url', 'N/A')[:80]}...")
    else:
        print(f"   ❌ /upload-image 返回异常: {body[:200]}")
elif status == 404:
    print("   ⏳ /upload-image 尚未部署（等待 Cloudflare Pages 重新构建）")
else:
    print(f"   ❌ /upload-image HTTP {status}: {body[:300]}")

# ── 3. 测试密码验证 ───────────────────────────────────────────────
print("\n3️⃣  测试密码验证（错误密码应返回 403）...")
status, body = test_endpoint(
    "upload-image-wrong-pw",
    "POST",
    "/upload-image",
    body={
        "password": "wrong",
        "file": tiny_png_b64
    },
    headers={"Content-Type": "application/json"}
)
if status == 403:
    print("   ✅ 密码验证工作正常（错误密码被拒绝）")
else:
    print(f"   ⚠️  密码验证返回 HTTP {status}（期望 403）")

print("\n" + "=" * 60)
print("测试完成")
print("=" * 60)
print("\n📋 说明：")
print("   - 如果显示 ⏳，说明 Cloudflare Pages 还在重新部署中")
print("   - 请等待 1-2 分钟后重新运行本脚本")
print("   - 部署完成后，所有测试应显示 ✅")
