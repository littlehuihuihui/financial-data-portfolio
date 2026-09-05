# 教材靶场（三套 SQL + 前端）

| Suite | 库 / 页 | TOKEN | 命令或入口 |
|-------|---------|-------|------------|
| dau | `learn_lab_dau` | `dnexus-lab-dau-v1-PASS` | `python learn/lab/run_lab.py` |
| vod | `learn_lab_vod` | `dnexus-lab-vod-v1-PASS` | `--suite vod` |
| funnel | `learn_lab_funnel` | `dnexus-lab-funnel-v1-PASS` | `--suite funnel` |
| front | KPI 映射页 | `dnexus-lab-front-v1-PASS` | `/learn/lab-frontend/kpi-map-lab.html` |

```bash
python learn/lab/run_lab.py --suite all
```

列对齐 `ott_ddl.sql`。漏斗教学 ADS 为日视图；现网 `v_funnel` 为月聚合。
