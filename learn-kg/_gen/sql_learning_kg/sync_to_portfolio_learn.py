# -*- coding: utf-8 -*-
"""Sync updated 数据知识图谱.html → portfolio learn.html (+ mirror copy)."""
from pathlib import Path
import re
import shutil

SRC = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
LEARN = Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html")
MIRROR = Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html")
PUBLISH = Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html")

# Portfolio title branding used on 5100
PORTFOLIO_TITLE = "数仓与分析实战教材 · 数据知识图谱 · DATA NEXUS"


def extract_json_object(html: str, start_idx: int):
    i = html.find("{", start_idx)
    if i < 0:
        raise SystemExit("no JSON object start")
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(html)):
        ch = html[j]
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
                return html[i : j + 1], j + 1
    raise SystemExit("unbalanced JSON")


def replace_kg_block(dst: str, src: str) -> str:
    """Replace SQL_KNOWLEDGE_TREE … KG_TREES block from src into dst."""
    src_si = src.find("    const SQL_KNOWLEDGE_TREE = ")
    src_ki = src.find("    const KG_TREES = ")
    dst_si = dst.find("    const SQL_KNOWLEDGE_TREE = ")
    dst_ki = dst.find("    const KG_TREES = ")
    if min(src_si, src_ki, dst_si, dst_ki) < 0:
        raise SystemExit("KG block markers missing")
    _, src_end = extract_json_object(src, src_ki + len("    const KG_TREES = "))
    if src_end < len(src) and src[src_end] == ";":
        src_end += 1
    _, dst_end = extract_json_object(dst, dst_ki + len("    const KG_TREES = "))
    if dst_end < len(dst) and dst[dst_end] == ";":
        dst_end += 1
    return dst[:dst_si] + src[src_si:src_end] + dst[dst_end:]


def patch_runtime(dst: str, src: str) -> str:
    """Bring over critical runtime patches if missing."""
    # Prefer full-file copy when structures are sibling clones — safer for panel/click fixes.
    # Here we still patch key markers if block replace alone isn't enough.
    replacements = [
        (
            'new Set(["sql-root", "sql-dml-query", "sql-window"])',
            'new Set(["sql-root", "sql-L0", "sql-L1"])',
        ),
        (
            'sqlKgState.activeId = "sql-window";',
            'sqlKgState.activeId = "sql-L1";',
        ),
        (
            'findSqlKgNode("sql-window")',
            'findSqlKgNode("sql-L1")',
        ),
        (
            'const prefer = hub === "sql" ? "sql-constitution"',
            'const prefer = hub === "sql" ? "sql-L0"',
        ),
    ]
    for old, new in replacements:
        if old in dst:
            dst = dst.replace(old, new)

    old_sql = (
        '"sql-dml-query": "foundation", "sql-ddl": "foundation", "sql-join": "foundation",\n'
        '      "sql-window": "advanced", "sql-cte": "advanced", "sql-index-plan": "advanced",\n'
        '      "sql-tx-lock": "practice", "sql-txn": "practice", "sql-tune": "practice", '
    )
    new_sql = (
        '"sql-L0": "foundation", "sql-L1": "foundation", "sql-L2": "foundation", "sql-L3": "foundation",\n'
        '      "sql-L4": "advanced", "sql-L5": "advanced",\n'
        '      "sql-L6": "practice", "sql-paths": "practice", '
    )
    if old_sql in dst:
        dst = dst.replace(old_sql, new_sql, 1)

    # If click/panel fixes missing, copy whole src body (keep portfolio title)
    if "panelResizeSuppressClick" not in dst or "openKgHubOverview" not in dst:
        print("runtime fixes missing → full file sync from source")
        body = src
        body = re.sub(
            r"<title>[^<]*</title>",
            f"<title>{PORTFOLIO_TITLE}</title>",
            body,
            count=1,
        )
        return body

    return dst


def sync_one(path: Path, src_text: str, keep_title: bool) -> None:
    if not path.exists():
        print("skip missing", path)
        return
    bak = path.with_suffix(path.suffix + ".pre_sql_l0l6.bak")
    if not bak.exists():
        shutil.copy2(path, bak)
        print("backup", bak.name)

    dst = path.read_text(encoding="utf-8")
    # Prefer full sync when target is the learn page clone — includes all UX fixes
    if path.name in ("learn.html", "数据知识图谱.html") and (
        "panelResizeSuppressClick" not in dst or "sql-L0" not in dst
    ):
        out = src_text
        if keep_title:
            out = re.sub(
                r"<title>[^<]*</title>",
                f"<title>{PORTFOLIO_TITLE}</title>",
                out,
                count=1,
            )
        path.write_text(out, encoding="utf-8")
        print("full sync →", path)
        return

    out = replace_kg_block(dst, src_text)
    out = patch_runtime(out, src_text)
    path.write_text(out, encoding="utf-8")
    print("block sync →", path)


def main():
    src = SRC.read_text(encoding="utf-8")
    assert "sql-L0" in src and "panelResizeSuppressClick" in src

    sync_one(LEARN, src, keep_title=True)
    sync_one(MIRROR, src, keep_title=True)
    if PUBLISH.exists():
        sync_one(PUBLISH, src, keep_title=True)

    for p in (LEARN, MIRROR, PUBLISH):
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8")
        ok = all(k in t for k in ("sql-L0", "sql-L1-N1", "sql-L6-N7", "panelResizeSuppressClick", "openKgHubOverview"))
        print("verify", p.name, "OK" if ok else "FAIL", "size", len(t))


if __name__ == "__main__":
    main()
