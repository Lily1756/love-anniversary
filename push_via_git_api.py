#!/usr/bin/env python3
"""
用 GitHub Git Database API 推送本地改动
流程：获取当前 ref → 创建 blobs → 创建 tree → 创建 commit → 更新 ref
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

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)
GITHUB_TOKEN = config.get("githubToken", "")

def api_request(method, path, body=None, accept="application/vnd.github.v3+json"):
    url = f"{GITHUB_API}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", accept)
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=20, context=SSL_CTX) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        return None, f"HTTP {e.code}: {err_body[:300]}"
    except Exception as e:
        return None, str(e)[:300]

def get_ref(branch="main"):
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{branch}"
    return api_request("GET", path)

def get_commit(sha):
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/commits/{sha}"
    return api_request("GET", path)

def get_tree(sha, recursive=False):
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/trees/{sha}"
    if recursive:
        path += "?recursive=1"
    return api_request("GET", path)

def create_blob(content_bytes):
    """创建 blob，返回 SHA"""
    body = {
        "content": base64.b64encode(content_bytes).decode("ascii"),
        "encoding": "base64"
    }
    return api_request("POST", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/blobs", body)

def create_tree(base_tree_sha, tree_items):
    """创建 tree，返回 SHA"""
    body = {
        "base_tree": base_tree_sha,
        "tree": tree_items
    }
    return api_request("POST", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/trees", body)

def create_commit(tree_sha, message, parent_sha):
    """创建 commit，返回 SHA"""
    body = {
        "message": message,
        "tree": tree_sha,
        "parents": [parent_sha]
    }
    return api_request("POST", f"/repos/{REPO_OWNER}/{REPO_NAME}/git/commits", body)

def update_ref(commit_sha, branch="main", force=False):
    """更新 branch ref"""
    path = f"/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{branch}"
    body = {"sha": commit_sha, "force": force}
    return api_request("PATCH", path, body)

def get_changed_files():
    """获取所有改动文件（包括 staged、unstaged、untracked）"""
    result = subprocess.run(
        "git diff --name-only && git diff --cached --name-only && git ls-files --others --exclude-standard",
        shell=True, capture_output=True, text=True, cwd=REPO_PATH
    )
    files = set()
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if line:
            files.add(line)
    return list(files)

def is_binary_file(filepath):
    """简单判断是否为二进制文件"""
    try:
        with open(filepath, 'rb') as f:
            chunk = f.read(8192)
            return b'\x00' in chunk
    except:
        return True

def main():
    print("🚀 开始通过 GitHub Git Database API 推送改动...\n")

    # 1. 获取当前 ref
    print("📍 获取当前分支信息...")
    ref_data, err = get_ref("main")
    if err:
        print(f"❌ 获取 ref 失败: {err}")
        return
    current_commit_sha = ref_data["object"]["sha"]
    print(f"   当前 commit: {current_commit_sha[:8]}")

    # 2. 获取当前 commit 和 tree
    commit_data, err = get_commit(current_commit_sha)
    if err:
        print(f"❌ 获取 commit 失败: {err}")
        return
    base_tree_sha = commit_data["tree"]["sha"]
    print(f"   当前 tree: {base_tree_sha[:8]}")

    # 3. 获取改动文件
    print("\n📦 扫描改动文件...")
    files = get_changed_files()
    # 排除不需要的文件
    exclude_patterns = ["node_modules", ".git", ".workbuddy", ".codebuddy", "dist/"]
    files = [f for f in files if not any(p in f for p in exclude_patterns)]
    if not files:
        print("   ✨ 没有需要推送的改动")
        return
    print(f"   发现 {len(files)} 个文件")

    # 4. 创建 blobs 并准备 tree items
    print("\n📝 创建 blobs...")
    tree_items = []
    for filepath in files:
        full_path = os.path.join(REPO_PATH, filepath)
        if not os.path.isfile(full_path):
            print(f"   ⏭️  跳过（非文件）: {filepath}")
            continue

        with open(full_path, "rb") as f:
            content_bytes = f.read()

        # 判断文件类型
        if is_binary_file(full_path):
            print(f"   📁 {filepath} (binary, {len(content_bytes)} bytes)")
            blob_data, err = create_blob(content_bytes)
        else:
            print(f"   📄 {filepath} ({len(content_bytes)} bytes)")
            blob_data, err = create_blob(content_bytes)

        if err:
            print(f"   ❌ 创建 blob 失败: {err}")
            continue

        tree_items.append({
            "path": filepath,
            "mode": "100644",
            "type": "blob",
            "sha": blob_data["sha"]
        })

    if not tree_items:
        print("❌ 没有成功创建任何 blob")
        return

    print(f"   ✅ 已创建 {len(tree_items)} 个 blobs")

    # 5. 创建新的 tree
    print("\n🌳 创建新的 tree...")
    tree_data, err = create_tree(base_tree_sha, tree_items)
    if err:
        print(f"❌ 创建 tree 失败: {err}")
        return
    new_tree_sha = tree_data["sha"]
    print(f"   新 tree: {new_tree_sha[:8]}")

    # 6. 创建 commit
    print("\n📝 创建 commit...")
    commit_msg = "chore: 统一数据源为 public/data/，修复照片墙和情书馆加载问题"
    commit_data, err = create_commit(new_tree_sha, commit_msg, current_commit_sha)
    if err:
        print(f"❌ 创建 commit 失败: {err}")
        return
    new_commit_sha = commit_data["sha"]
    print(f"   新 commit: {new_commit_sha[:8]}")

    # 7. 更新 ref
    print("\n🔄 更新 main 分支...")
    update_data, err = update_ref(new_commit_sha, "main")
    if err:
        print(f"❌ 更新 ref 失败: {err}")
        return
    print(f"   ✅ main 已更新到 {new_commit_sha[:8]}")

    print(f"\n🎉 推送完成！")
    print(f"   Commit: https://github.com/{REPO_OWNER}/{REPO_NAME}/commit/{new_commit_sha}")
    print(f"   Cloudflare 将自动构建新版本。")

if __name__ == "__main__":
    main()
