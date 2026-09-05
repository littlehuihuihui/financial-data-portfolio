-- 脏数据注入（故意制造：空 mac、未来时间、重复业务键、测试流量）
USE learn_lab_dau;

TRUNCATE TABLE lab_dq_result;
TRUNCATE TABLE dws_act_user_active_1d;
TRUNCATE TABLE dwd_act_launcher_di;
TRUNCATE TABLE ods_log_launcher_di;
DELETE FROM dim_device;

INSERT INTO dim_device (mac, device_type_id, region_id, device_status) VALUES
('AA:BB:CC:01', 'DT1', 'GZ', '活跃'),
('AA:BB:CC:02', 'DT1', 'SZ', '活跃'),
('AA:BB:CC:03', 'DT2', 'GZ', '活跃');

-- 业务日固定为 2026-07-15（与 seed_ott LOG_DAYS 末日本身同风格的演示日）
INSERT INTO ods_log_launcher_di
(mac, userid, device_type, region_id, fw_version, action, event_time, event_date) VALUES
('AA:BB:CC:01', 'U001', 'STB', 'GZ', 'v3.0.1', 'boot',   '2026-07-15 08:01:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'GZ', 'v3.0.1', 'home',   '2026-07-15 08:02:00', '2026-07-15'),
('AA:BB:CC:02', 'U002', 'STB', 'SZ', 'v2.1.0', 'boot',   '2026-07-15 09:10:00', '2026-07-15'),
('AA:BB:CC:03', 'U003', 'Speaker', 'GZ', 'v1.2.0', 'boot','2026-07-15 10:00:00', '2026-07-15'),
-- 脏：mac 为空
(NULL,          'U999', 'STB', 'GZ', 'v3.0.1', 'boot',   '2026-07-15 11:00:00', '2026-07-15'),
-- 脏：未来事件时间
('AA:BB:CC:02', 'U002', 'STB', 'SZ', 'v2.1.0', 'click',  '2099-01-01 00:00:00', '2099-01-01'),
-- 脏：测试账号标记（用 action=search + userid 约定，靶场规则见 04_etl_fixed）
('TESTMAC0001', 'TEST', 'STB', 'GZ', 'v3.0.1', 'boot',   '2026-07-15 12:00:00', '2026-07-15'),
-- 脏：同 log 语义重复（两行相同 mac+event_time+action，模拟重放）
('AA:BB:CC:01', 'U001', 'STB', 'GZ', 'v3.0.1', 'boot',   '2026-07-15 08:01:00', '2026-07-15');
