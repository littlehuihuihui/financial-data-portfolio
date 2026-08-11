-- ============================================================================
-- portfolio_metadata · 一键执行全部 DDL + 初始化
-- DBeaver: 打开本文件 → Alt+X 执行
-- 命令行: python scripts/init_metadata_db.py
-- ============================================================================

SOURCE 01_industry_catalog.sql;
SOURCE 02_version_history.sql;
SOURCE 03_change_log.sql;
SOURCE 04_sync_log.sql;
SOURCE 05_views.sql;
SOURCE 06_stored_procedures.sql;
SOURCE 07_init_data.sql;
SOURCE 10_system_config.sql;
SOURCE 11_etl_lineage.sql;
