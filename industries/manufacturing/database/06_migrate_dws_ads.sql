-- 现有库增量迁移：新建 DWS + 重刷 ADS（不 DROP ODS）
-- 用法：mysql ... < 04_dws.sql && mysql ... < 05_ads.sql && 再执行本文件后半段回填
USE manufacturing_analytics;

-- 回填 DWS（从已有 ODS；表结构须已执行 04_dws.sql）
DELETE FROM dws_material_daily;
INSERT INTO dws_material_daily
(snapshot_date, material_code, material_name, on_hand_qty, daily_usage, turnover_days,
 max_on_hand, safety_stock, on_hand_amount, etl_batch_id)
SELECT i.snapshot_date, i.material_code, IFNULL(m.material_name, '未知'),
       i.on_hand_qty, i.daily_usage,
       ROUND(i.on_hand_qty / NULLIF(i.daily_usage, 0), 1),
       i.on_hand_qty, i.safety_stock,
       ROUND(i.on_hand_qty * IFNULL(m.standard_price, 0), 2),
       'migrate'
FROM ods_inventory_material i
LEFT JOIN dim_material m ON i.material_code = m.material_code;

DELETE FROM dws_labor_monthly;
INSERT INTO dws_labor_monthly
(snapshot_month, factory_code, line_code, plan_hours, actual_hours, hours_achievement_pct,
 labor_cost, order_count, worker_count, etl_batch_id)
SELECT DATE_FORMAT(work_date,'%Y-%m'), 'ALL', 'ALL',
       SUM(plan_hours), SUM(actual_hours),
       ROUND(SUM(actual_hours)/NULLIF(SUM(plan_hours),0)*100, 2),
       SUM(labor_cost), COUNT(DISTINCT order_id), COUNT(*),
       'migrate'
FROM ods_labor
GROUP BY DATE_FORMAT(work_date,'%Y-%m');

DELETE FROM dws_defect_daily;
INSERT INTO dws_defect_daily
(snapshot_date, defect_type, defect_qty, scrap_qty, total_qty, defect_rate_pct, inspect_count, line_code, etl_batch_id)
SELECT inspect_date, IFNULL(NULLIF(defect_type,''), '未知'),
       SUM(defect_qty), SUM(scrap_qty), SUM(total_qty),
       ROUND(SUM(defect_qty)/NULLIF(SUM(total_qty),0)*100, 2),
       COUNT(*), 'ALL', 'migrate'
FROM ods_quality_inspection
GROUP BY inspect_date, IFNULL(NULLIF(defect_type,''), '未知');
