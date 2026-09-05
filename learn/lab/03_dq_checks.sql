-- DQ 门禁：写入 lab_dq_result；全部 passed=1 才算过关
USE learn_lab_dau;

DELETE FROM lab_dq_result;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT
  'DQ1_null_mac',
  'DWD.mac 空值行数应为 0',
  CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END,
  CONCAT('null_mac_rows=', COUNT(*))
FROM dwd_act_launcher_di
WHERE mac IS NULL OR mac = '';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT
  'DQ2_future_event',
  'DWD 不应含 event_date > 业务日 2026-07-15',
  CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END,
  CONCAT('future_rows=', COUNT(*))
FROM dwd_act_launcher_di
WHERE event_date > '2026-07-15';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT
  'DQ3_test_traffic',
  'DWD 不应含测试 userid=TEST',
  CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END,
  CONCAT('test_rows=', COUNT(*))
FROM dwd_act_launcher_di
WHERE userid = 'TEST';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT
  'DQ4_orphan_mac',
  'DWD.mac 应能关联 dim_device',
  CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END,
  CONCAT('orphan_rows=', COUNT(*))
FROM dwd_act_launcher_di d
LEFT JOIN dim_device m ON d.mac = m.mac
WHERE d.mac IS NOT NULL AND m.mac IS NULL;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT
  'DQ5_dau_vs_dws',
  'ADS total_dau 应等于 DWS 当日 DISTINCT mac',
  CASE WHEN IFNULL(a.total_dau, -1) = IFNULL(b.cnt, -2) THEN 1 ELSE 0 END,
  CONCAT('ads_dau=', IFNULL(a.total_dau, 'NULL'), '; dws_mac=', IFNULL(b.cnt, 'NULL'))
FROM (SELECT total_dau FROM v_dau_overview WHERE snapshot_date = '2026-07-15') a
RIGHT JOIN (
  SELECT COUNT(DISTINCT mac) AS cnt
  FROM dws_act_user_active_1d
  WHERE snapshot_date = '2026-07-15'
) b ON 1 = 1;

SELECT * FROM lab_dq_result ORDER BY check_id;
SELECT
  SUM(passed) AS passed_cnt,
  COUNT(*) AS total_cnt,
  CASE WHEN SUM(passed) = COUNT(*) THEN 'PASS' ELSE 'FAIL' END AS lab_gate
FROM lab_dq_result;
