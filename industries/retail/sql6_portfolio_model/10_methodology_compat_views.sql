-- 分析方法论 SQL 兼容视图（零售）· 采购订单/收货别名
USE retail_finance;

CREATE OR REPLACE VIEW ods_purchase_order AS
SELECT purchase_id AS po_id, purchase_date AS po_date, supplier_code, supplier_name,
       brand_code, category_code, purchase_amount AS po_amount, purchase_qty,
       CASE WHEN receipt_flag=1 THEN 'received' ELSE 'open' END AS status
FROM ods_purchase;

CREATE OR REPLACE VIEW ods_purchase_receipt AS
SELECT purchase_id AS receipt_id, IFNULL(receipt_date, purchase_date) AS receipt_date,
       supplier_code, brand_code, category_code,
       IFNULL(receipt_qty, purchase_qty) AS receipt_qty,
       IFNULL(invoice_amount, purchase_amount) AS receipt_amount
FROM ods_purchase WHERE receipt_flag = 1 OR receipt_qty IS NOT NULL;
