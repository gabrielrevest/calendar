# Build script avec electron-packager (plus simple, sans signature)
$ErrorActionPreference = "Stop"

Write-Host "=== Construction avec electron-packager ===" -ForegroundColor Cyan

# 1. Arreter les processus
Write-Host "[1/6] Arret des processus..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "Calendrier*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Supprimer les dossiers de build
Write-Host "[2/6] Nettoyage..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
}
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}
if (Test-Path "release") {
    Remove-Item -Recurse -Force "release" -ErrorAction SilentlyContinue
}

# 3. Build Next.js
Write-Host "[3/6] Construction de Next.js..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build Next.js echoue" -ForegroundColor Red
    exit 1
}

# Verifier que le standalone a ete cree
if (-not (Test-Path ".next\standalone")) {
    Write-Host "ERREUR: Le dossier .next\standalone n'existe pas" -ForegroundColor Red
    exit 1
}

# 4. Preparer les fichiers
Write-Host "[4/6] Preparation des fichiers..." -ForegroundColor Yellow

# Copier .next/static vers .next/standalone/.next/static
$staticSource = ".next\static"
$staticDest = ".next\standalone\.next\static"
if (Test-Path $staticSource) {
    if (-not (Test-Path $staticDest)) {
        New-Item -ItemType Directory -Force -Path $staticDest | Out-Null
    }
    Copy-Item -Recurse -Force "$staticSource\*" $staticDest
    Write-Host "  - Fichiers static copies" -ForegroundColor Gray
}

# Copier public vers .next/standalone/public
$publicSource = "public"
$publicDest = ".next\standalone\public"
if (Test-Path $publicSource) {
    if (-not (Test-Path $publicDest)) {
        New-Item -ItemType Directory -Force -Path $publicDest | Out-Null
    }
    Copy-Item -Recurse -Force "$publicSource\*" $publicDest -ErrorAction SilentlyContinue
    Write-Host "  - Fichiers public copies" -ForegroundColor Gray
}

# 5. Creer un dossier temporaire pour l'app
Write-Host "[5/6] Preparation du package..." -ForegroundColor Yellow
$tempApp = "temp-electron-app"
if (Test-Path $tempApp) {
    Remove-Item -Recurse -Force $tempApp
}
New-Item -ItemType Directory -Force -Path $tempApp | Out-Null

# Copier le contenu du standalone directement dans temp-electron-app
Copy-Item ".next\standalone\*" $tempApp -Recurse -Force

# Copier electron-main.js et preload.js
Copy-Item "electron-main.js" "$tempApp\" -Force
if (Test-Path "preload.js") {
    Copy-Item "preload.js" "$tempApp\" -Force
    Write-Host "  - preload.js copie" -ForegroundColor Gray
}

# Creer un dossier prisma avec une base de donnees template
$prismaDir = "$tempApp\prisma"
if (-not (Test-Path $prismaDir)) {
    New-Item -ItemType Directory -Force -Path $prismaDir | Out-Null
}
Copy-Item "prisma\schema.prisma" "$prismaDir\" -Force

# Creer une base de donnees template initialisee
Write-Host "  - Creation de la base de donnees template..." -ForegroundColor Gray
$tempDbPath = "$tempApp\prisma\database.template.db"
$env:DATABASE_URL = "file:$tempDbPath"
npx prisma db push --skip-generate 2>&1 | Out-Null
if (Test-Path $tempDbPath) {
    Write-Host "  - Base de donnees template creee" -ForegroundColor Gray
} else {
    Write-Host "  ATTENTION: Base de donnees template non creee" -ForegroundColor Yellow
}

# Installer les dependances manquantes dans temp-electron-app
Write-Host "  - Installation des dependances..." -ForegroundColor Gray
Push-Location $tempApp
npm install --production --no-package-lock 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ATTENTION: Erreur lors de l'installation des dependances" -ForegroundColor Yellow
}
Pop-Location

Write-Host "  - Structure app preparee" -ForegroundColor Gray

# 6. Package avec electron-packager
Write-Host "[6/6] Package Electron..." -ForegroundColor Yellow
npx electron-packager $tempApp "Calendrier & Projets" `
    --platform=win32 `
    --arch=x64 `
    --out=release `
    --overwrite `
    --icon=build/icon.ico `
    --app-copyright="Copyright 2024" `
    --win32metadata.CompanyName="Calendrier App" `
    --win32metadata.ProductName="Calendrier & Projets"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Package Electron echoue" -ForegroundColor Red
    exit 1
}

# Nettoyer le dossier temporaire
Remove-Item -Recurse -Force $tempApp

# Verification
Write-Host ""
Write-Host "=== VERIFICATION ===" -ForegroundColor Cyan

$appPath = Get-ChildItem -Path "release" -Filter "*.exe" -Recurse | Select-Object -First 1
if ($appPath) {
    Write-Host "BUILD REUSSI!" -ForegroundColor Green
    Write-Host "Application: $($appPath.FullName)" -ForegroundColor White
    Write-Host "Taille: $([math]::Round($appPath.Length/1MB, 2)) MB" -ForegroundColor Gray
    
    # Verifier la structure
    $resourcesPath = "$($appPath.DirectoryName)\resources\app"
    if (Test-Path "$resourcesPath\server.js") {
        Write-Host "Structure: OK (server.js trouve)" -ForegroundColor Green
    } else {
        Write-Host "ATTENTION: server.js non trouve dans resources\app" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERREUR: L'executable n'a pas ete cree" -ForegroundColor Red
    exit 1
}
