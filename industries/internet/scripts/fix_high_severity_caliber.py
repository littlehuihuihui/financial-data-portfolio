"""Fix internet high-severity口径: share rates, MAU settle, lifecycle, health, RFM."""
from __future__ import annotations

import sys
from pathlib import Path

import pymysql

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from db_utils import _db_config  # noqa: E402


def main() -> None:
    conn = pymysql.connect(**_db_config())
    try:
        with conn.cursor() as cur:
            cur.execute("SET NAMES utf8mb4")

            # --- 分成率配置（按套餐/付费类型，禁止全局 0.3）---
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS cfg_share_rate (
                    pay_type VARCHAR(30) NOT NULL,
                    share_rate DECIMAL(8,4) NOT NULL COMMENT '平台分成比例',
                    notes VARCHAR(200) NULL,
                    PRIMARY KEY (pay_type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                COMMENT='CFG-订购分成率·全量'
                """
            )
            rates = [
                ("连续包月", 0.2500, "连续包月合同分成"),
                ("单月", 0.3000, "单月点播分成"),
                ("包年", 0.3500, "包年套餐分成"),
                ("月卡", 0.2800, "订阅月卡分成"),
                ("季卡", 0.3200, "订阅季卡分成"),
                ("年卡", 0.3500, "订阅年卡分成"),
                ("单片", 0.4000, "单片付费分成"),
            ]
            cur.executemany(
                """INSERT INTO cfg_share_rate (pay_type, share_rate, notes) VALUES (%s,%s,%s)
                   ON DUPLICATE KEY UPDATE share_rate=VALUES(share_rate), notes=VALUES(notes)""",
                rates,
            )

            # MAU 结算单价配置
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS cfg_mau_settle (
                    metric_code VARCHAR(40) NOT NULL,
                    unit_price DECIMAL(10,4) NOT NULL,
                    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
                    notes VARCHAR(200) NULL,
                    PRIMARY KEY (metric_code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                COMMENT='CFG-MAU结算单价'
                """
            )
            cur.execute(
                """INSERT INTO cfg_mau_settle (metric_code, unit_price, notes) VALUES
                   ('mau_unit_price', 2.50, '有效MAU结算单价（合同/结算配置，非硬编码3元）')
                   ON DUPLICATE KEY UPDATE unit_price=VALUES(unit_price), notes=VALUES(notes)"""
            )

            # 健康度阈值
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS cfg_health_threshold (
                    metric_code VARCHAR(40) NOT NULL,
                    green_min DECIMAL(12,4) NOT NULL,
                    yellow_min DECIMAL(12,4) NOT NULL,
                    notes VARCHAR(200) NULL,
                    PRIMARY KEY (metric_code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
            cur.executemany(
                """INSERT INTO cfg_health_threshold (metric_code, green_min, yellow_min, notes) VALUES (%s,%s,%s,%s)
                   ON DUPLICATE KEY UPDATE green_min=VALUES(green_min), yellow_min=VALUES(yellow_min)""",
                [
                    ("dau", 1000, 500, "日活人数"),
                    ("d7_retention", 20, 10, "D7留存%"),
                    ("order_cnt", 100, 50, "月订购笔数"),
                    ("vod_active", 500, 200, "点播活跃"),
                    ("active_ratio", 60, 40, "活跃用户占比%"),
                ],
            )

            # 重算 DWD 分成
            cur.execute(
                """
                UPDATE dwd_trade_order_di o
                INNER JOIN cfg_share_rate r
                    ON o.pay_type COLLATE utf8mb4_unicode_ci = r.pay_type
                SET o.revenue_share = ROUND(IFNULL(o.fee, 0) * r.share_rate, 2)
                WHERE o.op_type = 'order'
                """
            )
            print("updated dwd revenue_share", cur.rowcount)

            # 重建 DWS 订购日汇总分成
            cur.execute("TRUNCATE TABLE dws_trade_order_1d")
            cur.execute(
                """
                INSERT INTO dws_trade_order_1d
                    (snapshot_date, pay_type, src_type, order_cnt, unsub_cnt, order_amount, revenue_share, etl_batch_id)
                SELECT
                    op_date,
                    IFNULL(pay_type, 'ALL'),
                    IFNULL(src_type, 'ALL'),
                    SUM(CASE WHEN op_type='order' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN op_type='unsub' THEN 1 ELSE 0 END),
                    ROUND(SUM(CASE WHEN op_type='order' THEN IFNULL(fee,0) ELSE 0 END), 2),
                    ROUND(SUM(CASE WHEN op_type='order' THEN IFNULL(revenue_share,0) ELSE 0 END), 2),
                    'FIX_SHARE'
                FROM dwd_trade_order_di
                GROUP BY op_date, IFNULL(pay_type,'ALL'), IFNULL(src_type,'ALL')
                """
            )
            print("rebuilt dws_trade_order_1d", cur.rowcount)

            # 生命周期：沉默/流失改真实口径
            cur.execute(
                """
                UPDATE dws_user_lifecycle_1d l
                SET
                    churn_cnt = (
                        SELECT COUNT(DISTINCT userid)
                        FROM ods_user_unsubscribe_di u
                        WHERE u.unsub_date <= l.snapshot_date
                    ),
                    silent_cnt = GREATEST(
                        (SELECT COUNT(*) FROM dim_user)
                        - IFNULL(l.active_users, 0)
                        - (
                            SELECT COUNT(DISTINCT userid)
                            FROM ods_user_unsubscribe_di u
                            WHERE u.unsub_date <= l.snapshot_date
                        ),
                        0
                    )
                """
            )
            print("updated lifecycle silent/churn", cur.rowcount)

            # 最新日用状态表覆盖
            cur.execute(
                """
                UPDATE dws_user_lifecycle_1d l
                INNER JOIN (
                    SELECT snapshot_date,
                        SUM(user_status='silent') AS silent_cnt,
                        SUM(user_status='churned') AS churn_cnt,
                        SUM(user_status='active') AS active_users
                    FROM dwd_user_status_di
                    GROUP BY snapshot_date
                ) s ON l.snapshot_date = s.snapshot_date
                SET l.silent_cnt = s.silent_cnt,
                    l.churn_cnt = s.churn_cnt,
                    l.active_users = s.active_users
                """
            )
            print("overlay lifecycle from status", cur.rowcount)

            # dws_health_daily
            cur.execute("DROP TABLE IF EXISTS dws_health_daily")
            cur.execute(
                """
                CREATE TABLE dws_health_daily (
                    snapshot_date DATE NOT NULL,
                    metric_code VARCHAR(40) NOT NULL,
                    metric_name VARCHAR(60) NOT NULL,
                    metric_group VARCHAR(40) NOT NULL,
                    metric_value DECIMAL(18,4) NOT NULL DEFAULT 0,
                    baseline_value DECIMAL(18,4) NOT NULL DEFAULT 0,
                    status VARCHAR(10) NOT NULL,
                    PRIMARY KEY (snapshot_date, metric_code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                COMMENT='DWS-业务健康度日指标'
                """
            )
            cur.execute(
                """
                INSERT INTO dws_health_daily
                SELECT
                    (SELECT MAX(snapshot_date) FROM dws_act_user_active_1d) AS snapshot_date,
                    'dau', 'DAU', '今日活跃',
                    (SELECT COUNT(DISTINCT mac) FROM dws_act_user_active_1d
                     WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)),
                    (SELECT AVG(dau) FROM (
                        SELECT COUNT(DISTINCT mac) AS dau FROM dws_act_user_active_1d GROUP BY snapshot_date
                     ) t),
                    CASE WHEN (SELECT COUNT(DISTINCT mac) FROM dws_act_user_active_1d
                               WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dws_act_user_active_1d))
                              >= (SELECT green_min FROM cfg_health_threshold WHERE metric_code='dau')
                         THEN 'green'
                         WHEN (SELECT COUNT(DISTINCT mac) FROM dws_act_user_active_1d
                               WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dws_act_user_active_1d))
                              >= (SELECT yellow_min FROM cfg_health_threshold WHERE metric_code='dau')
                         THEN 'yellow' ELSE 'red' END
                """
            )
            cur.execute(
                """
                INSERT INTO dws_health_daily
                SELECT
                    CURDATE(), 'd7_retention', 'D7留存', '留存',
                    IFNULL((SELECT AVG(retention_rate) FROM dws_user_retention_1d WHERE day_offset=7), 0),
                    IFNULL((SELECT AVG(retention_rate) FROM dws_user_retention_1d WHERE day_offset=7), 0),
                    CASE WHEN IFNULL((SELECT AVG(retention_rate) FROM dws_user_retention_1d WHERE day_offset=7),0)
                              >= (SELECT green_min FROM cfg_health_threshold WHERE metric_code='d7_retention')
                         THEN 'green'
                         WHEN IFNULL((SELECT AVG(retention_rate) FROM dws_user_retention_1d WHERE day_offset=7),0)
                              >= (SELECT yellow_min FROM cfg_health_threshold WHERE metric_code='d7_retention')
                         THEN 'yellow' ELSE 'red' END
                """
            )
            cur.execute(
                """
                INSERT INTO dws_health_daily
                SELECT CURDATE(), 'order_cnt', '月订购数', '商业化',
                    IFNULL((SELECT SUM(order_cnt) FROM dws_trade_order_1d
                            WHERE src_type<>'ALL'
                              AND DATE_FORMAT(snapshot_date,'%%Y-%%m')=DATE_FORMAT(CURDATE(),'%%Y-%%m')),0),
                    IFNULL((SELECT AVG(m) FROM (
                        SELECT SUM(order_cnt) m FROM dws_trade_order_1d WHERE src_type<>'ALL'
                        GROUP BY DATE_FORMAT(snapshot_date,'%%Y-%%m')) x),0),
                    CASE WHEN IFNULL((SELECT SUM(order_cnt) FROM dws_trade_order_1d
                            WHERE src_type<>'ALL'
                              AND DATE_FORMAT(snapshot_date,'%%Y-%%m')=DATE_FORMAT(CURDATE(),'%%Y-%%m')),0)
                              >= (SELECT green_min FROM cfg_health_threshold WHERE metric_code='order_cnt')
                         THEN 'green'
                         WHEN IFNULL((SELECT SUM(order_cnt) FROM dws_trade_order_1d
                            WHERE src_type<>'ALL'
                              AND DATE_FORMAT(snapshot_date,'%%Y-%%m')=DATE_FORMAT(CURDATE(),'%%Y-%%m')),0)
                              >= (SELECT yellow_min FROM cfg_health_threshold WHERE metric_code='order_cnt')
                         THEN 'yellow' ELSE 'red' END
                """
            )
            cur.execute(
                """
                INSERT INTO dws_health_daily
                SELECT
                    (SELECT MAX(snapshot_date) FROM dws_act_user_active_1d),
                    'vod_active', '点播活跃', '内容',
                    IFNULL((SELECT SUM(is_vod_active) FROM dws_act_user_active_1d
                            WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)),0),
                    IFNULL((SELECT AVG(v) FROM (
                        SELECT SUM(is_vod_active) v FROM dws_act_user_active_1d GROUP BY snapshot_date) t),0),
                    CASE WHEN IFNULL((SELECT SUM(is_vod_active) FROM dws_act_user_active_1d
                            WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)),0)
                              >= (SELECT green_min FROM cfg_health_threshold WHERE metric_code='vod_active')
                         THEN 'green'
                         WHEN IFNULL((SELECT SUM(is_vod_active) FROM dws_act_user_active_1d
                            WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dws_act_user_active_1d)),0)
                              >= (SELECT yellow_min FROM cfg_health_threshold WHERE metric_code='vod_active')
                         THEN 'yellow' ELSE 'red' END
                """
            )
            cur.execute(
                """
                INSERT INTO dws_health_daily
                SELECT
                    (SELECT MAX(snapshot_date) FROM dwd_user_status_di),
                    'active_ratio', '活跃占比', '健康度',
                    IFNULL((SELECT SUM(user_status='active')/NULLIF(COUNT(*),0)*100
                            FROM dwd_user_status_di
                            WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dwd_user_status_di)),0),
                    60,
                    CASE WHEN IFNULL((SELECT SUM(user_status='active')/NULLIF(COUNT(*),0)*100
                            FROM dwd_user_status_di
                            WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dwd_user_status_di)),0)
                              >= (SELECT green_min FROM cfg_health_threshold WHERE metric_code='active_ratio')
                         THEN 'green'
                         WHEN IFNULL((SELECT SUM(user_status='active')/NULLIF(COUNT(*),0)*100
                            FROM dwd_user_status_di
                            WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM dwd_user_status_di)),0)
                              >= (SELECT yellow_min FROM cfg_health_threshold WHERE metric_code='active_ratio')
                         THEN 'yellow' ELSE 'red' END
                """
            )
            cur.execute("SELECT COUNT(*) AS c FROM dws_health_daily")
            print("dws_health_daily rows", cur.fetchone()["c"])

            # RFM：真实 F/M
            cur.execute(
                """
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
                    SELECT userid,
                        COUNT(*) AS frequency,
                        ROUND(SUM(IFNULL(fee, 0)), 2) AS monetary
                    FROM dwd_trade_order_di
                    WHERE op_type = 'order'
                    GROUP BY userid
                ) o ON u.userid = o.userid
                WHERE u.snapshot_date = (SELECT MAX(snapshot_date) FROM dwd_user_status_di)
                """
            )

            # 渠道分析：CAC/ROI 改名为可解释指标（客单/分成占比）
            cur.execute(
                """
                CREATE OR REPLACE VIEW v_channel_analysis AS
                SELECT
                    snapshot_date,
                    src_type AS channel_code,
                    src_type AS channel_name,
                    order_amount AS gmv_amount,
                    order_cnt AS order_users,
                    ROUND(order_amount / NULLIF(order_cnt, 0), 2) AS avg_order_price,
                    ROUND(confirm_proxy / NULLIF(order_cnt, 0) * 100, 2) AS conversion_rate,
                    revenue_share AS platform_share_amount,
                    ROUND(revenue_share / NULLIF(order_amount, 0), 2) AS share_ratio
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
                ) t
                """
            )

            # A/B：标明为入口对照观测，非随机实验
            cur.execute(
                """
                CREATE OR REPLACE VIEW v_entry_source_compare AS
                SELECT
                    f.snapshot_date,
                    CONCAT('入口来源_', f.src_type) AS compare_name,
                    CONCAT(f.device_type, '/', f.src_type) AS variant,
                    f.expose_cnt AS sample_size,
                    f.click_cnt,
                    f.verify_cnt,
                    f.confirm_cnt,
                    ROUND(f.click_cnt / NULLIF(f.expose_cnt, 0) * 100, 2) AS ctr_pct,
                    ROUND(f.confirm_cnt / NULLIF(f.click_cnt, 0) * 100, 2) AS cvr_pct,
                    'observational' AS design_type
                FROM dws_trade_cashier_funnel_1d f
                WHERE f.src_type <> 'ALL' AND f.device_type <> 'ALL'
                """
            )
            cur.execute("DROP VIEW IF EXISTS v_ab_experiment")
            cur.execute(
                """
                CREATE OR REPLACE VIEW v_ab_experiment AS
                SELECT *, '非随机分流·入口对照观测' AS caveat FROM v_entry_source_compare
                """
            )

            # LTV：客单价/分成，注释非 CAC
            cur.execute(
                """
                CREATE OR REPLACE VIEW v_ltv AS
                SELECT
                    src_type AS channel_name,
                    SUM(order_cnt) AS order_count,
                    ROUND(SUM(order_amount), 2) AS total_gmv,
                    ROUND(SUM(order_amount) / NULLIF(SUM(order_cnt), 0), 2) AS avg_order_value,
                    ROUND(SUM(revenue_share) / NULLIF(SUM(order_cnt), 0), 2) AS avg_platform_share
                FROM dws_trade_order_1d
                WHERE src_type <> 'ALL'
                GROUP BY src_type
                ORDER BY avg_order_value DESC
                """
            )

        conn.commit()
        print("DONE")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
