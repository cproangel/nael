# 🚀 Deployment Checklist Template

Copy this checklist into your project to track deployment progress:

## Pre-Deploy
- [ ] `.gitignore` excludes `.env`, `node_modules/`, `dist/`, `__pycache__/`, credentials
- [ ] Backend has `Dockerfile` with correct `CMD` and `EXPOSE`
- [ ] Frontend uses `VITE_API_URL` env var for backend URL
- [ ] Backend CORS includes Netlify domain
- [ ] `netlify.toml` created in project root

## GitHub
- [ ] Repo created: `https://github.com/cproangel/<REPO_NAME>`
- [ ] Code pushed to `main` branch
- [ ] No secrets in committed files

## Netlify (Frontend)
- [ ] Site created from GitHub repo
- [ ] Build settings verified (base: `frontend`, command: `npm run build`, publish: `dist`)
- [ ] `VITE_API_URL` env var set to Render backend URL
- [ ] Site deploys successfully
- [ ] SPA routing works (deep links don't 404)

## Render (Backend)
- [ ] PostgreSQL database created
- [ ] Web Service created (Docker, root: `backend`)
- [ ] All `.env` variables copied to Render environment
- [ ] `DATABASE_URL` uses **Internal** DB URL
- [ ] Backend deploys and starts successfully
- [ ] API docs accessible at `/docs`

## Integration
- [ ] Frontend can reach backend API
- [ ] WebSocket connections work
- [ ] Database queries work
- [ ] Full user flow tested end-to-end
