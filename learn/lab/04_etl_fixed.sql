-- 修复版 ETL：过滤脏行 + 按业务键去重 + 仅保留业务日 + 关联维
-- MySQL 8：用窗口函数去重（不用 QUALIFY）
USE learn_lab_dau;

TRUNCATE TABLE dwd_act_launcher_di;
TRUNCATE TABLE dws_act_user_active_1d;

INSERT INTO dwd_act_launcher_di
(log_id, mac, userid, device_type, region_id, action, event_time, event_date)
SELECT
    log_id, mac, userid, device_type, region_id, action, event_time, event_date
FROM (
    SELECT
        o.log_id,
        o.mac,
        o.userid,
        o.device_type,
        o.region_id,
        o.action,
        o.event_time,
        o.event_date,
        ROW_NUMBER() OVER (
            PARTITION BY o.mac, o.event_time, o.action
            ORDER BY o.log_id
        ) AS rn
    FROM ods_log_launcher_di o
    INNER JOIN dim_device d ON o.mac = d.mac
    WHERE o.mac IS NOT NULL
      AND o.mac <> ''
      AND o.userid <> 'TEST'
      AND o.event_date = '2026-07-15'
      AND o.event_time < '2026-07-16 00:00:00'
) t
WHERE t.rn = 1;

INSERT INTO dws_act_user_active_1d
(snapshot_date, mac, userid, device_type, region_id,
 is_only_launcher, is_vod_active, is_live_active,
 launcher_cnt, vod_play_cnt, vod_play_dur, live_play_dur, etl_batch_id)
SELECT
    event_date AS snapshot_date,
    mac,
    MAX(userid) AS userid,
    MAX(device_type) AS device_type,
    MAX(region_id) AS region_id,
    1 AS is_only_launcher,
    0, 0,
    COUNT(*) AS launcher_cnt,
    0, 0, 0,
    'FIXED_LAB_20260715' AS etl_batch_id
FROM dwd_act_launcher_di
WHERE event_date = '2026-07-15'
GROUP BY event_date, mac;
