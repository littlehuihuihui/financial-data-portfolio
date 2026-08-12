-- 分析方法论 SQL 兼容视图（制造）
-- 由 scripts/fix_methodology_playbook_sql.py 维护；smoke_methodology_sql.py 验收
USE manufacturing_analytics;

CREATE OR REPLACE VIEW v_delivery_analysis AS
SELECT snapshot_date, factory_code, line_code, on_time_delivery_pct,
       output_qty, plan_qty, capacity_util_pct
FROM dws_production_daily WHERE line_code <> 'ALL';

CREATE OR REPLACE VIEW v_material_shortage AS
SELECT snapshot_date, supplier_code AS material_code,
       purchase_amount, inventory_turnover_days,
       GREATEST(0, ROUND(100 - IFNULL(supplier_otd_pct, 100), 2)) AS shortage_qty
FROM dws_supply_daily;

CREATE OR REPLACE VIEW v_supplier_scorecard AS
SELECT supplier_code,
       ROUND(AVG(supplier_otd_pct), 2) AS otd_pct,
       ROUND(AVG(inventory_turnover_days), 1) AS turnover_days,
       ROUND(SUM(purchase_amount), 2) AS purchase_amount
FROM dws_supply_daily GROUP BY supplier_code;

CREATE OR REPLACE VIEW v_scrap_rework AS
SELECT snapshot_date, line_code, product_code, scrap_qty,
       0 AS rework_qty, defect_qty, yield_rate_pct
FROM dws_quality_daily;

CREATE OR REPLACE VIEW v_inventory_health AS
SELECT snapshot_date, supplier_code, inventory_turnover_days AS turnover_days,
       purchase_amount AS stock_amount, supplier_otd_pct
FROM dws_supply_daily;

CREATE OR REPLACE VIEW dws_material_daily AS
SELECT snapshot_date, supplier_code AS material_code,
       purchase_amount AS issue_qty, inventory_turnover_days
FROM dws_supply_daily;

CREATE OR REPLACE VIEW dws_labor_daily AS
SELECT snapshot_date, factory_code, line_code, labor_hours,
       output_qty, ROUND(output_qty / NULLIF(labor_hours, 0), 2) AS labor_efficiency
FROM dws_production_daily WHERE line_code <> 'ALL';

CREATE OR REPLACE VIEW ads_customer_complaint_open AS
SELECT snapshot_date, line_code, product_code, defect_qty AS open_cnt, yield_rate_pct
FROM dws_quality_daily WHERE defect_qty > 0;

CREATE OR REPLACE VIEW ads_capa_tracker AS
SELECT snapshot_date, line_code, product_code, defect_qty AS capa_open, scrap_qty
FROM dws_quality_daily WHERE scrap_qty > 0;
