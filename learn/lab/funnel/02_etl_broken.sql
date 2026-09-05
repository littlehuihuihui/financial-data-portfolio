USE learn_lab_funnel;

TRUNCATE TABLE dwd_trade_cashier_di;
TRUNCATE TABLE dws_trade_cashier_funnel_1d;

INSERT INTO dwd_trade_cashier_di
(log_id, mac, userid, device_type, funnel_step, src_type, series_id, fee, pay_type, event_time, event_date)
SELECT log_id, mac, userid, device_type, funnel_step, src_type, series_id, fee, pay_type, event_time, event_date
FROM ods_log_cashier_di;

INSERT INTO dws_trade_cashier_funnel_1d
(snapshot_date, device_type, src_type, expose_cnt, click_cnt, verify_cnt, confirm_cnt, etl_batch_id)
SELECT
    event_date,
    IFNULL(device_type, 'ALL'),
    IFNULL(src_type, 'ALL'),
    SUM(CASE WHEN funnel_step = 'expose' THEN 1 ELSE 0 END),
    SUM(CASE WHEN funnel_step = 'click' THEN 1 ELSE 0 END),
    SUM(CASE WHEN funnel_step = 'verify' THEN 1 ELSE 0 END),
    SUM(CASE WHEN funnel_step = 'confirm' THEN 1 ELSE 0 END),
    'BROKEN_FUNNEL'
FROM dwd_trade_cashier_di
GROUP BY event_date, device_type, src_type;
