/**
 * 课表 v5 · 三靶场 + 全栈 FS0–FS6 + 轨筛选 + 作业检查
 */
window.LEARN_CURRICULUM = {
  title: "数仓与分析实战教材",
  subtitle: "有据 · 三靶场 · 全栈 · 轨筛选 · 作业检查",
  storageKey: "dnexus-learn-progress-v5",
  tracks: {
    meta: "置顶/工具",
    "de-core": "DE 必修",
    "de-eng": "DE 工程",
    "de-lab": "DE 靶场",
    "de-mid": "DE 中级",
    analyst: "分析选修",
    contrast: "行业对照",
    fullstack: "全栈选修",
    review: "复习",
  },
  industries: {
    internet: { name: "互联网 OTT（主线）", base: "../industries/internet" },
    retail: { name: "零售（对照）", base: "../industries/retail" },
    manufacturing: { name: "制造（对照）", base: "../industries/manufacturing" },
  },
  lessons: [
    {
      id: "00b",
      file: "00b-three-realities.md",
      title: "三层现实（置顶必读）",
      duration: "15–20 min",
      track: "meta",
      tags: ["A灌数/B规范/C靶场"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "00c",
      file: "00c-abc-diff.md",
      title: "A/B/C 可视化对照",
      duration: "15–20 min",
      track: "meta",
      tags: ["降混淆"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "00",
      file: "00-map.md",
      title: "导论：为什么要建数仓、怎么学",
      duration: "45–60 min",
      track: "de-core",
      tags: ["理论", "小测"],
      jumps: {
        internet: [
          { label: "实验台：架构页", href: "../industries/internet/pages/architecture.html" }
        ],
        retail: [
          { label: "对照：架构页", href: "../industries/retail/pages/architecture.html" }
        ],
        manufacturing: [
          { label: "对照：架构页", href: "../industries/manufacturing/pages/architecture.html" }
        ]
      },
    },
    {
      id: "01",
      file: "01-layers.md",
      title: "数仓怎么建：五层与 Kimball",
      duration: "90–120 min",
      track: "de-core",
      tags: ["分层", "小测"],
      jumps: {
        internet: [
          { label: "实验台：全景", href: "../industries/internet/pages/panorama.html" }
        ],
        retail: [
          { label: "对照：全景", href: "../industries/retail/pages/panorama.html" }
        ],
        manufacturing: [
          { label: "对照：全景", href: "../industries/manufacturing/pages/panorama.html" }
        ]
      },
    },
    {
      id: "02",
      file: "02-er.md",
      title: "粒度、星型/雪花与 ER",
      duration: "75–90 min",
      track: "de-core",
      tags: ["粒度", "小测"],
      jumps: {
        internet: [
          { label: "实验台：ER", href: "../industries/internet/pages/er-diagram.html" },
          { label: "实验台：字典", href: "../industries/internet/pages/dictionary.html" }
        ],
        retail: [
          { label: "对照：ER", href: "../industries/retail/pages/er-diagram.html" }
        ],
        manufacturing: [
          { label: "对照：ER", href: "../industries/manufacturing/pages/er-diagram.html" }
        ]
      },
    },
    {
      id: "03",
      file: "03-pipeline.md",
      title: "层间怎么算（对齐 OTT DDL）",
      duration: "120–150 min",
      track: "de-core",
      tags: ["核心", "小测"],
      jumps: {
        internet: [
          { label: "实验台：全景", href: "../industries/internet/pages/panorama.html" },
          { label: "实验台：ETL", href: "../industries/internet/pages/architecture.html#etl-lineage-section" }
        ],
        retail: [
          { label: "对照：全景", href: "../industries/retail/pages/panorama.html" }
        ],
        manufacturing: [
          { label: "对照：全景", href: "../industries/manufacturing/pages/panorama.html" }
        ]
      },
    },
    {
      id: "04",
      file: "04-etl.md",
      title: "ETL：调度、依赖、质量与排障",
      duration: "90–120 min",
      track: "de-core",
      tags: ["调度", "小测"],
      jumps: {
        internet: [
          { label: "实验台：ETL（DAU）", href: "../industries/internet/pages/architecture.html?etlTable=v_dau_overview#etl-lineage-section" }
        ],
        retail: [
          { label: "对照：ETL", href: "../industries/retail/pages/architecture.html#etl-lineage-section" }
        ],
        manufacturing: [
          { label: "对照：ETL", href: "../industries/manufacturing/pages/architecture.html#etl-lineage-section" }
        ]
      },
    },
    {
      id: "E1",
      file: "E1-scd2.md",
      title: "工程：SCD 与本仓库现实",
      duration: "30–45 min",
      track: "de-eng",
      tags: ["SCD", "小测"],
      jumps: {
        internet: [
          { label: "字典", href: "../industries/internet/pages/dictionary.html" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "E2",
      file: "E2-late-backfill.md",
      title: "工程：迟到与回刷",
      duration: "30–45 min",
      track: "de-eng",
      tags: ["回刷", "小测"],
      jumps: {
        internet: [
          { label: "ETL", href: "../industries/internet/pages/architecture.html#etl-lineage-section" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "E3",
      file: "E3-idempotent.md",
      title: "工程：幂等与重跑",
      duration: "30–45 min",
      track: "de-eng",
      tags: ["幂等", "小测"],
      jumps: {
        internet: [
          { label: "全景", href: "../industries/internet/pages/panorama.html" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "E4",
      file: "E4-dq.md",
      title: "工程：DQ 门禁实战",
      duration: "30–45 min",
      track: "de-eng",
      tags: ["DQ", "小测"],
      jumps: {
        internet: [
          { label: "ETL（DAU）", href: "../industries/internet/pages/architecture.html?etlTable=v_dau_overview#etl-lineage-section" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "09",
      file: "09-lab-dau.md",
      title: "靶场①：日活弄坏再修好",
      duration: "60–90 min",
      track: "de-lab",
      tags: ["LAB_TOKEN", "小测"],
      jumps: {
        internet: [
          { label: "核对 v_dau_overview", href: "../industries/internet/pages/architecture.html?etlTable=v_dau_overview#etl-lineage-section" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "10",
      file: "10-lab-vod.md",
      title: "靶场②：点播完播率",
      duration: "60–90 min",
      track: "de-lab",
      tags: ["LAB_TOKEN", "小测"],
      jumps: {
        internet: [
          { label: "看板对照文", href: "learn-lesson.html?id=P2E" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "11",
      file: "11-lab-funnel.md",
      title: "靶场③：收银漏斗",
      duration: "60–90 min",
      track: "de-lab",
      tags: ["LAB_TOKEN", "小测"],
      jumps: {
        internet: [
          { label: "ETL v_funnel", href: "../industries/internet/pages/architecture.html?etlTable=v_funnel#etl-lineage-section" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "05",
      file: "05-metrics.md",
      title: "指标口径与看板消费",
      duration: "75–90 min",
      track: "de-core",
      tags: ["口径", "小测"],
      jumps: {
        internet: [
          { label: "看板", href: "../industries/internet/internet_dashboard.html" },
          { label: "字典", href: "../industries/internet/pages/dictionary.html" }
        ],
        retail: [
          { label: "对照：看板", href: "../industries/retail/retail_dashboard.html" }
        ],
        manufacturing: [
          { label: "对照：看板", href: "../industries/manufacturing/manufacturing_dashboard.html" }
        ]
      },
    },
    {
      id: "06",
      file: "06-methodology.md",
      title: "分析方法论（选修）",
      duration: "75–90 min",
      track: "analyst",
      tags: ["选修"],
      jumps: {
        internet: [
          { label: "方法论", href: "../industries/internet/pages/methodology.html" }
        ],
        retail: [
          { label: "六层+31问", href: "../industries/retail/pages/anomaly.html" }
        ],
        manufacturing: [
          { label: "方法论", href: "../industries/manufacturing/pages/methodology.html" }
        ]
      },
    },
    {
      id: "07",
      file: "07-kg.md",
      title: "元数据与血缘",
      duration: "60–75 min",
      track: "de-core",
      tags: ["血缘", "小测"],
      jumps: {
        internet: [
          { label: "平台图谱", href: "../industries/internet/pages/platform-graph.html" },
          { label: "数仓血缘", href: "../industries/internet/pages/knowledge-graph.html" }
        ],
        retail: [
          { label: "对照：图谱", href: "../industries/retail/pages/platform-graph.html" }
        ],
        manufacturing: [
          { label: "对照：图谱", href: "../industries/manufacturing/pages/platform-graph.html" }
        ]
      },
    },
    {
      id: "E5",
      file: "E5-perf.md",
      title: "中级：分区裁剪与倾斜",
      duration: "30–45 min",
      track: "de-mid",
      tags: ["性能", "小测"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "E6",
      file: "E6-cdc.md",
      title: "中级：CDC 与增量概念",
      duration: "30–45 min",
      track: "de-mid",
      tags: ["CDC", "小测"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "E7",
      file: "E7-contract.md",
      title: "中级：数据契约模板",
      duration: "30–45 min",
      track: "de-mid",
      tags: ["契约", "小测"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "CR",
      file: "cards/retail-halfday.md",
      title: "对照卡：零售半日设计",
      duration: "90 min",
      track: "contrast",
      tags: ["零售"],
      jumps: {
        retail: [
          { label: "零售架构", href: "../industries/retail/pages/architecture.html" }
        ],
        internet: [],
        manufacturing: []
      },
    },
    {
      id: "CM",
      file: "cards/manufacturing-halfday.md",
      title: "对照卡：制造半日设计",
      duration: "90 min",
      track: "contrast",
      tags: ["制造"],
      jumps: {
        manufacturing: [
          { label: "制造架构", href: "../industries/manufacturing/pages/architecture.html" }
        ],
        internet: [],
        retail: []
      },
    },
    {
      id: "08",
      file: "08-e2e.md",
      title: "端到端设计作业",
      duration: "120 min+",
      track: "de-core",
      tags: ["作业", "小测"],
      jumps: {
        internet: [
          { label: "全景", href: "../industries/internet/pages/panorama.html" },
          { label: "ETL", href: "../industries/internet/pages/architecture.html#etl-lineage-section" }
        ],
        retail: [
          { label: "对照：全景", href: "../industries/retail/pages/panorama.html" }
        ],
        manufacturing: [
          { label: "对照：全景", href: "../industries/manufacturing/pages/panorama.html" }
        ]
      },
    },
    {
      id: "HW",
      file: "homework/README.md",
      title: "工具：作业 JSON 自动检查",
      duration: "20 min",
      track: "meta",
      tags: ["check_homework"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "R",
      file: "R-review.md",
      title: "总复习与面试题库",
      duration: "60–90 min",
      track: "review",
      tags: ["自测"],
      jumps: {
        internet: [
          { label: "全景", href: "../industries/internet/pages/panorama.html" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "DEF",
      file: "DEFENSE-script.md",
      title: "工具：答辩口述脚本",
      duration: "15 min",
      track: "meta",
      tags: ["面试"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "CAL",
      file: "CALENDAR-7D.md",
      title: "工具：7 日学习日历",
      duration: "5 min",
      track: "meta",
      tags: ["打印"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "GLOSS",
      file: "GLOSSARY.md",
      title: "工具：术语表",
      duration: "10 min",
      track: "meta",
      tags: ["词典"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "ANS",
      file: "ANSWERS-对照题.md",
      title: "工具：对照题详答",
      duration: "按需",
      track: "meta",
      tags: ["校准"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "P2E",
      file: "P2e-dashboard-bridge.md",
      title: "工具：看板对照教程",
      duration: "20–30 min",
      track: "meta",
      tags: ["P2e"],
      jumps: {
        internet: [
          { label: "互联网看板", href: "../industries/internet/internet_dashboard.html" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS0",
      file: "FS0-stack-map.md",
      title: "全栈：技术栈地图",
      duration: "30–40 min",
      track: "fullstack",
      tags: ["五端口", "选修"],
      jumps: {
        internet: [
          { label: "平台首页", href: "../index.html" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS1",
      file: "FS1-platform-flask.md",
      title: "全栈：平台 Flask 与静态托管",
      duration: "45–60 min",
      track: "fullstack",
      tags: ["Flask", "选修"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS2",
      file: "FS2-api-proxy.md",
      title: "全栈：行业 API 与代理分流",
      duration: "45–60 min",
      track: "fullstack",
      tags: ["Proxy", "选修"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS3",
      file: "FS3-frontend-shell.md",
      title: "全栈：前端壳与数据加载",
      duration: "45–60 min",
      track: "fullstack",
      tags: ["Frontend", "选修"],
      jumps: {
        internet: [
          { label: "互联网看板", href: "../industries/internet/internet_dashboard.html" }
        ],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS4",
      file: "FS4-deploy.md",
      title: "全栈：部署 Pages vs 本机",
      duration: "30–40 min",
      track: "fullstack",
      tags: ["Deploy"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS5",
      file: "FS5-observability.md",
      title: "全栈：可观测与联调清单",
      duration: "30–45 min",
      track: "fullstack",
      tags: ["Ops"],
      jumps: {
        internet: [],
        retail: [],
        manufacturing: []
      },
    },
    {
      id: "FS6",
      file: "FS6-frontend-lab.md",
      title: "全栈：KPI 映射前端靶场",
      duration: "30–45 min",
      track: "fullstack",
      tags: ["FRONT_TOKEN", "小测"],
      jumps: {
        internet: [
          { label: "打开靶场页", href: "../learn/lab-frontend/kpi-map-lab.html" }
        ],
        retail: [],
        manufacturing: []
      },
    }
  ],
};
