# 第 03 章 · 层间怎么算：ODS→DWD→DWS→ADS（对齐 OTT 实档）

> **证据总表**：见 [`SOURCES.md`](SOURCES.md)。  
> 本章表名/字段均来自 `portfolio/industries/internet/database/ott_ddl.sql` 与 `04_ott_ads_views.sql`。  
> SQL 方言：**MySQL 8 可跑骨架**（不用 `QUALIFY`）。

## 1. 本章目标

1. 按真实列写出四跳变换骨架。  
2. 分清「作品集灌数实现」与「规范层间 ETL」。  
3. 完成仓库对照题 + 靶场预习。

---

## 2. 必须先读的诚实说明

> **证据**：`seed_ott.py` · `seed_raw_logs`；`etl-lineage-data.js` · `inet_syn_dwd_act`  
> 演示环境里，开机明细常与 ODS **并行生成**（`INSERT INTO ods_log_launcher_di` 与 `INSERT INTO dwd_act_launcher_di` 同函数），面板标注 `synthetic` / `generate-into-DWD`。  
> 下列 SQL 教的是**规范生产链路**；动手验证请用 `learn/lab/`（独立库 `learn_lab_dau`）。

---

## 3. 总览：每一跳在算什么（绑定真表）

| 跳跃 | 真表（OTT） | 本质 | 输出粒度（来自 DDL COMMENT） |
|------|-------------|------|------------------------------|
| 源→ODS | `ods_log_launcher_di` | 贴源落地 | 增量日志行（近 3 天，见 COMMENT） |
| ODS→DWD | `dwd_act_launcher_di` | 清洗对齐模型 | **一次开机行为**（mac 为主） |
| DWD→DWS | `dws_act_user_active_1d` | 按 mac×日聚合 | **用户日活跃·mac 粒度** |
| DWS→ADS | `v_dau_overview` | 指标封装 | 日切片 `COUNT(DISTINCT mac)` |

口诀仍适用：**ODS 保真，DWD 保语义，DWS 保复用，ADS 保好用。**

权威分层纪律：

> **证据**：`04_ott_ads_views.sql` 文件头：「仅读 DWS/DIM/DWD，禁止直读 ODS」；`00_kimball_design.md`「分层流向」。

---

## 4. ODS 真字段（开机）

> **证据**：`ott_ddl.sql` · `CREATE TABLE ods_log_launcher_di`

关键列：`log_id`, `mac`, `userid`, `device_type`, `region_id`, `fw_version`, `action`（boot/home/click/search）, `event_time`, `event_date`。

注意：本仓库 ODS **没有**名为 `dt` 的分区列；日期列是 `event_date`。

### 4.1 入仓质量（理论 + 靶场会练）

- `mac` 空值率  
- `event_time` 落在未来  
- 测试流量（靶场约定 `userid='TEST'`）  
- 行数相对昨日波动（生产常见；靶场用静态样本）

---

## 5. ODS → DWD（MySQL 骨架）

> **证据**：`ott_ddl.sql` · `dwd_act_launcher_di` COMMENT：「粒度=一次开机行为（mac为主，userid变则记录变）」  
> `dim_device` 主键是 **`mac`**，**没有** `device_sk` / `is_current`。

```sql
-- 规范形态（教材骨架；列名对齐 ott_ddl）
INSERT INTO dwd_act_launcher_di
(log_id, mac, userid, device_type, region_id, action, event_time, event_date)
SELECT
    t.log_id,
    t.mac,
    t.userid,
    t.device_type,
    t.region_id,
    t.action,
    t.event_time,
    t.event_date
FROM (
    SELECT
        o.*,
        ROW_NUMBER() OVER (
            PARTITION BY o.mac, o.event_time, o.action
            ORDER BY o.log_id
        ) AS rn
    FROM ods_log_launcher_di o
    INNER JOIN dim_device d ON o.mac = d.mac
    WHERE o.mac IS NOT NULL
      AND o.event_date = @bizdate   -- 业务日变量，勿臆造 dt 列
) t
WHERE t.rn = 1;
```

处理顺序（可默写）：过滤 → 关联维（按 `mac`）→ 去重 → 写入。

---

## 6. DWD → DWS（日活汇总）

> **证据**：`ott_ddl.sql` · `dws_act_user_active_1d`：`PRIMARY KEY (snapshot_date, mac)`，含 `launcher_cnt`, `is_vod_active` 等。

```sql
INSERT INTO dws_act_user_active_1d
(snapshot_date, mac, userid, device_type, region_id,
 is_only_launcher, is_vod_active, is_live_active,
 launcher_cnt, vod_play_cnt, vod_play_dur, live_play_dur, etl_batch_id)
SELECT
    l.event_date,
    l.mac,
    MAX(l.userid),
    MAX(l.device_type),
    MAX(l.region_id),
    1,              -- 靶场仅开机链路时可先置 1；完整生产需结合点播/直播
    0,
    0,
    COUNT(*) AS launcher_cnt,
    0, 0, 0,
    @batch_id
FROM dwd_act_launcher_di l
WHERE l.event_date = @bizdate
GROUP BY l.event_date, l.mac;
```

完整 OTT 灌数里，`is_vod_active` / 播放时长等由 `seed_ott.py` 的活跃与内容逻辑写入（见 `seed_activity` / `seed_content`），**不是**仅靠开机表能算全。

---

## 7. DWS → ADS（真视图）

> **证据**：`04_ott_ads_views.sql` · `v_dau_overview`（下列为原文结构摘录）

```sql
CREATE OR REPLACE VIEW v_dau_overview AS
SELECT
    snapshot_date,
    COUNT(DISTINCT mac) AS total_dau,
    COUNT(DISTINCT CASE WHEN device_type = 'STB' THEN mac END) AS dau_stb,
    COUNT(DISTINCT CASE WHEN device_type = 'Speaker' THEN mac END) AS dau_speaker,
    SUM(is_vod_active) AS vod_active,
    SUM(is_live_active) AS live_active,
    SUM(is_only_launcher) AS only_launcher
FROM dws_act_user_active_1d
GROUP BY snapshot_date;
```

> **证据**：`monitoring_framework_internet.md`：DAU = 日去重活跃设备，落点 `dws_act_user_active_1d`。

---

## 8. 主链路（可背）

```
ods_log_launcher_di
  → dwd_act_launcher_di
  → dws_act_user_active_1d
  → v_dau_overview
  → 互联网看板活跃类卡片（API/前端消费 ADS）
```

ER 面板同名边见 `er-diagram-data.js`（`ods_log_launcher_di -->|ETL| dwd_act_launcher_di` 等）。

---

## 9. 仓库对照题（强制，禁止只空想）

打开文件并填写：

1. `ott_ddl.sql`：抄下 `ods_log_launcher_di` 与 `dwd_act_launcher_di` 的 COMMENT。  
2. `04_ott_ads_views.sql`：`total_dau` 的精确表达式。  
3. `etl-lineage-data.js`：找到 `to_table = "v_dau_overview"` 的 `code_path` 与 `schedule`。  
4. `seed_ott.py`：`LOG_DAYS` 是哪三天？原始日志是否「仅近 3 天」？（见文件头 docstring）

:::answer 对照要点
1. ODS COMMENT 含「开机日志·增量（近3天）」；DWD COMMENT 含「一次开机行为」。  
2. `COUNT(DISTINCT mac)`。  
3. `code_path` 指向 `04_ott_ads_views.sql`，`schedule` 为实时（视图）。  
4. docstring：`2026-07-13~07-15`；是，仅近 3 天。
:::

---

## 10. 反模式（用真对象表述）

```sql
-- 错误：ADS 直读 ODS（违反 04 文件头与 Kimball 文档）
CREATE VIEW v_dau_overview AS
SELECT COUNT(DISTINCT mac) FROM ods_log_launcher_di;
```

---

## 11. 对照行业（迁移题，表名须可 grep）

| 跳跃 | 零售（`retail/.../kimball_design`） | 制造（`manufacturing/database`） |
|------|-------------------------------------|----------------------------------|
| ODS | `ods_order_item` | `ods_production_order` |
| DWD | `fact_order_item` | `dwd_production_wide` |
| DWS | `dws_sales_d` | `dws_production_daily` |

请到对应 SQL 文件确认列后再谈聚合，禁止默写「想象中的表」。

---

## 12. 练习

**A**：按本章骨架手写「点播」四跳标题（真表：`ods_log_vod_di` → `dwd_vod_play_di` → `dws_content_episode_play_1d` / series → ADS 视图名到 `04_ott_ads_views.sql` 自行检索）。  

**B**：指出 §10 错在哪条纪律。  

**C**：完成第 09 章靶场（`learn/lab/run_lab.py`）。
