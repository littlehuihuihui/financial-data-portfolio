-- 成本分析
-- v_cost_analysis

SELECT * FROM manufacturing_analytics.v_cost_analysis WHERE snapshot_month = '{{analysis_month_str}}';
