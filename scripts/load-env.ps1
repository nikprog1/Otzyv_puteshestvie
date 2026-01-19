param(
  [string]$EnvPath = ".env"
)

if (-not (Test-Path $EnvPath)) {
  throw "Файл $EnvPath не найден."
}

Get-Content $EnvPath | ForEach-Object {
  if ($_ -match '^(\\w+)=\"?(.*?)\"?$') {
    $name = $Matches[1]
    $value = $Matches[2]
    Set-Item -Path "Env:$name" -Value $value
  }
}
