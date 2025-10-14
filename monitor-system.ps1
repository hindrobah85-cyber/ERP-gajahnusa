# GAJAH NUSA ERP - System Monitoring Script
# This script monitors the health and performance of the ERP system

param(
    [Parameter(Mandatory=$false)]
    [int]$IntervalSeconds = 60,
    
    [Parameter(Mandatory=$false)]
    [string]$LogFile = "monitoring.log",
    
    [Parameter(Mandatory=$false)]
    [switch]$SendAlerts = $false
)

Write-Host "🔍 Starting GAJAH NUSA ERP System Monitoring..." -ForegroundColor Green
Write-Host "📊 Monitoring interval: $IntervalSeconds seconds" -ForegroundColor Yellow
Write-Host "📝 Log file: $LogFile" -ForegroundColor Yellow

function Write-MonitoringLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARN") { "Yellow" } else { "Green" })
    Add-Content -Path $LogFile -Value $logEntry
}

function Test-ServiceHealth {
    param([string]$ServiceName, [string]$Url, [string]$Container = $null)
    
    try {
        if ($Container) {
            # Check Docker container status
            $containerStatus = docker inspect $Container --format='{{.State.Status}}' 2>$null
            if ($containerStatus -ne "running") {
                throw "Container $Container is not running (Status: $containerStatus)"
            }
        }
        
        # Check HTTP endpoint
        Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10 | Out-Null
        Write-MonitoringLog "✅ $ServiceName is healthy" "INFO"
        return $true
    }
    catch {
        Write-MonitoringLog "❌ $ServiceName health check failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-SystemMetrics {
    try {
        # CPU Usage
        $cpu = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average
        $cpuUsage = [math]::Round($cpu.Average, 2)
        
        # Memory Usage
        $memory = Get-WmiObject -Class Win32_OperatingSystem
        $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
        $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
        $usedMemory = [math]::Round($totalMemory - $freeMemory, 2)
        $memoryUsagePercent = [math]::Round(($usedMemory / $totalMemory) * 100, 2)
        
        # Disk Usage
        $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
        $diskTotal = [math]::Round($disk.Size / 1GB, 2)
        $diskFree = [math]::Round($disk.FreeSpace / 1GB, 2)
        $diskUsed = [math]::Round($diskTotal - $diskFree, 2)
        $diskUsagePercent = [math]::Round(($diskUsed / $diskTotal) * 100, 2)
        
        return @{
            CPU = $cpuUsage
            MemoryUsed = $usedMemory
            MemoryTotal = $totalMemory
            MemoryPercent = $memoryUsagePercent
            DiskUsed = $diskUsed
            DiskTotal = $diskTotal
            DiskPercent = $diskUsagePercent
        }
    }
    catch {
        Write-MonitoringLog "❌ Failed to get system metrics: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Send-Alert {
    param([string]$Message, [string]$Severity = "WARNING")
    
    if ($SendAlerts) {
        Write-MonitoringLog "🚨 ALERT [$Severity]: $Message" "ERROR"
        # Here you can add email, SMS, or webhook notifications
        # Example: Send-MailMessage or Invoke-RestMethod to webhook
    }
}

# Main monitoring loop
Write-MonitoringLog "🚀 GAJAH NUSA ERP Monitoring Started" "INFO"

while ($true) {
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "`n🔄 [$timestamp] Running health checks..." -ForegroundColor Cyan
        
        # Service health checks
        $services = @(
            @{ Name = "Backend API"; Url = "http://localhost:8001/api/health"; Container = "erp_backend_prod" }
            @{ Name = "Database"; Url = "http://localhost:8001/api/health"; Container = "erp_database_prod" }
            @{ Name = "Web Frontend"; Url = "http://localhost"; Container = "erp_nginx_prod" }
            @{ Name = "Redis Cache"; Url = $null; Container = "erp_redis_prod" }
        )
        
        $failedServices = @()
        foreach ($service in $services) {
            if ($service.Url) {
                $isHealthy = Test-ServiceHealth -ServiceName $service.Name -Url $service.Url -Container $service.Container
            } else {
                # Container-only check
                try {
                    $containerStatus = docker inspect $service.Container --format='{{.State.Status}}' 2>$null
                    $isHealthy = $containerStatus -eq "running"
                    if ($isHealthy) {
                        Write-MonitoringLog "✅ $($service.Name) is healthy" "INFO"
                    } else {
                        Write-MonitoringLog "❌ $($service.Name) is not running" "ERROR"
                    }
                }
                catch {
                    $isHealthy = $false
                    Write-MonitoringLog "❌ $($service.Name) check failed: $($_.Exception.Message)" "ERROR"
                }
            }
            
            if (-not $isHealthy) {
                $failedServices += $service.Name
            }
        }
        
        # System metrics
        $metrics = Get-SystemMetrics
        if ($metrics) {
            Write-MonitoringLog "📊 System Metrics - CPU: $($metrics.CPU)%, Memory: $($metrics.MemoryPercent)%, Disk: $($metrics.DiskPercent)%" "INFO"
            
            # Alert thresholds
            if ($metrics.CPU -gt 80) {
                Send-Alert "High CPU usage: $($metrics.CPU)%" "WARNING"
            }
            if ($metrics.MemoryPercent -gt 85) {
                Send-Alert "High memory usage: $($metrics.MemoryPercent)%" "WARNING"
            }
            if ($metrics.DiskPercent -gt 90) {
                Send-Alert "High disk usage: $($metrics.DiskPercent)%" "CRITICAL"
            }
        }
        
        # Failed services alert
        if ($failedServices.Count -gt 0) {
            Send-Alert "Services down: $($failedServices -join ', ')" "CRITICAL"
        }
        
        # Success summary
        if ($failedServices.Count -eq 0) {
            Write-Host "✅ All services are healthy" -ForegroundColor Green
        } else {
            Write-Host "❌ $($failedServices.Count) service(s) have issues" -ForegroundColor Red
        }
        
        Write-Host "⏰ Next check in $IntervalSeconds seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds $IntervalSeconds
    }
    catch {
        Write-MonitoringLog "❌ Monitoring error: $($_.Exception.Message)" "ERROR"
        Start-Sleep -Seconds 30  # Wait before retrying
    }
}
