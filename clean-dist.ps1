Write-Host "===== 清理 dist/ (安全版) =====" -ForegroundColor Cyan

# 1. 删除所有 PSD（网页绝不会引用 .psd）
Get-ChildItem -Path '.\dist' -Recurse -Filter *.psd -File -ErrorAction SilentlyContinue | Remove-Item -Force -Verbose

# 2. 删除 handoff 目录（开发文档）
if(Test-Path '.\dist\handoff'){ Remove-Item -Path '.\dist\handoff' -Recurse -Force -Verbose }

# 3. 删除超大原始 mp4 (>30MB)，这些一定是源素材不是展示用
Get-ChildItem -Path '.\dist' -Recurse -Include *.mp4 -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 30MB } | Remove-Item -Force -Verbose

Write-Host "`n清理完成，当前 dist 大小：" -ForegroundColor Green
$total=(Get-ChildItem -Path '.\dist' -Recurse -File | Measure-Object Length -Sum).Sum
[math]::Round($total/1MB,2).ToString() + " MB"
