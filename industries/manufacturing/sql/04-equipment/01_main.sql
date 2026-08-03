-- 设备OEE
-- v_equipment_oee

SELECT * FROM manufacturing_analytics.v_equipment_oee WHERE DATE_FORMAT(snapshot_date,'%Y-%m') = '{{analysis_month_str}}';
