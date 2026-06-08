#!/usr/bin/env python3
"""blipradar build step: data.json -> category pages.
data.json is grouped: { "categories":[{slug,label,live}], "coding":[...tools], "writing":[...], ... }
(Also still works with the older flat shape { "categories":[...], "tools":[...] }.)
The admin panel edits data.json; this regenerates each category page's TOOLS + SITES."""
import json, re

data = json.load(open("data.json"))
cats = data.get("categories", [])

def rows_for(slug):
    if slug in data and isinstance(data[slug], list):      # new grouped shape
        return data[slug]
    return [t for t in data.get("tools", []) if t.get("category") == slug]  # old flat shape

FIELDS = ["rank","name","score","mom","type","cats","price","domain","letter","link","desc","s","bestFor"]
changed = []
for cat in cats:
    slug = cat["slug"]; page = slug + ".html"
    rows = sorted(rows_for(slug), key=lambda r: r.get("rank", 999))
    if not rows: continue
    tools = [{k: r.get(k) for k in FIELDS} for r in rows]
    sites = {r["name"]: r.get("url", "https://" + r.get("domain","")) for r in rows}
    try:
        s = open(page).read()
    except FileNotFoundError:
        continue
    s2 = re.sub(r"var TOOLS=\[.*?\];", "var TOOLS=" + json.dumps(tools, ensure_ascii=False) + ";", s, count=1, flags=re.S)
    s2 = re.sub(r"var SITES=\{.*?\};", "var SITES=" + json.dumps(sites, ensure_ascii=False) + ";", s2, count=1, flags=re.S)
    if s2 != s:
        open(page, "w").write(s2); changed.append(page)

print("built:", ", ".join(changed) if changed else "(no changes)")
