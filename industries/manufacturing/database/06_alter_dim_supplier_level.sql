-- 补齐 dim_supplier.supplier_level（旧库可能缺列；权威 DDL 见 02_dim.sql）
USE manufacturing_analytics;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'manufacturing_analytics'
    AND TABLE_NAME = 'dim_supplier'
    AND COLUMN_NAME = 'supplier_level'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE dim_supplier ADD COLUMN supplier_level VARCHAR(10) NOT NULL DEFAULT ''B'' AFTER region',
  'SELECT ''dim_supplier.supplier_level already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
