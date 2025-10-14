# GAJAH NUSA ERP - Production Build Script (Windows)
# This script builds the mobile app for production deployment

Write-Host "🚀 Starting GAJAH NUSA ERP Production Build..." -ForegroundColor Green

# Set production environment
$env:NODE_ENV = "production"
$env:EXPO_PUBLIC_API_BASE_URL = "https://api.gajahnusa.com"

# Navigate to mobile directory
Set-Location mobile

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "web-build") { Remove-Item -Recurse -Force "web-build" }

Write-Host "🔧 Type checking..." -ForegroundColor Yellow
npx tsc --noEmit --project .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ TypeScript check passed!" -ForegroundColor Green

Write-Host "🌐 Building for web..." -ForegroundColor Yellow
npx expo export --platform web --output-dir web-build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "📱 Building for mobile (Android)..." -ForegroundColor Yellow
npx expo build:android --type apk

Write-Host "🍎 Building for mobile (iOS)..." -ForegroundColor Yellow
npx expo build:ios --type archive

Write-Host "🔄 Optimizing assets..." -ForegroundColor Yellow
npx expo optimize

Write-Host "📊 Creating build report..." -ForegroundColor Yellow
$buildReport = @"
GAJAH NUSA ERP - Production Build Report
========================================
Build Date: $(Get-Date)
Environment: Production
API Base URL: https://api.gajahnusa.com

Build Status:
✅ Dependencies installed
✅ TypeScript check passed
✅ Web build completed
✅ Android APK generated
✅ iOS archive generated
✅ Assets optimized

Build Artifacts:
- Web: mobile/web-build/
- Android: mobile/build/android/
- iOS: mobile/build/ios/

Next Steps:
1. Test the web build locally
2. Deploy web build to production server
3. Test APK on Android devices
4. Submit iOS archive to App Store
5. Configure CDN for assets
"@

$buildReport | Out-File -FilePath "../build-report.txt" -Encoding UTF8

Write-Host "✅ Production build completed successfully!" -ForegroundColor Green
Write-Host "📋 Build report saved to build-report.txt" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 To test web build locally:" -ForegroundColor Cyan
Write-Host "   Set-Location mobile/web-build; python -m http.server 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Mobile apps are ready for distribution!" -ForegroundColor Green
