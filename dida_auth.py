#!/usr/bin/env python3
"""
滴答清单 Token 获取脚本
自动完成 OAuth2 授权流程 + 获取项目列表
"""

import urllib.parse
import json
import subprocess
import sys
import time
import webbrowser
import os

try:
    import requests
except ImportError:
    print("正在安装 requests…")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests


# ── 配置 ──────────────────────────────────────────────
DEFAULT_CLIENT_ID     = "aVRBv4we34Hq4MbALE"
DEFAULT_CLIENT_SECRET = "1Uj036yYW6IGBHfoSYC9ng7WQnSlkJ2y"
TOKEN_URL             = "https://dida365.com/oauth/token"
API_BASE              = "https://api.dida365.com/open/v1"
REDIRECT_URI         = "https://localhost"
SCOPE                = "tasks:write tasks:read"


def step1_authorize(client_id: str) -> str:
    """生成授权链接，让用户在浏览器打开并获取 code"""
    params = {
        "scope":         SCOPE,
        "client_id":    client_id,
        "state":        "lovejournal2026",
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
    }
    url = f"https://dida365.com/oauth/authorize?" + urllib.parse.urlencode(params)
    return url


def step2_exchange(client_id: str, client_secret: str, code: str) -> dict:
    """用 code 换取 access_token"""
    data = {
        "grant_type":    "authorization_code",
        "code":          code,
        "redirect_uri":  REDIRECT_URI,
        "scope":         SCOPE,
        "client_id":     client_id,
        "client_secret": client_secret,
    }
    resp = requests.post(TOKEN_URL, data=data)
    resp.raise_for_status()
    return resp.json()


def step3_projects(access_token: str) -> list:
    """获取用户的项目/清单列表"""
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(f"{API_BASE}/projects", headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return data.get("projects", [])


def step4_tasks(access_token: str, project_id: str) -> list:
    """获取指定项目下的任务"""
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(f"{API_BASE}/project/{project_id}/data", headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return data.get("tasks", [])


def print_banner():
    print("\n" + "=" * 50)
    print("💕 滴答清单 Token 获取向导")
    print("=" * 50)


def main():
    print_banner()

    # ── Step 1: 输入 Client ID / Secret ──────────────
    print("\n[Step 1/3] 配置 OAuth 应用")
    client_id     = input(f"  Client ID    (直接回车使用默认值): ").strip() or DEFAULT_CLIENT_ID
    client_secret = input(f"  Client Secret(直接回车使用默认值): ").strip() or DEFAULT_CLIENT_SECRET
    if not client_id or not client_secret:
        print("❌ Client ID 和 Secret 不能为空")
        sys.exit(1)

    # ── Step 2: 获取 Authorization Code ──────────────
    print("\n[Step 2/3] 获取授权码")
    auth_url = step1_authorize(client_id)
    print(f"\n  请在浏览器中打开以下链接并登录授权：\n")
    print(f"  {auth_url}\n")
    print(f"  （也可以复制链接到浏览器打开）\n")

    # 自动尝试打开浏览器
    try:
        webbrowser.open(auth_url)
        print("  ✅ 已自动打开浏览器，请完成授权\n")
    except Exception:
        pass

    # 等待用户复制 code
    code = input("  授权成功后，浏览器跳转到 localhost，地址栏会有")
    print("  code=xxxxxx，复制那串字符粘贴到这里：\n  > ")
    code = code.strip()
    if not code:
        print("❌ code 不能为空")
        sys.exit(1)

    # ── Step 3: 换取 Token ──────────────────────────
    print("\n[Step 3/3] 交换 Access Token…")
    try:
        token_data = step2_exchange(client_id, client_secret, code)
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in    = token_data.get("expires_in", 0)

        if not access_token:
            print(f"❌ 获取失败，服务器返回：{token_data}")
            sys.exit(1)

        expires_days = expires_in // 86400 if expires_in else 180
        print(f"\n  ✅ Access Token 获取成功！")
        print(f"  有效期：{expires_days} 天\n")
        print(f"  ── 你的 Access Token ──")
        print(f"  {access_token}")
        print(f"  ── 复制以上内容 ──\n")

    except requests.HTTPError as e:
        print(f"❌ HTTP 错误：{e}")
        print("  提示：如果是 401，检查 code 是否正确或已过期")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 未知错误：{e}")
        sys.exit(1)

    # ── Bonus: 获取项目列表 ──────────────────────────
    print("\n[Bonus] 获取你的滴答清单项目列表")
    try:
        projects = step3_projects(access_token)
        if projects:
            print(f"\n  {'序号':<4} {'名称':<30} {'ID':<25}")
            print(f"  {'-'*4} {'-'*30} {'-'*25}")
            for i, p in enumerate(projects, 1):
                print(f"  {i:<4} {p.get('name','未知'):<30} {p.get('id',''):<25}")
            print(f"\n  共有 {len(projects)} 个项目")
            print(f"  找到小作文所在清单后，复制对应的 ID 填入网站设置\n")
        else:
            print("  没有找到任何项目")
    except Exception as e:
        print(f"  ⚠️ 获取项目列表失败（不影响 Token）：{e}")

    # ── 保存到网站配置 ──────────────────────────────
    print("=" * 50)
    print("📋 使用方法")
    print("=" * 50)
    print(f"\n  1. 复制上面的 Access Token")
    print(f"  2. 打开恋爱网站，右下角 ⚙️ 按钮")
    print(f"  3. 粘贴 Token 到「滴答清单 API Token」框")
    print(f"  4. 粘贴项目 ID 到「小作文所在清单 ID」框")
    print(f"  5. 保存后点击「同步」按钮\n")

    # 写入配置文件，方便后续复制
    cfg_path = os.path.join(os.path.dirname(__file__), "config.json")
    with open(cfg_path, "w", encoding="utf-8") as f:
        json.dump({
            "client_id":     client_id,
            "client_secret": client_secret,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in":     expires_in,
        }, f, ensure_ascii=False, indent=2)
    print(f"  ✅ 配置已保存到 config.json（仅本地）\n")


if __name__ == "__main__":
    main()
