# 资深业务分析师 · 零售电商数仓覆盖度审查报告

**行业**：零售电商（XX行业定稿）  
**审查基准**：Kimball 四步 + 业务过程一表一事实 + 禁止凑数表  
**目标权威 DDL**：`portfolio/industries/retail/database/kimball_design/`  
**现网对照**：`retail-finance-analysis/sql6_portfolio_model/`

---

## 一、审查报告

### 1.1 核心业务域
交易域、售后域、会员域、库存域、费用域、预算域、营销域（属性挂接）。  
**明确排除**：独立采购域、门店损益伪贴源域（无事件粒度、无看板主路径）。

### 1.2 覆盖矩阵

| 业务域 | 核心业务过程 | 是否有对应事实表 | 事实表名 | 状态 |
|--------|------------|----------------|---------|------|
| 交易域 | 下单 | ✅ 已覆盖 | `fact_order_item` | 保留 |
| 交易域 | 支付 | ✅ 已覆盖 | `fact_payment` | 保留 |
| 售后域 | 退货退款 | ✅ 已覆盖 | `fact_return` | 保留（从销售宽表拆分） |
| 会员域 | 注册 | ✅ 已覆盖 | `fact_member_register` | 保留 |
| 库存域 | 出入库/调整 | ✅ 已覆盖 | `fact_inventory_txn` | 保留 |
| 费用域 | 费用发生 | ✅ 已覆盖 | `fact_expense` | 本次新增 |
| 预算域 | 预算编制 | ✅ 已覆盖 | `fact_budget` | 本次新增 |
| 营销域 | 促销执行 | ⚠️ 部分覆盖 | 销售事实 `promo_sk` + `dim_promotion` | 保留（不单建促销事实，避免与订单行双计） |
| 采购域 | 采购入库 | ❌ 无对应业务过程表 | — | 待删除（现网 `ods_purchase`） |
| — | 广告独立贴源 | ❌ 凑数 | — | 待删除（现网 `ods_ad_cost`→归并费用） |
| — | 门店 PnL 贴源 | ❌ 伪过程 | — | 待删除（现网 `ods_store_pnl`） |

### 1.3 维度缺口（已补）
地区 / 商品 / 会员 / 支付方式 / 促销 / **费用类型**（本次）

### 1.4 缺失清单（审查时）→ 处理结果
| 缺口 | 处理 |
|------|------|
| 费用 DWD | 已加 `ods_expense` + `fact_expense` + `dws_expense_m` |
| 预算 DWD | 已加 `ods_budget` + `fact_budget` + `dws_budget_m` |
| 费用类型维 | 已加 `dim_expense_type` |
| 现网支付跨层 | sql6 侧见 `08_dwd_bridge_finance.sql`，要求经 DWD 再入月汇总 |

### 1.5 冗余清单（待删除）
`ods_purchase`、`ods_ad_cost`、`ods_store_pnl`、三代 `dwd_*_wide`（迁移完成后）

---

## 二、修改方案摘要

| 动作 | 对象 |
|------|------|
| 新增 ODS | `ods_expense`, `ods_budget` |
| 新增 DIM | `dim_expense_type` |
| 新增 DWD | `fact_expense`, `fact_budget` |
| 新增 DWS | `dws_expense_m`, `dws_budget_m` |
| 新增 ADS | `v_ads_expense_structure`, `v_ads_budget_achievement` |
| 拆分 | 销售宽表退货字段 → 独立 `fact_return`；库存结存留 DWS |
| 待删除 | 见 1.5 |

---

## 三、修改后完整表清单

见 `00_kimball_overview.md` 第四节（ODS12 / DIM9 / DWD7 / DWS8+ / ADS8）。
