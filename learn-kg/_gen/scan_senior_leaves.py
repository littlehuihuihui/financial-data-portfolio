# -*- coding: utf-8 -*-
import re
from pathlib import Path

text = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")

m = re.search(r'"id":\s*"sql-path-senior"[^}]*?"content":\s*"((?:\\.|[^"\\])*)"', text)
if m:
    c = m.group(1).replace("\\n", "\n").replace('\\"', '"')
    print("=== PATH ===")
    print(c)
    print("=== END ===\n")

# find senior-related ids from path if listed, else search common topics
# Also list all leaves under transaction / tune / advanced areas
patterns = [
    "sql-path-senior",
    "sql-drill-senior",
    "sql-isolation",
    "sql-dirty",
    "sql-lock",
    "sql-deadlock",
    "sql-transaction",
    "sql-begin",
    "sql-mvcc",
    "sql-gap",
    "sql-tune",
    "sql-index-fail",
    "sql-covering",
    "sql-partition",
    "sql-shard",
    "sql-batch",
    "sql-slow",
    "sql-recursive",
    "sql-window",
    "sql-hint",
    "sql-plan",
]

# broader: all sql-* with level ???
all_ids = sorted(set(re.findall(r'"id":\s*"(sql-[a-z0-9-]+)"', text)))
for mid in all_ids:
    mm = re.search(
        rf'"id":\s*"{re.escape(mid)}"\s*,\s*"title":\s*"([^"]+)"\s*,\s*"level":\s*"([^"]+)"\s*,\s*"content":\s*"((?:\\.|[^"\\])*)"',
        text,
    )
    if not mm:
        continue
    title, level, content = mm.group(1), mm.group(2), mm.group(3)
    if level not in ("???", "高级", "senior") and mid not in (
        "sql-path-senior",
        "sql-drill-senior",
        "sql-isolation-levels",
    ):
        # include if title/path keywords
        keys = ("事务", "锁", "隔离", "死锁", "调优", "失效", "覆盖", "分区", "分片", "慢", "递归", "MVCC", "幻读", "脏读", "HINT", "执行计划", "批量")
        if not any(k in title for k in keys) and "senior" not in mid and "tune" not in mid and "lock" not in mid and "tx" not in mid and "isolat" not in mid and "dead" not in mid and "partition" not in mid:
            continue
    c = content.replace("\\n", "\n")
    print(f"{mid} | {title} | L={level} | chars={len(c)} | 课前={'课前' in c} | 易错={'易错' in c}")
