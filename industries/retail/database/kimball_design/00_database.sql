-- =============================================================================
-- 零售电商 · Kimball 五层数仓（数据架构师设计稿）
-- 数据库：retail_kimball（与现网 retail_finance 隔离，便于评审）
-- 规范：ODS→DWD→DWS→ADS | 金额 DECIMAL(15,2) | ID BIGINT | 业务日期 VARCHAR(10) YYYY-MM-DD
-- 空值：维度代理键默认 -1 | 指标默认 0
-- =============================================================================

CREATE DATABASE IF NOT EXISTS retail_kimball
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE retail_kimball;
