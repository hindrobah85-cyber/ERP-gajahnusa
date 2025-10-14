# GAJAH NUSA ERP - Simple System Test
# Quick validation of core system functionality

Write-Host "Testing GAJAH NUSA ERP System..." -ForegroundColor Green

$testResults = @()

# Test 1: Backend API Health
try {
    Invoke-RestMethod -Uri "http://localhost:8001/api/health" -TimeoutSec 10 | Out-Null
    Write-Host "✅ Backend API is healthy" -ForegroundColor Green
    $testResults += "PASS: Backend API Health"
}
catch {
    Write-Host "❌ Backend API failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "FAIL: Backend API Health"
}

# Test 2: Login functionality
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    }
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Login functionality works" -ForegroundColor Green
    $testResults += "PASS: User Authentication"
    $token = $loginResponse.access_token
}
catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "FAIL: User Authentication"
    $token = $null
}

# Test 3: Dashboard data (if login successful)
if ($token) {
    try {
        $headers = @{ "Authorization" = "Bearer $token" }
        $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/dashboard" -Headers $headers -TimeoutSec 10
        Write-Host "✅ Dashboard data accessible" -ForegroundColor Green
        if ($dashboardResponse) {
            Write-Host "   Dashboard contains data for: $($dashboardResponse.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
        }
        $testResults += "PASS: Dashboard Access"
    }
    catch {
        Write-Host "❌ Dashboard access failed: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += "FAIL: Dashboard Access"
    }
}

# Test 4: Mobile app accessibility
try {
    Invoke-WebRequest -Uri "http://localhost:19006" -Method Head -TimeoutSec 10 | Out-Null
    Write-Host "✅ Mobile app is accessible" -ForegroundColor Green
    $testResults += "PASS: Mobile App Access"
}
catch {
    Write-Host "❌ Mobile app not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "FAIL: Mobile App Access"
}

# Test Summary
Write-Host "`nTest Summary:" -ForegroundColor Cyan
$passCount = ($testResults | Where-Object { $_ -like "PASS:*" }).Count
$failCount = ($testResults | Where-Object { $_ -like "FAIL:*" }).Count

foreach ($result in $testResults) {
    if ($result -like "PASS:*") {
        Write-Host $result -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
    }
}

Write-Host "`nResults: $passCount passed, $failCount failed" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "🎉 All tests passed! System is ready." -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Please check the issues above." -ForegroundColor Red
}
