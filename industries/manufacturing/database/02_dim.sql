USE manufacturing_analytics;

-- DIM 每表≥10字段；未知维用 -1

CREATE TABLE IF NOT EXISTS dim_product (
    product_sk BIGINT NOT NULL DEFAULT -1 COMMENT '代理键',
    product_code VARCHAR(20) PRIMARY KEY,
    product_name VARCHAR(80) NOT NULL DEFAULT '未知',
    product_category VARCHAR(40) NOT NULL DEFAULT '未知',
    standard_unit_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL DEFAULT '件',
    product_status VARCHAR(20) NOT NULL DEFAULT '启用',
    launch_date DATE NULL,
    is_unknown TINYINT(1) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DIM·产品·全量';

CREATE TABLE IF NOT EXISTS dim_production_line (
    line_sk BIGINT NOT NULL DEFAULT -1,
    line_code VARCHAR(20) PRIMARY KEY,
    line_name VARCHAR(60) NOT NULL DEFAULT '未知',
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1',
    factory_name VARCHAR(40) NOT NULL DEFAULT '未知',
    design_capacity_daily INT NOT NULL DEFAULT 0,
    process_type VARCHAR(30) NOT NULL DEFAULT '未知',
    line_status VARCHAR(20) NOT NULL DEFAULT '启用',
    is_unknown TINYINT(1) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DIM·产线·全量';

CREATE TABLE IF NOT EXISTS dim_supplier (
    supplier_sk BIGINT NOT NULL DEFAULT -1,
    supplier_code VARCHAR(20) PRIMARY KEY,
    supplier_name VARCHAR(80) NOT NULL DEFAULT '未知',
    region VARCHAR(30) NOT NULL DEFAULT '未知',
    supplier_level VARCHAR(10) NOT NULL DEFAULT 'B',
    lead_time_days INT NOT NULL DEFAULT 0,
    supplier_status VARCHAR(20) NOT NULL DEFAULT '启用',
    is_unknown TINYINT(1) NOT NULL DEFAULT 0,
    contact_name VARCHAR(40) NOT NULL DEFAULT '未知',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DIM·供应商·全量';

CREATE TABLE IF NOT EXISTS dim_material (
    material_sk BIGINT NOT NULL DEFAULT -1,
    material_code VARCHAR(20) PRIMARY KEY,
    material_name VARCHAR(80) NOT NULL DEFAULT '未知',
    material_type VARCHAR(30) NOT NULL DEFAULT '未知',
    standard_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL DEFAULT '件',
    abc_class VARCHAR(10) NOT NULL DEFAULT 'C',
    material_status VARCHAR(20) NOT NULL DEFAULT '启用',
    is_unknown TINYINT(1) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DIM·物料·全量';

CREATE TABLE IF NOT EXISTS dim_date (
    date_id DATE PRIMARY KEY,
    date_sk BIGINT NOT NULL DEFAULT -1,
    year_num INT NOT NULL DEFAULT 0,
    month_num INT NOT NULL DEFAULT 0,
    day_num INT NOT NULL DEFAULT 0,
    week_of_year INT NOT NULL DEFAULT 0,
    is_weekend TINYINT(1) NOT NULL DEFAULT 0,
    month_label VARCHAR(7) NOT NULL DEFAULT '0000-00',
    quarter_num INT NOT NULL DEFAULT 0,
    day_name VARCHAR(10) NOT NULL DEFAULT '未知',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DIM·日期·全量';

-- 未知维种子
INSERT IGNORE INTO dim_product (product_sk, product_code, product_name, is_unknown)
VALUES (-1, '-1', '未知产品', 1);
INSERT IGNORE INTO dim_production_line (line_sk, line_code, line_name, factory_code, factory_name, is_unknown)
VALUES (-1, '-1', '未知产线', '-1', '未知工厂', 1);
INSERT IGNORE INTO dim_supplier (supplier_sk, supplier_code, supplier_name, is_unknown)
VALUES (-1, '-1', '未知供应商', 1);
INSERT IGNORE INTO dim_material (material_sk, material_code, material_name, is_unknown)
VALUES (-1, '-1', '未知物料', 1);
