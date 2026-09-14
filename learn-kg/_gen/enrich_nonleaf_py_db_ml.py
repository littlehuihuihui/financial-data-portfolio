# -*- coding: utf-8 -*-
"""
Enrich domain / chapter (non-leaf) lessons for Python, Database, ML trees.

Leaf 讲义已在 enrich_py_db_ml_depth.py 加厚；本脚本补齐「子节点」：
领域导读、章节导读、以及中间层 overview。
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LESSONS = ROOT / "lessons"

HUB_BLURB = {
    "python": {
        "role": "数据分析与特征原型的主力语言层",
        "peer": "与 SQL 同学同口径；大计算可下推 DuckDB/仓",
        "exit": "能独立用 pandas 完成清洗聚合关联，并有一条可复现基线",
    },
    "database": {
        "role": "业务库正确性、性能与选型的地基",
        "peer": "OLTP 主库与 OLAP/仓分工；索引与事务是高频考点",
        "exit": "能解释执行计划、事务边界，并做最小索引/备份决策",
    },
    "ml": {
        "role": "从标签到上线的建模闭环",
        "peer": "特征多来自 SQL/Python；评估必须防穿越与泄漏",
        "exit": "能搭监督基线、时间切分评估，并说清上线监控要点",
    },
}

# Per-node teaching extras (domain / chapter) — makes 导读 specific, not template-only.
NODE_EXTRA: dict[str, dict[str, str]] = {
    "py-learning-path": {
        "why": "先统一样例与路线，避免「今天用表 A、明天用表 B」导致口径对不上。",
        "story": "宪法造数 → 初/中/高清单选阶段 → 练习场验收。",
        "trap": "跳过宪法直接抄叶课代码，样例没构造就报错。",
    },
    "py-pandas": {
        "why": "数分日常 80% 时间在表操作：筛、洗、聚、并、变形。",
        "story": "认表 → 筛选赋值 → 缺失类型 → groupby → merge → 透视窗口 → 读写。",
        "trap": "先 merge 明细再 sum，造成 GMV 爆炸。",
    },
    "py-viz": {
        "why": "图是给业务看的接口；选错几何会误导决策。",
        "story": "折线看趋势 → 柱状看对比 → 分布看形态（Seaborn）。",
        "trap": "双轴乱加、截断纵轴制造「假趋势」。",
    },
    "py-stack": {
        "why": "pandas 之上还有向量化、内嵌 SQL、更快 DataFrame、建模与交付。",
        "story": "NumPy → DuckDB/Polars → sklearn 基线 → Streamlit → 性能/可复现。",
        "trap": "小数据过度工程；大数据仍死撑纯 pandas。",
    },
    "db-learning-path": {
        "why": "数据库课必须同源样例，才能和 SQL/Python 树对照。",
        "story": "宪法 → 路线清单 → 练习场；概念课穿插其中。",
        "trap": "只背名词不写事务/EXPLAIN。",
    },
    "db-concepts": {
        "why": "负载模型、ACID、引擎、约束是后面索引与事务的共同语言。",
        "story": "OLTP/OLAP → ACID → 引擎 → 主键约束 → 类型 → 外键 → WAL/MVCC/缓冲池。",
        "trap": "把分析查询直接打主库还怪「数据库不行」。",
    },
    "db-access": {
        "why": "慢查询十有八九是访问路径问题。",
        "story": "BTree → EXPLAIN → 覆盖索引 → 失效案例 → 统计信息。",
        "trap": "每列建索引；或索引列包函数导致失效。",
    },
    "db-txn": {
        "why": "并发下「看起来对」不等于「隔离下对」。",
        "story": "事务边界 → 隔离级别 → 异常读 → 行锁死锁。",
        "trap": "长事务 + 报表查询混跑。",
    },
    "db-ops": {
        "why": "正确性之外还要活着：复制、备份、连接、分区。",
        "story": "复制读写分离 → 备份恢复 → 连接池 → 分区表。",
        "trap": "只备份不演练恢复。",
    },
    "db-polyglot": {
        "why": "不同引擎解决不同矛盾：缓存、文档、列存、检索、向量。",
        "story": "MySQL/PG 对照 → Redis → Mongo → CH → ES → 向量。",
        "trap": "用一种引擎硬扛所有场景。",
    },
    "ml-foundation": {
        "why": "范式与训练纪律错了，后面特征/模型都是空中楼阁。",
        "story": "监督/无监督/半监督/RL → Pipeline、偏差方差、过拟合、切分。",
        "trap": "无标签硬上监督；或随机切时序业务。",
    },
    "ml-feature": {
        "why": "表格模型上限往往在特征，不在换算法。",
        "story": "总览 → 缺失/编码/缩放 → 泄漏与漂移、选择。",
        "trap": "未来信息进特征；全表 fit 预处理。",
    },
    "ml-tasks": {
        "why": "先选对任务类型，再谈模型家族。",
        "story": "分类（阈值/不均衡）→ 回归 → 聚类 → 排序。",
        "trap": "用准确率评价极度不均衡分类。",
    },
    "ml-models": {
        "why": "经典模型是可解释的强基线，也是调参直觉来源。",
        "story": "线性族 → 树与提升 → 近邻/SVM。",
        "trap": "跳过逻辑回归直接上复杂模型。",
    },
    "ml-deep": {
        "why": "深度学习适合表示学习；表格小数据未必更好。",
        "story": "MLP → Embedding → 正则与早停。",
        "trap": "样本少却上很深网络。",
    },
    "ml-recsys": {
        "why": "推荐是召回+排序+业务约束的系统，不是单模型。",
        "story": "总览/协同/内容 → 召回精排、冷启动、多样性。",
        "trap": "只优化 CTR 忽略生态与多样性。",
    },
    "ml-nlp": {
        "why": "文本要先表示再分类；业务语料清洗往往占半程。",
        "story": "词袋 TF-IDF → 文本分类 → 情感分析。",
        "trap": "中英文混用未规范化；标签噪声不处理。",
    },
    "ml-timeseries": {
        "why": "时序核心是切分与特征窗口，不是堆模型。",
        "story": "时间切分 → 滞后窗口特征 → 业务预测闭环。",
        "trap": "随机 K 折造成穿越。",
    },
    "ml-anomaly-domain": {
        "why": "异常检测要定义「相对什么正常」，并设计告警代价。",
        "story": "总览 → 隔离森林 → 告警阈值。",
        "trap": "阈值乱调导致告警疲劳。",
    },
    "ml-eval-ops": {
        "why": "离线分好看不等于上线有用；要闭环到监控。",
        "story": "时间切分/校准/AB → 训练推理一致性、监控、特征仓。",
        "trap": "反复偷看测试集；无漂移监控。",
    },
}


def lesson(s: str) -> str:
    return s.strip() + "\n"


def one_liner_from_content(content: str, fallback: str = "见子课") -> str:
    text = content or ""
    # Prefer explicit definition / positioning lines
    for token in ("一句话定义", "为什么先学这块", "为什么学本章", "定位"):
        for ln in text.splitlines():
            s = ln.strip()
            if s.startswith("|"):
                continue
            if token in s and ("：" in s or ":" in s):
                one = s.split("：", 1)[-1].split(":", 1)[-1].strip(" -*")
                one = one.strip("| ").strip()
                if one and "学习目标" not in one and len(one) > 4:
                    return one[:40] + ("…" if len(one) > 40 else "")
    # First non-table bullet under 是什么 / 课前
    for ln in text.splitlines():
        s = ln.strip()
        if not s or s.startswith("|") or s.startswith("#") or s.startswith("```"):
            continue
        if s.startswith("- "):
            one = s[2:].strip()
            one = one.split("：", 1)[-1].split(":", 1)[-1].strip(" -*")
            if len(one) > 8 and "学习目标" not in one:
                return one[:40] + ("…" if len(one) > 40 else "")
    return fallback[:40]


def child_map(node: dict) -> list[tuple[str, str, str]]:
    """Return list of (id, title, one_line) for direct children."""
    rows = []
    for c in node.get("children") or []:
        title = c.get("title") or c.get("id")
        cid = c.get("id") or ""
        # If child is a chapter, prefer first leaf definition
        src = c.get("content") or ""
        if c.get("lessonParent") or (c.get("children") and "一句话定义" not in src):
            for leaf in c.get("children") or []:
                if not leaf.get("children"):
                    src = leaf.get("content") or src
                    break
        one = one_liner_from_content(src, fallback=f"围绕「{title}」的一组叶课")
        rows.append((cid, title, one))
    return rows


def leaf_ids_under(node: dict) -> list[str]:
    out = []

    def walk(n):
        kids = n.get("children") or []
        if not kids:
            out.append(n.get("id") or "")
            return
        for c in kids:
            walk(c)

    walk(node)
    return [x for x in out if x]


def domain_content(hub: str, node: dict) -> str:
    title = node.get("title") or node["id"]
    nid = node.get("id") or ""
    meta = HUB_BLURB[hub]
    extra = NODE_EXTRA.get(nid, {})
    why = extra.get("why") or f"「{title}」是本学科主线中的关键板块，后面叶课都挂在这里。"
    story = extra.get("story") or "按子章节顺序推进，先导读再叶课。"
    trap = extra.get("trap") or "只浏览领域简介，不进入绿色叶节点动手。"
    kids = child_map(node)
    leaves = leaf_ids_under(node)
    lines = "\n".join(f"| {t} | {one} |" for _, t, one in kids)
    order = " → ".join(t for _, t, _ in kids) if kids else "（暂无子章）"
    return lesson(
        f"""### 课前 · 领域导读

- **领域**：{title}
- **在整棵树中的角色**：{meta['role']}
- **为什么先学这块**：{why}
- **与周边关系**：{meta['peer']}
- **学完本领域的阶段目标**：能讲清故事线，并完成下方子章各至少 1 片叶课动手题。

### 故事线（先建立全局图）

```text
{story}
```

### 本领域覆盖什么

围绕「{title}」组织若干章节。你不必一次学完所有叶课，但应先读各**章节导读**，再按推荐顺序点绿色叶节点。

### 子章节地图

| 章节 | 一句话 |
|---|---|
{lines}

### 推荐学习顺序

```text
{order}
```

### 学完怎么验收

1. 能用自己的话讲清本领域解决什么问题、不解决什么  
2. 每个子章节至少完成 1 片叶讲义的「动手」题  
3. 能指出本领域最容易翻车的点：**{trap}**

### 常见误区

| 误区 | 纠正 |
|---|---|
| 只点开领域不进叶课 | 真正技能在绿色叶节点 |
| 跳过章节导读乱点 | 先读顺序与先修 |
| 学完不对照业务表 | 换成你们表名做小样本验证 |
| {trap} | 对照叶课「易错对照」表逐条打勾 |

### 与整树出口的关系

整树阶段出口是：{meta['exit']}。本领域是通向该出口的一块拼图，学完应能向同事用业务语言解释「{title}」。

### 练习建议（领域级）

- **时间盒**：每个子章节先留 25–40 分钟，只求跑通主路径，不追求一次记完所有边角  
- **输出物**：每章结束写 3 条笔记——定义、反例、迁移到你们表的改动点  
- **对照**：若本树有练习场，学完领域后回去做对应难度题做验收

### 下一动

打开第一个子章节的导读，按叶列表开课。本领域约 **{len(leaves)}** 片叶讲义。
"""
    )


def chapter_content(hub: str, node: dict) -> str:
    title = node.get("title") or node["id"]
    nid = node.get("id") or ""
    extra = NODE_EXTRA.get(nid, {})
    # prefer leaf children for map
    leaf_rows = []
    for c in node.get("children") or []:
        if c.get("children"):
            pass
        else:
            leaf_rows.append(c)

    if leaf_rows:
        map_lines = []
        for i, c in enumerate(leaf_rows, 1):
            t = c.get("title") or c["id"]
            lvl = c.get("level") or ""
            defn = one_liner_from_content(c.get("content") or "", fallback="打开叶课查看完整讲义")
            map_lines.append(f"| {i} | {t} | {lvl} | {defn} |")
        table = "\n".join(map_lines)
        order = " → ".join((c.get("title") or c["id"]) for c in leaf_rows)
        n_leaf = len(leaf_rows)
        first = leaf_rows[0].get("title") or leaf_rows[0]["id"]
        last = leaf_rows[-1].get("title") or leaf_rows[-1]["id"]
    else:
        table = "\n".join(
            f"| {i} | {c.get('title')} | — | 进入子章 |"
            for i, c in enumerate(node.get("children") or [], 1)
        )
        order = " → ".join((c.get("title") or "") for c in node.get("children") or [])
        n_leaf = len(leaf_ids_under(node))
        first, last = "第一子节点", "最后子节点"

    hub_hint = {
        "python": "先确保已构造教程宪法四表 DataFrame。",
        "database": "先熟悉宪法样例四表，SQL 可在 MySQL/PG/DuckDB 练习。",
        "ml": "评估默认按时间切分；禁止用未来信息。",
    }[hub]

    prereq = {
        "python": "Python 教程宪法；相邻前一章叶课。",
        "database": "数据库教程宪法；核心概念中的前置章。",
        "ml": "监督学习直觉；特征/评估相关先修章。",
    }[hub]

    why = extra.get("why") or f"本章把「{title}」拆成可练习的叶课，避免只记名词。"
    story = extra.get("story") or order
    trap = extra.get("trap") or "跳过动手题，以为看过代码就会了。"

    return lesson(
        f"""### 课前 · 章节导读

- **章节**：{title}
- **为什么学本章**：{why}
- **学习目标**：学完本章叶课，能独立完成主路径代码/SQL，并讲清适用边界。
- **先修**：{prereq}
- **纪律**：{hub_hint}

### 本章故事线

```text
{story}
```

从 **{first}** 入门，到 **{last}** 收束；中间叶课不要跳着只看感兴趣的标题。

### 本章叶课地图

| # | 叶课 | 难度 | 一句话 |
|---|---|---|---|
{table}

### 推荐顺序

```text
{order}
```

### 怎么学本章

1. **先扫地图**：知道本章有哪些叶、各自解决什么  
2. **按序开叶**：每叶走完「怎么写 → 易错对照 → 动手」  
3. **章末串讲**：用 3 分钟向同伴复述本章故事线  
4. **对照业务**：把样例表名替换成你们的一张真表（小样本）  
5. **刻意练反例**：至少制造一次「{trap}」并纠正

### 章末验收

| 检查项 | 通过标准 |
|---|---|
| 主路径 | 每叶示例可跑通或可手推结果 |
| 易错 | 能举本章至少 2 个反例 |
| 迁移 | 能说出换表后要改的 3 处 |
| 边界 | 能回答「什么情况不用本章方法」 |
| 口述 | 不看笔记讲清「{title}」解决什么问题 |

### 常见卡点

| 卡点 | 处理 |
|---|---|
| 叶课代码报错 | 先回到教程宪法确认样例已构造 |
| 不知道学哪片 | 严格按上方推荐顺序 |
| 觉得已会想跳 | 至少做「动手」题再跳 |
| {trap} | 打开对应叶课「易错对照」逐条核对 |

### 下一动

点开地图中的第 1 片绿色叶节点。本章合计约 **{n_leaf}** 片叶讲义。
"""
    )


def mid_content(hub: str, node: dict) -> str:
    """Non-domain, non-chapter intermediate (e.g. nested group)."""
    title = node.get("title") or node["id"]
    kids = child_map(node)
    lines = "\n".join(f"- **{t}**：{one}" for _, t, one in kids)
    return lesson(
        f"""### 课前 · 分组导读

- **分组**：{title}
- **目标**：弄清本组子节点分工，再下钻。

### 子节点

{lines or '- （暂无）'}

### 建议

自上而下打开；遇到 `lessonParent` 章节先读导读再进叶课。
"""
    )


def root_content(hub: str, node: dict) -> str:
    title = node.get("title") or hub
    meta = HUB_BLURB[hub]
    domains = child_map(node)
    lines = "\n".join(f"| {t} | {one} |" for _, t, one in domains)
    order = " → ".join(t for _, t, _ in domains)
    n_leaf = len(leaf_ids_under(node))
    return lesson(
        f"""### 课前 · 学科总览

- **学科**：{title}
- **定位**：{meta['role']}
- **协作**：{meta['peer']}
- **阶段出口**：{meta['exit']}

### 怎么用这棵知识图谱

1. 先打开 **学习路径 → 教程宪法**（统一样例）  
2. 按初/中/高清单选阶段，再进对应领域  
3. **倒数第二层**是章节导读；**绿色叶节点**才是完整讲义  
4. 每叶按金牌结构学习：课前 → 怎么写 → 易错 → 动手

### 一级领域地图

| 领域 | 一句话 |
|---|---|
{lines}

### 推荐主线

```text
{order}
```

### 体量

本树约 **{n_leaf}** 片叶讲义；领域与章节导读负责导航，叶课负责技能。

### 下一动

进入「学习路径」领域，打开教程宪法，构造/确认统一样例后开始第一片叶课。
"""
    )


def enrich_node(hub: str, node: dict, depth: int) -> bool:
    """Return True if content replaced. Always rebuild non-leaves."""
    kids = node.get("children") or []
    if not kids:
        return False  # leaf — skip
    before = node.get("content") or ""
    if depth == 0:
        new_c = root_content(hub, node)
    elif node.get("lessonParent"):
        new_c = chapter_content(hub, node)
    elif depth == 1:
        new_c = domain_content(hub, node)
    else:
        new_c = mid_content(hub, node)
    if new_c != before:
        node["content"] = new_c
        return True
    return False


def walk_enrich(hub: str, node: dict, depth: int = 0) -> tuple[int, int]:
    changed = 0
    gain = 0
    before = len(node.get("content") or "")
    if enrich_node(hub, node, depth):
        changed += 1
        gain += len(node.get("content") or "") - before
    for c in node.get("children") or []:
        a, b = walk_enrich(hub, c, depth + 1)
        changed += a
        gain += b
    return changed, gain


def stats_nonleaf(tree: dict) -> str:
    rows = []

    def walk(n, d=0):
        kids = n.get("children") or []
        if kids:
            kind = "root" if d == 0 else ("chapter" if n.get("lessonParent") else ("domain" if d == 1 else "mid"))
            rows.append((kind, len(n.get("content") or "")))
        for c in kids:
            walk(c, d + 1)

    walk(tree)
    from collections import defaultdict

    g = defaultdict(list)
    for k, ln in rows:
        g[k].append(ln)
    parts = []
    for k in ("root", "domain", "chapter", "mid"):
        xs = sorted(g.get(k) or [])
        if not xs:
            continue
        parts.append(f"{k}:n={len(xs)} med={xs[len(xs)//2]}")
    return " ".join(parts)


def main():
    for hub in ("python", "database", "ml"):
        path = LESSONS / f"{hub}.json"
        tree = json.loads(path.read_text(encoding="utf-8"))
        print(f"BEFORE {hub}: {stats_nonleaf(tree)}")
        n, gain = walk_enrich(hub, tree)
        path.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"AFTER  {hub}: {stats_nonleaf(tree)} changed={n} gain={gain}")


if __name__ == "__main__":
    main()
