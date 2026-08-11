/** internet_analytics 数据字典 · OTT雪花模型版v2 */
window.DATA_DICTIONARY=[
  {
    "name": "dim_province",
    "name_cn": "省份",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·省份（雪花上级维）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_province"
    ],
    "field_count": 2,
    "fields": [
      {
        "name": "province_id",
        "type": "VARCHAR(10)",
        "desc": "省份编码",
        "business": "省份编码",
        "role": "pk"
      },
      {
        "name": "province_name",
        "type": "VARCHAR(20)",
        "desc": "province_name",
        "business": "province_name",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_region",
    "name_cn": "地市",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·地市（雪花，挂 dim_province）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_region"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "地市编码",
        "business": "地市编码",
        "role": "pk"
      },
      {
        "name": "region_name",
        "type": "VARCHAR(30)",
        "desc": "region_name",
        "business": "region_name",
        "role": "attr"
      },
      {
        "name": "province_id",
        "type": "VARCHAR(10)",
        "desc": "上级省份·雪花外键",
        "business": "上级省份·雪花外键",
        "role": "fk"
      },
      {
        "name": "region_level",
        "type": "VARCHAR(10)",
        "desc": "region_level",
        "business": "region_level",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_content_genre",
    "name_cn": "题材",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·题材（雪花末级）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_content_genre"
    ],
    "field_count": 2,
    "fields": [
      {
        "name": "genre_id",
        "type": "VARCHAR(10)",
        "desc": "题材编码",
        "business": "题材编码",
        "role": "pk"
      },
      {
        "name": "genre_name",
        "type": "VARCHAR(30)",
        "desc": "题材：都市/古装/悬疑/亲子/科普等",
        "business": "题材：都市/古装/悬疑/亲子/科普等",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_content_category",
    "name_cn": "内容类型",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·内容类型",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_content_category"
    ],
    "field_count": 3,
    "fields": [
      {
        "name": "category_id",
        "type": "VARCHAR(10)",
        "desc": "内容类型编码",
        "business": "内容类型编码",
        "role": "pk"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "影视/综艺/动漫",
        "business": "影视/综艺/动漫",
        "role": "attr"
      },
      {
        "name": "media_type",
        "type": "VARCHAR(10)",
        "desc": "点播/直播",
        "business": "点播/直播",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_content_cp",
    "name_cn": "内容提供方",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·内容提供方",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_content_cp"
    ],
    "field_count": 3,
    "fields": [
      {
        "name": "cp_id",
        "type": "VARCHAR(10)",
        "desc": "CP/版权方编码",
        "business": "CP/版权方编码",
        "role": "pk"
      },
      {
        "name": "cp_name",
        "type": "VARCHAR(40)",
        "desc": "爱奇艺/自制/第三方",
        "business": "爱奇艺/自制/第三方",
        "role": "attr"
      },
      {
        "name": "cp_type",
        "type": "VARCHAR(20)",
        "desc": "cp_type",
        "business": "cp_type",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_content_series",
    "name_cn": "剧集",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·剧集（雪花，挂 category/genre/cp）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_content_series"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "剧集编码",
        "business": "剧集编码",
        "role": "pk"
      },
      {
        "name": "series_name",
        "type": "VARCHAR(80)",
        "desc": "series_name",
        "business": "series_name",
        "role": "attr"
      },
      {
        "name": "category_id",
        "type": "VARCHAR(10)",
        "desc": "内容类型·雪花外键",
        "business": "内容类型·雪花外键",
        "role": "fk"
      },
      {
        "name": "genre_id",
        "type": "VARCHAR(10)",
        "desc": "题材·雪花外键",
        "business": "题材·雪花外键",
        "role": "fk"
      },
      {
        "name": "cp_id",
        "type": "VARCHAR(10)",
        "desc": "CP·雪花外键",
        "business": "CP·雪花外键",
        "role": "fk"
      },
      {
        "name": "total_episodes",
        "type": "INT",
        "desc": "总集数",
        "business": "总集数",
        "role": "attr"
      },
      {
        "name": "is_kids",
        "type": "TINYINT(1)",
        "desc": "是否幼儿动漫",
        "business": "是否幼儿动漫",
        "role": "attr"
      },
      {
        "name": "release_year",
        "type": "INT",
        "desc": "release_year",
        "business": "release_year",
        "role": "attr"
      },
      {
        "name": "series_status",
        "type": "VARCHAR(20)",
        "desc": "series_status",
        "business": "series_status",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_content_episode",
    "name_cn": "单集",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·单集（雪花，挂 series）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_content_episode"
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "episode_id",
        "type": "VARCHAR(20)",
        "desc": "单集编码",
        "business": "单集编码",
        "role": "pk"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "所属剧集·雪花外键",
        "business": "所属剧集·雪花外键",
        "role": "fk"
      },
      {
        "name": "episode_no",
        "type": "INT",
        "desc": "第几集",
        "business": "第几集",
        "role": "attr"
      },
      {
        "name": "episode_name",
        "type": "VARCHAR(80)",
        "desc": "episode_name",
        "business": "episode_name",
        "role": "attr"
      },
      {
        "name": "duration_sec",
        "type": "INT",
        "desc": "单集时长秒",
        "business": "单集时长秒",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_channel_category",
    "name_cn": "直播频道大类",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·直播频道大类",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_channel_category"
    ],
    "field_count": 2,
    "fields": [
      {
        "name": "channel_cat_id",
        "type": "VARCHAR(10)",
        "desc": "频道大类编码",
        "business": "频道大类编码",
        "role": "pk"
      },
      {
        "name": "channel_cat_name",
        "type": "VARCHAR(30)",
        "desc": "少儿/卫视/影视/新闻",
        "business": "少儿/卫视/影视/新闻",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_live_channel",
    "name_cn": "直播频道",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·直播频道（雪花，挂 channel_category）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_live_channel"
    ],
    "field_count": 3,
    "fields": [
      {
        "name": "channel_id",
        "type": "VARCHAR(20)",
        "desc": "频道编码",
        "business": "频道编码",
        "role": "pk"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(40)",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "attr"
      },
      {
        "name": "channel_cat_id",
        "type": "VARCHAR(10)",
        "desc": "频道大类·雪花外键",
        "business": "频道大类·雪花外键",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_device_type",
    "name_cn": "端类型",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·端类型",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_device_type"
    ],
    "field_count": 2,
    "fields": [
      {
        "name": "device_type_id",
        "type": "VARCHAR(10)",
        "desc": "端类型编码",
        "business": "端类型编码",
        "role": "pk"
      },
      {
        "name": "device_type_name",
        "type": "VARCHAR(20)",
        "desc": "STB/Speaker",
        "business": "STB/Speaker",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_device_model",
    "name_cn": "设备型号",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·设备型号（雪花，挂 device_type）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_device_model"
    ],
    "field_count": 3,
    "fields": [
      {
        "name": "model_id",
        "type": "VARCHAR(20)",
        "desc": "型号编码",
        "business": "型号编码",
        "role": "pk"
      },
      {
        "name": "model_name",
        "type": "VARCHAR(40)",
        "desc": "model_name",
        "business": "model_name",
        "role": "attr"
      },
      {
        "name": "device_type_id",
        "type": "VARCHAR(10)",
        "desc": "端类型·雪花外键",
        "business": "端类型·雪花外键",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_firmware",
    "name_cn": "固件版本",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·固件版本",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_firmware"
    ],
    "field_count": 2,
    "fields": [
      {
        "name": "fw_id",
        "type": "VARCHAR(20)",
        "desc": "固件编码",
        "business": "固件编码",
        "role": "pk"
      },
      {
        "name": "fw_version",
        "type": "VARCHAR(20)",
        "desc": "fw_version",
        "business": "fw_version",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_device",
    "name_cn": "设备",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·设备（雪花，挂 model/firmware/region）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_device"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "设备物理唯一标识",
        "business": "设备物理唯一标识",
        "role": "pk"
      },
      {
        "name": "model_id",
        "type": "VARCHAR(20)",
        "desc": "型号·雪花外键",
        "business": "型号·雪花外键",
        "role": "fk"
      },
      {
        "name": "fw_id",
        "type": "VARCHAR(20)",
        "desc": "固件·雪花外键",
        "business": "固件·雪花外键",
        "role": "fk"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "地市·雪花外键",
        "business": "地市·雪花外键",
        "role": "fk"
      },
      {
        "name": "device_type_id",
        "type": "VARCHAR(10)",
        "desc": "端类型（冗余便于聚合）",
        "business": "端类型（冗余便于聚合）",
        "role": "fk"
      },
      {
        "name": "first_active_date",
        "type": "DATE",
        "desc": "首次激活日",
        "business": "首次激活日",
        "role": "attr"
      },
      {
        "name": "device_status",
        "type": "VARCHAR(20)",
        "desc": "device_status",
        "business": "device_status",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_user_package",
    "name_cn": "套餐",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·套餐",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_user_package"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "pkg_id",
        "type": "VARCHAR(10)",
        "desc": "套餐编码",
        "business": "套餐编码",
        "role": "pk"
      },
      {
        "name": "pkg_name",
        "type": "VARCHAR(40)",
        "desc": "pkg_name",
        "business": "pkg_name",
        "role": "attr"
      },
      {
        "name": "pkg_price",
        "type": "DECIMAL(10,2)",
        "desc": "月费元",
        "business": "月费元",
        "role": "attr"
      },
      {
        "name": "pay_cycle",
        "type": "VARCHAR(20)",
        "desc": "连续包月/单月/包年",
        "business": "连续包月/单月/包年",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_user",
    "name_cn": "用户",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·用户（雪花，挂 region/package）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_user"
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "用户账号",
        "business": "用户账号",
        "role": "pk"
      },
      {
        "name": "phone",
        "type": "VARCHAR(20)",
        "desc": "手机号",
        "business": "手机号",
        "role": "attr"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "地市·雪花外键",
        "business": "地市·雪花外键",
        "role": "fk"
      },
      {
        "name": "pkg_id",
        "type": "VARCHAR(10)",
        "desc": "套餐·雪花外键",
        "business": "套餐·雪花外键",
        "role": "fk"
      },
      {
        "name": "register_date",
        "type": "DATE",
        "desc": "开户日",
        "business": "开户日",
        "role": "attr"
      },
      {
        "name": "user_status",
        "type": "VARCHAR(20)",
        "desc": "正常/销户",
        "business": "正常/销户",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_month",
    "name_cn": "月",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·月（雪花上级）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_month"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "month_id",
        "type": "VARCHAR(7)",
        "desc": "YYYY-MM",
        "business": "YYYY-MM",
        "role": "pk"
      },
      {
        "name": "year_num",
        "type": "INT",
        "desc": "year_num",
        "business": "year_num",
        "role": "attr"
      },
      {
        "name": "month_num",
        "type": "INT",
        "desc": "month_num",
        "business": "month_num",
        "role": "attr"
      },
      {
        "name": "month_label",
        "type": "VARCHAR(10)",
        "desc": "month_label",
        "business": "month_label",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_week",
    "name_cn": "周",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·周（雪花上级）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_week"
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "week_id",
        "type": "VARCHAR(10)",
        "desc": "YYYY-Www",
        "business": "YYYY-Www",
        "role": "pk"
      },
      {
        "name": "week_start",
        "type": "DATE",
        "desc": "week_start",
        "business": "week_start",
        "role": "attr"
      },
      {
        "name": "week_end",
        "type": "DATE",
        "desc": "week_end",
        "business": "week_end",
        "role": "attr"
      },
      {
        "name": "year_num",
        "type": "INT",
        "desc": "year_num",
        "business": "year_num",
        "role": "attr"
      },
      {
        "name": "week_of_year",
        "type": "INT",
        "desc": "week_of_year",
        "business": "week_of_year",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dim_date",
    "name_cn": "日期",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·日期（雪花，挂 week/month）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_date"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "date_id",
        "type": "DATE",
        "desc": "date_id",
        "business": "date_id",
        "role": "pk"
      },
      {
        "name": "week_id",
        "type": "VARCHAR(10)",
        "desc": "周·雪花外键",
        "business": "周·雪花外键",
        "role": "fk"
      },
      {
        "name": "month_id",
        "type": "VARCHAR(7)",
        "desc": "月·雪花外键",
        "business": "月·雪花外键",
        "role": "fk"
      },
      {
        "name": "year_num",
        "type": "INT",
        "desc": "year_num",
        "business": "year_num",
        "role": "attr"
      },
      {
        "name": "month_num",
        "type": "INT",
        "desc": "month_num",
        "business": "month_num",
        "role": "attr"
      },
      {
        "name": "day_num",
        "type": "INT",
        "desc": "day_num",
        "business": "day_num",
        "role": "attr"
      },
      {
        "name": "weekday",
        "type": "INT",
        "desc": "weekday",
        "business": "weekday",
        "role": "attr"
      },
      {
        "name": "is_weekend",
        "type": "TINYINT(1)",
        "desc": "is_weekend",
        "business": "is_weekend",
        "role": "attr"
      }
    ]
  },
  {
    "name": "ods_device_info_df",
    "name_cn": "设备信息·全量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·设备信息·全量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_device_info_df"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "pk"
      },
      {
        "name": "model_name",
        "type": "VARCHAR(40)",
        "desc": "model_name",
        "business": "model_name",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "fw_version",
        "type": "VARCHAR(20)",
        "desc": "fw_version",
        "business": "fw_version",
        "role": "attr"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "region_id",
        "business": "region_id",
        "role": "fk"
      },
      {
        "name": "first_active_date",
        "type": "DATE",
        "desc": "first_active_date",
        "business": "first_active_date",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_content_series_df",
    "name_cn": "剧集元数据·全量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·剧集元数据·全量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_content_series_df"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "pk"
      },
      {
        "name": "series_name",
        "type": "VARCHAR(80)",
        "desc": "series_name",
        "business": "series_name",
        "role": "attr"
      },
      {
        "name": "category_name",
        "type": "VARCHAR(30)",
        "desc": "category_name",
        "business": "category_name",
        "role": "attr"
      },
      {
        "name": "genre_name",
        "type": "VARCHAR(30)",
        "desc": "genre_name",
        "business": "genre_name",
        "role": "attr"
      },
      {
        "name": "cp_name",
        "type": "VARCHAR(40)",
        "desc": "cp_name",
        "business": "cp_name",
        "role": "attr"
      },
      {
        "name": "total_episodes",
        "type": "INT",
        "desc": "total_episodes",
        "business": "total_episodes",
        "role": "attr"
      },
      {
        "name": "is_kids",
        "type": "TINYINT(1)",
        "desc": "is_kids",
        "business": "is_kids",
        "role": "attr"
      },
      {
        "name": "release_year",
        "type": "INT",
        "desc": "release_year",
        "business": "release_year",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_content_episode_df",
    "name_cn": "单集元数据·全量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·单集元数据·全量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_content_episode_df"
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "episode_id",
        "type": "VARCHAR(20)",
        "desc": "episode_id",
        "business": "episode_id",
        "role": "pk"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "episode_no",
        "type": "INT",
        "desc": "episode_no",
        "business": "episode_no",
        "role": "attr"
      },
      {
        "name": "episode_name",
        "type": "VARCHAR(80)",
        "desc": "episode_name",
        "business": "episode_name",
        "role": "attr"
      },
      {
        "name": "duration_sec",
        "type": "INT",
        "desc": "duration_sec",
        "business": "duration_sec",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_live_channel_df",
    "name_cn": "直播频道元数据·全量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·直播频道元数据·全量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_live_channel_df"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "channel_id",
        "type": "VARCHAR(20)",
        "desc": "channel_id",
        "business": "channel_id",
        "role": "pk"
      },
      {
        "name": "channel_name",
        "type": "VARCHAR(40)",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "attr"
      },
      {
        "name": "channel_cat_name",
        "type": "VARCHAR(30)",
        "desc": "channel_cat_name",
        "business": "channel_cat_name",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_log_launcher_di",
    "name_cn": "开机日志·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·开机日志·增量（近3天）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_log_launcher_di"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "log_id",
        "business": "log_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "region_id",
        "business": "region_id",
        "role": "fk"
      },
      {
        "name": "fw_version",
        "type": "VARCHAR(20)",
        "desc": "fw_version",
        "business": "fw_version",
        "role": "attr"
      },
      {
        "name": "action",
        "type": "VARCHAR(20)",
        "desc": "boot/home/click/search",
        "business": "boot/home/click/search",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "ods_log_vod_di",
    "name_cn": "点播日志·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·点播日志·增量（近3天，含action）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_log_vod_di"
    ],
    "field_count": 15,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "log_id",
        "business": "log_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "episode_id",
        "type": "VARCHAR(20)",
        "desc": "episode_id",
        "business": "episode_id",
        "role": "fk"
      },
      {
        "name": "action",
        "type": "VARCHAR(20)",
        "desc": "play/pause/ff/rewind/seek/stop",
        "business": "play/pause/ff/rewind/seek/stop",
        "role": "attr"
      },
      {
        "name": "pos_sec",
        "type": "INT",
        "desc": "pos_sec",
        "business": "pos_sec",
        "role": "attr"
      },
      {
        "name": "play_dur_sec",
        "type": "INT",
        "desc": "play_dur_sec",
        "business": "play_dur_sec",
        "role": "attr"
      },
      {
        "name": "video_dur_sec",
        "type": "INT",
        "desc": "video_dur_sec",
        "business": "video_dur_sec",
        "role": "attr"
      },
      {
        "name": "is_finish",
        "type": "TINYINT(1)",
        "desc": "is_finish",
        "business": "is_finish",
        "role": "attr"
      },
      {
        "name": "first_frame_ms",
        "type": "INT",
        "desc": "first_frame_ms",
        "business": "first_frame_ms",
        "role": "attr"
      },
      {
        "name": "stall_ms",
        "type": "INT",
        "desc": "stall_ms",
        "business": "stall_ms",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "ods_log_live_di",
    "name_cn": "直播日志·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·直播日志·增量（近3天）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_log_live_di"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "log_id",
        "business": "log_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "channel_id",
        "type": "VARCHAR(20)",
        "desc": "channel_id",
        "business": "channel_id",
        "role": "fk"
      },
      {
        "name": "action",
        "type": "VARCHAR(20)",
        "desc": "action",
        "business": "action",
        "role": "attr"
      },
      {
        "name": "play_dur_sec",
        "type": "INT",
        "desc": "play_dur_sec",
        "business": "play_dur_sec",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "ods_log_cashier_di",
    "name_cn": "收银台日志·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·收银台日志·增量（近3天）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_log_cashier_di"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "log_id",
        "business": "log_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "funnel_step",
        "type": "VARCHAR(20)",
        "desc": "expose/click/verify/confirm",
        "business": "expose/click/verify/confirm",
        "role": "attr"
      },
      {
        "name": "src_type",
        "type": "VARCHAR(20)",
        "desc": "video/launcher",
        "business": "video/launcher",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "fee",
        "type": "DECIMAL(10,2)",
        "desc": "fee",
        "business": "fee",
        "role": "attr"
      },
      {
        "name": "pay_type",
        "type": "VARCHAR(20)",
        "desc": "pay_type",
        "business": "pay_type",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "ods_user_register_di",
    "name_cn": "开户·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·开户·增量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_user_register_di"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "pk"
      },
      {
        "name": "phone",
        "type": "VARCHAR(20)",
        "desc": "phone",
        "business": "phone",
        "role": "attr"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "region_id",
        "business": "region_id",
        "role": "fk"
      },
      {
        "name": "pkg_id",
        "type": "VARCHAR(10)",
        "desc": "pkg_id",
        "business": "pkg_id",
        "role": "fk"
      },
      {
        "name": "register_time",
        "type": "DATETIME",
        "desc": "register_time",
        "business": "register_time",
        "role": "attr"
      },
      {
        "name": "register_date",
        "type": "DATE",
        "desc": "register_date",
        "business": "register_date",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_user_unsubscribe_di",
    "name_cn": "退订·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·退订·增量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_user_unsubscribe_di"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "unsub_id",
        "type": "BIGINT",
        "desc": "unsub_id",
        "business": "unsub_id",
        "role": "pk"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "phone",
        "type": "VARCHAR(20)",
        "desc": "phone",
        "business": "phone",
        "role": "attr"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "unsub_time",
        "type": "DATETIME",
        "desc": "unsub_time",
        "business": "unsub_time",
        "role": "attr"
      },
      {
        "name": "unsub_date",
        "type": "DATE",
        "desc": "unsub_date",
        "business": "unsub_date",
        "role": "attr"
      },
      {
        "name": "reason",
        "type": "VARCHAR(40)",
        "desc": "reason",
        "business": "reason",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_order_di",
    "name_cn": "订购/退订明细·增量",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·订购/退订明细·增量",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_order_di"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "order_id",
        "type": "VARCHAR(40)",
        "desc": "order_id",
        "business": "order_id",
        "role": "pk"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "op_type",
        "type": "VARCHAR(10)",
        "desc": "order/unsub",
        "business": "order/unsub",
        "role": "attr"
      },
      {
        "name": "src_type",
        "type": "VARCHAR(20)",
        "desc": "video/launcher",
        "business": "video/launcher",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "pay_type",
        "type": "VARCHAR(20)",
        "desc": "连续包月/单月/包年",
        "business": "连续包月/单月/包年",
        "role": "attr"
      },
      {
        "name": "fee",
        "type": "DECIMAL(10,2)",
        "desc": "fee",
        "business": "fee",
        "role": "attr"
      },
      {
        "name": "op_time",
        "type": "DATETIME",
        "desc": "op_time",
        "business": "op_time",
        "role": "attr"
      },
      {
        "name": "op_date",
        "type": "DATE",
        "desc": "op_date",
        "business": "op_date",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dwd_act_launcher_di",
    "name_cn": "开机事实·粒度=一次开机行为",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·开机事实·粒度=一次开机行为（mac为主，userid变则记录变）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_act_launcher_di"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "log_id",
        "business": "log_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "region_id",
        "business": "region_id",
        "role": "fk"
      },
      {
        "name": "action",
        "type": "VARCHAR(20)",
        "desc": "action",
        "business": "action",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_vod_play_di",
    "name_cn": "点播播放事实·粒度=一次播放",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·点播播放事实·粒度=一次播放",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_vod_play_di"
    ],
    "field_count": 18,
    "fields": [
      {
        "name": "play_id",
        "type": "BIGINT",
        "desc": "play_id",
        "business": "play_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "episode_id",
        "type": "VARCHAR(20)",
        "desc": "episode_id",
        "business": "episode_id",
        "role": "fk"
      },
      {
        "name": "category_id",
        "type": "VARCHAR(10)",
        "desc": "category_id",
        "business": "category_id",
        "role": "fk"
      },
      {
        "name": "genre_id",
        "type": "VARCHAR(10)",
        "desc": "genre_id",
        "business": "genre_id",
        "role": "fk"
      },
      {
        "name": "is_kids",
        "type": "TINYINT(1)",
        "desc": "is_kids",
        "business": "is_kids",
        "role": "attr"
      },
      {
        "name": "action",
        "type": "VARCHAR(20)",
        "desc": "action",
        "business": "action",
        "role": "attr"
      },
      {
        "name": "play_dur_sec",
        "type": "INT",
        "desc": "play_dur_sec",
        "business": "play_dur_sec",
        "role": "attr"
      },
      {
        "name": "video_dur_sec",
        "type": "INT",
        "desc": "video_dur_sec",
        "business": "video_dur_sec",
        "role": "attr"
      },
      {
        "name": "complete_rate",
        "type": "DECIMAL(5,2)",
        "desc": "播放完成度%",
        "business": "播放完成度%",
        "role": "attr"
      },
      {
        "name": "is_finish",
        "type": "TINYINT(1)",
        "desc": "is_finish",
        "business": "is_finish",
        "role": "attr"
      },
      {
        "name": "first_frame_ms",
        "type": "INT",
        "desc": "first_frame_ms",
        "business": "first_frame_ms",
        "role": "attr"
      },
      {
        "name": "stall_ms",
        "type": "INT",
        "desc": "stall_ms",
        "business": "stall_ms",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_live_play_di",
    "name_cn": "直播播放事实·粒度=一次观看",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·直播播放事实·粒度=一次观看",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_live_play_di"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "play_id",
        "type": "BIGINT",
        "desc": "play_id",
        "business": "play_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "channel_id",
        "type": "VARCHAR(20)",
        "desc": "channel_id",
        "business": "channel_id",
        "role": "fk"
      },
      {
        "name": "channel_cat_id",
        "type": "VARCHAR(10)",
        "desc": "channel_cat_id",
        "business": "channel_cat_id",
        "role": "fk"
      },
      {
        "name": "play_dur_sec",
        "type": "INT",
        "desc": "play_dur_sec",
        "business": "play_dur_sec",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_trade_cashier_di",
    "name_cn": "收银台漏斗事实·粒度=一次埋点",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·收银台漏斗事实·粒度=一次埋点",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_trade_cashier_di"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "log_id",
        "type": "BIGINT",
        "desc": "log_id",
        "business": "log_id",
        "role": "pk"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "funnel_step",
        "type": "VARCHAR(20)",
        "desc": "funnel_step",
        "business": "funnel_step",
        "role": "attr"
      },
      {
        "name": "src_type",
        "type": "VARCHAR(20)",
        "desc": "src_type",
        "business": "src_type",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "fee",
        "type": "DECIMAL(10,2)",
        "desc": "fee",
        "business": "fee",
        "role": "attr"
      },
      {
        "name": "pay_type",
        "type": "VARCHAR(20)",
        "desc": "pay_type",
        "business": "pay_type",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "DATETIME",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "event_date",
        "type": "DATE",
        "desc": "event_date",
        "business": "event_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_trade_order_di",
    "name_cn": "订购/退订事实",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·订购/退订事实",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_trade_order_di"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "order_id",
        "type": "VARCHAR(40)",
        "desc": "order_id",
        "business": "order_id",
        "role": "pk"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "op_type",
        "type": "VARCHAR(10)",
        "desc": "op_type",
        "business": "op_type",
        "role": "attr"
      },
      {
        "name": "src_type",
        "type": "VARCHAR(20)",
        "desc": "src_type",
        "business": "src_type",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "pay_type",
        "type": "VARCHAR(20)",
        "desc": "pay_type",
        "business": "pay_type",
        "role": "attr"
      },
      {
        "name": "fee",
        "type": "DECIMAL(10,2)",
        "desc": "fee",
        "business": "fee",
        "role": "attr"
      },
      {
        "name": "revenue_share",
        "type": "DECIMAL(10,2)",
        "desc": "爱奇艺分成金额",
        "business": "爱奇艺分成金额",
        "role": "attr"
      },
      {
        "name": "op_time",
        "type": "DATETIME",
        "desc": "op_time",
        "business": "op_time",
        "role": "attr"
      },
      {
        "name": "op_date",
        "type": "DATE",
        "desc": "op_date",
        "business": "op_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "dwd_user_status_di",
    "name_cn": "用户状态日快照·粒度=日×userid",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·用户状态日快照·粒度=日×userid",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dwd_user_status_di"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "phone",
        "type": "VARCHAR(20)",
        "desc": "phone",
        "business": "phone",
        "role": "attr"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "user_status",
        "type": "VARCHAR(20)",
        "desc": "active/silent/churned",
        "business": "active/silent/churned",
        "role": "attr"
      },
      {
        "name": "register_date",
        "type": "DATE",
        "desc": "register_date",
        "business": "register_date",
        "role": "attr"
      },
      {
        "name": "last_active_date",
        "type": "DATE",
        "desc": "last_active_date",
        "business": "last_active_date",
        "role": "attr"
      },
      {
        "name": "days_since_active",
        "type": "INT",
        "desc": "days_since_active",
        "business": "days_since_active",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_act_user_active_1d",
    "name_cn": "用户日活跃·mac粒度",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·用户日活跃·mac粒度",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_act_user_active_1d"
    ],
    "field_count": 13,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "mac",
        "type": "VARCHAR(32)",
        "desc": "mac",
        "business": "mac",
        "role": "attr"
      },
      {
        "name": "userid",
        "type": "VARCHAR(32)",
        "desc": "userid",
        "business": "userid",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "region_id",
        "type": "VARCHAR(10)",
        "desc": "region_id",
        "business": "region_id",
        "role": "fk"
      },
      {
        "name": "is_only_launcher",
        "type": "TINYINT(1)",
        "desc": "只开机用户",
        "business": "只开机用户",
        "role": "attr"
      },
      {
        "name": "is_vod_active",
        "type": "TINYINT(1)",
        "desc": "is_vod_active",
        "business": "is_vod_active",
        "role": "attr"
      },
      {
        "name": "is_live_active",
        "type": "TINYINT(1)",
        "desc": "is_live_active",
        "business": "is_live_active",
        "role": "attr"
      },
      {
        "name": "launcher_cnt",
        "type": "INT",
        "desc": "launcher_cnt",
        "business": "launcher_cnt",
        "role": "attr"
      },
      {
        "name": "vod_play_cnt",
        "type": "INT",
        "desc": "vod_play_cnt",
        "business": "vod_play_cnt",
        "role": "attr"
      },
      {
        "name": "vod_play_dur",
        "type": "INT",
        "desc": "vod_play_dur",
        "business": "vod_play_dur",
        "role": "attr"
      },
      {
        "name": "live_play_dur",
        "type": "INT",
        "desc": "live_play_dur",
        "business": "live_play_dur",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_content_series_play_1d",
    "name_cn": "剧集日播放·series粒度",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·剧集日播放·series粒度",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_content_series_play_1d"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "category_id",
        "type": "VARCHAR(10)",
        "desc": "category_id",
        "business": "category_id",
        "role": "fk"
      },
      {
        "name": "genre_id",
        "type": "VARCHAR(10)",
        "desc": "genre_id",
        "business": "genre_id",
        "role": "fk"
      },
      {
        "name": "is_kids",
        "type": "TINYINT(1)",
        "desc": "is_kids",
        "business": "is_kids",
        "role": "attr"
      },
      {
        "name": "vv",
        "type": "INT",
        "desc": "vv",
        "business": "vv",
        "role": "attr"
      },
      {
        "name": "uv",
        "type": "INT",
        "desc": "uv",
        "business": "uv",
        "role": "attr"
      },
      {
        "name": "play_dur",
        "type": "INT",
        "desc": "play_dur",
        "business": "play_dur",
        "role": "attr"
      },
      {
        "name": "finish_cnt",
        "type": "INT",
        "desc": "finish_cnt",
        "business": "finish_cnt",
        "role": "attr"
      },
      {
        "name": "complete_rate_avg",
        "type": "DECIMAL(5,2)",
        "desc": "complete_rate_avg",
        "business": "complete_rate_avg",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_content_episode_play_1d",
    "name_cn": "单集日播放·episode粒度",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·单集日播放·episode粒度",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_content_episode_play_1d"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "episode_id",
        "type": "VARCHAR(20)",
        "desc": "episode_id",
        "business": "episode_id",
        "role": "fk"
      },
      {
        "name": "series_id",
        "type": "VARCHAR(20)",
        "desc": "series_id",
        "business": "series_id",
        "role": "fk"
      },
      {
        "name": "vv",
        "type": "INT",
        "desc": "vv",
        "business": "vv",
        "role": "attr"
      },
      {
        "name": "uv",
        "type": "INT",
        "desc": "uv",
        "business": "uv",
        "role": "attr"
      },
      {
        "name": "play_dur",
        "type": "INT",
        "desc": "play_dur",
        "business": "play_dur",
        "role": "attr"
      },
      {
        "name": "finish_cnt",
        "type": "INT",
        "desc": "finish_cnt",
        "business": "finish_cnt",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_content_live_play_1d",
    "name_cn": "直播频道日播放",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·直播频道日播放",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_content_live_play_1d"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "channel_id",
        "type": "VARCHAR(20)",
        "desc": "channel_id",
        "business": "channel_id",
        "role": "fk"
      },
      {
        "name": "channel_cat_id",
        "type": "VARCHAR(10)",
        "desc": "channel_cat_id",
        "business": "channel_cat_id",
        "role": "fk"
      },
      {
        "name": "vv",
        "type": "INT",
        "desc": "vv",
        "business": "vv",
        "role": "attr"
      },
      {
        "name": "uv",
        "type": "INT",
        "desc": "uv",
        "business": "uv",
        "role": "attr"
      },
      {
        "name": "play_dur",
        "type": "INT",
        "desc": "play_dur",
        "business": "play_dur",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_trade_cashier_funnel_1d",
    "name_cn": "收银台漏斗日汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·收银台漏斗日汇总",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_trade_cashier_funnel_1d"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "src_type",
        "type": "VARCHAR(20)",
        "desc": "src_type",
        "business": "src_type",
        "role": "attr"
      },
      {
        "name": "expose_cnt",
        "type": "INT",
        "desc": "expose_cnt",
        "business": "expose_cnt",
        "role": "attr"
      },
      {
        "name": "click_cnt",
        "type": "INT",
        "desc": "click_cnt",
        "business": "click_cnt",
        "role": "attr"
      },
      {
        "name": "verify_cnt",
        "type": "INT",
        "desc": "verify_cnt",
        "business": "verify_cnt",
        "role": "attr"
      },
      {
        "name": "confirm_cnt",
        "type": "INT",
        "desc": "confirm_cnt",
        "business": "confirm_cnt",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_trade_order_1d",
    "name_cn": "订购/分成日汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·订购/分成日汇总",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_trade_order_1d"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "pay_type",
        "type": "VARCHAR(20)",
        "desc": "pay_type",
        "business": "pay_type",
        "role": "attr"
      },
      {
        "name": "src_type",
        "type": "VARCHAR(20)",
        "desc": "src_type",
        "business": "src_type",
        "role": "attr"
      },
      {
        "name": "order_cnt",
        "type": "INT",
        "desc": "order_cnt",
        "business": "order_cnt",
        "role": "attr"
      },
      {
        "name": "unsub_cnt",
        "type": "INT",
        "desc": "unsub_cnt",
        "business": "unsub_cnt",
        "role": "attr"
      },
      {
        "name": "order_amount",
        "type": "DECIMAL(15,2)",
        "desc": "order_amount",
        "business": "order_amount",
        "role": "attr"
      },
      {
        "name": "revenue_share",
        "type": "DECIMAL(15,2)",
        "desc": "revenue_share",
        "business": "revenue_share",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_user_lifecycle_1d",
    "name_cn": "用户生命周期日汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·用户生命周期日汇总",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_user_lifecycle_1d"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "pk"
      },
      {
        "name": "new_register",
        "type": "INT",
        "desc": "new_register",
        "business": "new_register",
        "role": "attr"
      },
      {
        "name": "new_activate",
        "type": "INT",
        "desc": "new_activate",
        "business": "new_activate",
        "role": "attr"
      },
      {
        "name": "silent_cnt",
        "type": "INT",
        "desc": "silent_cnt",
        "business": "silent_cnt",
        "role": "attr"
      },
      {
        "name": "churn_cnt",
        "type": "INT",
        "desc": "churn_cnt",
        "business": "churn_cnt",
        "role": "attr"
      },
      {
        "name": "active_users",
        "type": "INT",
        "desc": "active_users",
        "business": "active_users",
        "role": "attr"
      },
      {
        "name": "active_stb",
        "type": "INT",
        "desc": "active_stb",
        "business": "active_stb",
        "role": "attr"
      },
      {
        "name": "active_speaker",
        "type": "INT",
        "desc": "active_speaker",
        "business": "active_speaker",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_user_retention_1d",
    "name_cn": "留存同期群日汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·留存同期群日汇总",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_user_retention_1d"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "cohort_date",
        "type": "DATE",
        "desc": "cohort_date",
        "business": "cohort_date",
        "role": "attr"
      },
      {
        "name": "day_offset",
        "type": "INT",
        "desc": "day_offset",
        "business": "day_offset",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VARCHAR(10)",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "cohort_users",
        "type": "INT",
        "desc": "cohort_users",
        "business": "cohort_users",
        "role": "attr"
      },
      {
        "name": "retained_users",
        "type": "INT",
        "desc": "retained_users",
        "business": "retained_users",
        "role": "attr"
      },
      {
        "name": "retention_rate",
        "type": "DECIMAL(5,2)",
        "desc": "retention_rate",
        "business": "retention_rate",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "type": "VARCHAR(32)",
        "desc": "etl_batch_id",
        "business": "etl_batch_id",
        "role": "fk"
      }
    ]
  },
  {
    "name": "v_dau_overview",
    "name_cn": "日活总览",
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
    "field_count": 7,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "total_dau",
        "type": "VIEW",
        "desc": "total_dau",
        "business": "total_dau",
        "role": "attr"
      },
      {
        "name": "dau_stb",
        "type": "VIEW",
        "desc": "dau_stb",
        "business": "dau_stb",
        "role": "attr"
      },
      {
        "name": "dau_speaker",
        "type": "VIEW",
        "desc": "dau_speaker",
        "business": "dau_speaker",
        "role": "attr"
      },
      {
        "name": "vod_active",
        "type": "VIEW",
        "desc": "vod_active",
        "business": "vod_active",
        "role": "attr"
      },
      {
        "name": "live_active",
        "type": "VIEW",
        "desc": "live_active",
        "business": "live_active",
        "role": "attr"
      },
      {
        "name": "only_launcher",
        "type": "VIEW",
        "desc": "only_launcher",
        "business": "only_launcher",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_lifecycle",
    "name_cn": "生命周期",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_lifecycle 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_lifecycle"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "new_register",
        "type": "VIEW",
        "desc": "new_register",
        "business": "new_register",
        "role": "attr"
      },
      {
        "name": "new_activate",
        "type": "VIEW",
        "desc": "new_activate",
        "business": "new_activate",
        "role": "attr"
      },
      {
        "name": "silent_cnt",
        "type": "VIEW",
        "desc": "silent_cnt",
        "business": "silent_cnt",
        "role": "attr"
      },
      {
        "name": "churn_cnt",
        "type": "VIEW",
        "desc": "churn_cnt",
        "business": "churn_cnt",
        "role": "attr"
      },
      {
        "name": "active_users",
        "type": "VIEW",
        "desc": "active_users",
        "business": "active_users",
        "role": "attr"
      },
      {
        "name": "active_stb",
        "type": "VIEW",
        "desc": "active_stb",
        "business": "active_stb",
        "role": "attr"
      },
      {
        "name": "active_speaker",
        "type": "VIEW",
        "desc": "active_speaker",
        "business": "active_speaker",
        "role": "attr"
      },
      {
        "name": "approx_net_growth",
        "type": "VIEW",
        "desc": "approx_net_growth",
        "business": "approx_net_growth",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_lifecycle",
    "name_cn": "用户生命周期",
    "layer": "ADS",
    "type": "view",
    "purpose": "用户生命周期（同义 v_lifecycle）",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_lifecycle"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "new_register",
        "type": "VIEW",
        "desc": "new_register",
        "business": "new_register",
        "role": "attr"
      },
      {
        "name": "new_activate",
        "type": "VIEW",
        "desc": "new_activate",
        "business": "new_activate",
        "role": "attr"
      },
      {
        "name": "silent_cnt",
        "type": "VIEW",
        "desc": "silent_cnt",
        "business": "silent_cnt",
        "role": "attr"
      },
      {
        "name": "churn_cnt",
        "type": "VIEW",
        "desc": "churn_cnt",
        "business": "churn_cnt",
        "role": "attr"
      },
      {
        "name": "active_users",
        "type": "VIEW",
        "desc": "active_users",
        "business": "active_users",
        "role": "attr"
      },
      {
        "name": "active_stb",
        "type": "VIEW",
        "desc": "active_stb",
        "business": "active_stb",
        "role": "attr"
      },
      {
        "name": "active_speaker",
        "type": "VIEW",
        "desc": "active_speaker",
        "business": "active_speaker",
        "role": "attr"
      },
      {
        "name": "approx_net_growth",
        "type": "VIEW",
        "desc": "approx_net_growth",
        "business": "approx_net_growth",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_retention_decomposition",
    "name_cn": "留存分解",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_retention_decomposition 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_retention_decomposition"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "cohort_date",
        "type": "VIEW",
        "desc": "cohort_date",
        "business": "cohort_date",
        "role": "attr"
      },
      {
        "name": "day_offset",
        "type": "VIEW",
        "desc": "day_offset",
        "business": "day_offset",
        "role": "attr"
      },
      {
        "name": "device_type",
        "type": "VIEW",
        "desc": "device_type",
        "business": "device_type",
        "role": "attr"
      },
      {
        "name": "cohort_users",
        "type": "VIEW",
        "desc": "cohort_users",
        "business": "cohort_users",
        "role": "attr"
      },
      {
        "name": "retained_users",
        "type": "VIEW",
        "desc": "retained_users",
        "business": "retained_users",
        "role": "attr"
      },
      {
        "name": "retention_rate",
        "type": "VIEW",
        "desc": "retention_rate",
        "business": "retention_rate",
        "role": "attr"
      },
      {
        "name": "retention_pct_check",
        "type": "VIEW",
        "desc": "retention_pct_check",
        "business": "retention_pct_check",
        "role": "attr"
      },
      {
        "name": "retention_bucket",
        "type": "VIEW",
        "desc": "retention_bucket",
        "business": "retention_bucket",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_retention",
    "name_cn": "用户留存",
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
    "fields": [
      {
        "name": "cohort_date",
        "type": "VIEW",
        "desc": "cohort_date",
        "business": "cohort_date",
        "role": "attr"
      },
      {
        "name": "day_offset",
        "type": "VIEW",
        "desc": "day_offset",
        "business": "day_offset",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VIEW",
        "desc": "channel_code",
        "business": "channel_code",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VIEW",
        "desc": "product_line",
        "business": "product_line",
        "role": "attr"
      },
      {
        "name": "cohort_users",
        "type": "VIEW",
        "desc": "cohort_users",
        "business": "cohort_users",
        "role": "attr"
      },
      {
        "name": "retained_users",
        "type": "VIEW",
        "desc": "retained_users",
        "business": "retained_users",
        "role": "attr"
      },
      {
        "name": "retention_rate",
        "type": "VIEW",
        "desc": "retention_rate",
        "business": "retention_rate",
        "role": "attr"
      },
      {
        "name": "platform",
        "type": "VIEW",
        "desc": "platform",
        "business": "platform",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_segment",
    "name_cn": "用户分群",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_segment 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_segment"
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "segment_code",
        "type": "VIEW",
        "desc": "segment_code",
        "business": "segment_code",
        "role": "attr"
      },
      {
        "name": "segment_name",
        "type": "VIEW",
        "desc": "segment_name",
        "business": "segment_name",
        "role": "attr"
      },
      {
        "name": "user_count",
        "type": "VIEW",
        "desc": "user_count",
        "business": "user_count",
        "role": "attr"
      },
      {
        "name": "avg_days_since_active",
        "type": "VIEW",
        "desc": "avg_days_since_active",
        "business": "avg_days_since_active",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_channel_attribution",
    "name_cn": "渠道归因",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_channel_attribution 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_channel_attribution"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "touch_point",
        "type": "VIEW",
        "desc": "touch_point",
        "business": "touch_point",
        "role": "attr"
      },
      {
        "name": "attribution_model",
        "type": "VIEW",
        "desc": "attribution_model",
        "business": "attribution_model",
        "role": "attr"
      },
      {
        "name": "attributed_orders",
        "type": "VIEW",
        "desc": "attributed_orders",
        "business": "attributed_orders",
        "role": "attr"
      },
      {
        "name": "attributed_amount",
        "type": "VIEW",
        "desc": "attributed_amount",
        "business": "attributed_amount",
        "role": "attr"
      },
      {
        "name": "attributed_revenue_share",
        "type": "VIEW",
        "desc": "attributed_revenue_share",
        "business": "attributed_revenue_share",
        "role": "attr"
      },
      {
        "name": "order_share_pct",
        "type": "VIEW",
        "desc": "order_share_pct",
        "business": "order_share_pct",
        "role": "attr"
      },
      {
        "name": "linear_weight",
        "type": "VIEW",
        "desc": "linear_weight",
        "business": "linear_weight",
        "role": "attr"
      },
      {
        "name": "time_decay_weight",
        "type": "VIEW",
        "desc": "time_decay_weight",
        "business": "time_decay_weight",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_ab_experiment",
    "name_cn": "AB实验",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_ab_experiment 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_ab_experiment"
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "f.snapshot_date",
        "type": "VIEW",
        "desc": "f.snapshot_date",
        "business": "f.snapshot_date",
        "role": "attr"
      },
      {
        "name": "experiment_name",
        "type": "VIEW",
        "desc": "experiment_name",
        "business": "experiment_name",
        "role": "attr"
      },
      {
        "name": "variant",
        "type": "VIEW",
        "desc": "variant",
        "business": "variant",
        "role": "attr"
      },
      {
        "name": "sample_size",
        "type": "VIEW",
        "desc": "sample_size",
        "business": "sample_size",
        "role": "attr"
      },
      {
        "name": "f.click_cnt",
        "type": "VIEW",
        "desc": "f.click_cnt",
        "business": "f.click_cnt",
        "role": "attr"
      },
      {
        "name": "f.verify_cnt",
        "type": "VIEW",
        "desc": "f.verify_cnt",
        "business": "f.verify_cnt",
        "role": "attr"
      },
      {
        "name": "f.confirm_cnt",
        "type": "VIEW",
        "desc": "f.confirm_cnt",
        "business": "f.confirm_cnt",
        "role": "attr"
      },
      {
        "name": "ctr_pct",
        "type": "VIEW",
        "desc": "ctr_pct",
        "business": "ctr_pct",
        "role": "attr"
      },
      {
        "name": "cvr_pct",
        "type": "VIEW",
        "desc": "cvr_pct",
        "business": "cvr_pct",
        "role": "attr"
      },
      {
        "name": "click2verify_pct",
        "type": "VIEW",
        "desc": "click2verify_pct",
        "business": "click2verify_pct",
        "role": "attr"
      },
      {
        "name": "arm",
        "type": "VIEW",
        "desc": "arm",
        "business": "arm",
        "role": "attr"
      },
      {
        "name": "caveat",
        "type": "VIEW",
        "desc": "caveat",
        "business": "caveat",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_funnel",
    "name_cn": "转化漏斗",
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
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "VIEW",
        "desc": "snapshot_month",
        "business": "snapshot_month",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VIEW",
        "desc": "channel_code",
        "business": "channel_code",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VIEW",
        "desc": "product_line",
        "business": "product_line",
        "role": "attr"
      },
      {
        "name": "step_visit",
        "type": "VIEW",
        "desc": "step_visit",
        "business": "step_visit",
        "role": "attr"
      },
      {
        "name": "step_signup",
        "type": "VIEW",
        "desc": "step_signup",
        "business": "step_signup",
        "role": "attr"
      },
      {
        "name": "step_activate",
        "type": "VIEW",
        "desc": "step_activate",
        "business": "step_activate",
        "role": "attr"
      },
      {
        "name": "step_purchase",
        "type": "VIEW",
        "desc": "step_purchase",
        "business": "step_purchase",
        "role": "attr"
      },
      {
        "name": "signup_rate",
        "type": "VIEW",
        "desc": "signup_rate",
        "business": "signup_rate",
        "role": "attr"
      },
      {
        "name": "purchase_rate",
        "type": "VIEW",
        "desc": "purchase_rate",
        "business": "purchase_rate",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_ltv",
    "name_cn": "用户LTV",
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
    "field_count": 5,
    "fields": [
      {
        "name": "channel_name",
        "type": "VIEW",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "attr"
      },
      {
        "name": "user_count",
        "type": "VIEW",
        "desc": "user_count",
        "business": "user_count",
        "role": "attr"
      },
      {
        "name": "total_revenue",
        "type": "VIEW",
        "desc": "total_revenue",
        "business": "total_revenue",
        "role": "attr"
      },
      {
        "name": "ltv",
        "type": "VIEW",
        "desc": "ltv",
        "business": "ltv",
        "role": "attr"
      },
      {
        "name": "avg_revenue_share",
        "type": "VIEW",
        "desc": "avg_revenue_share",
        "business": "avg_revenue_share",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_rfm",
    "name_cn": "RFM分群",
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
    "field_count": 7,
    "fields": [
      {
        "name": "user_id",
        "type": "VIEW",
        "desc": "user_id",
        "business": "user_id",
        "role": "attr"
      },
      {
        "name": "user_segment",
        "type": "VIEW",
        "desc": "user_segment",
        "business": "user_segment",
        "role": "attr"
      },
      {
        "name": "rfm_segment",
        "type": "VIEW",
        "desc": "rfm_segment",
        "business": "rfm_segment",
        "role": "attr"
      },
      {
        "name": "recency_days",
        "type": "VIEW",
        "desc": "recency_days",
        "business": "recency_days",
        "role": "attr"
      },
      {
        "name": "frequency",
        "type": "VIEW",
        "desc": "frequency",
        "business": "frequency",
        "role": "attr"
      },
      {
        "name": "monetary",
        "type": "VIEW",
        "desc": "monetary",
        "business": "monetary",
        "role": "attr"
      },
      {
        "name": "u.snapshot_date",
        "type": "VIEW",
        "desc": "u.snapshot_date",
        "business": "u.snapshot_date",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_channel_analysis",
    "name_cn": "渠道分析",
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
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VIEW",
        "desc": "channel_code",
        "business": "channel_code",
        "role": "attr"
      },
      {
        "name": "channel_name",
        "type": "VIEW",
        "desc": "channel_name",
        "business": "channel_name",
        "role": "attr"
      },
      {
        "name": "spend_amount",
        "type": "VIEW",
        "desc": "spend_amount",
        "business": "spend_amount",
        "role": "attr"
      },
      {
        "name": "new_users",
        "type": "VIEW",
        "desc": "new_users",
        "business": "new_users",
        "role": "attr"
      },
      {
        "name": "new_devices",
        "type": "VIEW",
        "desc": "new_devices",
        "business": "new_devices",
        "role": "attr"
      },
      {
        "name": "cac",
        "type": "VIEW",
        "desc": "cac",
        "business": "cac",
        "role": "attr"
      },
      {
        "name": "conversion_rate",
        "type": "VIEW",
        "desc": "conversion_rate",
        "business": "conversion_rate",
        "role": "attr"
      },
      {
        "name": "pay_amount",
        "type": "VIEW",
        "desc": "pay_amount",
        "business": "pay_amount",
        "role": "attr"
      },
      {
        "name": "roi",
        "type": "VIEW",
        "desc": "roi",
        "business": "roi",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_portrait",
    "name_cn": "用户画像",
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
    "fields": [
      {
        "name": "a.device_type",
        "type": "VIEW",
        "desc": "a.device_type",
        "business": "a.device_type",
        "role": "attr"
      },
      {
        "name": "city_tier",
        "type": "VIEW",
        "desc": "city_tier",
        "business": "city_tier",
        "role": "attr"
      },
      {
        "name": "gender",
        "type": "VIEW",
        "desc": "gender",
        "business": "gender",
        "role": "attr"
      },
      {
        "name": "age_group",
        "type": "VIEW",
        "desc": "age_group",
        "business": "age_group",
        "role": "attr"
      },
      {
        "name": "user_count",
        "type": "VIEW",
        "desc": "user_count",
        "business": "user_count",
        "role": "attr"
      },
      {
        "name": "paid_count",
        "type": "VIEW",
        "desc": "paid_count",
        "business": "paid_count",
        "role": "attr"
      },
      {
        "name": "paid_rate_pct",
        "type": "VIEW",
        "desc": "paid_rate_pct",
        "business": "paid_rate_pct",
        "role": "attr"
      },
      {
        "name": "user_segment",
        "type": "VIEW",
        "desc": "user_segment",
        "business": "user_segment",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_path",
    "name_cn": "用户路径",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_path 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_path"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "prev_page",
        "type": "VIEW",
        "desc": "prev_page",
        "business": "prev_page",
        "role": "attr"
      },
      {
        "name": "next_page",
        "type": "VIEW",
        "desc": "next_page",
        "business": "next_page",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VIEW",
        "desc": "product_line",
        "business": "product_line",
        "role": "attr"
      },
      {
        "name": "user_count",
        "type": "VIEW",
        "desc": "user_count",
        "business": "user_count",
        "role": "attr"
      },
      {
        "name": "transition_count",
        "type": "VIEW",
        "desc": "transition_count",
        "business": "transition_count",
        "role": "attr"
      },
      {
        "name": "session_count",
        "type": "VIEW",
        "desc": "session_count",
        "business": "session_count",
        "role": "attr"
      },
      {
        "name": "avg_duration_sec",
        "type": "VIEW",
        "desc": "avg_duration_sec",
        "business": "avg_duration_sec",
        "role": "attr"
      },
      {
        "name": "drop_off_count",
        "type": "VIEW",
        "desc": "drop_off_count",
        "business": "drop_off_count",
        "role": "attr"
      },
      {
        "name": "drop_off_rate",
        "type": "VIEW",
        "desc": "drop_off_rate",
        "business": "drop_off_rate",
        "role": "attr"
      },
      {
        "name": "transition_share_pct",
        "type": "VIEW",
        "desc": "transition_share_pct",
        "business": "transition_share_pct",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_path_session",
    "name_cn": "会话路径",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_path_session 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_path_session"
    ],
    "field_count": 13,
    "fields": [
      {
        "name": "session_id",
        "type": "VIEW",
        "desc": "session_id",
        "business": "session_id",
        "role": "attr"
      },
      {
        "name": "seq_no",
        "type": "VIEW",
        "desc": "seq_no",
        "business": "seq_no",
        "role": "attr"
      },
      {
        "name": "user_id",
        "type": "VIEW",
        "desc": "user_id",
        "business": "user_id",
        "role": "attr"
      },
      {
        "name": "device_id",
        "type": "VIEW",
        "desc": "device_id",
        "business": "device_id",
        "role": "attr"
      },
      {
        "name": "event_time",
        "type": "VIEW",
        "desc": "event_time",
        "business": "event_time",
        "role": "attr"
      },
      {
        "name": "product_line",
        "type": "VIEW",
        "desc": "product_line",
        "business": "product_line",
        "role": "attr"
      },
      {
        "name": "event_action",
        "type": "VIEW",
        "desc": "event_action",
        "business": "event_action",
        "role": "attr"
      },
      {
        "name": "event_action_name",
        "type": "VIEW",
        "desc": "event_action_name",
        "business": "event_action_name",
        "role": "attr"
      },
      {
        "name": "event_page",
        "type": "VIEW",
        "desc": "event_page",
        "business": "event_page",
        "role": "attr"
      },
      {
        "name": "prev_page",
        "type": "VIEW",
        "desc": "prev_page",
        "business": "prev_page",
        "role": "attr"
      },
      {
        "name": "next_page",
        "type": "VIEW",
        "desc": "next_page",
        "business": "next_page",
        "role": "attr"
      },
      {
        "name": "duration_to_next_sec",
        "type": "VIEW",
        "desc": "duration_to_next_sec",
        "business": "duration_to_next_sec",
        "role": "attr"
      },
      {
        "name": "is_conversion_step",
        "type": "VIEW",
        "desc": "is_conversion_step",
        "business": "is_conversion_step",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_top_paths",
    "name_cn": "热门路径",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_top_paths 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_top_paths"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "p.snapshot_date",
        "type": "VIEW",
        "desc": "p.snapshot_date",
        "business": "p.snapshot_date",
        "role": "attr"
      },
      {
        "name": "step1",
        "type": "VIEW",
        "desc": "step1",
        "business": "step1",
        "role": "attr"
      },
      {
        "name": "step2",
        "type": "VIEW",
        "desc": "step2",
        "business": "step2",
        "role": "attr"
      },
      {
        "name": "step3",
        "type": "VIEW",
        "desc": "step3",
        "business": "step3",
        "role": "attr"
      },
      {
        "name": "step1_2_cnt",
        "type": "VIEW",
        "desc": "step1_2_cnt",
        "business": "step1_2_cnt",
        "role": "attr"
      },
      {
        "name": "step2_3_cnt",
        "type": "VIEW",
        "desc": "step2_3_cnt",
        "business": "step2_3_cnt",
        "role": "attr"
      },
      {
        "name": "step2_3_retention_pct",
        "type": "VIEW",
        "desc": "step2_3_retention_pct",
        "business": "step2_3_retention_pct",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_revenue_structure",
    "name_cn": "收入结构",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_revenue_structure 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_revenue_structure"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "VIEW",
        "desc": "snapshot_month",
        "business": "snapshot_month",
        "role": "attr"
      },
      {
        "name": "channel_code",
        "type": "VIEW",
        "desc": "channel_code",
        "business": "channel_code",
        "role": "attr"
      },
      {
        "name": "order_cnt",
        "type": "VIEW",
        "desc": "order_cnt",
        "business": "order_cnt",
        "role": "attr"
      },
      {
        "name": "unsub_cnt",
        "type": "VIEW",
        "desc": "unsub_cnt",
        "business": "unsub_cnt",
        "role": "attr"
      },
      {
        "name": "order_amount",
        "type": "VIEW",
        "desc": "order_amount",
        "business": "order_amount",
        "role": "attr"
      },
      {
        "name": "revenue_share",
        "type": "VIEW",
        "desc": "revenue_share",
        "business": "revenue_share",
        "role": "attr"
      },
      {
        "name": "avg_order_price",
        "type": "VIEW",
        "desc": "avg_order_price",
        "business": "avg_order_price",
        "role": "attr"
      },
      {
        "name": "unsub_rate_pct",
        "type": "VIEW",
        "desc": "unsub_rate_pct",
        "business": "unsub_rate_pct",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_plan_analysis",
    "name_cn": "套餐分析",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_plan_analysis 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_plan_analysis"
    ],
    "field_count": 13,
    "fields": [
      {
        "name": "p.snapshot_month",
        "type": "VIEW",
        "desc": "p.snapshot_month",
        "business": "p.snapshot_month",
        "role": "attr"
      },
      {
        "name": "p.plan_type",
        "type": "VIEW",
        "desc": "p.plan_type",
        "business": "p.plan_type",
        "role": "attr"
      },
      {
        "name": "p.order_cnt",
        "type": "VIEW",
        "desc": "p.order_cnt",
        "business": "p.order_cnt",
        "role": "attr"
      },
      {
        "name": "p.unsub_cnt",
        "type": "VIEW",
        "desc": "p.unsub_cnt",
        "business": "p.unsub_cnt",
        "role": "attr"
      },
      {
        "name": "p.order_amount",
        "type": "VIEW",
        "desc": "p.order_amount",
        "business": "p.order_amount",
        "role": "attr"
      },
      {
        "name": "p.revenue_share",
        "type": "VIEW",
        "desc": "p.revenue_share",
        "business": "p.revenue_share",
        "role": "attr"
      },
      {
        "name": "p.new_user_cnt",
        "type": "VIEW",
        "desc": "p.new_user_cnt",
        "business": "p.new_user_cnt",
        "role": "attr"
      },
      {
        "name": "p.renewal_cnt",
        "type": "VIEW",
        "desc": "p.renewal_cnt",
        "business": "p.renewal_cnt",
        "role": "attr"
      },
      {
        "name": "p.unsub_rate",
        "type": "VIEW",
        "desc": "p.unsub_rate",
        "business": "p.unsub_rate",
        "role": "attr"
      },
      {
        "name": "p.avg_order_price",
        "type": "VIEW",
        "desc": "p.avg_order_price",
        "business": "p.avg_order_price",
        "role": "attr"
      },
      {
        "name": "order_share_pct",
        "type": "VIEW",
        "desc": "order_share_pct",
        "business": "order_share_pct",
        "role": "attr"
      },
      {
        "name": "share_revenue_pct",
        "type": "VIEW",
        "desc": "share_revenue_pct",
        "business": "share_revenue_pct",
        "role": "attr"
      },
      {
        "name": "renewal_rate_pct",
        "type": "VIEW",
        "desc": "renewal_rate_pct",
        "business": "renewal_rate_pct",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_plan_ltv",
    "name_cn": "套餐LTV",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_plan_ltv 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_plan_ltv"
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "plan_type",
        "type": "VIEW",
        "desc": "plan_type",
        "business": "plan_type",
        "role": "attr"
      },
      {
        "name": "avg_monthly_revenue",
        "type": "VIEW",
        "desc": "avg_monthly_revenue",
        "business": "avg_monthly_revenue",
        "role": "attr"
      },
      {
        "name": "avg_lifetime_months",
        "type": "VIEW",
        "desc": "avg_lifetime_months",
        "business": "avg_lifetime_months",
        "role": "attr"
      },
      {
        "name": "estimated_ltv",
        "type": "VIEW",
        "desc": "estimated_ltv",
        "business": "estimated_ltv",
        "role": "attr"
      },
      {
        "name": "total_orders",
        "type": "VIEW",
        "desc": "total_orders",
        "business": "total_orders",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_arpu_trend",
    "name_cn": "ARPU趋势",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_arpu_trend 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_arpu_trend"
    ],
    "field_count": 4,
    "fields": [
      {
        "name": "snapshot_month",
        "type": "VIEW",
        "desc": "snapshot_month",
        "business": "snapshot_month",
        "role": "attr"
      },
      {
        "name": "arppu",
        "type": "VIEW",
        "desc": "arppu",
        "business": "arppu",
        "role": "attr"
      },
      {
        "name": "total_active_users",
        "type": "VIEW",
        "desc": "total_active_users",
        "business": "total_active_users",
        "role": "attr"
      },
      {
        "name": "arpu",
        "type": "VIEW",
        "desc": "arpu",
        "business": "arpu",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_activity_summary",
    "name_cn": "活跃汇总",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_activity_summary 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_activity_summary"
    ],
    "field_count": 18,
    "fields": [
      {
        "name": "a.activity_id",
        "type": "VIEW",
        "desc": "a.activity_id",
        "business": "a.activity_id",
        "role": "attr"
      },
      {
        "name": "a.activity_name",
        "type": "VIEW",
        "desc": "a.activity_name",
        "business": "a.activity_name",
        "role": "attr"
      },
      {
        "name": "a.activity_type",
        "type": "VIEW",
        "desc": "a.activity_type",
        "business": "a.activity_type",
        "role": "attr"
      },
      {
        "name": "a.start_date",
        "type": "VIEW",
        "desc": "a.start_date",
        "business": "a.start_date",
        "role": "attr"
      },
      {
        "name": "a.end_date",
        "type": "VIEW",
        "desc": "a.end_date",
        "business": "a.end_date",
        "role": "attr"
      },
      {
        "name": "a.budget_amount",
        "type": "VIEW",
        "desc": "a.budget_amount",
        "business": "a.budget_amount",
        "role": "attr"
      },
      {
        "name": "a.target_users",
        "type": "VIEW",
        "desc": "a.target_users",
        "business": "a.target_users",
        "role": "attr"
      },
      {
        "name": "duration_days",
        "type": "VIEW",
        "desc": "duration_days",
        "business": "duration_days",
        "role": "attr"
      },
      {
        "name": "total_reach_users",
        "type": "VIEW",
        "desc": "total_reach_users",
        "business": "total_reach_users",
        "role": "attr"
      },
      {
        "name": "total_participate_users",
        "type": "VIEW",
        "desc": "total_participate_users",
        "business": "total_participate_users",
        "role": "attr"
      },
      {
        "name": "total_orders",
        "type": "VIEW",
        "desc": "total_orders",
        "business": "total_orders",
        "role": "attr"
      },
      {
        "name": "total_order_amount",
        "type": "VIEW",
        "desc": "total_order_amount",
        "business": "total_order_amount",
        "role": "attr"
      },
      {
        "name": "total_revenue_share",
        "type": "VIEW",
        "desc": "total_revenue_share",
        "business": "total_revenue_share",
        "role": "attr"
      },
      {
        "name": "total_new_users",
        "type": "VIEW",
        "desc": "total_new_users",
        "business": "total_new_users",
        "role": "attr"
      },
      {
        "name": "avg_7d_retain_users",
        "type": "VIEW",
        "desc": "avg_7d_retain_users",
        "business": "avg_7d_retain_users",
        "role": "attr"
      },
      {
        "name": "roi_ratio",
        "type": "VIEW",
        "desc": "roi_ratio",
        "business": "roi_ratio",
        "role": "attr"
      },
      {
        "name": "participate_rate_pct",
        "type": "VIEW",
        "desc": "participate_rate_pct",
        "business": "participate_rate_pct",
        "role": "attr"
      },
      {
        "name": "order_conversion_pct",
        "type": "VIEW",
        "desc": "order_conversion_pct",
        "business": "order_conversion_pct",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_activity_daily_trend",
    "name_cn": "活跃日趋势",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_activity_daily_trend 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_activity_daily_trend"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "d.snapshot_date",
        "type": "VIEW",
        "desc": "d.snapshot_date",
        "business": "d.snapshot_date",
        "role": "attr"
      },
      {
        "name": "a.activity_name",
        "type": "VIEW",
        "desc": "a.activity_name",
        "business": "a.activity_name",
        "role": "attr"
      },
      {
        "name": "a.activity_type",
        "type": "VIEW",
        "desc": "a.activity_type",
        "business": "a.activity_type",
        "role": "attr"
      },
      {
        "name": "d.reach_users",
        "type": "VIEW",
        "desc": "d.reach_users",
        "business": "d.reach_users",
        "role": "attr"
      },
      {
        "name": "d.participate_users",
        "type": "VIEW",
        "desc": "d.participate_users",
        "business": "d.participate_users",
        "role": "attr"
      },
      {
        "name": "d.order_cnt",
        "type": "VIEW",
        "desc": "d.order_cnt",
        "business": "d.order_cnt",
        "role": "attr"
      },
      {
        "name": "d.order_amount",
        "type": "VIEW",
        "desc": "d.order_amount",
        "business": "d.order_amount",
        "role": "attr"
      },
      {
        "name": "d.revenue_share",
        "type": "VIEW",
        "desc": "d.revenue_share",
        "business": "d.revenue_share",
        "role": "attr"
      },
      {
        "name": "d.new_user_cnt",
        "type": "VIEW",
        "desc": "d.new_user_cnt",
        "business": "d.new_user_cnt",
        "role": "attr"
      },
      {
        "name": "d.unconverted_users",
        "type": "VIEW",
        "desc": "d.unconverted_users",
        "business": "d.unconverted_users",
        "role": "attr"
      },
      {
        "name": "d.cost_amount",
        "type": "VIEW",
        "desc": "d.cost_amount",
        "business": "d.cost_amount",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_health_dashboard",
    "name_cn": "健康度看板",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_health_dashboard 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_health_dashboard"
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "metric_group",
        "type": "VIEW",
        "desc": "metric_group",
        "business": "metric_group",
        "role": "attr"
      },
      {
        "name": "metric_code",
        "type": "VIEW",
        "desc": "metric_code",
        "business": "metric_code",
        "role": "attr"
      },
      {
        "name": "metric_name",
        "type": "VIEW",
        "desc": "metric_name",
        "business": "metric_name",
        "role": "attr"
      },
      {
        "name": "metric_value",
        "type": "VIEW",
        "desc": "metric_value",
        "business": "metric_value",
        "role": "attr"
      },
      {
        "name": "metric_unit",
        "type": "VIEW",
        "desc": "metric_unit",
        "business": "metric_unit",
        "role": "attr"
      },
      {
        "name": "baseline_value",
        "type": "VIEW",
        "desc": "baseline_value",
        "business": "baseline_value",
        "role": "attr"
      },
      {
        "name": "threshold_green",
        "type": "VIEW",
        "desc": "threshold_green",
        "business": "threshold_green",
        "role": "attr"
      },
      {
        "name": "threshold_red",
        "type": "VIEW",
        "desc": "threshold_red",
        "business": "threshold_red",
        "role": "attr"
      },
      {
        "name": "status",
        "type": "VIEW",
        "desc": "status",
        "business": "status",
        "role": "attr"
      },
      {
        "name": "mom_change_pct",
        "type": "VIEW",
        "desc": "mom_change_pct",
        "business": "mom_change_pct",
        "role": "attr"
      },
      {
        "name": "status_icon",
        "type": "VIEW",
        "desc": "status_icon",
        "business": "status_icon",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_health_group_summary",
    "name_cn": "健康度分组",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_health_group_summary 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_health_group_summary"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "VIEW",
        "desc": "snapshot_date",
        "business": "snapshot_date",
        "role": "attr"
      },
      {
        "name": "metric_group",
        "type": "VIEW",
        "desc": "metric_group",
        "business": "metric_group",
        "role": "attr"
      },
      {
        "name": "metric_count",
        "type": "VIEW",
        "desc": "metric_count",
        "business": "metric_count",
        "role": "attr"
      },
      {
        "name": "green_count",
        "type": "VIEW",
        "desc": "green_count",
        "business": "green_count",
        "role": "attr"
      },
      {
        "name": "yellow_count",
        "type": "VIEW",
        "desc": "yellow_count",
        "business": "yellow_count",
        "role": "attr"
      },
      {
        "name": "red_count",
        "type": "VIEW",
        "desc": "red_count",
        "business": "red_count",
        "role": "attr"
      },
      {
        "name": "health_score_pct",
        "type": "VIEW",
        "desc": "health_score_pct",
        "business": "health_score_pct",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_tag_overview",
    "name_cn": "用户标签总览",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_tag_overview 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_tag_overview"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "t.snapshot_date",
        "type": "VIEW",
        "desc": "t.snapshot_date",
        "business": "t.snapshot_date",
        "role": "attr"
      },
      {
        "name": "t.tag_code",
        "type": "VIEW",
        "desc": "t.tag_code",
        "business": "t.tag_code",
        "role": "attr"
      },
      {
        "name": "tg.tag_name",
        "type": "VIEW",
        "desc": "tg.tag_name",
        "business": "tg.tag_name",
        "role": "attr"
      },
      {
        "name": "tg.tag_category",
        "type": "VIEW",
        "desc": "tg.tag_category",
        "business": "tg.tag_category",
        "role": "attr"
      },
      {
        "name": "tg.tag_color",
        "type": "VIEW",
        "desc": "tg.tag_color",
        "business": "tg.tag_color",
        "role": "attr"
      },
      {
        "name": "user_count",
        "type": "VIEW",
        "desc": "user_count",
        "business": "user_count",
        "role": "attr"
      },
      {
        "name": "t.tag_value",
        "type": "VIEW",
        "desc": "t.tag_value",
        "business": "t.tag_value",
        "role": "attr"
      },
      {
        "name": "t.tag_source",
        "type": "VIEW",
        "desc": "t.tag_source",
        "business": "t.tag_source",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_tag_detail",
    "name_cn": "用户标签明细",
    "layer": "ADS",
    "type": "view",
    "purpose": "用户标签明细视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_tag_detail"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "user_id",
        "type": "VARCHAR",
        "desc": "用户ID",
        "business": "用户ID",
        "role": "bk"
      },
      {
        "name": "tag_summary",
        "type": "TEXT",
        "desc": "标签摘要",
        "business": "标签摘要",
        "role": "attr"
      },
      {
        "name": "demographic_tags",
        "type": "TEXT",
        "desc": "人口标签",
        "business": "人口标签",
        "role": "attr"
      },
      {
        "name": "behavior_tags",
        "type": "TEXT",
        "desc": "行为标签",
        "business": "行为标签",
        "role": "attr"
      },
      {
        "name": "value_tags",
        "type": "TEXT",
        "desc": "价值标签",
        "business": "价值标签",
        "role": "attr"
      },
      {
        "name": "content_pref_tags",
        "type": "TEXT",
        "desc": "内容偏好标签",
        "business": "内容偏好标签",
        "role": "attr"
      },
      {
        "name": "lifecycle_tags",
        "type": "TEXT",
        "desc": "生命周期标签",
        "business": "生命周期标签",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_user_tag_by_category",
    "name_cn": "标签分类汇总",
    "layer": "ADS",
    "type": "view",
    "purpose": "v_user_tag_by_category 分析视图",
    "source": "internet_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "v_user_tag_by_category"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "tg.tag_category",
        "type": "VIEW",
        "desc": "tg.tag_category",
        "business": "tg.tag_category",
        "role": "attr"
      },
      {
        "name": "tg.tag_code",
        "type": "VIEW",
        "desc": "tg.tag_code",
        "business": "tg.tag_code",
        "role": "attr"
      },
      {
        "name": "tg.tag_name",
        "type": "VIEW",
        "desc": "tg.tag_name",
        "business": "tg.tag_name",
        "role": "attr"
      },
      {
        "name": "tg.tag_color",
        "type": "VIEW",
        "desc": "tg.tag_color",
        "business": "tg.tag_color",
        "role": "attr"
      },
      {
        "name": "tg.tag_type",
        "type": "VIEW",
        "desc": "tg.tag_type",
        "business": "tg.tag_type",
        "role": "attr"
      },
      {
        "name": "t.tag_value",
        "type": "VIEW",
        "desc": "t.tag_value",
        "business": "t.tag_value",
        "role": "attr"
      },
      {
        "name": "user_count",
        "type": "VIEW",
        "desc": "user_count",
        "business": "user_count",
        "role": "attr"
      },
      {
        "name": "category_share_pct",
        "type": "VIEW",
        "desc": "category_share_pct",
        "business": "category_share_pct",
        "role": "attr"
      }
    ]
  }
];
window.WAREHOUSE_FIELD_OVERVIEW=[
  {
    "layer": "DIM",
    "table_name": "dim_province",
    "field_count": 2,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_region",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_content_genre",
    "field_count": 2,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_content_category",
    "field_count": 3,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_content_cp",
    "field_count": 3,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_content_series",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_content_episode",
    "field_count": 5,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_channel_category",
    "field_count": 2,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_live_channel",
    "field_count": 3,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_device_type",
    "field_count": 2,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_device_model",
    "field_count": 3,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_firmware",
    "field_count": 2,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_device",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_user_package",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_user",
    "field_count": 6,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_month",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_week",
    "field_count": 5,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_date",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_device_info_df",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_content_series_df",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_content_episode_df",
    "field_count": 6,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_live_channel_df",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_log_launcher_di",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_log_vod_di",
    "field_count": 15,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_log_live_di",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_log_cashier_di",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_user_register_di",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_user_unsubscribe_di",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_order_di",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_act_launcher_di",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_vod_play_di",
    "field_count": 18,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_live_play_di",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_trade_cashier_di",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_trade_order_di",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_user_status_di",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_act_user_active_1d",
    "field_count": 13,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_content_series_play_1d",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_content_episode_play_1d",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_content_live_play_1d",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_trade_cashier_funnel_1d",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_trade_order_1d",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_user_lifecycle_1d",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_user_retention_1d",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_dau_overview",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_lifecycle",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_lifecycle",
    "field_count": 0,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_retention_decomposition",
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
    "table_name": "v_user_segment",
    "field_count": 5,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_channel_attribution",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_ab_experiment",
    "field_count": 12,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_funnel",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_ltv",
    "field_count": 5,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_rfm",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_channel_analysis",
    "field_count": 10,
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
    "table_name": "v_user_path",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_path_session",
    "field_count": 13,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_top_paths",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_revenue_structure",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_plan_analysis",
    "field_count": 13,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_plan_ltv",
    "field_count": 5,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_arpu_trend",
    "field_count": 4,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_activity_summary",
    "field_count": 18,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_activity_daily_trend",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_health_dashboard",
    "field_count": 12,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_health_group_summary",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_tag_overview",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_tag_detail",
    "field_count": 0,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_user_tag_by_category",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  }
];
