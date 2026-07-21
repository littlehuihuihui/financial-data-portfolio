-- ============================================================================
-- portfolio_metadata · 存储过程：版本回滚 & 批量同步
-- ============================================================================

USE portfolio_metadata;

DROP PROCEDURE IF EXISTS sp_rollback;

CREATE PROCEDURE sp_rollback(
    IN p_industry_code VARCHAR(20),
    IN p_target_version VARCHAR(20)
)
BEGIN
    DECLARE v_industry_id INT;
    DECLARE v_old_version VARCHAR(32);
    DECLARE v_version_exists INT DEFAULT 0;
    DECLARE v_result VARCHAR(20) DEFAULT 'failed';
    DECLARE v_message VARCHAR(500) DEFAULT '';

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT v_result AS result, v_message AS message;
    END;

    START TRANSACTION;

    SELECT industry_id, current_version
      INTO v_industry_id, v_old_version
      FROM industry_catalog
     WHERE industry_code = p_industry_code
       AND status = 'active'
     LIMIT 1;

    IF v_industry_id IS NULL THEN
        SET v_message = CONCAT('行业不存在或未激活: ', p_industry_code);
        SELECT v_result AS result, v_message AS message;
        ROLLBACK;
    ELSE
        SELECT COUNT(*)
          INTO v_version_exists
          FROM version_history
         WHERE industry_id = v_industry_id
           AND version_tag = p_target_version;

        IF v_version_exists = 0 THEN
            SET v_message = CONCAT('目标版本不存在: ', p_target_version);
            SELECT v_result AS result, v_message AS message;
            ROLLBACK;
        ELSE
            UPDATE version_history
               SET status = 'stable'
             WHERE industry_id = v_industry_id
               AND status = 'active'
               AND version_tag <> p_target_version;

            UPDATE version_history
               SET status = 'active'
             WHERE industry_id = v_industry_id
               AND version_tag = p_target_version;

            UPDATE industry_catalog
               SET current_version = p_target_version,
                   updated_at = CURRENT_TIMESTAMP
             WHERE industry_id = v_industry_id;

            INSERT INTO change_log (
                industry_id, component_type, component_name,
                change_type, old_value, new_value, change_reason
            ) VALUES (
                v_industry_id, 'version', 'current_version',
                'modify', v_old_version, p_target_version,
                CONCAT('回滚至版本 ', p_target_version)
            );

            COMMIT;
            SET v_result = 'success';
            SET v_message = CONCAT(
                '行业 ', p_industry_code, ' 已回滚: ',
                IFNULL(v_old_version, 'NULL'), ' -> ', p_target_version
            );
            SELECT v_result AS result, v_message AS message,
                   v_industry_id AS industry_id,
                   p_target_version AS current_version;
        END IF;
    END IF;
END;

DROP PROCEDURE IF EXISTS sp_sync_change;

CREATE PROCEDURE sp_sync_change(
    IN p_source_industry VARCHAR(20),
    IN p_target_industries JSON,
    IN p_component_type VARCHAR(30),
    IN p_change_description TEXT
)
BEGIN
    DECLARE v_source_id INT;
    DECLARE v_sync_id BIGINT;
    DECLARE v_target_count INT DEFAULT 0;
    DECLARE v_result VARCHAR(20) DEFAULT 'failed';
    DECLARE v_message VARCHAR(500) DEFAULT '';

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT v_result AS result, v_message AS message;
    END;

    START TRANSACTION;

    SELECT industry_id
      INTO v_source_id
      FROM industry_catalog
     WHERE industry_code = p_source_industry
       AND status = 'active'
     LIMIT 1;

    IF v_source_id IS NULL THEN
        SET v_message = CONCAT('来源行业不存在或未激活: ', p_source_industry);
        SELECT v_result AS result, v_message AS message;
        ROLLBACK;
    ELSEIF p_target_industries IS NULL OR JSON_LENGTH(p_target_industries) = 0 THEN
        SET v_message = '目标行业列表不能为空';
        SELECT v_result AS result, v_message AS message;
        ROLLBACK;
    ELSE
        SET v_target_count = JSON_LENGTH(p_target_industries);

        INSERT INTO sync_log (
            source_industry_id, target_industry_ids,
            component_type, sync_description, status
        ) VALUES (
            v_source_id, p_target_industries,
            p_component_type, p_change_description, 'pending'
        );

        SET v_sync_id = LAST_INSERT_ID();

        INSERT INTO change_log (
            industry_id, component_type, component_name,
            change_type, old_value, new_value, change_reason
        )
        SELECT
            ic.industry_id,
            p_component_type,
            CONCAT('sync_from_', p_source_industry),
            'modify',
            NULL,
            p_change_description,
            CONCAT('待同步修改 #', v_sync_id, '，来源: ', p_source_industry)
        FROM industry_catalog ic
        WHERE JSON_CONTAINS(p_target_industries, CAST(ic.industry_id AS JSON), '$')
          AND ic.status = 'active';

        COMMIT;
        SET v_result = 'success';
        SET v_message = CONCAT(
            '已创建同步任务 #', v_sync_id,
            '，来源=', p_source_industry,
            '，目标数=', v_target_count
        );
        SELECT v_result AS result, v_message AS message,
               v_sync_id AS sync_id,
               v_source_id AS source_industry_id,
               v_target_count AS target_count,
               'pending' AS sync_status;
    END IF;
END;
