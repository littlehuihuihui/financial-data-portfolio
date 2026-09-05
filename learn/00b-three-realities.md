# 三层现实（置顶必读）

学习本教材时，脑子里要同时区分 **三套「现实」**，不要混成一件事。

| 层 | 是什么 | 权威落点 | 你用它做什么 |
|----|--------|----------|--------------|
| **A. 演示灌数** | 为作品集快速出数 | `seed_ott.py`；ETL 面板部分边为 `synthetic` | 理解「库里为什么有数」、日期范围限制（日志近 3 天等） |
| **B. 规范层间 ETL** | 生产应遵守的加工形态 | 教材第 03/04 章范式；分层纪律见 `04_ott_ads_views.sql` 头注释、`00_kimball_design.md` | 学会设计与默写骨架、答辩 |
| **C. 教材靶场** | 独立库可弄坏可修好 | `learn/lab/` → `learn_lab_dau` / `learn_lab_vod` | 练过滤、去重、DQ、幂等；**不改** `internet_analytics` |

## 一句话

> 看板里的数，很多来自 **A**；你面试要讲的，是 **B**；你动手修事故，用 **C**。

## 常见混淆（错答）

| 错觉 | 纠正 |
|------|------|
| 「面板有边 = 已有独立 SQL 调度作业」 | 查看 `code_path`：可能是 `seed_ott.py` |
| 「靶场 DAU=3 应对齐看板数字」 | 靶场库与演示库分离；看板读 `internet_analytics` |
| 「dim_device 有 is_current」 | OTT DDL 无此列（见 E1） |
| 「ADS 已有 v_vod_finish_rate」 | 现网 `04_ott_ads_views.sql` **无**该视图；靶场为**拟新增**练习 |

## 下一步

1. 打开 [`SOURCES.md`](SOURCES.md)  
2. 按 [`CALENDAR-7D.md`](CALENDAR-7D.md) 安排七天  
3. DE 主线从第 00 章开始
