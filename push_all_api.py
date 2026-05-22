#!/usr/bin/env python3
"""
强制推送文件到 GitHub，不管 git 状态
"""
import base64
import json
import os
import ssl
import urllib.request
import urllib.error
from urllib.parse import quote

GITHUB_API = "https://api.github.com"
REPO_OWNER = "Lily1756"
REPO_NAME = "love-anniversary"
REPO_PATH = "/Users/zhangyi/WorkBuddy/20260423010138/love-site"

# macOS SSL 修复
SSL_CONTEXT = ssl._create_unverified_context()

# 从 config.json 读取 Token
CONFIG_PATH = os.path.join(REPO_PATH, "config.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)
    GITHUB_TOKEN = config.get("githubToken", "")

# 需要推送的文件列表（本地路径, 仓库路径）
FILES_TO_PUSH = [
    ("src", "src"),           # 源码 - CF Pages 拉取并重新构建
    ("public", "public"),     # 静态资源
    ("dist", "dist"),         # 编译产物
    ("vite.config.ts", "vite.config.ts"),
    ("package.json", "package.json"),
    ("package-lock.json", "package-lock.json"),
    ("tsconfig.json", "tsconfig.json"),
    ("tsconfig.app.json", "tsconfig.app.json"),
    ("tsconfig.node.json", "tsconfig.node.json"),
    ("index.html", "index.html"),
    ("env.d.ts", "env.d.ts"),
    (".nvmrc", ".nvmrc"),     # CF Pages Node 版本锁定
]

def github_get(path):
    """GET request to GitHub API - get file info"""
    # 对路径中的中文和特殊字符进行 percent-encoding（/ 保留不编码）
    encoded_path = quote(path, safe='/')
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{encoded_path}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(req, timeout=10, context=SSL_CONTEXT) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise

def github_put(path, content, sha=None, message="Update via API"):
    """PUT request to GitHub API to create/update file"""
    # 对路径中的中文和特殊字符进行 percent-encoding（/ 保留不编码）
    encoded_path = quote(path, safe='/')
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{encoded_path}"
    data = {
        "message": message,
        "content": base64.b64encode(content).decode("ascii"),
    }
    if sha:
        data["sha"] = sha

    # ensure body is bytes (json.dumps produces str, encode to utf-8 for safety)
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CONTEXT) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        body_err = e.read().decode() if e.fp else ""
        return None, f"HTTP {e.code}: {body_err[:200]}"
    except Exception as e:
        return None, str(e)[:200]

def push_directory(local_dir, repo_dir):
    """Recursively push a directory"""
    success = 0
    fail = 0
    for root, dirs, files in os.walk(local_dir):
        for filename in files:
            local_path = os.path.join(root, filename)
            rel_path = os.path.relpath(local_path, REPO_PATH)
            repo_path = rel_path.replace("\\", "/")

            # ⚠️ 跳过数据文件（这些文件由应用通过 GitHub API 动态更新，避免本地旧数据覆盖远程新数据）
            if repo_path.startswith("public/data/"):
                print(f"  ⚠️  跳过数据文件: {repo_path}")
                continue

            try:
                with open(local_path, "rb") as f:
                    content = f.read()

                # Skip large files (>50MB, GitHub API limit is 100MB, leave some margin)
                if len(content) > 50 * 1024 * 1024:  # 50MB
                    print(f"  ⚠️  跳过大文件 (>50MB): {repo_path}")
                    continue

                # Get SHA if file exists
                remote_info = github_get(repo_path)
                sha = remote_info["sha"] if remote_info else None

                is_new = sha is None
                message = f"feat: 新增 {repo_path}" if is_new else f"chore: 更新 {repo_path}"

                result, error = github_put(repo_path, content, sha=sha, message=message)

                if result:
                    symbol = "🆕" if is_new else "🔄"
                    print(f"  {symbol} {repo_path}")
                    success += 1
                else:
                    print(f"  ✗ {repo_path} - {error}")
                    fail += 1

            except Exception as e:
                print(f"  ✗ {repo_path} - {str(e)[:100]}")
                fail += 1

    return success, fail

def main():
    print("🚀 开始通过 GitHub API 推送文件...\n")

    total_success = 0
    total_fail = 0

    for local_path, repo_path in FILES_TO_PUSH:
        full_local = os.path.join(REPO_PATH, local_path)

        if not os.path.exists(full_local):
            print(f"⚠️  文件不存在: {local_path}")
            continue

        if os.path.isdir(full_local):
            # 目录，递归处理
            print(f"📁 处理目录: {repo_path}")
            s, f = push_directory(full_local, repo_path)
            total_success += s
            total_fail += f
        else:
            # 单个文件
            try:
                with open(full_local, "rb") as f:
                    content = f.read()

                # Get SHA if file exists
                remote_info = github_get(repo_path)
                sha = remote_info["sha"] if remote_info else None

                is_new = sha is None
                message = f"feat: 新增 {repo_path}" if is_new else f"chore: 更新 {repo_path}"

                result, error = github_put(repo_path, content, sha=sha, message=message)

                if result:
                    symbol = "🆕" if is_new else "🔄"
                    print(f"  {symbol} {repo_path}")
                    total_success += 1
                else:
                    print(f"  ✗ {repo_path} - {error}")
                    total_fail += 1

            except Exception as e:
                print(f"  ✗ {repo_path} - {str(e)[:100]}")
                total_fail += 1

    print(f"\n✅ 完成: {total_success} 成功, {total_fail} 失败")

if __name__ == "__main__":
    main()
