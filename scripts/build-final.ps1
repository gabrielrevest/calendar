# Build Final - Application complete avec toutes les ameliorations
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  BUILD FINAL - Calendrier & Projets" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Nettoyage
Write-Host "[1/7] Nettoyage complet..." -ForegroundColor Yellow
Get-Process -Name "node","electron","Calendrier*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue }
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue }
if (Test-Path "release") { Remove-Item -Recurse -Force "release" -ErrorAction SilentlyContinue }
if (Test-Path "temp-electron-app") { Remove-Item -Recurse -Force "temp-electron-app" -ErrorAction SilentlyContinue }

# 2. Build Next.js
Write-Host "[2/7] Build Next.js (production)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build Next.js echoue" -ForegroundColor Red
    exit 1
}

# Verifier standalone
if (-not (Test-Path ".next\standalone")) {
    Write-Host "ERREUR: Standalone non cree" -ForegroundColor Red
    exit 1
}

# 3. Preparation fichiers
Write-Host "[3/7] Preparation des fichiers..." -ForegroundColor Yellow

# Static
$staticSource = ".next\static"
$staticDest = ".next\standalone\.next\static"
if (Test-Path $staticSource) {
    New-Item -ItemType Directory -Force -Path $staticDest | Out-Null
    Copy-Item -Recurse -Force "$staticSource\*" $staticDest
    Write-Host "  - Static: OK" -ForegroundColor Gray
}

# Public
$publicSource = "public"
$publicDest = ".next\standalone\public"
if (Test-Path $publicSource) {
    New-Item -ItemType Directory -Force -Path $publicDest | Out-Null
    Copy-Item -Recurse -Force "$publicSource\*" $publicDest -ErrorAction SilentlyContinue
    Write-Host "  - Public: OK" -ForegroundColor Gray
}

# 4. Creation package temporaire
Write-Host "[4/7] Creation du package temporaire..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "temp-electron-app" | Out-Null

# Copier standalone
Copy-Item ".next\standalone\*" "temp-electron-app" -Recurse -Force

# Copier electron-main
Copy-Item "electron-main.js" "temp-electron-app\" -Force

# Copier Prisma
New-Item -ItemType Directory -Force -Path "temp-electron-app\prisma" | Out-Null
Copy-Item "prisma\schema.prisma" "temp-electron-app\prisma\" -Force

Write-Host "  - Structure: OK" -ForegroundColor Gray

# 5. Creation base de donnees template
Write-Host "[5/7] Creation de la base de donnees template..." -ForegroundColor Yellow
$dbPath = Join-Path (Get-Location) "temp-electron-app\prisma\database.template.db"
$env:DATABASE_URL = "file:$dbPath"
npx prisma db push --skip-generate --accept-data-loss 2>&1 | Out-Null

if (Test-Path "temp-electron-app\prisma\database.template.db") {
    Write-Host "  - Database template: OK" -ForegroundColor Gray
} else {
    Write-Host "  ATTENTION: Database template non creee" -ForegroundColor Yellow
}

# 6. Installation dependances
Write-Host "[6/7] Installation des dependances..." -ForegroundColor Yellow
Push-Location "temp-electron-app"
npm install --production --no-package-lock 2>&1 | Out-Null
npm install tslib --no-save 2>&1 | Out-Null
Pop-Location
Write-Host "  - Dependencies: OK" -ForegroundColor Gray

# 7. Package Electron
Write-Host "[7/7] Package de l'application Electron..." -ForegroundColor Yellow
npx electron-packager temp-electron-app "Calendrier & Projets" `
    --platform=win32 `
    --arch=x64 `
    --out=release `
    --overwrite `
    --icon=build/icon.ico `
    --app-copyright="Copyright 2024" `
    --win32metadata.CompanyName="Calendrier App" `
    --win32metadata.ProductName="Calendrier & Projets" 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Package Electron echoue" -ForegroundColor Red
    exit 1
}

# Nettoyage final
Remove-Item -Recurse -Force "temp-electron-app" -ErrorAction SilentlyContinue

# Verification
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "       BUILD REUSSI!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$exePath = "release\Calendrier & Projets-win32-x64\Calendrier & Projets.exe"
if (Test-Path $exePath) {
    $fileInfo = Get-Item $exePath
    Write-Host "Application:" -ForegroundColor White
    Write-Host "  Chemin: $($fileInfo.FullName)" -ForegroundColor Gray
    Write-Host "  Taille: $([math]::Round($fileInfo.Length/1MB, 2)) MB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Fonctionnalites incluses:" -ForegroundColor White
    Write-Host "  - Calendrier complet avec visualisation" -ForegroundColor Gray
    Write-Host "  - Gestion des rendez-vous" -ForegroundColor Gray
    Write-Host "  - Projets (Personnel, Professionnel, Livre)" -ForegroundColor Gray
    Write-Host "  - Notes avec categories" -ForegroundColor Gray
    Write-Host "  - Synchronisation iPhone (via lien d'abonnement)" -ForegroundColor Gray
    Write-Host "  - Base de donnees SQLite locale" -ForegroundColor Gray
    Write-Host "  - Authentification securisee" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pour lancer l'application:" -ForegroundColor Cyan
    Write-Host "  .\release\Calendrier & Projets-win32-x64\Calendrier & Projets.exe" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERREUR: Executable non trouve" -ForegroundColor Red
    exit 1
}


