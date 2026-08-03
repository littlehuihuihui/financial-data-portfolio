-- 注册制造业行业 · v1.0.0
USE portfolio_metadata;

INSERT INTO industry_catalog (
    industry_code, industry_name, database_name, folder_path,
    entry_file, current_version, status
) VALUES (
    'manufacturing', '制造业', 'manufacturing_analytics',
    '/industries/manufacturing/', 'manufacturing_dashboard.html', 'v1.0.0', 'active'
)
ON DUPLICATE KEY UPDATE
    industry_name=VALUES(industry_name), database_name=VALUES(database_name),
    folder_path=VALUES(folder_path), entry_file=VALUES(entry_file),
    current_version=VALUES(current_version), status=VALUES(status), updated_at=CURRENT_TIMESTAMP;

INSERT INTO version_history (industry_id, version_tag, release_notes, status)
SELECT ic.industry_id, 'v1.0.0',
    '制造业初始版本：10看板、六层方法论、31对象数仓、2024-01~2026-07样例',
    'active' FROM industry_catalog ic WHERE ic.industry_code='manufacturing'
ON DUPLICATE KEY UPDATE release_notes=VALUES(release_notes), status=VALUES(status);

SELECT * FROM v_industry_status WHERE industry_code='manufacturing';
