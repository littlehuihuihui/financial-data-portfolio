-- 注册互联网通用行业 · v1.0.0
USE portfolio_metadata;

INSERT INTO industry_catalog (
    industry_code, industry_name, database_name, folder_path,
    entry_file, current_version, status
) VALUES (
    'internet',
    '互联网通用',
    'internet_analytics',
    '/industries/internet/',
    'internet_dashboard.html',
    'v1.0.0',
    'active'
)
ON DUPLICATE KEY UPDATE
    industry_name   = VALUES(industry_name),
    database_name   = VALUES(database_name),
    folder_path     = VALUES(folder_path),
    entry_file      = VALUES(entry_file),
    current_version = VALUES(current_version),
    status          = VALUES(status),
    updated_at      = CURRENT_TIMESTAMP;

INSERT INTO version_history (industry_id, version_tag, release_notes, status)
SELECT ic.industry_id, 'v1.0.0',
    '互联网通用行业初始版本：10看板、六层方法论、30对象数仓、2024-01~2026-07样例数据',
    'active'
FROM industry_catalog ic WHERE ic.industry_code = 'internet'
ON DUPLICATE KEY UPDATE release_notes = VALUES(release_notes), status = VALUES(status);

UPDATE version_history vh
JOIN industry_catalog ic ON vh.industry_id = ic.industry_id
SET vh.status = 'stable'
WHERE ic.industry_code = 'internet' AND vh.version_tag <> 'v1.0.0' AND vh.status = 'active';

INSERT INTO change_log (industry_id, component_type, component_name, change_type, new_value, change_reason)
SELECT ic.industry_id, 'platform', 'industry_internet', 'add',
    'internet_analytics / industries/internet/', '新增互联网通用行业作品集'
FROM industry_catalog ic WHERE ic.industry_code = 'internet'
  AND NOT EXISTS (
    SELECT 1 FROM change_log cl WHERE cl.industry_id = ic.industry_id AND cl.component_name = 'industry_internet'
  );

SELECT * FROM v_industry_status WHERE industry_code = 'internet';
