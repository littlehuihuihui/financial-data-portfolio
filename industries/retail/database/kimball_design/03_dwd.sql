-- =============================================================================
-- DWD · 明细事实层（仅引用 ODS + DIM；禁止被 ADS 直接跳过 DWS 滥用时仍允许经 DWS）
-- =============================================================================
USE retail_kimball;

-- ---------------------------------------------------------------------------
-- BP1 销售下单 · 订单行事实 · 粒度：订单行
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_order_item;
CREATE TABLE fact_order_item (
    order_item_sk       BIGINT          NOT NULL COMMENT '事实主键（可用源order_item_id）',
    order_id            BIGINT          NOT NULL COMMENT '订单ID（退化维）',
    order_line_no       INT             NOT NULL DEFAULT 0 COMMENT '行号（退化维）',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '下单日期代理键',
    member_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员代理键',
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '商品代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键',
    promo_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '促销代理键，无活动-1',
    order_qty           DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '销售数量，单位：件',
    list_amount         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '挂牌金额，单位：元',
    discount_amount     DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '折扣金额，单位：元',
    payable_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '应付金额，单位：元',
    cost_amount         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '成本金额，单位：元',
    order_status        VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '订单行状态',
    order_date          DATE     NOT NULL COMMENT '下单业务日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (order_item_sk),
    KEY idx_dwd_oi_date (date_sk),
    KEY idx_dwd_oi_member (member_sk),
    KEY idx_dwd_oi_product (product_sk),
    KEY idx_dwd_oi_channel (channel_sk)
) COMMENT='DWD·订单行事实表（粒度：订单行）';

-- ---------------------------------------------------------------------------
-- BP2 支付收款 · 支付流水事实 · 粒度：支付单
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_payment;
CREATE TABLE fact_payment (
    payment_sk          BIGINT          NOT NULL COMMENT '支付事实主键',
    payment_id          BIGINT          NOT NULL COMMENT '支付业务键（退化）',
    order_id            BIGINT          NOT NULL COMMENT '订单ID（退化维）',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '支付日期代理键',
    member_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    pay_method_sk       BIGINT          NOT NULL DEFAULT -1 COMMENT '支付方式代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键（若有）',
    pay_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '实付金额，单位：元',
    pay_fee_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '手续费，单位：元',
    net_receipt         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '净收款=实付-手续费，单位：元',
    pay_cnt             DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '支付笔数度量，通常1',
    pay_status          VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '支付状态',
    pay_date            DATE     NOT NULL COMMENT '支付业务日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (payment_sk),
    UNIQUE KEY uk_dwd_pay_id (payment_id),
    KEY idx_dwd_pay_date (date_sk),
    KEY idx_dwd_pay_member (member_sk)
) COMMENT='DWD·支付流水事实表（粒度：支付单）';

-- ---------------------------------------------------------------------------
-- BP3 售后退货 · 退货行事实 · 粒度：退货明细行
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_return;
CREATE TABLE fact_return (
    return_item_sk      BIGINT          NOT NULL COMMENT '退货事实主键',
    return_id           BIGINT          NOT NULL COMMENT '退货单ID（退化）',
    order_id            BIGINT          NOT NULL COMMENT '原订单ID（退化）',
    order_item_sk       BIGINT          NOT NULL DEFAULT -1 COMMENT '原订单行事实键',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '退货日期代理键',
    member_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员代理键',
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '商品代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键',
    return_qty          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退货数量，单位：件',
    refund_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退款金额，单位：元',
    return_cost_amount  DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '退回成本，单位：元',
    return_reason       VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '退货原因',
    return_status       VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '退货状态',
    return_date         DATE     NOT NULL COMMENT '退货业务日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (return_item_sk),
    KEY idx_dwd_ret_date (date_sk),
    KEY idx_dwd_ret_product (product_sk)
) COMMENT='DWD·退货行事实表（粒度：退货明细行）';

-- ---------------------------------------------------------------------------
-- BP4 会员注册 · 注册事件事实 · 粒度：一次注册
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_member_register;
CREATE TABLE fact_member_register (
    register_sk         BIGINT          NOT NULL COMMENT '注册事实主键',
    member_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '会员代理键',
    member_id           BIGINT          NOT NULL COMMENT '会员业务键（退化）',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '注册日期代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '注册渠道代理键',
    region_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '注册地区代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '注册关联门店，无则-1',
    register_cnt        DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '注册次数度量，通常1',
    gender              VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '注册时性别快照',
    age_group           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '注册时年龄段快照',
    city_tier           VARCHAR(16)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '城市等级快照',
    member_level        VARCHAR(32)     NOT NULL DEFAULT 'NORMAL' COMMENT '初始等级',
    register_status     VARCHAR(32)     NOT NULL DEFAULT 'SUCCESS' COMMENT '注册状态',
    register_date       DATE     NOT NULL COMMENT '注册业务日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (register_sk),
    KEY idx_dwd_reg_date (date_sk),
    KEY idx_dwd_reg_channel (channel_sk)
) COMMENT='DWD·会员注册事实表（粒度：一次注册成功）';

-- ---------------------------------------------------------------------------
-- BP5 库存变动 · 库存事务事实 · 粒度：库存事务明细
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_inventory_txn;
CREATE TABLE fact_inventory_txn (
    inv_txn_sk          BIGINT          NOT NULL COMMENT '库存事实主键',
    txn_id              BIGINT          NOT NULL COMMENT '源事务ID（退化）',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '事务日期代理键',
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '商品代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '仓/门店代理键',
    region_sk           BIGINT          NOT NULL DEFAULT -1 COMMENT '地区代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '关联渠道，无则-1',
    txn_type            VARCHAR(32)     NOT NULL DEFAULT 'UNKNOWN' COMMENT 'IN/OUT/ADJ/TRANSFER',
    txn_qty             DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '变动数量，单位：件',
    txn_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '变动金额（成本），单位：元',
    abs_txn_qty         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '变动数量绝对值，单位：件',
    biz_doc_no          VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '业务单据号（退化）',
    txn_status          VARCHAR(32)     NOT NULL DEFAULT 'POSTED' COMMENT '过账状态',
    txn_date            DATE     NOT NULL COMMENT '事务业务日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (inv_txn_sk),
    UNIQUE KEY uk_dwd_inv_txn (txn_id),
    KEY idx_dwd_inv_date (date_sk),
    KEY idx_dwd_inv_product (product_sk),
    KEY idx_dwd_inv_store (store_sk)
) COMMENT='DWD·库存事务事实表（粒度：库存事务明细）';

-- ---------------------------------------------------------------------------
-- BP6 费用发生 · 费用行事实 · 粒度：费用明细行
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_expense;
CREATE TABLE fact_expense (
    expense_sk          BIGINT          NOT NULL COMMENT '费用事实主键',
    expense_id          BIGINT          NOT NULL COMMENT '费用业务键（退化）',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '费用日期代理键',
    expense_type_sk     BIGINT          NOT NULL DEFAULT -1 COMMENT '费用类型代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键',
    product_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '关联商品，公司级费用-1',
    brand_code          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '品牌编码（退化维）',
    expense_amount      DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费用金额，单位：元',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '关联预算额快照，单位：元',
    expense_cnt         DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '费用笔数度量，通常1',
    cost_center         VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '成本中心',
    expense_status      VARCHAR(32)     NOT NULL DEFAULT 'POSTED' COMMENT '费用状态',
    expense_date        DATE     NOT NULL COMMENT '费用业务日期 YYYY-MM-DD',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (expense_sk),
    UNIQUE KEY uk_dwd_expense_id (expense_id),
    KEY idx_dwd_exp_date (date_sk),
    KEY idx_dwd_exp_type (expense_type_sk)
) COMMENT='DWD·费用发生事实表（粒度：费用行）';

-- ---------------------------------------------------------------------------
-- BP7 预算编制 · 预算行事实 · 粒度：月×品牌×渠道×费用类型×版本
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS fact_budget;
CREATE TABLE fact_budget (
    budget_sk           BIGINT          NOT NULL COMMENT '预算事实主键',
    budget_id           BIGINT          NOT NULL COMMENT '预算业务键（退化）',
    date_sk             BIGINT          NOT NULL DEFAULT -1 COMMENT '预算月首日代理键',
    expense_type_sk     BIGINT          NOT NULL DEFAULT -1 COMMENT '费用类型代理键',
    channel_sk          BIGINT          NOT NULL DEFAULT -1 COMMENT '渠道代理键',
    store_sk            BIGINT          NOT NULL DEFAULT -1 COMMENT '门店代理键，总部-1',
    brand_code          VARCHAR(32)     NOT NULL DEFAULT '-1' COMMENT '品牌编码（退化维）',
    budget_version      VARCHAR(20)     NOT NULL DEFAULT 'v1' COMMENT '预算版本（退化维）',
    budget_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算金额，单位：元',
    budget_cnt          DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT '预算行数度量，通常1',
    budget_status       VARCHAR(32)     NOT NULL DEFAULT 'APPROVED' COMMENT '预算状态',
    owner_dept          VARCHAR(64)     NOT NULL DEFAULT 'UNKNOWN' COMMENT '编制部门',
    snapshot_month      VARCHAR(7)      NOT NULL COMMENT '预算月 YYYY-MM',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入仓时间',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (budget_sk),
    UNIQUE KEY uk_dwd_budget_id (budget_id),
    KEY idx_dwd_bud_month (snapshot_month),
    KEY idx_dwd_bud_type (expense_type_sk)
) COMMENT='DWD·预算编制事实表（粒度：预算行）';

-- 兼容旧名（可选）：历史文档/脚本仍写 dwd_fct_* 时可指向 fact_*
-- CREATE OR REPLACE VIEW dwd_fct_order_item AS SELECT * FROM fact_order_item;
