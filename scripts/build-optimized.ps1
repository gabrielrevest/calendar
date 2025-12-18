# Script de build optimisé pour Electron
# Optimisé pour petits PC - léger et rapide

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  BUILD OPTIMISÉ ELECTRON" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Nettoyer les anciens builds
Write-Host "Nettoyage..." -ForegroundColor Yellow
if (Test-Path "release") {
    Remove-Item -Recurse -Force "release"
}
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "temp-electron-app") {
    Remove-Item -Recurse -Force "temp-electron-app"
}

# Build Next.js optimisé
Write-Host "Build Next.js (optimisé)..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build Next.js" -ForegroundColor Red
    exit 1
}

# Créer la structure temporaire
Write-Host "Création structure..." -ForegroundColor Yellow
$tempDir = "temp-electron-app"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Copier les fichiers essentiels
Write-Host "Copie des fichiers..." -ForegroundColor Yellow
Copy-Item ".next/standalone/*" -Destination "$tempDir" -Recurse -Force
Copy-Item ".next/static" -Destination "$tempDir/.next/static" -Recurse -Force
Copy-Item "public" -Destination "$tempDir/public" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "electron-main.js" -Destination "$tempDir" -Force
Copy-Item "preload.js" -Destination "$tempDir" -Force
Copy-Item "package.json" -Destination "$tempDir" -Force

# Créer package.json minimal pour Electron
$packageJson = @{
    name = "calendrier-app"
    version = "1.0.0"
    main = "electron-main.js"
    dependencies = @{
        "electron" = "^28.0.0"
    }
} | ConvertTo-Json -Depth 10

Set-Content -Path "$tempDir/package.json" -Value $packageJson

# Créer base de données template
Write-Host "Création base de données template..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$tempDir/prisma" | Out-Null
Copy-Item "prisma/schema.prisma" -Destination "$tempDir/prisma/schema.prisma" -Force

# Installer seulement les dépendances Electron
Write-Host "Installation dépendances Electron..." -ForegroundColor Yellow
Set-Location $tempDir
npm install --production --no-optional --legacy-peer-deps 2>&1 | Out-Null
Set-Location ..

# Build avec electron-packager (plus léger)
Write-Host "Packaging Electron (optimisé)..." -ForegroundColor Yellow
$appName = "Calendrier & Projets"
$outputDir = "release"

npx electron-packager $tempDir $appName `
    --platform=win32 `
    --arch=x64 `
    --out=$outputDir `
    --overwrite `
    --ignore="node_modules/(?!electron)" `
    --ignore=".next/cache" `
    --ignore="*.md" `
    --ignore=".git" `
    --ignore="src" `
    --ignore="scripts" `
    --ignore="prisma/migrations" `
    --asar=false `
    --no-prune=false

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du packaging" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  BUILD TERMINÉ !" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Exécutable dans: $outputDir\$appName-win32-x64\$appName.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "Taille optimisée pour petits PC !" -ForegroundColor Yellow

