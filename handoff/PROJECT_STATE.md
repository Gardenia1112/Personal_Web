# PROJECT_STATE.md · 项目进度快照（交接包 handoff/）

> 更新时间：2026-09-01 · 供 Cursor 接手者快速判断「现在到哪了、接下来干什么」。

---

## 1. 一句话状态

**Phase 1–8 骨架（代码结构）已完成、构建通过，当前处于「交接 Cursor 做 3D/动效微调 + 内容填充 + 部署」阶段。**

- 骨架：Phase 1–8 的页面/路由/脚本/数据层都已就位（折叠为 6 张任务卡）。
- 精修：Phase 3–6 的细节与动效归 Cursor；Phase 1-2 若需调优也归 Cursor。
- 未做：Phase 7（内容填充）、Phase 8（部署）。

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

## 3. 各阶段进度（对齐手册 §四 / 02 §10 → 折叠为 6 张卡）

| 阶段 | 内容 | 骨架 | 主工具 | 任务卡 |
|---|---|---|---|---|
| Phase 1-2 | 工位骨架 + 开场剧本 + 状态机 | ✅ | Claude→Cursor | `tasks/PHASE1-2-工位骨架与开场.md` |
| Phase 3 | 游戏化介绍（Phaser 横版小人 + 4 展板） | ✅（⚠️ 版本兼容待测） | Cursor | `tasks/PHASE3-游戏化介绍.md` |
| Phase 4 | 桌面 OS（窗口 + 拖拽，原生 JS） | ✅ | Cursor | `tasks/PHASE4-桌面OS.md` |
| Phase 5 | 细节物件（键盘技能矩阵 + 证书墙 + 本子 Links + 台灯主题） | ✅（证书墙完成，其余精修） | Cursor | `tasks/PHASE5-细节物件.md` |
| Phase 6 | 彩蛋 + 优化（咖啡/耳机/贴纸 + 移动端降级 + 性能） | ✅（骨架） | Cursor | `tasks/PHASE6-彩蛋与优化.md` |
| Phase 7-8 | 内容填充 + 部署（Cloudflare Pages + 域名） | ⬜ 骨架就绪 | Claude（部署）+ Cursor（填数据） | `tasks/PHASE7-内容填充与部署.md` |

> git 记录：Phase 1 → 3 逐阶段提交；最新一条为「baseline: Claude Code Phase 1-8 complete」（作者 Gardenia1112）。

---

## 4. 目录约定（详见 03 §4）

- `docs/` —— 权威规范文档（01/02 正文不可改）。
- `handoff/` —— 本交接包（AGENTS / PROJECT_STATE / tasks / docs / references）。
- `handoff/docs/` —— 规范文档只读副本（含 `完整交接手册.md`）。
- `handoff/references/` —— 参考素材（pinterest/codrops/reactbits/recordings，用户手动放）。
- `tasks/` —— 6 张任务卡（与 `handoff/tasks/` 一致）。
- `assets/` —— 源素材（`raw-materials/` 已 gitignore）。
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

## 6. 交接规则（手册 §六 防覆盖）

1. **只做精修，不重构**：已有架构（原生 Three + 原生 JS + Tailwind v4 + Phaser）经确认，别换栈。
2. **Claude Code 与 Cursor 不同时开同一项目**；切换工具前先 `git commit`。
3. **改内容走 `src/data/`**，改样式走 `global.css` 的 `@theme`，改交互走对应 `scripts/`。
4. **英文命名**，资源放 `public/assets/`，代码引用绝对路径 `/assets/...`。
5. **每完成一张卡**：跑 `npm run build` 验证 → `git status` 汇报 → 等人确认 commit。
6. **不确定标 `⚠️ 待确认`**，禁止编造与 TODO 空壳。
