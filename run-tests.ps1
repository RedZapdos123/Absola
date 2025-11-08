# Absola Test Runner Script
# This script starts services and runs Playwright tests

Write-Host "🚀 Starting Absola Test Suite" -ForegroundColor Cyan
Write-Host ""

# Check if frontend dependencies are installed
if (-Not (Test-Path "frontend/node_modules")) {
    Write-Host "❌ Frontend dependencies not installed" -ForegroundColor Red
    Write-Host "Run: cd frontend && npm install" -ForegroundColor Yellow
    exit 1
}

# Check if backend dependencies are installed
if (-Not (Test-Path "backend/node_modules")) {
    Write-Host "❌ Backend dependencies not installed" -ForegroundColor Red
    Write-Host "Run: cd backend && npm install" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Dependencies check passed" -ForegroundColor Green
Write-Host ""

# Start backend in background
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd backend
    npm run dev
}

Start-Sleep -Seconds 5

# Start frontend in background
Write-Host "🎨 Starting frontend server..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd frontend
    npm run dev
}

Start-Sleep -Seconds 10

Write-Host "⏳ Waiting for servers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/v1/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend is healthy (port 4000)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend health check failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend is ready (port 3000)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not responding" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 Running Playwright tests..." -ForegroundColor Cyan
cd tests
npm test

Write-Host ""
Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
Stop-Job $backendJob
Stop-Job $frontendJob
Remove-Job $backendJob
Remove-Job $frontendJob

Write-Host "✅ Test run complete!" -ForegroundColor Green
