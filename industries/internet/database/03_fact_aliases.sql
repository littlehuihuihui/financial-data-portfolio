-- 跨行业命名一致性：fact_* 为规范事实表名
-- 互联网现网仍以 dwd_*_wide 物理存储；提供 fact_* 同义视图供统一查询
USE internet_analytics;

CREATE OR REPLACE VIEW fact_device_operation AS
SELECT * FROM dwd_device_operation_wide;

CREATE OR REPLACE VIEW fact_user AS
SELECT * FROM dwd_user_wide;

CREATE OR REPLACE VIEW fact_session AS
SELECT * FROM dwd_session_wide;
