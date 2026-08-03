-- 为 version_history 增加配置 JSON 字段（表已存在时仅执行 ALTER）
-- system_config 见 ddl/10_system_config.sql（可选）

USE portfolio_metadata;

ALTER TABLE version_history
    ADD COLUMN config_json JSON NULL COMMENT '版本配置快照（看板/方法论/导航等）' AFTER release_notes;
