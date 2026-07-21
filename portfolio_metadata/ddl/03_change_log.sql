-- ============================================================================
-- portfolio_metadata · 变更日志表
-- ============================================================================

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS change_log (
    change_id       BIGINT         NOT NULL AUTO_INCREMENT COMMENT '变更主键',
    industry_id     INT            NOT NULL COMMENT '所属行业',
    component_type  VARCHAR(30)    NOT NULL COMMENT '组件类型：sql / etl / dashboard / api / config 等',
    component_name  VARCHAR(128)   NOT NULL COMMENT '组件名称或路径',
    change_type     VARCHAR(20)    NOT NULL COMMENT 'add / modify / delete',
    old_value       TEXT           NULL COMMENT '变更前内容摘要',
    new_value       TEXT           NULL COMMENT '变更后内容摘要',
    change_reason   VARCHAR(500)   NULL COMMENT '变更原因',
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (change_id),
    KEY idx_industry_created (industry_id, created_at),
    KEY idx_component (component_type, component_name),
    CONSTRAINT fk_change_industry
        FOREIGN KEY (industry_id) REFERENCES industry_catalog (industry_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多行业平台 · 组件变更日志';
