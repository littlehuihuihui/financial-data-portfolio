USE manufacturing_analytics;

-- DWS ≥8 字段；金额 DECIMAL(15,2)

CREATE TABLE IF NOT EXISTS dws_production_daily (
    snapshot_date DATE NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT 'ALL',
    line_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    output_qty INT NOT NULL DEFAULT 0,
    plan_qty INT NOT NULL DEFAULT 0,
    capacity_util_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    labor_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    on_time_delivery_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    order_count INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, factory_code, line_code)
) COMMENT 'DWS·日生产汇总·快照表';

CREATE TABLE IF NOT EXISTS dws_quality_daily (
    snapshot_date DATE NOT NULL,
    line_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    product_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    total_qty INT NOT NULL DEFAULT 0,
    pass_qty INT NOT NULL DEFAULT 0,
    defect_qty INT NOT NULL DEFAULT 0,
    scrap_qty INT NOT NULL DEFAULT 0,
    yield_rate_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    defect_rate_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    scrap_rate_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    first_pass_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, line_code, product_code)
) COMMENT 'DWS·日质量汇总·快照表';

CREATE TABLE IF NOT EXISTS dws_supply_daily (
    snapshot_date DATE NOT NULL,
    supplier_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    purchase_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    purchase_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    inventory_turnover_days DECIMAL(15,2) NOT NULL DEFAULT 0,
    supplier_otd_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    order_count INT NOT NULL DEFAULT 0,
    on_hand_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, supplier_code)
) COMMENT 'DWS·日供应汇总·快照表';

CREATE TABLE IF NOT EXISTS dws_equipment_daily (
    snapshot_date DATE NOT NULL,
    equipment_code VARCHAR(20) NOT NULL,
    line_code VARCHAR(20) NOT NULL DEFAULT '-1',
    availability_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    performance_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    quality_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    oee_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    downtime_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    failure_count INT NOT NULL DEFAULT 0,
    downtime_reason VARCHAR(40) NOT NULL DEFAULT '未知',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, equipment_code)
) COMMENT 'DWS·日设备汇总·快照表';

CREATE TABLE IF NOT EXISTS dws_cost_monthly (
    snapshot_month VARCHAR(7) NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT 'ALL',
    product_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    output_qty INT NOT NULL DEFAULT 0,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    material_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    overhead_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_month, factory_code, product_code)
) COMMENT 'DWS·月成本汇总·快照表';

-- 新增：物料周转 / 人工效率 / 缺陷类型（堵住 ADS→ODS/DWD）
CREATE TABLE IF NOT EXISTS dws_material_daily (
    snapshot_date DATE NOT NULL,
    material_code VARCHAR(20) NOT NULL,
    material_name VARCHAR(80) NOT NULL DEFAULT '未知',
    on_hand_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    daily_usage DECIMAL(15,2) NOT NULL DEFAULT 0,
    turnover_days DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_on_hand DECIMAL(15,2) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
    on_hand_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, material_code)
) COMMENT 'DWS·日物料周转·快照表';

CREATE TABLE IF NOT EXISTS dws_labor_monthly (
    snapshot_month VARCHAR(7) NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT 'ALL',
    line_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    plan_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    hours_achievement_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    order_count INT NOT NULL DEFAULT 0,
    worker_count INT NOT NULL DEFAULT 0,
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_month, factory_code, line_code)
) COMMENT 'DWS·月人工效率·快照表';

CREATE TABLE IF NOT EXISTS dws_defect_daily (
    snapshot_date DATE NOT NULL,
    defect_type VARCHAR(40) NOT NULL DEFAULT '未知',
    defect_qty INT NOT NULL DEFAULT 0,
    scrap_qty INT NOT NULL DEFAULT 0,
    total_qty INT NOT NULL DEFAULT 0,
    defect_rate_pct DECIMAL(15,2) NOT NULL DEFAULT 0,
    inspect_count INT NOT NULL DEFAULT 0,
    line_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, defect_type, line_code)
) COMMENT 'DWS·日缺陷汇总·快照表';
