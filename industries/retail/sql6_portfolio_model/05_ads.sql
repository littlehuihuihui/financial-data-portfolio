-- ADS 层 · 8 张视图（仅读 DWS/DIM，禁止直读 ODS）
USE retail_finance;

CREATE OR REPLACE VIEW v_overview AS
SELECT
    snapshot_month,
    SUM(revenue) AS total_revenue,
    SUM(profit) AS total_profit,
    ROUND(SUM(profit) / NULLIF(SUM(revenue), 0) * 100, 2) AS gross_margin_rate,
    ROUND(SUM(return_amount) / NULLIF(SUM(revenue), 0) * 100, 2) AS return_rate,
    SUM(order_count) AS total_orders
FROM dws_sales_monthly
GROUP BY snapshot_month
ORDER BY snapshot_month DESC;

CREATE OR REPLACE VIEW v_brand AS
SELECT
    snapshot_month,
    brand_name,
    SUM(revenue) AS brand_revenue,
    SUM(profit) AS brand_profit,
    ROUND(SUM(profit) / NULLIF(SUM(revenue), 0) * 100, 2) AS brand_margin_rate,
    ROUND(SUM(revenue) / NULLIF((SELECT SUM(revenue) FROM dws_sales_monthly s2 WHERE s2.snapshot_month = s1.snapshot_month), 0) * 100, 2) AS revenue_share
FROM dws_sales_monthly s1
GROUP BY snapshot_month, brand_name
ORDER BY snapshot_month DESC, brand_revenue DESC;

CREATE OR REPLACE VIEW v_channel AS
SELECT
    snapshot_month,
    channel_name,
    SUM(revenue) AS channel_revenue,
    SUM(profit) AS channel_profit,
    ROUND(SUM(profit) / NULLIF(SUM(revenue), 0) * 100, 2) AS channel_margin_rate
FROM dws_sales_monthly
GROUP BY snapshot_month, channel_name
ORDER BY snapshot_month DESC, channel_revenue DESC;

CREATE OR REPLACE VIEW v_income_statement AS
SELECT
    snapshot_month,
    SUM(revenue) AS total_revenue,
    SUM(revenue) - SUM(profit) AS total_cost,
    SUM(profit) AS gross_profit,
    ROUND(SUM(profit) / NULLIF(SUM(revenue), 0) * 100, 2) AS gross_margin
FROM dws_sales_monthly
GROUP BY snapshot_month
ORDER BY snapshot_month DESC;

-- 杜邦：ROE = 净利润 / 所有者权益（权益来自 dws_asset_monthly，禁止用库存当权益）
CREATE OR REPLACE VIEW v_dupont AS
SELECT
    p.snapshot_month,
    p.brand_name,
    ROUND(p.net_profit / NULLIF(p.revenue, 0) * 100, 2) AS net_profit_margin,
    ROUND(p.revenue / NULLIF(a.total_assets, 0), 2) AS asset_turnover,
    ROUND(a.total_assets / NULLIF(a.equity, 0), 2) AS equity_multiplier,
    ROUND(p.net_profit / NULLIF(a.equity, 0) * 100, 2) AS roe
FROM (
    SELECT s.snapshot_month, s.brand_name,
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
LEFT JOIN dws_asset_monthly a
    ON p.snapshot_month = a.snapshot_month AND p.brand_name = a.brand_name;

-- 资产负债表 ADS
CREATE OR REPLACE VIEW v_balance_sheet AS
SELECT
    snapshot_month,
    brand_name,
    cash,
    accounts_receivable,
    inventory,
    fixed_assets,
    total_assets,
    accounts_payable,
    debt,
    total_liabilities,
    equity
FROM dws_asset_monthly
ORDER BY snapshot_month DESC, total_assets DESC;

-- 现金流三分类（与看板 04/06 同源 dws_cashflow_monthly）
CREATE OR REPLACE VIEW v_cashflow AS
SELECT
    c.snapshot_month,
    c.brand_name,
    c.operating_cashflow,
    c.investing_cashflow,
    c.financing_cashflow,
    c.net_cashflow,
    c.operating_inflow AS total_inflow,
    (c.operating_outflow + ABS(LEAST(c.investing_cashflow, 0)) + ABS(LEAST(c.financing_cashflow, 0))) AS total_outflow,
    ROUND(c.operating_cashflow / NULLIF(p.net_profit, 0), 2) AS profit_to_cash_ratio
FROM dws_cashflow_monthly c
LEFT JOIN (
    SELECT s.snapshot_month, s.brand_name,
        SUM(s.profit) - IFNULL(e.expense_amount, 0) AS net_profit
    FROM dws_sales_monthly s
    LEFT JOIN (
        SELECT snapshot_month, brand_name, SUM(expense_amount) AS expense_amount
        FROM dws_expense_monthly GROUP BY snapshot_month, brand_name
    ) e ON s.snapshot_month = e.snapshot_month AND s.brand_name = e.brand_name
    GROUP BY s.snapshot_month, s.brand_name, e.expense_amount
) p ON c.snapshot_month = p.snapshot_month AND c.brand_name = p.brand_name
ORDER BY c.snapshot_month DESC;

CREATE OR REPLACE VIEW v_cashflow_statement AS
SELECT * FROM v_cashflow;

CREATE OR REPLACE VIEW v_tax_analysis AS
SELECT
    CAST(REPLACE(t.snapshot_month, '-', '') AS UNSIGNED) AS month_id,
    t.snapshot_month,
    t.brand_name,
    t.tax_type,
    t.taxable_amount,
    t.tax_amount,
    t.effective_tax_rate,
    t.industry_avg_rate AS industry_avg_tax_rate,
    ROUND(t.effective_tax_rate - t.industry_avg_rate, 2) AS tax_rate_gap,
    CASE
        WHEN ABS(t.effective_tax_rate - t.industry_avg_rate) > 2 THEN
            IF(t.effective_tax_rate > t.industry_avg_rate, '偏高', '偏低')
        ELSE '正常'
    END AS tax_burden_status
FROM dws_tax_monthly t;

CREATE OR REPLACE VIEW v_budget AS
SELECT
    snapshot_month,
    brand_code,
    channel_code,
    expense_type,
    budget_amount,
    actual_amount,
    variance_amount AS variance,
    achievement_rate,
    budget_version
FROM dws_budget_monthly
ORDER BY snapshot_month DESC, brand_code, channel_code;

-- 库存周转：仅 DWS（日销来自 dws_sales_daily）
CREATE OR REPLACE VIEW v_inventory AS
SELECT
    DATE_FORMAT(i.snapshot_date, '%Y-%m') AS snapshot_month,
    i.brand_name,
    i.category_name,
    SUM(i.stock_amount) AS total_stock,
    ROUND(SUM(i.stock_amount) / NULLIF(AVG(s.daily_sales), 0), 2) AS turnover_days
FROM dws_inventory_daily i
LEFT JOIN (
    SELECT DATE_FORMAT(snapshot_date, '%Y-%m') AS month,
           brand_name,
           SUM(revenue) / NULLIF(COUNT(DISTINCT snapshot_date), 0) AS daily_sales
    FROM dws_sales_daily
    GROUP BY DATE_FORMAT(snapshot_date, '%Y-%m'), brand_name
) s
    ON DATE_FORMAT(i.snapshot_date, '%Y-%m') = s.month
   AND i.brand_name = s.brand_name
GROUP BY DATE_FORMAT(i.snapshot_date, '%Y-%m'), i.brand_name, i.category_name
ORDER BY snapshot_month DESC;
