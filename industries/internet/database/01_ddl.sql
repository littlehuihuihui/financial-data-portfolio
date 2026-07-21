-- ============================================================================
-- 互联网通用行业 · 数仓 DDL（全量 35+ 对象）
-- 数据库：internet_analytics
-- 数据底座：机顶盒/OTT 设备操作日志（开机、点击、播放、支付等）
-- 产品线：launcher（桌面）· vod（点播）· live（直播）· cashier（收银台）
-- 层级：ODS(8) + DIM(6) + DWD(3) + DWS(5) + ADS(8) + 新增模块(7)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS internet_analytics DEFAULT CHARSET utf8mb4;
USE internet_analytics;

-- ======================== ODS · 8 张（原始日志/业务库落地） ========================

CREATE TABLE IF NOT EXISTS ods_device_profile (
    device_id           VARCHAR(32)  NOT NULL COMMENT '设备唯一ID（机顶盒/OTT）',
    user_id             VARCHAR(32)  COMMENT '绑定用户ID，未登录可为空',
    device_model        VARCHAR(40)  COMMENT '设备型号，如 X1-Pro / 4K盒子',
    chip_platform       VARCHAR(30)  COMMENT '芯片平台，如 Amlogic S905X4',
    os_version          VARCHAR(20)  COMMENT '系统版本',
    firmware_version    VARCHAR(20)  COMMENT '固件版本',
    mac_hash            VARCHAR(64)  COMMENT 'MAC地址哈希（脱敏）',
    install_channel     VARCHAR(30)  COMMENT '首次安装渠道',
    province            VARCHAR(20)  COMMENT '省份',
    city_tier           VARCHAR(20)  COMMENT '城市等级：一线/新一线/二线/三线及以下',
    first_boot_time     DATETIME     COMMENT '首次开机时间',
    last_boot_time      DATETIME     COMMENT '最近开机时间',
    is_active           TINYINT(1)   DEFAULT 1 COMMENT '是否活跃设备 1=是',
    etl_batch_id        VARCHAR(32)  COMMENT 'ETL批次号',
    PRIMARY KEY (device_id),
    KEY idx_user (user_id),
    KEY idx_channel (install_channel)
) COMMENT='ODS·设备档案（一行一设备）';

CREATE TABLE IF NOT EXISTS ods_user_profile (
    user_id             VARCHAR(32)  NOT NULL COMMENT '用户ID',
    register_date       DATE         NOT NULL COMMENT '注册日期',
    register_product    VARCHAR(20)  COMMENT '注册来源产品线：launcher/cashier',
    gender              VARCHAR(10)  COMMENT '性别',
    age_group           VARCHAR(20)  COMMENT '年龄段',
    city_tier           VARCHAR(20)  COMMENT '城市等级',
    device_type         VARCHAR(20)  COMMENT '主用设备类型：机顶盒/智能电视/手机',
    first_channel       VARCHAR(30)  COMMENT '首访获客渠道',
    user_segment        VARCHAR(20)  COMMENT '用户分层：新用户/活跃/沉默/付费',
    is_paid             TINYINT(1)   DEFAULT 0 COMMENT '是否付费用户',
    vip_level           VARCHAR(20)  COMMENT '会员等级：普通/黄金/钻石',
    etl_batch_id        VARCHAR(32)  COMMENT 'ETL批次号',
    PRIMARY KEY (user_id)
) COMMENT='ODS·用户档案（一行一用户）';

CREATE TABLE IF NOT EXISTS ods_device_operation_log (
    log_id              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志主键',
    device_id           VARCHAR(32)  NOT NULL COMMENT '设备ID',
    user_id             VARCHAR(32)  COMMENT '操作用户ID',
    event_time          DATETIME     NOT NULL COMMENT '事件发生时间（精确到秒）',
    event_date          DATE         NOT NULL COMMENT '事件日期（分区键）',
    product_line        VARCHAR(20)  NOT NULL COMMENT '产品线：launcher/vod/live/cashier',
    event_action        VARCHAR(30)  NOT NULL COMMENT '操作类型：boot/click/play_start/play_end/pause/channel_enter/order_submit/pay_success/app_exit',
    event_page          VARCHAR(50)  COMMENT '页面/模块：首页/片库/播放器/收银台',
    content_id          VARCHAR(32)  COMMENT '内容ID（点播/直播节目）',
    content_title       VARCHAR(100) COMMENT '内容标题',
    content_category    VARCHAR(30)  COMMENT '内容分类：电影/电视剧/综艺/体育',
    play_duration_sec   INT          DEFAULT 0 COMMENT '播放时长（秒），仅播放类事件',
    session_id          VARCHAR(64)  COMMENT '会话ID',
    app_version         VARCHAR(20)  COMMENT '客户端版本',
    network_type        VARCHAR(10)  COMMENT '网络：wifi/4g/ethernet',
    is_success          TINYINT(1)   DEFAULT 1 COMMENT '操作是否成功',
    error_code          VARCHAR(20)  COMMENT '失败错误码',
    etl_batch_id        VARCHAR(32)  COMMENT 'ETL批次号',
    PRIMARY KEY (log_id),
    KEY idx_device_date (device_id, event_date),
    KEY idx_user_date (user_id, event_date),
    KEY idx_product_action (product_line, event_action, event_date),
    KEY idx_session (session_id)
) COMMENT='ODS·设备操作日志（一行一次操作，核心事实表）';

CREATE TABLE IF NOT EXISTS ods_content_catalog (
    content_id          VARCHAR(32)  NOT NULL COMMENT '内容ID',
    content_sk          BIGINT       NOT NULL DEFAULT -1 COMMENT '代理键',
    content_type        VARCHAR(10)  NOT NULL COMMENT '内容类型：vod/live',
    content_title       VARCHAR(100) NOT NULL COMMENT '内容标题',
    content_category    VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '分类',
    duration_min        INT          NOT NULL DEFAULT 0 COMMENT '时长（分钟）',
    is_premium          TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否付费内容',
    publish_date        DATE         NULL COMMENT '上线日期',
    cp_name             VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '内容提供商',
    content_status      VARCHAR(20)  NOT NULL DEFAULT '上架' COMMENT '状态',
    source_system       VARCHAR(32)  NOT NULL DEFAULT 'CMS',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0' COMMENT 'ETL批次号',
    PRIMARY KEY (content_id)
) COMMENT='ODS·内容目录·全量表';

CREATE TABLE IF NOT EXISTS ods_channel_campaign (
    stat_date           DATE         NOT NULL COMMENT '统计日期',
    channel_code        VARCHAR(20)  NOT NULL COMMENT '渠道编码',
    channel_name        VARCHAR(40)  NOT NULL DEFAULT '未知',
    campaign_id         VARCHAR(32)  NOT NULL DEFAULT '-1',
    impressions         BIGINT       NOT NULL DEFAULT 0 COMMENT '曝光次数',
    clicks              BIGINT       NOT NULL DEFAULT 0 COMMENT '点击次数',
    installs            INT          NOT NULL DEFAULT 0 COMMENT '安装/激活数',
    spend_amount        DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '投放花费（元）',
    new_users           INT          NOT NULL DEFAULT 0 COMMENT '新增用户数',
    new_devices         INT          NOT NULL DEFAULT 0 COMMENT '新增设备数',
    campaign_status     VARCHAR(20)  NOT NULL DEFAULT '投放中',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (stat_date, channel_code, campaign_id)
) COMMENT='ODS·渠道投放日报·增量表';

CREATE TABLE IF NOT EXISTS ods_subscription_order (
    order_id            VARCHAR(32)  NOT NULL COMMENT '订单号',
    user_id             VARCHAR(32)  NOT NULL COMMENT '用户ID',
    device_id           VARCHAR(32)  COMMENT '下单设备ID',
    pay_date            DATE         NOT NULL COMMENT '支付日期',
    pay_time            DATETIME     COMMENT '支付时间',
    product_line        VARCHAR(20)  COMMENT '下单产品线：cashier/vod',
    plan_type           VARCHAR(30)  COMMENT '套餐：月卡/季卡/年卡/单片',
    pay_amount          DECIMAL(15,2) NOT NULL COMMENT '支付金额（元）',
    channel_code        VARCHAR(20)  COMMENT '归因渠道',
    content_id          VARCHAR(32)  COMMENT '关联内容（单片购买）',
    is_renewal          TINYINT(1)   DEFAULT 0 COMMENT '是否续费',
    pay_method          VARCHAR(20)  COMMENT '支付方式：微信/支付宝/运营商',
    etl_batch_id        VARCHAR(32)  COMMENT 'ETL批次号',
    PRIMARY KEY (order_id),
    KEY idx_user_pay (user_id, pay_date)
) COMMENT='ODS·订阅/订单流水（一行一订单）';

CREATE TABLE IF NOT EXISTS ods_user_retention (
    cohort_date         DATE         NOT NULL COMMENT '同期群日期（注册/激活日）',
    day_offset          INT          NOT NULL COMMENT '第N日留存（1/3/7/14/30）',
    channel_code        VARCHAR(20)  NOT NULL DEFAULT 'ALL' COMMENT '渠道，ALL=全渠道',
    product_line        VARCHAR(20)  NOT NULL DEFAULT 'ALL' COMMENT '产品线，ALL=全产品',
    cohort_users        INT          NOT NULL DEFAULT 0 COMMENT '同期群人数',
    retained_users      INT          NOT NULL DEFAULT 0 COMMENT '留存人数',
    retention_rate      DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '留存率%',
    platform            VARCHAR(20)  NOT NULL DEFAULT 'ALL',
    country_code        VARCHAR(10)  NOT NULL DEFAULT 'CN',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (cohort_date, day_offset, channel_code, product_line)
) COMMENT='ODS·留存同期群·增量表';

CREATE TABLE IF NOT EXISTS ods_activity (
    activity_id         VARCHAR(32)  NOT NULL COMMENT '活动ID',
    activity_name       VARCHAR(80)  NOT NULL COMMENT '活动名称',
    start_date          DATE         NOT NULL COMMENT '开始日期',
    end_date            DATE         NOT NULL COMMENT '结束日期',
    activity_type       VARCHAR(30)  COMMENT '活动类型：拉新/促销/品牌/活跃',
    target_product_line VARCHAR(20)  COMMENT '目标产品线',
    budget_amount       DECIMAL(15,2) DEFAULT 0 COMMENT '预算（元）',
    target_users        INT          DEFAULT 0 COMMENT '目标覆盖人数',
    etl_batch_id        VARCHAR(32)  COMMENT 'ETL批次号',
    PRIMARY KEY (activity_id)
) COMMENT='ODS·运营活动（一行一活动）';

-- ======================== DIM · 6 张（主数据/口径） ========================

CREATE TABLE IF NOT EXISTS dim_device (
    device_id           VARCHAR(32)  PRIMARY KEY COMMENT '设备ID',
    user_id             VARCHAR(32)  COMMENT '绑定用户',
    device_model        VARCHAR(40)  COMMENT '设备型号',
    chip_platform       VARCHAR(30)  COMMENT '芯片平台',
    os_version          VARCHAR(20)  COMMENT '系统版本',
    install_channel     VARCHAR(30)  COMMENT '安装渠道',
    province            VARCHAR(20)  COMMENT '省份',
    city_tier           VARCHAR(20)  COMMENT '城市等级',
    first_boot_time     DATETIME     COMMENT '首次开机',
    is_active           TINYINT(1)   DEFAULT 1 COMMENT '是否活跃'
) COMMENT='DIM·设备维度（一行一设备）';

CREATE TABLE IF NOT EXISTS dim_user (
    user_id             VARCHAR(32)  PRIMARY KEY COMMENT '用户ID',
    register_date       DATE         COMMENT '注册日期',
    gender              VARCHAR(10)  COMMENT '性别',
    age_group           VARCHAR(20)  COMMENT '年龄段',
    city_tier           VARCHAR(20)  COMMENT '城市等级',
    device_type         VARCHAR(20)  COMMENT '设备类型',
    first_channel       VARCHAR(30)  COMMENT '首访渠道',
    user_segment        VARCHAR(20)  COMMENT '用户分层',
    is_paid             TINYINT(1)   DEFAULT 0 COMMENT '是否付费',
    vip_level           VARCHAR(20)  COMMENT '会员等级',
    lifecycle_stage     VARCHAR(20)  COMMENT '生命周期：新客/成长/成熟/沉默/流失'
) COMMENT='DIM·用户维度（一行一用户）';

CREATE TABLE IF NOT EXISTS dim_product_line (
    product_line_sk     BIGINT       NOT NULL DEFAULT -1 COMMENT '代理键',
    product_line_code   VARCHAR(20)  PRIMARY KEY COMMENT '产品线编码',
    product_line_name   VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '产品线名称',
    product_category    VARCHAR(20)  NOT NULL DEFAULT '未知' COMMENT '大类：桌面/内容/交易',
    description         VARCHAR(100) NOT NULL DEFAULT '' COMMENT '说明',
    line_status         VARCHAR(20)  NOT NULL DEFAULT '启用',
    owner_team          VARCHAR(40)  NOT NULL DEFAULT '未知',
    sort_order          INT          NOT NULL DEFAULT 0,
    is_unknown          TINYINT(1)   NOT NULL DEFAULT 0,
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0'
) COMMENT='DIM·产品线维度·全量';

CREATE TABLE IF NOT EXISTS dim_channel (
    channel_sk          BIGINT       NOT NULL DEFAULT -1 COMMENT '代理键',
    channel_code        VARCHAR(20)  PRIMARY KEY COMMENT '渠道编码',
    channel_name        VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '渠道名称',
    channel_type        VARCHAR(20)  NOT NULL DEFAULT '未知' COMMENT '渠道类型：自然/付费/裂变',
    is_paid_channel     TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否付费渠道',
    channel_status      VARCHAR(20)  NOT NULL DEFAULT '启用',
    media_vendor        VARCHAR(40)  NOT NULL DEFAULT '未知',
    sort_order          INT          NOT NULL DEFAULT 0,
    is_unknown          TINYINT(1)   NOT NULL DEFAULT 0,
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0'
) COMMENT='DIM·渠道维度·全量';

CREATE TABLE IF NOT EXISTS dim_date (
    date_id             DATE         PRIMARY KEY COMMENT '日期',
    date_sk             BIGINT       NOT NULL DEFAULT -1,
    year_num            INT          NOT NULL DEFAULT 0 COMMENT '年',
    month_num           INT          NOT NULL DEFAULT 0 COMMENT '月',
    day_num             INT          NOT NULL DEFAULT 0 COMMENT '日',
    week_of_year        INT          NOT NULL DEFAULT 0 COMMENT '年中第几周',
    is_weekend          TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否周末',
    month_label         VARCHAR(7)   NOT NULL DEFAULT '0000-00' COMMENT 'YYYY-MM',
    quarter_num         INT          NOT NULL DEFAULT 0,
    day_name            VARCHAR(10)  NOT NULL DEFAULT '未知',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0'
) COMMENT='DIM·日期维度·全量';

CREATE TABLE IF NOT EXISTS dim_event_action (
    event_action_sk     BIGINT       NOT NULL DEFAULT -1,
    event_action        VARCHAR(30)  NOT NULL COMMENT '操作类型编码',
    product_line        VARCHAR(20)  NOT NULL COMMENT '所属产品线',
    event_action_name   VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '操作中文名',
    event_category      VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '大类',
    funnel_step         VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '漏斗步骤',
    is_conversion       TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否转化事件',
    action_status       VARCHAR(20)  NOT NULL DEFAULT '启用',
    is_unknown          TINYINT(1)   NOT NULL DEFAULT 0,
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (event_action, product_line)
) COMMENT='DIM·操作类型维度·全量';

-- ======================== DIM · 新增·用户标签维度 ========================
CREATE TABLE IF NOT EXISTS dim_user_tag (
    tag_id              BIGINT       AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
    tag_code            VARCHAR(30)  NOT NULL COMMENT '标签编码',
    tag_name            VARCHAR(40)  NOT NULL COMMENT '标签名称',
    tag_category        VARCHAR(30)  NOT NULL COMMENT '标签分类：人口/行为/价值/内容偏好/生命周期',
    tag_type            VARCHAR(20)  NOT NULL DEFAULT '静态' COMMENT '标签类型：静态/动态(规则)/预测',
    tag_color           VARCHAR(20)  DEFAULT '#8e44ad' COMMENT '标签颜色(看板展示)',
    calc_rule           VARCHAR(200) DEFAULT '' COMMENT '计算规则描述',
    sort_order          INT          DEFAULT 0 COMMENT '排序',
    is_active           TINYINT(1)   DEFAULT 1 COMMENT '是否启用',
    create_time         DATETIME     DEFAULT CURRENT_TIMESTAMP,
    update_time         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tag_code (tag_code)
) COMMENT='DIM·用户标签维度·全量';

-- ======================== DIM · 新增·套餐维度 ========================
CREATE TABLE IF NOT EXISTS dim_plan_type (
    plan_type_sk        BIGINT       AUTO_INCREMENT PRIMARY KEY,
    plan_type_code      VARCHAR(20)  NOT NULL COMMENT '套餐编码',
    plan_type_name      VARCHAR(40)  NOT NULL COMMENT '套餐名称',
    plan_category       VARCHAR(20)  NOT NULL COMMENT '套餐大类：包月/包季/包年/单片',
    price               DECIMAL(15,2) DEFAULT 0 COMMENT '标准价格(元)',
    is_subscription     TINYINT(1)   DEFAULT 1 COMMENT '是否订阅制',
    auto_renew          TINYINT(1)   DEFAULT 0 COMMENT '是否自动续费',
    description         VARCHAR(100) DEFAULT '',
    sort_order          INT          DEFAULT 0,
    is_active           TINYINT(1)   DEFAULT 1,
    UNIQUE KEY uk_plan_code (plan_type_code)
) COMMENT='DIM·套餐维度·全量';

-- ======================== DWD · 3 张宽表（明细+冗余维度） ========================

CREATE TABLE IF NOT EXISTS dwd_device_operation_wide (
    log_id              BIGINT       PRIMARY KEY COMMENT '日志ID',
    device_id           VARCHAR(32)  COMMENT '设备ID',
    user_id             VARCHAR(32)  COMMENT '用户ID',
    event_time          DATETIME     COMMENT '事件时间',
    event_date          DATE         COMMENT '事件日期',
    product_line        VARCHAR(20)  COMMENT '产品线',
    product_line_name   VARCHAR(40)  COMMENT '产品线名称',
    event_action        VARCHAR(30)  COMMENT '操作类型',
    event_action_name   VARCHAR(40)  COMMENT '操作中文名',
    event_category      VARCHAR(30)  COMMENT '事件大类',
    funnel_step         VARCHAR(20)  COMMENT '漏斗步骤',
    event_page          VARCHAR(50)  COMMENT '页面模块',
    content_id          VARCHAR(32)  COMMENT '内容ID',
    content_title       VARCHAR(100) COMMENT '内容标题',
    content_category    VARCHAR(30)  COMMENT '内容分类',
    play_duration_sec   INT          COMMENT '播放秒数',
    session_id          VARCHAR(64)  COMMENT '会话ID',
    device_model        VARCHAR(40)  COMMENT '设备型号',
    install_channel     VARCHAR(30)  COMMENT '安装渠道',
    channel_name        VARCHAR(40)  COMMENT '渠道名称',
    gender              VARCHAR(10)  COMMENT '用户性别',
    age_group           VARCHAR(20)  COMMENT '用户年龄段',
    user_segment        VARCHAR(20)  COMMENT '用户分层',
    is_success          TINYINT(1)   COMMENT '是否成功'
) COMMENT='DWD·设备操作宽表（一行一次操作，冗余设备/用户/内容维度）';

CREATE TABLE IF NOT EXISTS dwd_user_wide (
    user_id             VARCHAR(32)  PRIMARY KEY COMMENT '用户ID',
    register_date       DATE         COMMENT '注册日期',
    gender              VARCHAR(10)  COMMENT '性别',
    age_group           VARCHAR(20)  COMMENT '年龄段',
    city_tier           VARCHAR(20)  COMMENT '城市等级',
    device_type         VARCHAR(20)  COMMENT '设备类型',
    first_channel       VARCHAR(30)  COMMENT '首访渠道',
    channel_name        VARCHAR(40)  COMMENT '渠道名称',
    user_segment        VARCHAR(20)  COMMENT '用户分层',
    lifecycle_stage     VARCHAR(20)  COMMENT '生命周期阶段',
    is_paid             TINYINT(1)   DEFAULT 0 COMMENT '是否付费',
    vip_level           VARCHAR(20)  COMMENT '会员等级',
    total_operations    INT          DEFAULT 0 COMMENT '累计操作次数',
    total_play_sec      INT          DEFAULT 0 COMMENT '累计播放秒数',
    total_pay_amount    DECIMAL(15,2) DEFAULT 0 COMMENT '累计付费金额',
    last_active_date    DATE         COMMENT '最近活跃日',
    days_since_register INT          COMMENT '注册至今天数'
) COMMENT='DWD·用户宽表（一行一用户，汇总行为与付费）';

CREATE TABLE IF NOT EXISTS dwd_session_wide (
    session_id          VARCHAR(64)  PRIMARY KEY COMMENT '会话ID',
    device_id           VARCHAR(32)  COMMENT '设备ID',
    user_id             VARCHAR(32)  COMMENT '用户ID',
    session_date        DATE         COMMENT '会话日期',
    session_start       DATETIME     COMMENT '会话开始',
    session_end         DATETIME     COMMENT '会话结束',
    duration_sec        INT          DEFAULT 0 COMMENT '会话时长（秒）',
    operation_count     INT          DEFAULT 0 COMMENT '操作次数',
    play_count          INT          DEFAULT 0 COMMENT '播放次数',
    product_lines_used  VARCHAR(100) COMMENT '涉及产品线（逗号分隔）',
    is_paid_session     TINYINT(1)   DEFAULT 0 COMMENT '会话内是否付费'
) COMMENT='DWD·会话宽表（一行一会话，汇总单次使用）';

-- ======================== DWD · 新增·用户行为路径明细 ========================
CREATE TABLE IF NOT EXISTS dwd_user_path_sequence (
    session_id          VARCHAR(64)  NOT NULL COMMENT '会话ID',
    seq_no              INT          NOT NULL COMMENT '步骤序号',
    user_id             VARCHAR(32)  COMMENT '用户ID',
    device_id           VARCHAR(32)  COMMENT '设备ID',
    event_time          DATETIME     COMMENT '事件时间',
    event_date          DATE         COMMENT '事件日期',
    product_line        VARCHAR(20)  COMMENT '产品线',
    event_action        VARCHAR(30)  COMMENT '操作类型',
    event_action_name   VARCHAR(40)  COMMENT '操作中文名',
    event_page          VARCHAR(50)  COMMENT '页面模块',
    event_category      VARCHAR(30)  COMMENT '事件大类',
    prev_page           VARCHAR(50)  COMMENT '上一页面',
    next_page           VARCHAR(50)  COMMENT '下一页面',
    duration_to_next_sec INT        DEFAULT 0 COMMENT '到下一事件间隔秒数',
    is_conversion_step  TINYINT(1)   DEFAULT 0 COMMENT '是否转化步骤',
    content_id          VARCHAR(32)  COMMENT '关联内容ID',
    PRIMARY KEY (session_id, seq_no),
    KEY idx_user_date (user_id, event_date),
    KEY idx_product_action (product_line, event_action)
) COMMENT='DWD·用户行为路径序列（一行一步，支持Sankey/路径分析）';

-- ======================== DWS · 5 张汇总（预聚合） ========================

CREATE TABLE IF NOT EXISTS dws_user_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    channel_code        VARCHAR(20)  NOT NULL DEFAULT 'ALL' COMMENT '渠道',
    dau                 INT          NOT NULL DEFAULT 0 COMMENT '日活用户数',
    dau_device          INT          DEFAULT 0 COMMENT '日活设备数',
    new_users           INT          DEFAULT 0 COMMENT '新增用户',
    new_devices         INT          DEFAULT 0 COMMENT '新增设备',
    active_users        INT          DEFAULT 0 COMMENT '高活跃用户',
    paid_users          INT          DEFAULT 0 COMMENT '付费活跃用户',
    boot_count          INT          DEFAULT 0 COMMENT '开机次数',
    avg_session_sec     DECIMAL(10,2) DEFAULT 0 COMMENT '人均会话秒数',
    PRIMARY KEY (snapshot_date, channel_code)
) COMMENT='DWS·用户日汇总（一行一日×渠道）';

CREATE TABLE IF NOT EXISTS dws_product_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    product_line        VARCHAR(20)  NOT NULL COMMENT '产品线',
    active_users        INT          DEFAULT 0 COMMENT '活跃用户数',
    active_devices      INT          DEFAULT 0 COMMENT '活跃设备数',
    operation_count     INT          DEFAULT 0 COMMENT '操作次数',
    play_count          INT          DEFAULT 0 COMMENT '播放次数',
    total_play_sec      BIGINT       DEFAULT 0 COMMENT '总播放秒数',
    pay_users           INT          DEFAULT 0 COMMENT '付费用户数',
    pay_amount          DECIMAL(15,2) DEFAULT 0 COMMENT '付费金额',
    PRIMARY KEY (snapshot_date, product_line)
) COMMENT='DWS·产品线日汇总（一行一日×产品线）';

CREATE TABLE IF NOT EXISTS dws_retention_daily (
    cohort_date         DATE         NOT NULL COMMENT '同期群日期',
    day_offset          INT          NOT NULL COMMENT '第N日',
    channel_code        VARCHAR(20)  NOT NULL DEFAULT 'ALL',
    product_line        VARCHAR(20)  NOT NULL DEFAULT 'ALL',
    cohort_users        INT          NOT NULL DEFAULT 0 COMMENT '同期群人数',
    retained_users      INT          NOT NULL DEFAULT 0 COMMENT '留存人数',
    retention_rate      DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '留存率',
    platform            VARCHAR(20)  NOT NULL DEFAULT 'ALL',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (cohort_date, day_offset, channel_code, product_line)
) COMMENT='DWS·留存日汇总·快照表';

CREATE TABLE IF NOT EXISTS dws_channel_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    channel_code        VARCHAR(20)  NOT NULL COMMENT '渠道编码',
    channel_name        VARCHAR(40)  COMMENT '渠道名称',
    spend_amount        DECIMAL(15,2) DEFAULT 0 COMMENT '投放花费',
    new_users           INT          DEFAULT 0 COMMENT '新增用户',
    new_devices         INT          DEFAULT 0 COMMENT '新增设备',
    clicks              BIGINT       DEFAULT 0 COMMENT '点击数',
    cac                 DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '获客成本',
    conversion_rate     DECIMAL(8,4) COMMENT '转化率',
    PRIMARY KEY (snapshot_date, channel_code)
) COMMENT='DWS·渠道日汇总（一行一渠道一日）';

CREATE TABLE IF NOT EXISTS dws_payment_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    channel_code        VARCHAR(20)  NOT NULL DEFAULT 'ALL' COMMENT '渠道',
    product_line        VARCHAR(20)  NOT NULL DEFAULT 'ALL' COMMENT '产品线',
    pay_users           INT          NOT NULL DEFAULT 0 COMMENT '付费用户数',
    pay_amount          DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '付费金额',
    arpu                DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '人均收入',
    renewal_users       INT          NOT NULL DEFAULT 0 COMMENT '续费用户数',
    order_count         INT          NOT NULL DEFAULT 0 COMMENT '订单数',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, channel_code, product_line)
) COMMENT='DWS·付费日汇总·快照表';

-- DWS：漏斗 / 用户价值（堵住 ADS→DWD）
CREATE TABLE IF NOT EXISTS dws_funnel_monthly (
    snapshot_month      VARCHAR(7)   NOT NULL COMMENT 'YYYY-MM',
    channel_code        VARCHAR(20)  NOT NULL DEFAULT 'ALL',
    product_line        VARCHAR(20)  NOT NULL DEFAULT 'ALL',
    step_visit          INT          NOT NULL DEFAULT 0,
    step_signup         INT          NOT NULL DEFAULT 0,
    step_activate       INT          NOT NULL DEFAULT 0,
    step_purchase       INT          NOT NULL DEFAULT 0,
    signup_rate         DECIMAL(15,2) NOT NULL DEFAULT 0,
    purchase_rate       DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_month, channel_code, product_line)
) COMMENT='DWS·月转化漏斗·快照表';

CREATE TABLE IF NOT EXISTS dws_user_value_snapshot (
    snapshot_date       DATE         NOT NULL COMMENT '快照日',
    user_id             VARCHAR(32)  NOT NULL,
    first_channel       VARCHAR(40)  NOT NULL DEFAULT '未知',
    lifecycle_stage     VARCHAR(20)  NOT NULL DEFAULT '未知',
    user_segment        VARCHAR(30)  NOT NULL DEFAULT '未知',
    total_pay_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_operations    INT          NOT NULL DEFAULT 0,
    days_since_register INT          NOT NULL DEFAULT 0,
    last_active_date    DATE         NULL,
    recency_days        INT          NOT NULL DEFAULT 0,
    rfm_segment         VARCHAR(20)  NOT NULL DEFAULT '一般',
    etl_batch_id        VARCHAR(32)  NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, user_id)
) COMMENT='DWS·用户价值日快照·快照表';

-- ======================== DWS · 新增·用户行为路径汇总 ========================
CREATE TABLE IF NOT EXISTS dws_path_summary_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    prev_page           VARCHAR(50)  NOT NULL COMMENT '上一页面',
    next_page           VARCHAR(50)  NOT NULL COMMENT '下一页面',
    product_line        VARCHAR(20)  COMMENT '产品线',
    user_count          INT          DEFAULT 0 COMMENT '去重用户数',
    transition_count    INT          DEFAULT 0 COMMENT '转移次数',
    session_count       INT          DEFAULT 0 COMMENT '含该路径的会话数',
    avg_duration_sec    DECIMAL(10,2) DEFAULT 0 COMMENT '页面间平均停留秒数',
    drop_off_count      INT          DEFAULT 0 COMMENT '该步骤后离开数',
    drop_off_rate       DECIMAL(15,2) DEFAULT 0 COMMENT '离开率%',
    PRIMARY KEY (snapshot_date, prev_page, next_page)
) COMMENT='DWS·用户路径日汇总（支持Sankey/漏斗分析）';

-- ======================== DWS · 新增·套餐月度汇总 ========================
CREATE TABLE IF NOT EXISTS dws_plan_monthly (
    snapshot_month      VARCHAR(7)   NOT NULL COMMENT 'YYYY-MM',
    plan_type           VARCHAR(30)  NOT NULL COMMENT '套餐类型',
    order_cnt           INT          DEFAULT 0 COMMENT '订购数',
    unsub_cnt           INT          DEFAULT 0 COMMENT '退订数',
    order_amount        DECIMAL(15,2) DEFAULT 0 COMMENT '订购金额',
    revenue_share       DECIMAL(15,2) DEFAULT 0 COMMENT '分成收入',
    new_user_cnt        INT          DEFAULT 0 COMMENT '新用户订购',
    renewal_cnt         INT          DEFAULT 0 COMMENT '续费订购',
    unsub_rate          DECIMAL(15,2) DEFAULT 0 COMMENT '退订率%',
    avg_order_price     DECIMAL(15,2) DEFAULT 0 COMMENT '客单价',
    PRIMARY KEY (snapshot_month, plan_type)
) COMMENT='DWS·套餐月度汇总·快照表';

-- ======================== DWS · 新增·营销活动效果汇总 ========================
CREATE TABLE IF NOT EXISTS dws_activity_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    activity_id         VARCHAR(32)  NOT NULL COMMENT '活动ID',
    activity_type       VARCHAR(30)  COMMENT '活动类型',
    reach_users         INT          DEFAULT 0 COMMENT '触达用户数',
    participate_users   INT          DEFAULT 0 COMMENT '参与用户数',
    order_cnt           INT          DEFAULT 0 COMMENT '活动期订购数',
    order_amount        DECIMAL(15,2) DEFAULT 0 COMMENT '活动期订购金额',
    revenue_share       DECIMAL(15,2) DEFAULT 0 COMMENT '活动期分成',
    new_user_cnt        INT          DEFAULT 0 COMMENT '活动新用户',
    retain_users_7d     INT          DEFAULT 0 COMMENT '活动用户7日留存',
    unconverted_users   INT          DEFAULT 0 COMMENT '触达未转化数',
    cost_amount         DECIMAL(15,2) DEFAULT 0 COMMENT '活动成本',
    PRIMARY KEY (snapshot_date, activity_id)
) COMMENT='DWS·营销活动日效果汇总·增量表';

-- ======================== DWS · 新增·用户标签集市 ========================
CREATE TABLE IF NOT EXISTS dws_user_tag_daily (
    snapshot_date       DATE         NOT NULL COMMENT '快照日期',
    user_id             VARCHAR(32)  NOT NULL COMMENT '用户ID',
    tag_code            VARCHAR(30)  NOT NULL COMMENT '标签编码',
    tag_value           VARCHAR(60)  COMMENT '标签值',
    tag_category        VARCHAR(30)  COMMENT '标签分类',
    tag_source          VARCHAR(30)  DEFAULT '规则' COMMENT '标签来源：规则/模型/手动',
    expire_date         DATE         NULL COMMENT '过期日期',
    is_active           TINYINT(1)   DEFAULT 1 COMMENT '是否有效',
    create_time         DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (snapshot_date, user_id, tag_code),
    KEY idx_user_tag (user_id, tag_category),
    KEY idx_tag_value (tag_code, tag_value)
) COMMENT='DWS·用户标签日快照（支持用户画像分层）';

-- ======================== DWS · 新增·健康度仪表盘 ========================
CREATE TABLE IF NOT EXISTS dws_health_daily (
    snapshot_date       DATE         NOT NULL COMMENT '统计日期',
    metric_group        VARCHAR(30)  NOT NULL COMMENT '指标组：活跃/留存/商业化/内容/健康度',
    metric_code         VARCHAR(40)  NOT NULL COMMENT '指标编码',
    metric_name         VARCHAR(60)  NOT NULL COMMENT '指标名称',
    metric_value        DECIMAL(15,2) DEFAULT 0 COMMENT '指标值',
    metric_unit         VARCHAR(10)  DEFAULT '' COMMENT '单位',
    baseline_value      DECIMAL(15,2) DEFAULT 0 COMMENT '基线值',
    threshold_green     DECIMAL(15,2) DEFAULT 0 COMMENT '绿灯阈值',
    threshold_red       DECIMAL(15,2) DEFAULT 0 COMMENT '红灯阈值',
    status              VARCHAR(10)  DEFAULT 'green' COMMENT '状态：green/yellow/red',
    mom_change_pct      DECIMAL(15,2) DEFAULT 0 COMMENT '环比变化%',
    PRIMARY KEY (snapshot_date, metric_group, metric_code)
) COMMENT='DWS·业务健康度日快照·快照表';

-- 迁移：旧版表名改为视图前需先删除同名表
DROP TABLE IF EXISTS ods_user_event;
DROP TABLE IF EXISTS ods_channel;
DROP TABLE IF EXISTS ods_subscription;
DROP TABLE IF EXISTS dwd_event_wide;
DROP VIEW IF EXISTS ods_user_event;
DROP VIEW IF EXISTS ods_channel;
DROP VIEW IF EXISTS ods_subscription;
DROP VIEW IF EXISTS dwd_event_wide;

-- 兼容旧查询别名视图
CREATE OR REPLACE VIEW ods_user_event AS
SELECT
    w.log_id AS event_id,
    w.user_id,
    w.event_date,
    CASE w.event_action
        WHEN 'boot' THEN 'page_view'
        WHEN 'click' THEN 'click'
        WHEN 'play_start' THEN 'play'
        WHEN 'order_submit' THEN 'activate'
        WHEN 'pay_success' THEN 'purchase'
        ELSE w.event_action
    END AS event_type,
    w.event_action AS event_name,
    w.install_channel AS channel_code,
    w.session_id,
    w.play_duration_sec AS duration_sec,
    NULL AS etl_batch_id
FROM dwd_device_operation_wide w;

CREATE OR REPLACE VIEW ods_channel AS
SELECT stat_date, channel_code, impressions, clicks, installs, spend_amount, new_users, etl_batch_id
FROM ods_channel_campaign;

CREATE OR REPLACE VIEW ods_subscription AS
SELECT order_id, user_id, pay_date, plan_type, pay_amount, channel_code, is_renewal, etl_batch_id
FROM ods_subscription_order;

CREATE OR REPLACE VIEW dwd_event_wide AS
SELECT
    log_id AS event_id,
    user_id,
    event_date,
    funnel_step AS event_type,
    event_action_name AS event_name,
    event_category,
    install_channel AS channel_code,
    channel_name,
    session_id,
    play_duration_sec AS duration_sec,
    gender,
    age_group,
    user_segment
FROM dwd_device_operation_wide
WHERE funnel_step IS NOT NULL AND funnel_step <> '';