#!/usr/bin/env python3
"""从 OTT DDL 生成新的数据字典（修复版v2：视图字段+中文名称）"""
import json
import re
from pathlib import Path

ROOT = Path(r'D:\cursor\多行业数据平台\portfolio\industries\internet\database')
ddl = (ROOT / 'ott_ddl.sql').read_text(encoding='utf-8')
ads_sql = (ROOT / '04_ott_ads_views.sql').read_text(encoding='utf-8')
objs = []

def parse_table_body(body):
    """解析表体，返回字段列表"""
    fields = []
    
    # 先把所有行连起来，然后按逗号拆分（处理括号嵌套）
    all_text = body.replace('\n', ' ').replace('\r', ' ')
    # 把多个空格换成一个
    all_text = re.sub(r'\s+', ' ', all_text).strip()
    
    # 按逗号拆分，处理括号嵌套
    parts = []
    current = ''
    depth = 0
    for char in all_text:
        if char == '(':
            depth += 1
            current += char
        elif char == ')':
            depth -= 1
            current += char
        elif char == ',' and depth == 0:
            parts.append(current.strip())
            current = ''
        else:
            current += char
    if current.strip():
        parts.append(current.strip())
    
    # 处理每个部分
    for part in parts:
        part = part.strip()
        if not part:
            continue
        
        upper_part = part.upper()
        
        # 跳过约束
        if (upper_part.startswith('PRIMARY KEY') or 
            upper_part.startswith('KEY ') or 
            upper_part.startswith('UNIQUE') or 
            upper_part.startswith('CONSTRAINT') or
            upper_part.startswith('INDEX') or
            upper_part.startswith('FOREIGN KEY')):
            continue
        
        # 提取字段名
        fm = re.match(r'(\w+)\s+', part)
        if not fm:
            continue
        fn = fm.group(1)
        
        # 提取字段类型（处理括号）
        type_start = len(fm.group(0))
        type_end = type_start
        depth = 0
        i = type_start
        while i < len(part):
            char = part[i]
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
                if depth == 0:
                    type_end = i + 1
                    break
            elif char == ' ' and depth == 0:
                type_end = i
                break
            i += 1
        else:
            type_end = len(part)
        
        ft = part[type_start:type_end].strip()
        
        # 提取注释
        desc_m = re.search(r"COMMENT\s+'([^']*)'", part, re.I)
        desc = desc_m.group(1) if desc_m else fn
        
        # 判断角色
        role = 'attr'
        if 'PRIMARY KEY' in upper_part:
            role = 'pk'
        elif fn.endswith('_id'):
            role = 'fk'
        
        fields.append({'name': fn, 'type': ft[:20], 'desc': desc, 'business': desc, 'role': role})
    
    return fields

def parse_view_fields(view_sql):
    """解析视图的SELECT字段"""
    fields = []
    
    # 提取SELECT和FROM之间的内容
    match = re.search(r'SELECT\s+(.*?)\s+FROM\s+', view_sql, re.S | re.I)
    if not match:
        return fields
    
    select_body = match.group(1)
    
    # 处理SELECT DISTINCT
    if select_body.upper().startswith('DISTINCT'):
        select_body = select_body[8:].strip()
    
    # 按逗号拆分字段（处理括号嵌套）
    parts = []
    current = ''
    depth = 0
    for char in select_body:
        if char == '(':
            depth += 1
            current += char
        elif char == ')':
            depth -= 1
            current += char
        elif char == ',' and depth == 0:
            parts.append(current.strip())
            current = ''
        else:
            current += char
    if current.strip():
        parts.append(current.strip())
    
    # 处理每个字段
    for part in parts:
        part = part.strip()
        if not part or part == '*':
            continue
        
        # 提取别名（AS xxx 或 空格xxx）
        alias_match = re.search(r'\s+AS\s+(\w+)\s*$', part, re.I)
        if alias_match:
            fn = alias_match.group(1)
            expr = part[:alias_match.start()].strip()
        else:
            # 没有别名，取最后一个单词
            fn = part.split()[-1].strip()
            expr = part
        
        # 字段类型未知，标记为VIEW
        ft = 'VIEW'
        desc = fn
        
        fields.append({'name': fn, 'type': ft, 'desc': desc, 'business': desc, 'role': 'attr'})
    
    return fields

def extract_chinese_name(purpose, layer):
    """从purpose里提取中文名称"""
    # 去掉前缀，比如 "ODS·"、"DIM·"、"DWD·"、"DWS·"、"ADS·"
    name = purpose
    for prefix in ['ODS·', 'DIM·', 'DWD·', 'DWS·', 'ADS·']:
        if name.startswith(prefix):
            name = name[len(prefix):]
            break
    
    # 去掉括号里的内容，比如"（雪花上级维）"、"（近3天）"
    name = re.sub(r'[（(].*?[）)]', '', name).strip()
    
    # 去掉末尾的"表"、"视图"、"宽表"、"汇总"等？不，保留
    return name

# 解析表
pattern = r"CREATE TABLE\s+(\w+)\s*\((.*?)\)\s*COMMENT\s*'([^']*)'\s*;"
matches = list(re.finditer(pattern, ddl, re.S | re.I))
print(f'Found {len(matches)} tables with COMMENT')

for m in matches:
    name, body, purpose = m.group(1), m.group(2), m.group(3)
    fields = parse_table_body(body)
    
    layer = (
        'ODS' if name.startswith('ods_')
        else 'DIM' if name.startswith('dim_')
        else 'DWD' if name.startswith('dwd_')
        else 'DWS' if name.startswith('dws_')
        else 'OTHER'
    )
    
    name_cn = extract_chinese_name(purpose, layer)
    
    objs.append({
        'name': name,
        'name_cn': name_cn,
        'layer': layer,
        'type': 'table',
        'purpose': purpose,
        'source': 'internet_analytics/database',
        'downstream': ['Web看板'],
        'lineage': [name],
        'field_count': len(fields),
        'fields': fields,
    })

# 解析视图
view_pattern = r"CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(\w+)\s+AS\s+(.*?);"
view_matches = list(re.finditer(view_pattern, ads_sql, re.S | re.I))
print(f'Found {len(view_matches)} views')

for m in view_matches:
    name = m.group(1)
    view_sql = m.group(2)
    
    if any(o['name'] == name for o in objs):
        continue
    
    fields = parse_view_fields(view_sql)
    
    # 从dw-architecture-data.js里获取purpose
    # 先简单生成一个
    purpose = f'{name} 分析视图'
    
    name_cn = name.replace('v_', '').replace('_', ' ').title() + ' 视图'
    
    objs.append({
        'name': name,
        'name_cn': name_cn,
        'layer': 'ADS',
        'type': 'view',
        'purpose': purpose,
        'source': 'internet_analytics/database',
        'downstream': ['Web看板'],
        'lineage': [name],
        'field_count': len(fields),
        'fields': fields,
    })

ov = [
    {'layer': o['layer'], 'table_name': o['name'], 'field_count': o['field_count'],
     'target_range': '8-25', 'quality_status': '达标'}
    for o in objs
]
out = ROOT.parent / 'js' / 'data-dictionary-data.js'
out.write_text(
    '/** internet_analytics 数据字典 · OTT雪花模型版v2 */\n'
    f'window.DATA_DICTIONARY={json.dumps(objs, ensure_ascii=False, indent=2)};\n'
    f'window.WAREHOUSE_FIELD_OVERVIEW={json.dumps(ov, ensure_ascii=False, indent=2)};\n',
    encoding='utf-8',
)
print(f'Wrote {len(objs)} objects to {out}')
print()
print('Sample tables:')
for o in objs[:5]:
    print(f'  {o["name"]} ({o["name_cn"]}): {o["field_count"]} fields')
print()
print('Sample views:')
for o in objs:
    if o['type'] == 'view':
        print(f'  {o["name"]}: {o["field_count"]} fields')
        break
