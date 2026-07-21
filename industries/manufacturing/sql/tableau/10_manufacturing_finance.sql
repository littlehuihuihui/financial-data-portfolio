-- 生产成本财务
-- v_manufacturing_finance

SELECT * FROM manufacturing_analytics.v_manufacturing_finance WHERE snapshot_month = '{{analysis_month_str}}';
