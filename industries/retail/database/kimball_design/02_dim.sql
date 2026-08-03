-- =============================================================================
-- DIM · 公共维度层（一致性维度；代理键 BIGINT，未知维行 sk=-1）
-- =============================================================================
USE retail_kimball;

-- 预置未知维约定：各维插入 sk=-1 行（ETL 初始化）

DROP TABLE IF EXISTS dim_date;
CREATE TABLE dim_date (
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '日期代理键，建议YYYYMMDD，未知-1',
    date_id             DATE     NOT NULL COMMENT '业务日期 YYYY-MM-DD，业务键',
    year_num            INT             NOT NULL DEFAULT 0 COMMENT '年',
    quarter_num         INT             NOT NULL DEFAULT 0 COMMENT '季度',
    month_num           INT             NOT NULL DEFAULT 0 COMMENT '月',
    week_of_year        INT             NOT NULL DEFAULT 0 COMMENT '年内周次',
    day_of_week         INT             NOT NULL DEFAULT 0 COMMENT '周几1-7',
    is_weekend          VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否周末 Y/N',
    is_holiday          VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否节假日 Y/N',
    month_label         VARCHAR(7)      NOT NULL DEFAULT '' COMMENT '月份标签 YYYY-MM',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (date_sk),
    UNIQUE KEY uk_dim_date_id (date_id)
) COMMENT='DIM·日期维度';

DROP TABLE IF EXISTS dim_region;
CREATE TABLE dim_region (
    region_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '地区代理键，未知-1',
    region_bk           VARCHAR(64)     NOT NULL COMMENT '业务键：省码_市码',
    province_code       VARCHAR(16)     NOT NULL DEFAULT '-1' COMMENT '省编码',
    province_name       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '省名称',
    city_code           VARCHAR(16)     NOT NULL DEFAULT '-1' COMMENT '市编码',
    city_name           VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '市名称',
    district_name       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '区县',
    city_tier           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '城市等级',
    zone_name           VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '大区：华东/华南等',
    region_status       VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (region_sk),
    UNIQUE KEY uk_dim_region_bk (region_bk)
) COMMENT='DIM·地区维度';

DROP TABLE IF EXISTS dim_channel;
CREATE TABLE dim_channel (
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键，未知-1',
    channel_code        VARCHAR(32)     NOT NULL COMMENT '渠道业务键',
    channel_name        VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '渠道名称',
    channel_type        VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '线上/线下',
    platform_name       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '平台名称',
    is_paid_channel     VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否付费渠道 Y/N',
    owner_dept          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '归属部门',
    parent_channel_sk   BIGINT          NOT NULL DEFAULT -1 COMMENT '父渠道代理键，无则-1',
    channel_status      VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (channel_sk),
    UNIQUE KEY uk_dim_channel_code (channel_code)
) COMMENT='DIM·渠道维度';

DROP TABLE IF EXISTS dim_payment_method;
CREATE TABLE dim_payment_method (
    pay_method_sk       BIGINT          NOT NULL DEFAULT -1 COMMENT '支付方式代理键，未知-1',
    pay_method_code     VARCHAR(32)     NOT NULL COMMENT '支付方式业务键',
    pay_method_name     VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '支付方式名称',
    pay_vendor          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '支付服务商',
    pay_channel_type    VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '钱包/银行卡/花呗等',
    fee_rate_pct        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费率百分比数值，单位：百分点',
    is_installment      VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否分期 Y/N',
    settle_cycle        VARCHAR(32)     NOT NULL DEFAULT 'T1' COMMENT '结算周期',
    pay_method_status   VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (pay_method_sk),
    UNIQUE KEY uk_dim_pay_method (pay_method_code)
) COMMENT='DIM·支付方式维度';

DROP TABLE IF EXISTS dim_member;
CREATE TABLE dim_member (
    member_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员代理键，未知-1',
    member_id           BIGINT          NOT NULL COMMENT '会员业务键',
    register_date       DATE     NOT NULL DEFAULT '1970-01-01' COMMENT '注册日期 YYYY-MM-DD',
    gender              VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '性别',
    age_group           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '年龄段',
    city_tier           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '城市等级',
    member_level        VARCHAR(32)     NOT NULL DEFAULT 'NORMAL' COMMENT '等级',
    member_status       VARCHAR(32)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    first_channel_sk    BIGINT          NOT NULL DEFAULT -1 COMMENT '首访渠道代理键',
    lifecycle_stage     VARCHAR(32)     NOT NULL DEFAULT 'NEW' COMMENT '生命周期阶段',
    is_paid_member      VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否付费会员 Y/N',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (member_sk),
    UNIQUE KEY uk_dim_member_id (member_id)
) COMMENT='DIM·会员维度';

DROP TABLE IF EXISTS dim_product;
CREATE TABLE dim_product (
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '商品代理键，未知-1',
    sku_id              BIGINT          NOT NULL COMMENT 'SKU业务键',
    spu_id              BIGINT          NOT NULL DEFAULT -1 COMMENT 'SPU ID',
    product_name        VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '商品名称',
    brand_name          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '品牌',
    category_l1         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '一级类目',
    category_l2         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '二级类目',
    category_l3         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '三级类目',
    list_price          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '吊牌价，单位：元',
    cost_std            DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '标准成本，单位：元',
    product_status      VARCHAR(32)     NOT NULL DEFAULT 'ON' COMMENT '状态 ON/OFF',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (product_sk),
    UNIQUE KEY uk_dim_product_sku (sku_id)
) COMMENT='DIM·商品维度';

DROP TABLE IF EXISTS dim_store;
CREATE TABLE dim_store (
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键，未知-1',
    store_id            BIGINT          NOT NULL COMMENT '门店业务键',
    store_name          VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '门店名称',
    store_type          VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '直营/加盟/仓',
    region_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '地区代理键',
    area_sqm            DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '面积，单位：㎡',
    open_date           DATE     NOT NULL DEFAULT '1970-01-01' COMMENT '开业日期 YYYY-MM-DD',
    manager_name        VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '店长（脱敏）',
    store_status        VARCHAR(32)     NOT NULL DEFAULT 'OPEN' COMMENT '状态',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (store_sk),
    UNIQUE KEY uk_dim_store_id (store_id)
) COMMENT='DIM·门店仓维度';

DROP TABLE IF EXISTS dim_promotion;
CREATE TABLE dim_promotion (
    promo_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '促销代理键，未知-1',
    promo_id            BIGINT          NOT NULL COMMENT '促销业务键',
    promo_name          VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '活动名称',
    promo_type          VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '活动类型',
    discount_mode       VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '优惠模式',
    start_date          DATE     NOT NULL DEFAULT '1970-01-01' COMMENT '开始日期 YYYY-MM-DD',
    end_date            DATE     NOT NULL DEFAULT '1970-01-01' COMMENT '结束日期 YYYY-MM-DD',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算，单位：元',
    promo_status        VARCHAR(32)     NOT NULL DEFAULT 'DRAFT' COMMENT '状态',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (promo_sk),
    UNIQUE KEY uk_dim_promo_id (promo_id)
) COMMENT='DIM·促销维度';

DROP TABLE IF EXISTS dim_expense_type;
CREATE TABLE dim_expense_type (
    expense_type_sk     BIGINT          NOT NULL DEFAULT -1 COMMENT '费用类型代理键，未知-1',
    expense_type_code   VARCHAR(32)     NOT NULL COMMENT '费用类型业务键',
    expense_type_name   VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '费用类型名称',
    expense_category    VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '大类：营销/人力/租金/物流/其他',
    is_variable         VARCHAR(8)      NOT NULL DEFAULT 'Y' COMMENT '是否变动费用 Y/N',
    gl_account          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '科目映射',
    owner_dept          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '归口部门',
    expense_type_status VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    is_unknown          TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否未知维',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (expense_type_sk),
    UNIQUE KEY uk_dim_expense_type (expense_type_code)
) COMMENT='DIM·费用类型维度';
