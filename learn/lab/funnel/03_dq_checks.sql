USE learn_lab_funnel;

DELETE FROM lab_dq_result;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ1_null_mac', 'DWD.mac 空值=0',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('n=', COUNT(*))
FROM dwd_trade_cashier_di WHERE mac IS NULL OR mac='';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ2_step_enum', 'funnel_step 仅合法四步',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('bad=', COUNT(*))
FROM dwd_trade_cashier_di
WHERE funnel_step NOT IN ('expose','click','verify','confirm');

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ3_test', '无 TEST',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('n=', COUNT(*))
FROM dwd_trade_cashier_di WHERE userid='TEST';

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ4_funnel_order', '同切片 click<=expose 且 confirm<=click',
  CASE WHEN COUNT(*)=0 THEN 1 ELSE 0 END, CONCAT('bad=', COUNT(*))
FROM dws_trade_cashier_funnel_1d
WHERE click_cnt > expose_cnt OR confirm_cnt > click_cnt OR verify_cnt > click_cnt;

INSERT INTO lab_dq_result (check_id, check_name, passed, detail)
SELECT 'DQ5_ads_rate', 'ADS click_rate 与 DWS 勾稽（STB+video）',
  CASE WHEN ABS(IFNULL(a.click_rate,-1) - IFNULL(b.pct,-2)) < 0.01 THEN 1 ELSE 0 END,
  CONCAT('ads=', IFNULL(a.click_rate,'NULL'), '; dws=', IFNULL(b.pct,'NULL'))
FROM (
  SELECT click_rate FROM v_cashier_funnel_day
  WHERE snapshot_date='2026-07-15' AND device_type='STB' AND src_type='video'
) a
RIGHT JOIN (
  SELECT ROUND(click_cnt / NULLIF(expose_cnt,0) * 100, 2) AS pct
  FROM dws_trade_cashier_funnel_1d
  WHERE snapshot_date='2026-07-15' AND device_type='STB' AND src_type='video'
) b ON 1=1;

SELECT * FROM lab_dq_result ORDER BY check_id;
SELECT CASE WHEN SUM(passed)=COUNT(*) THEN 'PASS' ELSE 'FAIL' END AS lab_gate FROM lab_dq_result;
