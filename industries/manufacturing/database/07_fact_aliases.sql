-- 跨行业命名一致性：fact_* 为规范事实表名
-- 制造现网仍以 dwd_*_wide 物理存储；提供 fact_* 同义视图
USE manufacturing_analytics;

CREATE OR REPLACE VIEW fact_production AS
SELECT * FROM dwd_production_wide;

CREATE OR REPLACE VIEW fact_quality AS
SELECT * FROM dwd_quality_wide;

CREATE OR REPLACE VIEW fact_supply AS
SELECT * FROM dwd_supply_wide;
