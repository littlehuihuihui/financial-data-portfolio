-- 供应链分析
-- v_supply_chain

SELECT * FROM manufacturing_analytics.v_supply_chain WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}';
