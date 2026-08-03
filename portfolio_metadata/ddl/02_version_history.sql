-- ============================================================================
-- portfolio_metadata · 版本历史表
-- ============================================================================

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS version_history (
    version_id     INT            NOT NULL AUTO_INCREMENT COMMENT '版本主键',
    industry_id    INT            NOT NULL COMMENT '所属行业',
    version_tag    VARCHAR(32)    NOT NULL COMMENT '版本标签，如 v1.0.0',
    release_notes  TEXT           NULL COMMENT '版本说明',
    status         VARCHAR(20)    NOT NULL DEFAULT 'stable' COMMENT 'active / stable / deprecated',
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (version_id),
    UNIQUE KEY uk_industry_version (industry_id, version_tag),
    KEY idx_industry_status (industry_id, status),
    CONSTRAINT fk_version_industry
        FOREIGN KEY (industry_id) REFERENCES industry_catalog (industry_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多行业平台 · 版本历史';
