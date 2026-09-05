# 第 08 章 · 合格样例（题 A 节选）

> 这是**评分锚点**，不是唯一答案。所有表名均可在 `ott_ddl.sql` 检索。

## 业务问题

运营要看「昨日点播完播率是否下滑，并按剧集拆开」。

成功标准：早 9 点可看昨日 `finish_vv / play_vv`；可下钻到 `series_id`。

## Kimball 四步（节选）

1. 过程：点播播放行为  
2. 粒度（DWD 已有）：一行 = 一次播放（`dwd_vod_play_di` COMMENT）  
3. 维：日期、设备类型、剧集/单集  
4. 事实：播放次数、完播次数（由 `is_finish` 汇总）

## 表清单

| 层 | 对象 | 说明 |
|----|------|------|
| ODS | `ods_log_vod_di` | 复用 |
| DWD | `dwd_vod_play_di` | 复用；使用 `is_finish` |
| DWS | `dws_content_episode_play_1d` / series 日表 | 复用；确认是否已有完播度量，缺则 **拟新增列** 并改 ETL |
| ADS | `v_vod_finish_rate`（拟新增） | `FROM` 仅 DWS |

## 层间算法（摘要）

- ODS→DWD：已有灌数路径见 `seed_ott.py` / 面板；生产应过滤非法 `mac`、规范化 `action`。  
- DWD→DWS：`SUM(is_finish)`, `COUNT(*)` 按 `snapshot_date, series_id`（以现网 DWS 粒度为准）。  
- DWS→ADS：`finish_vv / NULLIF(play_vv,0)`。

## DQ

- DWD：`is_finish IN (0,1)`  
- DWS：`finish_vv <= play_vv`  
- ADS：与 DWS 勾稽

## 为何合格

粒度可测、复用真实表、拟新增处显式标注、遵守 ADS 不读 ODS。
