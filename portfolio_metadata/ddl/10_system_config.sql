-- ============================================================================
-- portfolio_metadata · 当前生效配置快照（可选，与 version_history 互补）
-- ============================================================================

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS system_config (
    config_id      INT            NOT NULL AUTO_INCREMENT,
    industry_id    INT            NOT NULL,
    config_key     VARCHAR(64)    NOT NULL DEFAULT 'portfolio_snapshot',
    config_json    JSON           NOT NULL,
    version_tag    VARCHAR(32)    NOT NULL,
    updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (config_id),
    UNIQUE KEY uk_industry_key (industry_id, config_key),
    KEY idx_version (version_tag),
    CONSTRAINT fk_syscfg_industry
        FOREIGN KEY (industry_id) REFERENCES industry_catalog (industry_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行业当前生效配置快照';
