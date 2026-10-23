-- DWS 层 · 5 张汇总表
USE retail_finance;

CREATE TABLE dws_sales_daily (
    snapshot_date DATE NOT NULL,
    brand_name VARCHAR(30),
    channel_name VARCHAR(20),
    category_name VARCHAR(30),
    gmv DECIMAL(15,2) COMMENT 'GMV',
    revenue DECIMAL(15,2) COMMENT '净收入',
    profit DECIMAL(15,2) COMMENT '利润',
    order_count INT COMMENT '订单数',
    return_amount DECIMAL(15,2) COMMENT '退货金额',
    return_count INT COMMENT '退货订单数',
    PRIMARY KEY (snapshot_date, brand_name, channel_name, category_name)
) COMMENT '日销售汇总';

CREATE TABLE dws_sales_monthly (
    snapshot_month VARCHAR(7) NOT NULL,
    brand_name VARCHAR(30),
    channel_name VARCHAR(20),
    category_name VARCHAR(30),
    revenue DECIMAL(15,2),
    profit DECIMAL(15,2),
    order_count INT,
    return_amount DECIMAL(15,2),
    PRIMARY KEY (snapshot_month, brand_name, channel_name, category_name)
) COMMENT '月销售汇总';

CREATE TABLE dws_expense_monthly (
    snapshot_month VARCHAR(7) NOT NULL,
    brand_name VARCHAR(30),
    channel_name VARCHAR(20),
    expense_type VARCHAR(30),
    expense_amount DECIMAL(15,2),
    budget_amount DECIMAL(15,2),
    PRIMARY KEY (snapshot_month, brand_name, channel_name, expense_type)
) COMMENT '月费用汇总';

CREATE TABLE dws_inventory_daily (
    snapshot_date DATE NOT NULL,
    brand_name VARCHAR(30),
    category_name VARCHAR(30),
    store_name VARCHAR(50),
    stock_amount DECIMAL(15,2),
    stock_qty INT,
    turnover_days DECIMAL(10,2) COMMENT '周转天数',
    PRIMARY KEY (snapshot_date, brand_name, category_name, store_name)
) COMMENT '日库存汇总';

CREATE TABLE dws_store_daily (
    snapshot_date DATE NOT NULL,
    store_name VARCHAR(50),
    region VARCHAR(20),
    revenue DECIMAL(15,2),
    profit DECIMAL(15,2),
    pingsiao DECIMAL(10,2) COMMENT '坪效',
    PRIMARY KEY (snapshot_date, store_name)
) COMMENT '日门店汇总·快照表';

-- DWS · 支付日汇总（业务过程=收款；粒度=日×支付方式；供资金预测，禁止看板直读 ODS）
CREATE TABLE IF NOT EXISTS dws_payment_daily (
    snapshot_date DATE NOT NULL COMMENT '业务日',
    brand_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    channel_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    payment_method VARCHAR(30) NOT NULL DEFAULT '其他' COMMENT '支付方式/资金账户代理',
    payment_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '支付流入·元',
    payment_count INT NOT NULL DEFAULT 0,
    success_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    refund_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(50),
    PRIMARY KEY (snapshot_date, brand_code, channel_code, payment_method)
) COMMENT '日支付汇总·增量表聚合·快照按日';

-- DWS · 费用日汇总（业务过程=费用支出；粒度=日×费用类型；供资金流出）
CREATE TABLE IF NOT EXISTS dws_expense_daily (
    snapshot_date DATE NOT NULL COMMENT '费用发生日',
    brand_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    channel_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    expense_type VARCHAR(30) NOT NULL DEFAULT 'ALL',
    expense_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '费用金额·元',
    budget_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    expense_count INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(50),
    PRIMARY KEY (snapshot_date, brand_code, channel_code, expense_type)
) COMMENT '日费用汇总·增量表聚合·快照按日';

-- DWS · 支付月汇总（供 ADS 现金流，禁止 ADS 直读 ODS）
CREATE TABLE IF NOT EXISTS dws_payment_monthly (
    snapshot_month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
    brand_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    channel_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'ALL',
    payment_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '支付流入·元',
    payment_count INT NOT NULL DEFAULT 0,
    success_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    refund_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(50),
    PRIMARY KEY (snapshot_month, brand_code, channel_code, payment_method)
) COMMENT '月支付汇总·增量表聚合结果';

-- DWS · 预算月汇总（供 ADS 预算达成）
CREATE TABLE IF NOT EXISTS dws_budget_monthly (
    snapshot_month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
    brand_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    channel_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    expense_type VARCHAR(30) NOT NULL DEFAULT 'ALL',
    budget_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    variance_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    achievement_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    budget_version VARCHAR(20) DEFAULT 'v1.0',
    etl_batch_id VARCHAR(50),
    PRIMARY KEY (snapshot_month, brand_code, channel_code, expense_type)
) COMMENT '月预算vs实际汇总·快照表';
