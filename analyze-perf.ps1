# 性能诊断脚本（只读）
$ErrorActionPreference = 'Stop'
function Fmt($b){ if($b -ge 1GB){"{0:N2} GB" -f ($b/1GB)} elseif($b -ge 1MB){"{0:N2} MB" -f ($b/1MB)} elseif($b -ge 1KB){"{0:N2} KB" -f ($b/1KB)} else {"$b B"} }
Write-Host "`n========== 1. dist/ 总体积 ==========" -ForegroundColor Cyan
if(-not (Test-Path '.\dist')){ Write-Host 'ERROR: 找不到 dist/' -ForegroundColor Red; exit 1 }
$distTotal=(Get-ChildItem -Path '.\dist' -Recurse -File | Measure-Object Length -Sum).Sum
Write-Host ("dist 总大小: {0}" -f (Fmt $distTotal))
Write-Host "`n========== 2. dist/ 按类型体积 ==========" -ForegroundColor Cyan
Get-ChildItem -Path '.\dist' -Recurse -File | Group-Object { [System.IO.Path]::GetExtension($_.Name).ToLowerInvariant() } | ForEach-Object { [PSCustomObject]@{ Ext=$_.Name; Count=$_.Count; Size=($_.Group|Measure-Object Length -Sum).Sum } } | Sort-Object Size -Descending | Format-Table @{L='类型';E={if($_.Ext){$_.Ext}else{'(无后缀)'}}},Count,@{L='大小';E={Fmt $_.Size}} -AutoSize
Write-Host "`n========== 3. dist/ 体积 Top 15 ==========" -ForegroundColor Cyan
Get-ChildItem -Path '.\dist' -Recurse -File | Sort-Object Length -Descending | Select-Object -First 15 | Format-Table @{L='大小';E={Fmt $_.Length}},@{L='路径';E={$_.FullName.Replace((Get-Location).Path+'\dist\','')}} -AutoSize
Write-Host "`n========== 4. 视频文件清单 ==========" -ForegroundColor Cyan
Get-ChildItem -Path '.' -Recurse -File -Include *.mp4,*.webm,*.mov -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' } | Sort-Object Length -Descending | Format-Table @{L='大小';E={Fmt $_.Length}},@{L='路径';E={$_.FullName.Replace((Get-Location).Path+'\','')}} -AutoSize
Write-Host "`n完成" -ForegroundColor Green
