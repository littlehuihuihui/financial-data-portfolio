# 工程专题 E3 · 幂等、重跑与主键设计

## 1. 幂等定义

同一业务日、同一作业**跑 1 次与跑 100 次**，目标表该日结果集一致（行集合与度量一致）。

## 2. 本仓库主键给我们的启示

> **证据**：`ott_ddl.sql`  

| 表 | 主键 | 对重跑的含义 |
|----|------|----------------|
| `dwd_act_launcher_di` | `log_id` | 同 `log_id` 再插入会撞键；应先删日分区或 upsert |
| `dws_act_user_active_1d` | `(snapshot_date, mac)` | 适合「按日覆盖」 |
| `dwd_user_status_di` | `(snapshot_date, userid)` | 快照日覆盖 |
| `ods_log_launcher_di` | `log_id` AUTO_INCREMENT | 盲目重灌易**翻倍**（除非先清日数据） |

靶场修复脚本使用 `TRUNCATE` 再 `INSERT`，是教学用的强幂等；生产常用：

```sql
DELETE FROM dws_act_user_active_1d WHERE snapshot_date = @bizdate;
INSERT INTO dws_act_user_active_1d ...;
```

## 3. 作品集灌数行为

> **证据**：`seed_ott.py` · `main()`：先 `run_sql_file(ott_ddl.sql)`（含 DROP/CREATE），再全量种子。  

这是**演示重建**，不是线上增量调度。线上应假设表已存在，只做分区级重跑。

## 4. 练习

1. 解释：为何坏 ETL 对 ODS 不去重会导致 `launcher_cnt` 偏大。  
2. 设计：对 `dws_act_user_active_1d` 写「按日幂等」两行伪代码（DELETE+INSERT）。  
3. 对照：`etl-lineage-data.js` 中 engine=`python` 的边，`code_path` 是否指向 `seed_ott.py`？

:::answer 要点
1. 重复 boot 进入 DWD 后 COUNT(*) 放大。  
2. 删 `@bizdate` 再按 mac 聚合插入。  
3. 是，多条 synthetic 边指向该文件。
:::
