-- 验收：修复后期望 DAU=3（三台合法设备）
USE learn_lab_dau;

SELECT 'ods_rows' AS k, COUNT(*) AS v FROM ods_log_launcher_di
UNION ALL
SELECT 'dwd_rows', COUNT(*) FROM dwd_act_launcher_di
UNION ALL
SELECT 'dws_mac', COUNT(*) FROM dws_act_user_active_1d WHERE snapshot_date='2026-07-15'
UNION ALL
SELECT 'ads_dau', total_dau FROM v_dau_overview WHERE snapshot_date='2026-07-15';

-- 期望参考（跑通 04+03 后）：
-- ods_rows = 8（含脏数据）
-- dwd_rows = 4（01 boot, 01 home, 02 boot, 03 boot；重复 boot 去掉）
-- dws_mac = 3
-- ads_dau = 3
