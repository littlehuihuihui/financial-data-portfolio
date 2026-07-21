-- Web看板: 09-churn
-- 视图: v_rfm
-- 参数: {analysis_month_str}

SELECT * FROM internet_analytics.v_rfm WHERE rfm_segment='流失风险';
