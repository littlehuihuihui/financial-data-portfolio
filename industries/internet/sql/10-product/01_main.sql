-- Web看板: 10-product
-- 视图: dwd_event_wide
-- 参数: {analysis_month_str}

SELECT event_name,event_category,COUNT(*) cnt FROM internet_analytics.dwd_event_wide GROUP BY event_name,event_category;
