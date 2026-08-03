-- ============================================================================
-- portfolio_metadata · 行业状态查询视图
-- ============================================================================

USE portfolio_metadata;

CREATE OR REPLACE VIEW v_industry_status AS
SELECT
    ic.industry_id,
    ic.industry_code,
    ic.industry_name,
    ic.database_name,
    ic.folder_path,
    ic.entry_file,
    ic.current_version,
    ic.status                                          AS industry_status,
    vh.version_id                                      AS active_version_id,
    vh.version_tag                                     AS active_version_tag,
    vh.release_notes                                   AS active_release_notes,
    vh.status                                          AS version_status,
    (
        SELECT MAX(cl.created_at)
        FROM change_log cl
        WHERE cl.industry_id = ic.industry_id
    )                                                  AS last_change_at,
    (
        SELECT COUNT(*)
        FROM sync_log sl
        WHERE JSON_CONTAINS(sl.target_industry_ids, CAST(ic.industry_id AS JSON), '$')
          AND sl.status IN ('pending', 'in_progress')
    )                                                  AS pending_sync_count,
    (
        SELECT sl.status
        FROM sync_log sl
        WHERE JSON_CONTAINS(sl.target_industry_ids, CAST(ic.industry_id AS JSON), '$')
        ORDER BY sl.created_at DESC
        LIMIT 1
    )                                                  AS latest_sync_status,
    ic.created_at,
    ic.updated_at
FROM industry_catalog ic
LEFT JOIN version_history vh
    ON vh.industry_id = ic.industry_id
   AND vh.version_tag = ic.current_version;
