# SQL / BI 知识树重构摘要

## 重构前后对比

### BI
| 变更 | 说明 |
|---|---|
| 删除 | 「选型 / 工具与选型」「国内外 BI 工具」等为分层而分层的中间层 |
| 删除 | 旧的指标体系/语义层/权限等百科式大树（改由工具路径承载学习） |
| 保留 | 顶层 `bi-root` / 标题 **BI** |
| 新增 Level1 | **Tableau / Power BI / 国产 BI** 直接挂在 BI 下 |
| 新增 Tableau Level2 | 8 功能模块：入门准备、数据准备、图表制作、计算、筛选与交互、仪表板、性能优化、实战案例 |
| LOD | 方案 B：LOD 容器下挂 FIXED / INCLUDE / EXCLUDE 三叶 |

### SQL
| 变更 | 说明 |
|---|---|
| 删除 | L0–L6「为分层而分层」的关卡命名 |
| 保留 | 顶层 `sql-root` / 标题 **SQL** |
| 新增 Level2 | 6 功能模块：基础查询、多表操作、聚合分析、数据定义、性能优化、事务与安全 |

## BI 完整树

```
BI
├─ Tableau
│   ├─ 入门准备（安装与账号 / 界面介绍 / 数据源连接）
│   ├─ 数据准备（维度 vs 度量 / 数据类型 / 提取 vs 实时）
│   ├─ 图表制作（柱/折/饼/环/双轴/热力）
│   ├─ 计算（基础计算 / 表计算 / LOD→FIXED·INCLUDE·EXCLUDE）
│   ├─ 筛选与交互（筛选器 / 参数 / 动作）
│   ├─ 仪表板（布局 / 交互设计 / 移动端适配）
│   ├─ 性能优化（提取优化 / 计算字段优化 / LOD 性能）
│   └─ 实战案例（销售 / 留存 / 漏斗）
├─ Power BI
│   ├─ 入门准备 / 数据建模 / DAX / 可视化 / 实战案例
└─ 国产 BI
    ├─ FineBI（入门 / 图表 / 仪表板）
    └─ QuickBI（入门 / 图表 / 仪表板）
```

## SQL 完整树

```
SQL
├─ 基础查询（SELECT / WHERE / ORDER BY / LIMIT）
├─ 多表操作（JOIN / 子查询 / UNION）
├─ 聚合分析（GROUP BY / HAVING / 窗口函数）
├─ 数据定义（CREATE TABLE / ALTER TABLE / 约束）
├─ 性能优化（索引 / 执行计划 / 查询重写）
└─ 事务与安全（事务 / 锁 / 权限）
```

## 规模

- 知识库页面总数：**70**
- BI 平台叶节点：**51**
- SQL 平台叶节点：**19**
- 扁平 nodes 条目：**101**

## LOD 与图表类页面清单

### LOD
- `BI.Tableau.计算.LOD.FIXED`
- `BI.Tableau.计算.LOD.INCLUDE`
- `BI.Tableau.计算.LOD.EXCLUDE`

### 图表（含 how_to_make）
- 柱状图 / 折线图 / 饼图 / 环形图 / 双轴组合图 / 热力图

## 落盘文件

- 架构 JSON：`pages/kg-data/sql-bi-architecture.json`
- 平台树：`pages/kg-data/bi.json`、`sql.json`（及 hub/embed 同步）

## 质量校验

- [x] BI 下面直接是工具，没有「选型」层
- [x] Tableau 下面有 8 个功能模块
- [x] SQL 下面有 6 个功能模块
- [x] 每个模块至少 2 个知识点
- [x] LOD 下面有 FIXED/INCLUDE/EXCLUDE
- [x] 图表类知识点有 how_to_make
- [x] 每个叶子节点都有知识库页面
- [x] JSON 可被 JSON.parse / json.loads 解析

校验错误：无
