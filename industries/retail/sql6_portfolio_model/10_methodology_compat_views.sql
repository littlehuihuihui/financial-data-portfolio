-- 分析方法论 SQL 兼容视图（零售）
-- 采购 / 广告 ROI（方法论只引用 v_* / DWS / ADS，不直写 ods_*）
USE retail_finance;

-- 采购 ADS：读 DWD（禁止 ADS→ODS）
CREATE OR REPLACE VIEW v_purchase_order AS
SELECT purchase_id AS po_id, purchase_date AS po_date, supplier_code, supplier_name,
       brand_code, category_code, purchase_amount AS po_amount, purchase_qty,
       status
FROM dwd_fct_purchase;

CREATE OR REPLACE VIEW v_purchase_receipt AS
SELECT purchase_id AS receipt_id, IFNULL(receipt_date, purchase_date) AS receipt_date,
       supplier_code, brand_code, category_code,
       IFNULL(NULLIF(receipt_qty, 0), purchase_qty) AS receipt_qty,
       CASE WHEN invoice_amount > 0 THEN invoice_amount ELSE purchase_amount END AS receipt_amount
FROM dwd_fct_purchase
WHERE receipt_flag = 1 OR receipt_qty > 0;

-- 兼容旧名（看板/脚本过渡期）；新 playbook 请用 v_purchase_*
CREATE OR REPLACE VIEW ods_purchase_order AS SELECT * FROM v_purchase_order;
CREATE OR REPLACE VIEW ods_purchase_receipt AS SELECT * FROM v_purchase_receipt;

-- 渠道广告/营销投入产出（读 DWS，替代 ods_ad_cost）
CREATE OR REPLACE VIEW v_ad_channel_roi AS
SELECT
    e.snapshot_month,
    e.channel_name,
    SUM(e.expense_amount) AS ad_spend,
    SUM(IFNULL(s.revenue, 0)) AS attributed_revenue,
    ROUND(SUM(IFNULL(s.revenue, 0)) / NULLIF(SUM(e.expense_amount), 0), 2) AS revenue_per_ad_yuan
FROM dws_expense_monthly e
LEFT JOIN (
    SELECT snapshot_month, channel_name, SUM(revenue) AS revenue
    FROM dws_sales_monthly
    GROUP BY snapshot_month, channel_name
) s ON e.snapshot_month = s.snapshot_month AND e.channel_name = s.channel_name
WHERE e.expense_type LIKE '%广告%'
   OR e.expense_type LIKE '%营销%'
   OR e.expense_type LIKE '%投放%'
GROUP BY e.snapshot_month, e.channel_name;

-- 费用预算执行（补 variance，替代幻想列 variance_amount）
CREATE OR REPLACE VIEW v_expense_budget AS
SELECT
    snapshot_month,
    brand_name,
    channel_name,
    expense_type,
    expense_amount,
    budget_amount,
    ROUND(budget_amount - expense_amount, 2) AS variance_amount,
    ROUND(expense_amount / NULLIF(budget_amount, 0) * 100, 2) AS budget_usage_pct
FROM dws_expense_monthly;
