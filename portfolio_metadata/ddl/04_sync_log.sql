-- ============================================================================
-- portfolio_metadata · 批量修改同步记录表
-- ============================================================================

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS sync_log (
    sync_id              BIGINT         NOT NULL AUTO_INCREMENT COMMENT '同步任务主键',
    source_industry_id   INT            NOT NULL COMMENT '修改来源行业',
    target_industry_ids  JSON           NOT NULL COMMENT '待同步目标行业 ID 列表',
    component_type       VARCHAR(30)    NOT NULL COMMENT '同步组件类型',
    sync_description     TEXT           NOT NULL COMMENT '同步说明',
    status               VARCHAR(20)    NOT NULL DEFAULT 'pending' COMMENT 'pending / in_progress / completed / failed',
    created_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at         DATETIME       NULL COMMENT '完成时间',
    PRIMARY KEY (sync_id),
    KEY idx_source_status (source_industry_id, status),
    KEY idx_created (created_at),
    CONSTRAINT fk_sync_source_industry
        FOREIGN KEY (source_industry_id) REFERENCES industry_catalog (industry_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多行业平台 · 跨行业批量同步记录';
