-- 从贴源 ODS 灌入 DWS（ETL 层职责；ADS 不得执行此类直读）
USE retail_finance;

TRUNCATE TABLE dws_payment_monthly;
INSERT INTO dws_payment_monthly (
    snapshot_month, brand_code, channel_code, payment_method,
    payment_amount, payment_count, success_amount, refund_amount, etl_batch_id
)
SELECT
    DATE_FORMAT(payment_date, '%Y-%m') AS snapshot_month,
    IFNULL(NULLIF(brand_code, ''), 'ALL'),
    IFNULL(NULLIF(channel_code, ''), 'ALL'),
    IFNULL(NULLIF(payment_method, ''), 'ALL'),
    ROUND(SUM(IFNULL(payment_amount, 0)), 2),
    COUNT(*),
    ROUND(SUM(CASE WHEN payment_status IN ('成功', 'SUCCESS', 'paid', '已支付') THEN IFNULL(payment_amount, 0) ELSE 0 END), 2),
    ROUND(SUM(CASE WHEN payment_status IN ('退款', 'REFUND') THEN IFNULL(payment_amount, 0) ELSE 0 END), 2),
    'etl_payment_monthly'
FROM ods_payment
GROUP BY DATE_FORMAT(payment_date, '%Y-%m'),
         IFNULL(NULLIF(brand_code, ''), 'ALL'),
         IFNULL(NULLIF(channel_code, ''), 'ALL'),
         IFNULL(NULLIF(payment_method, ''), 'ALL');

TRUNCATE TABLE dws_budget_monthly;
INSERT INTO dws_budget_monthly (
    snapshot_month, brand_code, channel_code, expense_type,
    budget_amount, actual_amount, variance_amount, achievement_rate, budget_version, etl_batch_id
)
SELECT
    CONCAT(b.budget_year, '-', LPAD(b.budget_month, 2, '0')) AS snapshot_month,
    IFNULL(b.brand_code, 'ALL'),
    IFNULL(b.channel_code, 'ALL'),
    IFNULL(b.expense_type, 'ALL'),
    ROUND(SUM(IFNULL(b.budget_amount, 0)), 2),
    ROUND(SUM(IFNULL(e.actual_amount, 0)), 2),
    ROUND(SUM(IFNULL(b.budget_amount, 0)) - SUM(IFNULL(e.actual_amount, 0)), 2),
    ROUND(SUM(IFNULL(e.actual_amount, 0)) / NULLIF(SUM(IFNULL(b.budget_amount, 0)), 0) * 100, 2),
    MAX(b.budget_version),
    'etl_budget_monthly'
FROM ods_budget b
LEFT JOIN (
    SELECT
        YEAR(expense_date) AS y,
        MONTH(expense_date) AS m,
        brand_code,
        channel_code,
        expense_type,
        SUM(IFNULL(expense_amount, 0)) AS actual_amount
    FROM ods_expense
    GROUP BY YEAR(expense_date), MONTH(expense_date), brand_code, channel_code, expense_type
) e ON b.budget_year = e.y
   AND b.budget_month = e.m
   AND b.brand_code <=> e.brand_code
   AND b.channel_code <=> e.channel_code
   AND b.expense_type <=> e.expense_type
GROUP BY CONCAT(b.budget_year, '-', LPAD(b.budget_month, 2, '0')),
         IFNULL(b.brand_code, 'ALL'),
         IFNULL(b.channel_code, 'ALL'),
         IFNULL(b.expense_type, 'ALL');
