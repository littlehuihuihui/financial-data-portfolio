# 工程专题 E1 · 缓慢变化维（SCD）与本仓库现实

> **反幻觉声明**：OTT 生产 DDL **没有** SCD2 拉链字段。  
> **证据**：`ott_ddl.sql` · `dim_device`：`mac` PRIMARY KEY，注释「DIM·设备（雪花，挂 model/firmware/region）」，无 `valid_from`/`valid_to`/`is_current`。

## 1. 为什么还要学 SCD2

维属性会变（套餐、地市、机型归属）。若不管理历史：

- 用「今天的维」解释「昨天的事实」→ 历史报表被改写；  
- 或永远不更新维 → 新属性进不来。

## 2. 常见类型（通用理论）

| 类型 | 行为 | 适用 |
|------|------|------|
| SCD1 | 原地覆盖 | 错别字修正、不需历史 |
| SCD2 | 新开一行，旧行闭链 | 需要「当时长什么样」 |
| SCD3 | 保留有限旧列 | 只要「前值」 |

## 3. 本仓库采用什么

> **证据**：`dim_device` / `dim_user` 均为业务键主键的**当前态雪花维**（近似 SCD1 维护方式）。  
> 历史可追溯主要靠：**事实表上的退化/冗余属性**（如 DWD 上的 `device_type`、`region_id`）与快照类表（如 `dwd_user_status_di` 按 `snapshot_date`）。

这是作品集为演示复杂度做的取舍，**不是**说生产永远不该上 SCD2。

## 4. 教学示意（仅 lab，非 OTT DDL）

若要练习 SCD2，可在 `learn_lab_dau` 自建（勿写进 `ott_ddl.sql` 除非正式改造）：

```sql
-- 示意 ONLY
CREATE TABLE lab_dim_device_scd2 (
  device_sk BIGINT PRIMARY KEY AUTO_INCREMENT,
  mac VARCHAR(32) NOT NULL,
  region_id VARCHAR(10) NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NULL,
  is_current TINYINT(1) NOT NULL DEFAULT 1,
  KEY (mac, is_current)
);
```

关联事实时用：

`fact.event_date BETWEEN dim.valid_from AND IFNULL(dim.valid_to,'9999-12-31')`。

## 5. 仓库对照题

1. 在 `ott_ddl.sql` 中确认 `dim_device` 有哪些列。  
2. 找出一张「自带日期键」的快照表（提示：`dwd_user_status_di`）。  
3. 说明：若 `region_id` 变更且只用 SCD1，上周按地市汇总的 DAU 会怎样？

:::answer 要点
1. mac, model_id, fw_id, region_id, device_type_id, first_active_date, device_status。  
2. `dwd_user_status_di` PK `(snapshot_date, userid)`。  
3. 历史分区用新 region 重算会被「改写」，失去当时归属。
:::
