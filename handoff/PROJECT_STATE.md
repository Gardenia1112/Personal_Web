# PROJECT_STATE.md · 项目进度快照（交接包 handoff/）

> 更新时间：2026-09-03 · 供 Cursor 接手者快速判断「现在到哪了、接下来干什么」。

---

## 1. 一句话状态

**Phase 1–6 已完成、构建通过，当前处于「参考素材规范化 + 交接 Cursor」阶段，未做 Phase 7。**

- 已完成：Phase 1–6（工位骨架、开场剧本、游戏化 About、桌面 OS、细节物件、彩蛋优化）。
- 本次已处理：参考素材英文命名 + 归并到 `handoff/references/`（唯一权威，awwwards/codrops/recordings 三目录）。
- 未做：Phase 7（内容填充 + 部署）。

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

## 3. 各阶段进度（对齐手册 §四 → 折叠为 6 张卡）

| 阶段 | 内容 | 状态 | 主工具 | 任务卡 |
|---|---|---|---|---|
| Phase 1-2 | 工位骨架 + 开场剧本 + 状态机 | ✅ | Claude→Cursor | `handoff/tasks/PHASE1-2-工位骨架与开场.md` |
| Phase 3 | 游戏化介绍（Phaser 横版小人 + 4 展板） | ✅（⚠️ 版本兼容待测） | Cursor | `handoff/tasks/PHASE3-游戏化介绍.md` |
| Phase 4 | 桌面 OS（窗口 + 拖拽，原生 JS） | ✅ | Cursor | `handoff/tasks/PHASE4-桌面OS.md` |
| Phase 5 | 细节物件（键盘技能矩阵 + 证书墙 + 本子 Links + 台灯主题） | ✅（证书墙完成，其余精修） | Cursor | `handoff/tasks/PHASE5-细节物件.md` |
| Phase 6 | 彩蛋 + 优化（咖啡/耳机/贴纸 + 移动端降级 + 性能） | ✅ | Cursor | `handoff/tasks/PHASE6-彩蛋与优化.md` |
| Phase 7 | 内容填充 + 部署（Cloudflare Pages + 域名） | ⬜ 未开始 | Claude（部署）+ Cursor（填数据） | `handoff/tasks/PHASE7-内容填充与部署.md` |

> git 记录：Phase 1 → 3 逐阶段提交；最近两条为「baseline: Claude Code Phase 1-8 complete」+ 本次「chore: baseline before restructure」（作者 Gardenia1112）。

---

## 4. 目录约定（详见 03 §4）

- `docs/` —— 权威规范文档（01/02/03 正文，01/02 不可改）。
- `handoff/` —— 本交接包（AGENTS / PROJECT_STATE / tasks / references / 设计说明）。
- `handoff/references/` —— 参考素材（唯一权威，awwwards/codrops/recordings 三目录，用户手动放）。
- `handoff/设计说明/` —— 用户自己的整站交互设计说明（`整体效果思路.md`）。
- `handoff/tasks/` —— 6 张任务卡（唯一权威）。
- `assets/` —— 源素材（`raw-materials/` 已 gitignore；`images/videos/models/` 待补占位）。
- `public/assets/{brand,projects,awards}/` —— 站点产物资源。
- `src/data/` —— 内容唯一来源（profile/projects/awards/objects/aboutGame）。
- `src/scripts/{desk.ts, game/, desktop/}` —— 三套交互代码，按需加载。

---

## 5. 已知坑 / 待补素材

- ✅ 已解决：参考素材中文命名已清理、references 已归并到 `handoff/references/`（唯一权威）。
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
