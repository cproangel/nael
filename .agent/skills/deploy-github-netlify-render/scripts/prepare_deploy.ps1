# ============================================================
# prepare_deploy.ps1 — Prepare a project for GitHub + Netlify + Render deployment
# Usage: .\prepare_deploy.ps1 -RepoName "my-project" -FrontendDir "frontend" -BackendDir "backend"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [string]$FrontendDir = "frontend",
    [string]$BackendDir = "backend",
    [string]$GitHubUser = "cproangel",
    [switch]$SkipGitHub
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Preparing deployment for: $RepoName" -ForegroundColor Cyan
Write-Host "   Frontend: ./$FrontendDir" -ForegroundColor Gray
Write-Host "   Backend:  ./$BackendDir" -ForegroundColor Gray
Write-Host ""

# --- Step 1: Validate project structure ---
Write-Host "📁 Checking project structure..." -ForegroundColor Yellow

if (-not (Test-Path "$FrontendDir/package.json")) {
    Write-Host "   ❌ $FrontendDir/package.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Frontend package.json found" -ForegroundColor Green

if (-not (Test-Path "$BackendDir/Dockerfile")) {
    Write-Host "   ⚠️  $BackendDir/Dockerfile not found — you'll need to create one" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Backend Dockerfile found" -ForegroundColor Green
}

if (-not (Test-Path "$BackendDir/requirements.txt") -and -not (Test-Path "$BackendDir/package.json")) {
    Write-Host "   ⚠️  No dependency file found in backend" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Backend dependencies found" -ForegroundColor Green
}

# --- Step 2: Create netlify.toml if missing ---
if (-not (Test-Path "netlify.toml")) {
    Write-Host "`n📝 Creating netlify.toml..." -ForegroundColor Yellow
    @"
[build]
  base = "$FrontendDir"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"@ | Set-Content -Path "netlify.toml" -Encoding UTF8
    Write-Host "   ✅ netlify.toml created" -ForegroundColor Green
} else {
    Write-Host "`n✅ netlify.toml already exists" -ForegroundColor Green
}

# --- Step 3: Check .gitignore ---
if (-not (Test-Path ".gitignore")) {
    Write-Host "`n📝 Creating .gitignore..." -ForegroundColor Yellow
    @"
# Environment & Secrets
.env
*.json
!package.json
!package-lock.json
!tsconfig.json

# Python
__pycache__/
*.pyc
venv/

# Node
node_modules/
dist/

# IDE / System
.DS_Store
*.log
.opencode/
"@ | Set-Content -Path ".gitignore" -Encoding UTF8
    Write-Host "   ✅ .gitignore created" -ForegroundColor Green
} else {
    Write-Host "`n✅ .gitignore already exists" -ForegroundColor Green
}

# --- Step 4: Check .env ---
if (Test-Path ".env") {
    Write-Host "`n📋 Environment variables found in .env:" -ForegroundColor Yellow
    Get-Content ".env" | Where-Object { $_ -match "^[A-Z]" } | ForEach-Object {
        $key = ($_ -split "=")[0]
        Write-Host "   • $key" -ForegroundColor Gray
    }
    Write-Host "   → Copy these to Render Dashboard → Environment" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  No .env file found — create one with your environment variables" -ForegroundColor Yellow
}

# --- Step 5: Git init & push ---
if (-not $SkipGitHub) {
    Write-Host "`n🔧 Setting up Git..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "   ✅ Git initialized" -ForegroundColor Green
    }
    
    git add .
    git commit -m "Prepare for deployment" 2>$null
    
    # Check if remote exists
    $remotes = git remote 2>$null
    if ($remotes -notcontains "origin") {
        Write-Host "`n🌐 Creating GitHub repo..." -ForegroundColor Yellow
        
        # Try GitHub CLI first
        if (Get-Command gh -ErrorAction SilentlyContinue) {
            gh repo create "$GitHubUser/$RepoName" --public --source=. --remote=origin --push
            Write-Host "   ✅ Repo created and pushed via gh CLI" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  GitHub CLI (gh) not installed." -ForegroundColor Yellow
            Write-Host "   Run manually:" -ForegroundColor Gray
            Write-Host "   git remote add origin https://github.com/$GitHubUser/$RepoName.git" -ForegroundColor White
            Write-Host "   git branch -M main" -ForegroundColor White
            Write-Host "   git push -u origin main" -ForegroundColor White
        }
    } else {
        git push
        Write-Host "   ✅ Code pushed to GitHub" -ForegroundColor Green
    }
}

# --- Summary ---
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ PROJECT READY FOR DEPLOYMENT!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Netlify: https://app.netlify.com → Import from GitHub" -ForegroundColor White
Write-Host "     • Set VITE_API_URL to your Render backend URL" -ForegroundColor Gray
Write-Host "  2. Render:  https://dashboard.render.com → New PostgreSQL + New Web Service" -ForegroundColor White
Write-Host "     • Root Directory: $BackendDir" -ForegroundColor Gray
Write-Host "     • Runtime: Docker" -ForegroundColor Gray
Write-Host "     • Copy all .env vars to Environment" -ForegroundColor Gray
Write-Host ""
