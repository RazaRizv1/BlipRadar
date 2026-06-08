# blipradar — go live in ~1 hour (spoonfed)

You need: a GitHub account, a Cloudflare account (both free), and ~$12 + a card **only if** you want to register blipradar.com today (optional — you'll have a working URL without it).

The file you upload is **blipradar.zip** — download it and unzip it first.

---

## PART A — Put the site on GitHub (~15 min)

1. Go to **github.com** → **Sign up** (email + password, verify your email).
2. Top-right **+** → **New repository**.
   - Repository name: `blipradar`
   - Visibility: **Public**
   - Do NOT tick "Add a README"
   - Click **Create repository**.
3. On the new empty repo page, click the link **"uploading an existing file"** (or **Add file → Upload files**).
4. Open your unzipped **blipradar** folder, **select everything inside it** (all the .html files, data.json, build_site.py, and the `admin` folder), and **drag it all** into the GitHub upload box. Wait until the list shows them (you should see `admin` in there too).
5. Scroll down → click **Commit changes**.

## PART B — Point your panel at your repo (~2 min)

6. In your repo, open the **admin** folder → click **config.yml** → click the **pencil (Edit)** icon.
7. Find the line `repo: YOUR_GITHUB_USERNAME/blipradar` and replace `YOUR_GITHUB_USERNAME` with your real username — e.g. `repo: razakhan/blipradar`.
8. Click **Commit changes**.

## PART C — Make it live with Cloudflare (~15 min)

9. Go to **dash.cloudflare.com** → sign up / log in.
10. Left menu → **Workers & Pages** (may be under "Compute") → **Create** → **Pages** tab → **Connect to Git**.
11. **Authorize GitHub**, then pick your **blipradar** repo → **Begin setup**.
12. Build settings:
    - Framework preset: **None**
    - Build command: `python3 build_site.py`
    - Build output directory: `/`
    - Click **Save and Deploy**.
    - ⚠️ If the build log turns red/fails: just **clear the Build command** (leave it empty), redeploy — the site still goes live. Then tell me and I'll switch the rebuild on a different way.
13. Wait ~1 minute. You'll get a live link like **https://blipradar.pages.dev**. Open it — your site is live. 🎉

## PART D — Your domain (optional today)

14. In Cloudflare → **Registrar → Register Domains** → search **blipradar.com**.
    - If available (~$12/yr): register it. If it's taken, tell me and we'll pick another name.
15. In your Pages project → **Custom domains → Set up a custom domain** → enter `blipradar.com`. Cloudflare wires the DNS and HTTPS automatically (the .app domain requires HTTPS — handled for you).

## PART E — Log into your admin panel (~2 min)

16. Go to **your-site/admin** (e.g. `https://blipradar.pages.dev/admin`).
17. Click **Sign in with GitHub** → **Authorize**. You're inside your panel — Tools, Categories, and the Affiliate/visit-link field for each tool.
    - ⚠️ If instead it shows an authentication-setup message, stop and tell me — there's a 2-minute one-time auth connect I'll walk you through.

---

## After you're live — tell me, and I'll:
- Switch on **auto-rebuild** if needed (so panel edits flow to the pages automatically). *If the build command in step 12 worked, this is already on — your edits go live by themselves.*
- Fold the rest of the site (tool pages, homepage, search) into the panel so you control 100% from one place.
- Add a **blockchain** category template whenever you want that niche.

**Day-to-day from now on:** open `/admin`, edit, Save. Live in under a minute. No re-uploading, ever.
