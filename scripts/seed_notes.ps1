param(
  [string]$EnvPath = ".env"
)

& "$PSScriptRoot/load-env.ps1" -EnvPath $EnvPath
Get-Content "$PSScriptRoot/seed_notes.sql" | npx prisma db execute --stdin
