/** 制造业 · 分阶段北极星（数据展示） */
window.NORTHSTAR_PHASES = {
  industry: "manufacturing",
  subtitle: "智能制造项目按阶段演进：稳产交付 → 质量爬坡 → 设备效率 → 综合卓越（CMEI）。",
  currentPhaseId: "p4",
  phases: [
    {
      id: "p1",
      name: "稳产交付",
      goal: "先按承诺交得出货，建立客户信任。",
      why: "产线爬坡初期，交期是最大痛点；过早合成 CMEI 会掩盖「欠交」问题。",
      northstar: {
        name: "OTD 准时交付率",
        formula: "按时交付批次 ÷ 应交付批次",
        value_display: "94.2",
        unit: "%",
      },
      guardrails: ["产量计划达成率", "重大安全事故 = 0", "关键物料齐套"],
      focus_dashboards: "生产总览 · 供应链 · 产能利用率",
    },
    {
      id: "p2",
      name: "质量爬坡",
      goal: "一次做对——把不良挡在出厂前。",
      why: "交期稳定后，质量成为瓶颈；本阶段北极星切到 FPY/良品率，为 OEE 与 CMEI 奠基。",
      northstar: {
        name: "FPY 一次合格率",
        formula: "一次合格数 ÷ 投入数 · dws_quality_daily",
        value_display: "96.8",
        unit: "%",
      },
      guardrails: ["来料 PPM", "单位成本不失控", "客诉批次"],
      focus_dashboards: "质量分析 · 缺陷柏拉图 · 供应商质量",
    },
    {
      id: "p3",
      name: "设备效率",
      goal: "在良品前提下把设备开动起来。",
      why: "质量稳住后挖潜产能：OEE 三因子（可用×表现×质量）成为主优化目标。",
      northstar: {
        name: "OEE",
        formula: "可用率 × 表现率 × 质量率",
        value_display: "78.5",
        unit: "%",
      },
      guardrails: ["良品率/FPY", "单位成本", "计划外停机时长"],
      focus_dashboards: "设备 OEE · 生产总览 · 人工效率",
    },
    {
      id: "p4",
      name: "综合卓越",
      goal: "交付×质量×效率一体优化——当前公司级北极星。",
      why: "单点指标易偏科；CMEI 把 OTD/FPY/OEE 加权合成，冲产能时围栏守住良品与成本。",
      northstar: {
        name: "CMEI",
        formula: "FPY×40% + OEE×35% + OTD×25%",
        value_display: "89.6",
        unit: "",
      },
      guardrails: ["良品率/FPY", "单位成本", "来料 PPM"],
      focus_dashboards: "生产总览（CMEI）· 质量 · 设备 · 成本",
    },
  ],
};
