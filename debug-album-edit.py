#!/usr/bin/env python3
"""
诊断相册编辑按钮不显示的问题
"""
import urllib.request
import re

URLS = {
    "GitHub HTML": "https://raw.githubusercontent.com/Lily1756/love-anniversary/main/photos.html",
    "Cloudflare HTML": "https://love-anniversary.pages.dev/photos.html",
    "GitHub JS": "https://raw.githubusercontent.com/Lily1756/love-anniversary/main/js/photos.js",
    "Cloudflare JS": "https://love-anniversary.pages.dev/js/photos.js",
}

print("=" * 60)
print("🔍 相册编辑按钮诊断")
print("=" * 60)

for name, url in URLS.items():
    print(f"\n📄 {name}")
    print(f"   URL: {url}")
    try:
        req = urllib.request.Request(url)
        req.add_header("Cache-Control", "no-cache")
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8", errors="ignore")

        # 检查 album-edit
        has_edit = "album-edit" in content
        # 检查 album-delete
        has_delete = "album-delete" in content
        # 检查 edit-mode 样式
        has_edit_mode = "edit-mode" in content

        print(f"   ✅ 响应正常 ({len(content)} bytes)")
        print(f"   {'✅' if has_edit else '❌'} album-edit: {'存在' if has_edit else '不存在'}")
        print(f"   {'✅' if has_delete else '❌'} album-delete: {'存在' if has_delete else '不存在'}")
        print(f"   {'✅' if has_edit_mode else '❌'} edit-mode: {'存在' if has_edit_mode else '不存在'}")

        if has_edit:
            # 提取 album-edit CSS 片段
            match = re.search(r"\.album-edit\s*\{[^}]+\}", content, re.DOTALL)
            if match:
                css = match.group(0).replace("\n", " ").replace("  ", " ")
                print(f"   📐 CSS: {css[:200]}")
            else:
                print(f"   ⚠️  找到 album-edit 但未提取到 CSS")

    except Exception as e:
        print(f"   ❌ 请求失败: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print("诊断结论")
print("=" * 60)
print("""
如果 Cloudflare HTML 显示 ❌ album-edit，说明 CSS 样式未部署。
修复方案：在 photos.html 的 head 中内联 CSS，确保不受缓存影响。
""")
