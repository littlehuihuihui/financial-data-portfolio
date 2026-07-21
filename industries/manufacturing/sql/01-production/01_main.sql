-- 生产总览
-- v_production_overview

SELECT * FROM manufacturing_analytics.v_production_overview WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}';
