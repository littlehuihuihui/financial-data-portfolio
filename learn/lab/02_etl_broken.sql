-- 故意错误的 ETL：DWD 全量照搬（含脏行）；DWS 仅跳过 NULL mac 但仍含测试/未来日
USE learn_lab_dau;

TRUNCATE TABLE dwd_act_launcher_di;
TRUNCATE TABLE dws_act_user_active_1d;

INSERT INTO dwd_act_launcher_di
(log_id, mac, userid, device_type, region_id, action, event_time, event_date)
SELECT
    log_id, mac, userid, device_type, region_id, action, event_time, event_date
FROM ods_log_launcher_di;

-- DWS：未过滤测试账号与未来日；未去重（launcher_cnt 被放大）
INSERT INTO dws_act_user_active_1d
(snapshot_date, mac, userid, device_type, region_id,
 is_only_launcher, is_vod_active, is_live_active,
 launcher_cnt, vod_play_cnt, vod_play_dur, live_play_dur, etl_batch_id)
SELECT
    event_date,
    mac,
    MAX(userid),
    MAX(device_type),
    MAX(region_id),
    1, 0, 0,
    COUNT(*),
    0, 0, 0,
    'BROKEN_BATCH'
FROM dwd_act_launcher_di
WHERE mac IS NOT NULL AND mac <> ''
GROUP BY event_date, mac;
