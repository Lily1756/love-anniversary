#!/usr/bin/env python3
"""
滴答清单 → diaries.json 自动同步脚本
用法：
  python3 sync_diaries.py                   # 使用脚本内默认配置
  python3 sync_diaries.py --token xxx --project-id yyy  # 显式传参
  python3 sync_diaries.py --dry-run          # 只打印，不写文件不提交
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

# ── 默认配置（可被命令行参数覆盖，也可用环境变量）──────────────────────
DEFAULT_TOKEN      = os.environ.get("DIDA_TOKEN",      "f8d74bb2-8e63-408d-b80c-9cb4148ff87b")
DEFAULT_PROJECT_ID = os.environ.get("DIDA_PROJECT_ID", "6845963d432211b6777fcb65")
API_BASE           = "https://api.dida365.com/open/v1"
DIARIES_PATH       = os.path.join(os.path.dirname(__file__), "diaries.json")


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
    """将滴答任务转换为 diaries.json 格式"""
    entries = []
    for t in tasks:
        # 优先用 modifiedTime，其次 createdTime
        raw_time = t.get("modifiedTime") or t.get("createdTime") or ""
        date_str = raw_time[:10] if raw_time else datetime.now(timezone.utc).strftime("%Y-%m-%d")

        entry = {
            "id":      f"dida-{t['id']}",
            "date":    date_str,
            "title":   (t.get("title") or "").strip() or "无标题",
            "tag":     "💌",
            "content": (t.get("content") or "").strip(),
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


def git_commit_push(message: str) -> None:
    """git add → commit → push"""
    repo_dir = os.path.dirname(__file__)
    cmds = [
        ["git", "-C", repo_dir, "add", "diaries.json"],
        ["git", "-C", repo_dir, "commit", "-m", message, "--allow-empty"],
        ["git", "-C", repo_dir, "push"],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            # commit 无变更时 allow-empty 会成功；push 失败才报错
            if "nothing to commit" in (result.stdout + result.stderr):
                print("  ℹ️  没有变更，跳过 commit")
                return
            print(f"  ⚠️  命令失败: {' '.join(cmd)}")
            print(f"     stdout: {result.stdout.strip()}")
            print(f"     stderr: {result.stderr.strip()}")
            raise RuntimeError(f"git 操作失败: {' '.join(cmd)}")
    print("  ✅ git push 成功，Netlify 将自动重新部署")


def main():
    parser = argparse.ArgumentParser(description="同步滴答清单小作文到 diaries.json")
    parser.add_argument("--token",      default=DEFAULT_TOKEN,      help="滴答 Access Token")
    parser.add_argument("--project-id", default=DEFAULT_PROJECT_ID, help="滴答项目 ID")
    parser.add_argument("--dry-run",    action="store_true",         help="只打印，不写入也不 push")
    parser.add_argument("--no-push",    action="store_true",         help="更新文件但不 git push")
    args = parser.parse_args()

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

    # 4. 写入文件
    write_diaries(merged)

    # 5. git push
    if not args.no_push:
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        git_commit_push(f"chore: 自动同步滴答清单小作文 [{now}]")

    print("\n🎉 同步完成！")


if __name__ == "__main__":
    main()
