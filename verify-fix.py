#!/usr/bin/env python3
"""
验证脚本：检查相册编辑按钮修复状态
"""
import urllib.request
import time

def check_cloudflare_html():
    """检查 Cloudflare Pages 上的 photos.html 是否包含 album-edit"""
    url = "https://love-anniversary.pages.dev/photos.html"
    try:
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        req.add_header("Cache-Control", "no-cache")
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8", errors="ignore")
        
        has_edit_css = ".album-edit" in content
        has_edit_js = "album-edit" in content  # JS 中的字符串
        has_v2 = "photos.js?v=2" in content
        
        return {
            "ok": True,
            "size": len(content),
            "has_edit_css": has_edit_css,
            "has_edit_js": has_edit_js,
            "has_v2": has_v2,
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}

print("=" * 60)
print("🔍 验证相册编辑按钮修复状态")
print("=" * 60)

# 检查 3 次，间隔 5 秒
for i in range(3):
    print(f"\n🔄 第 {i+1} 次检查...")
    result = check_cloudflare_html()
    
    if not result["ok"]:
        print(f"   ❌ 请求失败: {result['error']}")
    else:
        print(f"   文件大小: {result['size']} bytes")
        print(f"   {'✅' if result['has_edit_css'] else '❌'} album-edit CSS")
        print(f"   {'✅' if result['has_edit_js'] else '❌'} album-edit JS 引用")
        print(f"   {'✅' if result['has_v2'] else '❌'} JS 版本号 v=2")
        
        if result['has_edit_css'] and result['has_v2']:
            print("\n" + "=" * 60)
            print("✅ 所有检查通过！请强制刷新浏览器（Cmd+Shift+R）")
            print("=" * 60)
            exit(0)
    
    if i < 2:
        print("   ⏳ 等待 5 秒后重试...")
        time.sleep(5)

print("\n" + "=" * 60)
print("⚠️  Cloudflare Pages 可能仍在部署中")
print("   请等待 2-3 分钟后重新运行本脚本")
print("   或访问 https://dash.cloudflare.com 检查部署状态")
print("=" * 60)
