# 三行业数仓质量与规范一致性标准（DQ）

适用：零售（`retail_kimball`）· 互联网（`internet_analytics`）· 制造（`manufacturing_analytics`）

## 统一强制项

| 项目 | 规范 |
|------|------|
| 分层 | ODS → DWD/fact → DWS → ADS；禁止 ADS→ODS |
| 事实命名 | 优先 `fact_*`；过渡期可用 `dwd_*` + `fact_*` 同义视图 |
| 维度命名 | `dim_*` |
| 汇总命名 | `dws_*` |
| 应用命名 | `v_*` / `v_ads_*` |
| 金额 | `DECIMAL(15,2)`，默认 `0` |
| 代理键 | `BIGINT`，默认 `-1`，未知维种子行 sk=-1 |
| 业务日期 | `DATE`（月标签可用 `VARCHAR(7)`） |
| 状态 | `VARCHAR`/`STRING`，禁止裸 NULL（用 UNKNOWN/-1） |
| 字段数 | ODS≥10 · fact≥15 · dim≥10 · dws≥8 · ADS视图≥5 |
| 主键 | 每表必须有 PRIMARY KEY |
| 注释 | 每个字段 COMMENT 业务含义 |

## 行业对照（一致性）

| 能力 | 零售 | 互联网 | 制造 |
|------|------|--------|------|
| 规范事实命名 fact_* | ✅ 物理表 | ⚠️ 视图别名 | ⚠️ 视图别名 |
| DIM 未知维 -1 | ✅ | ⚠️ 部分 VARCHAR 业务键 | ✅ |
| 金额 15,2 | ✅ | ✅（本次对齐） | ✅ |
| ADS 禁 ODS | ✅（kimball） | ✅（漏斗/LTV 已改 DWS） | ✅（物料/人工已改 DWS） |
| Kimball 设计文档 | ✅ | ✅ | ✅ |

## 过渡策略
互联网/制造不强制立刻物理改名为 `fact_*`（避免打断种子与 API），以 `03_fact_aliases.sql` / `07_fact_aliases.sql` 统一消费侧命名；下一次全量重建时可物理升格。
