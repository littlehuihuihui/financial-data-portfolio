# 作品集前端 CSS 分层（Step 7）

| 文件 | 职责 |
|------|------|
| `design-tokens.css` | 全平台色板 / 字体 / 分层色 / 行业 accent + 语义 alias |
| `landing.css` | 入口页 |
| `platform-shell.css` | 公共壳层（顶栏、卡片、架构页通用、静态 Accordion） |
| `platform-shell-nav.css` | 看板 Shell 导航条 |
| `platform-features.css` | 全局搜索 / 工具箱等平台扩展 |
| `dashboard-base.css` | 三行业看板公共样式（Step 8d） |
| `methodology-shell.css` | 方法论页布局（取代内联 CSS） |
| `data-dictionary.css` | 数据字典 Master-Detail |
| `dw-architecture.css` | 分层全景图 |
| `dw-knowledge-graph.css` | 知识图谱 |

## 标准 HTML 引用顺序（Step 8a）

```html
<link rel="stylesheet" href="{root}/css/design-tokens.css">
<link rel="stylesheet" href="{root}/css/platform-shell.css">
<link rel="stylesheet" href="{industry}/css/industry-overrides.css">
<!-- 页面专用 CSS -->
```

`style.css` 仅为薄 `@import` 兼容；**页面应直引 `platform-shell.css`**，避免 `@import` 在本地 file:// 失效导致配色丢失。

语义色变量（`--text` / `--primary` / `--card-border`）已写入 `design-tokens.css`，shell 未加载时也有 fallback。

行业目录 `industries/*/css/`：

- `style.css` / `platform-features.css` / `dw-*.css` / `shell.css` → **薄 `@import`**
- `industry-overrides.css` → 仅 accent / 品牌微调
- `dashboard.css` → 薄 `@import` `dashboard-base.css`（行业差异可追加）
- `report.css` → 仍可按行业保留差异

改公共样式：只改 `portfolio/css/`。改行业色：改 `design-tokens.css` 的 `[data-industry=…]` 或 `industry-overrides.css`。
