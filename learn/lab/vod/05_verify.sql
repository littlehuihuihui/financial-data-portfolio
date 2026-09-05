USE learn_lab_vod;

SELECT 'dwd_rows' AS k, COUNT(*) AS v FROM dwd_vod_play_di
UNION ALL
SELECT 'series_rows', COUNT(*) FROM dws_content_series_play_1d WHERE snapshot_date='2026-07-15'
UNION ALL
SELECT 's001_vv', vv FROM dws_content_series_play_1d WHERE snapshot_date='2026-07-15' AND series_id='S001'
UNION ALL
SELECT 's001_finish', finish_cnt FROM dws_content_series_play_1d WHERE snapshot_date='2026-07-15' AND series_id='S001';

SELECT * FROM v_vod_finish_rate WHERE snapshot_date='2026-07-15' ORDER BY series_id;

-- 期望：dwd 合法播放 4 行（S001 三条去重后 3 + S002 一条）；S001 vv=3 finish=2 → 约 66.67%
