/** internet_analytics 数据字典 · 设备操作日志版 */
window.DATA_DICTIONARY=[
  {
    "name": "ods_device_profile",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·设备档案（一行一设备）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_device_profile"
    ],
    "field_count": 14,
    "fields": [
      {
        "name": "device_id",
        "type": "VARCHAR(32)",
        "desc": "设备唯一ID（机顶盒/OTT）",
        "business": "设备唯一ID（机顶盒/OTT）",
        "role": "fk"
      },
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "绑定用户ID，未登录可为空",
        "business": "绑定用户ID，未登录可为空",
        "role": "fk"
      },
      {
        "name": "device_model",
        "type": "VARCHAR(40)",
        "desc": "设备型号，如 X1-Pro / 4K盒子",
        "business": "设备型号，如 X1-Pro / 4K盒子",
        "role": "attr"
      },
      {
        "name": "chip_platform",
        "type": "VARCHAR(30)",
        "desc": "芯片平台，如 Amlogic S905X4",
        "business": "芯片平台，如 Amlogic S905X4",
        "role": "attr"
      },
      {
        "name": "os_version",
        "type": "VARCHAR(20)",
        "desc": "系统版本",
        "business": "系统版本",
        "role": "attr"
      },
      {
        "name": "firmware_version",
        "type": "VARCHAR(20)",
        "desc": "固件版本",
        "business": "固件版本",
        "role": "attr"
      },
      {
        "name": "mac_hash",
        "type": "VARCHAR(64)",
        "desc": "MAC地址哈希（脱敏）",
        "business": "MAC地址哈希（脱敏）",
        "role": "attr"
      },
      {
        "name": "install_channel",
        "type": "VARCHAR(30)",
        "desc": "首次安装渠道",
        "business": "首次安装渠道",
        "role": "attr"
      },
      {
        "name": "province",
        "type": "VARCHAR(20)",
        "desc": "省份",
        "business": "省份",
        "role": "attr"
      },
      {
        "name": "city_tier",
        "type": "VARCHAR(20)",
        "desc": "城市等级：一线/新一线/二线/三线及以下",
        "business": "城市等级：一线/新一线/二线/三线及以下",
        "role": "attr"
      },
      {
        "name": "first_boot_time",
        "type": "DATETIME",
        "desc": "首次开机时间",
        "business": "首次开机时间",
        "role": "attr"
      },
      {
        "name": "last_boot_time",
        "type": "DATETIME",
        "desc": "最近开机时间",
        "business": "最近开机时间",
        "role": "attr"
      },
      {
        "name": "is_active",
        "type": "TINYINT(1)",
        "desc": "是否活跃设备 1=是",
        "business": "是否活跃设备 1=是",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_user_profile",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·用户档案（一行一用户）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_user_profile"
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "fk"
      },
      {
        "name": "register_date",
        "type": "DATE",
        "desc": "注册日期",
        "business": "注册日期",
        "role": "attr"
      },
      {
        "name": "register_product",
        "type": "VARCHAR(20)",
        "desc": "注册来源产品线：launcher/cashier",
        "business": "注册来源产品线：launcher/cashier",
        "role": "attr"
      },
      {
        "name": "gender",
        "type": "VARCHAR(10)",
        "desc": "性别",
        "business": "性别",
        "role": "attr"
      },
      {
        "name": "age_group",
        "type": "VARCHAR(20)",
        "desc": "年龄段",
        "business": "年龄段",
        "role": "attr"
      },
      {
        "name": "city_tier",
        "type": "VARCHAR(20)",
        "desc": "城市等级",
        "business": "城市等级",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(20)",
        "desc": "主用设备类型：机顶盒/智能电视/手机",
        "business": "主用设备类型：机顶盒/智能电视/手机",
        "role": "attr"
      },
      {
        "name": "first_channel",
        "type": "VARCHAR(30)",
        "desc": "首访获客渠道",
        "business": "首访获客渠道",
        "role": "attr"
      },
      {
        "name": "user_segment",
        "type": "VARCHAR(20)",
        "desc": "用户分层：新用户/活跃/沉默/付费",
        "business": "用户分层：新用户/活跃/沉默/付费",
        "role": "attr"
      },
      {
        "name": "is_paid",
        "type": "TINYINT(1)",
        "desc": "是否付费用户",
        "business": "是否付费用户",
        "role": "attr"
      },
      {
        "name": "vip_level",
        "type": "VARCHAR(20)",
        "desc": "会员等级：普通/黄金/钻石",
        "business": "会员等级：普通/黄金/钻石",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_device_operation_log",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·设备操作日志（一行一次操作，核心事实表）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_device_operation_log"
    ],
    "field_count": 18,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "日志主键",
        "business": "日志主键",
        "role": "fk"
      },
      {
        "name": "device_id",
        "type": "VARCHAR(32)",
        "desc": "设备ID",
        "business": "设备ID",
        "role": "fk"
      },
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "操作用户ID",
        "business": "操作用户ID",
        "role": "fk"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "事件发生时间（精确到秒）",
        "business": "事件发生时间（精确到秒）",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "事件日期（分区键）",
        "business": "事件日期（分区键）",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "产品线：launcher/vod/live/cashier",
        "business": "产品线：launcher/vod/live/cashier",
        "role": "attr"
      },
      {
        "name": "event_action",
        "type": "VARCHAR(30)",
        "desc": "操作类型：boot/click/play_start/play_end/pause/channel_enter/order_submit/pay_success/app_exit",
        "business": "操作类型：boot/click/play_start/play_end/pause/channel_enter/order_submit/pay_success/app_exit",
        "role": "attr"
      },
      {
        "name": "event_page",
        "type": "VARCHAR(50)",
        "desc": "页面/模块：首页/片库/播放器/收银台",
        "business": "页面/模块：首页/片库/播放器/收银台",
        "role": "attr"
      },
      {
        "name": "content_id",
        "type": "VARCHAR(32)",
        "desc": "内容ID（点播/直播节目）",
        "business": "内容ID（点播/直播节目）",
        "role": "fk"
      },
      {
        "name": "content_title",
        "type": "VARCHAR(100)",
        "desc": "内容标题",
        "business": "内容标题",
        "role": "attr"
      },
      {
        "name": "content_category",
        "type": "VARCHAR(30)",
        "desc": "内容分类：电影/电视剧/综艺/体育",
        "business": "内容分类：电影/电视剧/综艺/体育",
        "role": "attr"
      },
      {
        "name": "play_duration_sec",
        "type": "INT",
        "desc": "播放时长（秒），仅播放类事件",
        "business": "播放时长（秒），仅播放类事件",
        "role": "attr"
      },
      {
        "name": "session_id",
        "type": "VARCHAR(64)",
        "desc": "会话ID",
        "business": "会话ID",
        "role": "fk"
      },
      {
        "name": "app_version",
        "type": "VARCHAR(20)",
        "desc": "客户端版本",
        "business": "客户端版本",
        "role": "attr"
      },
      {
        "name": "network_type",
        "type": "VARCHAR(10)",
        "desc": "网络：wifi/4g/ethernet",
        "business": "网络：wifi/4g/ethernet",
        "role": "attr"
      },
      {
        "name": "is_success",
        "type": "TINYINT(1)",
        "desc": "操作是否成功",
        "business": "操作是否成功",
        "role": "attr"
      },
      {
        "name": "error_code",
        "type": "VARCHAR(20)",
        "desc": "失败错误码",
        "business": "失败错误码",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_content_catalog",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·内容目录（一行一节目/频道）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_content_catalog"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "content_id",
        "type": "VARCHAR(32)",
        "desc": "内容ID",
        "business": "内容ID",
        "role": "fk"
      },
      {
        "name": "content_type",
        "type": "VARCHAR(10)",
        "desc": "内容类型：vod/live",
        "business": "内容类型：vod/live",
        "role": "attr"
      },
      {
        "name": "content_title",
        "type": "VARCHAR(100)",
        "desc": "内容标题",
        "business": "内容标题",
        "role": "attr"
      },
      {
        "name": "content_category",
        "type": "VARCHAR(30)",
        "desc": "分类：电影/电视剧/综艺/体育/少儿",
        "business": "分类：电影/电视剧/综艺/体育/少儿",
        "role": "attr"
      },
      {
        "name": "duration_min",
        "type": "INT",
        "desc": "时长（分钟）",
        "business": "时长（分钟）",
        "role": "attr"
      },
      {
        "name": "is_premium",
        "type": "TINYINT(1)",
        "desc": "是否付费内容",
        "business": "是否付费内容",
        "role": "attr"
      },
      {
        "name": "publish_date",
        "type": "DATE",
        "desc": "上线日期",
        "business": "上线日期",
        "role": "attr"
      },
      {
        "name": "cp_name",
        "type": "VARCHAR(40)",
        "desc": "内容提供商",
        "business": "内容提供商",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_channel_campaign",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·渠道投放日报（一行一渠道一日）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_channel_campaign"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "stat_date",
        "type": "DATE",
        "desc": "统计日期",
        "business": "统计日期",
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
        "name": "impressions",
        "type": "BIGINT",
        "desc": "曝光次数",
        "business": "曝光次数",
        "role": "attr"
      },
      {
        "name": "clicks",
        "type": "BIGINT",
        "desc": "点击次数",
        "business": "点击次数",
        "role": "attr"
      },
      {
        "name": "installs",
        "type": "INT",
        "desc": "安装/激活数",
        "business": "安装/激活数",
        "role": "attr"
      },
      {
        "name": "spend_amount",
        "type": "DECIMAL(14,2)",
        "desc": "投放花费（元）",
        "business": "投放花费（元）",
        "role": "attr"
      },
      {
        "name": "new_users",
        "type": "INT",
        "desc": "新增用户数",
        "business": "新增用户数",
        "role": "attr"
      },
      {
        "name": "new_devices",
        "type": "INT",
        "desc": "新增设备数",
        "business": "新增设备数",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_subscription_order",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·订阅/订单流水（一行一订单）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_subscription_order"
    ],
    "field_count": 13,
    "fields": [
      {
        "name": "order_id",
        "type": "VARCHAR(32)",
        "desc": "订单号",
        "business": "订单号",
        "role": "fk"
      },
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "fk"
      },
      {
        "name": "device_id",
        "type": "VARCHAR(32)",
        "desc": "下单设备ID",
        "business": "下单设备ID",
        "role": "fk"
      },
      {
        "name": "pay_date",
        "type": "DATE",
        "desc": "支付日期",
        "business": "支付日期",
        "role": "attr"
      },
      {
        "name": "pay_time",
        "type": "DATETIME",
        "desc": "支付时间",
        "business": "支付时间",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "下单产品线：cashier/vod",
        "business": "下单产品线：cashier/vod",
        "role": "attr"
      },
      {
        "name": "plan_type",
        "type": "VARCHAR(30)",
        "desc": "套餐：月卡/季卡/年卡/单片",
        "business": "套餐：月卡/季卡/年卡/单片",
        "role": "attr"
      },
      {
        "name": "pay_amount",
        "type": "DECIMAL(12,2)",
        "desc": "支付金额（元）",
        "business": "支付金额（元）",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "归因渠道",
        "business": "归因渠道",
        "role": "attr"
      },
      {
        "name": "content_id",
        "type": "VARCHAR(32)",
        "desc": "关联内容（单片购买）",
        "business": "关联内容（单片购买）",
        "role": "fk"
      },
      {
        "name": "is_renewal",
        "type": "TINYINT(1)",
        "desc": "是否续费",
        "business": "是否续费",
        "role": "attr"
      },
      {
        "name": "pay_method",
        "type": "VARCHAR(20)",
        "desc": "支付方式：微信/支付宝/运营商",
        "business": "支付方式：微信/支付宝/运营商",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_user_retention",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·留存同期群（一行一同期群×第N日×渠道×产品线）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_user_retention"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "cohort_date",
        "type": "DATE",
        "desc": "同期群日期（注册/激活日）",
        "business": "同期群日期（注册/激活日）",
        "role": "attr"
      },
      {
        "name": "day_offset",
        "type": "INT",
        "desc": "第N日留存（1/3/7/14/30）",
        "business": "第N日留存（1/3/7/14/30）",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道，ALL=全渠道",
        "business": "渠道，ALL=全渠道",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "产品线，ALL=全产品",
        "business": "产品线，ALL=全产品",
        "role": "attr"
      },
      {
        "name": "cohort_users",
        "type": "INT",
        "desc": "同期群人数",
        "business": "同期群人数",
        "role": "attr"
      },
      {
        "name": "retained_users",
        "type": "INT",
        "desc": "留存人数",
        "business": "留存人数",
        "role": "attr"
      },
      {
        "name": "retention_rate",
        "type": "DECIMAL(8,4)",
        "desc": "留存率 0~1",
        "business": "留存率 0~1",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_activity",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·运营活动（一行一活动）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_activity"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "activity_id",
        "type": "VARCHAR(32)",
        "desc": "活动ID",
        "business": "活动ID",
        "role": "fk"
      },
      {
        "name": "activity_name",
        "type": "VARCHAR(80)",
        "desc": "活动名称",
        "business": "活动名称",
        "role": "attr"
      },
      {
        "name": "start_date",
        "type": "DATE",
        "desc": "开始日期",
        "business": "开始日期",
        "role": "attr"
      },
      {
        "name": "end_date",
        "type": "DATE",
        "desc": "结束日期",
        "business": "结束日期",
        "role": "attr"
      },
      {
        "name": "activity_type",
        "type": "VARCHAR(30)",
        "desc": "活动类型：拉新/促销/品牌/活跃",
        "business": "活动类型：拉新/促销/品牌/活跃",
        "role": "attr"
      },
      {
        "name": "target_product_line",
        "type": "VARCHAR(20)",
        "desc": "目标产品线",
        "business": "目标产品线",
        "role": "attr"
      },
      {
        "name": "budget_amount",
        "type": "DECIMAL(14,2)",
        "desc": "预算（元）",
        "business": "预算（元）",
        "role": "attr"
      },
      {
        "name": "target_users",
        "type": "INT",
        "desc": "目标覆盖人数",
        "business": "目标覆盖人数",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "ETL批次号",
        "business": "ETL批次号",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_device",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·设备维度（一行一设备）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_device"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "device_id",
        "type": "VARCHAR(32)",
        "desc": "设备ID",
        "business": "设备ID",
        "role": "pk"
      },
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "绑定用户",
        "business": "绑定用户",
        "role": "fk"
      },
      {
        "name": "device_model",
        "type": "VARCHAR(40)",
        "desc": "设备型号",
        "business": "设备型号",
        "role": "attr"
      },
      {
        "name": "chip_platform",
        "type": "VARCHAR(30)",
        "desc": "芯片平台",
        "business": "芯片平台",
        "role": "attr"
      },
      {
        "name": "os_version",
        "type": "VARCHAR(20)",
        "desc": "系统版本",
        "business": "系统版本",
        "role": "attr"
      },
      {
        "name": "install_channel",
        "type": "VARCHAR(30)",
        "desc": "安装渠道",
        "business": "安装渠道",
        "role": "attr"
      },
      {
        "name": "province",
        "type": "VARCHAR(20)",
        "desc": "省份",
        "business": "省份",
        "role": "attr"
      },
      {
        "name": "city_tier",
        "type": "VARCHAR(20)",
        "desc": "城市等级",
        "business": "城市等级",
        "role": "attr"
      },
      {
        "name": "first_boot_time",
        "type": "DATETIME",
        "desc": "首次开机",
        "business": "首次开机",
        "role": "attr"
      },
      {
        "name": "is_active",
        "type": "TINYINT(1)",
        "desc": "是否活跃",
        "business": "是否活跃",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_user",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·用户维度（一行一用户）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_user"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "pk"
      },
      {
        "name": "register_date",
        "type": "DATE",
        "desc": "注册日期",
        "business": "注册日期",
        "role": "attr"
      },
      {
        "name": "gender",
        "type": "VARCHAR(10)",
        "desc": "性别",
        "business": "性别",
        "role": "attr"
      },
      {
        "name": "age_group",
        "type": "VARCHAR(20)",
        "desc": "年龄段",
        "business": "年龄段",
        "role": "attr"
      },
      {
        "name": "city_tier",
        "type": "VARCHAR(20)",
        "desc": "城市等级",
        "business": "城市等级",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(20)",
        "desc": "设备类型",
        "business": "设备类型",
        "role": "attr"
      },
      {
        "name": "first_channel",
        "type": "VARCHAR(30)",
        "desc": "首访渠道",
        "business": "首访渠道",
        "role": "attr"
      },
      {
        "name": "user_segment",
        "type": "VARCHAR(20)",
        "desc": "用户分层",
        "business": "用户分层",
        "role": "attr"
      },
      {
        "name": "is_paid",
        "type": "TINYINT(1)",
        "desc": "是否付费",
        "business": "是否付费",
        "role": "attr"
      },
      {
        "name": "vip_level",
        "type": "VARCHAR(20)",
        "desc": "会员等级",
        "business": "会员等级",
        "role": "attr"
      },
      {
        "name": "lifecycle_stage",
        "type": "VARCHAR(20)",
        "desc": "生命周期：新客/成长/成熟/沉默/流失",
        "business": "生命周期：新客/成长/成熟/沉默/流失",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_product_line",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·产品线维度（一行一产品线）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_product_line"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "product_line_code",
        "type": "VARCHAR(20)",
        "desc": "产品线编码",
        "business": "产品线编码",
        "role": "attr"
      },
      {
        "name": "product_line_name",
        "type": "VARCHAR(40)",
        "desc": "产品线名称",
        "business": "产品线名称",
        "role": "attr"
      },
      {
        "name": "product_category",
        "type": "VARCHAR(20)",
        "desc": "大类：桌面/内容/交易",
        "business": "大类：桌面/内容/交易",
        "role": "attr"
      },
      {
        "name": "description",
        "type": "VARCHAR(100)",
        "desc": "说明",
        "business": "说明",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_channel",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·渠道维度（一行一渠道）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_channel"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道编码",
        "business": "渠道编码",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(40)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "channel_type",
        "type": "VARCHAR(20)",
        "desc": "渠道类型：自然/付费/裂变",
        "business": "渠道类型：自然/付费/裂变",
        "role": "attr"
      },
      {
        "name": "is_paid_channel",
        "type": "TINYINT(1)",
        "desc": "是否付费渠道",
        "business": "是否付费渠道",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_date",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·日期维度（一行一天）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_date"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "date_id",
        "type": "DATE",
        "desc": "日期",
        "business": "日期",
        "role": "pk"
      },
      {
        "name": "year_num",
        "type": "INT",
        "desc": "年",
        "business": "年",
        "role": "attr"
      },
      {
        "name": "month_num",
        "type": "INT",
        "desc": "月",
        "business": "月",
        "role": "attr"
      },
      {
        "name": "day_num",
        "type": "INT",
        "desc": "日",
        "business": "日",
        "role": "attr"
      },
      {
        "name": "week_of_year",
        "type": "INT",
        "desc": "年中第几周",
        "business": "年中第几周",
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
        "name": "month_label",
        "type": "VARCHAR(7)",
        "desc": "YYYY-MM",
        "business": "YYYY-MM",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_event_action",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·操作类型维度（一行一操作×产品线）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_event_action"
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "event_action",
        "type": "VARCHAR(30)",
        "desc": "操作类型编码",
        "business": "操作类型编码",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "所属产品线",
        "business": "所属产品线",
        "role": "attr"
      },
      {
        "name": "event_action_name",
        "type": "VARCHAR(40)",
        "desc": "操作中文名",
        "business": "操作中文名",
        "role": "attr"
      },
      {
        "name": "event_category",
        "type": "VARCHAR(30)",
        "desc": "大类：启动/浏览/播放/交易",
        "business": "大类：启动/浏览/播放/交易",
        "role": "attr"
      },
      {
        "name": "funnel_step",
        "type": "VARCHAR(20)",
        "desc": "漏斗步骤映射：visit/signup/activate/purchase",
        "business": "漏斗步骤映射：visit/signup/activate/purchase",
        "role": "attr"
      },
      {
        "name": "is_conversion",
        "type": "TINYINT(1)",
        "desc": "是否转化事件",
        "business": "是否转化事件",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_device_operation_wide",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·设备操作宽表（一行一次操作，冗余设备/用户/内容维度）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_device_operation_wide"
    ],
    "field_count": 24,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "日志ID",
        "business": "日志ID",
        "role": "pk"
      },
      {
        "name": "device_id",
        "type": "VARCHAR(32)",
        "desc": "设备ID",
        "business": "设备ID",
        "role": "fk"
      },
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "fk"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "事件时间",
        "business": "事件时间",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "事件日期",
        "business": "事件日期",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "产品线",
        "business": "产品线",
        "role": "attr"
      },
      {
        "name": "product_line_name",
        "type": "VARCHAR(40)",
        "desc": "产品线名称",
        "business": "产品线名称",
        "role": "attr"
      },
      {
        "name": "event_action",
        "type": "VARCHAR(30)",
        "desc": "操作类型",
        "business": "操作类型",
        "role": "attr"
      },
      {
        "name": "event_action_name",
        "type": "VARCHAR(40)",
        "desc": "操作中文名",
        "business": "操作中文名",
        "role": "attr"
      },
      {
        "name": "event_category",
        "type": "VARCHAR(30)",
        "desc": "事件大类",
        "business": "事件大类",
        "role": "attr"
      },
      {
        "name": "funnel_step",
        "type": "VARCHAR(20)",
        "desc": "漏斗步骤",
        "business": "漏斗步骤",
        "role": "attr"
      },
      {
        "name": "event_page",
        "type": "VARCHAR(50)",
        "desc": "页面模块",
        "business": "页面模块",
        "role": "attr"
      },
      {
        "name": "content_id",
        "type": "VARCHAR(32)",
        "desc": "内容ID",
        "business": "内容ID",
        "role": "fk"
      },
      {
        "name": "content_title",
        "type": "VARCHAR(100)",
        "desc": "内容标题",
        "business": "内容标题",
        "role": "attr"
      },
      {
        "name": "content_category",
        "type": "VARCHAR(30)",
        "desc": "内容分类",
        "business": "内容分类",
        "role": "attr"
      },
      {
        "name": "play_duration_sec",
        "type": "INT",
        "desc": "播放秒数",
        "business": "播放秒数",
        "role": "attr"
      },
      {
        "name": "session_id",
        "type": "VARCHAR(64)",
        "desc": "会话ID",
        "business": "会话ID",
        "role": "fk"
      },
      {
        "name": "device_model",
        "type": "VARCHAR(40)",
        "desc": "设备型号",
        "business": "设备型号",
        "role": "attr"
      },
      {
        "name": "install_channel",
        "type": "VARCHAR(30)",
        "desc": "安装渠道",
        "business": "安装渠道",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(40)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "gender",
        "type": "VARCHAR(10)",
        "desc": "用户性别",
        "business": "用户性别",
        "role": "attr"
      },
      {
        "name": "age_group",
        "type": "VARCHAR(20)",
        "desc": "用户年龄段",
        "business": "用户年龄段",
        "role": "attr"
      },
      {
        "name": "user_segment",
        "type": "VARCHAR(20)",
        "desc": "用户分层",
        "business": "用户分层",
        "role": "attr"
      },
      {
        "name": "is_success",
        "type": "TINYINT(1)",
        "desc": "是否成功",
        "business": "是否成功",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_user_wide",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·用户宽表（一行一用户，汇总行为与付费）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_user_wide"
    ],
    "field_count": 17,
    "fields": [
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "pk"
      },
      {
        "name": "register_date",
        "type": "DATE",
        "desc": "注册日期",
        "business": "注册日期",
        "role": "attr"
      },
      {
        "name": "gender",
        "type": "VARCHAR(10)",
        "desc": "性别",
        "business": "性别",
        "role": "attr"
      },
      {
        "name": "age_group",
        "type": "VARCHAR(20)",
        "desc": "年龄段",
        "business": "年龄段",
        "role": "attr"
      },
      {
        "name": "city_tier",
        "type": "VARCHAR(20)",
        "desc": "城市等级",
        "business": "城市等级",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(20)",
        "desc": "设备类型",
        "business": "设备类型",
        "role": "attr"
      },
      {
        "name": "first_channel",
        "type": "VARCHAR(30)",
        "desc": "首访渠道",
        "business": "首访渠道",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(40)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "user_segment",
        "type": "VARCHAR(20)",
        "desc": "用户分层",
        "business": "用户分层",
        "role": "attr"
      },
      {
        "name": "lifecycle_stage",
        "type": "VARCHAR(20)",
        "desc": "生命周期阶段",
        "business": "生命周期阶段",
        "role": "attr"
      },
      {
        "name": "is_paid",
        "type": "TINYINT(1)",
        "desc": "是否付费",
        "business": "是否付费",
        "role": "attr"
      },
      {
        "name": "vip_level",
        "type": "VARCHAR(20)",
        "desc": "会员等级",
        "business": "会员等级",
        "role": "attr"
      },
      {
        "name": "total_operations",
        "type": "INT",
        "desc": "累计操作次数",
        "business": "累计操作次数",
        "role": "attr"
      },
      {
        "name": "total_play_sec",
        "type": "INT",
        "desc": "累计播放秒数",
        "business": "累计播放秒数",
        "role": "attr"
      },
      {
        "name": "total_pay_amount",
        "type": "DECIMAL(14,2)",
        "desc": "累计付费金额",
        "business": "累计付费金额",
        "role": "attr"
      },
      {
        "name": "last_active_date",
        "type": "DATE",
        "desc": "最近活跃日",
        "business": "最近活跃日",
        "role": "attr"
      },
      {
        "name": "days_since_register",
        "type": "INT",
        "desc": "注册至今天数",
        "business": "注册至今天数",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_session_wide",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·会话宽表（一行一会话，汇总单次使用）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_session_wide"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "session_id",
        "type": "VARCHAR(64)",
        "desc": "会话ID",
        "business": "会话ID",
        "role": "pk"
      },
      {
        "name": "device_id",
        "type": "VARCHAR(32)",
        "desc": "设备ID",
        "business": "设备ID",
        "role": "fk"
      },
      {
        "name": "user_id",
        "type": "VARCHAR(32)",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "fk"
      },
      {
        "name": "session_date",
        "type": "DATE",
        "desc": "会话日期",
        "business": "会话日期",
        "role": "attr"
      },
      {
        "name": "session_start",
        "type": "DATETIME",
        "desc": "会话开始",
        "business": "会话开始",
        "role": "attr"
      },
      {
        "name": "session_end",
        "type": "DATETIME",
        "desc": "会话结束",
        "business": "会话结束",
        "role": "attr"
      },
      {
        "name": "duration_sec",
        "type": "INT",
        "desc": "会话时长（秒）",
        "business": "会话时长（秒）",
        "role": "attr"
      },
      {
        "name": "operation_count",
        "type": "INT",
        "desc": "操作次数",
        "business": "操作次数",
        "role": "attr"
      },
      {
        "name": "play_count",
        "type": "INT",
        "desc": "播放次数",
        "business": "播放次数",
        "role": "attr"
      },
      {
        "name": "product_lines_used",
        "type": "VARCHAR(100)",
        "desc": "涉及产品线（逗号分隔）",
        "business": "涉及产品线（逗号分隔）",
        "role": "attr"
      },
      {
        "name": "is_paid_session",
        "type": "TINYINT(1)",
        "desc": "会话内是否付费",
        "business": "会话内是否付费",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dws_user_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·用户日汇总（一行一日×渠道）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_user_daily"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "统计日期",
        "business": "统计日期",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道",
        "business": "渠道",
        "role": "attr"
      },
      {
        "name": "dau",
        "type": "INT",
        "desc": "日活用户数",
        "business": "日活用户数",
        "role": "attr"
      },
      {
        "name": "dau_device",
        "type": "INT",
        "desc": "日活设备数",
        "business": "日活设备数",
        "role": "attr"
      },
      {
        "name": "new_users",
        "type": "INT",
        "desc": "新增用户",
        "business": "新增用户",
        "role": "attr"
      },
      {
        "name": "new_devices",
        "type": "INT",
        "desc": "新增设备",
        "business": "新增设备",
        "role": "attr"
      },
      {
        "name": "active_users",
        "type": "INT",
        "desc": "高活跃用户",
        "business": "高活跃用户",
        "role": "attr"
      },
      {
        "name": "paid_users",
        "type": "INT",
        "desc": "付费活跃用户",
        "business": "付费活跃用户",
        "role": "attr"
      },
      {
        "name": "boot_count",
        "type": "INT",
        "desc": "开机次数",
        "business": "开机次数",
        "role": "attr"
      },
      {
        "name": "avg_session_sec",
        "type": "DECIMAL(10,2)",
        "desc": "人均会话秒数",
        "business": "人均会话秒数",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dws_product_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·产品线日汇总（一行一日×产品线）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_product_daily"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "统计日期",
        "business": "统计日期",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "产品线",
        "business": "产品线",
        "role": "attr"
      },
      {
        "name": "active_users",
        "type": "INT",
        "desc": "活跃用户数",
        "business": "活跃用户数",
        "role": "attr"
      },
      {
        "name": "active_devices",
        "type": "INT",
        "desc": "活跃设备数",
        "business": "活跃设备数",
        "role": "attr"
      },
      {
        "name": "operation_count",
        "type": "INT",
        "desc": "操作次数",
        "business": "操作次数",
        "role": "attr"
      },
      {
        "name": "play_count",
        "type": "INT",
        "desc": "播放次数",
        "business": "播放次数",
        "role": "attr"
      },
      {
        "name": "total_play_sec",
        "type": "BIGINT",
        "desc": "总播放秒数",
        "business": "总播放秒数",
        "role": "attr"
      },
      {
        "name": "pay_users",
        "type": "INT",
        "desc": "付费用户数",
        "business": "付费用户数",
        "role": "attr"
      },
      {
        "name": "pay_amount",
        "type": "DECIMAL(14,2)",
        "desc": "付费金额",
        "business": "付费金额",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dws_retention_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·留存日汇总（一行一同期群×第N日）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_retention_daily"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "cohort_date",
        "type": "DATE",
        "desc": "同期群日期",
        "business": "同期群日期",
        "role": "attr"
      },
      {
        "name": "day_offset",
        "type": "INT",
        "desc": "第N日",
        "business": "第N日",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "channel_code",
        "business": "channel_code",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "product_line",
        "business": "product_line",
        "role": "attr"
      },
      {
        "name": "cohort_users",
        "type": "INT",
        "desc": "同期群人数",
        "business": "同期群人数",
        "role": "attr"
      },
      {
        "name": "retained_users",
        "type": "INT",
        "desc": "留存人数",
        "business": "留存人数",
        "role": "attr"
      },
      {
        "name": "retention_rate",
        "type": "DECIMAL(8,4)",
        "desc": "留存率",
        "business": "留存率",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dws_channel_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·渠道日汇总（一行一渠道一日）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_channel_daily"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "统计日期",
        "business": "统计日期",
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
        "name": "channel_name",
        "type": "VARCHAR(40)",
        "desc": "渠道名称",
        "business": "渠道名称",
        "role": "attr"
      },
      {
        "name": "spend_amount",
        "type": "DECIMAL(14,2)",
        "desc": "投放花费",
        "business": "投放花费",
        "role": "attr"
      },
      {
        "name": "new_users",
        "type": "INT",
        "desc": "新增用户",
        "business": "新增用户",
        "role": "attr"
      },
      {
        "name": "new_devices",
        "type": "INT",
        "desc": "新增设备",
        "business": "新增设备",
        "role": "attr"
      },
      {
        "name": "clicks",
        "type": "BIGINT",
        "desc": "点击数",
        "business": "点击数",
        "role": "attr"
      },
      {
        "name": "cac",
        "type": "DECIMAL(12,2)",
        "desc": "获客成本",
        "business": "获客成本",
        "role": "attr"
      },
      {
        "name": "conversion_rate",
        "type": "DECIMAL(8,4)",
        "desc": "转化率",
        "business": "转化率",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dws_payment_daily",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·付费日汇总（一行一日×渠道×产品线）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_payment_daily"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "统计日期",
        "business": "统计日期",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VARCHAR(20)",
        "desc": "渠道",
        "business": "渠道",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VARCHAR(20)",
        "desc": "产品线",
        "business": "产品线",
        "role": "attr"
      },
      {
        "name": "pay_users",
        "type": "INT",
        "desc": "付费用户数",
        "business": "付费用户数",
        "role": "attr"
      },
      {
        "name": "pay_amount",
        "type": "DECIMAL(14,2)",
        "desc": "付费金额",
        "business": "付费金额",
        "role": "attr"
      },
      {
        "name": "arpu",
        "type": "DECIMAL(12,2)",
        "desc": "人均收入",
        "business": "人均收入",
        "role": "attr"
      },
      {
        "name": "renewal_users",
        "type": "INT",
        "desc": "续费用户数",
        "business": "续费用户数",
        "role": "attr"
      },
      {
        "name": "order_count",
        "type": "INT",
        "desc": "订单数",
        "business": "订单数",
        "role": "attr"
      }
    ]
  },
  {
    "name": "ods_user_event",
    "layer": "ADS",
    "type": "view",
    "purpose": "ods_user_event 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_user_event"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "ods_channel",
    "layer": "ADS",
    "type": "view",
    "purpose": "ods_channel 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_channel"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "ods_subscription",
    "layer": "ADS",
    "type": "view",
    "purpose": "ods_subscription 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_subscription"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "dwd_event_wide",
    "layer": "ADS",
    "type": "view",
    "purpose": "dwd_event_wide 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_event_wide"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_dau_overview",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_dau_overview 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_dau_overview"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_user_retention",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_retention 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_retention"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_user_portrait",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_portrait 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_portrait"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_user_lifecycle",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_lifecycle 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_lifecycle"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_channel_analysis",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_channel_analysis 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_channel_analysis"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_funnel",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_funnel 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_funnel"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_ltv",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_ltv 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_ltv"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_rfm",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_rfm 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_rfm"
    ],
    "field_count": 8,
    "fields": []
  },
  {
    "name": "v_product_line_analysis",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_product_line_analysis 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_product_line_analysis"
    ],
    "field_count": 8,
    "fields": []
  }
];
window.WAREHOUSE_FIELD_OVERVIEW=[
  {
    "layer": "ODS",
    "table_name": "ods_device_profile",
    "field_count": 14,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_user_profile",
    "field_count": 12,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_device_operation_log",
    "field_count": 18,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_content_catalog",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_channel_campaign",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_subscription_order",
    "field_count": 13,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_user_retention",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_activity",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_device",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_user",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_product_line",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_channel",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_date",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_event_action",
    "field_count": 6,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_device_operation_wide",
    "field_count": 24,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_user_wide",
    "field_count": 17,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_session_wide",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_user_daily",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_product_daily",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_retention_daily",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_channel_daily",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_payment_daily",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "ods_user_event",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "ods_channel",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "ods_subscription",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "dwd_event_wide",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_dau_overview",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_retention",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_portrait",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_lifecycle",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_channel_analysis",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_funnel",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_ltv",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_rfm",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_product_line_analysis",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  }
];
