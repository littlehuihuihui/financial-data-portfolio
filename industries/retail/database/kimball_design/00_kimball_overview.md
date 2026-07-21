# 零售电商 · Kimball 业务覆盖与目标模型

> XX行业 = **零售电商**。目标库：`retail_kimball`。现网 `retail_finance`（sql6）迁移完成后废弃宽表与凑数 ODS。

## 1. 核心业务域与过程（覆盖矩阵）

| 业务域 | 核心业务过程 | 是否有对应事实表 | 事实表名 | 状态 |
|--------|------------|----------------|---------|------|
| 交易域 | 下单（订单行） | ✅ 已覆盖 | `fact_order_item` | 保留 |
| 交易域 | 支付收款 | ✅ 已覆盖 | `fact_payment` | 保留 |
| 售后域 | 售后退货 | ✅ 已覆盖 | `fact_return` | 保留（从销售行拆分） |
| 会员域 | 会员注册 | ✅ 已覆盖 | `fact_member_register` | 保留 |
| 库存域 | 出入库事务 | ✅ 已覆盖 | `fact_inventory_txn` | 保留（结存走 DWS） |
| 费用域 | 费用发生（含广告） | ✅ 已覆盖 | `fact_expense` | **本次新增** |
| 预算域 | 预算编制 | ✅ 已覆盖 | `fact_budget` | **本次新增** |
| 营销域 | 促销活动 | ✅ 维度+退化入销售事实 | `dim_promotion` + `promo_sk` | 保留（过程在销售行挂接） |
| 采购域 | 采购入库 | ❌ 无业务看板支撑 | — | **待删除/不建** |
| 门店损益域 | 门店 PnL 贴源 | ❌ 伪过程 | — | **待删除**（由销售+门店维派生） |

## 2. 维度覆盖

| 分析视角 | 维度表 | 状态 |
|----------|--------|------|
| 时间 | `dim_date` | 保留 |
| 地区 | `dim_region` | 保留 |
| 渠道 | `dim_channel` | 保留 |
| 门店/仓 | `dim_store` | 保留 |
| 商品 | `dim_product` | 保留（含品牌/品类属性） |
| 会员 | `dim_member` | 保留 |
| 支付方式 | `dim_payment_method` | 保留 |
| 促销 | `dim_promotion` | 保留 |
| 费用类型 | `dim_expense_type` | **本次新增** |

## 3. 冗余/待删除（现网 sql6）

| 对象 | 原因 |
|------|------|
| `ods_purchase` | 无 DIM/DWD/DWS/ADS 消费，凑数 |
| `ods_ad_cost` | 归并费用过程，独立 ODS 无下游 |
| `ods_store_pnl` | 预聚合伪贴源，非业务事件 |
| `dwd_sales_wide` / `dwd_expense_wide` / `dwd_inventory_wide` | 宽表粒度不清，由 `dwd_fct_*` 替换后删除 |
| ODS→DWS 直跳 ETL | 改为 ODS→DWD→DWS |

## 4. 修改后完整表清单

### ODS（12）
`ods_order_item`, `ods_payment`, `ods_return_item`, `ods_member`, `ods_product`, `ods_store`, `ods_inventory_txn`, `ods_channel`, `ods_payment_method`, `ods_promotion`, `ods_expense`, `ods_budget`

### DIM（9）
`dim_date`, `dim_region`, `dim_channel`, `dim_store`, `dim_product`, `dim_member`, `dim_payment_method`, `dim_promotion`, `dim_expense_type`

### DWD（7）
`fact_order_item`, `fact_payment`, `fact_return`, `fact_member_register`, `fact_inventory_txn`, `fact_expense`, `fact_budget`

### DWS（10）
`dws_sales_d`, `dws_payment_d`, `dws_return_d`, `dws_member_snapshot_d`, `dws_inventory_d`, `dws_channel_acq_d`, `dws_expense_m`, `dws_budget_m`  
（另可保留月销汇总视图/表以兼容看板，从 `dws_sales_d` 汇总）

### ADS（8）
`v_ads_ops_overview`, `v_ads_channel_analysis`, `v_ads_member_portrait`, `v_ads_inventory_monitor`, `v_ads_return_analysis`, `v_ads_payment_structure`, `v_ads_expense_structure`, `v_ads_budget_achievement`
