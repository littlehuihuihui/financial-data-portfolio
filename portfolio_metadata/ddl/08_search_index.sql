-- ============================================================================
-- portfolio_metadata · 全局搜索索引表
-- ============================================================================

USE portfolio_metadata;

CREATE TABLE IF NOT EXISTS search_index (
    index_id       BIGINT         NOT NULL AUTO_INCREMENT,
    industry_code  VARCHAR(20)    NOT NULL DEFAULT 'retail',
    category       VARCHAR(30)    NOT NULL COMMENT 'page/dashboard/table/field/lineage/metric/playbook/method',
    title          VARCHAR(200)   NOT NULL,
    subtitle       VARCHAR(500)   NULL,
    keywords       TEXT           NOT NULL,
    target_url     VARCHAR(255)   NOT NULL,
    anchor_id      VARCHAR(100)   NULL,
    field_key      VARCHAR(128)   NULL,
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (index_id),
    KEY idx_category (category),
    KEY idx_industry (industry_code),
    FULLTEXT KEY ft_search (title, subtitle, keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局搜索索引';

-- 零售行业初始索引（与 docs/shared/search-index-data.js · sql6 对齐）
DELETE FROM search_index WHERE industry_code = 'retail';

INSERT INTO search_index (industry_code, category, title, subtitle, keywords, target_url, anchor_id, field_key) VALUES
('retail', 'page', '数据展示', '站点 · 13 主题看板 + 角色切换', '数据展示 看板 retail_dashboard shell', 'retail_dashboard.html', NULL, NULL),
('retail', 'page', '数仓架构', '站点 · sql6 · 29 对象数据字典与血缘', '数仓架构 sql6 ODS DWD DWS ADS 数据字典', 'pages/architecture.html', NULL, NULL),
('retail', 'page', '分析方法论', '站点 · 六层框架 · 31 分析问题', '分析方法论 六层框架 playbook anomaly', 'pages/anomaly.html', NULL, NULL),
('retail', 'dashboard', '经营总览', '看板 · 净收入、毛利率、GMV', '经营总览 overview 净收入 毛利率 GMV', 'retail_dashboard.html', 'overview', NULL),
('retail', 'dashboard', '杜邦分析', '看板 · ROE、净利率、资产周转', '杜邦分析 dupont ROE v_dupont', 'retail_dashboard.html', 'dupont', NULL),
('retail', 'dashboard', '报告导出（P0-P3）', '看板 · PDF 完整经营监控报告', '报告导出 P0 P1 P2 P3 PDF report', 'pages/report.html', NULL, NULL),
('retail', 'table', 'ods_orders', 'ODS · 订单原始落地', 'ods_orders ODS 订单 sql6', 'pages/architecture.html', 'dd-ods_orders', NULL),
('retail', 'table', 'dwd_sales_wide', 'DWD · 销售宽表明细', 'dwd_sales_wide DWD 销售宽表 sql6', 'pages/architecture.html', 'dd-dwd_sales_wide', NULL),
('retail', 'table', 'dws_sales_daily', 'DWS · 销售日汇总', 'dws_sales_daily DWS 销售日汇总 sql6', 'pages/architecture.html', 'dd-dws_sales_daily', NULL),
('retail', 'table', 'v_dupont', 'ADS · 杜邦分析视图', 'v_dupont ADS 杜邦 ROE sql6', 'pages/architecture.html', 'dd-v_dupont', NULL),
('retail', 'field', 'dws_sales_daily.net_revenue', 'DECIMAL · 核心 KPI', 'net_revenue 净收入 dws_sales_daily', 'pages/architecture.html', 'dd-dws_sales_daily', 'dws_sales_daily.net_revenue'),
('retail', 'metric', '净收入', '指标 · 经营总览看板', '净收入 KPI 指标 overview', 'retail_dashboard.html', 'overview', NULL),
('retail', 'metric', 'ROAS', '指标 · 渠道分析看板', 'ROAS 广告 渠道', 'retail_dashboard.html', 'channel', NULL),
('retail', 'playbook', '月度经营概况', '经营概况类 · 这个月业绩怎么样？', '月度经营概况 q01 GMV 收入 环比', 'pages/anomaly.html', 'q01', NULL),
('retail', 'method', '帕累托分析', '优先级分析类 · 二八定律 / 80-20 法则', '帕累托 二八 ABC 工具箱', 'pages/anomaly.html', 'toolbox-pareto', NULL),
('retail', 'lineage', '净收入', '字段血缘 · ods_orders → dwd_sales_wide → dws_sales_daily → v_overview', '净收入 血缘 lineage net_revenue', 'pages/architecture.html', 'field-lineage-panel', '净收入');

SELECT 'search_index' AS tbl, COUNT(*) AS cnt FROM search_index WHERE industry_code = 'retail';
