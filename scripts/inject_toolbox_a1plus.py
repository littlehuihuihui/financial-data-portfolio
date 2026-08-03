# -*- coding: utf-8 -*-
"""Inject A1+ long-form fields into ANALYSIS_TOOLBOX method objects."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(r"d:\cursor\财务数据分析")
sys.path.insert(0, str(ROOT / "portfolio" / "scripts"))
from toolbox_a1plus_catalog import fields_for  # noqa: E402

FIELD_KEYS = [
    "definition",
    "principle",
    "applicable",
    "purpose",
    "steps",
    "outputsAndPitfalls",
    "vsOtherMethods",
    "boundaries",
]


def js_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def find_matching_brace(text: str, open_idx: int) -> int:
    depth = 0
    i = open_idx
    in_str = False
    escape = False
    while i < len(text):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def object_start_before(text: str, pos: int) -> int:
    i = pos
    depth = 0
    in_str = False
    escape = False
    while i >= 0:
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "}":
                depth += 1
            elif ch == "{":
                if depth == 0:
                    return i
                depth -= 1
        i -= 1
    return -1


def upsert_fields(block: str, fields: dict) -> str:
    # Also keep short mirrors for older UI keys
    mirrors = {
        "what": fields["definition"],
        "when": fields["applicable"],
        "how": fields["steps"],
        "purpose": fields["purpose"],
    }
    all_fields = {**fields, **mirrors}

    for k, v in all_fields.items():
        if re.search(rf"\b{k}\s*:", block):
            block = re.sub(
                rf'({k}\s*:\s*)"(?:[^"\\]|\\.)*"',
                lambda m, val=v: m.group(1) + js_str(val),
                block,
                count=1,
            )
        else:
            insert = f"{k}: {js_str(v)},\n        "
            if re.search(r"\bbusinessQuestion\s*:", block):
                block = re.sub(r"(businessQuestion\s*:)", insert + r"\1", block, count=1)
            elif re.search(r'(explain\s*:\s*"(?:[^"\\]|\\.)*")\s*,', block):
                block = re.sub(
                    r'(explain\s*:\s*"(?:[^"\\]|\\.)*")\s*,',
                    r"\1,\n        " + insert,
                    block,
                    count=1,
                )
            else:
                # after id line
                block = re.sub(
                    r'(id\s*:\s*"[^"]+"\s*,\s*)',
                    r"\1" + insert,
                    block,
                    count=1,
                )
    return block


def patch_file(path: Path, industry: str) -> int:
    text = path.read_text(encoding="utf-8")
    start = text.find("window.ANALYSIS_TOOLBOX")
    if start < 0:
        print("SKIP", path)
        return 0
    head, body = text[:start], text[start:]
    id_re = re.compile(r'\bid\s*:\s*"([^"]+)"')
    selected = []
    seen = set()
    for m in id_re.finditer(body):
        mid = m.group(1)
        obj_start = object_start_before(body, m.start())
        if obj_start < 0:
            continue
        obj_end = find_matching_brace(body, obj_start)
        if obj_end < 0:
            continue
        span = (obj_start, obj_end + 1)
        if span in seen:
            continue
        block = body[obj_start : obj_end + 1]
        if "methods:" in block or re.search(r"\blayer\s*:", block):
            continue
        if "explain" not in block and "businessQuestion" not in block:
            continue
        first_id = id_re.search(block)
        if not first_id or first_id.group(1) != mid:
            continue
        seen.add(span)
        selected.append((obj_start, obj_end + 1, mid))

    selected.sort(key=lambda x: x[0], reverse=True)
    count = 0
    for obj_start, obj_end, mid in selected:
        fields = fields_for(mid, industry)
        if not fields:
            print("  missing catalog:", mid)
            continue
        block = body[obj_start:obj_end]
        new_block = upsert_fields(block, fields)
        body = body[:obj_start] + new_block + body[obj_end:]
        count += 1

    # refresh intro snippets
    body = body.replace(
        "每种方法按「是什么 / 何时用 / 目的 / 怎么用」四段说明，并附业务问题与作品集应用示例。",
        "每种方法按教材体展开：定义与别名、核心思想与原理、适用与不适用、分析目的、操作步骤、输出物与常见误区，并补充与其他方法的区别、边界条件与失效情形；另附业务问题与作品集应用示例。",
    )
    body = body.replace(
        "每种方法按「是什么 / 何时用 / 目的 / 怎么用」说明，帮助 OTT 增长团队快速选用合适手法。",
        "每种方法按教材体（定义/原理/适用/目的/步骤/输出与误区/方法对比/边界）展开，帮助 OTT 增长团队系统理解并选用手法。",
    )
    body = body.replace(
        "每种方法按「是什么 / 何时用 / 目的 / 怎么用」说明，并附业务问题与作品集示例。",
        "每种方法按教材体（定义/原理/适用/目的/步骤/输出与误区/方法对比/边界）展开，并附业务问题与作品集示例。",
    )

    path.write_text(head + body, encoding="utf-8")
    print(f"OK {path} -> {count}")
    return count


def main() -> None:
    files = [
        (ROOT / "portfolio/industries/retail/js/analysis-toolbox-data.js", "retail"),
        (ROOT / "retail-finance-analysis/docs/shared/analysis-toolbox-data.js", "retail"),
        (ROOT / "portfolio/industries/internet/js/methodology-playbook-data.js", "internet"),
        (ROOT / "portfolio/industries/manufacturing/js/methodology-playbook-data.js", "manufacturing"),
    ]
    total = 0
    for p, ind in files:
        total += patch_file(p, ind) if p.exists() else 0
    print("TOTAL", total)


if __name__ == "__main__":
    main()
