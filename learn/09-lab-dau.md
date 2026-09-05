# 第 09 章 · 靶场实操：弄坏日活链路再修好

> **证据**：脚本与期望值见 `portfolio/learn/lab/`；列对齐 `ott_ddl.sql` / 视图对齐 `04_ott_ads_views.sql`。  
> 独立库 `learn_lab_dau`，**不修改** `internet_analytics`。

## 1. 目标

1. 亲眼看到脏数据如何污染 DWD/DWS。  
2. 用 DQ 门禁「失败 → 修复 → 通过」。  
3. 验收 `v_dau_overview.total_dau = 3`。

## 2. 前置

- 本机 MySQL；账号默认与 `seed_ott.py` 相同（`root` / `123456`）。  
- 已读第 03 章（真字段）与第 04 章（门禁思想）。  
- 工作目录：`portfolio/`。

```bash
.\venv\Scripts\python.exe learn\lab\run_lab.py
```

## 3. 脏数据清单（来自 `01_seed_dirty.sql`）

| 问题 | 设计意图 |
|------|----------|
| `mac` NULL | DQ1 |
| `event_date=2099-01-01` | DQ2 |
| `userid=TEST` | DQ3 |
| `TESTMAC0001` 不在维表 | DQ4 |
| 重复 boot 行 | 去重练习 |

## 4. 操作节奏

1. 跑全流程，确认 `GATE(broken)=FAIL`、`GATE(fixed)=PASS`。  
2. 打开 `02_etl_broken.sql` / `04_etl_fixed.sql`，对比过滤与窗口去重。  
3. 打开 `03_dq_checks.sql`，解释每条 SQL 在防什么事故。  
4. （可选）手工改坏 `04` 再跑，观察哪条 DQ 亮红。

## 5. 仓库对照（跑完后）

1. 实验台打开互联网 ETL，搜索 `v_dau_overview`，核对 `code_path` 是否为 `04_ott_ads_views.sql`。  
2. 在 `ott_ddl.sql` 确认 `dws_act_user_active_1d` 主键为 `(snapshot_date, mac)`。  
3. 阅读 `seed_ott.py` 文件头：DWS 造 3 个月、原始日志近 3 天——与靶场「单日」范围不同，**勿混为一谈**。

## 5. 小测与 TOKEN

跑通后复制控制台 `LAB_TOKEN=dnexus-lab-dau-v1-PASS`，粘贴到本章页面验证，再完成小测，方可「已学」。

看板数字不必等于 3——见 [`P2e-dashboard-bridge.md`](P2e-dashboard-bridge.md)。
