USE manufacturing_analytics;

-- DWD 事实表 ≥15 字段；金额 DECIMAL(15,2)

CREATE TABLE IF NOT EXISTS dwd_production_wide (
    order_id VARCHAR(32) PRIMARY KEY,
    order_sk BIGINT NOT NULL DEFAULT -1,
    order_date DATE NOT NULL,
    due_date DATE NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1',
    factory_name VARCHAR(40) NOT NULL DEFAULT '未知',
    line_code VARCHAR(20) NOT NULL DEFAULT '-1',
    line_name VARCHAR(60) NOT NULL DEFAULT '未知',
    product_code VARCHAR(20) NOT NULL DEFAULT '-1',
    product_name VARCHAR(80) NOT NULL DEFAULT '未知',
    plan_qty INT NOT NULL DEFAULT 0,
    actual_qty INT NOT NULL DEFAULT 0,
    plan_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    delivered_on_time TINYINT(1) NOT NULL DEFAULT 0,
    order_status VARCHAR(20) NOT NULL DEFAULT '未知',
    material_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    overhead_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DWD·生产事实宽表·增量·粒度=工单';

CREATE TABLE IF NOT EXISTS dwd_quality_wide (
    inspect_id BIGINT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL DEFAULT '-1',
    inspect_date DATE NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1',
    line_code VARCHAR(20) NOT NULL DEFAULT '-1',
    line_name VARCHAR(60) NOT NULL DEFAULT '未知',
    product_code VARCHAR(20) NOT NULL DEFAULT '-1',
    product_name VARCHAR(80) NOT NULL DEFAULT '未知',
    total_qty INT NOT NULL DEFAULT 0,
    pass_qty INT NOT NULL DEFAULT 0,
    defect_qty INT NOT NULL DEFAULT 0,
    scrap_qty INT NOT NULL DEFAULT 0,
    defect_type VARCHAR(40) NOT NULL DEFAULT '未知',
    inspect_type VARCHAR(20) NOT NULL DEFAULT '终检',
    is_rework TINYINT(1) NOT NULL DEFAULT 0,
    yield_rate DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '良品率%',
    defect_rate DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DWD·质量事实宽表·增量·粒度=质检单';

CREATE TABLE IF NOT EXISTS dwd_supply_wide (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    material_code VARCHAR(20) NOT NULL DEFAULT '-1',
    material_name VARCHAR(80) NOT NULL DEFAULT '未知',
    supplier_code VARCHAR(20) NOT NULL DEFAULT '-1',
    supplier_name VARCHAR(80) NOT NULL DEFAULT '未知',
    warehouse_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    on_hand_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    daily_usage DECIMAL(15,2) NOT NULL DEFAULT 0,
    on_hand_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    purchase_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    purchase_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    standard_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    on_time_delivery TINYINT(1) NOT NULL DEFAULT 0,
    turnover_days DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'DWD·供应链事实宽表·快照·粒度=日×物料×供应商';
