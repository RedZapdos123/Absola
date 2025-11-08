# Absola - All Services Startup Script
# This script starts the Frontend, Backend, and AI Services

Write-Host "Absola - Starting All Services" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkingDirectory,
        [int]$Port,
        [string]$Color = "Green"
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    
    if (Test-Port -Port $Port) {
        Write-Host "  ⚠ Port $Port is already in use. Skipping $Name" -ForegroundColor Yellow
        return
    }
    
    $scriptBlock = "
        `$Host.UI.RawUI.WindowTitle = 'Absola - $Name'
        Set-Location '$WorkingDirectory'
        Write-Host 'Absola - $Name' -ForegroundColor $Color
        Write-Host ''
        $Command
        Write-Host ''
        Write-Host 'Press any key to close...' -ForegroundColor Yellow
        `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    "
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
    
    Write-Host "  ✓ $Name started on port $Port" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Get the current directory
$ROOT_DIR = Get-Location

Write-Host "Root Directory: $ROOT_DIR" -ForegroundColor Gray
Write-Host ""

# Start Backend (Node.js + Express + TypeScript)
Start-Service `
    -Name "Backend API" `
    -Command "npm run dev" `
    -WorkingDirectory "$ROOT_DIR\backend" `
    -Port 4000 `
    -Color "Blue"

# Start AI Services (Python + FastAPI)
Start-Service `
    -Name "AI Services" `
    -Command "python -m uvicorn app.main:app --port 5000 --host 127.0.0.1" `
    -WorkingDirectory "$ROOT_DIR\ai_services" `
    -Port 5000 `
    -Color "Magenta"

# Start Frontend (Next.js + React)
Start-Service `
    -Name "Frontend" `
    -Command "npm run dev" `
    -WorkingDirectory "$ROOT_DIR\frontend" `
    -Port 3000 `
    -Color "Cyan"

Write-Host ""
Write-Host "All Services Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:4000" -ForegroundColor Blue
Write-Host "  AI Services: http://localhost:5000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Waiting 5 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if services are running
Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Yellow
Write-Host ""

$frontendRunning = Test-Port -Port 3000
$backendRunning = Test-Port -Port 4000
$aiRunning = Test-Port -Port 5000

if ($frontendRunning) {
    Write-Host "  ✓ Frontend is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend is NOT running on port 3000" -ForegroundColor Red
}

if ($backendRunning) {
    Write-Host "  ✓ Backend is running on port 4000" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend is NOT running on port 4000" -ForegroundColor Red
}

if ($aiRunning) {
    Write-Host "  ✓ AI Services is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "  ⚠ AI Services is NOT running on port 5000 (this is optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to open the application in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Open browser
if ($frontendRunning) {
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "To stop all services, close their terminal windows." -ForegroundColor Gray
Write-Host ""
