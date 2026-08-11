USE manufacturing_analytics;

-- ADS 仅读 DWS/DIM；率类指标禁止 AVG(%)，与 queries.py 加权口径一致

CREATE OR REPLACE VIEW v_production_overview AS
SELECT snapshot_date,
       SUM(output_qty) AS output_qty,
       ROUND(SUM(capacity_util_pct * output_qty) / NULLIF(SUM(output_qty), 0), 2) AS capacity_util_pct,
       ROUND(SUM(on_time_delivery_pct * output_qty) / NULLIF(SUM(output_qty), 0), 2) AS on_time_delivery_pct,
       SUM(plan_qty) AS plan_qty,
       SUM(labor_hours) AS labor_hours
FROM dws_production_daily
WHERE factory_code <> 'ALL' AND line_code <> 'ALL'
GROUP BY snapshot_date;

CREATE OR REPLACE VIEW v_quality_analysis AS
SELECT snapshot_date,
       ROUND(SUM(pass_qty) / NULLIF(SUM(total_qty), 0) * 100, 2) AS yield_rate_pct,
       ROUND(SUM(defect_qty) / NULLIF(SUM(total_qty), 0) * 100, 2) AS defect_rate_pct,
       ROUND(SUM(scrap_qty) / NULLIF(SUM(total_qty), 0) * 100, 2) AS scrap_rate_pct,
       ROUND(SUM(first_pass_pct * total_qty) / NULLIF(SUM(total_qty), 0), 2) AS first_pass_pct,
       SUM(total_qty) AS total_qty
FROM dws_quality_daily
WHERE line_code <> 'ALL' AND product_code <> 'ALL'
GROUP BY snapshot_date;

CREATE OR REPLACE VIEW v_supply_chain AS
SELECT snapshot_date,
       SUM(purchase_amount) AS purchase_amount,
       ROUND(SUM(inventory_turnover_days * purchase_amount) / NULLIF(SUM(purchase_amount), 0), 2) AS inventory_turnover_days,
       ROUND(SUM(supplier_otd_pct * purchase_amount) / NULLIF(SUM(purchase_amount), 0), 2) AS supplier_otd_pct,
       COUNT(*) AS supplier_rows,
       SUM(purchase_amount) AS on_hand_amount_proxy
FROM dws_supply_daily
GROUP BY snapshot_date;

CREATE OR REPLACE VIEW v_equipment_oee AS
SELECT snapshot_date, equipment_code, line_code,
       oee_pct, availability_pct, performance_pct, quality_pct,
       downtime_hours, failure_count, downtime_reason
FROM dws_equipment_daily;

CREATE OR REPLACE VIEW v_cost_analysis AS
SELECT snapshot_month,
       SUM(total_cost) AS total_cost,
       SUM(output_qty) AS output_qty,
       ROUND(SUM(total_cost) / NULLIF(SUM(output_qty), 0), 2) AS unit_cost,
       ROUND(SUM(material_cost) / NULLIF(SUM(total_cost), 0) * 100, 2) AS material_pct,
       ROUND(SUM(labor_cost) / NULLIF(SUM(total_cost), 0) * 100, 2) AS labor_pct,
       ROUND(SUM(overhead_cost) / NULLIF(SUM(total_cost), 0) * 100, 2) AS overhead_pct
FROM dws_cost_monthly
WHERE factory_code = 'ALL' AND product_code = 'ALL'
GROUP BY snapshot_month;

CREATE OR REPLACE VIEW v_capacity_utilization AS
SELECT snapshot_date, factory_code, line_code,
       output_qty, capacity_util_pct,
       plan_qty, labor_hours, on_time_delivery_pct
FROM dws_production_daily
WHERE line_code <> 'ALL';

-- 不良 / 物料 / 人工：只读 DWS（禁止 ADS 直连 ODS）
CREATE OR REPLACE VIEW v_defect_analysis AS
SELECT snapshot_date,
       defect_type,
       defect_qty,
       scrap_qty,
       total_qty,
       defect_rate_pct,
       inspect_count,
       line_code
FROM dws_defect_daily;

CREATE OR REPLACE VIEW v_material_turnover AS
SELECT snapshot_date,
       material_code,
       material_name,
       on_hand_qty,
       daily_usage,
       turnover_days,
       max_on_hand,
       safety_stock,
       on_hand_amount
FROM dws_material_daily;

CREATE OR REPLACE VIEW v_labor_efficiency AS
SELECT snapshot_month,
       factory_code,
       line_code,
       plan_hours,
       actual_hours,
       hours_achievement_pct,
       labor_cost,
       order_count,
       worker_count
FROM dws_labor_monthly;

CREATE OR REPLACE VIEW v_manufacturing_finance AS
SELECT snapshot_month, product_code,
       output_qty, total_cost, unit_cost,
       material_cost, labor_cost, overhead_cost,
       ROUND(material_cost / NULLIF(output_qty, 0), 2) AS unit_material,
       ROUND(labor_cost / NULLIF(output_qty, 0), 2) AS unit_labor
FROM dws_cost_monthly
WHERE factory_code <> 'ALL';

-- CMEI 规划中最小可用视图（由加权 FPY/OEE/OTD 合成；SPC 表未落地）
CREATE OR REPLACE VIEW v_cmei_daily AS
SELECT
    p.snapshot_date,
    ROUND(
        IFNULL(q.first_pass_pct, 0) * 0.40
        + IFNULL(e.oee_pct, 0) * 0.35
        + IFNULL(p.on_time_delivery_pct, 0) * 0.25
    , 2) AS cmei_pct,
    IFNULL(q.first_pass_pct, 0) AS fpy_pct,
    IFNULL(e.oee_pct, 0) AS oee_pct,
    IFNULL(p.on_time_delivery_pct, 0) AS otd_pct
FROM (
    SELECT snapshot_date,
           ROUND(SUM(on_time_delivery_pct * output_qty) / NULLIF(SUM(output_qty), 0), 2) AS on_time_delivery_pct
    FROM dws_production_daily
    WHERE factory_code <> 'ALL' AND line_code <> 'ALL'
    GROUP BY snapshot_date
) p
LEFT JOIN (
    SELECT snapshot_date,
           ROUND(SUM(first_pass_pct * total_qty) / NULLIF(SUM(total_qty), 0), 2) AS first_pass_pct
    FROM dws_quality_daily
    WHERE line_code <> 'ALL' AND product_code <> 'ALL'
    GROUP BY snapshot_date
) q ON p.snapshot_date = q.snapshot_date
LEFT JOIN (
    SELECT snapshot_date,
           ROUND(AVG(oee_pct), 2) AS oee_pct
    FROM dws_equipment_daily
    GROUP BY snapshot_date
) e ON p.snapshot_date = e.snapshot_date;
