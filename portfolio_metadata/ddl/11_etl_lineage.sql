-- ============================================================================
-- portfolio_metadata · ETL 调度与 A→B 变换边元数据
-- 前端权威：industries/*/js/etl-lineage-data.js
-- 种子生成：python portfolio/scripts/export_etl_lineage_sql.py
-- ============================================================================

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS etl_schedule_job (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  industry      VARCHAR(32)  NOT NULL COMMENT 'retail/manufacturing/internet',
  job_id        VARCHAR(64)  NOT NULL COMMENT '任务业务键',
  job_name      VARCHAR(128) NOT NULL COMMENT '任务名',
  schedule      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '执行频率',
  description   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '说明',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_industry_job (industry, job_id),
  KEY idx_industry (industry)
) COMMENT='ETL调度任务定义（非运行日志）';

CREATE TABLE IF NOT EXISTS etl_transform_edge (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  industry      VARCHAR(32)  NOT NULL COMMENT '零售/制造/互联网',
  edge_id       VARCHAR(64)  NOT NULL COMMENT '边业务键',
  from_table    VARCHAR(128) NOT NULL COMMENT '源表 A',
  to_table      VARCHAR(128) NOT NULL COMMENT '目标表 B',
  layer_from    VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '源层',
  layer_to      VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '目标层',
  job_name      VARCHAR(128) NOT NULL DEFAULT '' COMMENT '所属调度任务',
  schedule      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '频率',
  engine        VARCHAR(16)  NOT NULL DEFAULT 'python' COMMENT 'python/sql/view',
  code_path     VARCHAR(512) NOT NULL DEFAULT '' COMMENT '仓库相对路径',
  entry_point   VARCHAR(256) NOT NULL DEFAULT '' COMMENT '函数/段落',
  computation   TEXT         NULL COMMENT '怎么算（中文）',
  sql_excerpt    TEXT         NULL COMMENT 'SQL/逻辑摘要',
  grain         VARCHAR(128) NOT NULL DEFAULT '' COMMENT '目标粒度',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_industry_edge (industry, edge_id),
  KEY idx_from_to (industry, from_table, to_table),
  KEY idx_engine (industry, engine)
) COMMENT='A→B ETL变换边：代码落点与计算说明';
