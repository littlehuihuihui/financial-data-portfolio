# 跃动体育 · 数据血缘关系表

> ODS → DWD → DWS → ADS → Tableau / 明细导出 全链路血缘说明  
> 对应 SQL：`sql/04_dw_dwd_dws.sql`、`sql/05_ods_to_dwd_etl.sql`、`sql/06_dws_refresh.sql`、`sql/02_summary_views.sql`、`sql/08_v_order_detail_export.sql`

## 血缘关系总表

| 表名 | 所属层级 | 上游依赖 | 下游依赖 | 说明 |
|------|----------|----------|----------|------|
| `orders_raw` | ODS | `orders`（CSV 导入） | `fact_orders`（ETL 清洗） | 订单原始视图，字段与 CSV 对齐 |
| `expenses_raw` | ODS | `expenses`（CSV 导入） | `dws_expense_monthly` | 费用原始视图 |
| `inventory_raw` | ODS | `inventory`（CSV 导入） | `dws_inventory_daily` | 库存快照原始视图 |
| `store_pnl_raw` | ODS | `store_pnl`（CSV 导入） | `v_store_monthly_rank` | 门店损益原始视图（月） |
| `ods_store_daily_sales` | ODS | `store_pnl`（月度拆解，Python 生成） | `fact_store_daily` | 门店日销售原始表 |
| `budget_raw` | ODS | `budget`（CSV 导入） | `v_budget_vs_actual` | 年度预算原始视图 |
| `dim_brand` | DWD | 字典配置（ETL 脚本） | `fact_orders`、`dws_*`、`v_order_detail_export`、ADS 维度解码 | 品牌维度（跃动Pro / Life / Go） |
| `dim_channel` | DWD | 字典配置（ETL 脚本） | `fact_orders`、`dws_*`、`v_order_detail_export`、ADS 维度解码 | 渠道维度（抖音 / 天猫 / 线下直营 / 其他） |
| `dim_category` | DWD | 字典配置（ETL 脚本） | `fact_orders`、`dws_*`、`v_order_detail_export`、ADS 维度解码 | 品类维度（鞋类 / 服装 / 配件） |
| `dim_date` | DWD | `sp_fill_dim_date`（2019–2026） | `fact_orders`、`dws_sales_daily`、`dws_inventory_daily`、ADS 时间下钻 | 日期维度，含周末 / 节假日标记 |
| `fact_orders` | DWD | `orders_raw` + `dim_brand` + `dim_channel` + `dim_category` + `dim_date` | `dws_sales_daily`、`v_order_detail_export` | 订单事实表，星型模型核心 |
| `fact_store_daily` | DWD | `ods_store_daily_sales` + `dim_date` | `dws_store_daily` | 门店日销售事实表 |
| `dws_sales_daily` | DWS | `fact_orders` | `v_monthly_summary`、`v_brand_channel_monthly`、`v_budget_vs_actual`、Tableau 日/周/月趋势 | 销售日汇总（GMV / 净收入 / 毛利） |
| `dws_store_daily` | DWS | `fact_store_daily` | `v_store_daily_rank`、Tableau 门店 Top5 | 门店日汇总（含近7/30日均） |
| `dws_inventory_daily` | DWS | `inventory_raw` + `dim_brand` + `dim_category` + `dim_date` + `fact_orders`（周转测算） | `v_inventory_monitor` | 库存日汇总与周转天数 |
| `dws_expense_monthly` | DWS | `expenses_raw` + `dim_brand` + `dim_channel` | `v_expense_monthly` | 费用月汇总 |
| `v_monthly_summary` | ADS | `dws_sales_daily` + `dim_date`（按月聚合） | `v_expense_monthly`、`v_budget_vs_actual`、Tableau 月度趋势图 / KPI 卡 | 月度经营核心指标 |
| `v_brand_channel_monthly` | ADS | `dws_sales_daily` + `dim_brand` + `dim_channel` + `dim_date` | Tableau 品牌渠道矩阵 / 毛利热力图 | 品牌 × 渠道月度分析 |
| `v_expense_monthly` | ADS | `dws_expense_monthly` + `v_monthly_summary`（费用率分母） | Tableau 费用预警看板 | 费用执行与费用率监控 |
| `v_inventory_monitor` | ADS | `dws_inventory_daily` + `dim_brand` + `dim_category` | Tableau 库存周转监控 | 库存积压与周转预警 |
| `v_store_monthly_rank` | ADS | `store_pnl_raw` | Tableau 门店月排名 / 坪效对比 | 门店经营排名与环比（月） |
| `v_store_daily_rank` | ADS | `dws_store_daily` + `dim_date` | Tableau 门店日/周/月排名 | 日粒度排名，支持上卷到周/月 |
| `v_budget_vs_actual` | ADS | `v_monthly_summary` + `budget_raw` | Tableau 预算执行进度条 | 全年目标达成与偏差 |
| `v_order_detail_export` | Export | `fact_orders` + `dim_date` + `dim_brand` + `dim_channel` + `dim_category` | P1 明细 CSV 导出、业务复盘下钻 | 订单级宽表，支持日期区间筛选 |

## 典型链路示例

```
orders (CSV)
  → orders_raw (ODS)
  → fact_orders (DWD)  ← dim_brand / dim_channel / dim_category / dim_date
  → dws_sales_daily (DWS)
  → Tableau 收入趋势（日/周/月粒度切换，默认日）

store_pnl (CSV，月)
  → generate_store_daily_data.py
  → ods_store_daily_sales (ODS)
  → fact_store_daily (DWD)
  → dws_store_daily (DWS)
  → v_store_daily_rank (ADS)
  → Tableau 门店 Top5（随粒度切换）

fact_orders (DWD)
  → v_order_detail_export (Export)
  → WHERE order_date BETWEEN 'start' AND 'end' → 导出 CSV
```

---

## 如何用血缘做「问题溯源」与「变更影响分析」

### 问题溯源（自下而上）

当 Tableau 看板或业务报表出现异常（如「6 月毛利率骤降」），沿血缘**从下往上**逐层排查：

1. **ADS 层**：确认 `v_monthly_summary` / `v_brand_channel_monthly` 中哪个月份、哪个品牌/渠道指标异常。
2. **DWS 层**：下钻 `dws_sales_daily`，判断是 GMV 下滑、退货上升还是成本结构变化。
3. **DWD 层**：回到 `fact_orders` 抽样订单，核对 `return_flag`、`payment_amount`、`cost` 是否清洗正确；检查维度映射（渠道归并、品类合并）是否误分类。
4. **ODS 层**：对比 `orders_raw` 与原始 CSV，确认是否为源数据问题或 ETL 规则变更导致。

血缘表相当于「数据地图」：每一层都标明**从哪来**，避免在错误的层级反复改口径。

### 变更影响分析（自上而下）

当需要修改表结构、ETL 规则或指标口径时，沿血缘**从上往下**评估影响面：

| 变更场景 | 起点 | 可能影响 |
|----------|------|----------|
| 修改渠道映射规则 | `05_ods_to_dwd_etl.sql` | `fact_orders` → `dws_sales_daily` → 全部销售类 ADS → Tableau 渠道图 |
| 调整毛利计算公式 | `dws_sales_daily` | `v_monthly_summary`、`v_brand_channel_monthly`、`v_budget_vs_actual` |
| 新增节假日标记 | `dim_date` / `sp_fill_dim_date` | 仅影响按日关联的分析，不改动 ODS 原始数据 |
| 扩展导出字段 | `v_order_detail_export` | 仅影响 CSV 导出与 P1 预览，不影响汇总看板 |

**实践建议**：变更前先查血缘表中的「下游依赖」列，列出需回归验证的 ADS 视图与 Tableau 工作表；变更后按 ODS → DWD → DWS → ADS 顺序重跑 ETL，并对比各层校验 SQL（`06_dws_refresh.sql` 末尾对账查询）。
