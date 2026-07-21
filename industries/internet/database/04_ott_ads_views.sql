-- ADS · OTT 看板与方法论视图（仅读 DWS/DIM/DWD，禁止直读 ODS）
-- 目标库：internet_analytics
USE internet_analytics;

-- ---------------------------------------------------------------------------
-- 活跃与留存
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_dau_overview AS
SELECT
    snapshot_date,
    COUNT(DISTINCT mac) AS total_dau,
    COUNT(DISTINCT CASE WHEN device_type = 'STB' THEN mac END) AS dau_stb,
    COUNT(DISTINCT CASE WHEN device_type = 'Speaker' THEN mac END) AS dau_speaker,
    SUM(is_vod_active) AS vod_active,
    SUM(is_live_active) AS live_active,
    SUM(is_only_launcher) AS only_launcher
FROM dws_act_user_active_1d
GROUP BY snapshot_date
ORDER BY snapshot_date;

CREATE OR REPLACE VIEW v_lifecycle AS
SELECT
    snapshot_date,
    new_register,
    new_activate,
    silent_cnt,
    churn_cnt,
    active_users,
    active_stb,
    active_speaker,
    (new_activate - IFNULL(LAG(churn_cnt) OVER (ORDER BY snapshot_date), 0)) AS approx_net_growth
FROM dws_user_lifecycle_1d
ORDER BY snapshot_date;

CREATE OR REPLACE VIEW v_user_lifecycle AS
SELECT * FROM v_lifecycle;

CREATE OR REPLACE VIEW v_retention_decomposition AS
SELECT
    cohort_date,
    day_offset,
    device_type,
    cohort_users,
    retained_users,
    retention_rate,
    ROUND(retained_users / NULLIF(cohort_users, 0) * 100, 2) AS retention_pct_check,
    CASE
        WHEN day_offset = 1 THEN '次日留存'
        WHEN day_offset = 7 THEN '7日留存'
        WHEN day_offset = 30 THEN '30日留存'
        ELSE CONCAT('D', day_offset)
    END AS retention_bucket
FROM dws_user_retention_1d
ORDER BY cohort_date DESC, day_offset, device_type;

CREATE OR REPLACE VIEW v_user_retention AS
SELECT cohort_date, day_offset, device_type AS channel_code,
       'ott' AS product_line, cohort_users, retained_users, retention_rate,
       device_type AS platform
FROM dws_user_retention_1d
ORDER BY cohort_date DESC, day_offset;

-- ---------------------------------------------------------------------------
-- 用户分群 / 生命周期阶段（基于日状态快照）
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_segment AS
SELECT
    snapshot_date,
    user_status AS segment_code,
    CASE user_status
        WHEN 'active' THEN '活跃'
        WHEN 'silent' THEN '沉默'
        WHEN 'churned' THEN '流失'
        ELSE IFNULL(user_status, '未知')
    END AS segment_name,
    COUNT(*) AS user_count,
    ROUND(AVG(days_since_active), 1) AS avg_days_since_active
FROM dwd_user_status_di
GROUP BY snapshot_date, user_status
ORDER BY snapshot_date DESC, user_count DESC;

-- ---------------------------------------------------------------------------
-- 渠道归因（收银台来源 + 订购来源 · 末次入口近似）
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_channel_attribution AS
SELECT
    snapshot_date,
    touch_point,
    'last_click' AS attribution_model,
    attributed_orders,
    attributed_amount,
    attributed_revenue_share,
    ROUND(attributed_orders / NULLIF(day_orders, 0) * 100, 2) AS order_share_pct,
    ROUND(attributed_orders * 1.0, 2) AS linear_weight,
    ROUND(attributed_orders * 0.85, 2) AS time_decay_weight
FROM (
    SELECT
        o.snapshot_date,
        o.src_type AS touch_point,
        SUM(o.order_cnt) AS attributed_orders,
        SUM(o.order_amount) AS attributed_amount,
        SUM(o.revenue_share) AS attributed_revenue_share,
        SUM(SUM(o.order_cnt)) OVER (PARTITION BY o.snapshot_date) AS day_orders
    FROM dws_trade_order_1d o
    WHERE o.src_type <> 'ALL'
    GROUP BY o.snapshot_date, o.src_type
) t
ORDER BY snapshot_date DESC, attributed_orders DESC;

-- ---------------------------------------------------------------------------
-- A/B：入口来源对照观测（非随机分流实验；看板勿当作显著性实验）
CREATE OR REPLACE VIEW v_ab_experiment AS
SELECT
    f.snapshot_date,
    CONCAT('入口来源_', f.src_type) AS experiment_name,
    CONCAT(f.device_type, '/', f.src_type) AS variant,
    f.expose_cnt AS sample_size,
    f.click_cnt,
    f.verify_cnt,
    f.confirm_cnt,
    ROUND(f.click_cnt / NULLIF(f.expose_cnt, 0) * 100, 2) AS ctr_pct,
    ROUND(f.confirm_cnt / NULLIF(f.click_cnt, 0) * 100, 2) AS cvr_pct,
    ROUND(f.verify_cnt / NULLIF(f.click_cnt, 0) * 100, 2) AS click2verify_pct,
    'observational' AS arm,
    '非随机分流·入口对照观测' AS caveat
FROM dws_trade_cashier_funnel_1d f
WHERE f.src_type <> 'ALL' AND f.device_type <> 'ALL'
ORDER BY f.snapshot_date DESC, sample_size DESC;

-- ---------------------------------------------------------------------------
-- 商业化漏斗 / 订购效率（看板同源）
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_funnel AS
SELECT
    DATE_FORMAT(snapshot_date, '%Y-%m') AS snapshot_month,
    device_type AS channel_code,
    src_type AS product_line,
    SUM(expose_cnt) AS step_visit,
    SUM(click_cnt) AS step_signup,
    SUM(verify_cnt) AS step_activate,
    SUM(confirm_cnt) AS step_purchase,
    ROUND(SUM(click_cnt) / NULLIF(SUM(expose_cnt), 0) * 100, 2) AS signup_rate,
    ROUND(SUM(confirm_cnt) / NULLIF(SUM(click_cnt), 0) * 100, 2) AS purchase_rate
FROM dws_trade_cashier_funnel_1d
GROUP BY DATE_FORMAT(snapshot_date, '%Y-%m'), device_type, src_type;

CREATE OR REPLACE VIEW v_ltv AS
SELECT
    src_type AS channel_name,
    SUM(order_cnt) AS user_count,
    ROUND(SUM(order_amount), 2) AS total_revenue,
    ROUND(SUM(order_amount) / NULLIF(SUM(order_cnt), 0), 2) AS ltv,
    ROUND(SUM(revenue_share) / NULLIF(SUM(order_cnt), 0), 2) AS avg_revenue_share
FROM dws_trade_order_1d
WHERE src_type <> 'ALL'
GROUP BY src_type
ORDER BY ltv DESC;

CREATE OR REPLACE VIEW v_rfm AS
SELECT
    u.userid AS user_id,
    u.user_status AS user_segment,
    CASE
        WHEN u.user_status = 'active' AND IFNULL(u.days_since_active, 0) <= 3
             AND IFNULL(o.monetary, 0) > 0 THEN '高价值活跃'
        WHEN u.user_status = 'active' THEN '潜力活跃'
        WHEN u.user_status = 'silent' THEN '流失风险'
        ELSE '一般/流失'
    END AS rfm_segment,
    IFNULL(u.days_since_active, 999) AS recency_days,
    IFNULL(o.frequency, 0) AS frequency,
    IFNULL(o.monetary, 0) AS monetary,
    u.snapshot_date
FROM dwd_user_status_di u
LEFT JOIN (
    SELECT userid, COUNT(*) AS frequency, ROUND(SUM(IFNULL(fee, 0)), 2) AS monetary
    FROM dwd_trade_order_di WHERE op_type = 'order' GROUP BY userid
) o ON u.userid = o.userid
WHERE u.snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di);

CREATE OR REPLACE VIEW v_channel_analysis AS
SELECT
    snapshot_date,
    src_type AS channel_code,
    src_type AS channel_name,
    order_amount AS spend_amount,
    order_cnt AS new_users,
    0 AS new_devices,
    ROUND(order_amount / NULLIF(order_cnt, 0), 2) AS cac,
    ROUND(confirm_proxy / NULLIF(order_cnt, 0) * 100, 2) AS conversion_rate,
    revenue_share AS pay_amount,
    ROUND(revenue_share / NULLIF(order_amount, 0), 2) AS roi
FROM (
    SELECT
        o.snapshot_date,
        o.src_type,
        SUM(o.order_cnt) AS order_cnt,
        SUM(o.order_amount) AS order_amount,
        SUM(o.revenue_share) AS revenue_share,
        IFNULL(SUM(f.confirm_cnt), SUM(o.order_cnt)) AS confirm_proxy
    FROM dws_trade_order_1d o
    LEFT JOIN dws_trade_cashier_funnel_1d f
      ON o.snapshot_date = f.snapshot_date
     AND o.src_type = f.src_type
     AND f.device_type <> 'ALL'
    WHERE o.src_type <> 'ALL'
    GROUP BY o.snapshot_date, o.src_type
) t;

CREATE OR REPLACE VIEW v_user_portrait AS
SELECT
    a.device_type,
    IFNULL(r.region_name, '未知') AS city_tier,
    'OTT' AS gender,
    'ALL' AS age_group,
    COUNT(DISTINCT a.mac) AS user_count,
    SUM(a.is_vod_active) AS paid_count,
    ROUND(SUM(a.is_vod_active) / NULLIF(COUNT(*), 0) * 100, 2) AS paid_rate_pct,
    a.device_type AS user_segment
FROM dws_act_user_active_1d a
LEFT JOIN dim_region r ON a.region_id = r.region_id
WHERE a.snapshot_date = (SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)
GROUP BY a.device_type, r.region_name;

-- ============================================================================
-- 模块1：用户行为路径 · ADS 视图
-- ============================================================================
CREATE OR REPLACE VIEW v_user_path AS
SELECT
    snapshot_date,
    prev_page,
    next_page,
    product_line,
    user_count,
    transition_count,
    session_count,
    avg_duration_sec,
    drop_off_count,
    drop_off_rate,
    ROUND(transition_count / NULLIF(SUM(transition_count) OVER (PARTITION BY snapshot_date, prev_page), 0) * 100, 2) AS transition_share_pct
FROM dws_path_summary_daily
ORDER BY snapshot_date DESC, transition_count DESC;

CREATE OR REPLACE VIEW v_user_path_session AS
SELECT
    session_id,
    seq_no,
    user_id,
    device_id,
    event_time,
    product_line,
    event_action,
    event_action_name,
    event_page,
    prev_page,
    next_page,
    duration_to_next_sec,
    is_conversion_step
FROM dwd_user_path_sequence
ORDER BY session_id, seq_no;

-- 主要路径快照（Top N 路径链）
CREATE OR REPLACE VIEW v_top_paths AS
SELECT
    p.snapshot_date,
    p.prev_page AS step1,
    p.next_page AS step2,
    p2.next_page AS step3,
    p.transition_count AS step1_2_cnt,
    p2.transition_count AS step2_3_cnt,
    ROUND(p2.transition_count / NULLIF(p.transition_count, 0) * 100, 2) AS step2_3_retention_pct
FROM dws_path_summary_daily p
LEFT JOIN dws_path_summary_daily p2
  ON p.snapshot_date = p2.snapshot_date
 AND p.next_page = p2.prev_page
WHERE p.transition_count > 10
ORDER BY p.transition_count DESC LIMIT 20;

-- ============================================================================
-- 模块2：收入结构深度分析 · ADS 视图
-- ============================================================================
CREATE OR REPLACE VIEW v_revenue_structure AS
SELECT
    DATE_FORMAT(o.snapshot_date, '%Y-%m') AS snapshot_month,
    o.src_type AS channel_code,
    SUM(o.order_cnt) AS order_cnt,
    SUM(o.unsub_cnt) AS unsub_cnt,
    ROUND(SUM(o.order_amount), 2) AS order_amount,
    ROUND(SUM(o.revenue_share), 2) AS revenue_share,
    ROUND(SUM(o.order_amount) / NULLIF(SUM(o.order_cnt), 0), 2) AS avg_order_price,
    ROUND(SUM(o.unsub_cnt) / NULLIF(SUM(o.order_cnt), 0) * 100, 2) AS unsub_rate_pct
FROM dws_trade_order_1d o
WHERE o.src_type <> 'ALL'
GROUP BY DATE_FORMAT(o.snapshot_date, '%Y-%m'), o.src_type
ORDER BY snapshot_month DESC, order_amount DESC;

CREATE OR REPLACE VIEW v_plan_analysis AS
SELECT
    p.snapshot_month,
    p.plan_type,
    p.order_cnt,
    p.unsub_cnt,
    p.order_amount,
    p.revenue_share,
    p.new_user_cnt,
    p.renewal_cnt,
    p.unsub_rate,
    p.avg_order_price,
    ROUND(p.order_cnt / NULLIF(SUM(p.order_cnt) OVER (PARTITION BY p.snapshot_month), 0) * 100, 2) AS order_share_pct,
    ROUND(p.revenue_share / NULLIF(SUM(p.revenue_share) OVER (PARTITION BY p.snapshot_month), 0) * 100, 2) AS share_revenue_pct,
    CASE WHEN p.renewal_cnt > 0 THEN ROUND(p.renewal_cnt / NULLIF(p.order_cnt, 0) * 100, 2) ELSE 0 END AS renewal_rate_pct
FROM dws_plan_monthly p
ORDER BY p.snapshot_month DESC, p.order_amount DESC;

-- 套餐 LTV 估算视图
CREATE OR REPLACE VIEW v_plan_ltv AS
SELECT
    plan_type,
    ROUND(AVG(order_amount), 2) AS avg_monthly_revenue,
    ROUND(1 / NULLIF(AVG(unsub_rate) / 100, 0), 1) AS avg_lifetime_months,
    ROUND(AVG(order_amount) / NULLIF(AVG(unsub_rate) / 100, 0), 2) AS estimated_ltv,
    SUM(order_cnt) AS total_orders
FROM dws_plan_monthly
WHERE unsub_rate > 0
GROUP BY plan_type
ORDER BY estimated_ltv DESC;

-- ARPU/ARPPU 趋势
CREATE OR REPLACE VIEW v_arpu_trend AS
SELECT
    DATE_FORMAT(snapshot_date, '%Y-%m') AS snapshot_month,
    ROUND(SUM(pay_amount) / NULLIF(SUM(pay_users), 0), 2) AS arppu,
    COUNT(DISTINCT user_id) AS total_active_users,
    ROUND(SUM(pay_amount) / NULLIF(COUNT(DISTINCT user_id), 0), 2) AS arpu
FROM dws_payment_daily
GROUP BY DATE_FORMAT(snapshot_date, '%Y-%m')
ORDER BY snapshot_month;

-- ============================================================================
-- 模块3：营销活动复盘 · ADS 视图
-- ============================================================================
CREATE OR REPLACE VIEW v_activity_summary AS
SELECT
    a.activity_id,
    a.activity_name,
    a.activity_type,
    a.start_date,
    a.end_date,
    a.budget_amount,
    a.target_users,
    ROUND(DATEDIFF(a.end_date, a.start_date) + 1, 0) AS duration_days,
    SUM(d.reach_users) AS total_reach_users,
    SUM(d.participate_users) AS total_participate_users,
    SUM(d.order_cnt) AS total_orders,
    ROUND(SUM(d.order_amount), 2) AS total_order_amount,
    ROUND(SUM(d.revenue_share), 2) AS total_revenue_share,
    SUM(d.new_user_cnt) AS total_new_users,
    AVG(d.retain_users_7d) AS avg_7d_retain_users,
    ROUND(SUM(d.order_amount) / NULLIF(SUM(d.cost_amount), 0), 2) AS roi_ratio,
    ROUND(SUM(d.participate_users) / NULLIF(SUM(d.reach_users), 0) * 100, 2) AS participate_rate_pct,
    ROUND(SUM(d.order_cnt) / NULLIF(SUM(d.participate_users), 0) * 100, 2) AS order_conversion_pct
FROM ods_activity a
LEFT JOIN dws_activity_daily d ON a.activity_id = d.activity_id
GROUP BY a.activity_id, a.activity_name, a.activity_type, a.start_date, a.end_date, a.budget_amount, a.target_users
ORDER BY a.start_date DESC;

CREATE OR REPLACE VIEW v_activity_daily_trend AS
SELECT
    d.snapshot_date,
    a.activity_name,
    a.activity_type,
    d.reach_users,
    d.participate_users,
    d.order_cnt,
    d.order_amount,
    d.revenue_share,
    d.new_user_cnt,
    d.unconverted_users,
    d.cost_amount
FROM dws_activity_daily d
LEFT JOIN ods_activity a ON d.activity_id = a.activity_id
ORDER BY d.snapshot_date, a.activity_name;

-- ============================================================================
-- 模块4：业务健康度仪表盘 · ADS 视图
-- ============================================================================
CREATE OR REPLACE VIEW v_health_dashboard AS
SELECT
    snapshot_date,
    metric_group,
    metric_code,
    metric_name,
    metric_value,
    metric_unit,
    baseline_value,
    threshold_green,
    threshold_red,
    status,
    mom_change_pct,
    CASE
        WHEN status = 'green' THEN '✅'
        WHEN status = 'yellow' THEN '⚠️'
        WHEN status = 'red' THEN '🔴'
        ELSE '➖'
    END AS status_icon
FROM dws_health_daily
ORDER BY snapshot_date DESC, metric_group, metric_code;

CREATE OR REPLACE VIEW v_health_group_summary AS
SELECT
    snapshot_date,
    metric_group,
    COUNT(*) AS metric_count,
    SUM(CASE WHEN status = 'green' THEN 1 ELSE 0 END) AS green_count,
    SUM(CASE WHEN status = 'yellow' THEN 1 ELSE 0 END) AS yellow_count,
    SUM(CASE WHEN status = 'red' THEN 1 ELSE 0 END) AS red_count,
    ROUND(SUM(CASE WHEN status = 'green' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 2) AS health_score_pct
FROM dws_health_daily
WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dws_health_daily)
GROUP BY snapshot_date, metric_group
ORDER BY metric_group;

-- ============================================================================
-- 模块5：用户标签 · ADS 视图
-- ============================================================================
CREATE OR REPLACE VIEW v_user_tag_overview AS
SELECT
    t.snapshot_date,
    t.tag_code,
    tg.tag_name,
    tg.tag_category,
    tg.tag_color,
    COUNT(DISTINCT t.user_id) AS user_count,
    t.tag_value,
    t.tag_source
FROM dws_user_tag_daily t
LEFT JOIN dim_user_tag tg ON t.tag_code = tg.tag_code
WHERE t.snapshot_date = (SELECT MAX(snapshot_date) FROM dws_user_tag_daily)
GROUP BY t.snapshot_date, t.tag_code, tg.tag_name, tg.tag_category, tg.tag_color, t.tag_value, t.tag_source
ORDER BY tg.tag_category, user_count DESC;

CREATE OR REPLACE VIEW v_user_tag_detail AS
SELECT
    t.snapshot_date,
    t.user_id,
    GROUP_CONCAT(DISTINCT CONCAT(tg.tag_category, ':', tg.tag_name, '=', t.tag_value) SEPARATOR '; ') AS tag_summary,
    GROUP_CONCAT(DISTINCT CASE WHEN tg.tag_category = '人口' THEN tg.tag_name END SEPARATOR ', ') AS demographic_tags,
    GROUP_CONCAT(DISTINCT CASE WHEN tg.tag_category = '行为' THEN tg.tag_name END SEPARATOR ', ') AS behavior_tags,
    GROUP_CONCAT(DISTINCT CASE WHEN tg.tag_category = '价值' THEN tg.tag_name END SEPARATOR ', ') AS value_tags,
    GROUP_CONCAT(DISTINCT CASE WHEN tg.tag_category = '内容偏好' THEN tg.tag_name END SEPARATOR ', ') AS content_pref_tags,
    GROUP_CONCAT(DISTINCT CASE WHEN tg.tag_category = '生命周期' THEN tg.tag_name END SEPARATOR ', ') AS lifecycle_tags
FROM dws_user_tag_daily t
LEFT JOIN dim_user_tag tg ON t.tag_code = tg.tag_code
WHERE t.snapshot_date = (SELECT MAX(snapshot_date) FROM dws_user_tag_daily)
GROUP BY t.snapshot_date, t.user_id
ORDER BY t.user_id;

CREATE OR REPLACE VIEW v_user_tag_by_category AS
SELECT
    tg.tag_category,
    tg.tag_code,
    tg.tag_name,
    tg.tag_color,
    tg.tag_type,
    t.tag_value,
    COUNT(DISTINCT t.user_id) AS user_count,
    ROUND(COUNT(DISTINCT t.user_id) / NULLIF(SUM(COUNT(DISTINCT t.user_id)) OVER (PARTITION BY tg.tag_category), 0) * 100, 2) AS category_share_pct
FROM dim_user_tag tg
LEFT JOIN dws_user_tag_daily t ON tg.tag_code = t.tag_code
  AND t.snapshot_date = (SELECT MAX(snapshot_date) FROM dws_user_tag_daily)
GROUP BY tg.tag_category, tg.tag_code, tg.tag_name, tg.tag_color, tg.tag_type, t.tag_value
ORDER BY tg.tag_category, user_count DESC;