# 总复习与面试答辩题库（含完整参考答）

## 使用方法

1. 闭卷作答。  
2. 再展开答案。  
3. 弱项回看：分层=01，粒度=02，计算=03，调度=04，口径=05，分析=06（选修），元数据=07，工程=E*，靶场=09。

---

## A. 概念题

1. 用价值链说明数仓存在的理由（≥5 句）。  
2. 默写五层职责，各举一个「不该放的东西」。  
3. 为什么禁止 ADS 读 ODS？举一个反例事故。  
4. Kimball 四步顺序是什么？颠倒会怎样？  
5. OTT `dim_device` 是 SCD2 吗？依据？

:::answer A
1. 隔离分析与交易；统一口径；保留历史；提升查询性能；可审计/协作（展开即可）。  
2. ODS 不放最终 KPI；DWD 不堆全部报表指标；DWS 不存未声明粒度的大宽；ADS 不直连源；DIM 不存事实度量。  
3. 脏数据与源波动直出；无法复用汇总；例如直查 `ods_log_launcher_di` 算 DAU 会把测试/重复日志算进去。  
4. 过程→粒度→维→事实；颠倒导致不可加、不可复现。  
5. 不是。`ott_ddl.sql` 中 `mac` 主键当前态雪花维，无拉链字段（见 E1/SOURCES）。
:::

---

## B. 计算题

1. 写出 ODS→DWD 五步。  
2. `v_dau_overview.total_dau` 的精确定义（含表名）。  
3. 毛利率分子分母如何分层落地？  
4. 指出错误：

```sql
CREATE VIEW v_dau AS
SELECT COUNT(DISTINCT device_id)
FROM ods_log_launcher_di;
```

:::answer B
1. 过滤→标准化→补维→派生→去重写入。  
2. 来自 `04_ott_ads_views.sql`：`COUNT(DISTINCT mac) FROM dws_act_user_active_1d GROUP BY snapshot_date`。  
3. 可加金额进 DWS；率在 ADS 相除。  
4. 三错：ADS 读 ODS；字段应为 `mac` 而非臆造 `device_id`；绕过清洗汇总。
:::

---

## C. 工程题

1. 画出昨日开机活跃 ODS→ADS 依赖链与一个 SLA。  
2. 列出靶场 DWD 的三条 DQ（见 `03_dq_checks.sql`）。  
3. 维表编码变更的影响步骤。  
4. 排障 SOP 七步。  
5. `seed_ott.py` 原始日志覆盖几天？对下钻意味着什么？

:::answer C
1. `ods_log_launcher_di`→`dwd_act_launcher_di`→`dws_act_user_active_1d`→`v_dau_overview`；SLA 例：工作日 09:00 昨日可用。  
2. 空 mac、未来日、TEST 流量（及孤儿 mac、ADS 勾稽等）。  
3. ODS 码→DIM 映射→DWD 是否回刷→DWS/ADS→文档。  
4. 见第 04 章 §6。  
5. 近 3 天（`LOG_DAYS`）；更早明细可能不在 ODS/DWD 日志中。
:::

---

## D. 分析题（选修轨）

业务：「转化差了」。给出假设树三层，并指认会用到的 OTT 表（须真实存在）。

:::answer D
例：哪一步掉（`dws_trade_cashier_funnel_1d`）→哪入口（`src_type`）→是否支付失败（订购 `dws_trade_order_1d` / 明细 `dwd_trade_order_di`）。表名以 DDL 为准。
:::

---

## E. 速查：主线对象

| 用途 | 对象 |
|------|------|
| 开机 ODS/DWD | `ods_log_launcher_di` / `dwd_act_launcher_di` |
| 日活 DWS/ADS | `dws_act_user_active_1d` / `v_dau_overview` |
| 权威 DDL/ADS | `ott_ddl.sql` / `04_ott_ads_views.sql` |
| 靶场 | `learn/lab/run_lab.py` |
