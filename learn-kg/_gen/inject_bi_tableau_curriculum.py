# -*- coding: utf-8 -*-
"""Inject Tableau curriculum (bi_node_curriculum.json) into BI knowledge tree."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"D:\cursor\数据学习平台")
CURRICULUM = ROOT / "_gen" / "bi_node_curriculum.json"
LESSON_BI = ROOT / "_gen" / "lessons" / "bi.json"
KG_BI = ROOT / "kg-data" / "bi.json"
EXTRA_KG = [
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data\bi.json"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data\bi.json"),
]

LEVEL_MAP = {1: "?", 2: "??", 3: "??", 4: "???", 5: "???"}


def slug(s: str) -> str:
    s = re.sub(r"[^\w\u4e00-\u9fff]+", "-", s, flags=re.U).strip("-")
    return s[:48] or "kp"


def kp_to_content(kp: dict) -> str:
    uses = "\n".join(f"- {u}" for u in (kp.get("use_cases") or []))
    traps_rows = "\n".join(
        f"| {m} | 对照练习纠正 |" for m in (kp.get("common_mistakes") or [])
    )
    prereq = "、".join(kp.get("prerequisites") or []) or "无（本章起点）"
    return f"""### 课前

- **场景**：Tableau / BI 实操课「{kp.get('title')}」
- **目标**：掌握本知识点并完成练习
- **难度**：{kp.get('difficulty', 1)} / 5
- **先修**：{prereq}
- **学完标准**：能复述定义、按步骤做出图/计算，并避开常见坑

### 样例输入

推荐用 **Superstore**（或同源交易样例 `orders` / `users`）完成本课。

### 是什么

{kp.get('description', '').strip()}

### 怎么写（制作步骤）

{kp.get('how_to_make', '').strip()}

### 用在哪

{uses or '- 见业务看板场景'}

### 易错对照

| 错法 | 纠正方向 |
|---|---|
{traps_rows or '| 跳过步骤验证 | 每步对照结果 |'}

### 动手

{kp.get('practice', '按步骤完成一张工作表并截图自检。')}
""".strip()


def chapter_content(ch: dict) -> str:
    prereq = "、".join(ch.get("prerequisites") or []) or "无"
    kps = " · ".join(k["title"] for k in ch.get("knowledge_points") or [])
    return f"""### {ch['title']} · 章节导读

{ch.get('description', '')}

- **难度**：{ch.get('difficulty', 1)} / 5
- **预估学时**：约 {ch.get('estimated_hours', 4)} 小时
- **先修子节点**：{prereq}

**本章叶子**：{kps}

点下方绿色叶节点进入各讲义；建议按列表顺序学习。
""".strip()


def build_tableau_branch(curriculum: dict) -> dict:
    children = []
    for ch in curriculum["bi_node"]["children"]:
        ch_id = "bi-tab-" + slug(ch["title"])
        leaves = []
        for kp in ch.get("knowledge_points") or []:
            kid = "bi-tab-" + slug(kp["title"])
            # avoid collisions: prefix with chapter short
            short = slug(ch["title"])[:8]
            kid = f"bi-tab-{short}-{slug(kp['title'])}"
            leaves.append(
                {
                    "id": kid,
                    "title": kp["title"],
                    "level": LEVEL_MAP.get(int(kp.get("difficulty") or 1), "??"),
                    "content": kp_to_content(kp),
                    "children": [],
                }
            )
        children.append(
            {
                "id": ch_id,
                "title": ch["title"],
                "level": LEVEL_MAP.get(int(ch.get("difficulty") or 1), "??"),
                "content": chapter_content(ch),
                "lessonParent": True,
                "children": leaves,
            }
        )

    return {
        "id": "bi-tableau-lab",
        "title": "Tableau 实操",
        "level": "?",
        "content": """### Tableau 实操

面向 Tableau / 同类 BI 工具的动手课：图表基础 → 进阶图 → **LOD（FIXED/INCLUDE/EXCLUDE）** → 仪表板 → 数据建模 → 性能。

与「工具与选型 → Tableau」互补：那边讲选型，这里讲**怎么做**。

建议路径：图表基础 → 图表进阶 → LOD → 仪表板设计 → 数据建模 → 性能优化。
""".strip(),
        "children": children,
    }


def find(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find(c, eid)
        if hit:
            return hit
    return None


def walk_leaves(n, acc=None):
    acc = [] if acc is None else acc
    if not (n.get("children") or []):
        acc.append(n["id"])
    for c in n.get("children") or []:
        walk_leaves(c, acc)
    return acc


def inject_into_tree(tree: dict, branch: dict) -> dict:
    # remove old branch if re-run
    tree["children"] = [c for c in tree.get("children") or [] if c.get("id") != "bi-tableau-lab"]
    # insert before bi-tools if present, else append before scenarios, else append
    kids = tree["children"]
    insert_at = len(kids)
    for i, c in enumerate(kids):
        if c.get("id") in ("bi-tools", "bi-scenarios"):
            insert_at = i
            break
    kids.insert(insert_at, branch)

    # enrich Tableau tool leaf pointer
    tab = find(tree, "bi-tool-tableau")
    if tab:
        tip = "\n\n> **动手课**：请打开同图谱 **Tableau 实操**（图表基础 / LOD / 仪表板等），本页仅作选型导读。\n"
        if "Tableau 实操" not in (tab.get("content") or ""):
            tab["content"] = (tab.get("content") or "").rstrip() + tip

    # root tip
    root_tip = "含 **Tableau 实操** 动手分支（柱/折/饼/环/双轴 + LOD）。"
    if "Tableau 实操" not in (tree.get("content") or ""):
        tree["content"] = (tree.get("content") or "").rstrip() + "\n\n" + root_tip + "\n"

    return tree


def main():
    curriculum = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    branch = build_tableau_branch(curriculum)
    leaf_n = len(walk_leaves(branch))
    print("branch chapters", len(branch["children"]), "leaves", leaf_n)

    sources = []
    for path in [LESSON_BI, KG_BI, *EXTRA_KG]:
        if not path.exists():
            print("skip missing", path)
            continue
        tree = json.loads(path.read_text(encoding="utf-8"))
        tree = inject_into_tree(tree, json.loads(json.dumps(branch)))  # deep copy
        assert find(tree, "bi-tableau-lab")
        assert find(tree, "bi-tab-" + slug("图表基础"))
        # FIXED leaf
        ids = set(walk_leaves(tree))
        assert any("FIXED" in i or "fixed" in i.lower() for i in ids) or any(
            "FIXED" in (find(tree, i) or {}).get("title", "") for i in ids
        )
        path.write_text(json.dumps(tree, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        # also compact copy for kg-data primary
        if path == KG_BI:
            path.write_text(
                json.dumps(tree, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
        sources.append(str(path))
        print("OK", path, "L2", len(tree["children"]), "total leaves", len(walk_leaves(tree)))

    # compact extras
    for path in EXTRA_KG:
        if path.exists():
            tree = json.loads(LESSON_BI.read_text(encoding="utf-8"))
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(
                json.dumps(tree, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            print("synced compact", path)

    print("DONE", sources)


if __name__ == "__main__":
    main()
