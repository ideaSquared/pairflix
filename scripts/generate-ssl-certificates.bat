@echo off
REM Batch script to generate SSL certificates for PairFlix on Windows
REM Usage: scripts\generate-ssl-certificates.bat

setlocal enabledelayedexpansion

echo 🔐 Generating SSL certificates for PairFlix...

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ OpenSSL not found. Please install OpenSSL:
    echo    Option 1: Install Git for Windows ^(includes OpenSSL^)
    echo    Option 2: Install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html
    echo    Option 3: Use Windows Subsystem for Linux ^(WSL^)
    exit /b 1
)

REM Create SSL directory
if not exist "nginx\ssl" (
    echo 📁 Creating SSL directory: nginx\ssl
    mkdir "nginx\ssl"
)

REM Check if certificates already exist
if exist "nginx\ssl\cert.pem" if exist "nginx\ssl\key.pem" (
    set /p "overwrite=🤔 SSL certificates already exist. Overwrite? (y/N): "
    if /i not "!overwrite!"=="y" (
        echo ✅ Using existing certificates
        exit /b 0
    )
)

REM Generate SSL certificate
echo 🔧 Generating self-signed certificate for localhost...

REM Set environment variable to prevent Git Bash path conversion
set MSYS_NO_PATHCONV=1

openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
    -keyout "nginx\ssl\key.pem" ^
    -out "nginx\ssl\cert.pem" ^
    -subj "/C=US/ST=State/L=City/O=PairFlix/CN=localhost" 2>nul

if %errorlevel% equ 0 (
    echo ✅ SSL certificates generated successfully!
    echo    Certificate: nginx\ssl\cert.pem
    echo    Private Key: nginx\ssl\key.pem
    echo.
    echo 📋 Certificate Details:
    openssl x509 -in "nginx\ssl\cert.pem" -text -noout | findstr "Subject: Not"
    echo.
    echo 🚀 You can now run the production deployment:
    echo    bash scripts/deploy-production.sh
    echo.
    echo ⚠️  Note: These are self-signed certificates for development/testing only.
    echo    For production, use certificates from a trusted Certificate Authority.
) else (
    echo ❌ Failed to generate SSL certificates
    echo Please check that OpenSSL is properly installed and accessible
    exit /b 1
)

endlocal 