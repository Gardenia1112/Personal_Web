# PersonalWeb 清理流程

## 分工
- **元宝**：提供扫描逻辑 + 白名单 + 删除脚本（已在此压缩包内）
- **Cursor**：在 IDE 打开 `cleanup-candidates.txt` 逐条 Review，删误报，执行删除并跑 `npm run build` 验证

## 安全机制
1. 先出清单后删除，可逐条审核
2. 默认 DryRun，只有 `-Confirmed` + 输入 `YES` 才真删
3. 每次真删前自动打包 `backup-before-cleanup-*.zip`，误删可恢复
4. 白名单永不删除：`src/`、`public/assets/art/{illustration,lnu-ip,editing}/`、`desktop/`、`dist/`、`node_modules/`、`.git/` 及所有配置文件

## 步骤
```
① .\cleanup-scan.ps1              ← 只读，生成 cleanup-candidates.txt
② Cursor 打开清单逐条 Review        ← 删掉有用的误报行
③ .\cleanup-do.ps1                 ← DryRun，只打印
④ .\cleanup-do.ps1 -Confirmed       ← 真删（先自动备份 zip）
⑤ npm run build                    ← 验证
```

## 已知会进清单的无用项（供参考）
- `public/assets/art/videos/`（未被 scanDir 扫描）
- `public/assets/art/paintings/`（旧散落插画，已被 illustration/ 取代）
- `public/assets/art/辽大IP/`（中文旧目录，已重命名 lnu-ip/）
- 各类 `.psd/.psb/.sketch/.fig` 设计源文件
- 根目录 `.log/.tmp/.bak/.cache/.DS_Store` 等
