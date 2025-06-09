# PowerShell script to generate SSL certificates for PairFlix on Windows
# Usage: .\scripts\generate-ssl-certificates.ps1

param(
    [string]$OutputDir = "nginx\ssl",
    [string]$Domain = "localhost",
    [int]$Days = 365
)

Write-Host "Generating SSL certificates for PairFlix..." -ForegroundColor Cyan

# Check if OpenSSL is available
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
if (-not $opensslPath) {
    Write-Host "OpenSSL not found. Please install OpenSSL:" -ForegroundColor Red
    Write-Host "   Option 1: Install Git for Windows (includes OpenSSL)" -ForegroundColor Yellow
    Write-Host "   Option 2: Install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    Write-Host "   Option 3: Use Windows Subsystem for Linux (WSL)" -ForegroundColor Yellow
    exit 1
}

# Create SSL directory
if (-not (Test-Path $OutputDir)) {
    Write-Host "Creating SSL directory: $OutputDir" -ForegroundColor Green
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Check if certificates already exist
$certPath = Join-Path $OutputDir "cert.pem"
$keyPath = Join-Path $OutputDir "key.pem"

if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
    $response = Read-Host "SSL certificates already exist. Overwrite? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Using existing certificates" -ForegroundColor Green
        exit 0
    }
}

# Generate SSL certificate
Write-Host "Generating self-signed certificate for $Domain..." -ForegroundColor Yellow

$opensslArgs = @(
    "req", "-x509", "-nodes", "-days", $Days.ToString(),
    "-newkey", "rsa:2048",
    "-keyout", $keyPath,
    "-out", $certPath,
    "-subj", "/C=US/ST=State/L=City/O=PairFlix/CN=$Domain"
)

# Set environment variable to prevent Git Bash path conversion
$env:MSYS_NO_PATHCONV = "1"

try {
    $process = Start-Process -FilePath "openssl" -ArgumentList $opensslArgs -Wait -PassThru -NoNewWindow -RedirectStandardError "ssl_error.log"
    
    if ($process.ExitCode -eq 0) {
        Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
        Write-Host "   Certificate: $certPath" -ForegroundColor Gray
        Write-Host "   Private Key: $keyPath" -ForegroundColor Gray
        
        # Display certificate info
        Write-Host ""
        Write-Host "Certificate Details:" -ForegroundColor Cyan
        $certInfo = & openssl x509 -in $certPath -text -noout | Select-String "Subject:", "Not Before:", "Not After:"
        foreach ($line in $certInfo) {
            Write-Host "   $($line.Line.Trim())" -ForegroundColor Gray
        }
        
        # Clean up error log if empty
        if (Test-Path "ssl_error.log") {
            $errorContent = Get-Content "ssl_error.log" -Raw
            if ($errorContent.Trim() -eq "") {
                Remove-Item "ssl_error.log" -Force
            }
        }
        
        Write-Host ""
        Write-Host "You can now run the production deployment:" -ForegroundColor Green
        Write-Host "   bash scripts/deploy-production.sh" -ForegroundColor White
        
    } else {
        Write-Host "Failed to generate SSL certificates" -ForegroundColor Red
        if (Test-Path "ssl_error.log") {
            Write-Host "Error details:" -ForegroundColor Red
            $errorContent = Get-Content "ssl_error.log"
            foreach ($line in $errorContent) {
                Write-Host $line -ForegroundColor Red
            }
        }
        exit 1
    }
} catch {
    Write-Host "Error generating SSL certificates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Note: These are self-signed certificates for development/testing only." -ForegroundColor Yellow
Write-Host "For production, use certificates from a trusted Certificate Authority." -ForegroundColor Yellow 