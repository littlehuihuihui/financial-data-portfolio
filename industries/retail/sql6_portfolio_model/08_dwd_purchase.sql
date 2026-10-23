-- =============================================================================
-- DWD · 采购事实（方法论采购场景；ADS 禁止直读 ODS）
-- Kimball：
--   1) 业务过程：采购下单与收货
--   2) 粒度：一张采购单（purchase_id）一行
--   3) 维度：供应商 / 品牌 / 品类 / 采购日 / 收货日
--   4) 事实：采购金额/数量、收货数量/金额、是否准时、是否开票
-- 表类型：明细事实·全量快照（演示环境按批次覆盖）
-- =============================================================================
USE retail_finance;

CREATE TABLE IF NOT EXISTS dwd_fct_purchase (
    purchase_sk       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '代理键',
    purchase_id       VARCHAR(50)  NOT NULL COMMENT '采购单号·业务键',
    purchase_date     DATE         NOT NULL COMMENT '下单日',
    receipt_date      DATE         NULL COMMENT '收货日',
    supplier_code     VARCHAR(50)  NOT NULL DEFAULT '-1',
    supplier_name     VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
    brand_code        VARCHAR(20)  NOT NULL DEFAULT '-1',
    brand_name        VARCHAR(30)  NOT NULL DEFAULT 'UNKNOWN',
    category_code     VARCHAR(20)  NOT NULL DEFAULT '-1',
    category_name     VARCHAR(30)  NOT NULL DEFAULT 'UNKNOWN',
    purchase_qty      INT          NOT NULL DEFAULT 0 COMMENT '采购数量·件',
    unit_price        DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '单价·元',
    purchase_amount   DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '采购金额·元',
    receipt_flag      TINYINT      NOT NULL DEFAULT 0 COMMENT '1=已收货',
    receipt_qty       INT          NOT NULL DEFAULT 0,
    invoice_flag      TINYINT      NOT NULL DEFAULT 0 COMMENT '1=已开票',
    invoice_amount    DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '开票金额·元',
    status            VARCHAR(20)  NOT NULL DEFAULT 'open' COMMENT 'open/received/partial',
    on_time_flag      TINYINT      NOT NULL DEFAULT 0 COMMENT '收货≤下单+7天',
    delay_days        INT          NOT NULL DEFAULT 0 COMMENT '相对承诺日延误天数',
    source_system     VARCHAR(32)  NOT NULL DEFAULT 'ERP',
    etl_batch_id      VARCHAR(50)  NOT NULL DEFAULT '0',
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (purchase_sk),
    UNIQUE KEY uk_purchase_id (purchase_id),
    KEY idx_po_date (purchase_date),
    KEY idx_receipt_date (receipt_date),
    KEY idx_supplier (supplier_code)
) COMMENT='DWD·采购单事实·全量表·粒度=采购单';

-- ODS → DWD（仅本层允许读 ODS）
TRUNCATE TABLE dwd_fct_purchase;

INSERT INTO dwd_fct_purchase (
    purchase_id, purchase_date, receipt_date,
    supplier_code, supplier_name, brand_code, brand_name,
    category_code, category_name,
    purchase_qty, unit_price, purchase_amount,
    receipt_flag, receipt_qty, invoice_flag, invoice_amount,
    status, on_time_flag, delay_days, source_system, etl_batch_id
)
SELECT
    p.purchase_id,
    p.purchase_date,
    p.receipt_date,
    IFNULL(NULLIF(p.supplier_code, ''), '-1'),
    IFNULL(NULLIF(p.supplier_name, ''), 'UNKNOWN'),
    IFNULL(NULLIF(p.brand_code, ''), '-1'),
    IFNULL(b.brand_name, 'UNKNOWN'),
    IFNULL(NULLIF(p.category_code, ''), '-1'),
    IFNULL(c.category_name, 'UNKNOWN'),
    IFNULL(p.purchase_qty, 0),
    IFNULL(p.unit_price, 0),
    IFNULL(p.purchase_amount, 0),
    IFNULL(p.receipt_flag, 0),
    IFNULL(p.receipt_qty, 0),
    IFNULL(p.invoice_flag, 0),
    IFNULL(p.invoice_amount, 0),
    CASE
        WHEN IFNULL(p.receipt_flag, 0) = 1 THEN 'received'
        WHEN IFNULL(p.receipt_qty, 0) > 0 THEN 'partial'
        ELSE 'open'
    END,
    CASE
        WHEN p.receipt_date IS NOT NULL
         AND p.receipt_date <= DATE_ADD(p.purchase_date, INTERVAL 7 DAY) THEN 1
        ELSE 0
    END,
    CASE
        WHEN p.receipt_date IS NULL THEN 0
        ELSE GREATEST(DATEDIFF(p.receipt_date, DATE_ADD(p.purchase_date, INTERVAL 7 DAY)), 0)
    END,
    'ERP',
    IFNULL(p.etl_batch_id, '0')
FROM ods_purchase p
LEFT JOIN dim_brand b ON p.brand_code = b.brand_code
LEFT JOIN dim_category c ON p.category_code = c.category_code;
