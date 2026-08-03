-- Web看板: 01-dau
-- 视图: v_dau_overview
-- 参数: {analysis_month_str}

SELECT * FROM internet_analytics.v_dau_overview WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}';
