# blipradar — how to run it (admin panel, no backend)

## What you now have
- **data.json** — your single source of truth (every tool, score, and affiliate/visit link). This is your "database."
- **admin/** — your admin panel (Sveltia CMS). A login + forms to edit data.json. No server, no database to manage.
- **build_site.py** — the build step. Reads data.json and regenerates the category pages.

## How editing works once it's live
1. Go to **blipradar.com/admin** and click **Sign in with GitHub**.
2. Edit a tool / change an affiliate link / add a new tool in the form. Hit **Save**.
3. That commits to your repo → the site rebuilds → it's live in under a minute. You never touch HTML or upload a zip.

## Your one-time setup (the part only you can do — ~10 min)
GitHub login and deploying are identity steps I can't do for you. Here's the whole list:

1. **Create a free GitHub account** at github.com, then make a new **repository** named `blipradar`.
2. **Upload these files** to that repo (GitHub's "Add file → Upload files" lets you drag the whole folder).
3. In **admin/config.yml**, change the line `repo: YOUR_GITHUB_USERNAME/blipradar` to your actual username.
4. **Connect it to Cloudflare Pages** (free): Cloudflare → Pages → Create → pick your `blipradar` repo → Build command: `python3 build_site.py` → Output directory: `/` → Deploy. Then attach your domain.
5. Visit **blipradar.com/admin** → **Sign in with GitHub** → approve once → you're in.

> Until steps 1–5 are done, /admin has no live repo to log into yet — that's expected. I'll walk you through these clicks live whenever you're ready.

## Adding a new niche (e.g. blockchain tools)
1. In the panel, add a **Category** (slug `blockchain`, label `Blockchain`).
2. Add **Tools** with category `blockchain`.
3. (One-time) I add a `blockchain.html` template page so the build knows to generate it — ask me and it's done.

## Affiliate links
Every tool has an **Affiliate / visit URL** field and an **Is this an affiliate link?** toggle. Change the URL → the button updates everywhere that tool appears. An agent can also write these into data.json for you once you have the links.
