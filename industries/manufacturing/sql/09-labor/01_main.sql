-- 人工效率
-- v_labor_efficiency

SELECT * FROM manufacturing_analytics.v_labor_efficiency WHERE snapshot_month = '{{analysis_month_str}}';
