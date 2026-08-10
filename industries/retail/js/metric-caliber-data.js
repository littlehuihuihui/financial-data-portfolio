/**
 * 指标口径字典 · 自动生成
 * 来源：industries/retail/docs/04_指标口径字典.md
 * 数量：35 个指标
 * 生成：portfolio/scripts/export_metric_caliber.py
 */
window.METRIC_CALIBER = {
  "revenue": {
    "label": "营业收入",
    "category": "一、核心财务指标",
    "subcategory": "1.1 营收类",
    "business": "当期确认的销售收入，不含税",
    "technical": "SUM(CASE WHEN 科目类型='收入' THEN 贷方发生额-借方发生额 ELSE 0 END)",
    "source_table": "dwd_voucher_fact",
    "exclude_rules": "排除作废凭证、红冲凭证、内部往来",
    "refresh": "T+1"
  },
  "cost_of_goods_sold": {
    "label": "营业成本",
    "category": "一、核心财务指标",
    "subcategory": "1.1 营收类",
    "business": "当期销售商品的成本",
    "technical": "SUM(CASE WHEN 科目类型='成本' THEN 借方发生额-贷方发生额 ELSE 0 END)",
    "source_table": "dwd_voucher_fact",
    "exclude_rules": "排除作废凭证、暂估入库未结转",
    "refresh": "T+1"
  },
  "gross_profit": {
    "label": "毛利",
    "category": "一、核心财务指标",
    "subcategory": "1.1 营收类",
    "business": "营业收入 - 营业成本",
    "technical": "营业收入 - 营业成本",
    "source_table": "dws_account_daily",
    "exclude_rules": "-",
    "refresh": "T+1"
  },
  "gross_margin": {
    "label": "毛利率",
    "category": "一、核心财务指标",
    "subcategory": "1.1 营收类",
    "business": "毛利 / 营业收入 × 100%",
    "technical": "(营业收入 - 营业成本) / NULLIF(营业收入, 0) × 100",
    "source_table": "dws_account_daily",
    "exclude_rules": "收入为0时返回NULL",
    "refresh": "T+1"
  },
  "same_store_sales": {
    "label": "同店销售额",
    "category": "一、核心财务指标",
    "subcategory": "1.1 营收类",
    "business": "开业满12个月的门店当期销售额",
    "technical": "SUM(销售额) WHERE 门店开业日期 < 当期日期 - 365天",
    "source_table": "dwd_sales_fact",
    "exclude_rules": "排除新开门店、闭店门店",
    "refresh": "T+1"
  },
  "same_store_sales_growth": {
    "label": "同店增长率 SSSG",
    "category": "一、核心财务指标",
    "subcategory": "1.1 营收类",
    "business": "同店销售额同比增长率",
    "technical": "(本期同店 - 上期同店) / NULLIF(上期同店, 0) × 100",
    "source_table": "dws_store_monthly",
    "exclude_rules": "上期为0返回NULL",
    "refresh": "月"
  },
  "selling_expense": {
    "label": "销售费用",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "销售环节发生的各项费用",
    "technical": "SUM(销售费用科目借方发生额)",
    "source_table": "dwd_voucher_fact",
    "exclude_rules": "排除资本化费用",
    "refresh": "T+1"
  },
  "administrative_expense": {
    "label": "管理费用",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "管理部门发生的各项费用",
    "technical": "SUM(管理费用科目借方发生额)",
    "source_table": "dwd_voucher_fact",
    "exclude_rules": "排除资本化费用",
    "refresh": "T+1"
  },
  "financial_expense": {
    "label": "财务费用",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "融资、手续费等财务费用",
    "technical": "SUM(财务费用科目借方发生额 - 利息收入)",
    "source_table": "dwd_voucher_fact",
    "exclude_rules": "排除汇兑损益（单独统计）",
    "refresh": "T+1"
  },
  "total_period_expense": {
    "label": "期间费用合计",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "销售+管理+财务费用",
    "technical": "销售费用 + 管理费用 + 财务费用",
    "source_table": "dws_account_daily",
    "exclude_rules": "-",
    "refresh": "T+1"
  },
  "expense_ratio": {
    "label": "费用率",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "期间费用 / 营业收入 × 100%",
    "technical": "期间费用合计 / NULLIF(营业收入, 0) × 100",
    "source_table": "dws_account_daily",
    "exclude_rules": "-",
    "refresh": "T+1"
  },
  "operating_profit": {
    "label": "营业利润",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "毛利 - 期间费用 + 其他收益",
    "technical": "毛利 - 期间费用 + 其他收益 + 投资收益",
    "source_table": "dws_account_daily",
    "exclude_rules": "-",
    "refresh": "T+1"
  },
  "net_profit": {
    "label": "净利润",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "税后利润，归属于母公司",
    "technical": "营业利润 + 营业外收支 - 所得税费用",
    "source_table": "dws_account_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "net_profit_margin": {
    "label": "净利润率",
    "category": "一、核心财务指标",
    "subcategory": "1.2 费用利润类",
    "business": "净利润 / 营业收入 × 100%",
    "technical": "净利润 / NULLIF(营业收入, 0) × 100",
    "source_table": "dws_account_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "inventory_value": {
    "label": "库存金额",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "期末库存账面价值",
    "technical": "SUM(库存商品科目期末余额)",
    "source_table": "dws_inventory_daily",
    "exclude_rules": "排除在途物资、委托代销",
    "refresh": "T+1"
  },
  "inventory_turnover_days": {
    "label": "库存周转天数",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "库存平均多少天周转一次",
    "technical": "平均库存余额 / 当期销售成本 × 当期天数",
    "source_table": "dws_inventory_monthly",
    "exclude_rules": "销售成本为0返回NULL",
    "refresh": "月"
  },
  "inventory_turnover_ratio": {
    "label": "库存周转率",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "当期库存周转次数",
    "technical": "当期销售成本 / 平均库存余额",
    "source_table": "dws_inventory_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "ar_turnover_days": {
    "label": "应收账款周转天数",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "应收账款平均回款天数",
    "technical": "平均应收账款 / 当期营收 × 当期天数",
    "source_table": "dws_ar_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "ap_turnover_days": {
    "label": "应付账款周转天数",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "应付账款平均付款天数",
    "technical": "平均应付账款 / 当期采购成本 × 当期天数",
    "source_table": "dws_ap_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "cash_conversion_cycle": {
    "label": "现金转换周期 CCC",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "从付货款到收货款的天数",
    "technical": "库存周转天数 + 应收周转天数 - 应付周转天数",
    "source_table": "dws_cash_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "sell_through_rate": {
    "label": "动销率",
    "category": "一、核心财务指标",
    "subcategory": "1.3 资产运营类",
    "business": "有销售的SKU占比",
    "technical": "有销售SKU数 / 总在售SKU数 × 100",
    "source_table": "dws_sku_daily",
    "exclude_rules": "排除停售SKU",
    "refresh": "周"
  },
  "roe": {
    "label": "ROE 净资产收益率",
    "category": "一、核心财务指标",
    "subcategory": "1.4 盈利能力类（杜邦分析）",
    "business": "净利润 / 平均净资产 × 100%",
    "technical": "净利润 / AVG(期初净资产, 期末净资产) × 100",
    "source_table": "dws_finance_monthly",
    "exclude_rules": "",
    "refresh": "月",
    "dupont_level": "第一层"
  },
  "roa": {
    "label": "ROA 总资产收益率",
    "category": "一、核心财务指标",
    "subcategory": "1.4 盈利能力类（杜邦分析）",
    "business": "净利润 / 平均总资产 × 100%",
    "technical": "净利润 / AVG(期初总资产, 期末总资产) × 100",
    "source_table": "dws_finance_monthly",
    "exclude_rules": "",
    "refresh": "月",
    "dupont_level": "第二层"
  },
  "equity_multiplier": {
    "label": "权益乘数",
    "category": "一、核心财务指标",
    "subcategory": "1.4 盈利能力类（杜邦分析）",
    "business": "总资产 / 净资产（杠杆倍数）",
    "technical": "平均总资产 / 平均净资产",
    "source_table": "dws_finance_monthly",
    "exclude_rules": "",
    "refresh": "月",
    "dupont_level": "第二层"
  },
  "net_margin": {
    "label": "销售净利率",
    "category": "一、核心财务指标",
    "subcategory": "1.4 盈利能力类（杜邦分析）",
    "business": "净利润 / 营业收入 × 100%",
    "technical": "净利润 / 营业收入 × 100",
    "source_table": "dws_finance_monthly",
    "exclude_rules": "",
    "refresh": "月",
    "dupont_level": "第三层"
  },
  "asset_turnover": {
    "label": "总资产周转率",
    "category": "一、核心财务指标",
    "subcategory": "1.4 盈利能力类（杜邦分析）",
    "business": "营业收入 / 平均总资产",
    "technical": "营业收入 / 平均总资产",
    "source_table": "dws_finance_monthly",
    "exclude_rules": "",
    "refresh": "月",
    "dupont_level": "第三层"
  },
  "sales_per_sqm": {
    "label": "坪效",
    "category": "二、业务运营指标",
    "subcategory": "2.1 门店运营类",
    "business": "每平米面积产出的销售额",
    "technical": "门店销售额 / 门店营业面积",
    "source_table": "dws_store_monthly",
    "exclude_rules": "排除仓库面积、办公区",
    "refresh": "月"
  },
  "sales_per_employee": {
    "label": "人效",
    "category": "二、业务运营指标",
    "subcategory": "2.1 门店运营类",
    "business": "每个员工产出的销售额",
    "technical": "门店销售额 / 门店平均人数",
    "source_table": "dws_store_monthly",
    "exclude_rules": "排除兼职、实习",
    "refresh": "月"
  },
  "average_order_value": {
    "label": "客单价",
    "category": "二、业务运营指标",
    "subcategory": "2.1 门店运营类",
    "business": "平均每单消费金额",
    "technical": "销售总额 / 订单笔数",
    "source_table": "dwd_sales_fact",
    "exclude_rules": "排除退款订单、测试订单",
    "refresh": "日"
  },
  "items_per_transaction": {
    "label": "连带率",
    "category": "二、业务运营指标",
    "subcategory": "2.1 门店运营类",
    "business": "平均每单购买件数",
    "technical": "销售总件数 / 订单笔数",
    "source_table": "dwd_sales_fact",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "transaction_count": {
    "label": "交易笔数",
    "category": "二、业务运营指标",
    "subcategory": "2.1 门店运营类",
    "business": "当期有效订单数",
    "technical": "COUNT(DISTINCT 订单号) WHERE 订单状态='已完成'",
    "source_table": "dwd_sales_fact",
    "exclude_rules": "排除取消、退款、测试",
    "refresh": "日"
  },
  "channel_sales": {
    "label": "渠道销售额",
    "category": "二、业务运营指标",
    "subcategory": "2.2 渠道分析类",
    "business": "各渠道贡献的销售收入",
    "technical": "SUM(销售额) GROUP BY 渠道",
    "source_table": "dwd_sales_fact",
    "exclude_rules": "排除内部测试单",
    "refresh": "日"
  },
  "channel_share": {
    "label": "渠道占比",
    "category": "二、业务运营指标",
    "subcategory": "2.2 渠道分析类",
    "business": "各渠道销售额占总销售额比例",
    "technical": "渠道销售额 / 总销售额 × 100",
    "source_table": "dws_channel_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "channel_roi": {
    "label": "渠道ROI",
    "category": "二、业务运营指标",
    "subcategory": "2.2 渠道分析类",
    "business": "渠道毛利 / 渠道投放费用",
    "technical": "(渠道毛利 - 渠道费用) / NULLIF(渠道费用, 0)",
    "source_table": "dws_marketing_monthly",
    "exclude_rules": "费用为0返回NULL",
    "refresh": "月"
  },
  "customer_acquisition_cost": {
    "label": "获客成本 CAC",
    "category": "二、业务运营指标",
    "subcategory": "2.2 渠道分析类",
    "business": "获取一个新客户的成本",
    "technical": "渠道投放费用 / 新增客户数",
    "source_table": "dws_channel_monthly",
    "exclude_rules": "排除自然流量客户",
    "refresh": "月"
  }
};
