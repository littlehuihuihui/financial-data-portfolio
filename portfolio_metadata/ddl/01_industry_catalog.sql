-- ============================================================================
-- portfolio_metadata · 行业目录表
-- ============================================================================

CREATE DATABASE IF NOT EXISTS portfolio_metadata
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS industry_catalog (
    industry_id      INT            NOT NULL AUTO_INCREMENT COMMENT '行业主键',
    industry_code    VARCHAR(20)    NOT NULL COMMENT '行业编码，如 retail / internet / manufacturing',
    industry_name    VARCHAR(100)   NOT NULL COMMENT '行业显示名称',
    database_name    VARCHAR(64)    NOT NULL COMMENT '业务数据库名',
    folder_path      VARCHAR(255)   NOT NULL COMMENT '代码目录，如 /industries/retail/',
    entry_file       VARCHAR(128)   NOT NULL DEFAULT 'retail_dashboard.html' COMMENT '行业入口 HTML',
    current_version  VARCHAR(32)    NULL COMMENT '当前生效版本标签',
    status           VARCHAR(20)    NOT NULL DEFAULT 'active' COMMENT 'active / inactive / deprecated',
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (industry_id),
    UNIQUE KEY uk_industry_code (industry_code),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多行业平台 · 行业注册目录';
