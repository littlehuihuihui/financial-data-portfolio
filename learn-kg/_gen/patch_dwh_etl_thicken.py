# -*- coding: utf-8 -*-
"""Post-pass: inject 教义深讲 into every DWH/ETL leaf that still lacks it."""
from __future__ import annotations

import json
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")


def extract_object(src: str, marker: str):
    i = src.find(marker)
    if i < 0:
        raise SystemExit("missing " + marker)
    start = src.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for k in range(start, len(src)):
        ch = src[k]
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
                return start, k + 1, json.loads(src[start : k + 1])
    raise SystemExit("unclosed")


DEEP = """

### 教义深讲

围绕本课记住三条落地纪律：

1. **可复现**：换一个人、同一输入，能得到同一输出（含 NULL、去重、时间窗规则）。
2. **可重跑**：同一分区 / 窗口跑两次结果不变；做不到就先别开自动重试。
3. **可追溯**：口径争议能指到层、任务、契约版本与样例验收数。

**同源样例对照（务必会）**

- 支付口径：`status='paid'` + `SUM(COALESCE(amount,0))`
- 防爆炸：`order_items` 先按 `order_id` 聚合，再关联订单头
- 事件权威：`order_events` 按 `(order_id, event_type)` 去重取最新
- 验收种子：users=4，orders=8，events=7，items=5

**岗位分层**

| 级别 | 你应该能做到 |
|---|---|
| 初级 | 照模板改表名，完成行数/金额闭合 |
| 中级 | 设计增量水位、SCD/MERGE、失败可回填 |
| 高级 | 定 SLA/契约，做血缘影响分析与可回滚发布 |
"""


def thicken(node: dict) -> int:
    n = 0
    kids = node.get("children") or []
    if not kids:
        c = node.get("content") or ""
        if c and "### 教义深讲" not in c:
            title = node.get("title") or node.get("id")
            block = DEEP.replace("围绕本课", f"围绕「{title}」")
            if "### 动手" in c:
                node["content"] = c.replace("### 动手", block + "\n### 动手")
            else:
                node["content"] = c.rstrip() + "\n" + block
            n += 1
        return n
    for ch in kids:
        n += thicken(ch)
    # chapter nodes: light tip
    c = node.get("content") or ""
    if node.get("lessonParent") and "教义提示" not in c:
        node["content"] = (
            c.rstrip()
            + "\n\n> **教义提示**：先点开下方叶子精读；每课按「定义→写法→验收→易错」闭环，不要只收藏标题。\n"
        )
        n += 1
    return n


def walk_leaves(n, acc=None):
    acc = acc if acc is not None else []
    if not (n.get("children") or []):
        acc.append(n)
    for c in n.get("children") or []:
        walk_leaves(c, acc)
    return acc


def main():
    text = HTML.read_text(encoding="utf-8")
    changed = 0
    avgs = {}
    for marker, key in [
        ("const DWH_KNOWLEDGE_TREE = ", "dwh"),
        ("const ETL_KNOWLEDGE_TREE = ", "etl"),
    ]:
        s, e, tree = extract_object(text, marker)
        changed += thicken(tree)
        leaves = walk_leaves(tree)
        lens = [len(x.get("content") or "") for x in leaves]
        avgs[key] = (len(leaves), int(sum(lens) / max(len(lens), 1)), min(lens), max(lens))
        text = text[:s] + json.dumps(tree, ensure_ascii=False, indent=2) + text[e:]

    # neighbor sanity
    for m in [
        "const SQL_KNOWLEDGE_TREE = ",
        "const PYTHON_KNOWLEDGE_TREE = ",
        "const BI_KNOWLEDGE_TREE = ",
        "const DWH_KNOWLEDGE_TREE = ",
        "const ETL_KNOWLEDGE_TREE = ",
    ]:
        extract_object(text, m)

    HTML.write_text(text, encoding="utf-8")
    print("thickened nodes", changed)
    for k, (n, avg, mn, mx) in avgs.items():
        print(f"{k}: leaves={n} avg={avg} min={mn} max={mx}")
    print("size", HTML.stat().st_size)


if __name__ == "__main__":
    main()
