"""
作品集副本 · 日批 ETL 调度契约（与 backend etl_daily_schedule.py 对齐）

字段：计划开始 / 预计耗时(min) / 最晚完成基线 / 依赖 / 上游延迟动作。
前端甘特图读 etl-lineage-data.js；本文件供面试讲「ODS 延迟 → HOLD → 告警」。
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Literal

BATCH_WINDOW_START = "02:00"
BATCH_WINDOW_END = "09:00"


@dataclass(frozen=True)
class EtlJob:
    id: str
    name: str
    layer: str
    planned_start: str
    duration_min: int
    sla_end: str
    depends_on: list[str] = field(default_factory=list)
    on_upstream_delay: Literal["wait", "skip", "partial"] = "wait"
    description: str = ""


JOBS_DAILY = [
    EtlJob("csv_ods", "源系统/CSV → ODS", "ODS", "02:00", 45, "03:30", [], "wait",
           "贴源落库；完成标志 ods_arrival_flag；超时 WARN，破对外 SLA 则下游 HOLD。"),
    EtlJob("ods_dwd", "ODS → DWD 宽表/事实", "DWD", "03:30", 40, "05:00", ["csv_ods"], "wait",
           "清洗去重+维映射+质量日志；依赖 csv_ods=SUCCESS，禁止空跑。"),
    EtlJob("dwd_dws", "DWD → DWS 主题汇总", "DWS", "05:00", 50, "06:30", ["ods_dwd"], "wait",
           "按声明粒度汇总；跨层禁止直读 ODS。"),
    EtlJob("dqc_gate", "数据质量门禁 DQC", "DQC", "06:30", 15, "07:00", ["dwd_dws"], "skip",
           "BLOCK 失败禁止 ADS/看板就绪；WARN 仅告警。"),
    EtlJob("ads_views", "ADS 视图 / 看板就绪", "ADS", "07:00", 10, "07:30", ["dqc_gate"], "skip",
           "仅读 DWS/DIM；对外 SLA 09:00 前看板可用。"),
]


def parse_hhmm(s: str) -> int:
    h, m = s.split(":")
    return int(h) * 60 + int(m)


def gantt_payload() -> dict:
    ws, we = parse_hhmm(BATCH_WINDOW_START), parse_hhmm(BATCH_WINDOW_END)
    jobs = []
    for j in JOBS_DAILY:
        start = parse_hhmm(j.planned_start)
        end = start + j.duration_min
        sla = parse_hhmm(j.sla_end)
        jobs.append({
            "id": j.id,
            "name": j.name,
            "layer": j.layer,
            "planned_start": j.planned_start,
            "duration_min": j.duration_min,
            "sla_end": j.sla_end,
            "depends_on": list(j.depends_on),
            "planned_end": f"{end // 60:02d}:{end % 60:02d}",
            "left_pct": round((start - ws) / (we - ws) * 100, 2),
            "width_pct": round(j.duration_min / (we - ws) * 100, 2),
            "sla_pct": round((sla - ws) / (we - ws) * 100, 2),
            "on_upstream_delay": j.on_upstream_delay,
            "description": j.description,
        })
    return {
        "window_start": BATCH_WINDOW_START,
        "window_end": BATCH_WINDOW_END,
        "jobs": jobs,
        "delay_policy": (
            "ODS 延迟：传感器等待 → 过 sla_end 则 HOLD 下游 → 过 09:00 则 P1 告警并标记看板未就绪；"
            "补跑按 biz_date 分区 ODS→DWD→DWS→DQC，禁止跳层写 ADS。"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(gantt_payload(), ensure_ascii=False, indent=2))
