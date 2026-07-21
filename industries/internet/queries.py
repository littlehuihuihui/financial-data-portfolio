"""SQL builders for 广东移动 OTT 视频活跃分析看板（雪花模型 · internet_analytics）。"""
from __future__ import annotations

from datetime import date, timedelta


# ----------------------------- 时间维工具 -----------------------------
def parse_month_id(month) -> int:
    if month is None:
        return 202607
    s = str(month).strip().replace("-", "")
    if len(s) == 6 and s.isdigit():
        return int(s)
    raise ValueError(f"Invalid month: {month}")


def month_label(month_id: int) -> str:
    return f"{month_id // 100:04d}-{month_id % 100:02d}"


def month_bounds(month_id: int):
    y, m = divmod(month_id, 100)
    start = date(y, m, 1)
    end = date(y + 1, 1, 1) - timedelta(days=1) if m == 12 else date(y, m + 1, 1) - timedelta(days=1)
    return start, end


def shift_month(month_id: int, delta: int) -> int:
    y, m = divmod(month_id, 100)
    m += delta
    while m < 1:
        m += 12; y -= 1
    while m > 12:
        m -= 12; y += 1
    return y * 100 + m


DATA_MIN = date(2026, 4, 16)
DATA_MAX = date(2026, 7, 15)


def as_of(month_id: int) -> date:
    _, end = month_bounds(month_id)
    return min(end, DATA_MAX)


# ============================================================================
# 01 活跃总览
# ============================================================================
SQL_MAU_BY_TYPE = """
SELECT device_type, COUNT(DISTINCT mac) AS mau
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s
GROUP BY device_type
"""
SQL_UNIQUE_MAC = """
SELECT COUNT(DISTINCT mac) AS uv FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s
"""
SQL_DAU_TREND = """
SELECT snapshot_date, COUNT(DISTINCT mac) AS dau,
    COUNT(DISTINCT CASE WHEN device_type='STB' THEN mac END) AS dau_stb,
    COUNT(DISTINCT CASE WHEN device_type='Speaker' THEN mac END) AS dau_speaker
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s
GROUP BY snapshot_date ORDER BY snapshot_date
"""
SQL_ACTIVE_COMPOSE = """
SELECT
    SUM(is_vod_active) AS vod_active,
    SUM(is_live_active) AS live_active,
    SUM(is_only_launcher) AS only_launcher,
    COUNT(DISTINCT mac) AS total_mac
FROM dws_act_user_active_1d WHERE snapshot_date=%s
"""
SQL_MAU_TREND = """
SELECT month_label, device_type, mau FROM (
  SELECT DATE_FORMAT(snapshot_date,'%%Y-%%m') AS month_label, device_type,
         COUNT(DISTINCT mac) AS mau
  FROM dws_act_user_active_1d GROUP BY month_label, device_type
) t ORDER BY month_label
"""

# ============================================================================
# 02 开机活跃  03 点播活跃  04 直播活跃（统一从 dws_act_user_active_1d 取窗口）
# ============================================================================
SQL_LAUNCHER_KPI = """
SELECT COUNT(DISTINCT mac) AS boot_users,
    SUM(launcher_cnt) AS boot_cnt,
    ROUND(SUM(is_only_launcher)/NULLIF(COUNT(*),0)*100,2) AS only_launcher_pct,
    ROUND(SUM(vod_play_dur+live_play_dur)/3600,1) AS online_hours
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s
"""
SQL_LAUNCHER_BY_TYPE = """
SELECT device_type, COUNT(DISTINCT mac) AS boot_users, SUM(launcher_cnt) AS boot_cnt
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY device_type
"""
SQL_LAUNCHER_TREND = """
SELECT snapshot_date, SUM(launcher_cnt) AS boot_cnt, COUNT(DISTINCT mac) AS boot_users
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY snapshot_date ORDER BY snapshot_date
"""

SQL_VOD_KPI = """
SELECT COUNT(DISTINCT CASE WHEN is_vod_active=1 THEN mac END) AS uv,
    SUM(vod_play_cnt) AS vv,
    ROUND(SUM(vod_play_dur)/3600,1) AS play_hours,
    ROUND(SUM(vod_play_cnt)/NULLIF(COUNT(DISTINCT CASE WHEN is_vod_active=1 THEN mac END),0),2) AS vv_per_uv,
    ROUND(SUM(vod_play_dur)/60/NULLIF(COUNT(DISTINCT CASE WHEN is_vod_active=1 THEN mac END),0),1) AS min_per_uv
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s
"""
SQL_VOD_BY_TYPE = """
SELECT device_type,
    COUNT(DISTINCT CASE WHEN is_vod_active=1 THEN mac END) AS uv,
    SUM(vod_play_cnt) AS vv, ROUND(SUM(vod_play_dur)/3600,1) AS play_hours
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY device_type
"""
SQL_VOD_TREND = """
SELECT snapshot_date, SUM(vod_play_cnt) AS vv,
    COUNT(DISTINCT CASE WHEN is_vod_active=1 THEN mac END) AS uv,
    ROUND(SUM(vod_play_dur)/3600,1) AS play_hours
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY snapshot_date ORDER BY snapshot_date
"""

SQL_LIVE_KPI = """
SELECT COUNT(DISTINCT CASE WHEN is_live_active=1 THEN mac END) AS uv,
    ROUND(SUM(live_play_dur)/3600,1) AS play_hours
FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s
"""
SQL_LIVE_CHANNEL = """
SELECT c.channel_id, ch.channel_name, cc.channel_cat_name,
    SUM(c.vv) AS vv, SUM(c.uv) AS uv, ROUND(SUM(c.play_dur)/3600,1) AS play_hours
FROM dws_content_live_play_1d c
LEFT JOIN dim_live_channel ch ON c.channel_id=ch.channel_id
LEFT JOIN dim_channel_category cc ON c.channel_cat_id=cc.channel_cat_id
WHERE c.snapshot_date BETWEEN %s AND %s
GROUP BY c.channel_id, ch.channel_name, cc.channel_cat_name ORDER BY vv DESC
"""
SQL_LIVE_TREND = """
SELECT snapshot_date, SUM(vv) AS vv, SUM(uv) AS uv FROM dws_content_live_play_1d
WHERE snapshot_date BETWEEN %s AND %s GROUP BY snapshot_date ORDER BY snapshot_date
"""

# ============================================================================
# 05 内容·剧集
# ============================================================================
SQL_SERIES_TOP = """
SELECT s.series_id, se.series_name, cat.category_name, g.genre_name, se.is_kids,
    SUM(s.vv) AS vv, SUM(s.uv) AS uv, ROUND(SUM(s.play_dur)/3600,1) AS play_hours,
    ROUND(SUM(s.finish_cnt)/NULLIF(SUM(s.vv),0)*100,2) AS finish_rate
FROM dws_content_series_play_1d s
LEFT JOIN dim_content_series se ON s.series_id=se.series_id
LEFT JOIN dim_content_category cat ON s.category_id=cat.category_id
LEFT JOIN dim_content_genre g ON s.genre_id=g.genre_id
WHERE s.snapshot_date BETWEEN %s AND %s
GROUP BY s.series_id, se.series_name, cat.category_name, g.genre_name, se.is_kids
ORDER BY vv DESC LIMIT 15
"""
SQL_SERIES_BY_CATEGORY = """
SELECT cat.category_name, SUM(s.vv) AS vv, SUM(s.uv) AS uv
FROM dws_content_series_play_1d s LEFT JOIN dim_content_category cat ON s.category_id=cat.category_id
WHERE s.snapshot_date BETWEEN %s AND %s GROUP BY cat.category_name ORDER BY vv DESC
"""
SQL_SERIES_BY_GENRE = """
SELECT g.genre_name, SUM(s.vv) AS vv,
    ROUND(SUM(s.uv)/(SELECT COUNT(DISTINCT mac) FROM dws_act_user_active_1d WHERE snapshot_date BETWEEN %s AND %s)*100,2) AS penetration_pct
FROM dws_content_series_play_1d s LEFT JOIN dim_content_genre g ON s.genre_id=g.genre_id
WHERE s.snapshot_date BETWEEN %s AND %s GROUP BY g.genre_name ORDER BY vv DESC
"""

# ============================================================================
# 06 内容·单集与行为（近3天日志）
# ============================================================================
SQL_EPISODE_TOP = """
SELECT e.episode_id, ep.episode_name, ep.series_id, se.series_name, ep.episode_no,
    SUM(e.vv) AS vv, SUM(e.uv) AS uv, SUM(e.finish_cnt) AS finish_cnt
FROM dws_content_episode_play_1d e
LEFT JOIN dim_content_episode ep ON e.episode_id=ep.episode_id
LEFT JOIN dim_content_series se ON ep.series_id=se.series_id
WHERE e.snapshot_date BETWEEN %s AND %s
GROUP BY e.episode_id, ep.episode_name, ep.series_id, se.series_name, ep.episode_no
ORDER BY vv DESC LIMIT 15
"""
SQL_ACTION_DIST = """
SELECT action, COUNT(*) AS cnt FROM dwd_vod_play_di GROUP BY action ORDER BY cnt DESC
"""
SQL_COMPLETE_DIST = """
SELECT CASE
    WHEN complete_rate>=80 THEN '80-100%%'
    WHEN complete_rate>=60 THEN '60-80%%'
    WHEN complete_rate>=40 THEN '40-60%%'
    WHEN complete_rate>=20 THEN '20-40%%'
    ELSE '0-20%%' END AS bucket, COUNT(*) AS cnt
FROM dwd_vod_play_di WHERE action='stop' GROUP BY bucket ORDER BY bucket DESC
"""

# ============================================================================
# 07 完播与 QoS（近3天日志）
# ============================================================================
SQL_QOS_KPI = """
SELECT ROUND(AVG(complete_rate),2) AS avg_complete_rate,
    ROUND(SUM(is_finish)/NULLIF(SUM(CASE WHEN action='stop' THEN 1 ELSE 0 END),0)*100,2) AS finish_rate,
    ROUND(AVG(first_frame_ms),0) AS avg_first_frame_ms,
    ROUND(SUM(CASE WHEN stall_ms>0 THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0)*100,2) AS stall_rate
FROM dwd_vod_play_di WHERE action='stop'
"""
SQL_QOS_BY_TYPE = """
SELECT device_type, ROUND(AVG(complete_rate),2) AS avg_complete_rate,
    ROUND(AVG(first_frame_ms),0) AS avg_first_frame_ms,
    ROUND(AVG(stall_ms),0) AS avg_stall_ms
FROM dwd_vod_play_di WHERE action='stop' GROUP BY device_type
"""
SQL_QOS_SERIES = """
SELECT d.series_id, se.series_name, COUNT(*) AS plays,
    ROUND(AVG(d.complete_rate),2) AS avg_complete_rate,
    ROUND(SUM(d.is_finish)/NULLIF(COUNT(*),0)*100,2) AS finish_rate,
    ROUND(AVG(d.first_frame_ms),0) AS avg_first_frame_ms
FROM dwd_vod_play_di d LEFT JOIN dim_content_series se ON d.series_id=se.series_id
WHERE d.action='stop' GROUP BY d.series_id, se.series_name ORDER BY plays DESC LIMIT 12
"""

# ============================================================================
# 08 用户生命周期
# ============================================================================
SQL_LIFECYCLE_KPI = """
SELECT SUM(new_register) AS new_register, SUM(new_activate) AS new_activate,
    ROUND(AVG(silent_cnt),0) AS silent_cnt, MAX(churn_cnt) AS churn_cnt,
    ROUND(AVG(active_users),0) AS avg_active
FROM dws_user_lifecycle_1d WHERE snapshot_date BETWEEN %s AND %s
"""
SQL_LIFECYCLE_TREND = """
SELECT snapshot_date, new_register, new_activate, active_users, churn_cnt
FROM dws_user_lifecycle_1d WHERE snapshot_date BETWEEN %s AND %s ORDER BY snapshot_date
"""
SQL_USER_STATUS_DIST = """
SELECT user_status, COUNT(*) AS cnt FROM dwd_user_status_di
WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dwd_user_status_di) GROUP BY user_status
"""

# ============================================================================
# 09 留存
# ============================================================================
SQL_RETENTION_TREND = """
SELECT day_offset, ROUND(AVG(retention_rate),2) AS retention_rate
FROM dws_user_retention_1d GROUP BY day_offset ORDER BY day_offset
"""
SQL_RETENTION_MATRIX = """
SELECT cohort_date, day_offset, retention_rate, cohort_users
FROM dws_user_retention_1d WHERE cohort_date >= %s ORDER BY cohort_date DESC, day_offset LIMIT 60
"""

# ============================================================================
# 10 设备流转
# ============================================================================
SQL_DEVICE_TYPE_DIST = """
SELECT dt.device_type_name, COUNT(*) AS device_cnt
FROM dim_device d LEFT JOIN dim_device_type dt ON d.device_type_id=dt.device_type_id
GROUP BY dt.device_type_name
"""
SQL_DEVICE_MODEL_DIST = """
SELECT m.model_name, dt.device_type_name, COUNT(*) AS device_cnt
FROM dim_device d LEFT JOIN dim_device_model m ON d.model_id=m.model_id
LEFT JOIN dim_device_type dt ON m.device_type_id=dt.device_type_id
GROUP BY m.model_name, dt.device_type_name ORDER BY device_cnt DESC
"""
SQL_DEVICE_FW_DIST = """
SELECT f.fw_version, COUNT(*) AS device_cnt
FROM dim_device d LEFT JOIN dim_firmware f ON d.fw_id=f.fw_id GROUP BY f.fw_version ORDER BY device_cnt DESC
"""
SQL_DUAL_DEVICE = """
SELECT
    (SELECT COUNT(*) FROM (
        SELECT userid FROM dws_act_user_active_1d
        GROUP BY userid HAVING COUNT(DISTINCT device_type)>=2) t) AS dual_users,
    (SELECT COUNT(DISTINCT userid) FROM dws_act_user_active_1d) AS total_users
"""
SQL_ACTIVE_BY_REGION = """
SELECT r.region_name, COUNT(DISTINCT a.mac) AS active_mac
FROM dws_act_user_active_1d a LEFT JOIN dim_region r ON a.region_id=r.region_id
WHERE a.snapshot_date BETWEEN %s AND %s GROUP BY r.region_name ORDER BY active_mac DESC
"""

# ============================================================================
# 11 商业化漏斗
# ============================================================================
SQL_FUNNEL = """
SELECT SUM(expose_cnt) AS expose, SUM(click_cnt) AS click,
    SUM(verify_cnt) AS verify, SUM(confirm_cnt) AS confirm
FROM dws_trade_cashier_funnel_1d WHERE device_type='ALL' AND snapshot_date BETWEEN %s AND %s
"""
SQL_FUNNEL_BY_SRC = """
SELECT src_type, SUM(expose_cnt) AS expose, SUM(click_cnt) AS click,
    SUM(verify_cnt) AS verify, SUM(confirm_cnt) AS confirm,
    ROUND(SUM(verify_cnt)/NULLIF(SUM(click_cnt),0)*100,2) AS click2verify_pct
FROM dws_trade_cashier_funnel_1d WHERE device_type='ALL' AND src_type<>'ALL' AND snapshot_date BETWEEN %s AND %s
GROUP BY src_type
"""
SQL_FUNNEL_TREND = """
SELECT snapshot_date, SUM(expose_cnt) AS expose, SUM(confirm_cnt) AS confirm,
    ROUND(SUM(confirm_cnt)/NULLIF(SUM(expose_cnt),0)*100,2) AS conv_pct
FROM dws_trade_cashier_funnel_1d WHERE device_type='ALL' AND snapshot_date BETWEEN %s AND %s
GROUP BY snapshot_date ORDER BY snapshot_date
"""

# ============================================================================
# 12 订购与分成
# ============================================================================
SQL_ORDER_KPI = """
SELECT SUM(order_cnt) AS order_cnt, SUM(unsub_cnt) AS unsub_cnt,
    ROUND(SUM(order_amount),2) AS order_amount, ROUND(SUM(revenue_share),2) AS revenue_share
FROM dws_trade_order_1d WHERE snapshot_date BETWEEN %s AND %s
"""
SQL_ORDER_BY_PAYTYPE = """
SELECT pay_type, SUM(order_cnt) AS order_cnt, SUM(unsub_cnt) AS unsub_cnt,
    ROUND(SUM(order_amount),2) AS order_amount, ROUND(SUM(revenue_share),2) AS revenue_share
FROM dws_trade_order_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY pay_type ORDER BY order_amount DESC
"""
SQL_ORDER_BY_SRC = """
SELECT src_type, SUM(order_cnt) AS order_cnt
FROM dws_trade_order_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY src_type
"""
SQL_ORDER_TREND = """
SELECT snapshot_date, SUM(order_cnt) AS order_cnt, SUM(unsub_cnt) AS unsub_cnt,
    ROUND(SUM(revenue_share),2) AS revenue_share
FROM dws_trade_order_1d WHERE snapshot_date BETWEEN %s AND %s GROUP BY snapshot_date ORDER BY snapshot_date
"""

# ============================================================================
# 模块13：用户行为路径（基于 dwd_device_operation_wide）
# ============================================================================
# 用 LEAD 替代自连接，避免 80 万行宽表三重 JOIN 卡死前端
SQL_PATH_OVERVIEW = """
WITH ev AS (
    SELECT session_id, user_id, product_line, event_page, event_time, log_id
    FROM dwd_device_operation_wide
    WHERE event_date BETWEEN %s AND %s
      AND event_page IS NOT NULL
),
seq AS (
    SELECT
        event_page AS prev_page,
        LEAD(event_page) OVER (
            PARTITION BY session_id ORDER BY event_time, log_id
        ) AS next_page,
        product_line,
        user_id,
        session_id
    FROM ev
)
SELECT
    prev_page,
    next_page,
    product_line,
    COUNT(DISTINCT user_id) AS user_cnt,
    COUNT(*) AS trans_cnt,
    COUNT(DISTINCT session_id) AS sess_cnt
FROM seq
WHERE next_page IS NOT NULL
GROUP BY prev_page, next_page, product_line
ORDER BY trans_cnt DESC
LIMIT 30
"""
SQL_PATH_DROP_OFF = """
WITH ev AS (
    SELECT session_id, user_id, event_page, event_time, log_id
    FROM dwd_device_operation_wide
    WHERE event_date BETWEEN %s AND %s
      AND event_page IS NOT NULL
),
seq AS (
    SELECT
        event_page AS prev_page,
        LEAD(event_page) OVER (
            PARTITION BY session_id ORDER BY event_time, log_id
        ) AS next_page,
        user_id,
        session_id
    FROM ev
)
SELECT
    prev_page,
    COUNT(DISTINCT user_id) AS user_cnt,
    COUNT(DISTINCT session_id) AS sess_cnt
FROM seq
WHERE next_page IS NULL
GROUP BY prev_page
ORDER BY sess_cnt DESC
"""
SQL_PATH_TOP_CHAIN = """
SELECT
  t1.prev_page AS step1,
  t1.next_page AS step2,
  t2.next_page AS step3,
  t1.trans_cnt AS step1_2_cnt,
  t2.trans_cnt AS step2_3_cnt,
  ROUND(t2.trans_cnt / NULLIF(t1.trans_cnt, 0) * 100, 2) AS step2_3_retention_pct
FROM (
  SELECT
      w.event_page AS prev_page,
      w2.event_page AS next_page,
      COUNT(*) AS trans_cnt
  FROM dwd_device_operation_wide w
  JOIN dwd_device_operation_wide w2
    ON w.session_id = w2.session_id
   AND w.event_time < w2.event_time
   AND w.event_date BETWEEN %s AND %s
   AND w.event_page IS NOT NULL
   AND w2.event_page IS NOT NULL
  LEFT JOIN dwd_device_operation_wide w3
    ON w.session_id = w3.session_id
   AND w.event_time < w3.event_time
   AND w3.event_time < w2.event_time
  WHERE w3.log_id IS NULL
  GROUP BY w.event_page, w2.event_page
) t1
JOIN (
  SELECT
      w.event_page AS prev_page,
      w2.event_page AS next_page,
      COUNT(*) AS trans_cnt
  FROM dwd_device_operation_wide w
  JOIN dwd_device_operation_wide w2
    ON w.session_id = w2.session_id
   AND w.event_time < w2.event_time
   AND w.event_date BETWEEN %s AND %s
   AND w.event_page IS NOT NULL
   AND w2.event_page IS NOT NULL
  LEFT JOIN dwd_device_operation_wide w3
    ON w.session_id = w3.session_id
   AND w.event_time < w3.event_time
   AND w3.event_time < w2.event_time
  WHERE w3.log_id IS NULL
  GROUP BY w.event_page, w2.event_page
) t2 ON t1.next_page = t2.prev_page
ORDER BY t1.trans_cnt DESC, t2.trans_cnt DESC
LIMIT 20
"""

# ============================================================================
# 模块14：收入结构深度分析（基于 dws_trade_order_1d + ods_subscription_order）
# ============================================================================
SQL_REVENUE_STRUCTURE = """
SELECT
    DATE_FORMAT(snapshot_date, '%%Y-%%m') AS snapshot_month,
    src_type AS channel_code,
    SUM(order_cnt) AS order_cnt,
    SUM(unsub_cnt) AS unsub_cnt,
    ROUND(SUM(order_amount), 2) AS order_amount,
    ROUND(SUM(revenue_share), 2) AS revenue_share,
    ROUND(SUM(order_amount) / NULLIF(SUM(order_cnt), 0), 2) AS avg_order_price,
    ROUND(SUM(unsub_cnt) / NULLIF(SUM(order_cnt), 0) * 100, 2) AS unsub_rate_pct
FROM dws_trade_order_1d
WHERE src_type <> 'ALL' AND DATE_FORMAT(snapshot_date, '%%Y-%%m') = %s
GROUP BY DATE_FORMAT(snapshot_date, '%%Y-%%m'), src_type
ORDER BY order_amount DESC
"""
SQL_PLAN_ANALYSIS = """
SELECT
    pay_type AS plan_type,
    SUM(order_cnt) AS order_cnt,
    SUM(unsub_cnt) AS unsub_cnt,
    ROUND(SUM(order_amount), 2) AS order_amount,
    ROUND(SUM(revenue_share), 2) AS revenue_share,
    SUM(order_cnt) AS new_user_cnt,
    GREATEST(SUM(order_cnt) - SUM(unsub_cnt), 0) AS renewal_cnt,
    ROUND(SUM(unsub_cnt) / NULLIF(SUM(order_cnt), 0) * 100, 2) AS unsub_rate,
    ROUND(SUM(order_amount) / NULLIF(SUM(order_cnt), 0), 2) AS avg_order_price
FROM dws_trade_order_1d
WHERE src_type <> 'ALL' AND DATE_FORMAT(snapshot_date, '%%Y-%%m') = %s
GROUP BY pay_type
ORDER BY order_amount DESC
"""
SQL_ARPU_TREND = """
SELECT
    SUBSTRING(d.snapshot_date, 1, 7) AS snapshot_month,
    ROUND(SUM(d.pay_amount) / NULLIF(SUM(d.pay_users), 0), 2) AS arppu,
    IFNULL(MAX(a.mau), 0) AS total_active_users,
    ROUND(SUM(d.pay_amount) / NULLIF(MAX(a.mau), 0), 2) AS arpu
FROM dws_payment_daily d
LEFT JOIN (
    SELECT SUBSTRING(snapshot_date, 1, 7) AS mon, COUNT(DISTINCT mac) AS mau
    FROM dws_act_user_active_1d GROUP BY SUBSTRING(snapshot_date, 1, 7)
) a ON SUBSTRING(d.snapshot_date, 1, 7) = a.mon
GROUP BY SUBSTRING(d.snapshot_date, 1, 7)
ORDER BY snapshot_month
"""

# ============================================================================
# 模块15：营销活动复盘（基于 ods_activity + 子查询）
# ============================================================================
SQL_ACTIVITY_LIST = """
SELECT
    a.activity_id,
    a.activity_name,
    a.activity_type,
    a.start_date,
    a.end_date,
    a.budget_amount,
    a.target_users,
    DATEDIFF(a.end_date, a.start_date) + 1 AS duration_days,
    (SELECT COUNT(DISTINCT mac) FROM dws_act_user_active_1d 
     WHERE snapshot_date BETWEEN a.start_date AND a.end_date) AS total_reach_users,
    (SELECT COUNT(DISTINCT user_id) FROM ods_subscription_order 
     WHERE pay_date BETWEEN a.start_date AND a.end_date) AS total_participate_users,
    (SELECT COUNT(*) FROM dws_trade_order_1d 
     WHERE snapshot_date BETWEEN a.start_date AND a.end_date AND src_type<>'ALL') AS total_orders,
    ROUND((SELECT SUM(order_amount) FROM dws_trade_order_1d 
     WHERE snapshot_date BETWEEN a.start_date AND a.end_date AND src_type<>'ALL'), 2) AS total_order_amount,
    ROUND((SELECT SUM(revenue_share) FROM dws_trade_order_1d 
     WHERE snapshot_date BETWEEN a.start_date AND a.end_date AND src_type<>'ALL'), 2) AS total_revenue_share,
    ROUND((SELECT SUM(order_amount) FROM dws_trade_order_1d 
     WHERE snapshot_date BETWEEN a.start_date AND a.end_date AND src_type<>'ALL') / NULLIF(a.budget_amount, 0), 2) AS roi_ratio,
    ROUND((SELECT COUNT(DISTINCT user_id) FROM ods_subscription_order 
     WHERE pay_date BETWEEN a.start_date AND a.end_date) / NULLIF((SELECT COUNT(DISTINCT mac) FROM dws_act_user_active_1d 
     WHERE snapshot_date BETWEEN a.start_date AND a.end_date), 0) * 100, 2) AS participate_rate_pct
FROM ods_activity a
ORDER BY a.start_date DESC
"""

# ============================================================================
# 模块16：业务健康度仪表盘（从各DWS表聚合，不用虚拟视图）
# ============================================================================
SQL_HEALTH_DASHBOARD = """
SELECT metric_group, metric_code, metric_name,
    ROUND(metric_value, 2) AS metric_value,
    CASE metric_code
        WHEN 'd7_retention' THEN 'pct'
        WHEN 'active_ratio' THEN 'pct'
        WHEN 'order_cnt' THEN '笔'
        ELSE '人'
    END AS metric_unit,
    ROUND(baseline_value, 2) AS baseline_value,
    status,
    0 AS mom_change_pct,
    CASE status WHEN 'green' THEN 'OK' WHEN 'yellow' THEN 'WARN' ELSE 'ALERT' END AS status_icon
FROM dws_health_daily
WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dws_health_daily)
ORDER BY FIELD(metric_group, '今日活跃', '留存', '商业化', '内容', '健康度')
"""
SQL_HEALTH_SUMMARY = """
SELECT metric_group,
    COUNT(*) AS metric_count,
    SUM(status='green') AS green_count,
    SUM(status='yellow') AS yellow_count,
    SUM(status='red') AS red_count,
    ROUND(SUM(status='green') / NULLIF(COUNT(*), 0) * 100, 0) AS health_score_pct
FROM dws_health_daily
WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dws_health_daily)
GROUP BY metric_group
"""

# ============================================================================
# 模块17：用户标签（基于 dim_user + dim_region + dim_user_package + dwd_user_status_di + 活跃）
# ============================================================================
SQL_TAG_OVERVIEW = """
SELECT tag_category, tag_code, tag_name, tag_color, user_count, tag_value, tag_source
FROM (
  SELECT '生命周期' AS tag_category, 'user_status' AS tag_code, '用户状态' AS tag_name, '#27ae60' AS tag_color,
    COUNT(DISTINCT userid) AS user_count, IFNULL(user_status, '未知') AS tag_value, '规则' AS tag_source
  FROM dim_user
  GROUP BY user_status
  UNION ALL
  SELECT '生命周期', 'register_date', '注册时段', '#2ecc71', COUNT(DISTINCT userid),
    CASE WHEN register_date >= DATE_FORMAT(CURDATE(), '%%Y-%%m-01') THEN '本月新注册' ELSE '历史注册' END, '规则'
  FROM dim_user
  GROUP BY CASE WHEN register_date >= DATE_FORMAT(CURDATE(), '%%Y-%%m-01') THEN '本月新注册' ELSE '历史注册' END
  UNION ALL
  SELECT '人口', 'region', '所属地市', '#e67e22', COUNT(DISTINCT u.userid),
    IFNULL(r.region_name, '未知'), '规则'
  FROM dim_user u
  LEFT JOIN dim_region r ON u.region_id = r.region_id
  GROUP BY r.region_name
  UNION ALL
  SELECT '价值', 'package', '用户套餐', '#9b59b6', COUNT(DISTINCT u.userid),
    IFNULL(p.pkg_name, '未知'), '规则'
  FROM dim_user u
  LEFT JOIN dim_user_package p ON u.pkg_id = p.pkg_id
  GROUP BY p.pkg_name
  UNION ALL
  SELECT '行为', 'user_status', '活跃状态', '#3498db', COUNT(DISTINCT userid), IFNULL(user_status, '未知'), '规则'
  FROM dwd_user_status_di WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di)
  GROUP BY user_status
  UNION ALL
  SELECT '行为', 'days_since_active', '沉默天数', '#2980b9',
    COUNT(DISTINCT userid),
    CASE WHEN days_since_active <= 3 THEN '活跃(<=3天)'
         WHEN days_since_active <= 14 THEN '沉默(4-14天)'
         WHEN days_since_active <= 30 THEN '流失风险(15-30天)'
         ELSE '已流失(>30天)' END, '规则'
  FROM dwd_user_status_di WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di)
  GROUP BY CASE WHEN days_since_active <= 3 THEN '活跃(<=3天)' WHEN days_since_active <= 14 THEN '沉默(4-14天)' WHEN days_since_active <= 30 THEN '流失风险(15-30天)' ELSE '已流失(>30天)' END
  UNION ALL
  SELECT '行为', 'device_type', '端类型', '#1abc9c', COUNT(DISTINCT userid), IFNULL(device_type, '未知'), '规则'
  FROM dws_act_user_active_1d
  WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)
  GROUP BY device_type
  UNION ALL
  SELECT '内容偏好', 'content_mix', '内容偏好', '#f39c12', COUNT(*) AS user_count, pref AS tag_value, '规则' AS tag_source
  FROM (
    SELECT userid,
      CASE
        WHEN SUM(is_vod_active) > 0 AND SUM(is_live_active) > 0 THEN '点播+直播'
        WHEN SUM(is_vod_active) > 0 THEN '偏点播'
        WHEN SUM(is_live_active) > 0 THEN '偏直播'
        ELSE '仅开机'
      END AS pref
    FROM dws_act_user_active_1d
    WHERE snapshot_date >= DATE_SUB((SELECT MAX(snapshot_date) FROM dws_act_user_active_1d), INTERVAL 6 DAY)
    GROUP BY userid
  ) pref_x
  GROUP BY pref
) t
ORDER BY tag_category, user_count DESC
"""
SQL_TAG_BY_CATEGORY = """
SELECT tag_category, tag_code, tag_name, '#8e44ad' AS tag_color, '规则' AS tag_type,
  tag_value, user_count,
  ROUND(user_count / NULLIF(SUM(user_count) OVER (PARTITION BY tag_category), 0) * 100, 2) AS category_share_pct
FROM (
  SELECT '生命周期' AS tag_category, 'user_status' AS tag_code, '用户状态' AS tag_name,
    IFNULL(user_status, '未知') AS tag_value, COUNT(DISTINCT userid) AS user_count
  FROM dim_user GROUP BY user_status
  UNION ALL
  SELECT '生命周期', 'register_date', '注册时段',
    CASE WHEN register_date >= DATE_FORMAT(CURDATE(), '%%Y-%%m-01') THEN '本月新注册' ELSE '历史注册' END, COUNT(DISTINCT userid)
  FROM dim_user
  GROUP BY CASE WHEN register_date >= DATE_FORMAT(CURDATE(), '%%Y-%%m-01') THEN '本月新注册' ELSE '历史注册' END
  UNION ALL
  SELECT '人口', 'region', '所属地市', IFNULL(r.region_name, '未知'), COUNT(DISTINCT u.userid)
  FROM dim_user u LEFT JOIN dim_region r ON u.region_id = r.region_id
  GROUP BY r.region_name
  UNION ALL
  SELECT '价值', 'package', '用户套餐', IFNULL(p.pkg_name, '未知'), COUNT(DISTINCT u.userid)
  FROM dim_user u LEFT JOIN dim_user_package p ON u.pkg_id = p.pkg_id
  GROUP BY p.pkg_name
  UNION ALL
  SELECT '行为', 'user_status', '活跃状态', IFNULL(user_status, '未知'), COUNT(DISTINCT userid)
  FROM dwd_user_status_di WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di) GROUP BY user_status
  UNION ALL
  SELECT '行为', 'days_since_active', '沉默天数',
    CASE WHEN days_since_active <= 3 THEN '活跃(<=3天)'
         WHEN days_since_active <= 14 THEN '沉默(4-14天)'
         WHEN days_since_active <= 30 THEN '流失风险(15-30天)'
         ELSE '已流失(>30天)' END, COUNT(DISTINCT userid)
  FROM dwd_user_status_di WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di)
  GROUP BY CASE WHEN days_since_active <= 3 THEN '活跃(<=3天)' WHEN days_since_active <= 14 THEN '沉默(4-14天)' WHEN days_since_active <= 30 THEN '流失风险(15-30天)' ELSE '已流失(>30天)' END
  UNION ALL
  SELECT '行为', 'device_type', '端类型', IFNULL(device_type, '未知'), COUNT(DISTINCT userid)
  FROM dws_act_user_active_1d
  WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)
  GROUP BY device_type
  UNION ALL
  SELECT '内容偏好', 'content_mix', '内容偏好', pref, COUNT(*) FROM (
    SELECT userid,
      CASE
        WHEN SUM(is_vod_active) > 0 AND SUM(is_live_active) > 0 THEN '点播+直播'
        WHEN SUM(is_vod_active) > 0 THEN '偏点播'
        WHEN SUM(is_live_active) > 0 THEN '偏直播'
        ELSE '仅开机'
      END AS pref
    FROM dws_act_user_active_1d
    WHERE snapshot_date >= DATE_SUB((SELECT MAX(snapshot_date) FROM dws_act_user_active_1d), INTERVAL 6 DAY)
    GROUP BY userid
  ) x GROUP BY pref
) t
ORDER BY tag_category, user_count DESC
"""
SQL_TAG_DETAIL = """
SELECT
  u.userid AS user_id,
  IFNULL(u.user_status, '未知') AS user_status,
  IFNULL(r.region_name, '未知') AS region_name,
  IFNULL(p.pkg_name, '未知') AS pkg_name,
  u.register_date,
  IFNULL(s.user_status, '未知') AS active_status,
  s.days_since_active
FROM dim_user u
LEFT JOIN dim_region r ON u.region_id = r.region_id
LEFT JOIN dim_user_package p ON u.pkg_id = p.pkg_id
LEFT JOIN dwd_user_status_di s
  ON u.userid = s.userid
 AND s.snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di)
ORDER BY u.userid
LIMIT 200
"""