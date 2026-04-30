#!/usr/bin/env python3
"""
GitHub API Push Script - Push local changes via HTTPS API (bypasses git push)
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

# macOS 上 urllib SSL 证书链验证失败，使用 bypass 上下文
SSL_CTX = ssl._create_unverified_context()

# 从 config.json 读取 Token（与 sync-to-github.js 保持一致）
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")

def get_github_token():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
            token = config.get("githubToken", "")
            if token:
                return token
    except Exception:
        pass
    # 回退：环境变量
    return os.environ.get("GH_TOKEN", "")

GITHUB_TOKEN = get_github_token()

# Files to sync (modified + new, excluding node_modules and large files)
EXCLUDE_PATTERNS = ["node_modules", ".git", ".workbuddy", ".netlify", "__pycache__"]


def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=REPO_PATH)
    return result.stdout.strip(), result.stderr.strip(), result.returncode


def get_changed_files():
    """Get list of changed and untracked files from git status"""
    files = []
    stdout, _, _ = run_cmd("git status --porcelain")
    for line in stdout.split("\n"):
        if not line.strip():
            continue
        # Parse: first 2 chars = status (may be space-padded), rest = filepath
        # Use split(None, 1) to handle variable spacing
        parts = line.split(None, 1)
        if len(parts) < 2:
            continue
        status = parts[0]
        filepath = parts[1]

        # Skip excluded patterns
        skip = False
        for pattern in EXCLUDE_PATTERNS:
            if pattern in filepath:
                skip = True
                break
        if skip:
            continue

        files.append((status, filepath))
    return files


def github_get(path):
    """GET request to GitHub API"""
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None  # File doesn't exist
        raise


def github_put(path, content, sha=None, message="Update via API"):
    """PUT request to GitHub API to create/update file"""
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    data = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
    }
    if sha:
        data["sha"] = sha

    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        body_err = e.read().decode() if e.fp else ""
        return None, f"HTTP {e.code}: {body_err[:200]}"
    except Exception as e:
        return None, str(e)[:200]


def main():
    files = get_changed_files()
    if not files:
        print("📭 没有检测到需要推送的代码改动")
        return

    print(f"📦 检测到 {len(files)} 个文件有改动，开始推送...\n")

    success_count = 0
    fail_count = 0
    silent_skips = 0

    for status, filepath in files:
        try:
            # Read local file content
            full_path = os.path.join(REPO_PATH, filepath)
            if not os.path.isfile(full_path):
                silent_skips += 1
                continue

            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Skip empty files
            if not content.strip():
                silent_skips += 1
                continue

            # Get current SHA from GitHub
            current_sha = None
            try:
                remote_info = github_get(filepath)
                if remote_info and "sha" in remote_info:
                    current_sha = remote_info["sha"]
            except Exception:
                pass  # File might not exist, that's fine

            # Determine commit message
            is_new = status == "??" or current_sha is None
            if is_new:
                message = f"feat: 新增文件 {filepath}"
            else:
                message = f"chore: 更新文件 {filepath}"

            # Push via GitHub API
            result, error = github_put(filepath, content, sha=current_sha, message=message)

            if result:
                symbol = "🆕" if is_new else "🔄"
                print(f"  {symbol} {filepath}")
                success_count += 1
            else:
                # Network errors - silent skip
                fail_count += 1

        except Exception as e:
            fail_count += 1
            # Silent skip on any error

    if success_count > 0:
        print(f"\n✅ 网站代码已同步到 GitHub，Netlify 将自动部署")
        print(f"   成功推送 {success_count} 个文件")
    # Only output when there's something to report
    # Failures are silently skipped as requested


if __name__ == "__main__":
    main()
