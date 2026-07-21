-- ============================================================================
-- 制造业数仓增强 · P0+P1（数据架构师审查落地）
-- 新增维度：dim_factory / dim_equipment / dim_defect_type
-- 新增事实：dwd_equipment_run（设备运行明细）/ fact_material_consumption（工单领料）
--          / fact_process_operation（工序完成）/ dwd_labor_wide（人工事实宽表）
-- ============================================================================
USE manufacturing_analytics;

-- ---------------------- DIM · 工厂维度 ----------------------
CREATE TABLE IF NOT EXISTS dim_factory (
    factory_sk       BIGINT       NOT NULL DEFAULT -1 COMMENT '代理键',
    factory_code     VARCHAR(10)  PRIMARY KEY COMMENT '工厂编码',
    factory_name     VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '工厂名称',
    region           VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '所属大区',
    city             VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '所在城市',
    factory_type     VARCHAR(30)  NOT NULL DEFAULT '综合制造' COMMENT '工厂类型',
    line_count       INT          NOT NULL DEFAULT 0 COMMENT '产线数量',
    employee_count   INT          NOT NULL DEFAULT 0 COMMENT '员工人数',
    floor_area_sqm   DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '厂房面积·㎡',
    factory_status   VARCHAR(20)  NOT NULL DEFAULT '启用',
    is_unknown       TINYINT(1)   NOT NULL DEFAULT 0,
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0'
) COMMENT 'DIM·工厂·全量';

-- ---------------------- DIM · 设备维度 ----------------------
CREATE TABLE IF NOT EXISTS dim_equipment (
    equipment_sk     BIGINT       NOT NULL DEFAULT -1 COMMENT '代理键',
    equipment_code   VARCHAR(20)  PRIMARY KEY COMMENT '设备编码',
    equipment_name   VARCHAR(80)  NOT NULL DEFAULT '未知' COMMENT '设备名称',
    line_code        VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '所属产线',
    line_name        VARCHAR(60)  NOT NULL DEFAULT '未知',
    factory_code     VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '所属工厂',
    factory_name     VARCHAR(40)  NOT NULL DEFAULT '未知',
    equipment_type   VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '设备类型',
    rated_capacity   DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '额定产能·件/时',
    vendor           VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '设备厂商',
    install_date     DATE         NULL COMMENT '安装日期',
    equipment_status VARCHAR(20)  NOT NULL DEFAULT '运行',
    is_unknown       TINYINT(1)   NOT NULL DEFAULT 0,
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0'
) COMMENT 'DIM·设备·全量';

-- ---------------------- DIM · 缺陷类型维度 ----------------------
CREATE TABLE IF NOT EXISTS dim_defect_type (
    defect_type_sk   BIGINT       NOT NULL DEFAULT -1 COMMENT '代理键',
    defect_type_code VARCHAR(20)  PRIMARY KEY COMMENT '缺陷编码',
    defect_type_name VARCHAR(40)  NOT NULL DEFAULT '未知' COMMENT '缺陷名称',
    defect_category  VARCHAR(20)  NOT NULL DEFAULT '未知' COMMENT '缺陷大类：外观/尺寸/功能/装配/材料',
    severity         VARCHAR(10)  NOT NULL DEFAULT '一般' COMMENT '严重度：轻微/一般/严重',
    typical_cause    VARCHAR(80)  NOT NULL DEFAULT '未知' COMMENT '典型成因',
    is_unknown       TINYINT(1)   NOT NULL DEFAULT 0,
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0'
) COMMENT 'DIM·缺陷类型·全量';

-- ---------------------- DWD · 设备运行明细事实（粒度=日×设备×班次）----------------------
CREATE TABLE IF NOT EXISTS dwd_equipment_run (
    run_id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '运行记录ID',
    run_date         DATE         NOT NULL COMMENT '运行日期',
    equipment_code   VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '设备编码',
    equipment_name   VARCHAR(80)  NOT NULL DEFAULT '未知',
    line_code        VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产线',
    factory_code     VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '工厂',
    shift_code       VARCHAR(10)  NOT NULL DEFAULT 'D' COMMENT '班次：D白/N夜',
    planned_time_min DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '计划运行分钟',
    run_time_min     DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '实际运行分钟',
    downtime_min     DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '停机分钟',
    downtime_reason  VARCHAR(40)  NOT NULL DEFAULT '正常' COMMENT '停机原因',
    output_qty       INT          NOT NULL DEFAULT 0 COMMENT '产出数量',
    good_qty         INT          NOT NULL DEFAULT 0 COMMENT '良品数量',
    failure_count    INT          NOT NULL DEFAULT 0 COMMENT '故障次数',
    availability_pct DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '时间开动率%',
    performance_pct  DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '性能开动率%',
    quality_pct      DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '合格率%',
    oee_pct          DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'OEE%',
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0',
    KEY idx_eqr_date (run_date, equipment_code),
    KEY idx_eqr_line (line_code, run_date)
) COMMENT 'DWD·设备运行明细事实·增量·粒度=日×设备×班次';

-- ---------------------- FACT · 工单领料事实（粒度=工单×物料）----------------------
CREATE TABLE IF NOT EXISTS fact_material_consumption (
    consumption_id   BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '领料记录ID',
    consume_date     DATE         NOT NULL COMMENT '领料日期',
    order_id         VARCHAR(32)  NOT NULL DEFAULT '-1' COMMENT '工单号',
    material_code    VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '物料编码',
    material_name    VARCHAR(80)  NOT NULL DEFAULT '未知',
    factory_code     VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '工厂',
    line_code        VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产线',
    product_code     VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产品',
    plan_qty         DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '应领量·BOM',
    actual_qty       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '实领量',
    unit_price       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '物料单价·元',
    consume_amount   DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '耗用金额·元',
    variance_qty     DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '超领量（实领-应领）',
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0',
    KEY idx_fmc_date (consume_date, material_code),
    KEY idx_fmc_order (order_id)
) COMMENT 'FACT·工单领料事实·增量·粒度=工单×物料';

-- ---------------------- FACT · 工序完成事实（粒度=工单×工序）----------------------
CREATE TABLE IF NOT EXISTS fact_process_operation (
    op_id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '工序记录ID',
    order_id         VARCHAR(32)  NOT NULL DEFAULT '-1' COMMENT '工单号',
    step_seq         INT          NOT NULL DEFAULT 0 COMMENT '工序顺序',
    process_step     VARCHAR(30)  NOT NULL DEFAULT '未知' COMMENT '工序名：下料/加工/装配/检验/包装',
    report_date      DATE         NOT NULL COMMENT '报工日期',
    factory_code     VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '工厂',
    line_code        VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产线',
    equipment_code   VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '设备',
    product_code     VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产品',
    input_qty        INT          NOT NULL DEFAULT 0 COMMENT '投入数量',
    output_qty       INT          NOT NULL DEFAULT 0 COMMENT '完成数量',
    good_qty         INT          NOT NULL DEFAULT 0 COMMENT '合格数量',
    defect_qty       INT          NOT NULL DEFAULT 0 COMMENT '不良数量',
    wip_qty          INT          NOT NULL DEFAULT 0 COMMENT '在制品数量',
    plan_hours       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '计划工时',
    actual_hours     DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '实际工时',
    op_status        VARCHAR(20)  NOT NULL DEFAULT '完成' COMMENT '工序状态：完成/在制/待产',
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0',
    KEY idx_fpo_order (order_id, step_seq),
    KEY idx_fpo_date (report_date, process_step)
) COMMENT 'FACT·工序完成事实·增量·粒度=工单×工序';

-- ---------------------- DWD · 人工事实宽表（粒度=工单×人工记录）----------------------
CREATE TABLE IF NOT EXISTS dwd_labor_wide (
    labor_id         BIGINT       NOT NULL PRIMARY KEY COMMENT '人工记录ID',
    order_id         VARCHAR(32)  NOT NULL DEFAULT '-1' COMMENT '工单号',
    work_date        DATE         NOT NULL COMMENT '作业日期',
    factory_code     VARCHAR(10)  NOT NULL DEFAULT '-1' COMMENT '工厂',
    factory_name     VARCHAR(40)  NOT NULL DEFAULT '未知',
    line_code        VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产线',
    line_name        VARCHAR(60)  NOT NULL DEFAULT '未知',
    product_code     VARCHAR(20)  NOT NULL DEFAULT '-1' COMMENT '产品',
    shift_code       VARCHAR(10)  NOT NULL DEFAULT 'D' COMMENT '班次',
    plan_hours       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '计划工时',
    actual_hours     DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '实际工时',
    hours_achievement_pct DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '工时达成率%',
    labor_cost       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '人工成本·元',
    etl_batch_id     VARCHAR(32)  NOT NULL DEFAULT '0',
    KEY idx_dlw_month (work_date, factory_code)
) COMMENT 'DWD·人工事实宽表·增量·粒度=工单×人工记录';

-- ---------------------- fact_* 同义视图（跨行业命名一致）----------------------
CREATE OR REPLACE VIEW fact_equipment_run AS SELECT * FROM dwd_equipment_run;
CREATE OR REPLACE VIEW fact_labor AS SELECT * FROM dwd_labor_wide;
