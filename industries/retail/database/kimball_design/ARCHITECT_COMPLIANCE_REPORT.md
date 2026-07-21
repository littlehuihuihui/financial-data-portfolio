# 数据架构师 · 零售电商数仓规范性审查报告

**行业**：零售电商（XX）  
**审查对象**：`kimball_design/`（目标权威模型）  
**审查日期**：2026-07-14

---

## 一、字段数达标矩阵（修改前 → 修改后）

| 表名 | 层级 | 修改前字段数 | 标准要求 | 是否达标 | 问题说明 |
|------|------|-------------|---------|---------|---------|
| ods_order_item | ODS | 18 | ≥10 | ✅ | — |
| ods_payment | ODS | 12 | ≥10 | ✅ | 业务日期原 VARCHAR→改 DATE |
| ods_return_item | ODS | 14 | ≥10 | ✅ | 同上 |
| ods_member | ODS | 12 | ≥10 | ✅ | 同上 |
| ods_product | ODS | 12 | ≥10 | ✅ | — |
| ods_store | ODS | 12 | ≥10 | ✅ | — |
| ods_inventory_txn | ODS | 12 | ≥10 | ✅ | — |
| ods_channel | ODS | 11 | ≥10 | ✅ | — |
| ods_payment_method | ODS | 11 | ≥10 | ✅ | — |
| ods_promotion | ODS | 11 | ≥10 | ✅ | — |
| ods_expense | ODS | 14 | ≥10 | ✅ | — |
| ods_budget | ODS | 14 | ≥10 | ✅ | — |
| dim_date | DIM | 12 | ≥10 | ✅ | — |
| dim_region | DIM | 12 | ≥10 | ✅ | — |
| dim_channel | DIM | 11 | ≥10 | ✅ | — |
| dim_payment_method | DIM | 11 | ≥10 | ✅ | — |
| dim_member | DIM | 13 | ≥10 | ✅ | — |
| dim_product | DIM | 13 | ≥10 | ✅ | — |
| dim_store | DIM | 11 | ≥10 | ✅ | — |
| dim_promotion | DIM | 11 | ≥10 | ✅ | — |
| dim_expense_type | DIM | 11 | ≥10 | ✅ | — |
| ~~fact_order_item~~ → **fact_order_item** | DWD | 18 | ≥15 | ✅ | 命名：`dwd_fct_`→`fact_` |
| ~~fact_payment~~ → **fact_payment** | DWD | 16 | ≥15 | ✅ | 同上 |
| ~~fact_return~~ → **fact_return** | DWD | 17 | ≥15 | ✅ | 同上 |
| ~~fact_member_register~~ → **fact_member_register** | DWD | 16 | ≥15 | ✅ | 同上 |
| ~~fact_inventory_txn~~ → **fact_inventory_txn** | DWD | 16 | ≥15 | ✅ | 同上 |
| ~~fact_expense~~ → **fact_expense** | DWD | 16 | ≥15 | ✅ | 同上 |
| ~~fact_budget~~ → **fact_budget** | DWD | **14** | ≥15 | ❌→✅ | **缺1字段；已补 owner_dept** |
| dws_*（8张） | DWS | 8–10 | ≥8 | ✅ | snapshot_date→DATE |
| v_ads_*（8个） | ADS | 6–9 | ≥5 | ✅ | 均读 DWS+DIM |

## 二、其他问题清单

| 问题类型 | 说明 | 处理 |
|----------|------|------|
| 命名 | 事实表用 `dwd_fct_*` 非 `fact_*` | 统一改为 `fact_*` |
| 类型 | 业务日期字段多为 `VARCHAR(10)` | 改为 `DATE`（`snapshot_month`/`month_label` 仍用 `VARCHAR(7)`） |
| 类型 | 金额已 `DECIMAL(15,2)`；代理键已 `BIGINT` | 保持 |
| 层次 | ADS 均读 DWS/DIM | ✅ 合规 |
| 注释 | 抽检无裸字段 | ✅ 保持全量 COMMENT |

## 三、修改方案摘要

1. `fact_budget` 增加 `owner_dept`（及命名切换）→ ≥15  
2. 全部 `dwd_fct_*` 重命名为 `fact_*`  
3. ODS/DIM/DWD/DWS 业务日期 → `DATE`  
4. 更新 overview / BA 文档表名  
5. 未知维种子日期字面量兼容 DATE

## 四、完整 DDL

以本目录 `01_ods.sql`～`05_ads.sql` 为准（修改后全量即交付 DDL）。
