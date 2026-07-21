#!/usr/bin/env python3
"""一键生成制造业作品集：DDL、后端、前端、Tableau SQL、PDF、元数据 SQL。"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
INTERNET = REPO / "portfolio" / "industries" / "internet"
MFG_API = REPO / "manufacturing-analytics"

DASHBOARDS = [
    ("01-production", "production", "生产总览", "dashboard_production", ["month"], "📊"),
    ("02-quality", "quality", "质量分析", "dashboard_quality", ["month"], "✅"),
    ("03-supply", "supply", "供应链分析", "dashboard_supply", ["month"], "📦"),
    ("04-equipment", "equipment", "设备OEE", "dashboard_equipment", ["month"], "⚙️"),
    ("05-cost", "cost", "成本分析", "dashboard_cost", ["month"], "💰"),
    ("06-capacity", "capacity", "产能利用率", "dashboard_capacity", ["month"], "📈"),
    ("07-defect", "defect", "不良分析", "dashboard_defect", ["month"], "🔍"),
    ("08-material", "material", "物料周转", "dashboard_material", ["month"], "🔄"),
    ("09-labor", "labor", "人工效率", "dashboard_labor", ["month"], "👷"),
    ("10-mfg-finance", "mfg_finance", "生产成本财务", "dashboard_mfg_finance", ["month"], "📑"),
]

CHARTS = {
    "production": ["db-chart-output-trend", "db-chart-line-share"],
    "quality": ["db-chart-quality-trend", "db-chart-defect-pareto"],
    "supply": ["db-chart-supplier-otd", "db-chart-inventory"],
    "equipment": ["db-chart-oee-bar", "db-chart-downtime"],
    "cost": ["db-chart-cost-trend", "db-chart-cost-structure"],
    "capacity": ["db-chart-capacity-bar", "db-chart-capacity-trend"],
    "defect": ["db-chart-defect-pareto", "db-chart-defect-trend"],
    "material": ["db-chart-turnover", "db-chart-slow-moving"],
    "labor": ["db-chart-labor-efficiency", "db-chart-labor-cost"],
    "mfg_finance": ["db-chart-finance-structure", "db-chart-unit-cost"],
}

ADS_VIEWS = {
    "01-production": "v_production_overview",
    "02-quality": "v_quality_analysis",
    "03-supply": "v_supply_chain",
    "04-equipment": "v_equipment_oee",
    "05-cost": "v_cost_analysis",
    "06-capacity": "v_capacity_utilization",
    "07-defect": "v_defect_analysis",
    "08-material": "v_material_turnover",
    "09-labor": "v_labor_efficiency",
    "10-mfg-finance": "v_manufacturing_finance",
}


def write_ddl():
    db = ROOT / "database"
    db.mkdir(parents=True, exist_ok=True)
    (db / "01_ods.sql").write_text(r"""-- 制造业 ODS 8 表
CREATE DATABASE IF NOT EXISTS manufacturing_analytics DEFAULT CHARSET utf8mb4;
USE manufacturing_analytics;

CREATE TABLE IF NOT EXISTS ods_production_order (
    order_id VARCHAR(32) PRIMARY KEY COMMENT '工单号',
    order_date DATE NOT NULL COMMENT '开工日期',
    due_date DATE NOT NULL COMMENT '交付日期',
    factory_code VARCHAR(10) NOT NULL COMMENT '工厂编码',
    line_code VARCHAR(20) NOT NULL COMMENT '产线编码',
    product_code VARCHAR(20) NOT NULL COMMENT '产品编码',
    plan_qty INT NOT NULL COMMENT '计划产量',
    actual_qty INT NOT NULL COMMENT '实际产量',
    plan_hours DECIMAL(10,2) NOT NULL COMMENT '计划工时',
    actual_hours DECIMAL(10,2) NOT NULL COMMENT '实际工时',
    delivered_on_time TINYINT(1) DEFAULT 1 COMMENT '是否准时交付',
    order_status VARCHAR(20) COMMENT '工单状态',
    etl_batch_id VARCHAR(32)
) COMMENT '生产工单';

CREATE TABLE IF NOT EXISTS ods_production_line (
    line_code VARCHAR(20) PRIMARY KEY COMMENT '产线编码',
    line_name VARCHAR(60) NOT NULL COMMENT '产线名称',
    factory_code VARCHAR(10) NOT NULL COMMENT '工厂',
    design_capacity_daily INT NOT NULL COMMENT '日设计产能(件)',
    etl_batch_id VARCHAR(32)
) COMMENT '产线信息';

CREATE TABLE IF NOT EXISTS ods_quality_inspection (
    inspect_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL COMMENT '工单号',
    inspect_date DATE NOT NULL COMMENT '质检日期',
    line_code VARCHAR(20) NOT NULL COMMENT '产线',
    product_code VARCHAR(20) NOT NULL COMMENT '产品',
    total_qty INT NOT NULL COMMENT '检验总量',
    pass_qty INT NOT NULL COMMENT '合格数',
    defect_qty INT NOT NULL COMMENT '不良数',
    scrap_qty INT NOT NULL COMMENT '报废数',
    defect_type VARCHAR(40) COMMENT '不良类型',
    is_rework TINYINT(1) DEFAULT 0 COMMENT '是否返工批次',
    etl_batch_id VARCHAR(32)
) COMMENT '质检记录';

CREATE TABLE IF NOT EXISTS ods_material (
    material_code VARCHAR(20) PRIMARY KEY COMMENT '物料编码',
    material_name VARCHAR(80) NOT NULL COMMENT '物料名称',
    material_type VARCHAR(30) COMMENT '物料类型',
    standard_price DECIMAL(12,4) COMMENT '标准单价',
    unit VARCHAR(10) COMMENT '单位',
    etl_batch_id VARCHAR(32)
) COMMENT '物料主数据';

CREATE TABLE IF NOT EXISTS ods_inventory_material (
    snapshot_date DATE NOT NULL COMMENT '快照日',
    material_code VARCHAR(20) NOT NULL COMMENT '物料',
    on_hand_qty DECIMAL(14,2) NOT NULL COMMENT '库存量',
    safety_stock DECIMAL(14,2) DEFAULT 0 COMMENT '安全库存',
    daily_usage DECIMAL(14,2) DEFAULT 0 COMMENT '日均消耗',
    etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, material_code)
) COMMENT '物料库存';

CREATE TABLE IF NOT EXISTS ods_supplier (
    supplier_code VARCHAR(20) PRIMARY KEY COMMENT '供应商编码',
    supplier_name VARCHAR(80) NOT NULL COMMENT '供应商名称',
    region VARCHAR(30) COMMENT '区域',
    etl_batch_id VARCHAR(32)
) COMMENT '供应商';

CREATE TABLE IF NOT EXISTS ods_equipment (
    equipment_code VARCHAR(20) PRIMARY KEY COMMENT '设备编码',
    equipment_name VARCHAR(80) NOT NULL COMMENT '设备名称',
    line_code VARCHAR(20) NOT NULL COMMENT '所属产线',
    etl_batch_id VARCHAR(32)
) COMMENT '设备台账';

CREATE TABLE IF NOT EXISTS ods_labor (
    labor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL COMMENT '工单',
    work_date DATE NOT NULL COMMENT '工作日期',
    line_code VARCHAR(20) NOT NULL COMMENT '产线',
    plan_hours DECIMAL(10,2) NOT NULL COMMENT '计划工时',
    actual_hours DECIMAL(10,2) NOT NULL COMMENT '实际工时',
    labor_cost DECIMAL(14,2) DEFAULT 0 COMMENT '人工成本',
    etl_batch_id VARCHAR(32)
) COMMENT '人工工时';
""", encoding="utf-8")

    (db / "02_dim.sql").write_text(r"""USE manufacturing_analytics;

CREATE TABLE IF NOT EXISTS dim_product (
    product_code VARCHAR(20) PRIMARY KEY,
    product_name VARCHAR(80) NOT NULL,
    product_category VARCHAR(40),
    standard_unit_cost DECIMAL(12,2) COMMENT '标准单位成本'
) COMMENT '产品维度';

CREATE TABLE IF NOT EXISTS dim_production_line (
    line_code VARCHAR(20) PRIMARY KEY,
    line_name VARCHAR(60) NOT NULL,
    factory_code VARCHAR(10) NOT NULL,
    factory_name VARCHAR(40) NOT NULL,
    design_capacity_daily INT NOT NULL
) COMMENT '产线维度';

CREATE TABLE IF NOT EXISTS dim_supplier (
    supplier_code VARCHAR(20) PRIMARY KEY,
    supplier_name VARCHAR(80) NOT NULL,
    region VARCHAR(30)
) COMMENT '供应商维度';

CREATE TABLE IF NOT EXISTS dim_material (
    material_code VARCHAR(20) PRIMARY KEY,
    material_name VARCHAR(80) NOT NULL,
    material_type VARCHAR(30),
    standard_price DECIMAL(12,4)
) COMMENT '物料维度';

CREATE TABLE IF NOT EXISTS dim_date (
    date_id DATE PRIMARY KEY,
    year_num INT, month_num INT, day_num INT,
    week_of_year INT, is_weekend TINYINT(1),
    month_label VARCHAR(7)
) COMMENT '日期维度';
""", encoding="utf-8")

    (db / "03_dwd.sql").write_text(r"""USE manufacturing_analytics;

CREATE TABLE IF NOT EXISTS dwd_production_wide (
    order_id VARCHAR(32) PRIMARY KEY,
    order_date DATE, due_date DATE,
    factory_code VARCHAR(10), factory_name VARCHAR(40),
    line_code VARCHAR(20), line_name VARCHAR(60),
    product_code VARCHAR(20), product_name VARCHAR(80),
    plan_qty INT, actual_qty INT,
    plan_hours DECIMAL(10,2), actual_hours DECIMAL(10,2),
    delivered_on_time TINYINT(1),
    material_cost DECIMAL(14,2) DEFAULT 0,
    labor_cost DECIMAL(14,2) DEFAULT 0,
    overhead_cost DECIMAL(14,2) DEFAULT 0,
    total_cost DECIMAL(14,2) DEFAULT 0
) COMMENT '生产宽表';

CREATE TABLE IF NOT EXISTS dwd_quality_wide (
    inspect_id BIGINT PRIMARY KEY,
    order_id VARCHAR(32), inspect_date DATE,
    line_code VARCHAR(20), line_name VARCHAR(60),
    product_code VARCHAR(20), product_name VARCHAR(80),
    total_qty INT, pass_qty INT, defect_qty INT, scrap_qty INT,
    defect_type VARCHAR(40), is_rework TINYINT(1),
    yield_rate DECIMAL(8,4)
) COMMENT '质量宽表';

CREATE TABLE IF NOT EXISTS dwd_supply_wide (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    snapshot_date DATE,
    material_code VARCHAR(20), material_name VARCHAR(80),
    supplier_code VARCHAR(20), supplier_name VARCHAR(80),
    on_hand_qty DECIMAL(14,2), daily_usage DECIMAL(14,2),
    purchase_qty DECIMAL(14,2), purchase_amount DECIMAL(14,2),
    actual_price DECIMAL(12,4), standard_price DECIMAL(12,4),
    on_time_delivery TINYINT(1) DEFAULT 1
) COMMENT '供应链宽表';
""", encoding="utf-8")

    (db / "04_dws.sql").write_text(r"""USE manufacturing_analytics;

CREATE TABLE IF NOT EXISTS dws_production_daily (
    snapshot_date DATE NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT 'ALL',
    line_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    output_qty INT DEFAULT 0 COMMENT '产量',
    plan_qty INT DEFAULT 0,
    capacity_util_pct DECIMAL(8,2) COMMENT '产能利用率%',
    labor_hours DECIMAL(12,2) DEFAULT 0,
    on_time_delivery_pct DECIMAL(8,2) COMMENT '准时交付率%',
    PRIMARY KEY (snapshot_date, factory_code, line_code)
) COMMENT '日生产汇总';

CREATE TABLE IF NOT EXISTS dws_quality_daily (
    snapshot_date DATE NOT NULL,
    line_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    product_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    total_qty INT DEFAULT 0,
    pass_qty INT DEFAULT 0,
    defect_qty INT DEFAULT 0,
    scrap_qty INT DEFAULT 0,
    yield_rate_pct DECIMAL(8,2),
    defect_rate_pct DECIMAL(8,2),
    scrap_rate_pct DECIMAL(8,2),
    first_pass_pct DECIMAL(8,2),
    PRIMARY KEY (snapshot_date, line_code, product_code)
) COMMENT '日质量汇总';

CREATE TABLE IF NOT EXISTS dws_supply_daily (
    snapshot_date DATE NOT NULL,
    supplier_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    purchase_amount DECIMAL(14,2) DEFAULT 0,
    inventory_turnover_days DECIMAL(10,2),
    supplier_otd_pct DECIMAL(8,2) COMMENT '准时率%',
    PRIMARY KEY (snapshot_date, supplier_code)
) COMMENT '日供应链汇总';

CREATE TABLE IF NOT EXISTS dws_equipment_daily (
    snapshot_date DATE NOT NULL,
    equipment_code VARCHAR(20) NOT NULL,
    line_code VARCHAR(20),
    availability_pct DECIMAL(8,2),
    performance_pct DECIMAL(8,2),
    quality_pct DECIMAL(8,2),
    oee_pct DECIMAL(8,2),
    downtime_hours DECIMAL(10,2),
    failure_count INT DEFAULT 0,
    downtime_reason VARCHAR(40),
    PRIMARY KEY (snapshot_date, equipment_code)
) COMMENT '日设备汇总';

CREATE TABLE IF NOT EXISTS dws_cost_monthly (
    snapshot_month VARCHAR(7) NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT 'ALL',
    product_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    output_qty INT DEFAULT 0,
    total_cost DECIMAL(16,2) DEFAULT 0,
    material_cost DECIMAL(16,2) DEFAULT 0,
    labor_cost DECIMAL(16,2) DEFAULT 0,
    overhead_cost DECIMAL(16,2) DEFAULT 0,
    unit_cost DECIMAL(12,2),
    PRIMARY KEY (snapshot_month, factory_code, product_code)
) COMMENT '月成本汇总';
""", encoding="utf-8")

    (db / "05_ads.sql").write_text(r"""USE manufacturing_analytics;

CREATE OR REPLACE VIEW v_production_overview AS
SELECT snapshot_date, SUM(output_qty) AS output_qty, AVG(capacity_util_pct) AS capacity_util_pct,
    AVG(on_time_delivery_pct) AS on_time_delivery_pct
FROM dws_production_daily WHERE line_code='ALL' GROUP BY snapshot_date;

CREATE OR REPLACE VIEW v_quality_analysis AS
SELECT snapshot_date, AVG(yield_rate_pct) AS yield_rate_pct, AVG(defect_rate_pct) AS defect_rate_pct,
    AVG(scrap_rate_pct) AS scrap_rate_pct, AVG(first_pass_pct) AS first_pass_pct
FROM dws_quality_daily WHERE line_code='ALL' AND product_code='ALL' GROUP BY snapshot_date;

CREATE OR REPLACE VIEW v_supply_chain AS
SELECT snapshot_date, SUM(purchase_amount) AS purchase_amount,
    AVG(inventory_turnover_days) AS inventory_turnover_days, AVG(supplier_otd_pct) AS supplier_otd_pct
FROM dws_supply_daily GROUP BY snapshot_date;

CREATE OR REPLACE VIEW v_equipment_oee AS
SELECT snapshot_date, equipment_code, line_code, oee_pct, availability_pct, performance_pct, quality_pct,
    downtime_hours, failure_count, downtime_reason
FROM dws_equipment_daily;

CREATE OR REPLACE VIEW v_cost_analysis AS
SELECT snapshot_month, SUM(total_cost) AS total_cost, SUM(output_qty) AS output_qty,
    ROUND(SUM(total_cost)/NULLIF(SUM(output_qty),0),2) AS unit_cost,
    ROUND(SUM(material_cost)/NULLIF(SUM(total_cost),0)*100,2) AS material_pct,
    ROUND(SUM(labor_cost)/NULLIF(SUM(total_cost),0)*100,2) AS labor_pct,
    ROUND(SUM(overhead_cost)/NULLIF(SUM(total_cost),0)*100,2) AS overhead_pct
FROM dws_cost_monthly WHERE factory_code='ALL' AND product_code='ALL' GROUP BY snapshot_month;

CREATE OR REPLACE VIEW v_capacity_utilization AS
SELECT snapshot_date, factory_code, line_code, output_qty, capacity_util_pct
FROM dws_production_daily WHERE line_code<>'ALL';

CREATE OR REPLACE VIEW v_defect_analysis AS
SELECT defect_type, SUM(defect_qty) AS defect_qty, SUM(scrap_qty) AS scrap_qty,
    ROUND(SUM(defect_qty)/NULLIF(SUM(total_qty),0)*100,2) AS defect_rate_pct
FROM dwd_quality_wide GROUP BY defect_type;

CREATE OR REPLACE VIEW v_material_turnover AS
SELECT m.material_code, m.material_name, AVG(i.on_hand_qty/NULLIF(i.daily_usage,0)) AS turnover_days,
    MAX(i.on_hand_qty) AS max_on_hand, MAX(i.safety_stock) AS safety_stock
FROM dim_material m JOIN ods_inventory_material i ON m.material_code=i.material_code
GROUP BY m.material_code, m.material_name;

CREATE OR REPLACE VIEW v_labor_efficiency AS
SELECT DATE_FORMAT(work_date,'%Y-%m') AS snapshot_month,
    SUM(actual_hours)/NULLIF(SUM(plan_hours),0)*100 AS hours_achievement_pct,
    COUNT(DISTINCT order_id) AS order_count, SUM(labor_cost) AS labor_cost
FROM ods_labor GROUP BY DATE_FORMAT(work_date,'%Y-%m');

CREATE OR REPLACE VIEW v_manufacturing_finance AS
SELECT snapshot_month, product_code, output_qty, total_cost, unit_cost,
    material_cost, labor_cost, overhead_cost,
    ROUND(material_cost/NULLIF(output_qty,0),2) AS unit_material,
    ROUND(labor_cost/NULLIF(output_qty,0),2) AS unit_labor
FROM dws_cost_monthly WHERE factory_code='ALL' AND product_code<>'ALL';
""", encoding="utf-8")


def write_config():
    cfg = {
        "version": "1.0",
        "default_role": "plant_manager",
        "dashboards": [
            {"id": did, "title": title, "icon": icon, "file": f"dashboard/{fname}.html",
             "api": f"/api/{api}", "filters": filters, "description": title}
            for fname, did, title, api, filters, icon in DASHBOARDS
        ],
    }
    roles = {
        "default_role": "plant_manager",
        "roles": {
            "plant_manager": {"label": "厂长/生产经理", "dashboards": [d[1] for d in DASHBOARDS]},
            "quality_manager": {"label": "质量经理", "dashboards": ["quality", "defect", "production", "equipment"]},
            "supply_manager": {"label": "供应链经理", "dashboards": ["supply", "material", "cost", "production"]},
            "finance_bp": {"label": "财务BP", "dashboards": ["cost", "mfg_finance", "production", "labor"]},
        },
    }
    (ROOT / "config").mkdir(exist_ok=True)
    (ROOT / "config" / "dashboards.json").write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "config" / "roles.json").write_text(json.dumps(roles, ensure_ascii=False, indent=2), encoding="utf-8")


def write_dashboard_html():
    ddir = ROOT / "dashboard"
    ddir.mkdir(exist_ok=True)
    for fname, did, title, api, _, _ in DASHBOARDS:
        charts = CHARTS[did]
        chart_html = "\n".join(
            f'  <div class="chart-box"><h3>{c.replace("db-chart-", "")}</h3><div id="{c}" class="chart"></div></div>'
            for c in charts
        )
        (ddir / f"{fname}.html").write_text(f"""<section class="dashboard-page" data-dashboard="{did}">
  <h2 class="dashboard-page-title">{title}</h2>
  <p class="dashboard-page-desc">制造业数据分析 · manufacturing_analytics · API /api/{api}</p>
  <div id="db-kpi" class="kpi-grid"></div>
{chart_html}
</section>
""", encoding="utf-8")


def copy_frontend_shell():
    for sub in ("css", "js"):
        dst = ROOT / sub
        dst.mkdir(exist_ok=True)
        for f in (INTERNET / sub).glob("*"):
            if f.is_file() and f.name not in ("loaders.js", "methodology-playbook-data.js", "search-index-data.js", "data-dictionary-data.js"):
                shutil.copy2(f, dst / f.name)
    # dashboard-core default port
    dc = ROOT / "js" / "dashboard-core.js"
    if dc.exists():
        t = dc.read_text(encoding="utf-8")
        t = t.replace("127.0.0.1:5001", "127.0.0.1:5002").replace("127.0.0.1:5100", "127.0.0.1:5002")
        dc.write_text(t, encoding="utf-8")


def write_main_html():
    (ROOT / "manufacturing_dashboard.html").write_text("""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>制造业 · 生产运营数据分析体系</title>
  <link rel="stylesheet" href="css/dashboard.css">
  <link rel="stylesheet" href="css/shell.css">
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
</head>
<body class="page-dashboard page-shell">
  <header class="dashboard-header">
    <div class="header-brand">
      <h1>制造业 · 生产运营数据分析体系</h1>
      <p class="header-sub">10 主题看板 + PDF + Tableau SQL · ODS→ADS 数仓 · 六层方法论</p>
    </div>
    <nav class="site-nav">
      <a href="manufacturing_dashboard.html" class="nav-tab active">数据展示</a>
      <a href="pages/methodology.html" class="nav-tab">分析方法论</a>
      <a href="pages/architecture.html" class="nav-tab">数仓架构</a>
      <a href="pdf/report.html" class="nav-tab" target="_blank">导出 PDF</a>
      <a href="/" class="nav-tab">返回平台</a>
    </nav>
  </header>
  <div id="dash-nav" class="dash-nav-wrap"></div>
  <div id="dash-filters" class="dash-filters toolbar"></div>
  <main id="dashboard-content" class="dashboard-main shell-content"><div class="empty-hint">初始化看板…</div></main>
  <footer id="status-bar" class="dashboard-status-bar">请先运行制造业 API，浏览器打开 http://127.0.0.1:5002/</footer>
  <script>if (location.protocol.startsWith("http")) window.API_BASE_URL = location.origin;</script>
  <script src="js/state.js"></script>
  <script src="js/dashboard-core.js"></script>
  <script src="js/loaders.js"></script>
  <script src="js/nav.js"></script>
  <script src="js/shell.js"></script>
</body>
</html>
""", encoding="utf-8")


def write_tableau_sql():
    sdir = ROOT / "sql"
    sdir.mkdir(exist_ok=True)
    lines = ["# Tableau SQL · 制造业（10 看板 1:1）\n"]
    for fname, _, title, _, _, _ in DASHBOARDS:
        view = ADS_VIEWS[fname]
        d = sdir / fname
        d.mkdir(exist_ok=True)
        sql = f"SELECT * FROM manufacturing_analytics.{view}"
        if "month" in fname or fname in ("01-production", "02-quality", "03-supply", "04-equipment", "05-cost", "06-capacity", "07-defect", "08-material", "09-labor", "10-mfg-finance"):
            if view in ("v_cost_analysis", "v_labor_efficiency", "v_manufacturing_finance"):
                sql += " WHERE snapshot_month = '{{analysis_month_str}}'"
            elif view != "v_defect_analysis" and view != "v_material_turnover":
                sql += " WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}'"
        (d / "01_main.sql").write_text(f"-- {title}\n-- {view}\n\n{sql};\n", encoding="utf-8")
        lines.append(f"| `{fname}/` | {title} | `{view}` |")
    (sdir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_metadata_sql():
    out = REPO / "portfolio" / "portfolio_metadata" / "sql" / "insert_version_manufacturing_v1_0.sql"
    out.write_text("""-- 注册制造业行业 · v1.0.0
USE portfolio_metadata;

INSERT INTO industry_catalog (
    industry_code, industry_name, database_name, folder_path,
    entry_file, current_version, status
) VALUES (
    'manufacturing', '制造业', 'manufacturing_analytics',
    '/industries/manufacturing/', 'manufacturing_dashboard.html', 'v1.0.0', 'active'
)
ON DUPLICATE KEY UPDATE
    industry_name=VALUES(industry_name), database_name=VALUES(database_name),
    folder_path=VALUES(folder_path), entry_file=VALUES(entry_file),
    current_version=VALUES(current_version), status=VALUES(status), updated_at=CURRENT_TIMESTAMP;

INSERT INTO version_history (industry_id, version_tag, release_notes, status)
SELECT ic.industry_id, 'v1.0.0',
    '制造业初始版本：10看板、六层方法论、31对象数仓、2024-01~2026-07样例',
    'active' FROM industry_catalog ic WHERE ic.industry_code='manufacturing'
ON DUPLICATE KEY UPDATE release_notes=VALUES(release_notes), status=VALUES(status);

SELECT * FROM v_industry_status WHERE industry_code='manufacturing';
""", encoding="utf-8")


def write_app_launcher():
    (ROOT / "app.py").write_text('''"""启动制造业 API（转发到 manufacturing-analytics）。"""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).resolve().parents[2] / "manufacturing-analytics" / "app.py"), run_name="__main__")
''', encoding="utf-8")


def main():
    write_ddl()
    write_config()
    write_dashboard_html()
    copy_frontend_shell()
    write_main_html()
    write_tableau_sql()
    write_metadata_sql()
    write_app_launcher()
    print("DDL + config + dashboards + shell copied")


if __name__ == "__main__":
    main()
