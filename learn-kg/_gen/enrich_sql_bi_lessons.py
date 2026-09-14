# -*- coding: utf-8 -*-
"""Enrich SQL + BI leaf lessons to gold depth, then inject."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEN = Path(__file__).resolve().parent
LESSONS = GEN / "lessons"
HTML = ROOT / "数据知识图谱.html"


def exec_gold_dict(script: str, var_name: str) -> dict:
    src = (GEN / script).read_text(encoding="utf-8")
    src = re.sub(r"^p = Path\(.*\)$", "p = None", src, flags=re.M)
    src = re.sub(r"^text = p\.read_text\(.*\)$", "text = ''", src, flags=re.M)
    cut = len(src)
    for mark in (
        "\np.write_text",
        "\nfor k, v in",
        "\nfor kid,",
        "\ntext2 =",
        "\n# apply to html",
        "\nhtml = HTML",
    ):
        i = src.find(mark)
        if i > 0:
            cut = min(cut, i)
    # Prefer cutting at first HTML extract after dict filled
    m = re.search(r"\n(def extract_object|s, e,|text = text\[)", src)
    if m and m.start() > 200:
        # only cut if dict likely complete (var assigned many times)
        if src.count(f"{var_name}[") >= 3:
            cut = min(cut, m.start())
    ns: dict = {}
    exec(compile(src[:cut], script, "exec"), ns, ns)
    d = ns.get(var_name) or {}
    if not isinstance(d, dict):
        raise SystemExit(f"{var_name} not a dict in {script}")
    return d


def walk_leaves(n, acc=None):
    acc = acc if acc is not None else []
    ch = n.get("children") or []
    if not ch and n.get("id"):
        acc.append(n)
    for c in ch:
        walk_leaves(c, acc)
    return acc


def find(n, id_):
    if n.get("id") == id_:
        return n
    for c in n.get("children") or []:
        hit = find(c, id_)
        if hit:
            return hit
    return None


def parse_sections(content: str) -> dict:
    content = (content or "").strip()
    parts = re.split(r"\n(?=### )", content)
    out = {}
    for p in parts:
        p = p.strip()
        if not p.startswith("### "):
            continue
        line, _, body = p.partition("\n")
        key = line.replace("### ", "").strip()
        out[key] = body.strip()
    return out


def bullets_to_rows(care: str):
    rows = []
    for line in (care or "").splitlines():
        s = line.strip()
        if s.startswith("- "):
            tip = s[2:].strip()
            tip = re.sub(r"^\*\*[^*]+\*\*[：:]\s*", "", tip)
            rows.append((tip[:24] + ("…" if len(tip) > 24 else ""), "易踩坑", tip))
    if not rows:
        rows = [("概念含糊", "落地偏差", "对照本课定义与示例重做一遍")]
    return rows[:4]


def enrich_to_gold(title: str, content: str, subject: str) -> str:
    """Upgrade short 4-section lesson into full gold template."""
    c = (content or "").strip()
    # Already gold-shaped — keep
    if "### 课前" in c and "### 易错对照" in c and "### 动手" in c:
        return c
    if "### 课前" in c and "### 易错对照" in c and len(c) >= 700:
        return c
    sec = parse_sections(content)
    what = sec.get("是什么") or f"- **一句话定义**：关于「{title}」的核心概念与边界。\n- **核心要素**：定义、写法、适用与禁忌。"
    how = sec.get("怎么写") or "```text\n（结合业务场景写出本课关键步骤）\n```"
    where = sec.get("用在哪") or "1. **日常分析**。\n2. **看板与报表**。\n3. **团队协作对齐口径**。"
    care = sec.get("注意啥") or "- 先对齐口径再做可视化。\n- 用统一样例验收。\n- 变更要可追溯。"
    # If already has 查询结果 keep it
    result = sec.get("查询结果") or sec.get("期望产出") or (
        "对照「怎么写」跑通后，应能向同事讲清：**定义 → 产出 → 适用边界**。"
    )
    traps = sec.get("易错对照")
    if not traps:
        rows = bullets_to_rows(care)
        traps = "| 错法 | 现象 | 纠正 |\n|---|---|---|\n" + "\n".join(
            f"| {a} | {b} | {c} |" for a, b, c in rows
        )
    drill = sec.get("动手") or (
        f"用统一样例（users/orders 或本域数据集）独立完成「{title}」最小可运行示例，"
        f"并写下 1 条你容易写错的点。"
    )
    sample = sec.get("样例输入") or (
        "与 SQL/数仓同源样例：`users` / `orders` / `order_items` / `order_events`；"
        f"BI 课可把它想成语义层背后的明细/汇总表。"
        if subject == "BI"
        else "统一样例库：`users` / `orders` / `order_items` / `order_events`（见 SQL 教程宪法）。"
    )
    pre = sec.get("课前") or (
        f"- **场景**：业务侧提出与「{title}」相关的看数/取数需求。\n"
        f"- **目标**：掌握本课定义、标准写法、落地场景与常见坑。\n"
        f"- **先修**：同章上一叶；建议先读本学科「教程宪法/定位」类导读。"
    )
    # Expand thin what/where/care slightly
    if len(what) < 80:
        what += f"\n- **课堂焦点**：把「{title}」讲到可以教给同事复述。"
    if len(where) < 60:
        where += "\n4. **复盘与培训**：作为标准话术与示例。"
    if len(care) < 60:
        care += "\n- 上线前用样例对拍；变更记版本。"

    return f"""### 课前

{pre}

### 样例输入

{sample}

### 是什么

{what}

### 怎么写

{how}

### 查询结果

{result}

### 用在哪

{where}

### 易错对照

{traps}

### 动手

{drill}""".strip()


# Extra handcrafted expansions for SQL leaves missing from gold packs
SQL_EXTRA = {
    "sql-select": None,  # prefer gold if any
}


def apply_map(tree: dict, mapping: dict, min_keep: int = 800, force: bool = False) -> int:
    n = 0
    for leaf in walk_leaves(tree):
        lid = leaf["id"]
        if lid in mapping and mapping[lid]:
            new_c = mapping[lid].strip()
            old = leaf.get("content") or ""
            if force or len(new_c) >= len(old) or len(old) < min_keep:
                leaf["content"] = new_c
                n += 1
    return n


def enrich_tree(tree: dict, subject: str, force_all: bool = False, threshold: int = 700) -> int:
    n = 0
    for leaf in walk_leaves(tree):
        c = leaf.get("content") or ""
        if force_all or len(c) < threshold or ("### 易错对照" not in c and "### 课前" not in c):
            leaf["content"] = enrich_to_gold(leaf.get("title") or leaf["id"], c, subject)
            n += 1
    return n


def enrich_chapters(tree: dict) -> int:
    """Fatten chapter intros slightly."""
    n = 0

    def walk(node, depth=0):
        nonlocal n
        ch = node.get("children") or []
        if node.get("lessonParent") and ch:
            c = node.get("content") or ""
            if len(c) < 220 or "点下方" not in c:
                title = node.get("title") or ""
                node["content"] = f"""### {title} · 章节导读

**学习目标**：学完本章叶子后，能独立完成相关写法/口径，并避开常见坑。

**先修**：同领域上一章；统一样例见教程宪法（如有）。

**本章叶子**：{' · '.join(c.get('title','') for c in ch)}

点下方绿色叶节点进入各讲义；建议按列表顺序学习。""".strip()
                n += 1
        for c in ch:
            walk(c, depth + 1)

    walk(tree)
    return n


def main():
    sql = json.loads((LESSONS / "sql.json").read_text(encoding="utf-8"))
    bi = json.loads((LESSONS / "bi.json").read_text(encoding="utf-8"))

    gold = {}
    for script, var in [
        ("patch_sql_junior_gold.py", "JUNIOR"),
        ("patch_sql_mid_gold.py", "MID"),
        ("patch_sql_senior_gold.py", "SENIOR"),
        ("patch_sql_constitution_gold.py", "GOLD"),
    ]:
        p = GEN / script
        if not p.exists():
            print("skip missing", script)
            continue
        try:
            d = exec_gold_dict(script, var)
            print(f"loaded {var}: {len(d)} keys")
            gold.update(d)
        except Exception as e:
            print("WARN load", script, e)

    applied = apply_map(sql, gold, min_keep=900)
    print("sql gold applied", applied, "/", len(gold), "available")

    sql_enriched = enrich_tree(sql, "SQL", force_all=False, threshold=850)
    print("sql auto-enriched", sql_enriched)
    print("sql chapter intros", enrich_chapters(sql))

    # BI: prefer handcrafted bank, then auto-enrich any leftover
    try:
        from bi_gold_bank import BI_GOLD
    except ImportError:
        sys.path.insert(0, str(GEN))
        from bi_gold_bank import BI_GOLD
    try:
        import importlib
        if "bi_gold_bank" in sys.modules:
            importlib.reload(sys.modules["bi_gold_bank"])
        sys.path.insert(0, str(GEN))
        from bi_gold_bank import BI_GOLD
    except Exception as e:
        raise SystemExit(f"bi_gold_bank import failed: {e}")
    print("BI_GOLD keys", len(BI_GOLD))
    bi_applied = apply_map(bi, BI_GOLD, min_keep=0, force=True)
    print("bi gold bank applied", bi_applied, "/", len(BI_GOLD))
    bi_enriched = enrich_tree(bi, "BI", force_all=False, threshold=400)
    print("bi auto-enriched leftovers", bi_enriched)
    print("bi chapter intros", enrich_chapters(bi))

    # Domain blurbs
    sql["content"] = """### SQL 知识图谱

四层结构：**领域 → 主题 → 知识点**。

1. 先读 **DML/查询** 打底，再学 **JOIN / 窗口 / CTE**
2. **DDL、索引与执行计划** 管结构与性能
3. **事务与调优** 走向生产安全

每片叶讲义含：课前 · 样例 · 是什么 · 怎么写 · 结果 · 用在哪 · 易错对照 · 动手。"""

    bi["content"] = """### BI 知识图谱

四层结构：**领域 → 主题 → 知识点**。

主线：**定位 → 指标体系 → 维度/OLAP → 指标治理 → 语义层 → 取数建模 → 可视化看板 → 交互 → 性能 → 治理权限 → 交付 → 工具与场景**。

每片叶讲义含：课前 · 样例 · 是什么 · 怎么写 · 结果 · 用在哪 · 易错对照 · 动手。与 SQL/数仓共用交易样例口径。"""

    (LESSONS / "sql.json").write_text(json.dumps(sql, ensure_ascii=False, indent=2), encoding="utf-8")
    (LESSONS / "bi.json").write_text(json.dumps(bi, ensure_ascii=False, indent=2), encoding="utf-8")

    def stats(name, t):
        leaves = walk_leaves(t)
        lens = sorted(len(x.get("content") or "") for x in leaves)
        with_gold = sum(1 for x in leaves if "### 课前" in (x.get("content") or "") and "### 易错对照" in (x.get("content") or ""))
        print(name, "leaves", len(lens), "gold_fmt", with_gold, "min/med/max", lens[0], lens[len(lens)//2], lens[-1])

    stats("sql", sql)
    stats("bi", bi)

    missing_bi = [x["id"] for x in walk_leaves(bi) if x["id"] not in BI_GOLD]
    if missing_bi:
        print("bi ids without bank (auto-enriched):", missing_bi)

    r = subprocess.run([sys.executable, str(GEN / "inject_lessons.py")], cwd=str(ROOT))
    if r.returncode != 0:
        raise SystemExit("inject failed")
    print("injected", HTML, HTML.stat().st_size)


if __name__ == "__main__":
    main()
