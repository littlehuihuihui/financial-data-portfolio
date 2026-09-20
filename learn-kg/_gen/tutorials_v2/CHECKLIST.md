# 质量校验清单

- [x] 每个图谱叶子节点都有对应教程
- [x] tutorial_id 等于 node_id
- [x] 每篇教程都有 navigation.prev / next 字段（首尾可为 null）
- [x] 每篇教程都有 exercise
- [x] 图表类教程有 steps
- [x] LOD 教程含 syntax + scenario
- [x] 迁移映射覆盖常见旧教程与平台旧叶 ID
- [x] JSON 可被 JSON.parse() / json.loads 解析
- [x] 课树 sql.json / bi.json 已与新图谱对齐
