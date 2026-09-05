# 第 08 章 · 不及格样例（看起来完整，实则错）

## 错误设计摘要

「一张 ADS 宽表直接从 `ods_log_vod_di` 算完播率，按用户×剧集×小时×设备×固件 GROUP BY，叫 `ads_vod_all_in_one`。」

## 表面完整之处

- 写了业务背景与 SLA  
- 画了看板三张图  
- 有「DQ：行数>0」

## 致命问题

1. **ADS 直读 ODS**——违反 `04_ott_ads_views.sql` 文件头与 `00_kimball_design.md`。  
2. **粒度未声明且不可加**：同一用户多小时多固件，完播率被重复计权，无法与 `dws_content_*_1d` 对账。  
3. **忽略已有资产**：未评估 `dwd_vod_play_di.is_finish`、`dws_content_episode_play_1d`。  
4. **证据缺失**：出现臆造字段如 `device_sk`、`dt`（OTT 开机/点播日志无这些列）。

## 评审评语（示例）

> 打回。先声明粒度并复用 DWD/DWS；ADS 只做比率投影。请附 `ott_ddl.sql` 检索截图或行引用。

## 学员任务

用红笔标出上文 4 类错误，并改写成「合格样例」结构中的表清单 5 行。
