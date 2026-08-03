-- 制造业 ODS · 贴源 · 每表≥10字段 · 金额 DECIMAL(15,2)
CREATE DATABASE IF NOT EXISTS manufacturing_analytics DEFAULT CHARSET utf8mb4;
USE manufacturing_analytics;

CREATE TABLE IF NOT EXISTS ods_production_order (
    order_id VARCHAR(32) PRIMARY KEY COMMENT '工单号·业务键',
    order_sk BIGINT NOT NULL DEFAULT -1 COMMENT '代理键·维度缺省-1',
    order_date DATE NOT NULL COMMENT '开工日期',
    due_date DATE NOT NULL COMMENT '交付日期',
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1' COMMENT '工厂编码',
    line_code VARCHAR(20) NOT NULL DEFAULT '-1' COMMENT '产线编码',
    product_code VARCHAR(20) NOT NULL DEFAULT '-1' COMMENT '产品编码',
    plan_qty INT NOT NULL DEFAULT 0 COMMENT '计划产量',
    actual_qty INT NOT NULL DEFAULT 0 COMMENT '实际产量',
    plan_hours DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '计划工时',
    actual_hours DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '实际工时',
    delivered_on_time TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否准时交付',
    order_status VARCHAR(20) NOT NULL DEFAULT '未知' COMMENT '工单状态',
    source_system VARCHAR(32) NOT NULL DEFAULT 'MES' COMMENT '来源系统',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·生产工单·增量表';

CREATE TABLE IF NOT EXISTS ods_production_line (
    line_code VARCHAR(20) PRIMARY KEY COMMENT '产线编码',
    line_sk BIGINT NOT NULL DEFAULT -1,
    line_name VARCHAR(60) NOT NULL DEFAULT '未知',
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1',
    factory_name VARCHAR(40) NOT NULL DEFAULT '未知',
    design_capacity_daily INT NOT NULL DEFAULT 0 COMMENT '日设计产能',
    line_status VARCHAR(20) NOT NULL DEFAULT '启用',
    shift_count INT NOT NULL DEFAULT 0 COMMENT '班次数',
    process_type VARCHAR(30) NOT NULL DEFAULT '未知' COMMENT '工艺类型',
    source_system VARCHAR(32) NOT NULL DEFAULT 'MES',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·产线主数据·全量表';

CREATE TABLE IF NOT EXISTS ods_quality_inspection (
    inspect_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL DEFAULT '-1',
    inspect_date DATE NOT NULL,
    line_code VARCHAR(20) NOT NULL DEFAULT '-1',
    product_code VARCHAR(20) NOT NULL DEFAULT '-1',
    total_qty INT NOT NULL DEFAULT 0,
    pass_qty INT NOT NULL DEFAULT 0,
    defect_qty INT NOT NULL DEFAULT 0,
    scrap_qty INT NOT NULL DEFAULT 0,
    defect_type VARCHAR(40) NOT NULL DEFAULT '未知',
    inspect_type VARCHAR(20) NOT NULL DEFAULT '终检' COMMENT '抽检/终检',
    is_rework TINYINT(1) NOT NULL DEFAULT 0,
    inspector_id VARCHAR(32) NOT NULL DEFAULT '-1',
    source_system VARCHAR(32) NOT NULL DEFAULT 'QMS',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·质检记录·增量表';

CREATE TABLE IF NOT EXISTS ods_material (
    material_code VARCHAR(20) PRIMARY KEY,
    material_sk BIGINT NOT NULL DEFAULT -1,
    material_name VARCHAR(80) NOT NULL DEFAULT '未知',
    material_type VARCHAR(30) NOT NULL DEFAULT '未知',
    standard_price DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '标准单价·元',
    unit VARCHAR(10) NOT NULL DEFAULT '件',
    category_code VARCHAR(20) NOT NULL DEFAULT '-1',
    abc_class VARCHAR(10) NOT NULL DEFAULT 'C',
    material_status VARCHAR(20) NOT NULL DEFAULT '启用',
    source_system VARCHAR(32) NOT NULL DEFAULT 'ERP',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·物料主数据·全量表';

CREATE TABLE IF NOT EXISTS ods_inventory_material (
    snapshot_date DATE NOT NULL COMMENT '快照日',
    material_code VARCHAR(20) NOT NULL DEFAULT '-1',
    warehouse_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    on_hand_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    safety_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
    daily_usage DECIMAL(15,2) NOT NULL DEFAULT 0,
    on_hand_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '库存金额·元',
    inbound_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    outbound_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
    inventory_status VARCHAR(20) NOT NULL DEFAULT '正常',
    source_system VARCHAR(32) NOT NULL DEFAULT 'WMS',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0',
    PRIMARY KEY (snapshot_date, material_code, warehouse_code)
) COMMENT 'ODS·物料库存·日快照表';

CREATE TABLE IF NOT EXISTS ods_supplier (
    supplier_code VARCHAR(20) PRIMARY KEY,
    supplier_sk BIGINT NOT NULL DEFAULT -1,
    supplier_name VARCHAR(80) NOT NULL DEFAULT '未知',
    region VARCHAR(30) NOT NULL DEFAULT '未知',
    supplier_level VARCHAR(10) NOT NULL DEFAULT 'B' COMMENT 'A/B/C',
    contact_name VARCHAR(40) NOT NULL DEFAULT '未知',
    lead_time_days INT NOT NULL DEFAULT 0,
    supplier_status VARCHAR(20) NOT NULL DEFAULT '启用',
    source_system VARCHAR(32) NOT NULL DEFAULT 'ERP',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·供应商·全量表';

CREATE TABLE IF NOT EXISTS ods_equipment (
    equipment_code VARCHAR(20) PRIMARY KEY,
    equipment_sk BIGINT NOT NULL DEFAULT -1,
    equipment_name VARCHAR(80) NOT NULL DEFAULT '未知',
    line_code VARCHAR(20) NOT NULL DEFAULT '-1',
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1',
    equipment_type VARCHAR(30) NOT NULL DEFAULT '未知',
    rated_capacity DECIMAL(15,2) NOT NULL DEFAULT 0,
    equipment_status VARCHAR(20) NOT NULL DEFAULT '运行',
    install_date DATE NULL,
    source_system VARCHAR(32) NOT NULL DEFAULT 'MES',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·设备台账·全量表';

CREATE TABLE IF NOT EXISTS ods_labor (
    labor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL DEFAULT '-1',
    work_date DATE NOT NULL,
    factory_code VARCHAR(10) NOT NULL DEFAULT '-1',
    line_code VARCHAR(20) NOT NULL DEFAULT '-1',
    worker_id VARCHAR(32) NOT NULL DEFAULT '-1',
    shift_code VARCHAR(10) NOT NULL DEFAULT 'D',
    plan_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(15,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '人工成本·元',
    labor_status VARCHAR(20) NOT NULL DEFAULT '已确认',
    source_system VARCHAR(32) NOT NULL DEFAULT 'MES',
    etl_batch_id VARCHAR(32) NOT NULL DEFAULT '0'
) COMMENT 'ODS·人工工时·增量表';
