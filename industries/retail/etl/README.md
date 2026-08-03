# ETL 脚本索引

零售行业 ETL 脚本统一维护在后端仓库，本目录仅作索引。

## 路径映射

| 脚本 | 后端路径 |
|------|----------|
| CSV 生成 | `../../retail-finance-analysis/data/data_generator.py` |
| 装载 MySQL | `../../retail-finance-analysis/data/load_to_mysql.py` |
| 门店日数据 | `../../retail-finance-analysis/scripts/generate_store_daily_data.py` |
| 数仓刷新 | `../../retail-finance-analysis/scripts/refresh_data_to_202606.py` |
| Python ETL | `../../retail-finance-analysis/retail_finance_warehouse/02_etl_python/` |

## 元数据记录

跨行业同步 ETL 逻辑时，使用：

```sql
CALL sp_sync_change(
    'retail',
    JSON_ARRAY(2, 3),          -- 目标行业 industry_id
    'etl',
    '统一退货率清洗规则'
);
```
