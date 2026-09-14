# -*- coding: utf-8 -*-
from pathlib import Path
import re, json

html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")
# find content of sql-row-number via regex on the id then content field nearby is hard;
# extract from already-known structure
i = html.find('"id": "sql-row-number"')
print("idx", i)
# content is after title
j = html.find('"content": "', i)
# walk string
k = j + len('"content": "')
chars = []
esc = False
while k < len(html):
    ch = html[k]
    if esc:
        chars.append(ch)
        esc = False
    elif ch == "\\":
        esc = True
        chars.append(ch)
    elif ch == '"':
        break
    else:
        chars.append(ch)
    k += 1
raw = "".join(chars)
# unescape minimal
content = json.loads('"' + raw + '"') if False else bytes(raw, "utf-8").decode("unicode_escape") if False else None
# better: use json on a fragment
frag = html[i : html.find('"children"', i)]
# wrap
# find content with proper JSON extract of the leaf - simpler use tree extract

def extract(marker):
    i = html.find(marker)
    i = html.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(html)):
        ch = html[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return json.loads(html[i : j + 1])

def find(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find(c, eid)
        if hit:
            return hit

n = find(extract("const SQL_KNOWLEDGE_TREE = "), "sql-row-number")
c = n["content"]
for h in re.findall(r"^###\s+(.+)$", c, re.M):
    print("heading:", h)
    print("  unicode_escape:", h.encode("unicode_escape").decode())
    print("  codepoints:", [hex(ord(x)) for x in h[:4]])
print("total_len", len(c))
