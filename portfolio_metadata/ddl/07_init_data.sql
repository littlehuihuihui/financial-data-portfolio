-- ============================================================================
-- portfolio_metadata · 初始化数据（零售行业）
-- ============================================================================

USE portfolio_metadata;

INSERT INTO industry_catalog (
    industry_code, industry_name, database_name, folder_path,
    entry_file, current_version, status
) VALUES (
    'retail',
    '零售财务',
    'retail_finance',
    '/industries/retail/',
    'retail_dashboard.html',
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

INSERT INTO version_history (
    industry_id, version_tag, release_notes, status
)
SELECT
    ic.industry_id,
    'v1.0.0',
    '零售财务分析系统初始版本：13 个主题看板、五层分析方法论、ODS→DWS 数仓链路',
    'active'
FROM industry_catalog ic
WHERE ic.industry_code = 'retail'
ON DUPLICATE KEY UPDATE
    release_notes = VALUES(release_notes),
    status        = VALUES(status);

INSERT INTO change_log (
    industry_id, component_type, component_name,
    change_type, new_value, change_reason
)
SELECT
    ic.industry_id,
    'platform',
    'industry_bootstrap',
    'add',
    'retail_finance / industries/retail/',
    '多行业平台初始化：注册零售财务行业'
FROM industry_catalog ic
WHERE ic.industry_code = 'retail'
  AND NOT EXISTS (
      SELECT 1 FROM change_log cl
      WHERE cl.industry_id = ic.industry_id
        AND cl.component_name = 'industry_bootstrap'
  );

SELECT * FROM v_industry_status ORDER BY industry_id;

-- ============================================================================
-- 互联网 · 制造业（多行业扩展）
-- ============================================================================

INSERT INTO industry_catalog (
    industry_code, industry_name, database_name, folder_path,
    entry_file, current_version, status
) VALUES
    ('internet', '互联网通用', 'internet_analytics', '/industries/internet/', 'internet_dashboard.html', 'v1.0.0', 'active'),
    ('manufacturing', '制造业', 'manufacturing_analytics', '/industries/manufacturing/', 'manufacturing_dashboard.html', 'v1.0.0', 'active')
ON DUPLICATE KEY UPDATE
    industry_name = VALUES(industry_name), database_name = VALUES(database_name),
    folder_path = VALUES(folder_path), entry_file = VALUES(entry_file),
    current_version = VALUES(current_version), status = VALUES(status), updated_at = CURRENT_TIMESTAMP;

INSERT INTO version_history (industry_id, version_tag, release_notes, status)
SELECT ic.industry_id, 'v1.0.0', '互联网行业：设备操作日志 + 多产品线数仓', 'active'
FROM industry_catalog ic WHERE ic.industry_code = 'internet'
ON DUPLICATE KEY UPDATE release_notes = VALUES(release_notes), status = VALUES(status);

INSERT INTO version_history (industry_id, version_tag, release_notes, status)
SELECT ic.industry_id, 'v1.0.0', '制造业：10看板 + 六层方法论 + 31对象数仓', 'active'
FROM industry_catalog ic WHERE ic.industry_code = 'manufacturing'
ON DUPLICATE KEY UPDATE release_notes = VALUES(release_notes), status = VALUES(status);

SELECT * FROM v_industry_status ORDER BY industry_id;
