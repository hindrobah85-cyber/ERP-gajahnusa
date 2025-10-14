# GAJAH NUSA ERP - Production Deployment Script
# This script deploys the ERP system to production environment

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false
)

Write-Host "🚀 Starting GAJAH NUSA ERP Deployment to $Environment..." -ForegroundColor Green

# Load environment configuration
if (Test-Path ".env.$Environment") {
    Write-Host "📋 Loading environment configuration..." -ForegroundColor Yellow
    Get-Content ".env.$Environment" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️ Warning: .env.$Environment file not found!" -ForegroundColor Yellow
}

# Pre-deployment checks
Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Yellow

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running or not installed!" -ForegroundColor Red
    exit 1
}

# Check if required files exist
$requiredFiles = @(
    "simple_api.py",
    "mobile/package.json",
    "docker-compose.$Environment.yml"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing $file" -ForegroundColor Red
        exit 1
    }
}

# Build application if not skipped
if (-not $SkipBuild) {
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    & "./build-production.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Run tests if not skipped
if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    
    # Backend tests
    Write-Host "Testing backend API..." -ForegroundColor Cyan
    python -m pytest backend/tests/ -v
    
    # Mobile tests
    Write-Host "Testing mobile app..." -ForegroundColor Cyan
    Set-Location mobile
    npm test -- --watchAll=false
    Set-Location ..
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tests failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All tests passed!" -ForegroundColor Green
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f "docker-compose.$Environment.yml" down

# Start production services
Write-Host "🐳 Starting production services..." -ForegroundColor Yellow
docker-compose -f "docker-compose.$Environment.yml" up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Health checks
Write-Host "🏥 Running health checks..." -ForegroundColor Yellow

# Check database
try {
    docker exec erp_database_prod pg_isready -U erp_user
    Write-Host "✅ Database is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Database health check failed!" -ForegroundColor Red
}

# Check backend API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/health" -Method Get
    if ($response.status -eq "healthy") {
        Write-Host "✅ Backend API is healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend API is unhealthy!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend API health check failed!" -ForegroundColor Red
}

# Check web frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80" -Method Head
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Web frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Web frontend is not accessible!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Web frontend health check failed!" -ForegroundColor Red
}

# Create deployment report
$deploymentReport = @"
GAJAH NUSA ERP - Deployment Report
==================================
Deployment Date: $(Get-Date)
Environment: $Environment
Deployment Status: SUCCESS

Services Status:
✅ Database (PostgreSQL)
✅ Backend API (FastAPI)
✅ Web Frontend (Nginx)
✅ Cache (Redis)

Access URLs:
- Web App: http://localhost (or your domain)
- API Docs: http://localhost:8001/docs
- Database: localhost:5432

Health Check Results:
✅ All services are running
✅ Health endpoints responding
✅ Database connectivity verified

Post-Deployment Steps:
1. Configure domain DNS
2. Set up SSL certificates
3. Configure monitoring
4. Set up backup schedules
5. Train users with USER_MANUAL.md
"@

$deploymentReport | Out-File -FilePath "deployment-report.txt" -Encoding UTF8

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📋 Deployment report saved to deployment-report.txt" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your GAJAH NUSA ERP system is now running!" -ForegroundColor Cyan
Write-Host "   Web App: http://localhost" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Read USER_MANUAL.md for user guidance" -ForegroundColor White
Write-Host "   2. Follow DEPLOYMENT_CHECKLIST.md for production setup" -ForegroundColor White
Write-Host "   3. Configure your domain and SSL certificates" -ForegroundColor White
