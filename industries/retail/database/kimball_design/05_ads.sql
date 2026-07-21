-- =============================================================================
-- ADS · 应用数据层（看板视图；仅引用 DWS + DIM，禁止直连 ODS）
-- =============================================================================
USE retail_kimball;

-- ---------------------------------------------------------------------------
-- ADS-01 经营总览（按日）
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_ops_overview AS
SELECT
    s.snapshot_date,
    ROUND(SUM(s.gmv_amount), 2)              AS gmv_amount,          -- 单位：元
    ROUND(SUM(s.gross_profit), 2)            AS gross_profit,        -- 单位：元
    ROUND(SUM(s.gross_profit) / NULLIF(SUM(s.gmv_amount), 0) * 100, 2) AS gross_margin_pct,
    ROUND(SUM(s.order_qty), 2)               AS order_qty,
    ROUND(SUM(s.order_line_cnt), 0)          AS order_line_cnt
FROM dws_sales_d s
GROUP BY s.snapshot_date;

-- ---------------------------------------------------------------------------
-- ADS-02 渠道分析
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_channel_analysis AS
SELECT
    a.snapshot_date,
    c.channel_code,
    c.channel_name,
    c.channel_type,
    ROUND(a.gmv_amount, 2)                   AS gmv_amount,          -- 单位：元
    ROUND(a.refund_amount, 2)                AS refund_amount,       -- 单位：元
    ROUND(a.new_member_cnt, 0)               AS new_member_cnt,
    ROUND(a.pay_user_cnt, 0)                 AS pay_user_cnt,
    ROUND(a.refund_amount / NULLIF(a.gmv_amount, 0) * 100, 2) AS return_rate_pct
FROM dws_channel_acq_d a
LEFT JOIN dim_channel c ON a.channel_sk = c.channel_sk;

-- ---------------------------------------------------------------------------
-- ADS-03 会员画像/分层（取最新快照日可在查询侧过滤）
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_member_portrait AS
SELECT
    m.snapshot_date,
    d.lifecycle_stage,
    d.city_tier,
    d.member_level,
    d.gender,
    COUNT(*)                                 AS member_cnt,
    ROUND(SUM(m.pay_amount_ltd), 2)          AS pay_amount_ltd,
    ROUND(SUM(m.is_active_7d), 0)            AS active_7d_cnt
FROM dws_member_snapshot_d m
LEFT JOIN dim_member d ON m.member_sk = d.member_sk
GROUP BY m.snapshot_date, d.lifecycle_stage, d.city_tier, d.member_level, d.gender;

-- ---------------------------------------------------------------------------
-- ADS-04 库存监控
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_inventory_monitor AS
SELECT
    i.snapshot_date,
    st.store_name,
    p.product_name,
    p.brand_name,
    p.category_l1,
    ROUND(i.ending_qty, 2)                   AS ending_qty,          -- 单位：件
    ROUND(i.ending_amount, 2)                AS ending_amount,       -- 单位：元
    ROUND(i.outbound_qty, 2)                 AS outbound_qty,        -- 单位：件
    CASE WHEN i.ending_qty <= 0 THEN 'Y' ELSE 'N' END AS is_stockout
FROM dws_inventory_d i
LEFT JOIN dim_store st ON i.store_sk = st.store_sk
LEFT JOIN dim_product p ON i.product_sk = p.product_sk;

-- ---------------------------------------------------------------------------
-- ADS-05 退货分析
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_return_analysis AS
SELECT
    r.snapshot_date,
    c.channel_name,
    p.category_l1,
    p.brand_name,
    ROUND(SUM(r.refund_amount), 2)           AS refund_amount,       -- 单位：元
    ROUND(SUM(r.return_qty), 2)              AS return_qty,          -- 单位：件
    ROUND(SUM(r.return_line_cnt), 0)         AS return_line_cnt
FROM dws_return_d r
LEFT JOIN dim_channel c ON r.channel_sk = c.channel_sk
LEFT JOIN dim_product p ON r.product_sk = p.product_sk
GROUP BY r.snapshot_date, c.channel_name, p.category_l1, p.brand_name;

-- ---------------------------------------------------------------------------
-- ADS-06 支付结构
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_payment_structure AS
SELECT
    p.snapshot_date,
    c.channel_name,
    pm.pay_method_name,
    ROUND(SUM(p.pay_amount), 2)              AS pay_amount,
    ROUND(SUM(p.pay_fee_amount), 2)          AS pay_fee_amount,
    ROUND(SUM(p.net_receipt), 2)             AS net_receipt,
    ROUND(SUM(p.pay_cnt), 0)                 AS pay_cnt
FROM dws_payment_d p
LEFT JOIN dim_channel c ON p.channel_sk = c.channel_sk
LEFT JOIN dim_payment_method pm ON p.pay_method_sk = pm.pay_method_sk
GROUP BY p.snapshot_date, c.channel_name, pm.pay_method_name;

-- ---------------------------------------------------------------------------
-- ADS-07 费用结构（财务看板）
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_expense_structure AS
SELECT
    e.snapshot_month,
    c.channel_name,
    t.expense_type_name,
    t.expense_category,
    e.brand_code,
    ROUND(SUM(e.expense_amount), 2)          AS expense_amount,
    ROUND(SUM(e.budget_amount), 2)           AS budget_amount,
    ROUND(SUM(e.variance_amount), 2)         AS variance_amount,
    ROUND(SUM(e.expense_cnt), 0)             AS expense_cnt
FROM dws_expense_m e
LEFT JOIN dim_channel c ON e.channel_sk = c.channel_sk
LEFT JOIN dim_expense_type t ON e.expense_type_sk = t.expense_type_sk
GROUP BY e.snapshot_month, c.channel_name, t.expense_type_name, t.expense_category, e.brand_code;

-- ---------------------------------------------------------------------------
-- ADS-08 预算达成
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ads_budget_achievement AS
SELECT
    b.snapshot_month,
    c.channel_name,
    t.expense_type_name,
    b.brand_code,
    ROUND(SUM(b.budget_amount), 2)           AS budget_amount,
    ROUND(SUM(b.actual_amount), 2)           AS actual_amount,
    ROUND(SUM(b.variance_amount), 2)         AS variance_amount,
    ROUND(AVG(b.achievement_rate), 2)        AS achievement_rate
FROM dws_budget_m b
LEFT JOIN dim_channel c ON b.channel_sk = c.channel_sk
LEFT JOIN dim_expense_type t ON b.expense_type_sk = t.expense_type_sk
GROUP BY b.snapshot_month, c.channel_name, t.expense_type_name, b.brand_code;
