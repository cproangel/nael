---
name: deploy-github-netlify-render
description: Full deployment pipeline — push project to GitHub, deploy frontend to Netlify, deploy backend + DB to Render.
---

# 🚀 Deploy: GitHub → Netlify (Frontend) + Render (Backend + DB)

This skill covers the complete deployment of a full-stack web app:
- **GitHub** — version control & source of truth
- **Netlify** — hosts the frontend (static SPA build)
- **Render** — hosts the backend (Docker) + PostgreSQL database

---

## 📋 Prerequisites

Before starting, make sure the project has:
1. A **frontend** folder with `package.json` and a build command (e.g. Vite/React → `npm run build` → `dist/`)
2. A **backend** folder with a `Dockerfile` (e.g. Python/FastAPI/uvicorn)
3. A `.gitignore` that excludes secrets (`.env`, credentials JSON, `node_modules/`, `__pycache__/`)
4. Environment variables documented (API keys, DB connection strings, etc.)

---

## 🔑 Owner Account Details

### GitHub
- **Username**: `cproangel`
- **Profile**: https://github.com/cproangel
- **Auth**: Use GitHub CLI (`gh`) or HTTPS with PAT (Personal Access Token)

### Netlify
- **Account**: cproangel's Netlify account
- **Dashboard**: https://app.netlify.com
- **Auth**: Linked to GitHub account (cproangel)

### Render
- **Account**: cproangel's Render account
- **Dashboard**: https://dashboard.render.com
- **Auth**: Linked to GitHub account (cproangel)

---

## 📝 Step-by-Step Deployment Process

### Phase 1: Prepare the Project for GitHub

#### 1.1 Create `.gitignore`
Ensure the project root has a `.gitignore` that excludes:
```gitignore
# Environment & Secrets
.env
backend/*.json

# Python
backend/venv/
__pycache__/
*.pyc

# Node
frontend/node_modules/
frontend/dist/

# IDE / System
.DS_Store
*.log
```

#### 1.2 Create/Initialize Git Repo
```powershell
cd <PROJECT_ROOT>
git init
git add .
git commit -m "Initial commit"
```

#### 1.3 Create GitHub Repository
```powershell
# Using GitHub CLI (recommended)
gh repo create cproangel/<REPO_NAME> --public --source=. --remote=origin --push

# OR manually:
# 1. Go to https://github.com/new
# 2. Create repo named <REPO_NAME>
# 3. Add remote and push:
git remote add origin https://github.com/cproangel/<REPO_NAME>.git
git branch -M main
git push -u origin main
```

#### 1.4 Push Updates (ongoing)
```powershell
git add .
git commit -m "your message"
git push
```

---

### Phase 2: Prepare Deployment Config Files

#### 2.1 Create `netlify.toml` (root of project)
This tells Netlify how to build the frontend:
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

> **Notes:**
> - `base` = subfolder where frontend lives
> - `publish` = build output directory (Vite → `dist`)
> - `[[redirects]]` = SPA routing support (all paths → index.html)

#### 2.2 Create `backend/Dockerfile`
Example for Python/FastAPI:
```dockerfile
FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> Adjust `CMD` and `EXPOSE` for your framework (Flask, Django, Express, etc.)

#### 2.3 Update Frontend API URL to use Environment Variable
In your frontend code, use an env var for the backend URL:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "/api";
```

For WebSocket connections:
```javascript
const backendHost = import.meta.env.VITE_API_URL
  ? new URL(import.meta.env.VITE_API_URL).host
  : window.location.host;
const wsUrl = `wss://${backendHost}/ws/voice`;
```

---

### Phase 3: Deploy Frontend to Netlify

#### 3.1 Connect Repository
1. Go to **https://app.netlify.com** → "Add new site" → "Import an existing project"
2. Select **GitHub** → Authorize → Choose repo `cproangel/<REPO_NAME>`
3. Netlify will auto-detect `netlify.toml` settings

#### 3.2 Configure Build Settings
Verify in the Netlify UI:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

#### 3.3 Set Environment Variables
In Netlify Dashboard → Site → **Site configuration** → **Environment variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://<your-render-backend>.onrender.com` | Backend URL on Render |

> ⚠️ **IMPORTANT**: `VITE_` prefix is required for Vite to embed the variable at build time.

#### 3.4 Deploy
- Netlify auto-deploys on every `git push` to `main` branch
- Manual: Dashboard → **Deploys** → "Trigger deploy" → "Deploy site"

#### 3.5 Custom Domain (optional)
- Dashboard → **Domain management** → "Add custom domain"
- Configure DNS as instructed

---

### Phase 4: Deploy Backend to Render

#### 4.1 Create PostgreSQL Database
1. Go to **https://dashboard.render.com** → **New** → **PostgreSQL**
2. Settings:
   - **Name**: `<project>-db` (e.g., `eco-voice-db`)
   - **Database**: `ecovoice_analytics` (or your DB name)
   - **User**: `ecovoice` (or your DB user)
   - **Region**: Oregon (or closest to your users)
   - **Plan**: Free (for testing) or Starter ($7/mo)
3. After creation, copy the **Internal Database URL** (used by backend)

#### 4.2 Create Web Service (Backend)
1. Go to **https://dashboard.render.com** → **New** → **Web Service**
2. Connect to GitHub repo `cproangel/<REPO_NAME>`
3. Settings:
   - **Name**: `<project>-api` (e.g., `eco-voice-api`)
   - **Region**: Same as database
   - **Root Directory**: `backend`
   - **Runtime**: **Docker**
   - **Plan**: Free (for testing) or Starter ($7/mo)

#### 4.3 Set Environment Variables on Render
In Render Dashboard → Web Service → **Environment**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `<Internal Database URL from Step 4.1>` |
| `YANDEX_API_KEY` | your key |
| `YANDEX_FOLDER_ID` | your folder ID |
| `GOOGLE_API_KEY` | your key |
| `GOOGLE_CLOUD_PROJECT` | your project ID |
| `GOOGLE_CLOUD_LOCATION` | e.g. `europe-west1` |
| `TELEGRAM_BOT_TOKEN` | your token |
| `TELEGRAM_ADMIN_ID` | your admin ID |
| ... | (add all vars from `.env`) |

> Copy every variable from your local `.env` file to Render's environment variables.

#### 4.4 Deploy
- Render auto-deploys on every `git push` to `main` branch
- First deploy: Render builds the Docker image and starts the service
- Watch logs in Dashboard → **Logs** tab

---

### Phase 5: Connect Frontend ↔ Backend

#### 5.1 Update Netlify Environment Variable
After Render deploys, get the backend URL (e.g. `https://eco-voice-api.onrender.com`) and set it in Netlify:

- Netlify Dashboard → **Site configuration** → **Environment variables**
- Set `VITE_API_URL` = `https://<your-render-service>.onrender.com`

#### 5.2 Update Backend CORS
Make sure the backend allows requests from the Netlify domain:
```python
# FastAPI example
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://<your-site>.netlify.app",
        # Add custom domain if applicable
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 5.3 Redeploy Netlify
Trigger a redeploy in Netlify so the new `VITE_API_URL` is embedded in the build:
- Dashboard → **Deploys** → "Trigger deploy" → "Clear cache and deploy site"

---

### Phase 6: Verify Deployment

1. **Frontend**: Open `https://<your-site>.netlify.app` — should load the SPA
2. **Backend**: Open `https://<your-render-service>.onrender.com/docs` — should show API docs
3. **Database**: Backend logs should show successful DB connection
4. **Full Flow**: Test the app end-to-end (API calls, WebSockets, etc.)

---

## 🔄 Ongoing Workflow

### Code Update Cycle
```powershell
# 1. Make changes locally
# 2. Test locally
# 3. Push to GitHub
git add .
git commit -m "description of changes"
git push

# 4. Both Netlify and Render auto-deploy from main branch
# 5. Monitor deploys in dashboards
```

### Adding New Environment Variables
1. Add to local `.env`
2. Add to **Render Dashboard** → Environment
3. If frontend needs it (with `VITE_` prefix), add to **Netlify Dashboard** → Environment variables
4. Redeploy the relevant service

---

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Frontend shows blank page | Check `netlify.toml` redirects, ensure SPA routing is configured |
| API calls fail (CORS) | Add Netlify domain to backend CORS `allow_origins` |
| Backend can't connect to DB | Use **Internal** Database URL on Render, not External |
| Render free tier sleeps | First request after sleep takes ~30s to wake; upgrade to Starter plan |
| `VITE_API_URL` not working | Must rebuild on Netlify after changing env var (clear cache + deploy) |
| WebSocket fails | Ensure backend URL uses `wss://` and Render supports WS on the plan |
| Build fails on Netlify | Check Node version; add `NODE_VERSION` env var if needed (e.g., `20`) |

---

## 📁 Required Project Structure

```
project-root/
├── .gitignore
├── netlify.toml          # Netlify config
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   └── ...
│   └── ...
├── backend/
│   ├── Dockerfile        # Render uses this
│   ├── requirements.txt  # (Python) or package.json (Node)
│   ├── app/
│   │   ├── main.py       # Entry point
│   │   └── ...
│   └── ...
└── .env                  # Local only, never committed!
```
