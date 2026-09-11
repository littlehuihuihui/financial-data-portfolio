# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
t = p.read_text(encoding="utf-8")

# Fix prefer
pat = re.compile(
    r"const prefer = hub === \"sql\" \? \"sql-constitution\"[\s\S]*?null;"
)
m = pat.search(t)
print("prefer before:\n", m.group(0) if m else "NONE")
new_prefer = """const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution"
              : hub === "dwh" ? "dwh-constitution" : null;"""
if m:
    t = pat.sub(new_prefer, t, count=1)
    print("OK prefer updated")
else:
    print("FAIL prefer")

# Ensure HOME hubs include database
if 'HOME_HERO_HUBS = ["sql", "python", "ml"' in t and "database" not in t[t.find("HOME_HERO_HUBS"):t.find("HOME_HERO_HUBS")+120]:
    t = t.replace(
        'HOME_HERO_HUBS = ["sql", "python", "ml", "etl", "dwh", "bi"]',
        'HOME_HERO_HUBS = ["sql", "python", "database", "ml", "etl", "dwh", "bi"]',
        1,
    )
    print("OK hubs")

# Ensure hot entries
if '{ hub: "database", label: "数据库" }' not in t:
    t = t.replace(
        '{ hub: "python", label: "Python" },\n        { hub: "ml", label: "机器学习" }',
        '{ hub: "python", label: "Python" },\n        { hub: "database", label: "数据库" },\n        { hub: "ml", label: "机器学习" }',
        1,
    )
    print("OK hot")

# HOME_HERO_SUB database
if "database: \"事务与引擎\"" not in t and "database: '事务与引擎'" not in t:
    t = t.replace(
        'python: "分析与脚本",\n      ml: "模型与任务",',
        'python: "分析与脚本",\n      database: "事务与引擎",\n      ml: "模型与任务",',
        1,
    )
    print("OK sub")

p.write_text(t, encoding="utf-8")

# validate all
for m in [
    "DATABASE_KNOWLEDGE_TREE",
    "database: DATABASE_KNOWLEDGE_TREE",
    "dwh-constitution",
    "dwh-ads",
    "dwh-reconcile",
    "db-constitution",
    'hub === "dwh"',
]:
    print(m, "OK" if m in p.read_text(encoding="utf-8") else "MISSING")

t2 = p.read_text(encoding="utf-8")
print("size", p.stat().st_size)
print("hubs", t2[t2.find("HOME_HERO_HUBS") : t2.find("HOME_HERO_HUBS") + 100])
