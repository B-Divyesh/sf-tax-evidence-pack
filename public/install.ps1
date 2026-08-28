$ErrorActionPreference = 'Stop'
$base = 'https://tax-evidence-pack.sociobot.in'
$tmp = Join-Path $env:TEMP "tax-evidence-pack-$PID"; New-Item -ItemType Directory -Path $tmp | Out-Null
Invoke-WebRequest "$base/latest.json" -OutFile "$tmp/latest.json"; $latest = Get-Content "$tmp/latest.json" | ConvertFrom-Json; $asset = $latest.platforms.windows
$file = Join-Path $tmp ([IO.Path]::GetFileName($asset.url)); Invoke-WebRequest $asset.url -OutFile $file
if ((Get-FileHash $file -Algorithm SHA256).Hash.ToLower() -ne $asset.sha256.ToLower()) { throw 'Checksum verification failed.' }; Write-Host "Verified $file"; Start-Process $file; Write-Host 'Opened the verified installer. Windows may show an unsigned-publisher warning.'
