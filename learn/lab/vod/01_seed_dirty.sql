USE learn_lab_vod;

TRUNCATE TABLE lab_dq_result;
TRUNCATE TABLE dws_content_series_play_1d;
TRUNCATE TABLE dwd_vod_play_di;
TRUNCATE TABLE ods_log_vod_di;
DELETE FROM dim_content_series;

INSERT INTO dim_content_series (series_id, series_name) VALUES
('S001', '都市示例剧'),
('S002', '少儿示例片');

-- 业务日 2026-07-15；含脏：空 mac、is_finish 非法、测试号、重复播放、未知剧集
INSERT INTO ods_log_vod_di
(mac, userid, device_type, series_id, episode_id, action, pos_sec, play_dur_sec, video_dur_sec,
 is_finish, first_frame_ms, stall_ms, event_time, event_date) VALUES
('AA:BB:CC:01', 'U001', 'STB', 'S001', 'E001', 'play', 0, 2400, 2700, 1, 800, 0, '2026-07-15 20:00:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'S001', 'E002', 'play', 0, 600, 2700, 0, 900, 100, '2026-07-15 21:00:00', '2026-07-15'),
('AA:BB:CC:02', 'U002', 'STB', 'S001', 'E001', 'play', 0, 2500, 2700, 1, 700, 0, '2026-07-15 19:00:00', '2026-07-15'),
('AA:BB:CC:03', 'U003', 'Speaker', 'S002', 'E010', 'play', 0, 1800, 1800, 1, 600, 0, '2026-07-15 18:00:00', '2026-07-15'),
(NULL, 'U999', 'STB', 'S001', 'E001', 'play', 0, 100, 2700, 0, 0, 0, '2026-07-15 12:00:00', '2026-07-15'),
('AA:BB:CC:02', 'U002', 'STB', 'S001', 'E001', 'play', 0, 100, 2700, 9, 0, 0, '2026-07-15 12:30:00', '2026-07-15'),
('TESTMAC', 'TEST', 'STB', 'S001', 'E001', 'play', 0, 2700, 2700, 1, 0, 0, '2026-07-15 13:00:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'S001', 'E001', 'play', 0, 2400, 2700, 1, 800, 0, '2026-07-15 20:00:00', '2026-07-15'),
('AA:BB:CC:09', 'U009', 'STB', 'S999', 'E999', 'play', 0, 100, 100, 1, 0, 0, '2026-07-15 14:00:00', '2026-07-15');
