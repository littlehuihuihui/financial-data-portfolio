-- =============================================================================
-- ODS · 数据引入层（贴源；仅允许被 DWD/DIM 构建过程引用）
-- 表类型：增量表（按业务日 etl_date 分区逻辑；本 DDL 用 etl_date 字段标识）
-- =============================================================================
USE retail_kimball;

-- ---------------------------------------------------------------------------
-- ODS-01 订单行（OMS）· 增量 · 粒度：订单行
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_order_item;
CREATE TABLE ods_order_item (
    order_item_id       BIGINT          NOT NULL COMMENT '源系统订单行ID，主键',
    order_id            BIGINT          NOT NULL COMMENT '订单ID',
    order_line_no       INT             NOT NULL COMMENT '订单行号',
    member_id           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员业务键，未知-1',
    sku_id              BIGINT          NOT NULL DEFAULT -1 COMMENT 'SKU业务键，未知-1',
    channel_code        VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '下单渠道编码',
    store_id            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店/仓ID，未知-1',
    promo_id            BIGINT          NOT NULL DEFAULT -1 COMMENT '促销活动ID，无活动-1',
    order_qty           DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '销售数量，单位：件',
    list_amount         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '挂牌金额，单位：元',
    discount_amount     DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '折扣金额，单位：元',
    payable_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '应付金额，单位：元',
    cost_amount         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '行成本金额，单位：元',
    order_status        VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '订单行状态：CREATED/PAID/SHIPPED/CLOSED',
    order_date          DATE     NOT NULL COMMENT '下单业务日期 YYYY-MM-DD',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (order_item_id),
    KEY idx_ods_oi_order (order_id),
    KEY idx_ods_oi_date (order_date)
) COMMENT='ODS·订单行贴源表（增量表）';

-- ---------------------------------------------------------------------------
-- ODS-02 支付流水（支付中台）· 增量 · 粒度：支付单
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_payment;
CREATE TABLE ods_payment (
    payment_id          BIGINT          NOT NULL COMMENT '支付单ID，主键',
    order_id            BIGINT          NOT NULL COMMENT '关联订单ID',
    member_id           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员ID，未知-1',
    channel_code        VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '支付发生渠道',
    pay_method_code     VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '支付方式编码',
    pay_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '实付金额，单位：元',
    pay_fee_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '支付手续费，单位：元',
    pay_status          VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '支付状态：SUCCESS/FAIL/REFUND',
    pay_date            DATE     NOT NULL COMMENT '支付业务日期 YYYY-MM-DD',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (payment_id),
    KEY idx_ods_pay_order (order_id),
    KEY idx_ods_pay_date (pay_date)
) COMMENT='ODS·支付流水贴源表（增量表）';

-- ---------------------------------------------------------------------------
-- ODS-03 退货明细（售后系统）· 增量 · 粒度：退货行
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_return_item;
CREATE TABLE ods_return_item (
    return_item_id      BIGINT          NOT NULL COMMENT '退货明细ID，主键',
    return_id           BIGINT          NOT NULL COMMENT '退货单ID',
    order_id            BIGINT          NOT NULL COMMENT '原订单ID',
    order_item_id       BIGINT          NOT NULL DEFAULT -1 COMMENT '原订单行ID，未知-1',
    member_id           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员ID，未知-1',
    sku_id              BIGINT          NOT NULL DEFAULT -1 COMMENT 'SKU ID，未知-1',
    return_qty          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退货数量，单位：件',
    refund_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退款金额，单位：元',
    return_reason       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '退货原因编码/描述',
    return_status       VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '退货状态：APPLY/APPROVED/REFUNDED/REJECTED',
    return_date         DATE     NOT NULL COMMENT '退货业务日期 YYYY-MM-DD',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (return_item_id),
    KEY idx_ods_ret_order (order_id),
    KEY idx_ods_ret_date (return_date)
) COMMENT='ODS·退货明细贴源表（增量表）';

-- ---------------------------------------------------------------------------
-- ODS-04 会员主数据（CRM）· 全量/快照上报 · 粒度：会员
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_member;
CREATE TABLE ods_member (
    member_id           BIGINT          NOT NULL COMMENT '会员业务键，主键',
    member_name         VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '会员昵称/姓名（脱敏）',
    gender              VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '性别',
    age_group           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '年龄段',
    city_tier           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '城市等级',
    member_level        VARCHAR(32)     NOT NULL DEFAULT 'NORMAL' COMMENT '会员等级',
    member_status       VARCHAR(32)     NOT NULL DEFAULT 'ACTIVE' COMMENT '会员状态：ACTIVE/FROZEN/CANCELLED',
    first_channel_code  VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '首访/注册渠道',
    register_date       DATE     NOT NULL COMMENT '注册日期 YYYY-MM-DD',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (member_id),
    KEY idx_ods_member_reg (register_date)
) COMMENT='ODS·会员主数据贴源表（全量表/日覆盖）';

-- ---------------------------------------------------------------------------
-- ODS-05 商品SKU（商品中心）· 全量
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_product;
CREATE TABLE ods_product (
    sku_id              BIGINT          NOT NULL COMMENT 'SKU业务键，主键',
    spu_id              BIGINT          NOT NULL DEFAULT -1 COMMENT 'SPU ID，未知-1',
    product_name        VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '商品名称',
    brand_name          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '品牌',
    category_l1         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '一级类目',
    category_l2         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '二级类目',
    list_price          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '吊牌价，单位：元',
    cost_std            DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '标准成本，单位：元',
    product_status      VARCHAR(32)     NOT NULL DEFAULT 'ON' COMMENT '商品状态：ON/OFF',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (sku_id)
) COMMENT='ODS·商品SKU贴源表（全量表）';

-- ---------------------------------------------------------------------------
-- ODS-06 门店/仓（主数据）· 全量
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_store;
CREATE TABLE ods_store (
    store_id            BIGINT          NOT NULL COMMENT '门店/仓业务键，主键',
    store_name          VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '门店名称',
    store_type          VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '类型：直营/加盟/仓',
    province_name       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '省',
    city_name           VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '市',
    city_tier           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '城市等级',
    area_sqm            DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '营业面积，单位：㎡',
    store_status        VARCHAR(32)     NOT NULL DEFAULT 'OPEN' COMMENT '状态：OPEN/CLOSED',
    open_date           DATE     NOT NULL DEFAULT '1970-01-01' COMMENT '开业日期 YYYY-MM-DD',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (store_id)
) COMMENT='ODS·门店仓贴源表（全量表）';

-- ---------------------------------------------------------------------------
-- ODS-07 库存事务（WMS）· 增量 · 粒度：出入库明细
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_inventory_txn;
CREATE TABLE ods_inventory_txn (
    txn_id              BIGINT          NOT NULL COMMENT '库存事务ID，主键',
    sku_id              BIGINT          NOT NULL DEFAULT -1 COMMENT 'SKU ID，未知-1',
    store_id            BIGINT          NOT NULL DEFAULT -1 COMMENT '仓/门店ID，未知-1',
    txn_type            VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '事务类型：IN/OUT/ADJ/TRANSFER',
    txn_qty             DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '变动数量，入正出负，单位：件',
    txn_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '变动金额（成本计价），单位：元',
    biz_doc_no          VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '业务单据号',
    txn_status          VARCHAR(32)     NOT NULL DEFAULT 'POSTED' COMMENT '过账状态：POSTED/VOID',
    txn_date            DATE     NOT NULL COMMENT '事务业务日期 YYYY-MM-DD',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (txn_id),
    KEY idx_ods_inv_date (txn_date),
    KEY idx_ods_inv_sku (sku_id)
) COMMENT='ODS·库存事务贴源表（增量表）';

-- ---------------------------------------------------------------------------
-- ODS-08 渠道主数据（投放/中台）· 全量 —— 补齐 DIM 贴源血缘
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_channel;
CREATE TABLE ods_channel (
    channel_id          BIGINT          NOT NULL COMMENT '渠道代理源ID，主键',
    channel_code        VARCHAR(32)     NOT NULL COMMENT '渠道业务编码',
    channel_name        VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '渠道名称',
    channel_type        VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '线上/线下',
    platform_name       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '平台名称',
    is_paid_channel     VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否付费渠道 Y/N',
    owner_dept          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '归属部门',
    channel_status      VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (channel_id),
    UNIQUE KEY uk_ods_channel_code (channel_code)
) COMMENT='ODS·渠道主数据贴源表（全量表）';

-- ---------------------------------------------------------------------------
-- ODS-09 支付方式主数据 · 全量
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_payment_method;
CREATE TABLE ods_payment_method (
    pay_method_id       BIGINT          NOT NULL COMMENT '支付方式源ID，主键',
    pay_method_code     VARCHAR(32)     NOT NULL COMMENT '支付方式编码',
    pay_method_name     VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '支付方式名称',
    pay_vendor          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '支付服务商',
    pay_channel_type    VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '钱包/银行卡等',
    fee_rate_pct        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费率，单位：百分点',
    is_installment      VARCHAR(8)      NOT NULL DEFAULT 'N' COMMENT '是否分期 Y/N',
    pay_method_status   VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (pay_method_id),
    UNIQUE KEY uk_ods_pay_method (pay_method_code)
) COMMENT='ODS·支付方式贴源表（全量表）';

-- ---------------------------------------------------------------------------
-- ODS-10 促销活动（营销系统）· 全量/慢变
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_promotion;
CREATE TABLE ods_promotion (
    promo_id            BIGINT          NOT NULL COMMENT '促销活动ID，主键',
    promo_name          VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '活动名称',
    promo_type          VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '类型：满减/折扣/满赠',
    discount_mode       VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '优惠模式',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '活动预算，单位：元',
    start_date          DATE     NOT NULL COMMENT '开始日期 YYYY-MM-DD',
    end_date            DATE     NOT NULL COMMENT '结束日期 YYYY-MM-DD',
    promo_status        VARCHAR(32)     NOT NULL DEFAULT 'DRAFT' COMMENT '状态：DRAFT/ACTIVE/ENDED',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (promo_id)
) COMMENT='ODS·促销活动贴源表（全量表）';

-- ---------------------------------------------------------------------------
-- ODS-11 费用明细（财务系统）· 增量 · 粒度：费用行 · BP6
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_expense;
CREATE TABLE ods_expense (
    expense_id          BIGINT          NOT NULL COMMENT '费用单ID，主键',
    expense_date        DATE     NOT NULL COMMENT '费用业务日期 YYYY-MM-DD',
    expense_type_code   VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '费用类型编码',
    brand_code          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '品牌编码',
    channel_code        VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '渠道编码',
    store_id            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店ID，公司级-1',
    expense_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费用金额，单位：元',
    cost_center         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '成本中心',
    expense_owner       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '费用负责人',
    expense_status      VARCHAR(32)     NOT NULL DEFAULT 'POSTED' COMMENT '状态：DRAFT/POSTED/VOID',
    source_system       VARCHAR(32)     NOT NULL DEFAULT 'ERP' COMMENT '来源系统',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (expense_id),
    KEY idx_ods_exp_date (expense_date)
) COMMENT='ODS·费用明细贴源表（增量表）·含广告投放费用归并';

-- ---------------------------------------------------------------------------
-- ODS-12 预算编制（财务系统）· 全量/版本 · 粒度：预算行 · BP7
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ods_budget;
CREATE TABLE ods_budget (
    budget_id           BIGINT          NOT NULL COMMENT '预算行ID，主键',
    budget_year         INT             NOT NULL COMMENT '预算年',
    budget_month        INT             NOT NULL COMMENT '预算月1-12',
    brand_code          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '品牌编码',
    channel_code        VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '渠道编码',
    expense_type_code   VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '费用类型编码',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算金额，单位：元',
    budget_version      VARCHAR(20)     NOT NULL DEFAULT 'v1' COMMENT '预算版本',
    budget_status       VARCHAR(32)     NOT NULL DEFAULT 'APPROVED' COMMENT '状态：DRAFT/APPROVED',
    owner_dept          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '编制部门',
    source_system       VARCHAR(32)     NOT NULL DEFAULT 'ERP' COMMENT '来源系统',
    etl_date            DATE     NOT NULL COMMENT 'ETL数据日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '源记录创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '源记录更新时间',
    PRIMARY KEY (budget_id),
    KEY idx_ods_bud_ym (budget_year, budget_month)
) COMMENT='ODS·预算编制贴源表（全量表·按版本）';

-- ---------------------------------------------------------------------------
-- 待删除清单（现网 sql6 凑数表，不进入 retail_kimball）
-- ods_purchase     — 无采购主题看板与下游链路
-- ods_store_pnl    — 预聚合伪贴源，应由销售/门店维派生
-- ods_ad_cost      — 归并入 ods_expense（expense_type=广告）
-- ---------------------------------------------------------------------------
