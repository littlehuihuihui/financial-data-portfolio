# 需求：ETL「代码路径」跳转远程仓库文件

> 交给另一对话执行。执行前请提供或从 `git remote get-url origin` 读取仓库 URL。

## 背景

架构页「ETL调度与数据血缘」中，每条 A→B 边已有字段 `code_path`（仓库相对路径，如 `portfolio/industries/manufacturing/database/05_ads.sql`）和可选 `entry`（函数/段落名）。当前仅以纯文本展示，推送到 Git 后希望**一点即可在浏览器打开对应 Python / SQL / 视图定义文件**。

## 目标

1. 在 ETL 边详情的「代码路径」上生成可点击链接，打开远程仓库中的该文件。
2. 支持 GitHub 与 GitLab 常见 URL 形态（至少 GitHub）。
3. 无远程 URL 配置时，保持现状（纯文本），不报错、不空白。

## 配置（由执行方填入真实值）

在合适位置增加配置（推荐三选一，优先 1）：

1. **各行业** `etl-lineage-data.js` 顶层增加：

```js
repo: {
  baseUrl: "https://github.com/<org>/<repo>",  // 无末尾斜杠；执行方替换
  branch: "main",                               // 或 master / 实际默认分支
  // 可选：provider: "github" | "gitlab"
}
```

2. 或平台级常量（如 `portfolio/js/etl-lineage.js` 内 `DEFAULT_REPO`），行业 `repo` 可覆盖。
3. 或从页面 `meta` / `data-*` 读取（若作品集已有统一配置则复用）。

**执行方必须**：把 `baseUrl` / `branch` 换成真实仓库 URL 与默认分支，不要留占位符上线。

## URL 拼接规则

- **GitHub**：`{baseUrl}/blob/{branch}/{code_path}`  
  例：`https://github.com/acme/multi-industry/blob/main/portfolio/industries/manufacturing/database/seed_manufacturing_data.py`

- **GitLab**：`{baseUrl}/-/blob/{branch}/{code_path}`

- `code_path` 使用边数据中的相对路径，**不要**再加 `portfolio/` 前缀（路径里已含）。
- 路径段需 `encodeURI` 处理（保留 `/`）。
- 可选增强（有则做，无则跳过）：
  - 若边有 `line_start` / `line_end`：GitHub 追加 `#L{start}-L{end}`；
  - 若仅有 `entry`：不要求自动定位函数行（除非顺手做了简单搜索锚点）。

## UI 改动范围

| 文件 | 改动 |
|------|------|
| [`portfolio/js/etl-lineage.js`](../js/etl-lineage.js) | `renderDetail` 中「代码路径」：有 `repo.baseUrl` 时渲染为 `<a target="_blank" rel="noopener">`；旁可加短文案「在仓库中打开」 |
| 三行业 [`etl-lineage-data.js`](../industries/manufacturing/js/etl-lineage-data.js) | 增加 `repo: { baseUrl, branch }`（或统一一处配置） |
| CSS（[`platform-shell.css`](../css/platform-shell.css) 已有 `.etl-code-path`） | 链接色/hover 与现有 primary 一致即可 |
| 缓存 |  bump `etl-lineage.js` / `platform-shell.css` 的 `?v=` |

**不要改**：看板 API、数仓 DDL、MySQL `etl_transform_edge` 表结构（除非顺带把 `repo` 写进种子，非必须）。

## 验收

1. 制造架构页打开 ETL 区，点选 `ods_labor → dws_labor_monthly`，点击代码路径，浏览器新标签打开远程对应 `.py` 或 `.sql`。
2. 点选 `dws_labor_monthly → v_labor_efficiency`，打开 `05_ads.sql`（含 VIEW 定义）。
3. 零售 / 互联网同样可点通至少一条 Python 边与一条 SQL/视图边。
4. 临时清空 `repo.baseUrl` 后，路径退化为纯文本，控制台无报错。
5. 硬刷新后链接仍有效（缓存已 bump）。

## 非目标

- 不在页面内嵌完整文件内容。
- 不实现私有仓库 OAuth；公开仓或已登录的 GitHub/GitLab 会话即可。
- 不替代本地用 IDE 打开文件的能力。

## 实现提示

- 复用现有 `edge.code_path`、`edge.entry`。
- 链接生成函数建议：`buildRepoFileUrl(repo, codePath) → string | null`。
- 若 `code_path` 为空或为 `—`，不渲染链接。
