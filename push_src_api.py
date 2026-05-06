#!/usr/bin/env python3
"""推送 src/ 和配置文件到 GitHub"""
import base64
import json
import os
import ssl
import time
import urllib.request
import urllib.error

GITHUB_API = "https://api.github.com"
REPO_OWNER = "Lily1756"
REPO_NAME = "love-anniversary"
REPO_PATH = "/Users/zhangyi/WorkBuddy/20260423010138/love-site"
SSL_CONTEXT = ssl._create_unverified_context()

with open(os.path.join(REPO_PATH, "config.json"), "r") as f:
    config = json.load(f)
    GITHUB_TOKEN = config.get("githubToken", "")

def github_get(path):
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL_CONTEXT) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise

def github_put(path, content, sha=None, message="Update via API"):
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    data = {"message": message, "content": base64.b64encode(content).decode("ascii")}
    if sha:
        data["sha"] = sha
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL_CONTEXT) as resp:
            return True, None
    except urllib.error.HTTPError as e:
        body_err = e.read().decode() if e.fp else ""
        return None, f"HTTP {e.code}: {body_err[:200]}"
    except Exception as e:
        return None, str(e)[:200]

def push_file(local_path, repo_path):
    with open(local_path, "rb") as f:
        content = f.read()
    remote_info = github_get(repo_path)
    sha = remote_info["sha"] if remote_info else None
    is_new = sha is None
    msg = f"feat: 新增 {repo_path}" if is_new else f"chore: 更新 {repo_path}"
    result, error = github_put(repo_path, content, sha=sha, message=msg)
    if result:
        print(f"  {'🆕' if is_new else '🔄'} {repo_path}")
        return True
    else:
        print(f"  ✗ {repo_path} - {error}")
        return False

def main():
    os.chdir(REPO_PATH)
    success = 0
    fail = 0

    # 推送单个文件
    for path in ["vite.config.ts", "index.html", "package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "env.d.ts"]:
        if os.path.exists(path):
            if push_file(path, path):
                success += 1
            else:
                fail += 1

    # 推送 src 目录
    for root, dirs, files in os.walk("src"):
        for filename in files:
            local = os.path.join(root, filename)
            repo = local.replace("\\", "/")
            if push_file(local, repo):
                success += 1
            else:
                fail += 1

    print(f"\n✅ 完成: {success} 成功, {fail} 失败")

if __name__ == "__main__":
    main()
