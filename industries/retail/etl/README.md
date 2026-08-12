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
| **日批调度契约（甘特/SLA/延迟）** | `../../retail-finance-analysis/retail_finance_warehouse/02_etl_python/etl_daily_schedule.py`（本目录有副本） |

## 调度与 DQC（面试要点）

- 计划窗口见 `etl_daily_schedule.py`：`planned_start` / `duration_min` / `sla_end` / `depends_on`
- 上游 ODS 延迟：传感器等待 → 过 SLA HOLD 下游 → 过对外基线 P1 + 看板未就绪
- 架构页「ETL调度与血缘」：甘特图 + 质量门禁表；看板「数据质量」为大盘（阻断量 / 脏数据分布）

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
