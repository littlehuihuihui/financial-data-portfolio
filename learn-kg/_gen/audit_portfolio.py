# -*- coding: utf-8 -*-
"""Full portfolio audit for 数据学习平台 knowledge graph."""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "数据知识图谱.html"
LESSONS = ROOT / "_gen" / "lessons"
HUBS = ["sql", "python", "database", "ml", "etl", "dwh", "bi"]
VAR = {
    "sql": "SQL_KNOWLEDGE_TREE",
    "python": "PYTHON_KNOWLEDGE_TREE",
    "database": "DATABASE_KNOWLEDGE_TREE",
    "ml": "ML_KNOWLEDGE_TREE",
    "etl": "ETL_KNOWLEDGE_TREE",
    "dwh": "DWH_KNOWLEDGE_TREE",
    "bi": "BI_KNOWLEDGE_TREE",
}
ISSUES: list[tuple[str, str, str]] = []


def issue(sev: str, area: str, msg: str):
    ISSUES.append((sev, area, msg))


def extract_const(html: str, marker: str):
    i = html.find(marker)
    if i < 0:
        return None
    j = html.find("{", i)
    depth = 0
    in_str = esc = False
    for k in range(j, len(html)):
        ch = html[k]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return json.loads(html[j : k + 1])
    return None


def walk(n, depth=0):
    yield n, depth
    for c in n.get("children") or []:
        yield from walk(c, depth + 1)


def classify(n, depth):
    kids = n.get("children") or []
    if not kids:
        return "leaf"
    if n.get("lessonParent"):
        return "chapter"
    if depth == 0:
        return "root"
    if depth == 1:
        return "domain"
    return "mid"


def med(xs):
    if not xs:
        return 0
    xs = sorted(xs)
    return xs[len(xs) // 2]


def leaf_count(t):
    return sum(1 for n, _ in walk(t) if not (n.get("children") or []))


def main():
    html = HTML.read_text(encoding="utf-8")
    print(f"HTML size={HTML.stat().st_size:,} bytes")

    ki = html.find("const KG_TREES = ")
    if ki < 0:
        issue("P0", "mount", "KG_TREES not found")
    else:
        block = html[ki : ki + 400]
        mounted = re.findall(r"\b(sql|python|database|ml|etl|dwh|bi)\s*:", block)
        print("KG_TREES:", mounted)
        for h in HUBS:
            if h not in mounted:
                issue("P0", "mount", f"hub `{h}` missing from KG_TREES")

    for name in ["SQL_SAMPLE", "PYTHON_SAMPLE", "DB_SAMPLE", "ML_SAMPLE", "ETL_SAMPLE", "DWH_SAMPLE", "BI_SAMPLE"]:
        if f"const {name}" not in html:
            issue("P2", "sample", f"{name} missing")

    if "enterKgDrill" not in html:
        issue("P0", "ux", "enterKgDrill missing")
    if "该学科教程尚未挂载" in html:
        # OK as fallback message
        pass

    # catalog + KG dual identity
    catalog_hubs = re.findall(r'id:\s*"(sql|python|database|ml|etl|dwh|bi)"[\s\S]{0,200}?catalog:\s*true', html)
    if catalog_hubs:
        issue("P1", "ux", f"hubs still marked catalog:true (may conflict with KG): {sorted(set(catalog_hubs))}")

    # auto-jump prefer
    if 'hub === "database" ? "db-constitution"' in html or "database\" ? \"db-constitution" in html:
        # check if auto open still happens
        if re.search(r'prefer = hub === "sql".*database.*db-constitution', html, re.S):
            issue("P2", "ux", "database still in auto-prefer jump chain — verify it does not skip L2 fan")

    print("\n=== Per-hub stats (JSON) ===")
    print(f"{'hub':8} {'L':>4} {'D':>3} {'C':>3} {'leafMed':>7} {'chMed':>6} {'domMed':>6} {'gold':>5} {'keqian':>6}")
    leaf_meds = {}
    all_ids = set()

    for hub in HUBS:
        jp = LESSONS / f"{hub}.json"
        if not jp.exists():
            issue("P0", "sync", f"missing lessons/{hub}.json")
            continue
        tree = json.loads(jp.read_text(encoding="utf-8"))
        html_tree = extract_const(html, f"const {VAR[hub]} = ")
        if html_tree is None:
            issue("P0", "sync", f"{VAR[hub]} missing in HTML")
        else:
            if leaf_count(tree) != leaf_count(html_tree):
                issue(
                    "P0",
                    "sync",
                    f"{hub}: JSON leaves={leaf_count(tree)} HTML leaves={leaf_count(html_tree)}",
                )
            # content drift: compare one constitution-ish leaf length
            def find(t, nid):
                for n, _ in walk(t):
                    if n.get("id") == nid:
                        return n
                return None

            # sample compare first leaf content length
            jl = next((n for n, _ in walk(tree) if not n.get("children")), None)
            if jl:
                hl = find(html_tree, jl["id"])
                if hl and abs(len(jl.get("content") or "") - len(hl.get("content") or "")) > 50:
                    issue(
                        "P1",
                        "sync",
                        f"{hub}/{jl['id']}: JSON len={len(jl.get('content') or '')} HTML len={len(hl.get('content') or '')}",
                    )

        buckets = defaultdict(list)
        gold = keqian = 0
        for n, d in walk(tree):
            if n.get("id"):
                all_ids.add(n["id"])
            kind = classify(n, d)
            c = n.get("content") or ""
            buckets[kind].append(len(c))
            kids = n.get("children") or []
            if n.get("lessonParent") and not kids:
                issue("P0", "structure", f"{hub}/{n.get('id')} lessonParent with empty children")
            if kind == "leaf":
                if "### 课前" in c:
                    keqian += 1
                if ("### 是什么" in c and "### 怎么写" in c) or "### 课前" in c:
                    gold += 1
                if len(c) < 400:
                    issue("P2", hub, f"thin leaf {n.get('id')} len={len(c)}")
                if "\ufffd" in c:
                    issue("P1", "encoding", f"{hub}/{n.get('id')} U+FFFD")
            if kind in ("domain", "chapter") and len(c) < 300:
                issue("P1", hub, f"thin {kind} {n.get('id')} len={len(c)}")

        ctr = Counter(n.get("id") for n, _ in walk(tree) if n.get("id"))
        dups = [i for i, v in ctr.items() if v > 1]
        if dups:
            issue("P0", "structure", f"{hub} duplicate ids: {dups[:10]}")

        nleaf = len(buckets["leaf"]) or 1
        leaf_meds[hub] = med(buckets["leaf"])
        print(
            f"{hub:8} {len(buckets['leaf']):4} {len(buckets['domain']):3} {len(buckets['chapter']):3} "
            f"{med(buckets['leaf']):7} {med(buckets['chapter']):6} {med(buckets['domain']):6} "
            f"{100*gold//nleaf:4}% {100*keqian//nleaf:5}%"
        )

    print("\n=== Leaf median ranking ===")
    for h, m in sorted(leaf_meds.items(), key=lambda x: -x[1]):
        print(f"  {h:8} {m}")
    mx = max(leaf_meds.values()) if leaf_meds else 1
    for h, m in leaf_meds.items():
        if m < mx * 0.45 and h not in ("sql",):  # sql may be longest
            if m < 900:
                issue("P1", "content", f"{h} leaf median {m} far behind peers (max={mx})")

    # SQL special: empty lessonParent historically
    sql = json.loads((LESSONS / "sql.json").read_text(encoding="utf-8"))
    for n, _ in walk(sql):
        if n.get("id") == "sql-rank":
            if n.get("lessonParent") and not (n.get("children") or []):
                issue("P0", "sql", "sql-rank lessonParent empty children")
            elif not n.get("children") and n.get("lessonParent"):
                issue("P0", "sql", "sql-rank bad structure")

    # home hub list
    if "首页可见的学科大节点" in html:
        pass
    home = re.search(r"HOME_HUBS\s*=\s*\[([\s\S]*?)\]", html)
    # alternate: hubs array
    hub_ids_home = re.findall(r'id:\s*"(sql|python|database|ml|etl|dwh|bi)"', html[:250000])
    # too noisy

    # nested folder
    nested = ROOT / "数据学习平台"
    if nested.exists() and any(nested.iterdir()):
        issue("P1", "repo", f"nested duplicate dir `{nested.name}/` exists — easy to edit wrong copy")

    # dangerous patches
    dang = []
    for p in (ROOT / "_gen").glob("patch_*.py"):
        txt = p.read_text(encoding="utf-8", errors="ignore")
        if "if __name__" not in txt and re.search(r"\.write_text\(", txt):
            dang.append(p.name)
    if dang:
        issue("P1", "tooling", f"{len(dang)} patch scripts write files without __main__ guard (import side-effect risk)")

    # style inconsistency: 查询结果 vs 运行结果
    style_mix = Counter()
    for hub in HUBS:
        t = json.loads((LESSONS / f"{hub}.json").read_text(encoding="utf-8"))
        for n, d in walk(t):
            if classify(n, d) != "leaf":
                continue
            c = n.get("content") or ""
            if "### 查询结果" in c:
                style_mix["查询结果"] += 1
            if "### 运行结果" in c:
                style_mix["运行结果"] += 1
            if "### 注意啥" in c and "### 易错对照" not in c:
                style_mix["注意啥_only"] += 1
            if "### 课前" in c:
                style_mix["课前"] += 1
    print("\n=== Style markers (leaf counts) ===")
    for k, v in style_mix.most_common():
        print(f"  {k}: {v}")
    if style_mix["注意啥_only"] > 20:
        issue("P1", "content", f"{style_mix['注意啥_only']} leaves still short-form 注意啥 (not 易错对照)")
    if style_mix["查询结果"] and style_mix["运行结果"]:
        issue("P2", "content", f"heading mix 查询结果={style_mix['查询结果']} vs 运行结果={style_mix['运行结果']}")

    # BI/ETL/DWH nonleaf
    for hub in ("etl", "dwh", "bi", "sql"):
        t = json.loads((LESSONS / f"{hub}.json").read_text(encoding="utf-8"))
        thin_nl = [
            n.get("id")
            for n, d in walk(t)
            if classify(n, d) in ("domain", "chapter") and len(n.get("content") or "") < 250
        ]
        if thin_nl:
            issue("P1", hub, f"{len(thin_nl)} thin domain/chapter guides e.g. {thin_nl[:6]}")

    print("\n=== ISSUE SUMMARY ===")
    by = Counter(s for s, _, _ in ISSUES)
    print(dict(by))
    for sev in ("P0", "P1", "P2"):
        items = [x for x in ISSUES if x[0] == sev]
        if not items:
            continue
        print(f"\n-- {sev} ({len(items)}) --")
        for _, a, m in items:
            print(f"[{a}] {m}")

    out = ROOT / "_gen" / "_portfolio_audit.md"
    lines = ["# 作品集复盘审计\n\n", f"- HTML: `{HTML.name}` ({HTML.stat().st_size:,} bytes)\n"]
    lines.append(f"- Leaf medians: {leaf_meds}\n\n## Issues\n\n")
    for s, a, m in ISSUES:
        lines.append(f"- **{s}** `{a}` — {m}\n")
    out.write_text("".join(lines), encoding="utf-8")
    print(f"\nWrote {out}")


if __name__ == "__main__":
    main()
