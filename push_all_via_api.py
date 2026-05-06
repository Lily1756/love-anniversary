#!/usr/bin/env python3
"""
通过 GitHub API 一次性推送所有改动（使用 Git Database API）
"""
import base64
import json
import os
import ssl
import subprocess
import urllib.request
import urllib.error

GITHUB_API = "https://api.github.com"
REPO_OWNER = "Lily1756"
REPO_NAME = "love-anniversary"
REPO_PATH = "/Users/zhangyi/WorkBuddy/20260423010138/love-site"

SSL_CTX = ssl._create_unverified_context()

# 读取 Token
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
def get_github_token():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
            return config.get("githubToken", "")
    except Exception:
        return os.environ.get("GH_TOKEN", "")

GITHUB_TOKEN = get_github_token()

def api_request(method, path, body=None):
    """统一的 GitHub API 请求"""
    url = f"{GITHUB_API}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.read().decode()[:300]}"
    except Exception as e:
        return None, str(e)[:300]

def get_ref(branch="main"):
    """获取当前 branch 的 ref"""
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{branch}"
    return api_request("GET", path)

def get_commit(sha):
    """获取 commit 信息"""
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/commits/{sha}"
    return api_request("GET", path)

def create_blob(content, encoding="utf-8"):
    """创建 blob"""
    body = {
        "content": content.encode(encoding) if isinstance(content, str) else content,
        "encoding": "utf-8"
    }
    # base64 编码
    body["content"] = base64.b64encode(content.encode("utf-8")).decode("ascii")
    body["encoding"] = "base64"
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/blobs"
    return api_request("POST", path, body)

def create_tree(base_tree_sha, files):
    """
    files: [{"path": "xxx", "mode": "100644", "type": "blob", "sha": "xxx"}, ...]
    """
    body = {
        "base_tree": base_tree_sha,
        "tree": files
    }
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/trees"
    return api_request("POST", path, body)

def create_commit(tree_sha, message, parent_sha):
    """创建 commit"""
    body = {
        "message": message,
        "tree": tree_sha,
        "parents": [parent_sha]
    }
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/commits"
    return api_request("POST", path, body)

def update_ref(branch, commit_sha):
    """更新 branch ref"""
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{branch}"
    body = {
        "sha": commit_sha,
        "force": False
    }
    return api_request("PATCH", path, body)

def get_changed_files():
    """获取已 staged 和未 staged 的改动文件"""
    result = subprocess.run(
        "git diff --name-only && git diff --cached --name-only && git ls-files --others --exclude-standard",
        shell=True, capture_output=True, text=True, cwd=REPO_PATH
    )
    files = set()
    for line in result.stdout.strip().split("\n"):
        if line.strip():
            files.add(line.strip())
    return list(files)

def main():
    print("🚀 开始通过 GitHub API 推送改动...\n")

    # 1. 获取当前 ref
    print("📍 获取当前分支信息...")
    ref_data, err = get_ref("main")
    if err:
        print(f"❌ 获取 ref 失败: {err}")
        return
    current_commit_sha = ref_data["object"]["sha"]
    print(f"   当前 commit: {current_commit_sha[:8]}")

    # 2. 获取当前 commit 的 tree
    commit_data, err = get_commit(current_commit_sha)
    if err:
        print(f"❌ 获取 commit 失败: {err}")
        return
    base_tree_sha = commit_data["tree"]["sha"]
    print(f"   当前 tree: {base_tree_sha[:8]}")

    # 3. 获取改动文件
    print("\n📦 扫描改动文件...")
    files = get_changed_files()
    # 过滤掉不需要的文件
    exclude = ["node_modules", ".git", ".workbuddy", ".netlify", "__pycache__", "dist/"]
    files = [f for f in files if not any(p in f for p in exclude)]
    if not files:
        print("   ✨ 没有需要推送的改动")
        return
    print(f"   发现 {len(files)} 个文件")

    # 4. 创建 blobs
    print("\n📝 创建 blobs...")
    tree_items = []
    for filepath in files:
        full_path = os.path.join(REPO_PATH, filepath)
        if not os.path.isfile(full_path):
            print(f"   ⏭️  跳过目录: {filepath}")
            continue
        with open(full_path, "rb") as f:
            content = f.read()
        # 判断是否为文本文件
        try:
            content.decode("utf-8")
            is_text = True
        except UnicodeDecodeError:
            is_text = False

        blob_data, err = create_blob(content.decode("utf-8") if is_text else content)
        if err:
            print(f"   ❌ 创建 blob 失败: {filepath} - {err}")
            continue
        tree_items.append({
            "path": filepath,
            "mode": "100644",
            "type": "blob",
            "sha": blob_data["sha"]
        })
        print(f"   ✅ {filepath}")

    if not tree_items:
        print("❌ 没有成功创建任何 blob")
        return

    # 5. 创建新的 tree
    print(f"\n🌳 创建新的 tree...")
    tree_data, err = create_tree(base_tree_sha, tree_items)
    if err:
        print(f"❌ 创建 tree 失败: {err}")
        return
    new_tree_sha = tree_data["sha"]
    print(f"   新 tree: {new_tree_sha[:8]}")

    # 6. 创建 commit
    print(f"\n📝 创建 commit...")
    commit_msg = "chore: 同步代码重构 - 统一数据源为 public/data/"
    commit_data, err = create_commit(new_tree_sha, commit_msg, current_commit_sha)
    if err:
        print(f"❌ 创建 commit 失败: {err}")
        return
    new_commit_sha = commit_data["sha"]
    print(f"   新 commit: {new_commit_sha[:8]}")

    # 7. 更新 ref
    print(f"\n🔄 更新 main 分支...")
    update_data, err = update_ref("main", new_commit_sha)
    if err:
        print(f"❌ 更新 ref 失败: {err}")
        return
    print(f"   ✅ main 已更新到 {new_commit_sha[:8]}")

    print(f"\n🎉 推送完成！Cloudflare 将自动构建新版本。")
    print(f"   查看: https://github.com/{REPO_OWNER}/{REPO_NAME}/commit/{new_commit_sha}")

if __name__ == "__main__":
    main()
