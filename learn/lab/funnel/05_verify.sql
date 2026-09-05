USE learn_lab_funnel;

SELECT 'dwd_rows' AS k, COUNT(*) AS v FROM dwd_trade_cashier_di
UNION ALL
SELECT 'dws_slices', COUNT(*) FROM dws_trade_cashier_funnel_1d WHERE snapshot_date='2026-07-15';

SELECT * FROM v_cashier_funnel_day WHERE snapshot_date='2026-07-15' ORDER BY device_type, src_type;

-- 期望：STB+video expose=1 click=1 verify=1 confirm=1 → click_rate=100
-- STB+launcher expose=1 click=1；Speaker+video expose=1
