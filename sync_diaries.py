#!/usr/bin/env python3
"""
滴答清单 → diaries.json 自动同步脚本
用法：
  python3 sync_diaries.py                   # 使用脚本内默认配置
  python3 sync_diaries.py --token xxx --project-id yyy  # 显式传参
  python3 sync_diaries.py --dry-run          # 只打印，不写文件不提交
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from typing import Optional

try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

# ── 默认配置（可被命令行参数覆盖，也可用环境变量）──────────────────────
DEFAULT_TOKEN       = os.environ.get("DIDA_TOKEN",      "f8d74bb2-8e63-408d-b80c-9cb4148ff87b")
DEFAULT_PROJECT_ID  = os.environ.get("DIDA_PROJECT_ID", "6845963d432211b6777fcb65")
DEFAULT_GH_TOKEN    = os.environ.get("GH_TOKEN",         "")
GH_API_BASE         = "https://api.github.com"
REPO_OWNER          = "Lily1756"
REPO_NAME           = "love-anniversary"
FILE_PATH           = "diaries.json"
API_BASE            = "https://api.dida365.com/open/v1"
DIARIES_PATH        = os.path.join(os.path.dirname(__file__), "diaries.json")


def parse_year_from_title(title: str) -> Optional[int]:
    """
    从标题中解析年份。
    支持的格式：【2026】
    返回：年份数字（如 2026），解析失败返回 None
    """
    if not title:
        return None
    
    # 匹配【数字】格式
    match = re.search(r'【(\d{4})】', title)
    if match:
        year = int(match.group(1))
        if 1900 <= year <= 2100:
            return year
    return None


def parse_month_day_from_remind_time(remind_time: Optional[int]) -> tuple[Optional[int], Optional[int]]:
    """
    从滴答任务的提醒时间（毫秒时间戳）解析月和日。
    返回：(month, day)，解析失败返回 (None, None)
    """
    if not remind_time:
        return None, None
    
    try:
        # 滴答的 remindTime 是毫秒时间戳
        dt = datetime.fromtimestamp(remind_time / 1000, tz=timezone.utc)
        return dt.month, dt.day
    except (ValueError, OSError, OverflowError):
        return None, None


def parse_date_from_content(content: str, fallback_year: Optional[int] = None) -> Optional[str]:
    """
    从正文中解析日期。
    支持的格式：
    - 2026.03.20
    - 2026-03-20
    - 2026/03/20
    - 2026年03月20日
    - 2026年3月20日
    - 03月20日（使用 fallback_year 或当前年份）
    - 3月20日（使用 fallback_year 或当前年份）
    - 20260320
    - 19940210
    
    返回：解析到的日期字符串（YYYY-MM-DD格式），解析失败返回 None
    """
    if not content:
        return None
    
    # 当前年份（用于补全只有月日的日期）
    current_year = fallback_year or datetime.now().year
    
    # 按优先级尝试各种日期格式
    
    # 1. 格式：YYYY.MM.DD 或 YYYY.M.D（最常见）
    match = re.search(r'(\d{4})\.(\d{1,2})\.(\d{1,2})', content)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}"
    
    # 2. 格式：YYYY-MM-DD 或 YYYY-M-D
    match = re.search(r'(\d{4})-(\d{1,2})-(\d{1,2})', content)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}"
    
    # 3. 格式：YYYY/MM/DD 或 YYYY/M/D
    match = re.search(r'(\d{4})/(\d{1,2})/(\d{1,2})', content)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}"
    
    # 4. 格式：YYYY年MM月DD日 或 YYYY年M月D日
    match = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', content)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if 1 <= month <= 12 and 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}"
    
    # 5. 格式：MM月DD日 或 M月D日（使用 fallback_year 或当前年份）
    match = re.search(r'(\d{1,2})月(\d{1,2})日', content)
    if match:
        month, day = int(match.group(1)), int(match.group(2))
        if 1 <= month <= 12 and 1 <= day <= 31:
            return f"{current_year:04d}-{month:02d}-{day:02d}"
    
    # 6. 格式：YYYYMMDD（8位连续数字，支持换行符后的数字）
    # 使用 (?:^|\D) 和 (?:\D|$) 代替 \b，确保换行符后也能匹配
    match = re.search(r'(?:^|\D)(\d{4})(\d{2})(\d{2})(?:\D|$)', content)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if 1900 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}"
    
    return None


def fetch_tasks(token: str, project_id: str) -> list:
    """从滴答清单 API 获取指定项目的所有任务"""
    url = f"{API_BASE}/project/{project_id}/data"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    tasks = data.get("tasks", [])
    print(f"  ✅ 获取到 {len(tasks)} 条任务")
    return tasks


def tasks_to_diaries(tasks: list) -> list:
    """将滴答任务转换为 diaries.json 格式
    
    日期逻辑：
    - 年份：从标题【】中提取（如【2026】→ 2026）
    - 月份和日期：从任务的提醒日期（remindTime）获取
    - 如果无法获取，回退使用正文日期 → modifiedTime/createdTime
    """
    entries = []
    for t in tasks:
        title = (t.get("title") or "").strip()
        content = (t.get("content") or "").strip()
        
        # 1. 从标题【】中提取年份
        year = parse_year_from_title(title)
        
        # 2. 从提醒时间获取月和日
        remind_time = t.get("remindTime")
        month, day = parse_month_day_from_remind_time(remind_time)
        
        # 3. 组装日期
        date_str = None
        if year and month and day:
            # 优先使用标题年份 + 提醒时间月日
            date_str = f"{year:04d}-{month:02d}-{day:02d}"
        elif year:
            # 如果有年份但没有提醒时间，尝试从正文解析月日
            month_day = parse_date_from_content(content)
            if month_day and month_day.startswith(str(year)):
                date_str = month_day
            elif month_day:
                # 正文有日期但年份不同，用标题年份替换
                parts = month_day.split("-")
                date_str = f"{year:04d}-{parts[1]}-{parts[2]}"
        
        # 4. 如果仍然无法获取日期，回退使用 modifiedTime 或 createdTime
        if not date_str:
            raw_time = t.get("modifiedTime") or t.get("createdTime") or ""
            date_str = raw_time[:10] if raw_time else datetime.now(timezone.utc).strftime("%Y-%m-%d")

        entry = {
            "id":      f"dida-{t['id']}",
            "date":    date_str,
            "title":   title or "无标题",
            "tag":     "💌",
            "content": content,
        }
        entries.append(entry)

    # 按日期倒序
    entries.sort(key=lambda x: x["date"], reverse=True)
    return entries


def load_existing_diaries() -> list:
    """读取现有的 diaries.json（如果存在）"""
    if not os.path.exists(DIARIES_PATH):
        return []
    with open(DIARIES_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def merge_diaries(existing: list, new_entries: list) -> list:
    """
    合并策略：
    - 以滴答数据（dida-xxx ID）为准，直接覆盖同 ID 条目
    - 保留非滴答来源（非 dida- 开头 ID）的手动条目
    """
    # 保留手动条目
    manual = [e for e in existing if not str(e.get("id", "")).startswith("dida-")]
    # 合并滴答新数据
    merged = manual + new_entries
    # 按日期倒序
    merged.sort(key=lambda x: x.get("date", ""), reverse=True)
    return merged


def write_diaries(entries: list) -> None:
    with open(DIARIES_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    print(f"  ✅ 写入 {len(entries)} 条到 diaries.json")


def get_github_file_sha(token: str, owner: str, repo: str, path: str) -> Optional[str]:
    """通过 GitHub API 获取文件当前的 SHA（用于更新）"""
    url = f"{GH_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    resp = requests.get(url, headers=headers, timeout=15)
    if resp.status_code == 200:
        return resp.json().get("sha")
    return None  # 文件不存在，返回 None


def github_api_push(token: str, owner: str, repo: str, path: str, content: str, message: str) -> None:
    """通过 GitHub API 直接更新文件（无需 git push）"""
    url = f"{GH_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
    }
    # 尝试获取现有 SHA（如果文件已存在）
    sha = get_github_file_sha(token, owner, repo, path)
    if sha:
        payload["sha"] = sha

    resp = requests.put(url, headers=headers, json=payload, timeout=15)
    if resp.status_code in (200, 201):
        print("  ✅ GitHub API 推送成功，Netlify 将自动重新部署")
    else:
        resp_text = resp.text
        raise RuntimeError(f"GitHub API 推送失败: {resp.status_code} {resp_text}")


# ── 测试日期解析函数 ─────────────────────────────────────────────────
def test_date_parser():
    """测试日期解析函数"""
    print("\n📅 标题年份解析测试：")
    print("-" * 60)
    title_cases = [
        ("【2026】生日快乐呀~", 2026),
        ("【2025】我们的故事", 2025),
        ("【2024】情人节记录", 2024),
        ("普通标题无年份", None),
        ("", None),
    ]
    all_passed = True
    for title, expected in title_cases:
        result = parse_year_from_title(title)
        status = "✅" if result == expected else "❌"
        if result != expected:
            all_passed = False
        print(f"{status} \"{title}\" → {result} (期望: {expected})")
    print("-" * 60)
    
    print("\n📅 正文日期解析测试（带 fallback 年份）：")
    print("-" * 60)
    content_cases = [
        ("2026.03.20", "2026-03-20"),
        ("2026-03-20", "2026-03-20"),
        ("2026/03/20", "2026-03-20"),
        ("2026年03月20日", "2026-03-20"),
        ("2026年3月20日", "2026-03-20"),
        ("03月20日", str(datetime.now().year) + "-03-20"),  # 无 fallback
        ("3月20日", str(datetime.now().year) + "-03-20"),
        ("03月20日（带fallback）", "2025-03-20"),  # 带 fallback
        ("今天是2026.03.20", "2026-03-20"),
        ("生于19940210", "1994-02-10"),
        ("记录19950320发生的事情", "1995-03-20"),
        ("【2026】生日快乐呀~", None),  # 标题里的2026不是正文日期，正确返回None
        ("无日期内容", None),
        ("", None),
    ]
    
    for text, expected in content_cases:
        fallback_year = 2025 if "fallback" in text else None
        result = parse_date_from_content(text, fallback_year)
        status = "✅" if result == expected else "❌"
        if result != expected:
            all_passed = False
        print(f"{status} \"{text[:25]}...\" → {result} (期望: {expected})")
    print("-" * 60)
    
    print("\n📅 提醒时间戳解析测试：")
    print("-" * 60)
    # 2026-03-20 00:00:00 UTC 的毫秒时间戳
    timestamp_cases = [
        (1742428800000, (3, 20)),  # 2026-03-20 00:00:00 UTC
        (1742428800000 + 3600000, (3, 20)),  # 2026-03-20 01:00:00 UTC
        (None, (None, None)),
        (0, (None, None)),
    ]
    for ts, expected in timestamp_cases:
        result = parse_month_day_from_remind_time(ts)
        status = "✅" if result == expected else "❌"
        if result != expected:
            all_passed = False
        print(f"{status} {ts} → {result} (期望: {expected})")
    print("-" * 60)
    
    if all_passed:
        print("✅ 所有测试通过！")
    else:
        print("❌ 部分测试失败，请检查解析逻辑")
    print()


def main():
    parser = argparse.ArgumentParser(description="同步滴答清单小作文到 diaries.json")
    parser.add_argument("--token",       default=DEFAULT_TOKEN,       help="滴答 Access Token")
    parser.add_argument("--project-id", default=DEFAULT_PROJECT_ID,  help="滴答项目 ID")
    parser.add_argument("--gh-token",    default=DEFAULT_GH_TOKEN,   help="GitHub PAT（通过 API 推送，必填）")
    parser.add_argument("--dry-run",     action="store_true",          help="只打印，不写入也不推送")
    parser.add_argument("--no-push",     action="store_true",          help="只更新本地文件，不推送到 GitHub")
    parser.add_argument("--test",        action="store_true",          help="运行日期解析测试")
    args = parser.parse_args()

    # 如果有 --test 参数，先运行测试
    if args.test:
        test_date_parser()
        return

    print("\n💕 滴答清单同步开始")
    print(f"   项目 ID : {args.project_id}")
    print(f"   Token   : {args.token[:8]}…\n")

    # 1. 拉取数据
    tasks = fetch_tasks(args.token, args.project_id)
    if not tasks:
        print("  ⚠️  没有获取到任何任务，退出")
        return

    # 2. 转换格式
    new_entries = tasks_to_diaries(tasks)
    print(f"  📝 转换后共 {len(new_entries)} 篇小作文")

    # 3. 与现有数据合并
    existing = load_existing_diaries()
    merged = merge_diaries(existing, new_entries)
    print(f"  📚 合并后共 {len(merged)} 条（含手动条目 {len(merged) - len(new_entries)} 条）")

    if args.dry_run:
        print("\n  [dry-run] 跳过写入和推送")
        print(json.dumps(merged[:3], ensure_ascii=False, indent=2))
        return

    # 4. 写入本地文件
    write_diaries(merged)

    # 5. 通过 GitHub API 推送（绕过 git push，兼容国内网络）
    if not args.no_push:
        if not args.gh_token:
            print("  ⚠️  未提供 GitHub Token，跳过推送（请用 --gh-token 或设置 GH_TOKEN 环境变量）")
        else:
            now = datetime.now().strftime("%Y-%m-%d %H:%M")
            json_content = json.dumps(merged, ensure_ascii=False, indent=2)
            github_api_push(
                token=args.gh_token,
                owner=REPO_OWNER,
                repo=REPO_NAME,
                path=FILE_PATH,
                content=json_content,
                message=f"chore: 自动同步滴答清单小作文 [{now}]"
            )

    print("\n🎉 同步完成！")


if __name__ == "__main__":
    main()
