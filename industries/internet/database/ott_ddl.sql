-- ============================================================================
-- 广东移动 OTT 大屏视频平台 · 活跃分析数仓（雪花模型 · OneData 规范）
-- 库：internet_analytics（改造复用）
-- 分层：ODS 贴源 / DIM 雪花维度 / DWD 明细事实 / DWS 汇总 / fact_ 同义视图
-- 北极星：有效MAU（当月有日志上报去重MAC，STB/Speaker/合计）
-- ============================================================================
CREATE DATABASE IF NOT EXISTS internet_analytics DEFAULT CHARSET utf8mb4;
USE internet_analytics;

-- ---------- 清理旧模型（原互联网通用看板对象）与旧 OTT 对象，保证可重复执行 ----------
DROP VIEW IF EXISTS v_dau_overview;
DROP VIEW IF EXISTS v_user_portrait;
DROP VIEW IF EXISTS v_user_retention;
DROP VIEW IF EXISTS v_user_lifecycle;
DROP VIEW IF EXISTS v_channel_analysis;
DROP VIEW IF EXISTS v_funnel;
DROP VIEW IF EXISTS v_ltv;
DROP VIEW IF EXISTS v_rfm;
DROP VIEW IF EXISTS ods_user_event;
DROP VIEW IF EXISTS ods_channel;
DROP VIEW IF EXISTS ods_subscription;
DROP VIEW IF EXISTS dwd_event_wide;
DROP VIEW IF EXISTS fact_vod_play;
DROP VIEW IF EXISTS fact_live_play;
DROP VIEW IF EXISTS fact_cashier;

-- 雪花维度（子维在前，先删事实/引用再删被引用；此处无 FK 约束，直接顺序删）
DROP TABLE IF EXISTS dws_act_user_active_1d;
DROP TABLE IF EXISTS dws_content_series_play_1d;
DROP TABLE IF EXISTS dws_content_episode_play_1d;
DROP TABLE IF EXISTS dws_content_live_play_1d;
DROP TABLE IF EXISTS dws_trade_cashier_funnel_1d;
DROP TABLE IF EXISTS dws_trade_order_1d;
DROP TABLE IF EXISTS dws_user_lifecycle_1d;
DROP TABLE IF EXISTS dws_user_retention_1d;
DROP TABLE IF EXISTS dwd_act_launcher_di;
DROP TABLE IF EXISTS dwd_vod_play_di;
DROP TABLE IF EXISTS dwd_live_play_di;
DROP TABLE IF EXISTS dwd_trade_cashier_di;
DROP TABLE IF EXISTS dwd_trade_order_di;
DROP TABLE IF EXISTS dwd_user_status_di;
DROP TABLE IF EXISTS ods_log_launcher_di;
DROP TABLE IF EXISTS ods_log_vod_di;
DROP TABLE IF EXISTS ods_log_live_di;
DROP TABLE IF EXISTS ods_log_cashier_di;
DROP TABLE IF EXISTS ods_user_register_di;
DROP TABLE IF EXISTS ods_user_unsubscribe_di;
DROP TABLE IF EXISTS ods_order_di;
DROP TABLE IF EXISTS ods_content_series_df;
DROP TABLE IF EXISTS ods_content_episode_df;
DROP TABLE IF EXISTS ods_live_channel_df;
DROP TABLE IF EXISTS ods_device_info_df;
DROP TABLE IF EXISTS dim_content_episode;
DROP TABLE IF EXISTS dim_content_series;
DROP TABLE IF EXISTS dim_content_category;
DROP TABLE IF EXISTS dim_content_genre;
DROP TABLE IF EXISTS dim_content_cp;
DROP TABLE IF EXISTS dim_live_channel;
DROP TABLE IF EXISTS dim_channel_category;
DROP TABLE IF EXISTS dim_device;
DROP TABLE IF EXISTS dim_device_model;
DROP TABLE IF EXISTS dim_device_type;
DROP TABLE IF EXISTS dim_firmware;
DROP TABLE IF EXISTS dim_user;
DROP TABLE IF EXISTS dim_user_package;
DROP TABLE IF EXISTS dim_region;
DROP TABLE IF EXISTS dim_province;
DROP TABLE IF EXISTS dim_date;
DROP TABLE IF EXISTS dim_week;
DROP TABLE IF EXISTS dim_month;

-- ======================== DIM · 雪花维度 ========================
CREATE TABLE dim_province (
    province_id   VARCHAR(10)  PRIMARY KEY COMMENT '省份编码',
    province_name VARCHAR(20)  NOT NULL DEFAULT '广东'
) COMMENT 'DIM·省份（雪花上级维）';

CREATE TABLE dim_region (
    region_id     VARCHAR(10)  PRIMARY KEY COMMENT '地市编码',
    region_name   VARCHAR(30)  NOT NULL DEFAULT '未知',
    province_id   VARCHAR(10)  NOT NULL DEFAULT 'GD' COMMENT '上级省份·雪花外键',
    region_level  VARCHAR(10)  NOT NULL DEFAULT '地市'
) COMMENT 'DIM·地市（雪花，挂 dim_province）';

CREATE TABLE dim_content_genre (
    genre_id      VARCHAR(10)  PRIMARY KEY COMMENT '题材编码',
    genre_name    VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '题材：都市/古装/悬疑/亲子/科普等'
) COMMENT 'DIM·题材（雪花末级）';

CREATE TABLE dim_content_category (
    category_id   VARCHAR(10)  PRIMARY KEY COMMENT '内容类型编码',
    category_name VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '影视/综艺/动漫',
    media_type    VARCHAR(10)  NOT NULL DEFAULT 'vod' COMMENT '点播/直播'
) COMMENT 'DIM·内容类型';

CREATE TABLE dim_content_cp (
    cp_id         VARCHAR(10)  PRIMARY KEY COMMENT 'CP/版权方编码',
    cp_name       VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '爱奇艺/自制/第三方',
    cp_type       VARCHAR(20)  NOT NULL DEFAULT '第三方'
) COMMENT 'DIM·内容提供方';

CREATE TABLE dim_content_series (
    series_id     VARCHAR(20)  PRIMARY KEY COMMENT '剧集编码',
    series_name   VARCHAR(80)  NOT NULL DEFAULT '未知',
    category_id   VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '内容类型·雪花外键',
    genre_id      VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '题材·雪花外键',
    cp_id         VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT 'CP·雪花外键',
    total_episodes INT         NOT NULL DEFAULT 1 COMMENT '总集数',
    is_kids       TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否幼儿动漫',
    release_year  INT          NOT NULL DEFAULT 2024,
    series_status VARCHAR(20)  NOT NULL DEFAULT '上架'
) COMMENT 'DIM·剧集（雪花，挂 category/genre/cp）';

CREATE TABLE dim_content_episode (
    episode_id    VARCHAR(20)  PRIMARY KEY COMMENT '单集编码',
    series_id     VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '所属剧集·雪花外键',
    episode_no    INT          NOT NULL DEFAULT 1 COMMENT '第几集',
    episode_name  VARCHAR(80)  NOT NULL DEFAULT '未知',
    duration_sec  INT          NOT NULL DEFAULT 0 COMMENT '单集时长秒'
) COMMENT 'DIM·单集（雪花，挂 series）';

CREATE TABLE dim_channel_category (
    channel_cat_id   VARCHAR(10) PRIMARY KEY COMMENT '频道大类编码',
    channel_cat_name VARCHAR(30) NOT NULL DEFAULT '未知' COMMENT '少儿/卫视/影视/新闻'
) COMMENT 'DIM·直播频道大类';

CREATE TABLE dim_live_channel (
    channel_id       VARCHAR(20) PRIMARY KEY COMMENT '频道编码',
    channel_name     VARCHAR(40) NOT NULL DEFAULT '未知',
    channel_cat_id   VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '频道大类·雪花外键'
) COMMENT 'DIM·直播频道（雪花，挂 channel_category）';

CREATE TABLE dim_device_type (
    device_type_id   VARCHAR(10) PRIMARY KEY COMMENT '端类型编码',
    device_type_name VARCHAR(20) NOT NULL DEFAULT '未知' COMMENT 'STB/Speaker'
) COMMENT 'DIM·端类型';

CREATE TABLE dim_device_model (
    model_id         VARCHAR(20) PRIMARY KEY COMMENT '型号编码',
    model_name       VARCHAR(40) NOT NULL DEFAULT '未知',
    device_type_id   VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '端类型·雪花外键'
) COMMENT 'DIM·设备型号（雪花，挂 device_type）';

CREATE TABLE dim_firmware (
    fw_id            VARCHAR(20) PRIMARY KEY COMMENT '固件编码',
    fw_version       VARCHAR(20) NOT NULL DEFAULT '未知'
) COMMENT 'DIM·固件版本';

CREATE TABLE dim_device (
    mac              VARCHAR(32) PRIMARY KEY COMMENT '设备物理唯一标识',
    model_id         VARCHAR(20) NOT NULL DEFAULT '-1' COMMENT '型号·雪花外键',
    fw_id            VARCHAR(20) NOT NULL DEFAULT '-1' COMMENT '固件·雪花外键',
    region_id        VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '地市·雪花外键',
    device_type_id   VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '端类型（冗余便于聚合）',
    first_active_date DATE       NULL COMMENT '首次激活日',
    device_status    VARCHAR(20) NOT NULL DEFAULT '活跃'
) COMMENT 'DIM·设备（雪花，挂 model/firmware/region）';

CREATE TABLE dim_user_package (
    pkg_id           VARCHAR(10) PRIMARY KEY COMMENT '套餐编码',
    pkg_name         VARCHAR(40) NOT NULL DEFAULT '未知',
    pkg_price        DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '月费元',
    pay_cycle        VARCHAR(20) NOT NULL DEFAULT '单月' COMMENT '连续包月/单月/包年'
) COMMENT 'DIM·套餐';

CREATE TABLE dim_user (
    userid           VARCHAR(32) PRIMARY KEY COMMENT '用户账号',
    phone            VARCHAR(20) NOT NULL DEFAULT '' COMMENT '手机号',
    region_id        VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '地市·雪花外键',
    pkg_id           VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '套餐·雪花外键',
    register_date    DATE        NULL COMMENT '开户日',
    user_status      VARCHAR(20) NOT NULL DEFAULT '正常' COMMENT '正常/销户'
) COMMENT 'DIM·用户（雪花，挂 region/package）';

CREATE TABLE dim_month (
    month_id     VARCHAR(7) PRIMARY KEY COMMENT 'YYYY-MM',
    year_num     INT NOT NULL DEFAULT 0,
    month_num    INT NOT NULL DEFAULT 0,
    month_label  VARCHAR(10) NOT NULL DEFAULT ''
) COMMENT 'DIM·月（雪花上级）';

CREATE TABLE dim_week (
    week_id      VARCHAR(10) PRIMARY KEY COMMENT 'YYYY-Www',
    week_start   DATE NOT NULL,
    week_end     DATE NOT NULL,
    year_num     INT NOT NULL DEFAULT 0,
    week_of_year INT NOT NULL DEFAULT 0
) COMMENT 'DIM·周（雪花上级）';

CREATE TABLE dim_date (
    date_id      DATE PRIMARY KEY,
    week_id      VARCHAR(10) NOT NULL DEFAULT '' COMMENT '周·雪花外键',
    month_id     VARCHAR(7)  NOT NULL DEFAULT '' COMMENT '月·雪花外键',
    year_num     INT NOT NULL DEFAULT 0,
    month_num    INT NOT NULL DEFAULT 0,
    day_num      INT NOT NULL DEFAULT 0,
    weekday      INT NOT NULL DEFAULT 0,
    is_weekend   TINYINT(1) NOT NULL DEFAULT 0
) COMMENT 'DIM·日期（雪花，挂 week/month）';

-- ======================== ODS · 贴源 ========================
CREATE TABLE ods_device_info_df (
    mac VARCHAR(32) PRIMARY KEY, model_name VARCHAR(40), device_type VARCHAR(10),
    fw_version VARCHAR(20), region_id VARCHAR(10), first_active_date DATE, etl_batch_id VARCHAR(32)
) COMMENT 'ODS·设备信息·全量';

CREATE TABLE ods_content_series_df (
    series_id VARCHAR(20) PRIMARY KEY, series_name VARCHAR(80), category_name VARCHAR(30),
    genre_name VARCHAR(30), cp_name VARCHAR(40), total_episodes INT, is_kids TINYINT(1),
    release_year INT, etl_batch_id VARCHAR(32)
) COMMENT 'ODS·剧集元数据·全量';

CREATE TABLE ods_content_episode_df (
    episode_id VARCHAR(20) PRIMARY KEY, series_id VARCHAR(20), episode_no INT,
    episode_name VARCHAR(80), duration_sec INT, etl_batch_id VARCHAR(32)
) COMMENT 'ODS·单集元数据·全量';

CREATE TABLE ods_live_channel_df (
    channel_id VARCHAR(20) PRIMARY KEY, channel_name VARCHAR(40), channel_cat_name VARCHAR(30),
    etl_batch_id VARCHAR(32)
) COMMENT 'ODS·直播频道元数据·全量';

CREATE TABLE ods_log_launcher_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY, mac VARCHAR(32) NOT NULL, userid VARCHAR(32),
    device_type VARCHAR(10), region_id VARCHAR(10), fw_version VARCHAR(20),
    action VARCHAR(20) COMMENT 'boot/home/click/search',
    event_time DATETIME, event_date DATE, KEY idx_mac_date (mac, event_date)
) COMMENT 'ODS·开机日志·增量（近3天）';

CREATE TABLE ods_log_vod_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY, mac VARCHAR(32) NOT NULL, userid VARCHAR(32),
    device_type VARCHAR(10), series_id VARCHAR(20), episode_id VARCHAR(20),
    action VARCHAR(20) COMMENT 'play/pause/ff/rewind/seek/stop',
    pos_sec INT, play_dur_sec INT, video_dur_sec INT, is_finish TINYINT(1),
    first_frame_ms INT, stall_ms INT, event_time DATETIME, event_date DATE,
    KEY idx_mac_date (mac, event_date), KEY idx_series (series_id)
) COMMENT 'ODS·点播日志·增量（近3天，含action）';

CREATE TABLE ods_log_live_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY, mac VARCHAR(32) NOT NULL, userid VARCHAR(32),
    device_type VARCHAR(10), channel_id VARCHAR(20), action VARCHAR(20),
    play_dur_sec INT, event_time DATETIME, event_date DATE, KEY idx_mac_date (mac, event_date)
) COMMENT 'ODS·直播日志·增量（近3天）';

CREATE TABLE ods_log_cashier_di (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY, mac VARCHAR(32) NOT NULL, userid VARCHAR(32),
    device_type VARCHAR(10), funnel_step VARCHAR(20) COMMENT 'expose/click/verify/confirm',
    src_type VARCHAR(20) COMMENT 'video/launcher', series_id VARCHAR(20),
    fee DECIMAL(10,2), pay_type VARCHAR(20), event_time DATETIME, event_date DATE,
    KEY idx_step_date (funnel_step, event_date)
) COMMENT 'ODS·收银台日志·增量（近3天）';

CREATE TABLE ods_user_register_di (
    userid VARCHAR(32) PRIMARY KEY, phone VARCHAR(20), mac VARCHAR(32), region_id VARCHAR(10),
    pkg_id VARCHAR(10), register_time DATETIME, register_date DATE, etl_batch_id VARCHAR(32)
) COMMENT 'ODS·开户·增量';

CREATE TABLE ods_user_unsubscribe_di (
    unsub_id BIGINT AUTO_INCREMENT PRIMARY KEY, userid VARCHAR(32), phone VARCHAR(20), mac VARCHAR(32),
    unsub_time DATETIME, unsub_date DATE, reason VARCHAR(40), etl_batch_id VARCHAR(32),
    KEY idx_user (userid)
) COMMENT 'ODS·退订·增量';

CREATE TABLE ods_order_di (
    order_id VARCHAR(40) PRIMARY KEY, userid VARCHAR(32), mac VARCHAR(32),
    op_type VARCHAR(10) COMMENT 'order/unsub', src_type VARCHAR(20) COMMENT 'video/launcher',
    series_id VARCHAR(20), pay_type VARCHAR(20) COMMENT '连续包月/单月/包年',
    fee DECIMAL(10,2), op_time DATETIME, op_date DATE, etl_batch_id VARCHAR(32),
    KEY idx_optype_date (op_type, op_date)
) COMMENT 'ODS·订购/退订明细·增量';

-- ======================== DWD · 明细事实 ========================
CREATE TABLE dwd_act_launcher_di (
    log_id BIGINT PRIMARY KEY, mac VARCHAR(32), userid VARCHAR(32), device_type VARCHAR(10),
    region_id VARCHAR(10), action VARCHAR(20), event_time DATETIME, event_date DATE,
    KEY idx_mac_date (mac, event_date)
) COMMENT 'DWD·开机事实·粒度=一次开机行为（mac为主，userid变则记录变）';

CREATE TABLE dwd_vod_play_di (
    play_id BIGINT PRIMARY KEY, mac VARCHAR(32), userid VARCHAR(32), device_type VARCHAR(10),
    series_id VARCHAR(20), episode_id VARCHAR(20), category_id VARCHAR(10), genre_id VARCHAR(10),
    is_kids TINYINT(1), action VARCHAR(20), play_dur_sec INT, video_dur_sec INT,
    complete_rate DECIMAL(5,2) COMMENT '播放完成度%', is_finish TINYINT(1),
    first_frame_ms INT, stall_ms INT, event_time DATETIME, event_date DATE,
    KEY idx_series_date (series_id, event_date), KEY idx_mac_date (mac, event_date)
) COMMENT 'DWD·点播播放事实·粒度=一次播放';

CREATE TABLE dwd_live_play_di (
    play_id BIGINT PRIMARY KEY, mac VARCHAR(32), userid VARCHAR(32), device_type VARCHAR(10),
    channel_id VARCHAR(20), channel_cat_id VARCHAR(10), play_dur_sec INT,
    event_time DATETIME, event_date DATE, KEY idx_ch_date (channel_id, event_date)
) COMMENT 'DWD·直播播放事实·粒度=一次观看';

CREATE TABLE dwd_trade_cashier_di (
    log_id BIGINT PRIMARY KEY, mac VARCHAR(32), userid VARCHAR(32), device_type VARCHAR(10),
    funnel_step VARCHAR(20), src_type VARCHAR(20), series_id VARCHAR(20), fee DECIMAL(10,2),
    pay_type VARCHAR(20), event_time DATETIME, event_date DATE, KEY idx_step_date (funnel_step, event_date)
) COMMENT 'DWD·收银台漏斗事实·粒度=一次埋点';

CREATE TABLE dwd_trade_order_di (
    order_id VARCHAR(40) PRIMARY KEY, userid VARCHAR(32), mac VARCHAR(32), op_type VARCHAR(10),
    src_type VARCHAR(20), series_id VARCHAR(20), pay_type VARCHAR(20), fee DECIMAL(10,2),
    revenue_share DECIMAL(10,2) COMMENT '爱奇艺分成金额', op_time DATETIME, op_date DATE,
    KEY idx_optype_date (op_type, op_date)
) COMMENT 'DWD·订购/退订事实';

CREATE TABLE dwd_user_status_di (
    snapshot_date DATE NOT NULL, userid VARCHAR(32) NOT NULL, phone VARCHAR(20), mac VARCHAR(32),
    user_status VARCHAR(20) COMMENT 'active/silent/churned', register_date DATE,
    last_active_date DATE, days_since_active INT, etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, userid)
) COMMENT 'DWD·用户状态日快照·粒度=日×userid';

-- ======================== DWS · 汇总 ========================
CREATE TABLE dws_act_user_active_1d (
    snapshot_date DATE NOT NULL, mac VARCHAR(32) NOT NULL, userid VARCHAR(32),
    device_type VARCHAR(10), region_id VARCHAR(10),
    is_only_launcher TINYINT(1) NOT NULL DEFAULT 0 COMMENT '只开机用户',
    is_vod_active TINYINT(1) NOT NULL DEFAULT 0, is_live_active TINYINT(1) NOT NULL DEFAULT 0,
    launcher_cnt INT NOT NULL DEFAULT 0, vod_play_cnt INT NOT NULL DEFAULT 0,
    vod_play_dur INT NOT NULL DEFAULT 0, live_play_dur INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32), PRIMARY KEY (snapshot_date, mac),
    KEY idx_date_type (snapshot_date, device_type)
) COMMENT 'DWS·用户日活跃·mac粒度';

CREATE TABLE dws_content_series_play_1d (
    snapshot_date DATE NOT NULL, series_id VARCHAR(20) NOT NULL, category_id VARCHAR(10),
    genre_id VARCHAR(10), is_kids TINYINT(1), vv INT NOT NULL DEFAULT 0, uv INT NOT NULL DEFAULT 0,
    play_dur INT NOT NULL DEFAULT 0, finish_cnt INT NOT NULL DEFAULT 0,
    complete_rate_avg DECIMAL(5,2) NOT NULL DEFAULT 0, etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, series_id)
) COMMENT 'DWS·剧集日播放·series粒度';

CREATE TABLE dws_content_episode_play_1d (
    snapshot_date DATE NOT NULL, episode_id VARCHAR(20) NOT NULL, series_id VARCHAR(20),
    vv INT NOT NULL DEFAULT 0, uv INT NOT NULL DEFAULT 0, play_dur INT NOT NULL DEFAULT 0,
    finish_cnt INT NOT NULL DEFAULT 0, etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, episode_id)
) COMMENT 'DWS·单集日播放·episode粒度';

CREATE TABLE dws_content_live_play_1d (
    snapshot_date DATE NOT NULL, channel_id VARCHAR(20) NOT NULL, channel_cat_id VARCHAR(10),
    vv INT NOT NULL DEFAULT 0, uv INT NOT NULL DEFAULT 0, play_dur INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32), PRIMARY KEY (snapshot_date, channel_id)
) COMMENT 'DWS·直播频道日播放';

CREATE TABLE dws_trade_cashier_funnel_1d (
    snapshot_date DATE NOT NULL, device_type VARCHAR(10) NOT NULL DEFAULT 'ALL',
    src_type VARCHAR(20) NOT NULL DEFAULT 'ALL',
    expose_cnt INT NOT NULL DEFAULT 0, click_cnt INT NOT NULL DEFAULT 0,
    verify_cnt INT NOT NULL DEFAULT 0, confirm_cnt INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32), PRIMARY KEY (snapshot_date, device_type, src_type)
) COMMENT 'DWS·收银台漏斗日汇总';

CREATE TABLE dws_trade_order_1d (
    snapshot_date DATE NOT NULL, pay_type VARCHAR(20) NOT NULL DEFAULT 'ALL',
    src_type VARCHAR(20) NOT NULL DEFAULT 'ALL', order_cnt INT NOT NULL DEFAULT 0,
    unsub_cnt INT NOT NULL DEFAULT 0, order_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    revenue_share DECIMAL(15,2) NOT NULL DEFAULT 0, etl_batch_id VARCHAR(32),
    PRIMARY KEY (snapshot_date, pay_type, src_type)
) COMMENT 'DWS·订购/分成日汇总';

CREATE TABLE dws_user_lifecycle_1d (
    snapshot_date DATE PRIMARY KEY, new_register INT NOT NULL DEFAULT 0,
    new_activate INT NOT NULL DEFAULT 0, silent_cnt INT NOT NULL DEFAULT 0,
    churn_cnt INT NOT NULL DEFAULT 0, active_users INT NOT NULL DEFAULT 0,
    active_stb INT NOT NULL DEFAULT 0, active_speaker INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32)
) COMMENT 'DWS·用户生命周期日汇总';

CREATE TABLE dws_user_retention_1d (
    cohort_date DATE NOT NULL, day_offset INT NOT NULL, device_type VARCHAR(10) NOT NULL DEFAULT 'ALL',
    cohort_users INT NOT NULL DEFAULT 0, retained_users INT NOT NULL DEFAULT 0,
    retention_rate DECIMAL(5,2) NOT NULL DEFAULT 0, etl_batch_id VARCHAR(32),
    PRIMARY KEY (cohort_date, day_offset, device_type)
) COMMENT 'DWS·留存同期群日汇总';

-- ======================== fact_ 同义视图（跨行业命名一致） ========================
CREATE OR REPLACE VIEW fact_vod_play AS SELECT * FROM dwd_vod_play_di;
CREATE OR REPLACE VIEW fact_live_play AS SELECT * FROM dwd_live_play_di;
CREATE OR REPLACE VIEW fact_cashier AS SELECT * FROM dwd_trade_cashier_di;
