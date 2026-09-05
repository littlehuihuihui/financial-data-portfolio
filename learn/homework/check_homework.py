#!/usr/bin/env python3
"""检查第08章设计包 JSON：表名须能在权威 DDL 中 grep 到（或标 proposed）。

用法：
  python learn/homework/check_homework.py learn/homework/08-template.json
  python learn/homework/check_homework.py path/to/my_pack.json --industry internet

退出码：0 通过；1 失败。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # portfolio/
REPO = ROOT.parent

DDL_MAP = {
    "internet": [
        ROOT / "industries/internet/database/ott_ddl.sql",
        ROOT / "industries/internet/database/04_ott_ads_views.sql",
    ],
    "retail": [
        ROOT / "industries/retail/database/kimball_design/01_ods.sql",
        ROOT / "industries/retail/database/kimball_design/03_dwd.sql",
        ROOT / "industries/retail/database/kimball_design/04_dws.sql",
        ROOT / "industries/retail/sql6_portfolio_model/05_ads.sql",
    ],
    "manufacturing": [
        ROOT / "industries/manufacturing/database/01_ods.sql",
        ROOT / "industries/manufacturing/database/03_dwd.sql",
        ROOT / "industries/manufacturing/database/04_dws.sql",
    ],
}

REQUIRED = [
    "title",
    "industry",
    "business_process",
    "grain",
    "success_criteria",
    "tables",
    "metrics",
    "dq",
    "sla",
    "risks",
]


def load_ddl_text(industry: str) -> str:
    chunks = []
    for p in DDL_MAP.get(industry, []):
        if p.exists():
            chunks.append(p.read_text(encoding="utf-8"))
    return "\n".join(chunks)


def table_mentioned(ddl: str, name: str) -> bool:
    # CREATE TABLE/VIEW name 或注释中的裸名（宽松但要求词边界）
    pat = re.compile(rf"\b{re.escape(name)}\b", re.I)
    return bool(pat.search(ddl))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("json_path", type=Path)
    ap.add_argument("--industry", default=None)
    args = ap.parse_args()
    data = json.loads(args.json_path.read_text(encoding="utf-8"))
    errs: list[str] = []
    warns: list[str] = []

    for k in REQUIRED:
        if k not in data or data[k] in (None, "", [], {}):
            errs.append(f"缺少字段: {k}")

    industry = args.industry or data.get("industry") or "internet"
    if industry not in DDL_MAP:
        errs.append(f"未知 industry: {industry}")
        print("\n".join(errs))
        return 1

    ddl = load_ddl_text(industry)
    if not ddl.strip():
        errs.append("未读到 DDL 文件")

    tables = data.get("tables") or {}
    proposed = set(data.get("proposed_objects") or [])
    ads_notes = (data.get("ads_notes") or "") + " " + str(data.get("notes") or "")
    for layer, names in tables.items():
        if not isinstance(names, list):
            errs.append(f"tables.{layer} 应为数组")
            continue
        for name in names:
            if name in proposed or "拟新增" in ads_notes and layer == "ads":
                if not table_mentioned(ddl, name):
                    warns.append(f"拟新增/未入库对象: {layer}.{name}（允许，请确保文档标明）")
                continue
            if not table_mentioned(ddl, name):
                # ADS 拟新增常见：不在 04 中
                if layer == "ads" and ("拟新增" in ads_notes or "proposed" in ads_notes.lower()):
                    warns.append(f"ADS 拟新增未在 DDL: {name}")
                else:
                    errs.append(f"表名无法在 {industry} DDL 中定位: {layer}.{name}")

    for i, m in enumerate(data.get("metrics") or []):
        if not m.get("name") or not m.get("formula"):
            errs.append(f"metrics[{i}] 缺 name/formula")

    if len(data.get("dq") or []) < 1:
        errs.append("dq 至少 1 条")

    print(f"Check: {args.json_path}")
    print(f"Industry: {industry}")
    for w in warns:
        print("  WARN ", w)
    if errs:
        for e in errs:
            print("  ERR  ", e)
        print("RESULT: FAIL")
        return 1
    print("RESULT: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
