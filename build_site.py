#!/usr/bin/env python3
"""blipradar build step: data.json -> category pages.
Run after editing data.json (the admin panel does this for you on save).
Rewrites each category page's `var TOOLS=[...]` and `var SITES={...}` from data.json."""
import json, re

data = json.load(open("data.json"))
by_cat = {}
for t in data["tools"]:
    by_cat.setdefault(t["category"], []).append(t)

FIELDS = ["rank","name","score","mom","type","cats","price","domain","letter","link","desc","s","bestFor"]
changed = []
for cat in data["categories"]:
    slug = cat["slug"]; page = slug + ".html"
    rows = sorted(by_cat.get(slug, []), key=lambda r: r.get("rank", 999))
    if not rows: continue
    tools = [{k: r.get(k) for k in FIELDS} for r in rows]
    sites = {r["name"]: r["url"] for r in rows}        # the visit / affiliate link behind each button
    try:
        s = open(page).read()
    except FileNotFoundError:
        continue
    s2 = re.sub(r"var TOOLS=\[.*?\];", "var TOOLS=" + json.dumps(tools, ensure_ascii=False) + ";", s, count=1, flags=re.S)
    s2 = re.sub(r"var SITES=\{.*?\};", "var SITES=" + json.dumps(sites, ensure_ascii=False) + ";", s2, count=1, flags=re.S)
    if s2 != s:
        open(page, "w").write(s2); changed.append(page)

print("built:", ", ".join(changed) if changed else "(no changes)")
