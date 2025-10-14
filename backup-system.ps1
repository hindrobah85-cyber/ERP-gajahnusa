# GAJAH NUSA ERP - Backup Script
# This script creates backups of the database and important files

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupType = "full",  # full, database, files
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = ".\backups",
    
    [Parameter(Mandatory=$false)]
    [int]$RetentionDays = 30
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $BackupPath $timestamp

Write-Host "💾 Starting GAJAH NUSA ERP Backup..." -ForegroundColor Green
Write-Host "📅 Backup Type: $BackupType" -ForegroundColor Yellow
Write-Host "📁 Backup Directory: $backupDir" -ForegroundColor Yellow

# Create backup directory
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

function Write-BackupLog {
    param([string]$Message, [string]$Level = "INFO")
    $logTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$logTimestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARN") { "Yellow" } else { "Green" })
    Add-Content -Path (Join-Path $backupDir "backup.log") -Value $logEntry
}

function Backup-Database {
    Write-BackupLog "Starting database backup..." "INFO"
    
    try {
        # PostgreSQL backup
        $pgDumpFile = Join-Path $backupDir "database_postgresql_$timestamp.sql"
        docker exec erp_database_prod pg_dump -U erp_user erp_production > $pgDumpFile
        
        if (Test-Path $pgDumpFile) {
            $fileSize = (Get-Item $pgDumpFile).Length / 1MB
            Write-BackupLog "✅ PostgreSQL backup completed - Size: $([math]::Round($fileSize, 2)) MB" "INFO"
        } else {
            throw "PostgreSQL backup file not created"
        }
        
        # SQLite backup (if exists)
        $sqliteFile = ".\erp_antifraud.db"
        if (Test-Path $sqliteFile) {
            $sqliteBackup = Join-Path $backupDir "database_sqlite_$timestamp.db"
            Copy-Item $sqliteFile $sqliteBackup
            Write-BackupLog "✅ SQLite backup completed" "INFO"
        }
        
        return $true
    }
    catch {
        Write-BackupLog "❌ Database backup failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Backup-Files {
    Write-BackupLog "Starting files backup..." "INFO"
    
    try {
        # Important directories to backup
        $dirsToBackup = @(
            @{ Source = ".\mobile\src"; Dest = "mobile_src" }
            @{ Source = ".\backend"; Dest = "backend" }
            @{ Source = ".\assets"; Dest = "assets" }
            @{ Source = ".\uploads"; Dest = "uploads" }
            @{ Source = ".\logs"; Dest = "logs" }
        )
        
        # Configuration files
        $filesToBackup = @(
            ".env.production",
            "docker-compose.production.yml",
            "simple_api.py",
            "package.json",
            "requirements.txt",
            "USER_MANUAL.md",
            "DEPLOYMENT_CHECKLIST.md",
            "TESTING_PLAN.md"
        )
        
        # Backup directories
        foreach ($dir in $dirsToBackup) {
            if (Test-Path $dir.Source) {
                $destPath = Join-Path $backupDir $dir.Dest
                Copy-Item -Path $dir.Source -Destination $destPath -Recurse -Force
                Write-BackupLog "✅ Backed up directory: $($dir.Source)" "INFO"
            } else {
                Write-BackupLog "⚠️ Directory not found: $($dir.Source)" "WARN"
            }
        }
        
        # Backup individual files
        $configDir = Join-Path $backupDir "config"
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        
        foreach ($file in $filesToBackup) {
            if (Test-Path $file) {
                Copy-Item -Path $file -Destination $configDir -Force
                Write-BackupLog "✅ Backed up file: $file" "INFO"
            } else {
                Write-BackupLog "⚠️ File not found: $file" "WARN"
            }
        }
        
        return $true
    }
    catch {
        Write-BackupLog "❌ Files backup failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Compress-Backup {
    Write-BackupLog "Compressing backup..." "INFO"
    
    try {
        $zipFile = "$backupDir.zip"
        Compress-Archive -Path $backupDir -DestinationPath $zipFile -Force
        
        if (Test-Path $zipFile) {
            $zipSize = (Get-Item $zipFile).Length / 1MB
            Write-BackupLog "✅ Backup compressed - Size: $([math]::Round($zipSize, 2)) MB" "INFO"
            
            # Remove uncompressed directory
            Remove-Item -Path $backupDir -Recurse -Force
            Write-BackupLog "✅ Cleaned up temporary files" "INFO"
            
            return $zipFile
        } else {
            throw "Compression failed"
        }
    }
    catch {
        Write-BackupLog "❌ Compression failed: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Remove-OldBackups {
    Write-BackupLog "Cleaning up old backups..." "INFO"
    
    try {
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        $oldBackups = Get-ChildItem -Path $BackupPath -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        foreach ($backup in $oldBackups) {
            Remove-Item -Path $backup.FullName -Force
            Write-BackupLog "🗑️ Removed old backup: $($backup.Name)" "INFO"
        }
        
        if ($oldBackups.Count -eq 0) {
            Write-BackupLog "✅ No old backups to remove" "INFO"
        } else {
            Write-BackupLog "✅ Removed $($oldBackups.Count) old backup(s)" "INFO"
        }
    }
    catch {
        Write-BackupLog "❌ Failed to clean old backups: $($_.Exception.Message)" "ERROR"
    }
}

# Main backup process
Write-BackupLog "🚀 GAJAH NUSA ERP Backup Started" "INFO"

$success = $true

# Perform backup based on type
switch ($BackupType.ToLower()) {
    "database" {
        $success = Backup-Database
    }
    "files" {
        $success = Backup-Files
    }
    "full" {
        $dbSuccess = Backup-Database
        $filesSuccess = Backup-Files
        $success = $dbSuccess -and $filesSuccess
    }
    default {
        Write-BackupLog "❌ Invalid backup type: $BackupType" "ERROR"
        exit 1
    }
}

if ($success) {
    # Compress the backup
    $zipFile = Compress-Backup
    
    if ($zipFile) {
        Write-BackupLog "🎉 Backup completed successfully!" "INFO"
        Write-BackupLog "📦 Backup file: $zipFile" "INFO"
        
        # Clean up old backups
        Remove-OldBackups
        
        # Create backup report
        $backupReport = @"
GAJAH NUSA ERP - Backup Report
==============================
Backup Date: $(Get-Date)
Backup Type: $BackupType
Backup File: $zipFile
Status: SUCCESS

Backup Contents:
$(if ($BackupType -eq "full" -or $BackupType -eq "database") { "✅ Database (PostgreSQL)" } else { "" })
$(if ($BackupType -eq "full" -or $BackupType -eq "files") { "✅ Application Files" } else { "" })
$(if ($BackupType -eq "full" -or $BackupType -eq "files") { "✅ Configuration Files" } else { "" })
$(if ($BackupType -eq "full" -or $BackupType -eq "files") { "✅ Assets and Uploads" } else { "" })

Retention Policy: $RetentionDays days
Next Backup: $(Get-Date (Get-Date).AddDays(1) -Format "yyyy-MM-dd HH:mm:ss")

Recovery Instructions:
1. Extract backup file: Expand-Archive '$zipFile' -DestinationPath '.\restore'
2. Restore database: docker exec erp_database_prod psql -U erp_user erp_production < restore/database_postgresql_*.sql
3. Restore files: Copy files from restore/ to appropriate locations
4. Restart services: docker-compose -f docker-compose.production.yml restart
"@
        
        $backupReport | Out-File -FilePath (Join-Path $BackupPath "backup-report-$timestamp.txt") -Encoding UTF8
        
        Write-Host "🎉 Backup completed successfully!" -ForegroundColor Green
        Write-Host "📦 Backup file: $zipFile" -ForegroundColor Cyan
    } else {
        Write-BackupLog "❌ Backup compression failed!" "ERROR"
        exit 1
    }
} else {
    Write-BackupLog "❌ Backup failed!" "ERROR"
    exit 1
}
