#!/usr/bin/env python3
"""通过 GitHub API 推送空提交来触发 Cloudflare 重新构建"""
import json
import ssl
import urllib.request
import urllib.error
import base64
import time

GITHUB_API = "https://api.github.com"
REPO_OWNER = "Lily1756"
REPO_NAME = "love-anniversary"
CONFIG_PATH = "/Users/zhangyi/WorkBuddy/20260423010138/love-site/config.json"

SSL_CONTEXT = ssl._create_unverified_context()

with open(CONFIG_PATH, "r") as f:
    config = json.load(f)
    GITHUB_TOKEN = config.get("githubToken", "")

def api_request(method, path, data=None):
    """统一的 GitHub API 请求"""
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json" if data else None
    }
    # 过滤 None 值
    headers = {k: v for k, v in headers.items() if v is not None}

    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode() if data else None,
        headers=headers,
        method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CONTEXT) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"❌ API 错误 {e.code}: {e.reason}")
        try:
            body = json.loads(e.read().decode())
            print(f"   详情: {body.get('message', '')}")
        except:
            pass
        raise

print("🚀 开始通过 API 推送空提交...")

# 1. 获取当前 main 分支的引用
print("1️⃣  获取当前分支引用...")
ref_data = api_request("GET", "/git/refs/heads/main")
current_commit_sha = ref_data["object"]["sha"]
print(f"   当前 commit: {current_commit_sha[:8]}")

# 2. 获取当前 commit 的 tree
print("2️⃣  获取当前 commit 的 tree...")
commit_data = api_request("GET", f"/git/commits/{current_commit_sha}")
tree_sha = commit_data["tree"]["sha"]
print(f"   Tree SHA: {tree_sha[:8]}")

# 3. 创建新的空提交（使用相同的 tree，但作为新 commit）
print("3️⃣  创建新的空提交...")
new_commit = api_request("POST", "/git/commits", {
    "message": "chore: trigger Cloudflare rebuild to fix CDN cache issue",
    "tree": tree_sha,
    "parents": [current_commit_sha]
})
new_commit_sha = new_commit["sha"]
print(f"   新 commit: {new_commit_sha[:8]}")

# 4. 更新引用到新 commit
print("4️⃣  更新 main 分支引用...")
api_request("PATCH", "/git/refs/heads/main", {
    "sha": new_commit_sha,
    "force": False
})
print(f"   ✅ 引用已更新到 {new_commit_sha[:8]}")

print("\n🎉 空提交已通过 API 推送！")
print("⏳ Cloudflare Pages 将在 1-3 分钟内开始重新构建...")
print(f"🔗 查看构建状态: https://dash.cloudflare.com/")
