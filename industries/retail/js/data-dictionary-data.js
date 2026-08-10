/** sql6 数据字典 · 自动生成 · 勿手改
 * tables=32 caliber_fields=23 tables_with_dashboards=31
 */
window.DATA_DICTIONARY = [
  {
    "name": "ods_orders",
    "layer": "ODS",
    "type": "table",
    "purpose": "订单表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_sales_wide",
      "dws_sales_daily",
      "dws_sales_monthly",
      "v_overview"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_orders",
      "dwd_sales_wide",
      "dws_sales_daily"
    ],
    "used_by_dashboards": [
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      },
      {
        "id": "quality",
        "title": "数据质量",
        "file": "dashboards/14-quality.html",
        "href": "../retail_dashboard.html#quality"
      }
    ],
    "field_count": 20,
    "fields": [
      {
        "name": "order_id",
        "type": "VARCHAR(50)",
        "desc": "订单编号",
        "business": "订单编号",
        "role": "bk"
      },
      {
        "name": "order_date",
        "type": "DATE",
        "desc": "下单日期",
        "business": "下单日期",
        "role": "attr"
      },
      {
        "name": "order_amount",
        "type": "DECIMAL(15,2)",
        "desc": "订单金额",
        "business": "订单金额",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "payment_amount",
        "type": "DECIMAL(15,2)",
        "desc": "实付金额",
        "business": "实付金额",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "cost_amount",
        "type": "DECIMAL(15,2)",
        "desc": "成本金额",
        "business": "成本金额",
        "role": "measure",
        "caliber_id": "cost_of_goods_sold"
      },
      {
        "name": "discount_amount",
        "type": "DECIMAL(15,2)",
        "desc": "优惠金额",
        "business": "优惠金额",
        "role": "measure"
      },
      {
        "name": "shipping_fee",
        "type": "DECIMAL(15,2)",
        "desc": "运费",
        "business": "运费",
        "role": "measure"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "category_code",
        "type": "VARCHAR(20)",
        "desc": "品类编码",
        "business": "品类编码",
        "role": "attr"
      },
      {
        "name": "store_code",
        "type": "VARCHAR(20)",
        "desc": "门店编码",
        "business": "门店编码",
        "role": "attr"
      },
      {
        "name": "customer_id",
        "type": "VARCHAR(50)",
        "desc": "客户ID",
        "business": "客户ID",
        "role": "bk"
      },
      {
        "name": "sku_code",
        "type": "VARCHAR(50)",
        "desc": "SKU编码",
        "business": "SKU编码",
        "role": "attr"
      },
      {
        "name": "order_status",
        "type": "VARCHAR(20)",
        "desc": "订单状态",
        "business": "订单状态",
        "role": "attr"
      },
      {
        "name": "return_flag",
        "type": "TINYINT(1)",
        "desc": "是否退货",
        "business": "是否退货",
        "role": "attr"
      },
      {
        "name": "return_amount",
        "type": "DECIMAL(15,2)",
        "desc": "退货金额",
        "business": "退货金额",
        "role": "measure"
      },
      {
        "name": "return_reason",
        "type": "VARCHAR(200)",
        "desc": "退货原因",
        "business": "退货原因",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "updated_at",
        "type": "DATETIME",
        "desc": "updated_at",
        "business": "updated_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_payment",
    "layer": "ODS",
    "type": "table",
    "purpose": "支付流水表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "v_cashflow"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_payment",
      "v_cashflow"
    ],
    "used_by_dashboards": [
      {
        "id": "cashflow",
        "title": "现金流分析",
        "file": "dashboards/06-cashflow.html",
        "href": "../retail_dashboard.html#cashflow"
      },
      {
        "id": "quality",
        "title": "数据质量",
        "file": "dashboards/14-quality.html",
        "href": "../retail_dashboard.html#quality"
      }
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "payment_id",
        "type": "VARCHAR(50)",
        "desc": "支付流水号",
        "business": "支付流水号",
        "role": "bk"
      },
      {
        "name": "order_id",
        "type": "VARCHAR(50)",
        "desc": "关联订单号",
        "business": "关联订单号",
        "role": "bk"
      },
      {
        "name": "payment_date",
        "type": "DATETIME",
        "desc": "支付时间",
        "business": "支付时间",
        "role": "attr"
      },
      {
        "name": "payment_amount",
        "type": "DECIMAL(15,2)",
        "desc": "支付金额",
        "business": "支付金额",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "payment_method",
        "type": "VARCHAR(30)",
        "desc": "支付方式",
        "business": "支付方式",
        "role": "attr"
      },
      {
        "name": "payment_status",
        "type": "VARCHAR(20)",
        "desc": "支付状态",
        "business": "支付状态",
        "role": "attr"
      },
      {
        "name": "transaction_id",
        "type": "VARCHAR(100)",
        "desc": "第三方交易号",
        "business": "第三方交易号",
        "role": "bk"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_purchase",
    "layer": "ODS",
    "type": "table",
    "purpose": "采购表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_inventory_wide"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_purchase",
      "dwd_inventory_wide"
    ],
    "used_by_dashboards": [],
    "field_count": 16,
    "fields": [
      {
        "name": "purchase_id",
        "type": "VARCHAR(50)",
        "desc": "采购单号",
        "business": "采购单号",
        "role": "bk"
      },
      {
        "name": "purchase_date",
        "type": "DATE",
        "desc": "采购日期",
        "business": "采购日期",
        "role": "attr"
      },
      {
        "name": "supplier_code",
        "type": "VARCHAR(50)",
        "desc": "供应商编码",
        "business": "供应商编码",
        "role": "attr"
      },
      {
        "name": "supplier_name",
        "type": "VARCHAR(100)",
        "desc": "供应商名称",
        "business": "供应商名称",
        "role": "attr"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "category_code",
        "type": "VARCHAR(20)",
        "desc": "品类编码",
        "business": "品类编码",
        "role": "attr"
      },
      {
        "name": "purchase_amount",
        "type": "DECIMAL(15,2)",
        "desc": "采购金额",
        "business": "采购金额",
        "role": "measure"
      },
      {
        "name": "purchase_qty",
        "type": "INT",
        "desc": "采购数量",
        "business": "采购数量",
        "role": "measure"
      },
      {
        "name": "unit_price",
        "type": "DECIMAL(12,2)",
        "desc": "单价",
        "business": "单价",
        "role": "attr"
      },
      {
        "name": "receipt_flag",
        "type": "TINYINT(1)",
        "desc": "是否已入库",
        "business": "是否已入库",
        "role": "attr"
      },
      {
        "name": "receipt_date",
        "type": "DATE",
        "desc": "入库日期",
        "business": "入库日期",
        "role": "attr"
      },
      {
        "name": "receipt_qty",
        "type": "INT",
        "desc": "入库数量",
        "business": "入库数量",
        "role": "measure"
      },
      {
        "name": "invoice_flag",
        "type": "TINYINT(1)",
        "desc": "是否已开票",
        "business": "是否已开票",
        "role": "attr"
      },
      {
        "name": "invoice_amount",
        "type": "DECIMAL(15,2)",
        "desc": "发票金额",
        "business": "发票金额",
        "role": "measure"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_inventory",
    "layer": "ODS",
    "type": "table",
    "purpose": "库存流水表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_inventory_wide",
      "dws_inventory_daily",
      "v_inventory"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_inventory",
      "dwd_inventory_wide",
      "dws_inventory_daily"
    ],
    "used_by_dashboards": [
      {
        "id": "inventory",
        "title": "库存分析",
        "file": "dashboards/08-inventory.html",
        "href": "../retail_dashboard.html#inventory"
      },
      {
        "id": "quality",
        "title": "数据质量",
        "file": "dashboards/14-quality.html",
        "href": "../retail_dashboard.html#quality"
      }
    ],
    "field_count": 14,
    "fields": [
      {
        "name": "inventory_id",
        "type": "VARCHAR(50)",
        "desc": "库存流水ID",
        "business": "库存流水ID",
        "role": "bk"
      },
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "库存日期",
        "business": "库存日期",
        "role": "attr"
      },
      {
        "name": "sku_code",
        "type": "VARCHAR(50)",
        "desc": "SKU编码",
        "business": "SKU编码",
        "role": "attr"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "category_code",
        "type": "VARCHAR(20)",
        "desc": "品类编码",
        "business": "品类编码",
        "role": "attr"
      },
      {
        "name": "store_code",
        "type": "VARCHAR(20)",
        "desc": "门店编码",
        "business": "门店编码",
        "role": "attr"
      },
      {
        "name": "stock_qty",
        "type": "INT",
        "desc": "库存数量",
        "business": "库存数量",
        "role": "measure"
      },
      {
        "name": "stock_amount",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      },
      {
        "name": "unit_cost",
        "type": "DECIMAL(12,2)",
        "desc": "单位成本",
        "business": "单位成本",
        "role": "measure"
      },
      {
        "name": "inbound_qty",
        "type": "INT",
        "desc": "入库数量",
        "business": "入库数量",
        "role": "measure"
      },
      {
        "name": "outbound_qty",
        "type": "INT",
        "desc": "出库数量",
        "business": "出库数量",
        "role": "measure"
      },
      {
        "name": "transfer_qty",
        "type": "INT",
        "desc": "调拨数量",
        "business": "调拨数量",
        "role": "measure"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_expense",
    "layer": "ODS",
    "type": "table",
    "purpose": "费用表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_expense_wide",
      "dws_expense_monthly",
      "v_budget"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_expense",
      "dwd_expense_wide",
      "dws_expense_monthly"
    ],
    "used_by_dashboards": [
      {
        "id": "budget",
        "title": "预算执行",
        "file": "dashboards/09-budget.html",
        "href": "../retail_dashboard.html#budget"
      },
      {
        "id": "quality",
        "title": "数据质量",
        "file": "dashboards/14-quality.html",
        "href": "../retail_dashboard.html#quality"
      }
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "expense_id",
        "type": "VARCHAR(50)",
        "desc": "费用ID",
        "business": "费用ID",
        "role": "bk"
      },
      {
        "name": "expense_date",
        "type": "DATE",
        "desc": "费用发生日期",
        "business": "费用发生日期",
        "role": "attr"
      },
      {
        "name": "expense_type",
        "type": "VARCHAR(30)",
        "desc": "费用类型",
        "business": "费用类型",
        "role": "attr"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "store_code",
        "type": "VARCHAR(20)",
        "desc": "门店编码",
        "business": "门店编码",
        "role": "attr"
      },
      {
        "name": "expense_amount",
        "type": "DECIMAL(15,2)",
        "desc": "费用金额",
        "business": "费用金额",
        "role": "measure"
      },
      {
        "name": "budget_amount",
        "type": "DECIMAL(15,2)",
        "desc": "预算金额",
        "business": "预算金额",
        "role": "measure"
      },
      {
        "name": "cost_center",
        "type": "VARCHAR(50)",
        "desc": "成本中心",
        "business": "成本中心",
        "role": "measure"
      },
      {
        "name": "expense_owner",
        "type": "VARCHAR(50)",
        "desc": "费用负责人",
        "business": "费用负责人",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_store_pnl",
    "layer": "ODS",
    "type": "table",
    "purpose": "门店损益表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dws_store_daily"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_store_pnl",
      "dws_store_daily"
    ],
    "used_by_dashboards": [
      {
        "id": "store",
        "title": "门店分析",
        "file": "dashboards/10-store.html",
        "href": "../retail_dashboard.html#store"
      },
      {
        "id": "financial",
        "title": "三大报表",
        "file": "dashboards/04-financial.html",
        "href": "../retail_dashboard.html#financial"
      }
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "store_code",
        "type": "VARCHAR(20)",
        "desc": "门店编码",
        "business": "门店编码",
        "role": "attr"
      },
      {
        "name": "store_name",
        "type": "VARCHAR(100)",
        "desc": "门店名称",
        "business": "门店名称",
        "role": "attr"
      },
      {
        "name": "region",
        "type": "VARCHAR(50)",
        "desc": "区域",
        "business": "区域",
        "role": "attr"
      },
      {
        "name": "city",
        "type": "VARCHAR(50)",
        "desc": "城市",
        "business": "城市",
        "role": "attr"
      },
      {
        "name": "store_area",
        "type": "DECIMAL(10,2)",
        "desc": "门店面积",
        "business": "门店面积",
        "role": "attr"
      },
      {
        "name": "open_date",
        "type": "DATE",
        "desc": "开业日期",
        "business": "开业日期",
        "role": "attr"
      },
      {
        "name": "monthly_revenue",
        "type": "DECIMAL(15,2)",
        "desc": "月度收入",
        "business": "月度收入",
        "role": "measure"
      },
      {
        "name": "monthly_profit",
        "type": "DECIMAL(15,2)",
        "desc": "月度利润",
        "business": "月度利润",
        "role": "measure"
      },
      {
        "name": "pingsiao",
        "type": "DECIMAL(10,2)",
        "desc": "坪效",
        "business": "坪效",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_ad_cost",
    "layer": "ODS",
    "type": "table",
    "purpose": "广告费用表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dws_expense_monthly"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_ad_cost",
      "dws_expense_monthly"
    ],
    "used_by_dashboards": [
      {
        "id": "channel",
        "title": "渠道分析",
        "file": "dashboards/03-channel.html",
        "href": "../retail_dashboard.html#channel"
      },
      {
        "id": "budget",
        "title": "预算执行",
        "file": "dashboards/09-budget.html",
        "href": "../retail_dashboard.html#budget"
      }
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "ad_id",
        "type": "VARCHAR(50)",
        "desc": "广告ID",
        "business": "广告ID",
        "role": "bk"
      },
      {
        "name": "ad_date",
        "type": "DATE",
        "desc": "广告投放日期",
        "business": "广告投放日期",
        "role": "attr"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "platform",
        "type": "VARCHAR(30)",
        "desc": "平台",
        "business": "平台",
        "role": "attr"
      },
      {
        "name": "ad_cost",
        "type": "DECIMAL(15,2)",
        "desc": "广告费用",
        "business": "广告费用",
        "role": "measure"
      },
      {
        "name": "impressions",
        "type": "INT",
        "desc": "曝光量",
        "business": "曝光量",
        "role": "attr"
      },
      {
        "name": "clicks",
        "type": "INT",
        "desc": "点击量",
        "business": "点击量",
        "role": "attr"
      },
      {
        "name": "conversions",
        "type": "INT",
        "desc": "转化量",
        "business": "转化量",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "ods_budget",
    "layer": "ODS",
    "type": "table",
    "purpose": "预算表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "v_budget"
    ],
    "lineage": [
      "ERP/CSV",
      "ods_budget",
      "v_budget"
    ],
    "used_by_dashboards": [
      {
        "id": "budget",
        "title": "预算执行",
        "file": "dashboards/09-budget.html",
        "href": "../retail_dashboard.html#budget"
      }
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "budget_id",
        "type": "VARCHAR(50)",
        "desc": "预算ID",
        "business": "预算ID",
        "role": "bk"
      },
      {
        "name": "budget_year",
        "type": "INT",
        "desc": "预算年份",
        "business": "预算年份",
        "role": "attr"
      },
      {
        "name": "budget_month",
        "type": "INT",
        "desc": "预算月份",
        "business": "预算月份",
        "role": "attr"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "expense_type",
        "type": "VARCHAR(30)",
        "desc": "费用类型",
        "business": "费用类型",
        "role": "attr"
      },
      {
        "name": "budget_amount",
        "type": "DECIMAL(15,2)",
        "desc": "预算金额",
        "business": "预算金额",
        "role": "measure"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      }
    ]
  },
  {
    "name": "dim_brand",
    "layer": "DIM",
    "type": "table",
    "purpose": "品牌维度表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_sales_wide",
      "dwd_expense_wide"
    ],
    "lineage": [
      "dim_brand",
      "DWD/DWS 关联"
    ],
    "used_by_dashboards": [
      {
        "id": "brand",
        "title": "品牌分析",
        "file": "dashboards/02-brand.html",
        "href": "../retail_dashboard.html#brand"
      }
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "brand_id",
        "type": "INT",
        "desc": "brand_id",
        "business": "brand_id",
        "role": "bk"
      },
      {
        "name": "brand_code",
        "type": "VARCHAR(20)",
        "desc": "品牌编码",
        "business": "品牌编码",
        "role": "attr"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(50)",
        "desc": "品牌名称",
        "business": "品牌名称",
        "role": "attr"
      },
      {
        "name": "brand_level",
        "type": "VARCHAR(20)",
        "desc": "品牌等级",
        "business": "品牌等级",
        "role": "attr"
      },
      {
        "name": "parent_company",
        "type": "VARCHAR(50)",
        "desc": "所属集团",
        "business": "所属集团",
        "role": "attr"
      },
      {
        "name": "brand_manager",
        "type": "VARCHAR(50)",
        "desc": "品牌经理",
        "business": "品牌经理",
        "role": "attr"
      },
      {
        "name": "launch_date",
        "type": "DATE",
        "desc": "上市日期",
        "business": "上市日期",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "updated_at",
        "type": "DATETIME",
        "desc": "updated_at",
        "business": "updated_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dim_channel",
    "layer": "DIM",
    "type": "table",
    "purpose": "渠道维度表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_sales_wide",
      "dwd_expense_wide"
    ],
    "lineage": [
      "dim_channel",
      "DWD/DWS 关联"
    ],
    "used_by_dashboards": [
      {
        "id": "channel",
        "title": "渠道分析",
        "file": "dashboards/03-channel.html",
        "href": "../retail_dashboard.html#channel"
      }
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "channel_id",
        "type": "INT",
        "desc": "channel_id",
        "business": "channel_id",
        "role": "bk"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(50)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "channel_type",
        "type": "VARCHAR(20)",
        "desc": "渠道类型",
        "business": "渠道类型",
        "role": "attr"
      },
      {
        "name": "parent_channel_id",
        "type": "INT",
        "desc": "上级渠道ID",
        "business": "上级渠道ID",
        "role": "bk"
      },
      {
        "name": "channel_level",
        "type": "INT",
        "desc": "渠道层级",
        "business": "渠道层级",
        "role": "attr"
      },
      {
        "name": "region",
        "type": "VARCHAR(50)",
        "desc": "区域",
        "business": "区域",
        "role": "attr"
      },
      {
        "name": "channel_manager",
        "type": "VARCHAR(50)",
        "desc": "渠道负责人",
        "business": "渠道负责人",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "updated_at",
        "type": "DATETIME",
        "desc": "updated_at",
        "business": "updated_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dim_category",
    "layer": "DIM",
    "type": "table",
    "purpose": "品类维度表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_sales_wide",
      "dwd_inventory_wide"
    ],
    "lineage": [
      "dim_category",
      "DWD/DWS 关联"
    ],
    "used_by_dashboards": [
      {
        "id": "brand",
        "title": "品牌分析",
        "file": "dashboards/02-brand.html",
        "href": "../retail_dashboard.html#brand"
      },
      {
        "id": "inventory",
        "title": "库存分析",
        "file": "dashboards/08-inventory.html",
        "href": "../retail_dashboard.html#inventory"
      }
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "category_id",
        "type": "INT",
        "desc": "category_id",
        "business": "category_id",
        "role": "bk"
      },
      {
        "name": "category_code",
        "type": "VARCHAR(20)",
        "desc": "品类编码",
        "business": "品类编码",
        "role": "attr"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(50)",
        "desc": "品类名称",
        "business": "品类名称",
        "role": "attr"
      },
      {
        "name": "parent_category_id",
        "type": "INT",
        "desc": "上级品类ID",
        "business": "上级品类ID",
        "role": "bk"
      },
      {
        "name": "category_level",
        "type": "INT",
        "desc": "品类层级",
        "business": "品类层级",
        "role": "attr"
      },
      {
        "name": "category_group",
        "type": "VARCHAR(30)",
        "desc": "品类组",
        "business": "品类组",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "updated_at",
        "type": "DATETIME",
        "desc": "updated_at",
        "business": "updated_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dim_store",
    "layer": "DIM",
    "type": "table",
    "purpose": "门店维度表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_sales_wide",
      "dws_store_daily"
    ],
    "lineage": [
      "dim_store",
      "DWD/DWS 关联"
    ],
    "used_by_dashboards": [
      {
        "id": "store",
        "title": "门店分析",
        "file": "dashboards/10-store.html",
        "href": "../retail_dashboard.html#store"
      }
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "store_id",
        "type": "INT",
        "desc": "store_id",
        "business": "store_id",
        "role": "bk"
      },
      {
        "name": "store_code",
        "type": "VARCHAR(20)",
        "desc": "门店编码",
        "business": "门店编码",
        "role": "attr"
      },
      {
        "name": "store_name",
        "type": "VARCHAR(100)",
        "desc": "门店名称",
        "business": "门店名称",
        "role": "attr"
      },
      {
        "name": "region",
        "type": "VARCHAR(50)",
        "desc": "区域",
        "business": "区域",
        "role": "attr"
      },
      {
        "name": "city",
        "type": "VARCHAR(50)",
        "desc": "城市",
        "business": "城市",
        "role": "attr"
      },
      {
        "name": "store_type",
        "type": "VARCHAR(20)",
        "desc": "门店类型",
        "business": "门店类型",
        "role": "attr"
      },
      {
        "name": "store_area",
        "type": "DECIMAL(10,2)",
        "desc": "门店面积",
        "business": "门店面积",
        "role": "attr"
      },
      {
        "name": "open_date",
        "type": "DATE",
        "desc": "开业日期",
        "business": "开业日期",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      },
      {
        "name": "updated_at",
        "type": "DATETIME",
        "desc": "updated_at",
        "business": "updated_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dim_date",
    "layer": "DIM",
    "type": "table",
    "purpose": "日期维度表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dwd_sales_wide"
    ],
    "lineage": [
      "dim_date",
      "DWD/DWS 关联"
    ],
    "used_by_dashboards": [
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      }
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "date_id",
        "type": "INT",
        "desc": "日期ID：YYYYMMDD",
        "business": "日期ID：YYYYMMDD",
        "role": "bk"
      },
      {
        "name": "full_date",
        "type": "DATE",
        "desc": "完整日期",
        "business": "完整日期",
        "role": "attr"
      },
      {
        "name": "year",
        "type": "INT",
        "desc": "年",
        "business": "年",
        "role": "hierarchy"
      },
      {
        "name": "quarter",
        "type": "INT",
        "desc": "季度",
        "business": "季度",
        "role": "hierarchy"
      },
      {
        "name": "month",
        "type": "INT",
        "desc": "月",
        "business": "月",
        "role": "hierarchy"
      },
      {
        "name": "month_name",
        "type": "VARCHAR(10)",
        "desc": "月份名称",
        "business": "月份名称",
        "role": "attr"
      },
      {
        "name": "week_of_year",
        "type": "INT",
        "desc": "年度周数",
        "business": "年度周数",
        "role": "hierarchy"
      },
      {
        "name": "day_of_week",
        "type": "INT",
        "desc": "星期几",
        "business": "星期几",
        "role": "attr"
      },
      {
        "name": "is_weekend",
        "type": "TINYINT(1)",
        "desc": "是否周末",
        "business": "是否周末",
        "role": "attr"
      },
      {
        "name": "is_holiday",
        "type": "TINYINT(1)",
        "desc": "是否节假日",
        "business": "是否节假日",
        "role": "attr"
      },
      {
        "name": "holiday_name",
        "type": "VARCHAR(50)",
        "desc": "节假日名称",
        "business": "节假日名称",
        "role": "attr"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dwd_sales_wide",
    "layer": "DWD",
    "type": "table",
    "purpose": "销售宽表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dws_sales_daily",
      "dws_sales_monthly",
      "v_brand",
      "v_channel"
    ],
    "lineage": [
      "ODS",
      "dwd_sales_wide",
      "dws_sales_daily",
      "dws_sales_monthly"
    ],
    "used_by_dashboards": [
      {
        "id": "brand",
        "title": "品牌分析",
        "file": "dashboards/02-brand.html",
        "href": "../retail_dashboard.html#brand"
      },
      {
        "id": "channel",
        "title": "渠道分析",
        "file": "dashboards/03-channel.html",
        "href": "../retail_dashboard.html#channel"
      },
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      },
      {
        "id": "cvp",
        "title": "本量利分析",
        "file": "dashboards/12-cvp.html",
        "href": "../retail_dashboard.html#cvp"
      }
    ],
    "field_count": 25,
    "fields": [
      {
        "name": "order_id",
        "type": "VARCHAR(50)",
        "desc": "订单编号",
        "business": "订单编号",
        "role": "bk"
      },
      {
        "name": "order_date",
        "type": "DATE",
        "desc": "下单日期",
        "business": "下单日期",
        "role": "attr"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "品牌名称",
        "business": "品牌名称",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(20)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "品类名称",
        "business": "品类名称",
        "role": "attr"
      },
      {
        "name": "store_name",
        "type": "VARCHAR(50)",
        "desc": "门店名称",
        "business": "门店名称",
        "role": "attr"
      },
      {
        "name": "region",
        "type": "VARCHAR(20)",
        "desc": "区域",
        "business": "区域",
        "role": "attr"
      },
      {
        "name": "payment_amount",
        "type": "DECIMAL(15,2)",
        "desc": "实付金额",
        "business": "实付金额",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "cost_amount",
        "type": "DECIMAL(15,2)",
        "desc": "成本金额",
        "business": "成本金额",
        "role": "measure",
        "caliber_id": "cost_of_goods_sold"
      },
      {
        "name": "profit_amount",
        "type": "DECIMAL(15,2)",
        "desc": "利润金额",
        "business": "利润金额",
        "role": "measure"
      },
      {
        "name": "discount_amount",
        "type": "DECIMAL(15,2)",
        "desc": "优惠金额",
        "business": "优惠金额",
        "role": "measure"
      },
      {
        "name": "shipping_fee",
        "type": "DECIMAL(15,2)",
        "desc": "运费",
        "business": "运费",
        "role": "measure"
      },
      {
        "name": "return_flag",
        "type": "TINYINT(1)",
        "desc": "是否退货",
        "business": "是否退货",
        "role": "attr"
      },
      {
        "name": "return_amount",
        "type": "DECIMAL(15,2)",
        "desc": "退货金额",
        "business": "退货金额",
        "role": "measure"
      },
      {
        "name": "return_reason",
        "type": "VARCHAR(200)",
        "desc": "退货原因",
        "business": "退货原因",
        "role": "attr"
      },
      {
        "name": "customer_id",
        "type": "VARCHAR(50)",
        "desc": "客户ID",
        "business": "客户ID",
        "role": "bk"
      },
      {
        "name": "membership_level",
        "type": "VARCHAR(20)",
        "desc": "会员等级",
        "business": "会员等级",
        "role": "attr"
      },
      {
        "name": "sku_id",
        "type": "VARCHAR(50)",
        "desc": "SKU ID",
        "business": "SKU ID",
        "role": "bk"
      },
      {
        "name": "product_name",
        "type": "VARCHAR(100)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "year",
        "type": "INT",
        "desc": "年",
        "business": "年",
        "role": "hierarchy"
      },
      {
        "name": "quarter",
        "type": "INT",
        "desc": "季度",
        "business": "季度",
        "role": "hierarchy"
      },
      {
        "name": "month",
        "type": "INT",
        "desc": "月",
        "business": "月",
        "role": "hierarchy"
      },
      {
        "name": "week_of_year",
        "type": "INT",
        "desc": "年度周数",
        "business": "年度周数",
        "role": "hierarchy"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "bk"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dwd_expense_wide",
    "layer": "DWD",
    "type": "table",
    "purpose": "费用宽表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dws_expense_monthly",
      "v_budget"
    ],
    "lineage": [
      "ODS",
      "dwd_expense_wide",
      "dws_expense_monthly",
      "v_budget"
    ],
    "used_by_dashboards": [
      {
        "id": "budget",
        "title": "预算执行",
        "file": "dashboards/09-budget.html",
        "href": "../retail_dashboard.html#budget"
      }
    ],
    "field_count": 13,
    "fields": [
      {
        "name": "expense_id",
        "type": "VARCHAR(50)",
        "desc": "费用ID",
        "business": "费用ID",
        "role": "bk"
      },
      {
        "name": "expense_date",
        "type": "DATE",
        "desc": "费用发生日期",
        "business": "费用发生日期",
        "role": "attr"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "品牌名称",
        "business": "品牌名称",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(20)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "expense_type",
        "type": "VARCHAR(30)",
        "desc": "费用类型",
        "business": "费用类型",
        "role": "attr"
      },
      {
        "name": "cost_center",
        "type": "VARCHAR(50)",
        "desc": "成本中心",
        "business": "成本中心",
        "role": "measure"
      },
      {
        "name": "expense_owner",
        "type": "VARCHAR(50)",
        "desc": "费用负责人",
        "business": "费用负责人",
        "role": "attr"
      },
      {
        "name": "expense_amount",
        "type": "DECIMAL(15,2)",
        "desc": "费用金额",
        "business": "费用金额",
        "role": "measure"
      },
      {
        "name": "budget_amount",
        "type": "DECIMAL(15,2)",
        "desc": "预算金额",
        "business": "预算金额",
        "role": "measure"
      },
      {
        "name": "year",
        "type": "INT",
        "desc": "年",
        "business": "年",
        "role": "hierarchy"
      },
      {
        "name": "month",
        "type": "INT",
        "desc": "月",
        "business": "月",
        "role": "hierarchy"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dwd_inventory_wide",
    "layer": "DWD",
    "type": "table",
    "purpose": "库存宽表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dws_inventory_daily",
      "v_inventory"
    ],
    "lineage": [
      "ODS",
      "dwd_inventory_wide",
      "dws_inventory_daily",
      "v_inventory"
    ],
    "used_by_dashboards": [
      {
        "id": "inventory",
        "title": "库存分析",
        "file": "dashboards/08-inventory.html",
        "href": "../retail_dashboard.html#inventory"
      }
    ],
    "field_count": 19,
    "fields": [
      {
        "name": "inventory_id",
        "type": "VARCHAR(50)",
        "desc": "库存流水ID",
        "business": "库存流水ID",
        "role": "bk"
      },
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "库存日期",
        "business": "库存日期",
        "role": "attr"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "品牌名称",
        "business": "品牌名称",
        "role": "attr"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "品类名称",
        "business": "品类名称",
        "role": "attr"
      },
      {
        "name": "store_name",
        "type": "VARCHAR(50)",
        "desc": "门店名称",
        "business": "门店名称",
        "role": "attr"
      },
      {
        "name": "sku_id",
        "type": "VARCHAR(50)",
        "desc": "SKU ID",
        "business": "SKU ID",
        "role": "bk"
      },
      {
        "name": "product_name",
        "type": "VARCHAR(100)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "stock_qty",
        "type": "INT",
        "desc": "库存数量",
        "business": "库存数量",
        "role": "measure"
      },
      {
        "name": "stock_amount",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      },
      {
        "name": "unit_cost",
        "type": "DECIMAL(12,2)",
        "desc": "单位成本",
        "business": "单位成本",
        "role": "measure"
      },
      {
        "name": "inbound_qty",
        "type": "INT",
        "desc": "入库数量",
        "business": "入库数量",
        "role": "measure"
      },
      {
        "name": "outbound_qty",
        "type": "INT",
        "desc": "出库数量",
        "business": "出库数量",
        "role": "measure"
      },
      {
        "name": "transfer_qty",
        "type": "INT",
        "desc": "调拨数量",
        "business": "调拨数量",
        "role": "measure"
      },
      {
        "name": "days_in_stock",
        "type": "INT",
        "desc": "在库天数",
        "business": "在库天数",
        "role": "attr"
      },
      {
        "name": "inventory_age",
        "type": "VARCHAR(20)",
        "desc": "库龄",
        "business": "库龄",
        "role": "attr"
      },
      {
        "name": "year",
        "type": "INT",
        "desc": "年",
        "business": "年",
        "role": "hierarchy"
      },
      {
        "name": "month",
        "type": "INT",
        "desc": "月",
        "business": "月",
        "role": "hierarchy"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(50)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "bk"
      },
      {
        "name": "created_at",
        "type": "DATETIME",
        "desc": "created_at",
        "business": "created_at",
        "role": "audit"
      }
    ]
  },
  {
    "name": "dws_sales_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "日销售汇总",
    "source": "sql6_portfolio_model",
    "downstream": [
      "dws_sales_monthly",
      "v_overview",
      "v_dupont"
    ],
    "lineage": [
      "DWD",
      "dws_sales_daily",
      "dws_sales_monthly",
      "v_overview"
    ],
    "used_by_dashboards": [
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      },
      {
        "id": "brand",
        "title": "品牌分析",
        "file": "dashboards/02-brand.html",
        "href": "../retail_dashboard.html#brand"
      },
      {
        "id": "channel",
        "title": "渠道分析",
        "file": "dashboards/03-channel.html",
        "href": "../retail_dashboard.html#channel"
      },
      {
        "id": "store",
        "title": "门店分析",
        "file": "dashboards/10-store.html",
        "href": "../retail_dashboard.html#store"
      }
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "pk"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "brand_name",
        "business": "brand_name",
        "role": "pk"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(20)",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "pk"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "category_name",
        "business": "category_name",
        "role": "pk"
      },
      {
        "name": "gmv",
        "type": "DECIMAL(15,2)",
        "desc": "GMV",
        "business": "GMV",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "revenue",
        "type": "DECIMAL(15,2)",
        "desc": "净收入",
        "business": "净收入",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "profit",
        "type": "DECIMAL(15,2)",
        "desc": "利润",
        "business": "利润",
        "role": "measure"
      },
      {
        "name": "order_count",
        "type": "INT",
        "desc": "订单数",
        "business": "订单数",
        "role": "measure",
        "caliber_id": "transaction_count"
      },
      {
        "name": "return_amount",
        "type": "DECIMAL(15,2)",
        "desc": "退货金额",
        "business": "退货金额",
        "role": "measure"
      },
      {
        "name": "return_count",
        "type": "INT",
        "desc": "退货订单数",
        "business": "退货订单数",
        "role": "measure"
      }
    ]
  },
  {
    "name": "dws_sales_monthly",
    "layer": "DWS",
    "type": "table",
    "purpose": "月销售汇总",
    "source": "sql6_portfolio_model",
    "downstream": [
      "v_overview",
      "v_brand",
      "v_channel",
      "v_income_statement",
      "v_dupont"
    ],
    "lineage": [
      "DWD",
      "dws_sales_monthly",
      "v_overview",
      "v_brand"
    ],
    "used_by_dashboards": [
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      },
      {
        "id": "brand",
        "title": "品牌分析",
        "file": "dashboards/02-brand.html",
        "href": "../retail_dashboard.html#brand"
      },
      {
        "id": "channel",
        "title": "渠道分析",
        "file": "dashboards/03-channel.html",
        "href": "../retail_dashboard.html#channel"
      },
      {
        "id": "financial",
        "title": "三大报表",
        "file": "dashboards/04-financial.html",
        "href": "../retail_dashboard.html#financial"
      },
      {
        "id": "dupont",
        "title": "杜邦分析",
        "file": "dashboards/05-dupont.html",
        "href": "../retail_dashboard.html#dupont"
      },
      {
        "id": "cvp",
        "title": "本量利分析",
        "file": "dashboards/12-cvp.html",
        "href": "../retail_dashboard.html#cvp"
      }
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "VARCHAR(7)",
        "desc": "snapshot_month",
        "business": "snapshot_month",
        "role": "pk"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "brand_name",
        "business": "brand_name",
        "role": "pk"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(20)",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "pk"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "category_name",
        "business": "category_name",
        "role": "pk"
      },
      {
        "name": "revenue",
        "type": "DECIMAL(15,2)",
        "desc": "revenue",
        "business": "revenue",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "profit",
        "type": "DECIMAL(15,2)",
        "desc": "profit",
        "business": "profit",
        "role": "measure"
      },
      {
        "name": "order_count",
        "type": "INT",
        "desc": "order_count",
        "business": "order_count",
        "role": "measure",
        "caliber_id": "transaction_count"
      },
      {
        "name": "return_amount",
        "type": "DECIMAL(15,2)",
        "desc": "return_amount",
        "business": "return_amount",
        "role": "measure"
      }
    ]
  },
  {
    "name": "dws_expense_monthly",
    "layer": "DWS",
    "type": "table",
    "purpose": "月费用汇总",
    "source": "sql6_portfolio_model",
    "downstream": [
      "v_budget"
    ],
    "lineage": [
      "DWD",
      "dws_expense_monthly",
      "v_budget"
    ],
    "used_by_dashboards": [
      {
        "id": "budget",
        "title": "预算执行",
        "file": "dashboards/09-budget.html",
        "href": "../retail_dashboard.html#budget"
      },
      {
        "id": "financial",
        "title": "三大报表",
        "file": "dashboards/04-financial.html",
        "href": "../retail_dashboard.html#financial"
      }
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "VARCHAR(7)",
        "desc": "snapshot_month",
        "business": "snapshot_month",
        "role": "pk"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "brand_name",
        "business": "brand_name",
        "role": "pk"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(20)",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "pk"
      },
      {
        "name": "expense_type",
        "type": "VARCHAR(30)",
        "desc": "expense_type",
        "business": "expense_type",
        "role": "pk"
      },
      {
        "name": "expense_amount",
        "type": "DECIMAL(15,2)",
        "desc": "expense_amount",
        "business": "expense_amount",
        "role": "measure"
      },
      {
        "name": "budget_amount",
        "type": "DECIMAL(15,2)",
        "desc": "budget_amount",
        "business": "budget_amount",
        "role": "measure"
      }
    ]
  },
  {
    "name": "dws_inventory_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "日库存汇总",
    "source": "sql6_portfolio_model",
    "downstream": [
      "v_inventory",
      "v_dupont"
    ],
    "lineage": [
      "DWD",
      "dws_inventory_daily",
      "v_inventory",
      "v_dupont"
    ],
    "used_by_dashboards": [
      {
        "id": "inventory",
        "title": "库存分析",
        "file": "dashboards/08-inventory.html",
        "href": "../retail_dashboard.html#inventory"
      },
      {
        "id": "dupont",
        "title": "杜邦分析",
        "file": "dashboards/05-dupont.html",
        "href": "../retail_dashboard.html#dupont"
      }
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "pk"
      },
      {
        "name": "brand_name",
        "type": "VARCHAR(30)",
        "desc": "brand_name",
        "business": "brand_name",
        "role": "pk"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "category_name",
        "business": "category_name",
        "role": "pk"
      },
      {
        "name": "store_name",
        "type": "VARCHAR(50)",
        "desc": "store_name",
        "business": "store_name",
        "role": "pk"
      },
      {
        "name": "stock_amount",
        "type": "DECIMAL(15,2)",
        "desc": "stock_amount",
        "business": "stock_amount",
        "role": "measure"
      },
      {
        "name": "stock_qty",
        "type": "INT",
        "desc": "stock_qty",
        "business": "stock_qty",
        "role": "measure"
      },
      {
        "name": "turnover_days",
        "type": "DECIMAL(10,2)",
        "desc": "周转天数",
        "business": "周转天数",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dws_store_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "日门店汇总·快照表",
    "source": "sql6_portfolio_model",
    "downstream": [
      "经营总览 API store_top5"
    ],
    "lineage": [
      "DWD",
      "dws_store_daily",
      "经营总览 API store_top5"
    ],
    "used_by_dashboards": [
      {
        "id": "store",
        "title": "门店分析",
        "file": "dashboards/10-store.html",
        "href": "../retail_dashboard.html#store"
      },
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      }
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "pk"
      },
      {
        "name": "store_name",
        "type": "VARCHAR(50)",
        "desc": "store_name",
        "business": "store_name",
        "role": "pk"
      },
      {
        "name": "region",
        "type": "VARCHAR(20)",
        "desc": "region",
        "business": "region",
        "role": "attr"
      },
      {
        "name": "revenue",
        "type": "DECIMAL(15,2)",
        "desc": "revenue",
        "business": "revenue",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "profit",
        "type": "DECIMAL(15,2)",
        "desc": "profit",
        "business": "profit",
        "role": "measure"
      },
      {
        "name": "pingsiao",
        "type": "DECIMAL(10,2)",
        "desc": "坪效",
        "business": "坪效",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_overview",
    "layer": "ADS",
    "type": "view",
    "purpose": "经营总览 KPI",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_overview",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "overview",
        "title": "经营总览",
        "file": "dashboards/01-overview.html",
        "href": "../retail_dashboard.html#overview"
      },
      {
        "id": "store",
        "title": "门店分析",
        "file": "dashboards/10-store.html",
        "href": "../retail_dashboard.html#store"
      }
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "total_revenue",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "total_profit",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "gross_margin_rate",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "return_rate",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "total_orders",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_brand",
    "layer": "ADS",
    "type": "view",
    "purpose": "品牌分析",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_brand",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "brand",
        "title": "品牌分析",
        "file": "dashboards/02-brand.html",
        "href": "../retail_dashboard.html#brand"
      }
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "brand_revenue",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "brand_profit",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "brand_margin_rate",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "revenue_share",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_channel",
    "layer": "ADS",
    "type": "view",
    "purpose": "渠道分析",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_channel",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "channel",
        "title": "渠道分析",
        "file": "dashboards/03-channel.html",
        "href": "../retail_dashboard.html#channel"
      }
    ],
    "field_count": 3,
    "fields": [
      {
        "name": "channel_revenue",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "channel_profit",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "channel_margin_rate",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_income_statement",
    "layer": "ADS",
    "type": "view",
    "purpose": "利润表视图",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_income_statement",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "financial",
        "title": "三大报表",
        "file": "dashboards/04-financial.html",
        "href": "../retail_dashboard.html#financial"
      },
      {
        "id": "profit-quality",
        "title": "利润质量",
        "file": "dashboards/11-profit-quality.html",
        "href": "../retail_dashboard.html#profit-quality"
      }
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "total_revenue",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "total_cost",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "gross_profit",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "gross_profit"
      },
      {
        "name": "gross_margin",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "gross_margin"
      }
    ]
  },
  {
    "name": "v_dupont",
    "layer": "ADS",
    "type": "view",
    "purpose": "杜邦 ROE 分解",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_dupont",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "dupont",
        "title": "杜邦分析",
        "file": "dashboards/05-dupont.html",
        "href": "../retail_dashboard.html#dupont"
      }
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "net_profit_margin",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "net_profit_margin"
      },
      {
        "name": "asset_turnover",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "asset_turnover"
      },
      {
        "name": "equity_multiplier",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr",
        "caliber_id": "equity_multiplier"
      },
      {
        "name": "roe",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "roe"
      },
      {
        "name": "revenue",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "revenue"
      },
      {
        "name": "net_profit",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "net_profit"
      },
      {
        "name": "expense_amount",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_balance_sheet",
    "layer": "ADS",
    "type": "view",
    "purpose": "资产负债表视图",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_balance_sheet",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "financial",
        "title": "三大报表",
        "file": "dashboards/04-financial.html",
        "href": "../retail_dashboard.html#financial"
      }
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "SELECT",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "snapshot_month",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "brand_name",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "cash",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "accounts_receivable",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "inventory",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "fixed_assets",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "total_assets",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "accounts_payable",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "debt",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "total_liabilities",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "equity",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_cashflow",
    "layer": "ADS",
    "type": "view",
    "purpose": "现金流量视图",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_cashflow",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "cashflow",
        "title": "现金流分析",
        "file": "dashboards/06-cashflow.html",
        "href": "../retail_dashboard.html#cashflow"
      },
      {
        "id": "profit-quality",
        "title": "利润质量",
        "file": "dashboards/11-profit-quality.html",
        "href": "../retail_dashboard.html#profit-quality"
      }
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "total_inflow",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "total_outflow",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "profit_to_cash_ratio",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "net_profit",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure",
        "caliber_id": "net_profit"
      },
      {
        "name": "expense_amount",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_cashflow_statement",
    "layer": "ADS",
    "type": "view",
    "purpose": "现金流量表视图",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_cashflow_statement",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "cashflow",
        "title": "现金流分析",
        "file": "dashboards/06-cashflow.html",
        "href": "../retail_dashboard.html#cashflow"
      }
    ],
    "field_count": 2,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "metric",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_tax_analysis",
    "layer": "ADS",
    "type": "view",
    "purpose": "税务分析视图",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_tax_analysis",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "tax",
        "title": "税务分析",
        "file": "dashboards/07-tax.html",
        "href": "../retail_dashboard.html#tax"
      }
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "month_id",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "industry_avg_tax_rate",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "tax_rate_gap",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "tax_burden_status",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_budget",
    "layer": "ADS",
    "type": "view",
    "purpose": "预算执行",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_budget",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "budget",
        "title": "预算执行",
        "file": "dashboards/09-budget.html",
        "href": "../retail_dashboard.html#budget"
      }
    ],
    "field_count": 1,
    "fields": [
      {
        "name": "variance",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_inventory",
    "layer": "ADS",
    "type": "view",
    "purpose": "库存周转监控",
    "source": "sql6_portfolio_model",
    "downstream": [],
    "lineage": [
      "DWS",
      "v_inventory",
      "看板/API"
    ],
    "used_by_dashboards": [
      {
        "id": "inventory",
        "title": "库存分析",
        "file": "dashboards/08-inventory.html",
        "href": "../retail_dashboard.html#inventory"
      }
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "total_stock",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "turnover_days",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "measure"
      },
      {
        "name": "month",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      },
      {
        "name": "daily_sales",
        "type": "DERIVED",
        "desc": "派生字段",
        "business": "派生字段",
        "role": "attr"
      }
    ]
  }
];

window.WAREHOUSE_FIELD_OVERVIEW = [
  {
    "layer": "ODS",
    "table_name": "ods_orders",
    "field_count": 20,
    "target_range": "15-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_payment",
    "field_count": 11,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "ODS",
    "table_name": "ods_purchase",
    "field_count": 16,
    "target_range": "15-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_inventory",
    "field_count": 14,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "ODS",
    "table_name": "ods_expense",
    "field_count": 12,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "ODS",
    "table_name": "ods_store_pnl",
    "field_count": 11,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "ODS",
    "table_name": "ods_ad_cost",
    "field_count": 11,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "ODS",
    "table_name": "ods_budget",
    "field_count": 9,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "DIM",
    "table_name": "dim_brand",
    "field_count": 9,
    "target_range": "8-12",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_channel",
    "field_count": 10,
    "target_range": "8-12",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_category",
    "field_count": 8,
    "target_range": "8-12",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_store",
    "field_count": 10,
    "target_range": "8-12",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_date",
    "field_count": 12,
    "target_range": "8-12",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_sales_wide",
    "field_count": 25,
    "target_range": "15-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_expense_wide",
    "field_count": 13,
    "target_range": "15-25",
    "quality_status": "参考"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_inventory_wide",
    "field_count": 19,
    "target_range": "15-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_sales_daily",
    "field_count": 10,
    "target_range": "8-15",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_sales_monthly",
    "field_count": 8,
    "target_range": "8-15",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_expense_monthly",
    "field_count": 6,
    "target_range": "8-15",
    "quality_status": "参考"
  },
  {
    "layer": "DWS",
    "table_name": "dws_inventory_daily",
    "field_count": 7,
    "target_range": "8-15",
    "quality_status": "参考"
  },
  {
    "layer": "DWS",
    "table_name": "dws_store_daily",
    "field_count": 6,
    "target_range": "8-15",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_overview",
    "field_count": 5,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_brand",
    "field_count": 4,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_channel",
    "field_count": 3,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_income_statement",
    "field_count": 4,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_dupont",
    "field_count": 7,
    "target_range": "6-12",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_balance_sheet",
    "field_count": 12,
    "target_range": "6-12",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_cashflow",
    "field_count": 5,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_cashflow_statement",
    "field_count": 2,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_tax_analysis",
    "field_count": 4,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_budget",
    "field_count": 1,
    "target_range": "6-12",
    "quality_status": "参考"
  },
  {
    "layer": "ADS",
    "table_name": "v_inventory",
    "field_count": 5,
    "target_range": "6-12",
    "quality_status": "参考"
  }
];

window.FIELD_LINEAGE = {
  "ods_orders.order_id": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.order_id"
  ],
  "ods_orders.order_date": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.order_date"
  ],
  "ods_orders.order_amount": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.order_amount"
  ],
  "ods_orders.payment_amount": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.payment_amount"
  ],
  "ods_orders.cost_amount": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.cost_amount"
  ],
  "ods_orders.discount_amount": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.discount_amount"
  ],
  "ods_orders.shipping_fee": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.shipping_fee"
  ],
  "ods_orders.brand_code": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.brand_code"
  ],
  "ods_orders.channel_code": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.channel_code"
  ],
  "ods_orders.category_code": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.category_code"
  ],
  "ods_orders.store_code": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.store_code"
  ],
  "ods_orders.customer_id": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.customer_id"
  ],
  "ods_orders.sku_code": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.sku_code"
  ],
  "ods_orders.order_status": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.order_status"
  ],
  "ods_orders.return_flag": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.return_flag"
  ],
  "ods_orders.return_amount": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.return_amount"
  ],
  "ods_orders.return_reason": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.return_reason"
  ],
  "ods_orders.created_at": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.created_at"
  ],
  "ods_orders.updated_at": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.updated_at"
  ],
  "ods_orders.etl_batch_id": [
    "ERP/CSV",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_daily",
    "ods_orders.etl_batch_id"
  ],
  "ods_payment.payment_id": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.payment_id"
  ],
  "ods_payment.order_id": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.order_id"
  ],
  "ods_payment.payment_date": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.payment_date"
  ],
  "ods_payment.payment_amount": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.payment_amount"
  ],
  "ods_payment.payment_method": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.payment_method"
  ],
  "ods_payment.payment_status": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.payment_status"
  ],
  "ods_payment.transaction_id": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.transaction_id"
  ],
  "ods_payment.brand_code": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.brand_code"
  ],
  "ods_payment.channel_code": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.channel_code"
  ],
  "ods_payment.created_at": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.created_at"
  ],
  "ods_payment.etl_batch_id": [
    "ERP/CSV",
    "ods_payment",
    "v_cashflow",
    "ods_payment.etl_batch_id"
  ],
  "ods_purchase.purchase_id": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.purchase_id"
  ],
  "ods_purchase.purchase_date": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.purchase_date"
  ],
  "ods_purchase.supplier_code": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.supplier_code"
  ],
  "ods_purchase.supplier_name": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.supplier_name"
  ],
  "ods_purchase.brand_code": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.brand_code"
  ],
  "ods_purchase.category_code": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.category_code"
  ],
  "ods_purchase.purchase_amount": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.purchase_amount"
  ],
  "ods_purchase.purchase_qty": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.purchase_qty"
  ],
  "ods_purchase.unit_price": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.unit_price"
  ],
  "ods_purchase.receipt_flag": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.receipt_flag"
  ],
  "ods_purchase.receipt_date": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.receipt_date"
  ],
  "ods_purchase.receipt_qty": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.receipt_qty"
  ],
  "ods_purchase.invoice_flag": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.invoice_flag"
  ],
  "ods_purchase.invoice_amount": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.invoice_amount"
  ],
  "ods_purchase.created_at": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.created_at"
  ],
  "ods_purchase.etl_batch_id": [
    "ERP/CSV",
    "ods_purchase",
    "dwd_inventory_wide",
    "ods_purchase.etl_batch_id"
  ],
  "ods_inventory.inventory_id": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.inventory_id"
  ],
  "ods_inventory.snapshot_date": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.snapshot_date"
  ],
  "ods_inventory.sku_code": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.sku_code"
  ],
  "ods_inventory.brand_code": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.brand_code"
  ],
  "ods_inventory.category_code": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.category_code"
  ],
  "ods_inventory.store_code": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.store_code"
  ],
  "ods_inventory.stock_qty": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.stock_qty"
  ],
  "ods_inventory.stock_amount": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.stock_amount"
  ],
  "ods_inventory.unit_cost": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.unit_cost"
  ],
  "ods_inventory.inbound_qty": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.inbound_qty"
  ],
  "ods_inventory.outbound_qty": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.outbound_qty"
  ],
  "ods_inventory.transfer_qty": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.transfer_qty"
  ],
  "ods_inventory.created_at": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.created_at"
  ],
  "ods_inventory.etl_batch_id": [
    "ERP/CSV",
    "ods_inventory",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "ods_inventory.etl_batch_id"
  ],
  "ods_expense.expense_id": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.expense_id"
  ],
  "ods_expense.expense_date": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.expense_date"
  ],
  "ods_expense.expense_type": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.expense_type"
  ],
  "ods_expense.brand_code": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.brand_code"
  ],
  "ods_expense.channel_code": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.channel_code"
  ],
  "ods_expense.store_code": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.store_code"
  ],
  "ods_expense.expense_amount": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.expense_amount"
  ],
  "ods_expense.budget_amount": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.budget_amount"
  ],
  "ods_expense.cost_center": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.cost_center"
  ],
  "ods_expense.expense_owner": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.expense_owner"
  ],
  "ods_expense.created_at": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.created_at"
  ],
  "ods_expense.etl_batch_id": [
    "ERP/CSV",
    "ods_expense",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "ods_expense.etl_batch_id"
  ],
  "ods_store_pnl.store_code": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.store_code"
  ],
  "ods_store_pnl.store_name": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.store_name"
  ],
  "ods_store_pnl.region": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.region"
  ],
  "ods_store_pnl.city": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.city"
  ],
  "ods_store_pnl.store_area": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.store_area"
  ],
  "ods_store_pnl.open_date": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.open_date"
  ],
  "ods_store_pnl.monthly_revenue": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.monthly_revenue"
  ],
  "ods_store_pnl.monthly_profit": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.monthly_profit"
  ],
  "ods_store_pnl.pingsiao": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.pingsiao"
  ],
  "ods_store_pnl.created_at": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.created_at"
  ],
  "ods_store_pnl.etl_batch_id": [
    "ERP/CSV",
    "ods_store_pnl",
    "dws_store_daily",
    "ods_store_pnl.etl_batch_id"
  ],
  "ods_ad_cost.ad_id": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.ad_id"
  ],
  "ods_ad_cost.ad_date": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.ad_date"
  ],
  "ods_ad_cost.brand_code": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.brand_code"
  ],
  "ods_ad_cost.channel_code": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.channel_code"
  ],
  "ods_ad_cost.platform": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.platform"
  ],
  "ods_ad_cost.ad_cost": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.ad_cost"
  ],
  "ods_ad_cost.impressions": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.impressions"
  ],
  "ods_ad_cost.clicks": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.clicks"
  ],
  "ods_ad_cost.conversions": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.conversions"
  ],
  "ods_ad_cost.created_at": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.created_at"
  ],
  "ods_ad_cost.etl_batch_id": [
    "ERP/CSV",
    "ods_ad_cost",
    "dws_expense_monthly",
    "ods_ad_cost.etl_batch_id"
  ],
  "ods_budget.budget_id": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.budget_id"
  ],
  "ods_budget.budget_year": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.budget_year"
  ],
  "ods_budget.budget_month": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.budget_month"
  ],
  "ods_budget.brand_code": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.brand_code"
  ],
  "ods_budget.channel_code": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.channel_code"
  ],
  "ods_budget.expense_type": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.expense_type"
  ],
  "ods_budget.budget_amount": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.budget_amount"
  ],
  "ods_budget.created_at": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.created_at"
  ],
  "ods_budget.etl_batch_id": [
    "ERP/CSV",
    "ods_budget",
    "v_budget",
    "ods_budget.etl_batch_id"
  ],
  "dim_brand.brand_id": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.brand_id"
  ],
  "dim_brand.brand_code": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.brand_code"
  ],
  "dim_brand.brand_name": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.brand_name"
  ],
  "dim_brand.brand_level": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.brand_level"
  ],
  "dim_brand.parent_company": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.parent_company"
  ],
  "dim_brand.brand_manager": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.brand_manager"
  ],
  "dim_brand.launch_date": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.launch_date"
  ],
  "dim_brand.created_at": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.created_at"
  ],
  "dim_brand.updated_at": [
    "dim_brand",
    "DWD/DWS 关联",
    "dim_brand.updated_at"
  ],
  "dim_channel.channel_id": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.channel_id"
  ],
  "dim_channel.channel_code": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.channel_code"
  ],
  "dim_channel.channel_name": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.channel_name"
  ],
  "dim_channel.channel_type": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.channel_type"
  ],
  "dim_channel.parent_channel_id": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.parent_channel_id"
  ],
  "dim_channel.channel_level": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.channel_level"
  ],
  "dim_channel.region": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.region"
  ],
  "dim_channel.channel_manager": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.channel_manager"
  ],
  "dim_channel.created_at": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.created_at"
  ],
  "dim_channel.updated_at": [
    "dim_channel",
    "DWD/DWS 关联",
    "dim_channel.updated_at"
  ],
  "dim_category.category_id": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.category_id"
  ],
  "dim_category.category_code": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.category_code"
  ],
  "dim_category.category_name": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.category_name"
  ],
  "dim_category.parent_category_id": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.parent_category_id"
  ],
  "dim_category.category_level": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.category_level"
  ],
  "dim_category.category_group": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.category_group"
  ],
  "dim_category.created_at": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.created_at"
  ],
  "dim_category.updated_at": [
    "dim_category",
    "DWD/DWS 关联",
    "dim_category.updated_at"
  ],
  "dim_store.store_id": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.store_id"
  ],
  "dim_store.store_code": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.store_code"
  ],
  "dim_store.store_name": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.store_name"
  ],
  "dim_store.region": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.region"
  ],
  "dim_store.city": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.city"
  ],
  "dim_store.store_type": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.store_type"
  ],
  "dim_store.store_area": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.store_area"
  ],
  "dim_store.open_date": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.open_date"
  ],
  "dim_store.created_at": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.created_at"
  ],
  "dim_store.updated_at": [
    "dim_store",
    "DWD/DWS 关联",
    "dim_store.updated_at"
  ],
  "dim_date.date_id": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.date_id"
  ],
  "dim_date.full_date": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.full_date"
  ],
  "dim_date.year": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.year"
  ],
  "dim_date.quarter": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.quarter"
  ],
  "dim_date.month": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.month"
  ],
  "dim_date.month_name": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.month_name"
  ],
  "dim_date.week_of_year": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.week_of_year"
  ],
  "dim_date.day_of_week": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.day_of_week"
  ],
  "dim_date.is_weekend": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.is_weekend"
  ],
  "dim_date.is_holiday": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.is_holiday"
  ],
  "dim_date.holiday_name": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.holiday_name"
  ],
  "dim_date.created_at": [
    "dim_date",
    "DWD/DWS 关联",
    "dim_date.created_at"
  ],
  "dwd_sales_wide.order_id": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.order_id"
  ],
  "dwd_sales_wide.order_date": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.order_date"
  ],
  "dwd_sales_wide.brand_name": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.brand_name"
  ],
  "dwd_sales_wide.channel_name": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.channel_name"
  ],
  "dwd_sales_wide.category_name": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.category_name"
  ],
  "dwd_sales_wide.store_name": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.store_name"
  ],
  "dwd_sales_wide.region": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.region"
  ],
  "dwd_sales_wide.payment_amount": [
    "ERP SO",
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_monthly",
    "v_overview",
    "dwd_sales_wide.payment_amount"
  ],
  "dwd_sales_wide.cost_amount": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.cost_amount"
  ],
  "dwd_sales_wide.profit_amount": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.profit_amount"
  ],
  "dwd_sales_wide.discount_amount": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.discount_amount"
  ],
  "dwd_sales_wide.shipping_fee": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.shipping_fee"
  ],
  "dwd_sales_wide.return_flag": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.return_flag"
  ],
  "dwd_sales_wide.return_amount": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.return_amount"
  ],
  "dwd_sales_wide.return_reason": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.return_reason"
  ],
  "dwd_sales_wide.customer_id": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.customer_id"
  ],
  "dwd_sales_wide.membership_level": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.membership_level"
  ],
  "dwd_sales_wide.sku_id": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.sku_id"
  ],
  "dwd_sales_wide.product_name": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.product_name"
  ],
  "dwd_sales_wide.year": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.year"
  ],
  "dwd_sales_wide.quarter": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.quarter"
  ],
  "dwd_sales_wide.month": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.month"
  ],
  "dwd_sales_wide.week_of_year": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.week_of_year"
  ],
  "dwd_sales_wide.etl_batch_id": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.etl_batch_id"
  ],
  "dwd_sales_wide.created_at": [
    "ODS",
    "dwd_sales_wide",
    "dws_sales_daily",
    "dws_sales_monthly",
    "dwd_sales_wide.created_at"
  ],
  "dwd_expense_wide.expense_id": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.expense_id"
  ],
  "dwd_expense_wide.expense_date": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.expense_date"
  ],
  "dwd_expense_wide.brand_name": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.brand_name"
  ],
  "dwd_expense_wide.channel_name": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.channel_name"
  ],
  "dwd_expense_wide.expense_type": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.expense_type"
  ],
  "dwd_expense_wide.cost_center": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.cost_center"
  ],
  "dwd_expense_wide.expense_owner": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.expense_owner"
  ],
  "dwd_expense_wide.expense_amount": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.expense_amount"
  ],
  "dwd_expense_wide.budget_amount": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.budget_amount"
  ],
  "dwd_expense_wide.year": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.year"
  ],
  "dwd_expense_wide.month": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.month"
  ],
  "dwd_expense_wide.etl_batch_id": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.etl_batch_id"
  ],
  "dwd_expense_wide.created_at": [
    "ODS",
    "dwd_expense_wide",
    "dws_expense_monthly",
    "v_budget",
    "dwd_expense_wide.created_at"
  ],
  "dwd_inventory_wide.inventory_id": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.inventory_id"
  ],
  "dwd_inventory_wide.snapshot_date": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.snapshot_date"
  ],
  "dwd_inventory_wide.brand_name": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.brand_name"
  ],
  "dwd_inventory_wide.category_name": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.category_name"
  ],
  "dwd_inventory_wide.store_name": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.store_name"
  ],
  "dwd_inventory_wide.sku_id": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.sku_id"
  ],
  "dwd_inventory_wide.product_name": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.product_name"
  ],
  "dwd_inventory_wide.stock_qty": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.stock_qty"
  ],
  "dwd_inventory_wide.stock_amount": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.stock_amount"
  ],
  "dwd_inventory_wide.unit_cost": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.unit_cost"
  ],
  "dwd_inventory_wide.inbound_qty": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.inbound_qty"
  ],
  "dwd_inventory_wide.outbound_qty": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.outbound_qty"
  ],
  "dwd_inventory_wide.transfer_qty": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.transfer_qty"
  ],
  "dwd_inventory_wide.days_in_stock": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.days_in_stock"
  ],
  "dwd_inventory_wide.inventory_age": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.inventory_age"
  ],
  "dwd_inventory_wide.year": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.year"
  ],
  "dwd_inventory_wide.month": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.month"
  ],
  "dwd_inventory_wide.etl_batch_id": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.etl_batch_id"
  ],
  "dwd_inventory_wide.created_at": [
    "ODS",
    "dwd_inventory_wide",
    "dws_inventory_daily",
    "v_inventory",
    "dwd_inventory_wide.created_at"
  ],
  "dws_sales_daily.snapshot_date": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.snapshot_date"
  ],
  "dws_sales_daily.brand_name": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.brand_name"
  ],
  "dws_sales_daily.channel_name": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.channel_name"
  ],
  "dws_sales_daily.category_name": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.category_name"
  ],
  "dws_sales_daily.gmv": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.gmv"
  ],
  "dws_sales_daily.revenue": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.revenue"
  ],
  "dws_sales_daily.profit": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.profit"
  ],
  "dws_sales_daily.order_count": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.order_count"
  ],
  "dws_sales_daily.return_amount": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.return_amount"
  ],
  "dws_sales_daily.return_count": [
    "DWD",
    "dws_sales_daily",
    "dws_sales_monthly",
    "v_overview",
    "dws_sales_daily.return_count"
  ],
  "dws_sales_monthly.snapshot_month": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.snapshot_month"
  ],
  "dws_sales_monthly.brand_name": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.brand_name"
  ],
  "dws_sales_monthly.channel_name": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.channel_name"
  ],
  "dws_sales_monthly.category_name": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.category_name"
  ],
  "dws_sales_monthly.revenue": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.revenue"
  ],
  "dws_sales_monthly.profit": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.profit"
  ],
  "dws_sales_monthly.order_count": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.order_count"
  ],
  "dws_sales_monthly.return_amount": [
    "DWD",
    "dws_sales_monthly",
    "v_overview",
    "v_brand",
    "dws_sales_monthly.return_amount"
  ],
  "dws_expense_monthly.snapshot_month": [
    "DWD",
    "dws_expense_monthly",
    "v_budget",
    "dws_expense_monthly.snapshot_month"
  ],
  "dws_expense_monthly.brand_name": [
    "DWD",
    "dws_expense_monthly",
    "v_budget",
    "dws_expense_monthly.brand_name"
  ],
  "dws_expense_monthly.channel_name": [
    "DWD",
    "dws_expense_monthly",
    "v_budget",
    "dws_expense_monthly.channel_name"
  ],
  "dws_expense_monthly.expense_type": [
    "DWD",
    "dws_expense_monthly",
    "v_budget",
    "dws_expense_monthly.expense_type"
  ],
  "dws_expense_monthly.expense_amount": [
    "DWD",
    "dws_expense_monthly",
    "v_budget",
    "dws_expense_monthly.expense_amount"
  ],
  "dws_expense_monthly.budget_amount": [
    "DWD",
    "dws_expense_monthly",
    "v_budget",
    "dws_expense_monthly.budget_amount"
  ],
  "dws_inventory_daily.snapshot_date": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.snapshot_date"
  ],
  "dws_inventory_daily.brand_name": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.brand_name"
  ],
  "dws_inventory_daily.category_name": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.category_name"
  ],
  "dws_inventory_daily.store_name": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.store_name"
  ],
  "dws_inventory_daily.stock_amount": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.stock_amount"
  ],
  "dws_inventory_daily.stock_qty": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.stock_qty"
  ],
  "dws_inventory_daily.turnover_days": [
    "DWD",
    "dws_inventory_daily",
    "v_inventory",
    "v_dupont",
    "dws_inventory_daily.turnover_days"
  ],
  "dws_store_daily.snapshot_date": [
    "DWD",
    "dws_store_daily",
    "经营总览 API store_top5",
    "dws_store_daily.snapshot_date"
  ],
  "dws_store_daily.store_name": [
    "DWD",
    "dws_store_daily",
    "经营总览 API store_top5",
    "dws_store_daily.store_name"
  ],
  "dws_store_daily.region": [
    "DWD",
    "dws_store_daily",
    "经营总览 API store_top5",
    "dws_store_daily.region"
  ],
  "dws_store_daily.revenue": [
    "DWD",
    "dws_store_daily",
    "经营总览 API store_top5",
    "dws_store_daily.revenue"
  ],
  "dws_store_daily.profit": [
    "DWD",
    "dws_store_daily",
    "经营总览 API store_top5",
    "dws_store_daily.profit"
  ],
  "dws_store_daily.pingsiao": [
    "DWD",
    "dws_store_daily",
    "经营总览 API store_top5",
    "dws_store_daily.pingsiao"
  ],
  "v_overview.total_revenue": [
    "ods_orders",
    "dwd_sales_wide",
    "dws_sales_monthly",
    "v_overview",
    "v_overview.total_revenue"
  ],
  "v_overview.total_profit": [
    "DWS",
    "v_overview",
    "看板/API",
    "v_overview.total_profit"
  ],
  "v_overview.gross_margin_rate": [
    "DWS",
    "v_overview",
    "看板/API",
    "v_overview.gross_margin_rate"
  ],
  "v_overview.return_rate": [
    "DWS",
    "v_overview",
    "看板/API",
    "v_overview.return_rate"
  ],
  "v_overview.total_orders": [
    "DWS",
    "v_overview",
    "看板/API",
    "v_overview.total_orders"
  ],
  "v_brand.brand_revenue": [
    "DWS",
    "v_brand",
    "看板/API",
    "v_brand.brand_revenue"
  ],
  "v_brand.brand_profit": [
    "DWS",
    "v_brand",
    "看板/API",
    "v_brand.brand_profit"
  ],
  "v_brand.brand_margin_rate": [
    "DWS",
    "v_brand",
    "看板/API",
    "v_brand.brand_margin_rate"
  ],
  "v_brand.revenue_share": [
    "DWS",
    "v_brand",
    "看板/API",
    "v_brand.revenue_share"
  ],
  "v_channel.channel_revenue": [
    "DWS",
    "v_channel",
    "看板/API",
    "v_channel.channel_revenue"
  ],
  "v_channel.channel_profit": [
    "DWS",
    "v_channel",
    "看板/API",
    "v_channel.channel_profit"
  ],
  "v_channel.channel_margin_rate": [
    "DWS",
    "v_channel",
    "看板/API",
    "v_channel.channel_margin_rate"
  ],
  "v_income_statement.total_revenue": [
    "DWS",
    "v_income_statement",
    "看板/API",
    "v_income_statement.total_revenue"
  ],
  "v_income_statement.total_cost": [
    "DWS",
    "v_income_statement",
    "看板/API",
    "v_income_statement.total_cost"
  ],
  "v_income_statement.gross_profit": [
    "DWS",
    "v_income_statement",
    "看板/API",
    "v_income_statement.gross_profit"
  ],
  "v_income_statement.gross_margin": [
    "DWS",
    "v_income_statement",
    "看板/API",
    "v_income_statement.gross_margin"
  ],
  "v_dupont.net_profit_margin": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.net_profit_margin"
  ],
  "v_dupont.asset_turnover": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.asset_turnover"
  ],
  "v_dupont.equity_multiplier": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.equity_multiplier"
  ],
  "v_dupont.roe": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.roe"
  ],
  "v_dupont.revenue": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.revenue"
  ],
  "v_dupont.net_profit": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.net_profit"
  ],
  "v_dupont.expense_amount": [
    "DWS",
    "v_dupont",
    "看板/API",
    "v_dupont.expense_amount"
  ],
  "v_balance_sheet.SELECT": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.SELECT"
  ],
  "v_balance_sheet.snapshot_month": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.snapshot_month"
  ],
  "v_balance_sheet.brand_name": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.brand_name"
  ],
  "v_balance_sheet.cash": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.cash"
  ],
  "v_balance_sheet.accounts_receivable": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.accounts_receivable"
  ],
  "v_balance_sheet.inventory": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.inventory"
  ],
  "v_balance_sheet.fixed_assets": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.fixed_assets"
  ],
  "v_balance_sheet.total_assets": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.total_assets"
  ],
  "v_balance_sheet.accounts_payable": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.accounts_payable"
  ],
  "v_balance_sheet.debt": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.debt"
  ],
  "v_balance_sheet.total_liabilities": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.total_liabilities"
  ],
  "v_balance_sheet.equity": [
    "DWS",
    "v_balance_sheet",
    "看板/API",
    "v_balance_sheet.equity"
  ],
  "v_cashflow.total_inflow": [
    "DWS",
    "v_cashflow",
    "看板/API",
    "v_cashflow.total_inflow"
  ],
  "v_cashflow.total_outflow": [
    "DWS",
    "v_cashflow",
    "看板/API",
    "v_cashflow.total_outflow"
  ],
  "v_cashflow.profit_to_cash_ratio": [
    "DWS",
    "v_cashflow",
    "看板/API",
    "v_cashflow.profit_to_cash_ratio"
  ],
  "v_cashflow.net_profit": [
    "DWS",
    "v_cashflow",
    "看板/API",
    "v_cashflow.net_profit"
  ],
  "v_cashflow.expense_amount": [
    "DWS",
    "v_cashflow",
    "看板/API",
    "v_cashflow.expense_amount"
  ],
  "v_cashflow_statement.snapshot_month": [
    "DWS",
    "v_cashflow_statement",
    "看板/API",
    "v_cashflow_statement.snapshot_month"
  ],
  "v_cashflow_statement.metric": [
    "DWS",
    "v_cashflow_statement",
    "看板/API",
    "v_cashflow_statement.metric"
  ],
  "v_tax_analysis.month_id": [
    "DWS",
    "v_tax_analysis",
    "看板/API",
    "v_tax_analysis.month_id"
  ],
  "v_tax_analysis.industry_avg_tax_rate": [
    "DWS",
    "v_tax_analysis",
    "看板/API",
    "v_tax_analysis.industry_avg_tax_rate"
  ],
  "v_tax_analysis.tax_rate_gap": [
    "DWS",
    "v_tax_analysis",
    "看板/API",
    "v_tax_analysis.tax_rate_gap"
  ],
  "v_tax_analysis.tax_burden_status": [
    "DWS",
    "v_tax_analysis",
    "看板/API",
    "v_tax_analysis.tax_burden_status"
  ],
  "v_budget.variance": [
    "DWS",
    "v_budget",
    "看板/API",
    "v_budget.variance"
  ],
  "v_inventory.snapshot_month": [
    "DWS",
    "v_inventory",
    "看板/API",
    "v_inventory.snapshot_month"
  ],
  "v_inventory.total_stock": [
    "DWS",
    "v_inventory",
    "看板/API",
    "v_inventory.total_stock"
  ],
  "v_inventory.turnover_days": [
    "DWS",
    "v_inventory",
    "看板/API",
    "v_inventory.turnover_days"
  ],
  "v_inventory.month": [
    "DWS",
    "v_inventory",
    "看板/API",
    "v_inventory.month"
  ],
  "v_inventory.daily_sales": [
    "DWS",
    "v_inventory",
    "看板/API",
    "v_inventory.daily_sales"
  ]
};
