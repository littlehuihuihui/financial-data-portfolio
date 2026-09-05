-- 点播完播率靶场 · 列对齐 ott_ddl.sql（ods_log_vod_di / dwd_vod_play_di / dws_content_series_play_1d）
-- ADS 视图 v_vod_finish_rate 为教材拟新增形态（04_ott_ads_views.sql 中尚无同名视图）
CREATE DATABASE IF NOT EXISTS learn_lab_vod
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learn_lab_vod;

DROP VIEW IF EXISTS v_vod_finish_rate;
DROP TABLE IF EXISTS dws_content_series_play_1d;
DROP TABLE IF EXISTS dwd_vod_play_di;
DROP TABLE IF EXISTS ods_log_vod_di;
DROP TABLE IF EXISTS dim_content_series;
DROP TABLE IF EXISTS lab_dq_result;

CREATE TABLE dim_content_series (
    series_id VARCHAR(20) PRIMARY KEY,
    series_name VARCHAR(80) NOT NULL DEFAULT '未知'
) COMMENT 'LAB·剧集维（精简）';

CREATE TABLE ods_log_vod_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mac VARCHAR(32) NULL,
    userid VARCHAR(32),
    device_type VARCHAR(10),
    series_id VARCHAR(20),
    episode_id VARCHAR(20),
    action VARCHAR(20) COMMENT 'play/pause/ff/rewind/seek/stop',
    pos_sec INT,
    play_dur_sec INT,
    video_dur_sec INT,
    is_finish TINYINT(1),
    first_frame_ms INT,
    stall_ms INT,
    event_time DATETIME,
    event_date DATE,
    KEY idx_series (series_id),
    KEY idx_mac_date (mac, event_date)
) COMMENT 'LAB·ODS点播日志·列对齐 ott_ddl';

CREATE TABLE dwd_vod_play_di (
    play_id BIGINT PRIMARY KEY,
    mac VARCHAR(32),
    userid VARCHAR(32),
    device_type VARCHAR(10),
    series_id VARCHAR(20),
    episode_id VARCHAR(20),
    category_id VARCHAR(10),
    genre_id VARCHAR(10),
    is_kids TINYINT(1),
    action VARCHAR(20),
    play_dur_sec INT,
    video_dur_sec INT,
    complete_rate DECIMAL(5,2) COMMENT '播放完成度%',
    is_finish TINYINT(1),
    first_frame_ms INT,
    stall_ms INT,
    event_time DATETIME,
    event_date DATE,
    KEY idx_series_date (series_id, event_date)
) COMMENT 'LAB·DWD点播·粒度=一次播放';

CREATE TABLE dws_content_series_play_1d (
    snapshot_date DATE NOT NULL,
    series_id VARCHAR(20) NOT NULL,
    category_id VARCHAR(10),
    genre_id VARCHAR(10),
    is_kids TINYINT(1),
    vv INT NOT NULL DEFAULT 0,
    uv INT NOT NULL DEFAULT 0,
    play_dur INT NOT NULL DEFAULT 0,
    finish_cnt INT NOT NULL DEFAULT 0,
    complete_rate_avg DECIMAL(5,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, series_id)
) COMMENT 'LAB·DWS剧集日播放·对齐 ott_ddl';

-- 教材拟新增 ADS（非 04 文件现网对象）
CREATE OR REPLACE VIEW v_vod_finish_rate AS
SELECT
    snapshot_date,
    series_id,
    vv,
    finish_cnt,
    ROUND(finish_cnt / NULLIF(vv, 0) * 100, 2) AS finish_rate_pct
FROM dws_content_series_play_1d;

CREATE TABLE lab_dq_result (
    check_id VARCHAR(64) PRIMARY KEY,
    check_name VARCHAR(128) NOT NULL,
    passed TINYINT(1) NOT NULL,
    detail VARCHAR(512) NOT NULL,
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
