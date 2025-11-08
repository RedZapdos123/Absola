#!/usr/bin/env pwsh
# Absola Setup Script
# Automated setup for Python environment and all dependencies

Write-Host "🚀 Absola - Automated Setup Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Python is installed
Write-Host "📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.11+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "📋 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✓ npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Create Python virtual environment
Write-Host "`n📦 Creating Python virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠ Virtual environment already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "venv"
}

python -m venv venv

Write-Host "✓ Virtual environment created" -ForegroundColor Green

# Activate virtual environment
Write-Host "`n🔧 Activating virtual environment..." -ForegroundColor Yellow
if ($IsWindows -or $env:OS -match "Windows") {
    & ".\venv\Scripts\Activate.ps1"
} else {
    & source venv/bin/activate
}
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Upgrade pip
Write-Host "`n📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green

# Install Python dependencies for AI services
Write-Host "`n📦 Installing Python dependencies (AI Services)..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray
Set-Location "ai_services"
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Install Backend (Node.js) dependencies
Write-Host "`n📦 Installing Backend dependencies (Node.js)..." -ForegroundColor Yellow
Set-Location "backend"
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Install Frontend (Next.js) dependencies
Write-Host "`n📦 Installing Frontend dependencies (Next.js)..." -ForegroundColor Yellow
Set-Location "frontend"
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Create data directories
Write-Host "`n📁 Creating data directories..." -ForegroundColor Yellow
$directories = @(
    "data/documents",
    "data/vector_indexes",
    "data/models",
    "data/cache/scrape",
    "data/tmp/uploads"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ Created: $dir" -ForegroundColor Gray
    }
}
Write-Host "✓ Data directories ready" -ForegroundColor Green

# Check for .env file
Write-Host "`n⚙️  Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env file from .env.example" -ForegroundColor Green
        Write-Host "⚠  Please edit .env file and add your configuration" -ForegroundColor Yellow
    } else {
        Write-Host "⚠  No .env file found. API keys are hardcoded in config." -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Summary
Write-Host "`n════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Ensure Docker is running (for MongoDB)" -ForegroundColor White
Write-Host "  2. Review .env configuration" -ForegroundColor White
Write-Host "  3. Start the application:" -ForegroundColor White
Write-Host "     • Option A (Docker): docker-compose up -d" -ForegroundColor Cyan
Write-Host "     • Option B (Manual): Use .\start.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Yellow
Write-Host "  • Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "  • AI Service:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "  • README.md              - Overview" -ForegroundColor White
Write-Host "  • docs/Usage.md          - User guide" -ForegroundColor White
Write-Host "  • docs/InstallationAndSetup.md - Setup details" -ForegroundColor White
Write-Host ""
Write-Host "✨ Created by Mridankan Mandal | Azure Division" -ForegroundColor Cyan
