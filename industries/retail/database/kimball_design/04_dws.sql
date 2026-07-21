-- =============================================================================
-- DWS · 汇总数据层（公共粒度；仅引用 DWD + DIM）
-- 表类型：日汇总 / 日快照
-- =============================================================================
USE retail_kimball;

-- ---------------------------------------------------------------------------
-- 销售日汇总 · 粒度：日 × 渠道 × 门店
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_sales_d;
CREATE TABLE dws_sales_d (
    snapshot_date       DATE     NOT NULL COMMENT '统计日期 YYYY-MM-DD',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键',
    order_line_cnt      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '订单行数',
    order_qty           DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '销量合计，单位：件',
    gmv_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '应付GMV合计，单位：元',
    cost_amount         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '成本合计，单位：元',
    gross_profit        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '毛利=GMV-成本，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_date, channel_sk, store_sk)
) COMMENT='DWS·销售日汇总（日×渠道×门店）';

-- ---------------------------------------------------------------------------
-- 支付日汇总 · 粒度：日 × 渠道 × 支付方式
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_payment_d;
CREATE TABLE dws_payment_d (
    snapshot_date       DATE     NOT NULL COMMENT '统计日期 YYYY-MM-DD',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    pay_method_sk       BIGINT          NOT NULL DEFAULT -1 COMMENT '支付方式代理键',
    pay_cnt             DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '支付成功笔数',
    pay_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '实付合计，单位：元',
    pay_fee_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '手续费合计，单位：元',
    net_receipt         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '净收款合计，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_date, channel_sk, pay_method_sk)
) COMMENT='DWS·支付日汇总（日×渠道×支付方式）';

-- ---------------------------------------------------------------------------
-- 退货日汇总 · 粒度：日 × 渠道 × 品类（用 product 一级类目退化或 product_sk 汇总前聚合）
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_return_d;
CREATE TABLE dws_return_d (
    snapshot_date       DATE     NOT NULL COMMENT '统计日期 YYYY-MM-DD',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '商品代理键（可替换为类目维）',
    return_qty          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退货数量，单位：件',
    refund_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退款金额，单位：元',
    return_line_cnt     DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退货行数',
    return_cost_amount  DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退回成本，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_date, channel_sk, product_sk)
) COMMENT='DWS·退货日汇总（日×渠道×商品）';

-- ---------------------------------------------------------------------------
-- 会员日快照 · 快照表 · 粒度：日 × 会员
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_member_snapshot_d;
CREATE TABLE dws_member_snapshot_d (
    snapshot_date       DATE     NOT NULL COMMENT '快照日期 YYYY-MM-DD',
    member_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '首访/归属渠道',
    lifecycle_stage     VARCHAR(32)     NOT NULL DEFAULT 'NEW' COMMENT '生命周期',
    is_active_1d        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '当日是否活跃 0/1',
    is_active_7d        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '近7日是否活跃 0/1',
    order_cnt_ltd       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '历史订单次数',
    pay_amount_ltd      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '历史实付累计，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_date, member_sk)
) COMMENT='DWS·会员日快照（日×会员，快照表）';

-- ---------------------------------------------------------------------------
-- 库存日汇总 · 粒度：日 × 仓 × 商品
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_inventory_d;
CREATE TABLE dws_inventory_d (
    snapshot_date       DATE     NOT NULL COMMENT '统计日期 YYYY-MM-DD',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '仓/门店代理键',
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '商品代理键',
    inbound_qty         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '当日入库数量，单位：件',
    outbound_qty        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '当日出库数量，单位：件',
    ending_qty          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '日末结存数量，单位：件',
    ending_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '日末结存成本金额，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_date, store_sk, product_sk)
) COMMENT='DWS·库存日汇总（日×仓×商品）';

-- ---------------------------------------------------------------------------
-- 渠道获客日汇总 · 粒度：日 × 渠道
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_channel_acq_d;
CREATE TABLE dws_channel_acq_d (
    snapshot_date       DATE     NOT NULL COMMENT '统计日期 YYYY-MM-DD',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    new_member_cnt      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '新增注册会员数',
    pay_user_cnt        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '当日付费用户数',
    gmv_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '渠道GMV，单位：元',
    refund_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '渠道退款，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_date, channel_sk)
) COMMENT='DWS·渠道获客与成交日汇总（日×渠道）';

-- ---------------------------------------------------------------------------
-- 费用月汇总 · 粒度：月 × 渠道 × 费用类型
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_expense_m;
CREATE TABLE dws_expense_m (
    snapshot_month      VARCHAR(7)      NOT NULL COMMENT '统计月 YYYY-MM',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    expense_type_sk     BIGINT          NOT NULL DEFAULT -1 COMMENT '费用类型代理键',
    brand_code          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '品牌编码',
    expense_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费用合计，单位：元',
    expense_cnt         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费用笔数',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算合计，单位：元',
    variance_amount     DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算差额=预算-实际，单位：元',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_month, channel_sk, expense_type_sk, brand_code)
) COMMENT='DWS·费用月汇总（月×渠道×费用类型×品牌）';

-- ---------------------------------------------------------------------------
-- 预算月汇总 · 粒度：月 × 渠道 × 费用类型
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dws_budget_m;
CREATE TABLE dws_budget_m (
    snapshot_month      VARCHAR(7)      NOT NULL COMMENT '统计月 YYYY-MM',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    expense_type_sk     BIGINT          NOT NULL DEFAULT -1 COMMENT '费用类型代理键',
    brand_code          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '品牌编码',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算合计，单位：元',
    actual_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '实际费用合计，单位：元',
    variance_amount     DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '差额，单位：元',
    achievement_rate    DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '执行率%',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (snapshot_month, channel_sk, expense_type_sk, brand_code)
) COMMENT='DWS·预算vs实际月汇总（月×渠道×费用类型×品牌）';
