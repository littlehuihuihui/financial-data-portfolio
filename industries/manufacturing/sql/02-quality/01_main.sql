-- 质量分析
-- v_quality_analysis

SELECT * FROM manufacturing_analytics.v_quality_analysis WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}';
