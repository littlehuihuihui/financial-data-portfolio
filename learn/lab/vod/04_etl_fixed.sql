USE learn_lab_vod;

TRUNCATE TABLE dwd_vod_play_di;
TRUNCATE TABLE dws_content_series_play_1d;

INSERT INTO dwd_vod_play_di
(play_id, mac, userid, device_type, series_id, episode_id, category_id, genre_id, is_kids,
 action, play_dur_sec, video_dur_sec, complete_rate, is_finish, first_frame_ms, stall_ms, event_time, event_date)
SELECT
    play_id, mac, userid, device_type, series_id, episode_id, category_id, genre_id, is_kids,
    action, play_dur_sec, video_dur_sec, complete_rate, is_finish, first_frame_ms, stall_ms, event_time, event_date
FROM (
    SELECT
        o.log_id AS play_id,
        o.mac, o.userid, o.device_type, o.series_id, o.episode_id,
        CAST(NULL AS CHAR) AS category_id,
        CAST(NULL AS CHAR) AS genre_id,
        0 AS is_kids,
        o.action, o.play_dur_sec, o.video_dur_sec,
        CASE WHEN o.video_dur_sec > 0 THEN ROUND(o.play_dur_sec / o.video_dur_sec * 100, 2) ELSE 0 END AS complete_rate,
        o.is_finish, o.first_frame_ms, o.stall_ms, o.event_time, o.event_date,
        ROW_NUMBER() OVER (
            PARTITION BY o.mac, o.series_id, o.episode_id, o.event_time, o.action
            ORDER BY o.log_id
        ) AS rn
    FROM ods_log_vod_di o
    INNER JOIN dim_content_series s ON o.series_id = s.series_id
    WHERE o.mac IS NOT NULL AND o.mac <> ''
      AND o.userid <> 'TEST'
      AND o.event_date = '2026-07-15'
      AND o.is_finish IN (0, 1)
      AND o.action = 'play'
) t
WHERE t.rn = 1;

INSERT INTO dws_content_series_play_1d
(snapshot_date, series_id, category_id, genre_id, is_kids, vv, uv, play_dur, finish_cnt, complete_rate_avg, etl_batch_id)
SELECT
    event_date,
    series_id,
    MAX(category_id), MAX(genre_id), MAX(is_kids),
    COUNT(*) AS vv,
    COUNT(DISTINCT mac) AS uv,
    IFNULL(SUM(play_dur_sec), 0),
    IFNULL(SUM(CASE WHEN is_finish = 1 THEN 1 ELSE 0 END), 0),
    IFNULL(AVG(complete_rate), 0),
    'FIXED_VOD_20260715'
FROM dwd_vod_play_di
WHERE event_date = '2026-07-15'
GROUP BY event_date, series_id;
