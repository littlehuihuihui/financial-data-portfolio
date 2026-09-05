-- =============================================================================
-- 教材靶场 · 日活链路（独立库，不污染 internet_analytics）
-- 字段对齐：portfolio/industries/internet/database/ott_ddl.sql
-- ADS 对齐：portfolio/industries/internet/database/04_ott_ads_views.sql
-- =============================================================================
CREATE DATABASE IF NOT EXISTS learn_lab_dau
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learn_lab_dau;

DROP VIEW IF EXISTS v_dau_overview;
DROP TABLE IF EXISTS dws_act_user_active_1d;
DROP TABLE IF EXISTS dwd_act_launcher_di;
DROP TABLE IF EXISTS ods_log_launcher_di;
DROP TABLE IF EXISTS dim_device;
DROP TABLE IF EXISTS lab_dq_result;

-- 精简版 dim_device（列子集取自 ott_ddl.sql COMMENT）
CREATE TABLE dim_device (
    mac              VARCHAR(32) PRIMARY KEY COMMENT '设备物理唯一标识',
    device_type_id   VARCHAR(10) NOT NULL DEFAULT '-1',
    region_id        VARCHAR(10) NOT NULL DEFAULT '-1',
    device_status    VARCHAR(20) NOT NULL DEFAULT '活跃'
) COMMENT 'LAB·DIM设备（列对齐 ott_ddl dim_device，非全量雪花）';

CREATE TABLE ods_log_launcher_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mac VARCHAR(32) NULL,
    userid VARCHAR(32),
    device_type VARCHAR(10),
    region_id VARCHAR(10),
    fw_version VARCHAR(20),
    action VARCHAR(20) COMMENT 'boot/home/click/search',
    event_time DATETIME,
    event_date DATE,
    KEY idx_mac_date (mac, event_date)
) COMMENT 'LAB·ODS开机日志·列对齐 ott_ddl';

CREATE TABLE dwd_act_launcher_di (
    log_id BIGINT PRIMARY KEY,
    mac VARCHAR(32),
    userid VARCHAR(32),
    device_type VARCHAR(10),
    region_id VARCHAR(10),
    action VARCHAR(20),
    event_time DATETIME,
    event_date DATE,
    KEY idx_mac_date (mac, event_date)
) COMMENT 'LAB·DWD开机事实·粒度=一次开机行为';

CREATE TABLE dws_act_user_active_1d (
    snapshot_date DATE NOT NULL,
    mac VARCHAR(32) NOT NULL,
    userid VARCHAR(32),
    device_type VARCHAR(10),
    region_id VARCHAR(10),
    is_only_launcher TINYINT(1) NOT NULL DEFAULT 1,
    is_vod_active TINYINT(1) NOT NULL DEFAULT 0,
    is_live_active TINYINT(1) NOT NULL DEFAULT 0,
    launcher_cnt INT NOT NULL DEFAULT 0,
    vod_play_cnt INT NOT NULL DEFAULT 0,
    vod_play_dur INT NOT NULL DEFAULT 0,
    live_play_dur INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, mac)
) COMMENT 'LAB·DWS用户日活跃·mac粒度·列对齐 ott_ddl';

CREATE OR REPLACE VIEW v_dau_overview AS
SELECT
    snapshot_date,
    COUNT(DISTINCT mac) AS total_dau,
    COUNT(DISTINCT CASE WHEN device_type = 'STB' THEN mac END) AS dau_stb,
    COUNT(DISTINCT CASE WHEN device_type = 'Speaker' THEN mac END) AS dau_speaker,
    SUM(is_vod_active) AS vod_active,
    SUM(is_live_active) AS live_active,
    SUM(is_only_launcher) AS only_launcher
FROM dws_act_user_active_1d
GROUP BY snapshot_date
ORDER BY snapshot_date;

CREATE TABLE lab_dq_result (
    check_id VARCHAR(64) PRIMARY KEY,
    check_name VARCHAR(128) NOT NULL,
    passed TINYINT(1) NOT NULL,
    detail VARCHAR(512) NOT NULL,
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) COMMENT 'LAB·DQ结果登记';
