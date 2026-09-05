USE learn_lab_funnel;

TRUNCATE TABLE lab_dq_result;
TRUNCATE TABLE dws_trade_cashier_funnel_1d;
TRUNCATE TABLE dwd_trade_cashier_di;
TRUNCATE TABLE ods_log_cashier_di;

INSERT INTO ods_log_cashier_di
(mac, userid, device_type, funnel_step, src_type, series_id, fee, pay_type, event_time, event_date) VALUES
('AA:BB:CC:01', 'U001', 'STB', 'expose',  'video', 'S001', NULL, NULL, '2026-07-15 10:00:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'click',   'video', 'S001', NULL, NULL, '2026-07-15 10:01:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'verify',  'video', 'S001', 12.00, '连续包月', '2026-07-15 10:02:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'confirm', 'video', 'S001', 12.00, '连续包月', '2026-07-15 10:03:00', '2026-07-15'),
('AA:BB:CC:02', 'U002', 'STB', 'expose',  'launcher', 'S002', NULL, NULL, '2026-07-15 11:00:00', '2026-07-15'),
('AA:BB:CC:02', 'U002', 'STB', 'click',   'launcher', 'S002', NULL, NULL, '2026-07-15 11:01:00', '2026-07-15'),
('AA:BB:CC:03', 'U003', 'Speaker', 'expose', 'video', 'S001', NULL, NULL, '2026-07-15 12:00:00', '2026-07-15'),
-- 脏
(NULL, 'U999', 'STB', 'expose', 'video', 'S001', NULL, NULL, '2026-07-15 13:00:00', '2026-07-15'),
('AA:BB:CC:02', 'U002', 'STB', 'hack', 'launcher', 'S002', NULL, NULL, '2026-07-15 11:02:00', '2026-07-15'),
('TESTMAC', 'TEST', 'STB', 'expose', 'video', 'S001', NULL, NULL, '2026-07-15 14:00:00', '2026-07-15'),
('AA:BB:CC:01', 'U001', 'STB', 'expose', 'video', 'S001', NULL, NULL, '2026-07-15 10:00:00', '2026-07-15');
