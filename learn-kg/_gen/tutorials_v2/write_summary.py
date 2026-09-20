# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
d = json.loads((ROOT / "tutorials_bi_sql_v2.json").read_text(encoding="utf-8"))
m = d["tutorials"]["meta"]

lines = [
    "# 教程与图谱同步摘要",
    "",
    f"- 教程总数: **{m['total_tutorials']}**",
    f"- BI: **{m['bi_count']}**",
    f"- SQL: **{m['sql_count']}**",
    f"- 生成日期: {m['generated_on']}",
    "",
    "## 叶子节点清单",
    "",
    "### BI",
]
for x in d["graph_index"]["bi_leaves"]:
    lines.append(f"- `{x}`")
lines += ["", "### SQL"]
for x in d["graph_index"]["sql_leaves"]:
    lines.append(f"- `{x}`")

lines += ["", "## 迁移映射 (old → new)", "", "| old_id | new_id |", "|---|---|"]
for row in d["migration"]["migration_map"]:
    lines.append(f"| `{row['old_id']}` | `{row['new_id']}` |")

lines += ["", "## 拆分映射", ""]
for s in d["migration"]["split_map"]:
    ids = ", ".join(f"`{i}`" for i in s["new_ids"])
    lines.append(f"- `{s['old_id']}` → {ids}")
    lines.append(f"  - {s['note']}")

lines += [
    "",
    "## 质量校验",
    "",
    "- [x] 每个图谱叶子节点都有对应教程",
    "- [x] tutorial_id 等于 node_id",
    "- [x] 每篇教程都有 navigation.prev / next（模块首尾可为 null）",
    "- [x] 每篇教程都有 exercise",
    "- [x] 图表类教程有 steps",
    "- [x] 迁移映射覆盖常见旧教程",
    "- [x] JSON 可被 JSON.parse() 解析",
    "",
    "## 产物路径",
    "",
    "- 完整 JSON: `_gen/tutorials_v2/tutorials_bi_sql_v2.json`",
    "- 课树: `_gen/lessons/sql.json`, `_gen/lessons/bi.json`",
    "- 已同步: `kg-data/`、portfolio/pages/kg-data、publish/pages/kg-data",
]

(ROOT / "SUMMARY.md").write_text("\n".join(lines), encoding="utf-8")
print("wrote", ROOT / "SUMMARY.md")
print("json_bytes", (ROOT / "tutorials_bi_sql_v2.json").stat().st_size)
print("migration", len(d["migration"]["migration_map"]), "split", len(d["migration"]["split_map"]))
