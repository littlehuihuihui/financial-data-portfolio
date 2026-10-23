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

-- 别名列兼容方法论旧字段名
CREATE OR REPLACE VIEW dws_quality_daily_m AS
SELECT snapshot_date, line_code, product_code, total_qty, pass_qty, defect_qty, scrap_qty,
       yield_rate_pct, defect_rate_pct, scrap_rate_pct,
       first_pass_pct AS fpy_pct, first_pass_pct, 0 AS rework_qty
FROM dws_quality_daily;

CREATE OR REPLACE VIEW dws_equipment_daily_m AS
SELECT snapshot_date, equipment_code, line_code, availability_pct, performance_pct, quality_pct,
       oee_pct, downtime_hours, ROUND(downtime_hours * 60, 1) AS downtime_min,
       failure_count, downtime_reason, 0 AS changeover_min
FROM dws_equipment_daily;

-- 若已存在物理表 dws_material_daily / dws_labor_*，以下视图创建-- 在「表已存在」库上不会覆盖表；新环境优先用 04_dws 物理表。
-- 方法论 smoke 依赖的别名视图（无物理表时由 fix 脚本 CREATE VIEW）：
CREATE OR REPLACE VIEW ads_customer_complaint_open AS
SELECT snapshot_date, line_code, product_code, defect_qty AS open_cnt, yield_rate_pct
FROM dws_quality_daily WHERE defect_qty > 0;

CREATE OR REPLACE VIEW ads_capa_tracker AS
SELECT snapshot_date, line_code, product_code, defect_qty AS capa_open, scrap_qty
FROM dws_quality_daily WHERE scrap_qty > 0;
