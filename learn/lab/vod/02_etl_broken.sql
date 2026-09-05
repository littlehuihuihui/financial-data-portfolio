USE learn_lab_vod;

TRUNCATE TABLE dwd_vod_play_di;
TRUNCATE TABLE dws_content_series_play_1d;

-- 坏：不过滤；play_id=log_id；非法 is_finish 照单全收
INSERT INTO dwd_vod_play_di
(play_id, mac, userid, device_type, series_id, episode_id, category_id, genre_id, is_kids,
 action, play_dur_sec, video_dur_sec, complete_rate, is_finish, first_frame_ms, stall_ms, event_time, event_date)
SELECT
    log_id,
    mac, userid, device_type, series_id, episode_id, NULL, NULL, 0,
    action, play_dur_sec, video_dur_sec,
    CASE WHEN video_dur_sec > 0 THEN ROUND(play_dur_sec / video_dur_sec * 100, 2) ELSE 0 END,
    is_finish, first_frame_ms, stall_ms, event_time, event_date
FROM ods_log_vod_di;

INSERT INTO dws_content_series_play_1d
(snapshot_date, series_id, category_id, genre_id, is_kids, vv, uv, play_dur, finish_cnt, complete_rate_avg, etl_batch_id)
SELECT
    event_date,
    series_id,
    NULL, NULL, 0,
    COUNT(*),
    COUNT(DISTINCT mac),
    IFNULL(SUM(play_dur_sec), 0),
    IFNULL(SUM(CASE WHEN is_finish = 1 THEN 1 ELSE 0 END), 0),
    IFNULL(AVG(complete_rate), 0),
    'BROKEN_VOD'
FROM dwd_vod_play_di
WHERE series_id IS NOT NULL
GROUP BY event_date, series_id;
