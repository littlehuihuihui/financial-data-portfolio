-- 产能利用率
-- v_capacity_utilization

SELECT * FROM manufacturing_analytics.v_capacity_utilization WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}';
