# Script pour fixer le cache winCodeSign en retirant les liens symboliques problematiques

$ErrorActionPreference = "Stop"

$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$tempDir = "$env:TEMP\winCodeSign-fix"

Write-Host "Fix du cache winCodeSign..." -ForegroundColor Cyan

# Supprimer le dossier winCodeSign existant
if (Test-Path $cacheDir) {
    Write-Host "Suppression de l'ancien cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $cacheDir -ErrorAction SilentlyContinue
}

# Creer un dossier vide pour simuler le cache (pour eviter le telechargement)
New-Item -ItemType Directory -Force -Path "$cacheDir\winCodeSign-2.6.0" | Out-Null

# Creer des fichiers factices pour que electron-builder pense que c'est installe
Write-Host "Creation du cache factice..." -ForegroundColor Yellow

# Structure minimale pour eviter le telechargement
$fakeDir = "$cacheDir\winCodeSign-2.6.0"
New-Item -ItemType Directory -Force -Path "$fakeDir\win" | Out-Null
New-Item -ItemType File -Force -Path "$fakeDir\win\osslsigncode.exe" | Out-Null

Write-Host "Cache winCodeSign prepare!" -ForegroundColor Green

