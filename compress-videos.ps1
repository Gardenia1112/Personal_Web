# 压缩 dist/ 里的 art reel 视频 → 480p webm（覆盖原文件）
$videos = @(
  "assets\art\videos\111.mp4",
  "assets\art\videos\最终版yellow.mp4",
  "assets\art\editing\reel-01.mp4",
  "assets\art\editing\reel-02.mp4",
  "assets\art\editing\reel-03.mp4"
)
foreach($v in $videos){
  $src = Join-Path (Get-Location) "dist\$v"
  if(Test-Path $src){
    $dst = $src -replace '\.mp4$', '_480p.mp4'
    # 480p + CRF 28（约 3-5MB/30s）
    ffmpeg -y -i $src -vf "scale=-2:480" -c:v libx264 -crf 28 -preset fast -an $dst 2>$null
    if(Test-Path $dst){
      Remove-Item $src -Force
      Rename-Item $dst ($src -replace '\.mp4$', '.mp4')
      Write-Host "压缩完成: $v" -ForegroundColor Green
    }
  }
}
Write-Host "`n当前 dist 大小：" -ForegroundColor Cyan
$total=(Get-ChildItem -Path '.\dist' -Recurse -File | Measure-Object Length -Sum).Sum
[math]::Round($total/1MB,2).ToString() + " MB"
