# PROJECT_STATE.md · 项目进度快照

> 更新时间：2026-08-31 · 供接手者快速判断「现在到哪了、接下来干什么」。

---

## 1. 一句话状态

**Phase 1–6 已完成（代码已构建通过），当前处于「交接 Cursor 做精修与收尾」阶段。** 6 张任务卡（`tasks/`）不是从零重建，而是对已有代码的**精修**。

---

## 2. 技术栈（package.json 实际依赖）

| 依赖 | 版本 |
|---|---|
| astro | ^5.7.0 |
| three | ^0.170.0 |
| gsap | ^3.12.7 |
| phaser | ^4.2.1（⚠️ 代码为 Phaser 3 风格 API，待实测兼容） |
| tailwindcss | ^4.1.0 |
| @tailwindcss/vite | ^4.1.0 |
| typescript | ^5.7.0 |

脚本：`dev` / `build` / `preview`。

---

## 3. 各阶段进度

| 阶段 | 内容 | 状态 | 任务卡 |
|---|---|---|---|
| Phase 1 | 工位骨架（Astro + Three.js 3D + 物件导航） | ✅ 完成 | `PHASE1-2-工位骨架与开场.md` |
| Phase 2 | 开场剧本 + Hover 状态机（GSAP） | ✅ 完成 | 同上 |
| Phase 3 | 游戏化 About（Phaser 横版小人 + 展板） | ✅ 完成（⚠️ 版本兼容待测） | `PHASE3-controller-game.md` |
| Phase 4 | 拟物桌面 OS（原生 JS） | ✅ 完成 | `PHASE4-desktop-os.md` |
| Phase 5 | 获奖证书页 | ✅ 完成（奖学金已删，素材待补） | `PHASE5-awards.md` |
| Phase 6 | 全局精修 | ✅ 完成 | `PHASE6-polish.md` |
| Phase 7 | 内容填充 + 部署 | ⬜ 未开始 | `PHASE7-内容填充与部署.md` |

> git 记录：Phase 1 → 3 逐阶段提交；`9435d85` 为 Phase 1-6 完成的 baseline。

---

## 4. 目录约定（详见 03 §4）

- `docs/` —— 权威规范文档（01/02 正文不可改）。
- `tasks/` —— 6 张任务卡。
- `assets/` —— 源素材（`raw-materials/` 已被 gitignore；`references/` `images/` `videos/` `models/` 为待补占位）。
- `public/assets/{brand,projects,awards}/` —— 站点产物资源。
- `src/data/` —— 内容唯一来源（profile/projects/awards/objects/aboutGame）。
- `src/scripts/{desk.ts, game/, desktop/}` —— 三套交互代码，按需加载。

---

## 5. 已知坑 / 待补素材

- ⚠️ **Phaser 版本冲突**（最优先）：`phaser ^4.2.1` 但游戏代码全用 Phaser 3 API。构建通过 ≠ 运行时可用，需浏览器实测；不行就锁回 `phaser@^3.x`。
- ⚠️ **证书素材待补**：`src/data/awards.ts` 里多个 `file` 是占位，实际扫描件需放 `public/assets/awards/`。
- ⚠️ **头像/品牌图**：`public/assets/brand/head.png` 等需确认已就位。
- ⚠️ **数学建模证书**：全国大学生数学建模竞赛辽宁省一等奖 = 占位，用户将补证书。
- ⚠️ **首页无「作品」直达入口**：`/works` 只能从桌面 OS 进，是否补 3D 物件待定。
- ⚠️ **博客内容**：`/blog` 路由已建，内容待填（Phase 7）。

---

## 6. 交接规则

1. **只做精修，不重构**：已有架构（原生 Three + 原生 JS + Tailwind v4 + Phaser）经确认，别换栈。
2. **改内容走 `src/data/`**，改样式走 `global.css` 的 `@theme`，改交互走对应 `scripts/`。
3. **英文命名**，资源放 `public/assets/`，代码引用绝对路径 `/assets/...`。
4. **每完成一张卡**：跑 `npm run build` 验证 → `git status` 汇报 → 等人确认 commit。
5. **不确定标 `⚠️ 待确认`**，禁止编造与 TODO 空壳。
