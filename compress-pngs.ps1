# 压缩 dist/ 里所有 PNG（保持 .png 后缀，代码无需改动）
Get-ChildItem -Path '.\dist' -Recurse -Include *.png -File -ErrorAction SilentlyContinue | ForEach-Object {
  $tmp = $_.FullName + ".tmp.png"
  # PNG: 缩放优化 + 压缩级别 9（无损压缩，体积减半左右）
  ffmpeg -y -i $_.FullName -compression_level 9 $tmp 2>$null
  if((Test-Path $tmp) -and ((Get-Item $tmp).Length -lt $_.Length)){
    Move-Item $tmp $_.FullName -Force
  } else {
    Remove-Item $tmp -ErrorAction SilentlyContinue
  }
}
Write-Host "`n当前 dist 大小：" -ForegroundColor Cyan
$total=(Get-ChildItem -Path '.\dist' -Recurse -File | Measure-Object Length -Sum).Sum
[math]::Round($total/1MB,2).ToString() + " MB"
