# SQL 脚本索引

零售行业 SQL 脚本统一维护在后端仓库，本目录仅作索引。

## 路径映射

| 类型 | 后端路径 |
|------|----------|
| 数仓初始化 | `../../retail-finance-analysis/sql2/00_init_load_fact_orders.sql` |
| ADS 引导 | `../../retail-finance-analysis/sql2/01_bootstrap_warehouse_dashboard.sql` |
| DDL 补丁 | `../../retail-finance-analysis/ddl/` |
| 高级分析 | `../../retail-finance-analysis/sql3_advanced_analysis/` |
| Tableau SQL | `../../retail-finance-analysis/retail_finance_warehouse/07_tableau_sql/` |

## 一键刷新

```bash
cd ../../retail-finance-analysis
python scripts/refresh_data_to_202606.py
```

## 元数据记录

在 `portfolio_metadata.change_log` 中记录 SQL 变更时，`component_type` 使用 `sql`。
