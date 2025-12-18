# Build script pour l'application Electron
# Encode en UTF-8 sans BOM

$ErrorActionPreference = "Stop"

Write-Host "=== Construction du .exe (Sans signature) ===" -ForegroundColor Cyan

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

# 3. Supprimer le cache electron-builder ET winCodeSign
Write-Host "[3/6] Suppression du cache..." -ForegroundColor Yellow
$cachePath = "$env:LOCALAPPDATA\electron-builder\Cache"
if (Test-Path $cachePath) {
    Remove-Item -Recurse -Force $cachePath -ErrorAction SilentlyContinue
}
$winCodeSignPath = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
if (Test-Path $winCodeSignPath) {
    Remove-Item -Recurse -Force $winCodeSignPath -ErrorAction SilentlyContinue
}

# 4. Build Next.js
Write-Host "[4/6] Construction de Next.js..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build Next.js echoue" -ForegroundColor Red
    exit 1
}

# Verifier que le standalone a ete cree
if (-not (Test-Path ".next\standalone")) {
    Write-Host "ERREUR: Le dossier .next\standalone n'existe pas" -ForegroundColor Red
    Write-Host "Verifiez que next.config.js contient output: 'standalone'" -ForegroundColor Yellow
    exit 1
}

# 5. Copier les fichiers statiques vers standalone
Write-Host "[5/6] Preparation des fichiers..." -ForegroundColor Yellow

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

# 6. Build Electron
Write-Host "[6/6] Construction Electron..." -ForegroundColor Yellow

# Variables d'environnement pour desactiver COMPLETEMENT la signature
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""
$env:CSC_LINK = ""
$env:CSC_KEY_PASSWORD = ""
$env:SKIP_NOTARIZATION = "true"
$env:USE_HARD_LINKS = "false"

# Supprimer le cache winCodeSign qui pose probleme
$winCodeSignCache = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
if (Test-Path $winCodeSignCache) {
    Remove-Item -Recurse -Force $winCodeSignCache -ErrorAction SilentlyContinue
}

# Executer electron-builder avec target dir uniquement (pas d'installateur)
npx electron-builder build --win --x64 --dir --config electron-builder.yml
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Build Electron echoue" -ForegroundColor Red
    exit 1
}

# Verification finale
Write-Host ""
Write-Host "=== VERIFICATION ===" -ForegroundColor Cyan

$exePath = "dist\win-unpacked\Calendrier & Projets.exe"
if (Test-Path $exePath) {
    Write-Host "BUILD REUSSI!" -ForegroundColor Green
    Write-Host "Application: $exePath" -ForegroundColor White
    
    # Verifier les ressources
    $appPath = "dist\win-unpacked\resources\app"
    if (Test-Path $appPath) {
        Write-Host "Ressources app: OK" -ForegroundColor Green
        
        $serverPath = "$appPath\server.js"
        if (Test-Path $serverPath) {
            Write-Host "Serveur Next.js: OK" -ForegroundColor Green
        } else {
            Write-Host "Serveur Next.js: MANQUANT" -ForegroundColor Red
        }
    } else {
        Write-Host "Ressources app: MANQUANT" -ForegroundColor Red
    }
} else {
    Write-Host "ERREUR: L'executable n'a pas ete cree" -ForegroundColor Red
    exit 1
}
