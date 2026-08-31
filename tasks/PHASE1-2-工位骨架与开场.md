# PHASE 1-2：工位骨架 + 开场剧本

> 阶段标签：Phase 1（工位骨架）· Phase 2（开场剧本 + 悬停状态机）

---

## 目标

首页 `/` 呈现一个 2.5D 等距「深夜工位」3D 场景：桌面上 6 个一级物件可点击导航，进站先播一段「开场剧本」，物件 hover 时有统一的 `IDLE → HOVER → ACTIVE` 状态机动效。

---

## 对应文档

- `docs/01-内容结构文档.md` §2（路由与首页导航结构）
- `docs/02-视觉交互设计系统.md` —— 深夜工位 3D、物件→路由映射、开场剧本 ①-⑧、状态机 IDLE/HOVER/ACTIVE（**正文勿改**）
- `docs/03-技术架构文档.md` §3（路由表 + objects.ts 物件映射）、§6（状态机/开场剧本/移动端降级规范）

---

## 入场状态

✅ **已完成**。git 记录：`61b2c10`（Phase 1 骨架）→ `a3f7570`（按 geometry 区分占位几何体 + 台灯暖光）→ `752bbce`（Phase 2 开场剧本 + 状态机）。

- 代码：`src/components/Desk3D/Scene.astro` + `src/scripts/desk.ts`
- 数据：`src/data/objects.ts`（`p0Objects` 6 件 / `p1Objects` 咖啡 / `p2Objects` 键盘耳机贴纸）
- 本卡是**精修**，不是重建。

---

## 执行步骤（精修项）

1. **核对物件→路由映射**：确认 `objects.ts` 里 monitor→`/`、gamepad→`/about`、desktop→`/desktop`、folder→`/awards`、notebook→`/contact`、lamp→主题切换，与实际跳转一致。
2. **状态机手感**：检查 GSAP timeline 驱动下 IDLE→HOVER→ACTIVE 的缓动时长/幅度，hover 渐入、click 激活、移出回落是否顺滑。
3. **开场剧本时序**：核对 ①-⑧ 步顺序与 `localStorage["lszbf:intro:played"]` 判定，确认二次访问确实跳过。
4. **台灯暖光**：确认 lamp 物件带暖光氛围（Phase 1 精修点），切换主题生效。
5. **移动端降级**：验证 `matchMedia("(pointer: coarse)")` / `clientWidth < 768` 时降级为静态 DOM 菜单，不加载 3D、不白屏。
6. **占位几何体**：确认 6 物件按各自 `geometry`（box/monitor/gamepad/lamp/folder/notebook 等）区分形状，而非清一色立方体。

---

## 验收标准

- [ ] `npm run build` 无报错。
- [ ] 首页 3D 工位渲染正常，6 个一级物件可点击并跳转正确路由。
- [ ] 开场剧本首次播放、二次访问跳过。
- [ ] hover 状态机三态切换顺滑，无卡顿/抖动。
- [ ] 移动端降级为静态菜单，无 3D 加载、无白屏。
- [ ] 台灯暖光 + 主题切换（`lszbf:theme`）生效。

---

## 风险与提醒

- **移动端降级**是最容易漏测的一环：真机 + DevTools 两种都要过。
- 开场剧本若改动时序，必须同步 `localStorage` key 名（`lszbf:intro:played`），否则老访客会重复播放或永久跳过。
- 3D 场景别引入新重库，保持原生 Three.js。
- 物件几何体改动会影响「占位 → 实模」的后续替换，记录当前 `geometry` 取值（见 `objects.ts`）。

---

## 完成后 commit 信息

```
Phase 1-2 精修：工位骨架 + 开场剧本 + 悬停状态机
```
