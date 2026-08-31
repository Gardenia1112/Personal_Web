# PHASE 3：游戏化介绍界面（手柄 → /about）

> 阶段标签：Phase 3（游戏化 About）

---

## 目标

点击首页手柄进入 `/about`，一个横版 2D 场景里像素小人可用键盘（A/D、←/→）与鼠标操控，走到 4 个展板前停下，触发右侧文字面板逐条播放介绍。展示横版角色控制、输入系统、状态机。

---

## 对应文档

- `../docs/01-内容结构文档.md` §3（关于我：基本信息/自述/教育/技能）
- `../docs/02-视觉交互设计系统.md` §1（色彩/像素描边）、§3.1（游戏化设计定稿）
- `../docs/03-技术架构文档.md` §3（`/about` 路由）、§5.5（aboutGame.ts 字段）、§9（Phaser 版本冲突已知坑）

---

## 入场状态

✅ **已完成**。git `b1df868`（Phase 3：Phaser 3 横版小人 + 4 展板）。

- 代码：`src/pages/about.astro` + `src/scripts/game/{game,input,player,board}.ts`
- 数据：`src/data/aboutGame.ts`（`GameBoardData` 4 块展板 + WORLD_WIDTH 等常量）
- 本卡是**精修**，最优先是 Phaser 版本兼容实测。

---

## 执行步骤（精修项）

1. **Phaser 版本兼容实测（最高优先级）**：package.json 是 `phaser ^4.2.1`，但 `game.ts` 全用 Phaser 3 风格 API（`import Phaser from "phaser"`、`new Phaser.Game`、`Phaser.Scale.RESIZE`）。构建通过 ≠ 运行时可用，需浏览器打开 `/about` 实测小人能否渲染/移动。**若报错 → 锁回 `phaser@^3.x`（代码零改动）**。
2. **三输入手感**：A/D、←/→、鼠标三通道并存且不打架，鼠标跟随用 `pointer.worldX` + 插值避免抖动。
3. **展板触发与面板**：走到展板 `TRIGGER_RANGE=170` 内停下亮起，`renderPanel` 正确灌入 `title/tagline/lines`，移开淡出。
4. **数据核对**：4 块展板（who/journey/core/education）文字与 `../docs/01` §3、`profile.ts` 一致。
5. **ESC 返回**：确认 `keydown-ESC` 跳回 `/`。
6. **体积**：确认 Phaser 只进 `/about` chunk，不污染其他页（`astro build` 后查分包）。

---

## 验收标准

- [ ] 首页点手柄进 `/about`，Phaser 场景正常加载（**含 Phaser 4 下的运行时实测**）。
- [ ] A/D、←/→、鼠标三输入均可操控小人移动。
- [ ] 走到 4 块展板前停下，面板内容正确（数据来自 `aboutGame.ts` / `profile.ts`）。
- [ ] ESC 返回工位。
- [ ] `npm run build` 通过，Phaser 未泄漏进其他页面分包。

---

## 风险与提醒

- ⚠️ **Phaser 4 vs 3 API 兼容**是本卡最大风险，实测不过就锁版本，别硬改游戏代码去适配 Phaser 4。
- 状态机（IDLE/WALK/STOP_AT_BOARD）避免边走边播；面板更新走 `renderPanel` 的统一入口，别在别处拼 HTML。
- 像素小人可用 Kenney.nl 免费素材或代码绘制占位（先跑通再换图）。

---

## 完成后 commit 信息

```
Phase 3 精修：游戏化 About 兼容性实测与输入手感
```
