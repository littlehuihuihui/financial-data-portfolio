USE learn_lab_vod;

DELETE FROM lab_dq_result;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ1_null_mac', 'DWD.mac 空值=0',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('n=', COUNT(*))
FROM dwd_vod_play_di WHERE mac IS NULL OR mac='';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ2_finish_flag', 'is_finish 仅 0/1',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('bad=', COUNT(*))
FROM dwd_vod_play_di WHERE is_finish NOT IN (0, 1);

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ3_test', '无 TEST 用户',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('n=', COUNT(*))
FROM dwd_vod_play_di WHERE userid='TEST';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ4_series_dim', 'series_id 须在维表',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('orphan=', COUNT(*))
FROM dwd_vod_play_di d
LEFT JOIN dim_content_series s ON d.series_id = s.series_id
WHERE s.series_id IS NULL;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ5_finish_le_vv', 'finish_cnt <= vv',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('bad_rows=', COUNT(*))
FROM dws_content_series_play_1d WHERE finish_cnt > vv;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ6_ads_rate', 'ADS 完播率与 DWS 勾稽（S001）',
  CASE WHEN ABS(IFNULL(a.finish_rate_pct, -1) - IFNULL(b.pct, -2)) < 0.01 THEN 1 ELSE 0 END,
  CONCAT('ads=', IFNULL(a.finish_rate_pct,'NULL'), '; dws=', IFNULL(b.pct,'NULL'))
FROM (
  SELECT finish_rate_pct FROM v_vod_finish_rate
  WHERE snapshot_date='2026-07-15' AND series_id='S001'
) a
RIGHT JOIN (
  SELECT ROUND(finish_cnt / NULLIF(vv,0) * 100, 2) AS pct
  FROM dws_content_series_play_1d
  WHERE snapshot_date='2026-07-15' AND series_id='S001'
) b ON 1=1;

SELECT * FROM lab_dq_result ORDER BY check_id;
SELECT CASE WHEN SUM(passed)=COUNT(*) THEN 'PASS' ELSE 'FAIL' END AS lab_gate FROM lab_dq_result;
