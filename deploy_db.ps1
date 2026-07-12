# deploy_db.ps1
# Run this script after creating the Render PostgreSQL database.
# Usage:
#   .\deploy_db.ps1 -DatabaseUrl "postgresql://user:pass@host/dbname"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

$pgBin = "C:\Program Files\PostgreSQL\17\bin"

Write-Host "Step 1: Pushing Prisma schema to Render database..." -ForegroundColor Cyan
Set-Location "D:\DESKTOP\film-discovery\backend"
$env:DATABASE_URL = $DatabaseUrl
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma db push failed. Check your DatabaseUrl." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Importing 3000 films..." -ForegroundColor Cyan
& "$pgBin\psql.exe" $DatabaseUrl -f "D:\DESKTOP\film-discovery\films_export.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Film import failed. Check psql path and DatabaseUrl." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Verifying import..." -ForegroundColor Cyan
& "$pgBin\psql.exe" $DatabaseUrl -c "SELECT COUNT(*) FROM films;"

Write-Host ""
Write-Host "Done! If count shows 3000, database is ready." -ForegroundColor Green
