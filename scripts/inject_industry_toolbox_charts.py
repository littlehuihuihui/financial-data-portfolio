# -*- coding: utf-8 -*-
"""Inject chartType + demo data into internet/manufacturing ANALYSIS_TOOLBOX."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Per-method chart payloads. Keys = method id.
INTERNET_CHARTS = {
    "persona": {
        "chartType": "pareto",
        "data": {
            "labels": ["STB·广州", "STB·深圳", "Speaker·广州", "STB·其他", "Speaker·其他"],
            "values": [1280, 960, 720, 860, 1180],
            "cumulative": [26, 45, 59, 76, 100],
        },
    },
    "lifecycle": {
        "chartType": "funnel",
        "data": {
            "steps": [
                {"name": "新注册", "value": 520, "rate": 100},
                {"name": "激活", "value": 390, "rate": 75},
                {"name": "活跃留存", "value": 280, "rate": 54},
                {"name": "深度活跃", "value": 160, "rate": 31},
            ],
        },
    },
    "segment": {
        "chartType": "abc-table",
        "data": {
            "rows": [
                {"item": "双端高活", "share": 10, "cls": "A", "policy": "会员权益 · 专属内容"},
                {"item": "STB 活跃", "share": 52, "cls": "A", "policy": "点播加推 · 日触达"},
                {"item": "Speaker 活跃", "share": 20, "cls": "B", "policy": "场景化推荐"},
                {"item": "沉默可挽回", "share": 12, "cls": "B", "policy": "内容券 · 分批 push"},
                {"item": "流失长尾", "share": 6, "cls": "C", "policy": "月审视 · 低成本触达"},
            ],
        },
    },
    "retention": {
        "chartType": "cohort-heatmap",
        "data": {
            "months": ["D1", "D7", "D14", "D30"],
            "cohorts": ["07-01 批", "07-08 批", "07-15 批", "07-22 批"],
            "values": [
                [42, 26, 18, 14],
                [40, 24, 17, 13],
                [38, 22, 16, 12],
                [36, 20, 15, 11],
            ],
        },
    },
    "rfm": {
        "chartType": "abc-table",
        "data": {
            "rows": [
                {"item": "高价值活跃", "share": 8, "cls": "A", "policy": "专属运营 · 续订关怀"},
                {"item": "潜力成长", "share": 18, "cls": "B", "policy": "内容加推 · 套餐引导"},
                {"item": "一般活跃", "share": 36, "cls": "B", "policy": "常规触达"},
                {"item": "流失风险", "share": 22, "cls": "C", "policy": "优先挽回"},
                {"item": "低活长尾", "share": 16, "cls": "C", "policy": "低成本维系"},
            ],
        },
    },
    "funnel": {
        "chartType": "funnel",
        "data": {
            "steps": [
                {"name": "Launcher 曝光", "value": 12800, "rate": 100},
                {"name": "点击", "value": 3200, "rate": 25},
                {"name": "验证", "value": 2560, "rate": 20},
                {"name": "确认订购", "value": 512, "rate": 4},
            ],
        },
    },
    "ltv": {
        "chartType": "roi-bar",
        "data": {
            "barName": "LTV/CAC",
            "lineName": "目标线",
            "yName": "LTV/CAC",
            "items": [
                {"name": "launcher", "roi": 1.8, "bench": 1.5},
                {"name": "video", "roi": 1.1, "bench": 1.5},
                {"name": "搜索", "roi": 1.6, "bench": 1.5},
                {"name": "活动页", "roi": 1.3, "bench": 1.5},
            ],
        },
    },
    "northstar": {
        "chartType": "pareto",
        "data": {
            "labels": ["STB 贡献", "Speaker 贡献", "直播渗透", "搜索转化"],
            "values": [3100, 1700, 800, 400],
            "cumulative": [52, 80, 93, 100],
        },
    },
    "attribution": {
        "chartType": "pareto",
        "data": {
            "labels": ["launcher", "video", "搜索", "活动页", "其他"],
            "values": [320, 196, 88, 52, 28],
            "cumulative": [47, 75, 88, 95, 100],
        },
    },
    "ab": {
        "chartType": "roi-bar",
        "data": {
            "barName": "CVR%",
            "lineName": "对照基线",
            "yName": "CVR %",
            "items": [
                {"name": "对照组", "roi": 15.8, "bench": 15.8},
                {"name": "实验组", "roi": 18.2, "bench": 15.8},
            ],
        },
    },
    "experiment-design": {
        "chartType": "drill-table",
        "data": {
            "rows": [
                {"level": "假设", "dim": "减少 video 误触", "metric": "验证率 +5pct"},
                {"level": "核心指标", "dim": "click→verify", "metric": "成功线 +3pct"},
                {"level": "样本量", "dim": "每组 ≥2,000", "metric": "周期 14 天"},
                {"level": "护栏", "dim": "投诉率/误触率", "metric": "不劣于对照"},
                {"level": "决策", "dim": "p<0.05 且达标", "metric": "全量 / 迭代"},
            ],
        },
    },
    "churn": {
        "chartType": "scatter",
        "data": {
            "r": 0.71,
            "xName": "沉默天数",
            "yName": "流失风险分",
            "points": [
                {"ad": 12, "revenue": 18, "channel": "低风险"},
                {"ad": 28, "revenue": 42, "channel": "中风险"},
                {"ad": 45, "revenue": 72, "channel": "高风险A"},
                {"ad": 52, "revenue": 88, "channel": "高风险B"},
                {"ad": 35, "revenue": 55, "channel": "可观察"},
            ],
        },
    },
    "marginal-roi": {
        "chartType": "marginal",
        "data": {
            "scenarios": [
                {"action": "流量 0–40%", "deltaProfit": 2.4},
                {"action": "流量 40–60%", "deltaProfit": 2.1},
                {"action": "流量 60–80%", "deltaProfit": 1.4},
                {"action": "流量 >80%", "deltaProfit": -0.3},
            ],
        },
    },
    "channel-scorecard": {
        "chartType": "drill-table",
        "data": {
            "rows": [
                {"level": "launcher", "dim": "综合 82 分", "metric": "LTV/CAC 1.8 · D7 25%"},
                {"level": "搜索", "dim": "综合 74 分", "metric": "LTV/CAC 1.6 · D7 22%"},
                {"level": "活动页", "dim": "综合 65 分", "metric": "LTV/CAC 1.3 · D7 18%"},
                {"level": "video", "dim": "综合 58 分", "metric": "LTV/CAC 1.1 · 误触高"},
            ],
        },
    },
    "path": {
        "chartType": "funnel",
        "data": {
            "steps": [
                {"name": "开机", "value": 10000, "rate": 100},
                {"name": "点播", "value": 6800, "rate": 68},
                {"name": "剧集详情", "value": 4500, "rate": 45},
                {"name": "收银台曝光", "value": 1200, "rate": 12},
                {"name": "确认订购", "value": 240, "rate": 2.4},
            ],
        },
    },
}

MFG_CHARTS = {
    "pareto": {
        "chartType": "pareto",
        "data": {
            "labels": ["尺寸偏差", "表面划伤", "材料缺陷", "装配不良", "其他"],
            "values": [186, 142, 98, 54, 48],
            "cumulative": [35, 62, 81, 91, 100],
        },
    },
    "fishbone": {
        "chartType": "rca-tree",
        "data": {
            "nodes": [
                "结果：华东厂良品率降至 88%",
                "人：新班次点检执行率 62%",
                "机：F02-L02 校准超期 3 天",
                "料：原料批次 B2408 尺寸离散大",
                "法：换刀周期未写入 SOP",
                "环：温湿度记录缺失 2 班",
                "主因验证：设备校准不及时（数据+现场一致）",
            ],
        },
    },
    "spc": {
        "chartType": "ma",
        "data": {
            "months": ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
            "actual": [97.2, 96.8, 97.0, 95.1, 94.2, 93.5, 95.8, 96.6],
            "ma3": [None, None, 97.0, 96.3, 95.4, 94.3, 94.5, 95.3],
        },
    },
    "fivewhy": {
        "chartType": "rca-tree",
        "data": {
            "nodes": [
                "为什么良品率低？→ 尺寸偏差占比高",
                "为什么尺寸偏差？→ 刀具磨损超标",
                "为什么磨损超标？→ 未按寿命更换",
                "为什么没更换？→ 无点检提醒",
                "为什么无提醒？→ 缺少点检制度与系统工单",
                "对策：建立换刀点检 + MES 到期工单",
            ],
        },
    },
    "oee": {
        "chartType": "dupont",
        "data": {
            "roe": 85,
            "margin": 92,
            "turnover": 95,
            "leverage": 97,
            "labels": {
                "total": "OEE",
                "a": "时间开动率",
                "b": "性能开动率",
                "c": "良品率",
            },
            "drag": "时间开动率（停机损失）相对偏低，优先排维护窗口",
        },
    },
    "bottleneck": {
        "chartType": "roi-bar",
        "data": {
            "barName": "产能(件/时)",
            "lineName": "目标产能",
            "yName": "件/小时",
            "items": [
                {"name": "冲压", "roi": 92, "bench": 80},
                {"name": "焊接", "roi": 88, "bench": 80},
                {"name": "组装", "roi": 60, "bench": 80},
                {"name": "检测", "roi": 85, "bench": 80},
                {"name": "包装", "roi": 90, "bench": 80},
            ],
        },
    },
    "unitcost": {
        "chartType": "waterfall",
        "data": {
            "steps": [
                {"name": "基期单位成本", "value": 120},
                {"name": "材料涨价", "value": 11},
                {"name": "人工", "value": 3},
                {"name": "制造费用", "value": 2},
                {"name": "产量摊薄", "value": -1},
                {"name": "本期单位成本", "value": 135},
            ],
        },
    },
    "supplier_score": {
        "chartType": "abc-table",
        "data": {
            "rows": [
                {"item": "供应商A", "share": 92, "cls": "A", "policy": "续约优先 · 份额上调"},
                {"item": "供应商B", "share": 81, "cls": "A", "policy": "维持 · 质量月审"},
                {"item": "供应商C", "share": 68, "cls": "B", "policy": "整改观察 1 季"},
                {"item": "供应商D", "share": 54, "cls": "C", "policy": "缩份额 · 备选替换"},
            ],
        },
    },
}


def inject_charts(js_path: Path, charts: dict, intro: str | None = None) -> int:
    text = js_path.read_text(encoding="utf-8")
    if intro:
        text2, n = re.subn(
            r"(intro:\s*)([`\"'])(.*?)(\2)",
            lambda m: m.group(1) + m.group(2) + intro + m.group(4),
            text,
            count=1,
            flags=re.S,
        )
        if n:
            text = text2

    updated = 0
    for mid, payload in charts.items():
        # Match method objects only (have title), avoid category id collisions.
        m = re.search(
            rf'\{{{\s*id:\s*"{re.escape(mid)}",\s*title:',
            text,
        )
        if not m:
            raise SystemExit(f"method not found: {mid} in {js_path.name}")
        start = m.start()
        depth = 0
        end = None
        for i in range(start, len(text)):
            ch = text[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
        if end is None:
            raise SystemExit(f"unclosed method object: {mid}")

        obj = text[start:end]
        obj = re.sub(r",\s*chartType:\s*\"[^\"]*\"", "", obj)
        # remove existing data block (one level nested objects allowed)
        obj = re.sub(
            r",\s*data:\s*\{(?:[^{}]|\{[^{}]*\})*\}",
            "",
            obj,
            count=1,
            flags=re.S,
        )
        data_js = json.dumps(payload["data"], ensure_ascii=False)
        new_obj = (
            obj.rstrip().rstrip(",")
            + f',\n        chartType: "{payload["chartType"]}",\n'
            + f"        data: {data_js}"
        )
        text = text[:start] + new_obj + text[end:]
        updated += 1

    js_path.write_text(text, encoding="utf-8")
    return updated


def main():
    inet = ROOT / "industries" / "internet" / "js" / "methodology-playbook-data.js"
    mfg = ROOT / "industries" / "manufacturing" / "js" / "methodology-playbook-data.js"

    inet_intro = (
        "用户画像、生命周期、留存、RFM、漏斗、LTV、归因、流失预警、A/B 测试、边际 ROI、"
        "分群、行为路径、增长实验、渠道评分卡、北极星拆解——15 种可复用分析方法。"
        "每种方法按教材体（定义/原理/适用/目的/步骤/输出与误区/方法对比/边界）展开，"
        "并配演示图表（帕累托/漏斗/热力/瀑布等），帮助 OTT 增长团队选用手法。"
    )
    mfg_intro = (
        "柏拉图、鱼骨图、OEE、SPC、5Why、单位成本趋势、产能瓶颈、供应商评分卡——"
        "8 种制造业常用分析方法。每种方法按教材体展开，并配演示图表，"
        "便于质量、设备与供应链团队直接套用到看板与复盘。"
    )

    n1 = inject_charts(inet, INTERNET_CHARTS, inet_intro)
    n2 = inject_charts(mfg, MFG_CHARTS, mfg_intro)
    print(f"internet methods updated: {n1}")
    print(f"manufacturing methods updated: {n2}")

    # sanity: count chartType and data
    for p in (inet, mfg):
        t = p.read_text(encoding="utf-8")
        print(p.name, "chartType=", t.count("chartType:"), "data: {/=", t.count("data: {") + t.count("data:{"))


if __name__ == "__main__":
    main()
