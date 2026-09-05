# 术语表（对齐本仓库用语）

| 术语 | 含义 | 本仓库指认 |
|------|------|------------|
| ODS | 贴源层 | 如 `ods_log_launcher_di` |
| DIM | 维度层 | 如 `dim_device`（mac PK） |
| DWD | 明细事实层 | 如 `dwd_act_launcher_di` |
| DWS | 汇总层 | 如 `dws_act_user_active_1d` |
| ADS | 应用层（常视图） | 如 `v_dau_overview` |
| 粒度 | 一行代表什么 | 以表 COMMENT 为准 |
| 退化维 | 事实表上的维属性列 | 如 DWD 上 `device_type` |
| SCD1/2 | 维更新策略 | OTT 设备维≈当前态；SCD2 见 E1 示意 |
| 幂等 | 重跑结果一致 | E3；靶场 TRUNCATE/按日覆盖 |
| DQ | 数据质量门禁 | `lab_dq_result`；E4 |
| 事件时间 | 业务发生时间 | `event_time` / `event_date` |
| 业务日 | 批处理所属日 | 靶场固定 2026-07-15 |
| 血缘 | 表/作业依赖 | `etl-lineage-data.js` |
| synthetic | 演示生成边 | 面板 `layer_from=SRC` 等 |
| 靶场 TOKEN | 跑通 lab 的凭证 | `dnexus-lab-dau-v1-PASS` 等 |
| 完播 | `is_finish=1` 汇总 | DWS `finish_cnt` |
| VV/UV | 播放次数/去重用户或设备 | series 日表 `vv`/`uv` |
| 北极星 | 阶段主指标 | 监控文档 / 看板标注 |
| 数据契约 | 上下游接口承诺 | E7 模板 |

不确定时：回 [`SOURCES.md`](SOURCES.md) grep DDL，禁止臆造同义词列名。
