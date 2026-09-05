-- 收银漏斗靶场 · 列对齐 ott_ddl.sql
-- ADS v_cashier_funnel_day 为日粒度教学视图；现网 v_funnel 为月聚合（04_ott_ads_views.sql）
CREATE DATABASE IF NOT EXISTS learn_lab_funnel
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learn_lab_funnel;

DROP VIEW IF EXISTS v_cashier_funnel_day;
DROP TABLE IF EXISTS dws_trade_cashier_funnel_1d;
DROP TABLE IF EXISTS dwd_trade_cashier_di;
DROP TABLE IF EXISTS ods_log_cashier_di;
DROP TABLE IF EXISTS lab_dq_result;

CREATE TABLE ods_log_cashier_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mac VARCHAR(32) NULL,
    userid VARCHAR(32),
    device_type VARCHAR(10),
    funnel_step VARCHAR(20) COMMENT 'expose/click/verify/confirm',
    src_type VARCHAR(20) COMMENT 'video/launcher',
    series_id VARCHAR(20),
    fee DECIMAL(10,2),
    pay_type VARCHAR(20),
    event_time DATETIME,
    event_date DATE,
    KEY idx_step_date (funnel_step, event_date)
) COMMENT 'LAB·ODS收银台·对齐 ott_ddl';

CREATE TABLE dwd_trade_cashier_di (
    log_id BIGINT PRIMARY KEY,
    mac VARCHAR(32),
    userid VARCHAR(32),
    device_type VARCHAR(10),
    funnel_step VARCHAR(20),
    src_type VARCHAR(20),
    series_id VARCHAR(20),
    fee DECIMAL(10,2),
    pay_type VARCHAR(20),
    event_time DATETIME,
    event_date DATE,
    KEY idx_step_date (funnel_step, event_date)
) COMMENT 'LAB·DWD收银·粒度=一次埋点';

CREATE TABLE dws_trade_cashier_funnel_1d (
    snapshot_date DATE NOT NULL,
    device_type VARCHAR(10) NOT NULL DEFAULT 'ALL',
    src_type VARCHAR(20) NOT NULL DEFAULT 'ALL',
    expose_cnt INT NOT NULL DEFAULT 0,
    click_cnt INT NOT NULL DEFAULT 0,
    verify_cnt INT NOT NULL DEFAULT 0,
    confirm_cnt INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, device_type, src_type)
) COMMENT 'LAB·DWS漏斗日汇总·对齐 ott_ddl';

CREATE OR REPLACE VIEW v_cashier_funnel_day AS
SELECT
    snapshot_date,
    device_type,
    src_type,
    expose_cnt,
    click_cnt,
    verify_cnt,
    confirm_cnt,
    ROUND(click_cnt / NULLIF(expose_cnt, 0) * 100, 2) AS click_rate,
    ROUND(confirm_cnt / NULLIF(expose_cnt, 0) * 100, 2) AS confirm_rate
FROM dws_trade_cashier_funnel_1d;

CREATE TABLE lab_dq_result (
    check_id VARCHAR(64) PRIMARY KEY,
    check_name VARCHAR(128) NOT NULL,
    passed TINYINT(1) NOT NULL,
    detail VARCHAR(512) NOT NULL,
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
