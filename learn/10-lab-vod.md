# 第 10 章 · 靶场：点播完播率（弄坏再修好）

> **证据**：`learn/lab/vod/` 列对齐 `ott_ddl.sql`；ADS `v_vod_finish_rate` 为**教材拟新增**（`04_ott_ads_views.sql` 现网无此视图，见 P2e）。

## 1. 目标

1. 练习 `is_finish` / `finish_cnt` / 完播率。  
2. DQ：非法完播标志、未知剧集、测试流量。  
3. 取得 `LAB_TOKEN=dnexus-lab-vod-v1-PASS`。

## 2. 命令

```bash
cd portfolio
.\venv\Scripts\python.exe learn\lab\run_lab.py --suite vod
```

期望：broken FAIL → fixed PASS；S001 `finish_rate_pct=66.67`。

## 3. 与第 08 题 A 的关系

本题靶场 = 题 A 的可运行切片。正式上线仍需：评审、写入 04 文件、更新血缘面板与字典——不要把靶场视图误报为「已上线 ADS」。

## 4. 看板对照

按 [`P2e-dashboard-bridge.md`](P2e-dashboard-bridge.md) §2 走查。

## 5. 小测门禁

本课需：章末小测通过 + 粘贴 VOD TOKEN 方可「已学」。
