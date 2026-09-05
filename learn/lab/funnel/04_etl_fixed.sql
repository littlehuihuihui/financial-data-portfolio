USE learn_lab_funnel;

TRUNCATE TABLE dwd_trade_cashier_di;
TRUNCATE TABLE dws_trade_cashier_funnel_1d;

INSERT INTO dwd_trade_cashier_di
(log_id, mac, userid, device_type, funnel_step, src_type, series_id, fee, pay_type, event_time, event_date)
SELECT
    log_id, mac, userid, device_type, funnel_step, src_type, series_id, fee, pay_type, event_time, event_date
FROM (
    SELECT
        o.*,
        ROW_NUMBER() OVER (
            PARTITION BY o.mac, o.funnel_step, o.src_type, o.event_time
            ORDER BY o.log_id
        ) AS rn
    FROM ods_log_cashier_di o
    WHERE o.mac IS NOT NULL AND o.mac <> ''
      AND o.userid <> 'TEST'
      AND o.event_date = '2026-07-15'
      AND o.funnel_step IN ('expose','click','verify','confirm')
) t
WHERE t.rn = 1;

INSERT INTO dws_trade_cashier_funnel_1d
(snapshot_date, device_type, src_type, expose_cnt, click_cnt, verify_cnt, confirm_cnt, etl_batch_id)
SELECT
    event_date,
    device_type,
    src_type,
    SUM(CASE WHEN funnel_step = 'expose' THEN 1 ELSE 0 END),
    SUM(CASE WHEN funnel_step = 'click' THEN 1 ELSE 0 END),
    SUM(CASE WHEN funnel_step = 'verify' THEN 1 ELSE 0 END),
    SUM(CASE WHEN funnel_step = 'confirm' THEN 1 ELSE 0 END),
    'FIXED_FUNNEL_20260715'
FROM dwd_trade_cashier_di
WHERE event_date = '2026-07-15'
GROUP BY event_date, device_type, src_type;
