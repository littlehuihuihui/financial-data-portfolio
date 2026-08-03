-- 字段数统计（架构师审查后 · 2026-07-14）
-- USE retail_kimball;
-- SELECT TABLE_NAME, COUNT(*) AS col_cnt
-- FROM information_schema.COLUMNS
-- WHERE TABLE_SCHEMA='retail_kimball' AND TABLE_NAME NOT LIKE 'v_%'
-- GROUP BY TABLE_NAME ORDER BY TABLE_NAME;

/*
层/表                        字段数  标准    结果
---------------------------  -----  ------  ----
ODS ods_order_item              18  ≥10     OK
ODS ods_payment                 12  ≥10     OK
ODS ods_return_item             14  ≥10     OK
ODS ods_member                  12  ≥10     OK
ODS ods_product                 12  ≥10     OK
ODS ods_store                   12  ≥10     OK
ODS ods_inventory_txn           12  ≥10     OK
ODS ods_channel                 11  ≥10     OK
ODS ods_payment_method          11  ≥10     OK
ODS ods_promotion               11  ≥10     OK
ODS ods_expense                 14  ≥10     OK
ODS ods_budget                  14  ≥10     OK

DIM dim_date                    12  ≥10     OK
DIM dim_region                  12  ≥10     OK
DIM dim_channel                 11  ≥10     OK
DIM dim_payment_method          11  ≥10     OK
DIM dim_member                  13  ≥10     OK
DIM dim_product                 13  ≥10     OK
DIM dim_store                   11  ≥10     OK
DIM dim_promotion               11  ≥10     OK
DIM dim_expense_type            11  ≥10     OK

DWD fact_order_item             18  ≥15     OK
DWD fact_payment                16  ≥15     OK
DWD fact_return                 17  ≥15     OK
DWD fact_member_register        16  ≥15     OK
DWD fact_inventory_txn          16  ≥15     OK
DWD fact_expense                16  ≥15     OK
DWD fact_budget                 15  ≥15     OK（补 owner_dept）

DWS dws_sales_d                 10  ≥8      OK
DWS dws_payment_d                9  ≥8      OK
DWS dws_return_d                 9  ≥8      OK
DWS dws_member_snapshot_d       10  ≥8      OK
DWS dws_inventory_d              9  ≥8      OK
DWS dws_channel_acq_d            8  ≥8      OK
DWS dws_expense_m               10  ≥8      OK
DWS dws_budget_m                10  ≥8      OK

ADS v_ads_*（8视图）          6~9  ≥5      OK

规范：金额 DECIMAL(15,2)；代理键 BIGINT；业务日期 DATE；
命名 ods_/dim_/fact_/dws_/v_；ADS 仅读 DWS+DIM。
*/
