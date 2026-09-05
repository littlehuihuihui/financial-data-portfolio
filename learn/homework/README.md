# 第 08 章作业 · JSON 自动检查

## 模板

复制 [`08-template.json`](08-template.json)，按你的主题修改。

拟新增对象请：

- 在 `ads_notes` 写明「拟新增」，或  
- 填入 `proposed_objects: ["v_xxx"]`

## 运行

```bash
cd portfolio
.\venv\Scripts\python.exe learn\homework\check_homework.py learn\homework\08-template.json
.\venv\Scripts\python.exe learn\homework\check_homework.py path\to\my_pack.json --industry internet
```

脚本会对照 `ott_ddl.sql` / `04_ott_ads_views.sql`（或零售/制造 DDL）检查 `tables.*` 表名是否可检索。

通过输出：`RESULT: PASS`
