#!/usr/bin/env python3
"""
推送 Gallery.vue 更新到 GitHub
- 推送源码 src/views/Gallery.vue, src/composables/useUpload.ts
- 推送 dist/ 构建产物（Cloudflare Pages 用的）
"""
import base64
import json
import os
import sys
import urllib.request
import urllib.error

GITHUB_API = "https://api.github.com"
REPO_OWNER = "Lily1756"
REPO_NAME = "love-anniversary"
REPO_PATH = "/Users/zhangyi/WorkBuddy/20260423010138/love-site"

# 从 config.json 读取 Token
CONFIG_PATH = os.path.join(REPO_PATH, "config.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)
    GITHUB_TOKEN = config.get("githubToken", "")

if not GITHUB_TOKEN:
    print("❌ 未找到 GitHub Token")
    sys.exit(1)

# 需要推送的单文件
SINGLE_FILES = [
    "src/views/Gallery.vue",
    "src/composables/useUpload.ts",
    "src/types/index.ts",
    "dist/index.html",
]

# 需要推送的目录
DIRECTORIES = [
    "dist/assets",
    "dist/css",
]

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB (GitHub limit is 100MB but let's be safe)

def github_get(path):
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise

def github_put(path, content_bytes, sha=None, message="Update via API"):
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    data = {
        "message": message,
        "content": base64.b64encode(content_bytes).decode("ascii"),
    }
    if sha:
        data["sha"] = sha

    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        body_err = e.read().decode() if e.fp else ""
        return None, f"HTTP {e.code}: {body_err[:300]}"
    except Exception as e:
        return None, str(e)[:200]

def push_file(filepath):
    """推送单个文件"""
    full_path = os.path.join(REPO_PATH, filepath)
    if not os.path.isfile(full_path):
        print(f"  ⚠️  本地不存在: {filepath}")
        return 0, 1

    with open(full_path, "rb") as f:
        content = f.read()

    if len(content) > MAX_FILE_SIZE:
        print(f"  ⚠️  文件过大({len(content)//1024//1024}MB): {filepath}")
        return 0, 1

    # 获取远程 SHA
    remote_info = github_get(filepath)
    sha = remote_info["sha"] if remote_info else None
    is_new = sha is None

    message = f"feat: Gallery照片墙功能补全 - {filepath}"
    if is_new:
        message = f"feat: 新增 {filepath}"

    result, error = github_put(filepath, content, sha=sha, message=message)
    if result:
        symbol = "🆕" if is_new else "🔄"
        print(f"  {symbol} {filepath}")
        return 1, 0
    else:
        print(f"  ✗ {filepath} - {error}")
        return 0, 1

def push_directory(dir_path):
    """递归推送目录"""
    full_dir = os.path.join(REPO_PATH, dir_path)
    if not os.path.isdir(full_dir):
        print(f"  ⚠️  本地目录不存在: {dir_path}")
        return 0, 0

    success = 0
    fail = 0
    for root, dirs, files in os.walk(full_dir):
        for filename in files:
            local_path = os.path.join(root, filename)
            rel_path = os.path.relpath(local_path, REPO_PATH).replace("\\", "/")

            s, f = push_file(rel_path)
            success += s
            fail += f

    return success, fail

def main():
    print("🚀 推送 Gallery.vue 更新到 GitHub...\n")
    print("📋 源文件:")
    total_s, total_f = 0, 0

    for f in SINGLE_FILES:
        s, f = push_file(f)
        total_s += s
        total_f += f

    for d in DIRECTORIES:
        print(f"\n📁 目录: {d}")
        s, f = push_directory(d)
        total_s += s
        total_f += f

    print(f"\n{'='*40}")
    print(f"✅ 推送完成: {total_s} 成功, {total_f} 失败")
    if total_s > 0:
        print(f"🔗 线上地址: https://love-anniversary.pages.dev/photos")
        print(f"   Cloudflare Pages 将自动部署")

if __name__ == "__main__":
    main()
