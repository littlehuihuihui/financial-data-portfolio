-- ============================================================================
-- DWS 财务扩展（sql6 品牌名粒度）
-- 业务过程: 月度现金流三分类 / 月末资产负债 / 税务计提
-- 粒度: snapshot_month × brand_name（税务再 × tax_type）
-- 禁止收入系数造数；缺源时用可追溯推导并在 COMMENT 标明
-- ============================================================================
USE retail_finance;

-- 税务法定税率配置（可追溯，非看板硬编码）
CREATE TABLE IF NOT EXISTS dim_tax_rate (
    tax_type           VARCHAR(30)    NOT NULL COMMENT '税种',
    statutory_rate     DECIMAL(8,4)   NOT NULL COMMENT '法定税率',
    industry_avg_rate  DECIMAL(8,4)   NOT NULL COMMENT '行业平均有效税负%',
    taxable_base       VARCHAR(30)    NOT NULL DEFAULT 'revenue' COMMENT '税基: revenue|profit',
    notes              VARCHAR(200)   NULL,
    PRIMARY KEY (tax_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DIM-税务税率配置·全量';

INSERT INTO dim_tax_rate (tax_type, statutory_rate, industry_avg_rate, taxable_base, notes) VALUES
('增值税', 0.1300, 13.0000, 'revenue', '一般纳税人销项简化；无专票进项时用收入×法定税率落表'),
('企业所得税', 0.2500, 25.0000, 'profit', '应税所得≈利润表净利润（毛利-费用）；亏损月份税额为0')
ON DUPLICATE KEY UPDATE
    statutory_rate=VALUES(statutory_rate),
    industry_avg_rate=VALUES(industry_avg_rate),
    taxable_base=VALUES(taxable_base),
    notes=VALUES(notes);

-- 行业对标配置（利润质量净现比等）
CREATE TABLE IF NOT EXISTS cfg_industry_benchmark (
    metric_name   VARCHAR(50)   NOT NULL,
    industry_avg  DECIMAL(12,4) NOT NULL,
    notes         VARCHAR(200)  NULL,
    PRIMARY KEY (metric_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CFG-行业对标·全量';

INSERT INTO cfg_industry_benchmark (metric_name, industry_avg, notes) VALUES
('cash_to_profit_ratio', 0.9500, '运动零售净现比行业参考（经营现金流/净利润）')
ON DUPLICATE KEY UPDATE industry_avg=VALUES(industry_avg), notes=VALUES(notes);

-- 现金流费用分类映射
CREATE TABLE IF NOT EXISTS dim_cf_expense_class (
    expense_type   VARCHAR(30) NOT NULL,
    cf_class       VARCHAR(20) NOT NULL COMMENT 'operating|investing|financing',
    notes          VARCHAR(200) NULL,
    PRIMARY KEY (expense_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DIM-现金流费用分类·全量';

INSERT INTO dim_cf_expense_class (expense_type, cf_class, notes) VALUES
('平台佣金', 'operating', '经营性流出'),
('广告投放', 'operating', '经营性流出'),
('物流费用', 'operating', '经营性流出'),
('仓储费用', 'operating', '经营性流出'),
('其他', 'investing', '投资/资本性及其他流出近似'),
('门店租金', 'financing', '租赁相关筹资性流出近似'),
('人员工资', 'financing', '薪酬相关筹资性流出近似（与看板历史三分类一致）')
ON DUPLICATE KEY UPDATE cf_class=VALUES(cf_class), notes=VALUES(notes);

-- DWS · 月现金流三分类
CREATE TABLE IF NOT EXISTS dws_cashflow_monthly (
    snapshot_month       VARCHAR(7)     NOT NULL COMMENT 'YYYY-MM',
    brand_name           VARCHAR(30)    NOT NULL,
    operating_inflow     DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '支付回款流入·元',
    operating_outflow    DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '经营类费用流出·元',
    operating_cashflow   DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '经营活动净额·元',
    investing_cashflow   DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '投资活动净额·元',
    financing_cashflow   DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '筹资活动净额·元',
    net_cashflow         DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '三类合计·元',
    etl_batch_id         VARCHAR(50)    NULL,
    PRIMARY KEY (snapshot_month, brand_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DWS-月现金流三分类·增量表聚合';

-- DWS · 月资产负债（sql6 品牌名粒度）
CREATE TABLE IF NOT EXISTS dws_asset_monthly (
    snapshot_month       VARCHAR(7)     NOT NULL COMMENT 'YYYY-MM',
    brand_name           VARCHAR(30)    NOT NULL,
    cash                 DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '累计净现金流结存·元',
    accounts_receivable  DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '应收≈收入-回款(可追溯)·元',
    inventory            DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '月末库存·元',
    fixed_assets         DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '累计投资流出形成的固定资产近似·元',
    total_assets         DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '资产合计·元',
    accounts_payable     DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '应付职工薪酬≈当月工资·元',
    debt                 DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '租赁负债≈当月租金×12·元',
    total_liabilities    DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '负债合计·元',
    equity               DECIMAL(15,2)  NOT NULL DEFAULT 0 COMMENT '所有者权益=资产-负债·元',
    etl_batch_id         VARCHAR(50)    NULL,
    PRIMARY KEY (snapshot_month, brand_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DWS-月资产负债·快照推导';

-- DWS · 月税务（读 dim_tax_rate 落表，禁止看板直乘）
CREATE TABLE IF NOT EXISTS dws_tax_monthly (
    snapshot_month       VARCHAR(7)     NOT NULL,
    brand_name           VARCHAR(30)    NOT NULL,
    tax_type             VARCHAR(30)    NOT NULL,
    taxable_amount       DECIMAL(15,2)  NOT NULL DEFAULT 0,
    tax_amount           DECIMAL(15,2)  NOT NULL DEFAULT 0,
    paid_amount          DECIMAL(15,2)  NOT NULL DEFAULT 0,
    effective_tax_rate   DECIMAL(10,4)  NOT NULL DEFAULT 0 COMMENT '有效税负%',
    industry_avg_rate    DECIMAL(10,4)  NOT NULL DEFAULT 0,
    etl_batch_id         VARCHAR(50)    NULL,
    PRIMARY KEY (snapshot_month, brand_name, tax_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='DWS-月税务汇总·由销售/利润×dim_tax_rate';

-- ---------------------------------------------------------------------------
-- ETL: 现金流
-- ---------------------------------------------------------------------------
TRUNCATE TABLE dws_cashflow_monthly;

INSERT INTO dws_cashflow_monthly (
    snapshot_month, brand_name,
    operating_inflow, operating_outflow, operating_cashflow,
    investing_cashflow, financing_cashflow, net_cashflow, etl_batch_id
)
SELECT
    x.snapshot_month,
    x.brand_name,
    ROUND(x.operating_inflow, 2),
    ROUND(x.operating_outflow, 2),
    ROUND(x.operating_inflow - x.operating_outflow, 2),
    ROUND(-x.investing_outflow, 2),
    ROUND(-x.financing_outflow, 2),
    ROUND(
        x.operating_inflow - x.operating_outflow
        - x.investing_outflow - x.financing_outflow
    , 2),
    'etl_cf_monthly'
FROM (
    SELECT
        COALESCE(p.snapshot_month, e.snapshot_month) AS snapshot_month,
        COALESCE(p.brand_name, e.brand_name) AS brand_name,
        IFNULL(p.inflow, 0) AS operating_inflow,
        IFNULL(e.operating_out, 0) AS operating_outflow,
        IFNULL(e.investing_out, 0) AS investing_outflow,
        IFNULL(e.financing_out, 0) AS financing_outflow
    FROM (
        SELECT DATE_FORMAT(pay.payment_date, '%Y-%m') AS snapshot_month,
            b.brand_name,
            SUM(pay.payment_amount) AS inflow
        FROM ods_payment pay
        INNER JOIN dim_brand b ON pay.brand_code = b.brand_code
        GROUP BY DATE_FORMAT(pay.payment_date, '%Y-%m'), b.brand_name
    ) p
    LEFT JOIN (
        SELECT DATE_FORMAT(ex.expense_date, '%Y-%m') AS snapshot_month,
            b.brand_name,
            SUM(CASE WHEN IFNULL(m.cf_class, 'operating') = 'operating' THEN ex.expense_amount ELSE 0 END) AS operating_out,
            SUM(CASE WHEN m.cf_class = 'investing' THEN ex.expense_amount ELSE 0 END) AS investing_out,
            SUM(CASE WHEN m.cf_class = 'financing' THEN ex.expense_amount ELSE 0 END) AS financing_out
        FROM ods_expense ex
        INNER JOIN dim_brand b ON ex.brand_code = b.brand_code
        LEFT JOIN dim_cf_expense_class m ON ex.expense_type = m.expense_type
        GROUP BY DATE_FORMAT(ex.expense_date, '%Y-%m'), b.brand_name
    ) e ON p.snapshot_month = e.snapshot_month AND p.brand_name = e.brand_name
) x;

-- ---------------------------------------------------------------------------
-- ETL: 资产负债
-- ---------------------------------------------------------------------------
TRUNCATE TABLE dws_asset_monthly;

INSERT INTO dws_asset_monthly (
    snapshot_month, brand_name,
    cash, accounts_receivable, inventory, fixed_assets, total_assets,
    accounts_payable, debt, total_liabilities, equity, etl_batch_id
)
SELECT
    base.snapshot_month,
    base.brand_name,
    ROUND(IFNULL(cum.cum_cash, 0), 2) AS cash,
    ROUND(GREATEST(IFNULL(base.revenue, 0) - IFNULL(base.payment, 0), 0), 2) AS accounts_receivable,
    ROUND(IFNULL(inv.inventory, 0), 2) AS inventory,
    ROUND(IFNULL(cum.cum_fa, 0), 2) AS fixed_assets,
    ROUND(
        IFNULL(cum.cum_cash, 0)
        + GREATEST(IFNULL(base.revenue, 0) - IFNULL(base.payment, 0), 0)
        + IFNULL(inv.inventory, 0)
        + IFNULL(cum.cum_fa, 0)
    , 2) AS total_assets,
    ROUND(IFNULL(base.wages, 0), 2) AS accounts_payable,
    ROUND(IFNULL(base.rent, 0) * 12, 2) AS debt,
    ROUND(IFNULL(base.wages, 0) + IFNULL(base.rent, 0) * 12, 2) AS total_liabilities,
    ROUND(
        IFNULL(cum.cum_cash, 0)
        + GREATEST(IFNULL(base.revenue, 0) - IFNULL(base.payment, 0), 0)
        + IFNULL(inv.inventory, 0)
        + IFNULL(cum.cum_fa, 0)
        - (IFNULL(base.wages, 0) + IFNULL(base.rent, 0) * 12)
    , 2) AS equity,
    'etl_asset_monthly'
FROM (
    SELECT
        m.snapshot_month,
        m.brand_name,
        IFNULL(s.revenue, 0) AS revenue,
        IFNULL(p.payment, 0) AS payment,
        IFNULL(w.wages, 0) AS wages,
        IFNULL(r.rent, 0) AS rent
    FROM (
        SELECT DISTINCT snapshot_month, brand_name FROM dws_cashflow_monthly
        UNION
        SELECT DISTINCT snapshot_month, brand_name FROM dws_sales_monthly
    ) m
    LEFT JOIN (
        SELECT snapshot_month, brand_name, SUM(revenue) AS revenue
        FROM dws_sales_monthly GROUP BY snapshot_month, brand_name
    ) s ON m.snapshot_month = s.snapshot_month AND m.brand_name = s.brand_name
    LEFT JOIN (
        SELECT DATE_FORMAT(pay.payment_date, '%Y-%m') AS snapshot_month,
            b.brand_name, SUM(pay.payment_amount) AS payment
        FROM ods_payment pay
        INNER JOIN dim_brand b ON pay.brand_code = b.brand_code
        GROUP BY DATE_FORMAT(pay.payment_date, '%Y-%m'), b.brand_name
    ) p ON m.snapshot_month = p.snapshot_month AND m.brand_name = p.brand_name
    LEFT JOIN (
        SELECT DATE_FORMAT(ex.expense_date, '%Y-%m') AS snapshot_month,
            b.brand_name, SUM(ex.expense_amount) AS wages
        FROM ods_expense ex
        INNER JOIN dim_brand b ON ex.brand_code = b.brand_code
        WHERE ex.expense_type = '人员工资'
        GROUP BY DATE_FORMAT(ex.expense_date, '%Y-%m'), b.brand_name
    ) w ON m.snapshot_month = w.snapshot_month AND m.brand_name = w.brand_name
    LEFT JOIN (
        SELECT DATE_FORMAT(ex.expense_date, '%Y-%m') AS snapshot_month,
            b.brand_name, SUM(ex.expense_amount) AS rent
        FROM ods_expense ex
        INNER JOIN dim_brand b ON ex.brand_code = b.brand_code
        WHERE ex.expense_type = '门店租金'
        GROUP BY DATE_FORMAT(ex.expense_date, '%Y-%m'), b.brand_name
    ) r ON m.snapshot_month = r.snapshot_month AND m.brand_name = r.brand_name
) base
LEFT JOIN (
    SELECT i.snapshot_month, i.brand_name, SUM(i.stock_amount) AS inventory
    FROM (
        SELECT DATE_FORMAT(snapshot_date, '%Y-%m') AS snapshot_month,
            brand_name, snapshot_date, stock_amount,
            ROW_NUMBER() OVER (
                PARTITION BY DATE_FORMAT(snapshot_date, '%Y-%m'), brand_name, category_name, store_name
                ORDER BY snapshot_date DESC
            ) AS rn
        FROM dws_inventory_daily
    ) i
    WHERE i.rn = 1
    GROUP BY i.snapshot_month, i.brand_name
) inv ON base.snapshot_month = inv.snapshot_month AND base.brand_name = inv.brand_name
LEFT JOIN (
    SELECT
        c.snapshot_month,
        c.brand_name,
        SUM(c.net_cashflow) OVER (
            PARTITION BY c.brand_name ORDER BY c.snapshot_month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cum_cash,
        SUM(ABS(LEAST(c.investing_cashflow, 0))) OVER (
            PARTITION BY c.brand_name ORDER BY c.snapshot_month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cum_fa
    FROM dws_cashflow_monthly c
) cum ON base.snapshot_month = cum.snapshot_month AND base.brand_name = cum.brand_name;

-- ---------------------------------------------------------------------------
-- ETL: 税务（利润=毛利-费用，与利润表口径一致）
-- ---------------------------------------------------------------------------
TRUNCATE TABLE dws_tax_monthly;

INSERT INTO dws_tax_monthly (
    snapshot_month, brand_name, tax_type,
    taxable_amount, tax_amount, paid_amount, effective_tax_rate, industry_avg_rate, etl_batch_id
)
SELECT
    p.snapshot_month,
    p.brand_name,
    t.tax_type,
    ROUND(CASE WHEN t.taxable_base = 'revenue' THEN p.revenue ELSE GREATEST(p.net_profit, 0) END, 2),
    ROUND(
        CASE WHEN t.taxable_base = 'revenue' THEN p.revenue ELSE GREATEST(p.net_profit, 0) END
        * t.statutory_rate
    , 2),
    ROUND(
        CASE WHEN t.taxable_base = 'revenue' THEN p.revenue ELSE GREATEST(p.net_profit, 0) END
        * t.statutory_rate
    , 2),
    ROUND(
        CASE WHEN t.taxable_base = 'revenue' THEN t.statutory_rate * 100
             WHEN p.revenue > 0 THEN GREATEST(p.net_profit, 0) * t.statutory_rate / p.revenue * 100
             ELSE 0 END
    , 4),
    t.industry_avg_rate,
    'etl_tax_monthly'
FROM (
    SELECT
        s.snapshot_month,
        s.brand_name,
        SUM(s.revenue) AS revenue,
        SUM(s.profit) - IFNULL(e.expense_amount, 0) AS net_profit
    FROM dws_sales_monthly s
    LEFT JOIN (
        SELECT snapshot_month, brand_name, SUM(expense_amount) AS expense_amount
        FROM dws_expense_monthly
        GROUP BY snapshot_month, brand_name
    ) e ON s.snapshot_month = e.snapshot_month AND s.brand_name = e.brand_name
    GROUP BY s.snapshot_month, s.brand_name, e.expense_amount
) p
CROSS JOIN dim_tax_rate t;
