-- DIM · 营销活动维（看板禁止直读 ods_activity）
-- 业务过程：活动策划；粒度：一个活动一行；类型：全量维表
USE internet_analytics;

CREATE TABLE IF NOT EXISTS dim_activity (
    activity_id         VARCHAR(64)  NOT NULL COMMENT '活动ID',
    activity_name       VARCHAR(128) NOT NULL DEFAULT 'UNKNOWN',
    start_date          DATE         NOT NULL,
    end_date            DATE         NOT NULL,
    activity_type       VARCHAR(32)  NOT NULL DEFAULT 'UNKNOWN',
    target_product_line VARCHAR(32)  NOT NULL DEFAULT 'ALL',
    budget_amount       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '预算·元',
    target_users        INT          NOT NULL DEFAULT 0,
    source_system       VARCHAR(32)  NOT NULL DEFAULT 'CRM',
    etl_batch_id        VARCHAR(50)  NOT NULL DEFAULT '0',
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id),
    KEY idx_dim_act_dates (start_date, end_date)
) COMMENT='DIM·营销活动维·全量表';

TRUNCATE TABLE dim_activity;

INSERT INTO dim_activity (
    activity_id, activity_name, start_date, end_date, activity_type,
    target_product_line, budget_amount, target_users, source_system, etl_batch_id
)
SELECT
    activity_id,
    IFNULL(activity_name, 'UNKNOWN'),
    start_date,
    end_date,
    IFNULL(activity_type, 'UNKNOWN'),
    IFNULL(target_product_line, 'ALL'),
    IFNULL(budget_amount, 0),
    IFNULL(target_users, 0),
    'CRM',
    IFNULL(etl_batch_id, '0')
FROM ods_activity;
