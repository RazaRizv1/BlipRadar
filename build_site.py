#!/usr/bin/env python3
"""blipradar build step.
data.json (grouped) -> regenerates each category page's TOOLS + SITES,
and injects the crypto payment addresses into list-your-tool.html (var ADDR).
The admin panel edits data.json; this regenerates the pages on every deploy.
Works with the older flat {categories, tools[]} shape too."""
import json, re

data = json.load(open("data.json"))
cats = data.get("categories", [])

def rows_for(slug):
    if slug in data and isinstance(data[slug], list):
        return data[slug]
    return [t for t in data.get("tools", []) if t.get("category") == slug]

FIELDS = ["rank","name","score","mom","type","cats","price","domain","letter","link","desc","s","bestFor","added"]
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

# inject crypto receiving addresses (set in the panel) into the listing checkout
pay = data.get("payments")
if pay is not None:
    try:
        s = open("list-your-tool.html").read()
        s2 = re.sub(r"var ADDR=\{.*?\};", "var ADDR=" + json.dumps(pay, ensure_ascii=False) + ";", s, count=1)
        if s2 != s:
            open("list-your-tool.html", "w").write(s2); changed.append("list-your-tool.html")
    except FileNotFoundError:
        pass

print("built:", ", ".join(changed) if changed else "(no changes)")
