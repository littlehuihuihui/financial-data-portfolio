# -*- coding: utf-8 -*-
"""Survey Database hub + ML knowledge tree hierarchy."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"D:\cursor\数据学习平台")
HTML = (ROOT / "数据知识图谱.html").read_text(encoding="utf-8")
ML_JSON = json.loads((ROOT / "_gen/lessons/ml.json").read_text(encoding="utf-8"))


def extract_json_object(text: str, start_idx: int) -> str:
    i = text.find("{", start_idx)
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(text)):
        ch = text[j]
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
                return text[i : j + 1]
    raise SystemExit("unbalanced")


def outline(n, depth=0, rows=None):
    rows = rows if rows is not None else []
    kids = n.get("children") or []
    if depth == 0:
        kind = "ROOT"
    elif depth == 1:
        kind = "L2"
    elif n.get("lessonParent"):
        kind = "L3"
    elif not kids:
        kind = "L4"
    else:
        kind = f"L{depth+1}?"
    rows.append(
        {
            "depth": depth,
            "kind": kind,
            "id": n.get("id"),
            "title": n.get("title"),
            "level": n.get("level"),
            "kids": len(kids),
            "clen": len(n.get("content") or ""),
            "lessonParent": bool(n.get("lessonParent")),
        }
    )
    for c in kids:
        outline(c, depth + 1, rows)
    return rows


def anomalies(tree):
    issues = []

    def rec(n, depth=0, parent=None):
        kids = n.get("children") or []
        if n.get("lessonParent") and not kids:
            issues.append(f"EMPTY_CHAPTER {n.get('id')} {n.get('title')}")
        if n.get("lessonParent") and parent and parent.get("lessonParent"):
            issues.append(f"NESTED_CHAPTER {parent.get('id')} -> {n.get('id')}")
        if not kids and n.get("lessonParent"):
            issues.append(f"LEAF_MARKED_CHAPTER {n.get('id')}")
        if depth >= 2 and kids and not n.get("lessonParent"):
            if all(not (c.get("children") or []) for c in kids):
                issues.append(f"LEAVES_UNDER_NON_CHAPTER {n.get('id')} {n.get('title')}")
        if depth == 1:
            leaf_n = 0

            def lc(x):
                nonlocal leaf_n
                ck = x.get("children") or []
                if not ck:
                    leaf_n += 1
                for c in ck:
                    lc(c)

            lc(n)
            if leaf_n <= 1:
                issues.append(f"THIN_DOMAIN({leaf_n}) {n.get('id')} {n.get('title')}")
            if leaf_n == 0:
                issues.append(f"EMPTY_DOMAIN {n.get('id')}")
        # very short leaf content
        if not kids and len(n.get("content") or "") < 80:
            issues.append(f"STUB_LEAF {n.get('id')} clen={len(n.get('content') or '')}")
        for c in kids:
            rec(c, depth + 1, n)

    for c in tree.get("children") or []:
        rec(c, 1)
    return issues


def leaf_count(tree):
    n = 0

    def rec(x):
        nonlocal n
        kids = x.get("children") or []
        if not kids:
            n += 1
        for c in kids:
            rec(c)

    for c in tree.get("children") or []:
        rec(c)
    return n


print("=" * 60)
print("DATABASE: KG_TREES wiring")
print("DATABASE_KNOWLEDGE_TREE in HTML?", "DATABASE_KNOWLEDGE_TREE" in HTML)
print("HOME_HERO has database?", "database" in re.search(r"HOME_HERO_HUBS\s*=\s*\[(.*?)\]", HTML, re.S).group(1))

# extract database node from nodes array - find "id": "database"
db_idx = HTML.find('"id": "database"')
print("database hub idx", db_idx)
if db_idx > 0:
    # print nearby engines titles
    chunk = HTML[db_idx : db_idx + 15000]
    engines = re.findall(r'"name":\s*"([^"]+)"', chunk)
    topics = re.findall(r'"name":\s*"([^"]+)"\s*,\s*"text"', chunk)
    print("nearby names (first 40):", engines[:40])
    # try extract detail.l2.topics names more carefully within database object
    raw = extract_json_object(HTML, db_idx - 5)
    try:
        # may fail if not starting at {
        pass
    except Exception:
        pass
    # find from { before id
    brace = HTML.rfind("{", 0, db_idx)
    # walk back to object start for this node - heuristic: look for category nearby
    node_start = HTML.rfind("{\n    \"id\": \"database\"", 0, db_idx + 20)
    if node_start < 0:
        node_start = HTML.rfind('"id": "database"', 0, db_idx + 1)
        node_start = HTML.rfind("{", 0, node_start)
    try:
        db_node = json.loads(extract_json_object(HTML, node_start))
        print("DB hub keys", db_node.keys())
        detail = db_node.get("detail", {})
        l2 = detail.get("l2", {})
        print("DB subtitle", detail.get("subtitle"))
        print("DB principles", l2.get("principles"))
        print("DB terms", l2.get("terms"))
        print("DB topics:")
        for t in l2.get("topics") or []:
            print(f"  - {t.get('name')}: children={len(t.get('children') or [])}")
            for ch in t.get("children") or []:
                print(f"      · {ch.get('name')}")
        print("DB engines:")
        for e in db_node.get("engines") or []:
            print(f"  - {e.get('id')}: {e.get('name')} | {e.get('tagline')}")
            ed = (e.get("detail") or {}).get("l2") or {}
            for t in ed.get("topics") or []:
                print(f"      topic: {t.get('name')}")
    except Exception as ex:
        print("db node parse fail", ex)
        print(HTML[node_start : node_start + 200])

# patch file existence / size hint
patch = ROOT / "_gen/patch_database_kg.py"
print("patch_database_kg.py exists", patch.exists(), "size", patch.stat().st_size if patch.exists() else 0)
# search for DATABASE tree construction in patch
pt = patch.read_text(encoding="utf-8", errors="replace") if patch.exists() else ""
ids_in_patch = sorted(set(re.findall(r'"(db-[a-z0-9-]+)"', pt)))
print("db-* ids in patch", len(ids_in_patch))
for i in ids_in_patch[:80]:
    print(" ", i)
# also titles in patch TREE structure
if "DATABASE_KNOWLEDGE_TREE" in pt or "db-root" in pt:
    print("patch defines tutorial tree: yes")
else:
    print("patch defines tutorial tree: unclear")

print("\n" + "=" * 60)
print("ML tree from ml.json + HTML")
idx = HTML.find("const ML_KNOWLEDGE_TREE = ")
html_ml = json.loads(extract_json_object(HTML, idx + len("const ML_KNOWLEDGE_TREE = ")))
print("ml.json == html?", json.dumps(ML_JSON, ensure_ascii=False) == json.dumps(html_ml, ensure_ascii=False))
print("domains", len(html_ml.get("children") or []), "leaves", leaf_count(html_ml))

rows = outline(html_ml)
print("\n--- ML outline ---")
for r in rows:
    if r["depth"] == 0:
        continue
    indent = "  " * (r["depth"] - 1)
    print(f"{indent}{r['kind']}|{r['title']}|{r['id']}|lv={r['level']}|kids={r['kids']}|clen={r['clen']}")

print("\n--- ML anomalies ---")
for a in anomalies(html_ml):
    print(a)

# domain leaf distribution
print("\n--- ML leaves per L2 ---")
for d in html_ml.get("children") or []:
    def lc(x):
        kids = x.get("children") or []
        if not kids:
            return 1
        return sum(lc(c) for c in kids)
    print(f"  {d['title']}: {lc(d)} leaves, {len(d.get('children') or [])} L3")

# ML hub encyclopedia topics for gap compare
ml_hub_idx = HTML.find('"id": "ml"')
# careful: may match engines; look for category analyze nearby
# find hub with name 机器学习
m = re.search(r'\{\s*"id":\s*"ml"\s*,\s*"name":\s*"([^"]+)"', HTML)
print("\nML hub name match", m.group(1) if m else None)
hub_start = m.start() if m else -1
if hub_start >= 0:
    try:
        # back to {
        hs = HTML.rfind("{", 0, hub_start + 1)
        # Actually m.start is at { already if pattern starts with {
        ml_hub = json.loads(extract_json_object(HTML, hub_start))
        l2 = (ml_hub.get("detail") or {}).get("l2") or {}
        print("ML hub topics:")
        for t in l2.get("topics") or []:
            print(f"  - {t.get('name')}")
            for ch in t.get("children") or []:
                print(f"      · {ch.get('name')}")
        print("ML engines:")
        for e in ml_hub.get("engines") or []:
            print(f"  - {e.get('name')}")
    except Exception as ex:
        print("ml hub parse", ex)

# Collect all ml-* ids in tree
ml_ids = []

def collect(n):
    ml_ids.append(n["id"])
    for c in n.get("children") or []:
        collect(c)
collect(html_ml)
print("\nml tree node count", len(ml_ids))

# Common ML curriculum checklist vs present titles/ids
checklist = {
    "数据与任务": ["监督", "无监督", "回归", "分类", "聚类", "任务"],
    "数据准备": ["清洗", "缺失", "特征", "编码", "标准化", "采样", "泄漏", "切分", "训练集"],
    "线性模型": ["线性回归", "逻辑回归", "正则", "Ridge", "Lasso"],
    "树与集成": ["决策树", "随机森林", "提升", "XGBoost", "LightGBM", "GBDT"],
    "度量评估": ["准确率", "精确", "召回", "F1", "AUC", "ROC", "混淆", "MAE", "RMSE", "交叉验证"],
    "调参验证": ["网格", "随机搜索", "验证集", "过拟合", "欠拟合", "学习曲线"],
    "聚类降维": ["KMeans", "层次", "DBSCAN", "PCA", "t-SNE"],
    "深度学习": ["神经网络", "MLP", "CNN", "RNN", "Transformer", "嵌入"],
    "工程落地": ["推理", "部署", "监控", "漂移", "特征存储", "pipeline", "MLOps"],
    "特殊任务": ["推荐", "NLP", "CV", "时间序列", "异常检测", "排序"],
}
blob = " ".join(ml_ids) + " " + " ".join(r["title"] for r in rows) + " " + json.dumps(html_ml, ensure_ascii=False)
print("\n--- checklist coverage (title/id/content contains) ---")
for cat, kws in checklist.items():
    hit = [k for k in kws if k.lower() in blob.lower() or k in blob]
    miss = [k for k in kws if k not in hit]
    print(f"{cat}: hit={hit} miss={miss}")
