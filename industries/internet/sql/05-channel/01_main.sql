-- Web看板: 05-channel
-- 视图: v_channel_analysis
-- 参数: {analysis_month_str}

SELECT * FROM internet_analytics.v_channel_analysis WHERE DATE_FORMAT(snapshot_date,'%Y-%m')='{{analysis_month_str}}';
