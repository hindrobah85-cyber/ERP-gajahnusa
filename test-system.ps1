# GAJAH NUSA ERP - Comprehensive Testing Script
# This script runs end-to-end tests for the ERP system

param(
    [Parameter(Mandatory=$false)]
    [string]$TestSuite = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "localhost",
    
    [Parameter(Mandatory=$false)]
    [switch]$VerboseOutput = $false
)

$baseUrl = if ($Environment -eq "localhost") { "http://localhost:8001" } else { "https://api.gajahnusa.com" }
$webUrl = if ($Environment -eq "localhost") { "http://localhost:19006" } else { "https://app.gajahnusa.com" }

Write-Host "Starting GAJAH NUSA ERP Testing..." -ForegroundColor Green
Write-Host "Test Suite: $TestSuite" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "API Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "Web URL: $webUrl" -ForegroundColor Yellow

$testResults = @()

function Write-TestLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    $color = switch ($Level) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host $logEntry -ForegroundColor $color
    
    if ($VerboseOutput -or $Level -eq "FAIL") {
        Add-Content -Path "test-results-$(Get-Date -Format 'yyyyMMdd').log" -Value $logEntry
    }
}

function Test-ApiEndpoint {
    param(
        [string]$TestName,
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $uri = "$baseUrl$Endpoint"
        
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }

        $null = Invoke-RestMethod @params
        
        Write-TestLog "$TestName - PASSED" "PASS"
        $script:testResults += @{ Test = $TestName; Status = "PASS"; Details = "Status: $ExpectedStatus" }
        return $true
    }
    catch {
        Write-TestLog "$TestName - FAILED: $($_.Exception.Message)" "FAIL"
        $script:testResults += @{ Test = $TestName; Status = "FAIL"; Details = $_.Exception.Message }
        return $false
    }
}

function Test-WebEndpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec 30
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-TestLog "$TestName - PASSED (Status: $($response.StatusCode))" "PASS"
            $script:testResults += @{ Test = $TestName; Status = "PASS"; Details = "Status: $($response.StatusCode)" }
            return $true
        } else {
            Write-TestLog "$TestName - FAILED (Expected: $ExpectedStatus, Got: $($response.StatusCode))" "FAIL"
            $script:testResults += @{ Test = $TestName; Status = "FAIL"; Details = "Status: $($response.StatusCode)" }
            return $false
        }
    }
    catch {
        Write-TestLog "$TestName - FAILED: $($_.Exception.Message)" "FAIL"
        $script:testResults += @{ Test = $TestName; Status = "FAIL"; Details = $_.Exception.Message }
        return $false
    }
}

function Test-ApiSuite {
    Write-Host "`nRunning API Tests..." -ForegroundColor Cyan
    
    # Health check
    Test-ApiEndpoint -TestName "API Health Check" -Endpoint "/api/health"
    
    # Authentication tests
    $loginData = @{
        username = "admin"
        password = "admin123"
    }
    
    $loginResult = Test-ApiEndpoint -TestName "User Login" -Endpoint "/api/login" -Method "POST" -Body $loginData
    
    if ($loginResult) {
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
            $token = $loginResponse.access_token
            $authHeaders = @{ "Authorization" = "Bearer $token" }
            
            # Dashboard tests
            Test-ApiEndpoint -TestName "Dashboard Data" -Endpoint "/api/dashboard" -Headers $authHeaders
            
            # Payment tests
            $paymentData = @{
                amount = 100000
                description = "Test payment"
                payment_method = "bank_transfer"
            }
            Test-ApiEndpoint -TestName "Process Payment" -Endpoint "/api/payment" -Method "POST" -Body $paymentData -Headers $authHeaders
            
            # Reports tests
            Test-ApiEndpoint -TestName "Financial Reports" -Endpoint "/api/reports/financial" -Headers $authHeaders
            Test-ApiEndpoint -TestName "Transaction Reports" -Endpoint "/api/reports/transactions" -Headers $authHeaders
        }
        catch {
            Write-TestLog "Failed to get authentication token: $($_.Exception.Message)" "FAIL"
        }
    }
}

function Test-MobileSuite {
    Write-Host "`nRunning Mobile App Tests..." -ForegroundColor Cyan
    
    # Web app accessibility
    Test-WebEndpoint -TestName "Mobile Web App" -Url $webUrl
    
    # Check if mobile app assets are available
    Test-WebEndpoint -TestName "App Logo" -Url "$webUrl/assets/gajah-nusa-logo.png"
    Test-WebEndpoint -TestName "App Favicon" -Url "$webUrl/assets/favicon.png"
    
    # Test mobile app API integration
    if ($webUrl -like "*localhost*") {
        Write-TestLog "Mobile app running on localhost - checking build status" "INFO"
        
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:19006" -Method Head -TimeoutSec 10
            Write-TestLog "Expo dev server is running" "PASS"
            $script:testResults += @{ Test = "Expo Dev Server"; Status = "PASS"; Details = "Running on port 19006" }
        }
        catch {
            Write-TestLog "Expo dev server not accessible: $($_.Exception.Message)" "FAIL"
            $script:testResults += @{ Test = "Expo Dev Server"; Status = "FAIL"; Details = $_.Exception.Message }
        }
    }
}

function Test-IntegrationSuite {
    Write-Host "`nRunning Integration Tests..." -ForegroundColor Cyan
    
    # End-to-end workflow test
    Write-TestLog "Testing end-to-end workflow..." "INFO"
    
    try {
        $loginData = @{ username = "admin"; password = "admin123" }
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
        $token = $loginResponse.access_token
        $authHeaders = @{ "Authorization" = "Bearer $token" }
        
        # Get dashboard
        $null = Invoke-RestMethod -Uri "$baseUrl/api/dashboard" -Headers $authHeaders
        
        # Process payment
        $paymentData = @{
            amount = 50000
            description = "E2E test payment"
            payment_method = "credit_card"
        }
        $null = Invoke-RestMethod -Uri "$baseUrl/api/payment" -Method POST -Body ($paymentData | ConvertTo-Json) -ContentType "application/json" -Headers $authHeaders
        
        # Generate report
        $null = Invoke-RestMethod -Uri "$baseUrl/api/reports/financial" -Headers $authHeaders
        
        Write-TestLog "End-to-End Workflow - PASSED" "PASS"
        $script:testResults += @{ Test = "End-to-End Workflow"; Status = "PASS"; Details = "Login->Dashboard->Payment->Report" }
    }
    catch {
        Write-TestLog "End-to-End Workflow - FAILED: $($_.Exception.Message)" "FAIL"
        $script:testResults += @{ Test = "End-to-End Workflow"; Status = "FAIL"; Details = $_.Exception.Message }
    }
}

function Test-PerformanceSuite {
    Write-Host "`nRunning Performance Tests..." -ForegroundColor Cyan
    
    $testEndpoints = @(
        "/api/health",
        "/api/login",
        "/api/dashboard"
    )
    
    foreach ($endpoint in $testEndpoints) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            if ($endpoint -eq "/api/login") {
                $loginData = @{ username = "admin"; password = "admin123" }
                $null = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
            } else {
                $null = Invoke-RestMethod -Uri "$baseUrl$endpoint" -TimeoutSec 30
            }
            
            $stopwatch.Stop()
            $responseTime = $stopwatch.ElapsedMilliseconds
            
            if ($responseTime -le 2000) {
                Write-TestLog "Performance $endpoint - PASSED ($responseTime ms)" "PASS"
                $script:testResults += @{ Test = "Performance $endpoint"; Status = "PASS"; Details = "$responseTime ms" }
            } else {
                Write-TestLog "Performance $endpoint - SLOW ($responseTime ms)" "WARN"
                $script:testResults += @{ Test = "Performance $endpoint"; Status = "WARN"; Details = "$responseTime ms (slow)" }
            }
        }
        catch {
            Write-TestLog "Performance $endpoint - FAILED: $($_.Exception.Message)" "FAIL"
            $script:testResults += @{ Test = "Performance $endpoint"; Status = "FAIL"; Details = $_.Exception.Message }
        }
    }
}

# Main testing execution
Write-TestLog "GAJAH NUSA ERP Testing Started" "INFO"

switch ($TestSuite.ToLower()) {
    "api" { Test-ApiSuite }
    "mobile" { Test-MobileSuite }
    "integration" { Test-IntegrationSuite }
    "performance" { Test-PerformanceSuite }
    "all" {
        Test-ApiSuite
        Test-MobileSuite
        Test-IntegrationSuite
        Test-PerformanceSuite
    }
    default {
        Write-TestLog "Invalid test suite: $TestSuite" "FAIL"
        exit 1
    }
}

# Generate test report
Write-Host "`nTest Results Summary:" -ForegroundColor Cyan

$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnTests = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count
$totalTests = $testResults.Count

Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Warnings: $warnTests" -ForegroundColor Yellow
Write-Host "Total: $totalTests" -ForegroundColor Cyan

$testReport = @"
GAJAH NUSA ERP - Test Report
============================
Test Date: $(Get-Date)
Environment: $Environment
Test Suite: $TestSuite

Summary:
Passed: $passedTests
Failed: $failedTests
Warnings: $warnTests
Total: $totalTests

Detailed Results:
"@

foreach ($result in $testResults) {
    $status = switch ($result.Status) {
        "PASS" { "[PASS]" }
        "FAIL" { "[FAIL]" }
        "WARN" { "[WARN]" }
    }
    $testReport += "`n$status $($result.Test): $($result.Details)"
}

$testReport += @"

Recommendations:
$(if ($failedTests -gt 0) { "Fix failed tests before production deployment" } else { "" })
$(if ($warnTests -gt 0) { "Review performance warnings" } else { "" })
$(if ($passedTests -eq $totalTests) { "All tests passed - Ready for production!" } else { "" })

Next Steps:
1. Review failed tests and fix issues
2. Re-run tests after fixes
3. Deploy to production when all tests pass
4. Set up monitoring and alerts
"@

$reportFile = "test-report-$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$testReport | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "`nTest report saved to: $reportFile" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "All critical tests passed! System is ready for production." -ForegroundColor Green
    exit 0
} else {
    Write-Host "$failedTests test(s) failed. Please fix issues before production deployment." -ForegroundColor Red
    exit 1
}
