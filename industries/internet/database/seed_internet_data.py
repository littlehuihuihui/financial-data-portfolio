#!/usr/bin/env python3
"""互联网通用行业 · 样例数据灌入（2024-01 ~ 2026-07）
数据底座：设备操作日志（开机/点击/播放/支付），覆盖 launcher/vod/live/cashier 产品线。
"""
from __future__ import annotations

import math
import random
from datetime import date, datetime, timedelta
from pathlib import Path

import pymysql

DDL_DIR = Path(__file__).resolve().parent
BATCH = "SEED202607"
START = date(2024, 1, 1)
END = date(2026, 7, 31)

CHANNELS = [
    ("CH01", "自然搜索", "自然", 0),
    ("CH02", "信息流广告", "付费", 1),
    ("CH03", "应用商店", "付费", 1),
    ("CH04", "社交裂变", "裂变", 0),
    ("CH05", "KOL合作", "付费", 1),
]

PRODUCT_LINES = [
    ("launcher", "桌面Launcher", "桌面"),
    ("vod", "点播VOD", "内容"),
    ("live", "直播Live", "内容"),
    ("cashier", "收银台", "交易"),
]

EVENT_ACTIONS = [
    ("boot", "launcher", "开机", "启动", "visit", 0),
    ("click", "launcher", "点击", "浏览", "signup", 0),
    ("app_exit", "launcher", "退出应用", "启动", None, 0),
    ("play_start", "vod", "开始播放", "播放", None, 0),
    ("play_end", "vod", "结束播放", "播放", None, 0),
    ("pause", "vod", "暂停播放", "播放", None, 0),
    ("channel_enter", "live", "进入频道", "播放", None, 0),
    ("play_start", "live", "开始直播", "播放", None, 0),
    ("order_submit", "cashier", "提交订单", "交易", "activate", 1),
    ("pay_success", "cashier", "支付成功", "交易", "purchase", 1),
]

CONTENTS = [
    ("V001", "vod", "流浪地球2", "电影", 173, 1),
    ("V002", "vod", "狂飙", "电视剧", 45, 0),
    ("V003", "vod", "奔跑吧", "综艺", 90, 0),
    ("L001", "live", "CCTV-1综合", "新闻", 0, 0),
    ("L002", "live", "体育高清", "体育", 0, 1),
    ("L003", "live", "少儿动画", "少儿", 0, 0),
]

GENDERS = ["男", "女", "未知"]
AGE_GROUPS = ["18-24", "25-34", "35-44", "45+"]
CITY_TIERS = ["一线", "新一线", "二线", "三线及以下"]
DEVICE_MODELS = ["X1-Pro", "X2-4K", "S3-Mini", "T5-OTT"]
SEGMENTS = ["新用户", "活跃用户", "沉默用户", "付费用户"]

TRUNCATE_TABLES = [
    "dws_user_value_snapshot", "dws_funnel_monthly",
    "dws_payment_daily", "dws_product_daily", "dws_channel_daily", "dws_retention_daily", "dws_user_daily",
    "dwd_session_wide", "dwd_device_operation_wide", "dwd_user_wide",
    "ods_device_operation_log", "ods_subscription_order", "ods_channel_campaign",
    "ods_user_retention", "ods_activity", "ods_content_catalog",
    "ods_device_profile", "ods_user_profile", "dim_user", "dim_device",
]


def db_config():
    return {"host": "127.0.0.1", "port": 3306, "user": "root", "password": "123456", "charset": "utf8mb4", "autocommit": False}


def daterange(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def run_sql_file(cur, path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    statements, buf = [], []
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        buf.append(line)
        if stripped.endswith(";"):
            stmt = "\n".join(buf).strip()
            if stmt:
                statements.append(stmt)
            buf = []
    for stmt in statements:
        cur.execute(stmt)


def run_ddl(cur, views_only: bool = False) -> None:
    run_sql_file(cur, DDL_DIR / ("02_ads.sql" if views_only else "01_ddl.sql"))


def seed_dim(cur):
    cur.executemany(
        "INSERT IGNORE INTO dim_channel (channel_code, channel_name, channel_type, is_paid_channel) VALUES (%s,%s,%s,%s)",
        CHANNELS,
    )
    cur.executemany(
        "INSERT IGNORE INTO dim_product_line (product_line_code, product_line_name, product_category, description) VALUES (%s,%s,%s,%s)",
        [(p[0], p[1], p[2], f"{p[1]}产品线") for p in PRODUCT_LINES],
    )
    cur.executemany(
        """INSERT IGNORE INTO dim_event_action
           (event_action, product_line, event_action_name, event_category, funnel_step, is_conversion)
           VALUES (%s,%s,%s,%s,%s,%s)""",
        EVENT_ACTIONS,
    )
    rows = [(d, d.year, d.month, d.day, d.isocalendar()[1], 1 if d.weekday() >= 5 else 0, d.strftime("%Y-%m"))
            for d in daterange(START, END)]
    cur.executemany(
        """INSERT IGNORE INTO dim_date (date_id, year_num, month_num, day_num, week_of_year, is_weekend, month_label)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        rows,
    )
    cur.executemany(
        """INSERT IGNORE INTO ods_content_catalog
           (content_id, content_type, content_title, content_category, duration_min, is_premium, publish_date, cp_name, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(c[0], c[1], c[2], c[3], c[4], c[5], START, "样例CP", BATCH) for c in CONTENTS],
    )


def seed_users_and_devices(cur, n: int = 6000):
    random.seed(42)
    users, devices = [], []
    for i in range(1, n + 1):
        uid, did = f"U{i:06d}", f"D{i:06d}"
        reg = START + timedelta(days=random.randint(0, (END - START).days))
        ch = random.choice(CHANNELS)
        paid = 1 if random.random() < 0.12 else 0
        seg = "付费用户" if paid else random.choice(SEGMENTS[:3])
        vip = random.choice(["黄金", "钻石"]) if paid else "普通"
        boot = datetime.combine(reg, datetime.min.time()) + timedelta(hours=random.randint(8, 20))
        users.append((uid, reg, "launcher", random.choice(GENDERS), random.choice(AGE_GROUPS),
                      random.choice(CITY_TIERS), "机顶盒", ch[1], seg, paid, vip, BATCH))
        devices.append((did, uid, random.choice(DEVICE_MODELS), "Amlogic S905X4", "Android 9",
                        "v2.1.0", f"MAC{i:06X}", ch[1], random.choice(["广东", "浙江", "北京"]),
                        random.choice(CITY_TIERS), boot, boot, 1, BATCH))
    cur.executemany(
        """INSERT INTO ods_user_profile
           (user_id, register_date, register_product, gender, age_group, city_tier, device_type,
            first_channel, user_segment, is_paid, vip_level, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        users,
    )
    cur.executemany(
        """INSERT INTO ods_device_profile
           (device_id, user_id, device_model, chip_platform, os_version, firmware_version, mac_hash,
            install_channel, province, city_tier, first_boot_time, last_boot_time, is_active, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        devices,
    )
    cur.execute(
        """INSERT INTO dim_device (device_id, user_id, device_model, chip_platform, os_version,
            install_channel, province, city_tier, first_boot_time, is_active)
           SELECT device_id, user_id, device_model, chip_platform, os_version,
            install_channel, province, city_tier, first_boot_time, is_active FROM ods_device_profile"""
    )
    cur.execute(
        """INSERT INTO dim_user (user_id, register_date, gender, age_group, city_tier, device_type,
            first_channel, user_segment, is_paid, vip_level, lifecycle_stage)
           SELECT user_id, register_date, gender, age_group, city_tier, device_type,
            first_channel, user_segment, is_paid, vip_level, '新客' FROM ods_user_profile"""
    )
    return users, devices


def lifecycle(reg: date, last_active: date, paid: int) -> str:
    inactive = (END - last_active).days
    if inactive > 45:
        return "流失"
    if paid:
        return "成熟"
    if (END - reg).days <= 14:
        return "新客"
    if inactive <= 7:
        return "成长"
    return "沉默"


def seed_operation_logs(cur, users, devices):
    random.seed(99)
    logs, payments = [], []
    user_last = {u[0]: u[1] for u in users}
    user_paid = {u[0]: u[9] for u in users}
    dev_map = {d[0]: d[1] for d in devices}
    pay_seq = 0

    action_pool = [
        ("boot", "launcher", "首页", None, 0),
        ("click", "launcher", "片库", None, 0),
        ("play_start", "vod", "播放器", "V001", random.randint(600, 3600)),
        ("play_end", "vod", "播放器", "V001", random.randint(300, 2400)),
        ("channel_enter", "live", "直播页", "L001", 0),
        ("play_start", "live", "直播页", "L002", random.randint(300, 1800)),
        ("order_submit", "cashier", "收银台", None, 0),
        ("pay_success", "cashier", "收银台", None, 0),
    ]

    for did, uid, *_ in devices:
        reg = user_last.get(uid, START)
        span = max(1, (END - reg).days + 1)
        active_days = random.randint(1, max(1, min(80, span)))
        for _ in range(active_days):
            ed = reg + timedelta(days=random.randint(0, max(0, (END - reg).days)))
            if ed > END:
                continue
            session = f"S{uid}{ed.strftime('%Y%m%d')}"
            etime = datetime.combine(ed, datetime.min.time()) + timedelta(hours=random.randint(18, 23), minutes=random.randint(0, 59))
            for act, pline, page, cid, dur in random.sample(action_pool, k=random.randint(2, 5)):
                logs.append((did, uid, etime, ed, pline, act, page, cid,
                             next((c[2] for c in CONTENTS if c[0] == cid), None),
                             next((c[3] for c in CONTENTS if c[0] == cid), None),
                             dur if "play" in act else 0, session, "v3.2.1", "wifi", 1, None, BATCH))
                etime += timedelta(seconds=random.randint(5, 120))
            user_last[uid] = max(user_last.get(uid, reg), ed)

        if user_paid.get(uid):
            for _ in range(random.randint(1, 3)):
                pd = reg + timedelta(days=random.randint(7, max(7, (END - reg).days)))
                if pd > END:
                    continue
                ch = random.choice(CHANNELS)
                amt = round(random.uniform(29, 299), 2)
                pay_seq += 1
                oid = f"ORD-{uid}-{pay_seq:04d}"
                payments.append((oid, uid, did, pd, datetime.combine(pd, datetime.min.time()), "cashier",
                                 random.choice(["月卡", "季卡", "年卡", "单片"]), amt, ch[0], None,
                                 random.choice([0, 1]), "微信", BATCH))
                logs.append((did, uid, datetime.combine(pd, datetime.min.time()), pd, "cashier", "pay_success",
                             "收银台", None, None, None, 0, f"PAY{oid}", "v3.2.1", "wifi", 1, None, BATCH))

    cur.executemany(
        """INSERT INTO ods_device_operation_log
           (device_id, user_id, event_time, event_date, product_line, event_action, event_page,
            content_id, content_title, content_category, play_duration_sec, session_id,
            app_version, network_type, is_success, error_code, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        logs,
    )
    cur.executemany(
        """INSERT INTO ods_subscription_order
           (order_id, user_id, device_id, pay_date, pay_time, product_line, plan_type, pay_amount,
            channel_code, content_id, is_renewal, pay_method, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        payments,
    )
    return user_last


def etl_dwd(cur):
    cur.execute("TRUNCATE TABLE dwd_device_operation_wide")
    cur.execute("TRUNCATE TABLE dwd_user_wide")
    cur.execute("TRUNCATE TABLE dwd_session_wide")
    cur.execute(
        """
        INSERT INTO dwd_device_operation_wide
        SELECT l.log_id, l.device_id, l.user_id, l.event_time, l.event_date,
            l.product_line, pl.product_line_name, l.event_action, ea.event_action_name,
            ea.event_category, ea.funnel_step, l.event_page, l.content_id, l.content_title,
            l.content_category, l.play_duration_sec, l.session_id, d.device_model,
            d.install_channel, ch.channel_name, u.gender, u.age_group, u.user_segment, l.is_success
        FROM ods_device_operation_log l
        LEFT JOIN dim_product_line pl ON l.product_line = pl.product_line_code
        LEFT JOIN dim_event_action ea ON l.event_action = ea.event_action AND l.product_line = ea.product_line
        LEFT JOIN dim_device d ON l.device_id = d.device_id
        LEFT JOIN dim_channel ch ON d.install_channel = ch.channel_name
        LEFT JOIN dim_user u ON l.user_id = u.user_id
        """
    )
    cur.execute(
        """
        INSERT INTO dwd_user_wide
        SELECT p.user_id, p.register_date, p.gender, p.age_group, p.city_tier, p.device_type,
            p.first_channel, p.first_channel, p.user_segment, '新客', p.is_paid, p.vip_level,
            0, 0, 0, p.register_date, DATEDIFF(%s, p.register_date)
        FROM ods_user_profile p
        """,
        (END,),
    )
    cur.execute(
        """
        UPDATE dwd_user_wide w JOIN (
            SELECT user_id, COUNT(*) cnt, SUM(play_duration_sec) play_sec, MAX(event_date) last_d
            FROM dwd_device_operation_wide GROUP BY user_id
        ) x ON w.user_id = x.user_id
        SET w.total_operations = x.cnt, w.total_play_sec = x.play_sec, w.last_active_date = x.last_d,
            w.days_since_register = DATEDIFF(%s, w.register_date)
        """,
        (END,),
    )
    cur.execute(
        """
        UPDATE dwd_user_wide w JOIN (
            SELECT user_id, SUM(pay_amount) amt FROM ods_subscription_order GROUP BY user_id
        ) p ON w.user_id = p.user_id SET w.total_pay_amount = p.amt, w.is_paid = 1
        """
    )
    cur.execute(
        """
        INSERT INTO dwd_session_wide
        SELECT session_id, MAX(device_id), MAX(user_id), MIN(event_date),
            MIN(event_time), MAX(event_time),
            TIMESTAMPDIFF(SECOND, MIN(event_time), MAX(event_time)),
            COUNT(*), SUM(CASE WHEN event_action LIKE 'play%%' THEN 1 ELSE 0 END),
            GROUP_CONCAT(DISTINCT product_line ORDER BY product_line),
            MAX(CASE WHEN event_action = 'pay_success' THEN 1 ELSE 0 END)
        FROM dwd_device_operation_wide WHERE session_id IS NOT NULL
        GROUP BY session_id
        """
    )
    cur.execute("SELECT user_id, register_date, last_active_date, is_paid FROM dwd_user_wide")
    for uid, reg, last, paid in cur.fetchall():
        stage = lifecycle(reg, last or reg, paid)
        cur.execute("UPDATE dwd_user_wide SET lifecycle_stage=%s WHERE user_id=%s", (stage, uid))
        cur.execute("UPDATE dim_user SET lifecycle_stage=%s WHERE user_id=%s", (stage, uid))


def seed_channel_daily(cur):
    random.seed(7)
    rows_ods, rows_dws, user_daily = [], [], []
    for d in daterange(START, END):
        base_dau = 12000 + int(800 * math.sin(d.toordinal() / 14))
        for ch in CHANNELS:
            nu = max(1, int(base_dau * random.uniform(0.08, 0.28) / 5))
            nd = int(nu * 1.05)
            spend = round(nu * random.uniform(15, 45), 2) if ch[3] else 0
            clk = nu * random.randint(3, 12)
            rows_ods.append((d, ch[0], clk * 20, clk, nu, spend, nu, nd, BATCH))
            rows_dws.append((d, ch[0], ch[1], spend, nu, nd, clk, round(spend / nu, 2) if nu and spend else 0,
                             round(nu / clk, 4) if clk else 0))
        total = base_dau + random.randint(-500, 500)
        user_daily.append((d, "ALL", total, int(total * 1.02), int(total * 0.06), int(total * 0.05),
                           int(total * 0.72), int(total * 0.11), int(total * 1.1), random.uniform(180, 320)))
    cur.executemany(
        """INSERT INTO ods_channel_campaign
           (stat_date, channel_code, impressions, clicks, installs, spend_amount, new_users, new_devices, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        rows_ods,
    )
    cur.executemany(
        """INSERT INTO dws_channel_daily
           (snapshot_date, channel_code, channel_name, spend_amount, new_users, new_devices, clicks, cac, conversion_rate)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        rows_dws,
    )
    cur.executemany(
        """INSERT INTO dws_user_daily
           (snapshot_date, channel_code, dau, dau_device, new_users, new_devices, active_users, paid_users, boot_count, avg_session_sec)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        user_daily,
    )


def seed_product_daily(cur):
    random.seed(11)
    rows = []
    weights = {"launcher": 0.35, "vod": 0.30, "live": 0.25, "cashier": 0.10}
    for d in daterange(START, END):
        base = 12000 + int(500 * math.sin(d.toordinal() / 20))
        for pl, w in weights.items():
            au = int(base * w * random.uniform(0.85, 1.15))
            rows.append((d, pl, au, int(au * 1.02), int(au * random.uniform(3, 8)),
                         int(au * 0.4) if pl in ("vod", "live") else 0,
                         int(au * 1200) if pl in ("vod", "live") else 0,
                         int(au * 0.02) if pl == "cashier" else 0,
                         round(au * random.uniform(20, 80), 2) if pl == "cashier" else 0))
    cur.executemany(
        """INSERT INTO dws_product_daily
           (snapshot_date, product_line, active_users, active_devices, operation_count, play_count, total_play_sec, pay_users, pay_amount)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        rows,
    )


def seed_retention(cur):
    rows = []
    for cohort in daterange(START, END - timedelta(days=30)):
        if cohort.day not in (1, 15):
            continue
        cohort_n = random.randint(800, 2500)
        for offset in [1, 3, 7, 14, 30]:
            retained = int(cohort_n * (0.55 ** (offset / 7)))
            rate = round(retained / cohort_n, 4)
            for pl in ["ALL", "launcher", "vod", "live"]:
                rows.append((cohort, offset, "ALL", pl, cohort_n, retained, rate, BATCH))
    cur.executemany(
        """INSERT INTO ods_user_retention
           (cohort_date, day_offset, channel_code, product_line, cohort_users, retained_users, retention_rate, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
        rows,
    )
    cur.execute(
        """INSERT INTO dws_retention_daily
           SELECT cohort_date, day_offset, channel_code, product_line, cohort_users, retained_users, retention_rate
           FROM ods_user_retention"""
    )


def seed_payments_daily(cur):
    cur.execute(
        """
        INSERT INTO dws_payment_daily (snapshot_date, channel_code, product_line, pay_users, pay_amount, arpu, renewal_users, order_count)
        SELECT pay_date, IFNULL(channel_code,'ALL'), IFNULL(product_line,'ALL'),
            COUNT(DISTINCT user_id), ROUND(SUM(pay_amount),2),
            ROUND(SUM(pay_amount)/COUNT(DISTINCT user_id),2), SUM(is_renewal), COUNT(*)
        FROM ods_subscription_order GROUP BY pay_date, channel_code, product_line
        """
    )
    cur.execute(
        """
        INSERT INTO dws_payment_daily (snapshot_date, channel_code, product_line, pay_users, pay_amount, arpu, renewal_users, order_count)
        SELECT pay_date, 'ALL', IFNULL(product_line,'ALL'),
            COUNT(DISTINCT user_id), ROUND(SUM(pay_amount),2),
            ROUND(SUM(pay_amount)/COUNT(DISTINCT user_id),2), SUM(is_renewal), COUNT(*)
        FROM ods_subscription_order GROUP BY pay_date, product_line
        ON DUPLICATE KEY UPDATE pay_amount=VALUES(pay_amount)
        """
    )


def seed_funnel_and_user_value(cur):
    """DWS 漏斗与用户价值快照 — ADS 禁止直读 DWD"""
    cur.execute(
        """
        INSERT INTO dws_funnel_monthly
        (snapshot_month, channel_code, product_line, step_visit, step_signup, step_activate, step_purchase,
         signup_rate, purchase_rate, etl_batch_id)
        SELECT
            DATE_FORMAT(event_date, '%Y-%m'),
            'ALL', 'ALL',
            SUM(CASE WHEN funnel_step IN ('visit', 'page_view') THEN 1 ELSE 0 END),
            SUM(CASE WHEN funnel_step = 'signup' THEN 1 ELSE 0 END),
            SUM(CASE WHEN funnel_step = 'activate' THEN 1 ELSE 0 END),
            SUM(CASE WHEN funnel_step = 'purchase' THEN 1 ELSE 0 END),
            ROUND(SUM(CASE WHEN funnel_step = 'signup' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN funnel_step IN ('visit','page_view') THEN 1 ELSE 0 END), 0) * 100, 2),
            ROUND(SUM(CASE WHEN funnel_step = 'purchase' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN funnel_step IN ('visit','page_view') THEN 1 ELSE 0 END), 0) * 100, 2),
            %s
        FROM dwd_device_operation_wide
        WHERE funnel_step IS NOT NULL AND funnel_step <> ''
        GROUP BY DATE_FORMAT(event_date, '%Y-%m')
        """,
        (BATCH,),
    )
    cur.execute(
        """
        INSERT INTO dws_user_value_snapshot
        (snapshot_date, user_id, first_channel, lifecycle_stage, user_segment,
         total_pay_amount, total_operations, days_since_register, last_active_date,
         recency_days, rfm_segment, etl_batch_id)
        SELECT
            CURDATE(),
            user_id,
            IFNULL(first_channel, '未知'),
            IFNULL(lifecycle_stage, '未知'),
            IFNULL(user_segment, '未知'),
            IFNULL(total_pay_amount, 0),
            IFNULL(total_operations, 0),
            IFNULL(days_since_register, 0),
            last_active_date,
            DATEDIFF(CURDATE(), last_active_date),
            CASE
                WHEN IFNULL(total_pay_amount, 0) >= 500 AND IFNULL(total_operations, 0) >= 500 THEN '高价值'
                WHEN IFNULL(total_pay_amount, 0) >= 100 OR IFNULL(total_operations, 0) >= 150 THEN '潜力'
                WHEN DATEDIFF(CURDATE(), last_active_date) > 30 THEN '流失风险'
                ELSE '一般'
            END,
            %s
        FROM dwd_user_wide
        """,
        (BATCH,),
    )


def seed_activities(cur):
    acts = [
        ("ACT01", "春节拉新", date(2024, 1, 20), date(2024, 2, 10), "拉新", "launcher", 500000, 100000),
        ("ACT02", "618大促", date(2024, 6, 1), date(2024, 6, 20), "促销", "cashier", 800000, 200000),
        ("ACT03", "周年庆", date(2024, 11, 1), date(2024, 11, 15), "品牌", "vod", 600000, 150000),
        ("ACT04", "暑期少儿", date(2025, 7, 1), date(2025, 8, 31), "活跃", "live", 400000, 120000),
        ("ACT05", "暑期少儿2026", date(2026, 7, 1), date(2026, 8, 31), "活跃", "live", 450000, 130000),
    ]
    cur.executemany(
        """INSERT INTO ods_activity
           (activity_id, activity_name, start_date, end_date, activity_type, target_product_line, budget_amount, target_users, etl_batch_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], BATCH) for a in acts],
    )


def main():
    conn = pymysql.connect(**db_config())
    try:
        with conn.cursor() as cur:
            cur.execute("DROP DATABASE IF EXISTS internet_analytics")
            cur.execute("CREATE DATABASE internet_analytics DEFAULT CHARSET utf8mb4")
            cur.execute("USE internet_analytics")
            print(">> DDL")
            run_ddl(cur)
            for t in TRUNCATE_TABLES:
                try:
                    cur.execute(f"TRUNCATE TABLE {t}")
                except Exception:
                    pass
            seed_dim(cur)
            users, devices = seed_users_and_devices(cur)
            seed_operation_logs(cur, users, devices)
            etl_dwd(cur)
            seed_channel_daily(cur)
            seed_product_daily(cur)
            seed_retention(cur)
            seed_payments_daily(cur)
            seed_funnel_and_user_value(cur)
            seed_activities(cur)
            run_ddl(cur, views_only=True)
            run_sql_file(cur, DDL_DIR / "03_fact_aliases.sql")
        conn.commit()
        print("internet_analytics 样例数据灌入完成。")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
