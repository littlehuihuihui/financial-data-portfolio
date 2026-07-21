-- Web看板: 03-retention
-- 视图: v_user_retention
-- 参数: {analysis_month_str}

SELECT * FROM internet_analytics.v_user_retention WHERE day_offset IN (1,3,7,14,30);
