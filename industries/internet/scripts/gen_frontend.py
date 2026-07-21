#!/usr/bin/env python3
"""生成互联网作品集前端文件（看板 HTML、Tableau SQL、方法论骨架）。"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DASH = ROOT / "dashboard"
SQL = ROOT / "sql"
JS = ROOT / "js"

DASHBOARDS = [
    ("01-dau", "dau", "DAU总览", "db-kpi", ["db-chart-dau-trend", "db-chart-structure", "db-chart-channel"]),
    ("02-portrait", "portrait", "用户画像", "db-kpi", ["db-chart-portrait", "db-chart-segment"]),
    ("03-retention", "retention", "用户留存", "db-kpi", ["db-chart-retention-matrix", "db-chart-retention-trend"]),
    ("04-lifecycle", "lifecycle", "用户生命周期", "db-kpi", ["db-chart-lifecycle"]),
    ("05-channel", "channel", "渠道分析", "db-kpi", ["db-chart-channel-bar", "db-chart-channel-trend"]),
    ("06-funnel", "funnel", "转化漏斗", "db-kpi", ["db-chart-funnel", "db-chart-funnel-trend"]),
    ("07-ltv", "ltv", "LTV分析", "db-kpi", ["db-chart-ltv-bar", "db-chart-ltv-trend"]),
    ("08-rfm", "rfm", "RFM分层", "db-kpi", ["db-chart-rfm", "db-table-rfm"]),
    ("09-churn", "churn", "流失预警", "db-kpi", ["db-chart-churn", "db-table-churn"]),
    ("10-product", "product", "产品功能分析", "db-kpi", ["db-chart-feature", "db-chart-depth"]),
]

API_MAP = {
    "dau": "dashboard_dau", "portrait": "dashboard_portrait", "retention": "dashboard_retention",
    "lifecycle": "dashboard_lifecycle", "channel": "dashboard_channel", "funnel": "dashboard_funnel",
    "ltv": "dashboard_ltv", "rfm": "dashboard_rfm", "churn": "dashboard_churn", "product": "dashboard_product",
}


def write_dashboards():
    DASH.mkdir(parents=True, exist_ok=True)
    for fname, did, title, kpi, charts in DASHBOARDS:
        chart_html = "\n".join(
            f'  <div class="chart-box"><h3>{c.replace("db-chart-", "").replace("db-table-", "表格 · ")}</h3>'
            + (f'<div class="table-scroll"><table class="data-table"><tbody id="{c}"></tbody></table></div>'
               if c.startswith("db-table") else f'<div id="{c}" class="chart"></div>')
            + "</div>"
            for c in charts
        )
        html = f"""<section class="dashboard-page" data-dashboard="{did}">
  <h2 class="dashboard-page-title">{title}</h2>
  <p class="dashboard-page-desc">互联网用户增长分析 · 数据源 internet_analytics · API /api/{API_MAP[did]}</p>
  <div id="{kpi}" class="kpi-grid"></div>
{chart_html}
</section>
"""
        (DASH / f"{fname}.html").write_text(html, encoding="utf-8")


def write_tableau_sql():
    SQL.mkdir(parents=True, exist_ok=True)
    readme = """# Tableau SQL · 互联网通用行业（10 看板 1:1）

| 目录 | Web看板 | API |
|------|---------|-----|
"""
    templates = {
        "01-dau": ("v_dau_overview", "SELECT * FROM internet_analytics.v_dau_overview WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}'"),
        "02-portrait": ("v_user_portrait", "SELECT * FROM internet_analytics.v_user_portrait"),
        "03-retention": ("v_user_retention", "SELECT * FROM internet_analytics.v_user_retention WHERE day_offset IN (1,3,7,14,30)"),
        "04-lifecycle": ("v_user_lifecycle", "SELECT * FROM internet_analytics.v_user_lifecycle"),
        "05-channel": ("v_channel_analysis", "SELECT * FROM internet_analytics.v_channel_analysis WHERE DATE_FORMAT(snapshot_date,'%Y-%m')='{{analysis_month_str}}'"),
        "06-funnel": ("v_funnel", "SELECT * FROM internet_analytics.v_funnel"),
        "07-ltv": ("v_ltv", "SELECT * FROM internet_analytics.v_ltv"),
        "08-rfm": ("v_rfm", "SELECT * FROM internet_analytics.v_rfm"),
        "09-churn": ("v_rfm", "SELECT * FROM internet_analytics.v_rfm WHERE rfm_segment='流失风险'"),
        "10-product": ("dwd_event_wide", "SELECT event_name,event_category,COUNT(*) cnt FROM internet_analytics.dwd_event_wide GROUP BY event_name,event_category"),
    }
    for folder, (view, sql) in templates.items():
        d = SQL / folder
        d.mkdir(exist_ok=True)
        (d / "01_main.sql").write_text(
            f"-- Web看板: {folder}\n-- 视图: {view}\n-- 参数: {{analysis_month_str}}\n\n{sql};\n",
            encoding="utf-8",
        )
        readme += f"| `{folder}/` | {folder.split('-',1)[1]} | `{view}` |\n"
    (SQL / "README.md").write_text(readme + "\n参数 `{{analysis_month_str}}` 示例：'2026-07'\n", encoding="utf-8")


def main():
    write_dashboards()
    write_tableau_sql()
    print("前端看板 HTML + Tableau SQL 已生成。")


if __name__ == "__main__":
    main()
