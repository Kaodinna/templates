# Compleros — Staff Credential Tracker

React + Tailwind conversion of the credential tracker template.
Deploys to Vercel in under 10 minutes.

---

## Step-by-step deployment

### Step 1 — Prerequisites (5 mins)
Install these if you don't have them:
- Node.js: https://nodejs.org (download LTS version)
- Git: https://git-scm.com/downloads
- A free GitHub account: https://github.com
- A free Vercel account: https://vercel.com (sign up with GitHub)

### Step 2 — Set up the project locally (3 mins)
```bash
# Navigate to this folder in your terminal
cd compleros-tracker

# Install dependencies
npm install

# Test it runs locally
npm start
# Opens http://localhost:3000 — should show the tracker
# Press Ctrl+C to stop when done
```

### Step 3 — Add the XLSX file
Copy your `Compleros_Staff_Credential_Tracking_Sheet.xlsx` file
into the `public/` folder. The "Blank XLSX" button downloads it from there.

### Step 4 — Push to GitHub (3 mins)
```bash
# Inside the compleros-tracker folder:
git init
git add .
git commit -m "Initial commit - Compleros credential tracker"

# Go to github.com → New repository
# Name it: compleros-tracker
# Keep it Private
# Copy the repo URL shown (looks like: https://github.com/yourname/compleros-tracker.git)

git remote add origin https://github.com/yourname/compleros-tracker.git
git branch -M main
git push -u origin main
```

### Step 5 — Deploy to Vercel (2 mins)
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Click "Import" next to your `compleros-tracker` repo
4. Vercel auto-detects it's a React app — leave all settings as default
5. Click "Deploy"
6. Wait ~60 seconds — you get a live URL like `compleros-tracker.vercel.app`

### Step 6 — Link from Bubble
In your Bubble app, wherever the credential tracker template card is:
- Add a workflow on click: **Navigate to external URL**
- URL: `https://your-compleros-tracker.vercel.app`
- Check "Open in new tab" if preferred

That's it. Done.

---

## Future updates
Whenever you make changes to the code:
```bash
git add .
git commit -m "describe your change"
git push
```
Vercel auto-deploys within 30 seconds. No manual redeployment needed.

---

## Custom domain (optional)
In Vercel dashboard → your project → Settings → Domains
Add: `tools.compleros.com` or `tracker.compleros.com`
Then add a CNAME record in your DNS pointing to `cname.vercel-dns.com`

---

## Project structure
```
src/
  App.jsx           — main app, state management, layout
  utils.js          — status calculations, localStorage, date helpers
  pdf.js            — PDF generation logic
  index.css         — global styles + Tailwind
  components/
    Sidebar.jsx     — left navigation
    TrackerRow.jsx  — one row per staff member
    StatusBadge.jsx — current/expiring/expired badge
    ResetModal.jsx  — confirmation dialog
public/
  index.html
  Compleros_Staff_Credential_Tracking_Sheet.xlsx  ← add this file
```
