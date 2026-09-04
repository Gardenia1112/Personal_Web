# PROJECT_STATE.md · 项目进度快照（交接包 handoff/）

> 更新时间：2026-09-04 · 供 Cursor 接手者快速判断「现在到哪了、接下来干什么」。

---

## 1. 一句话状态

**Phase 1–6 骨架已完成、构建通过；手册 §6（横向视差画廊）、§3（Phase 1-2 精修）、§4（`/desktop` 改选择台）已落地，未做 Phase 7。**

- 已完成：Phase 1–6 骨架（工位、开场剧本、游戏化 About、桌面页、细节物件、彩蛋）。
- 已落地手册 §6（提交 `77f4e83`）：`/works` `/awards` 改横向视差画廊（D10）+ 全站渐黑转场（D5/D6）。
- 已落地手册 §3（Phase 1-2 精修，**未提交**）：首页接入 `room_full.glb` 实模、鼠标视角摇晃、昼夜双光照管线、hover 状态机改 GSAP 驱动；另加热点圆点当导航菜单（只给会跳路由的 4 件；台灯/咖啡不列，靠 hover 发光）、背景排版大字（画布透明、大字在房间之后做前后空间感）、提前落地手册 §7.1 的自定义光标，并删掉性能 HUD、跟随鼠标的重叠标签、投影在显示器上的「姓名 · 职位」。
- 第三轮（2026-09-04，**未提交**）：图标从扁平色块改成 **CSS 3D 分层实体**——透视 + `preserve-3d`，文件夹按用户给的参考图做成三层（深色后板带标签页 / 中间扇形散开的竖幅白边作品纸 / 亮色敞口前袋加袋口亮边），脚下各有一片模糊投影；鼠标在图标上会带着物件小幅转动。摊开时文件夹里的缩略图淡出、关闭再淡回。不引 Three.js（重库只进首页），细节与两条压平 3D 的坑记在 docs/03 §6。
- 第四轮（2026-09-04，**未提交**）：Logo 改成粉白渐变圆角方片 + 铺满的白色 Z；**简历入口从 `/desktop` 整枚撤掉**，改到 `/about` 左上角做「下载简历」（`profile.resume`），`/contact` 同步读同一字段。选择台现为三个图标。
- 已落地 §4，但**换了方案**（2026-09-04 用户决策，**未提交**）：`/desktop` 不再是拟物桌面 OS。现状是：页面上只有三个图标（红/黄文件夹、粉白 Z Logo）+ 左上角一个无字返回箭头；悬停时名字浮在鼠标边上跟着晃；**红/黄文件夹悬停扇出**作品卡片（触屏改为点按），Logo 直接换页进 `/blog`。窗口系统 / 双击开窗 / 图标位置持久化 / 桌面贴纸 / 右上角路由菜单五项连同 `.os-*` 样式一起删除。
- 开场剧本播放策略已改（2026-09-04，**未提交**）：标记从 `localStorage` 换成 `sessionStorage["lszbf:intro:played"]`，即「每个会话播一次」——同标签页刷新/跳页回来跳过，关掉标签页再进重播；`/?intro` 强制重播。
- 未做：手册 §5（About 核对）、§7 的昼夜全局化（光标已提前做完）、§8/§9（Phase 7 内容与部署）。

---

## 2. 技术栈（package.json 实际依赖）

| 依赖 | 版本 | 位置 |
|---|---|---|
| astro | ^5.7.0 | dependencies |
| three | ^0.170.0 | dependencies |
| three-stdlib | ^2.36.1 | dependencies（`GLTFLoader`） |
| gsap | ^3.15.0 | dependencies |
| phaser | ^3.90.0 | dependencies |
| @types/gsap | ^1.20.2 | dependencies |
| tailwindcss | ^4.1.0 | devDependencies |
| @tailwindcss/vite | ^4.1.0 | devDependencies |
| typescript | ^5.7.0 | devDependencies |
| vite | ^8.2.2 | devDependencies |
| @types/three | ^0.185.4 | devDependencies |

脚本：`dev` / `build` / `preview`（`astro` 透传）。

> 📌 更正（2026-09-03）：本表旧版写 `phaser ^4.2.1` / `gsap ^3.12.7`，与 `package.json` 不符。实际是 **Phaser 3.90.0**（与代码的 Phaser 3 风格 API 一致）、**GSAP 3.15.0**。docs/03 §1 已同步更正。

---

## 3. 各阶段进度（对齐手册 §四 → 折叠为 6 张卡）

| 阶段 | 内容 | 状态 | 主工具 | 任务卡 |
|---|---|---|---|---|
| Phase 1-2 | 工位骨架 + 开场剧本 + 状态机 | ✅ 精修已做（实模 + 视角摇晃 + 昼夜 + GSAP 状态机，待人工验收） | Claude→Cursor | `handoff/tasks/PHASE1-2-工位骨架与开场.md` |
| Phase 3 | 游戏化介绍（Phaser 横版小人 + 4 展板） | ✅ | Cursor | `handoff/tasks/PHASE3-游戏化介绍.md` |
| Phase 4 | `/desktop` 四入口选择台（原生 JS + GSAP + View Transition） | ✅ 精修已做，**换方案**：任务卡里的窗口系统与图标持久化按用户决策作废，待人工验收 | Cursor | `handoff/tasks/PHASE4-桌面OS.md`（部分作废，实现以 docs/03 §3 为准） |
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
- `assets/` —— 源素材（美术素材已提供：`images/` 绘画·设计、`models/` 建模、`videos/` 剪辑；`raw-materials/` 已 gitignore）。
- `public/assets/{brand,projects,awards}/` —— 站点产物资源（`awards/` 含数模省一，全部证书已齐）。
- `src/data/` —— 内容唯一来源（profile/projects/awards/art/objects/aboutGame）。
- `src/scripts/{desk.ts, game/, desktop/}` —— 三套交互代码，按需加载。
- `src/styles/` —— `global.css`（全站 + `@theme` token）、`cursor.css`（自定义光标）、`desktop.css`（只给 `/desktop` 选择台，须在 global 之后引）。

---

## 5. 已知坑 / 待补素材

- ✅ 已解决：参考素材中文命名已清理、references 已归并到 `handoff/references/`（唯一权威）。
- ✅ 已解决：Phaser 4 运行时已确认（用户实测 /about 正常），代码零改动，无需锁版本。
- 🗑 已删除：奖学金类别按用户决策整体删除（`awards.ts` 已移除，证书墙不展示）。
- ✅ 已补全：数模省一证书已就位（`2024-math-modeling-liaoning-1st.jpg`），`awards.ts` 全部 `file` 已齐。
- ✅ 已补全：头像 `public/assets/brand/head.png`、favicon `public/favicon.ico` 已就位。
- ✅ 已提供：美术素材（绘画/设计/建模/剪辑）源文件已在 `assets/{images,models,videos}/`，发布缩略图待 Phase 7。
- ⚠️ **`/works` 横向画廊没有入口了**：选择台去掉 CTA 后，红文件夹里的封面直接进 `/works/[slug]`，画廊页只剩二级页 Nav 能进；首页 3D 工位也没有直达作品的物件（模型里没有多余的 `obj_*`，要补得先回 Blender）。待决定：选择台补个无字入口，还是就让画廊只作为 Nav 目标。
- ⚠️ **博客内容**：`/blog` 路由已建，内容待填（Phase 7）。
- ⚠️ **`room_full.glb` 未入库**（`.gitignore` 规则 `public/models/*.glb`）：本地正常，但 Cloudflare Pages 上取不到模型，首页会降级成静态导航。上线前必须决定「放开 gitignore 让 13MB 入库」或「托到 R2/CDN 改 `MODEL_URL`」。详见 docs/03 §9。
- ⚠️ **首页 4 物件已下线**：显示器 / 键盘 / 耳机 / 贴纸在模型中无 `obj_*` 节点，按 2026-09-03 决策整体下线。
- ⚠️ **「键盘 → 技能矩阵」彻底没入口**：原计划挂 `/desktop` 右上角 Skills 菜单，选择台已取消那排菜单。`.skills-*` 样式还留在 `global.css`，要么另找位置接线，要么连样式删掉。
- 🗑 **Resume 路由 D16 作废**：不建 `/resume` 页。简历入口已从 `/desktop` 撤掉，改到 `/about` 左上角下载 + `/contact` 同链，路径只写在 `profile.resume`。
- ⚠️ **美术缩略图缺失**：`art.ts` 四类都没 `cover`，选择台黄文件夹摊开的是色块 + 分类字占位。源图在 `assets/images/`（2-32MB、中文名、已 gitignore），Phase 7 压缩 + 改英文 slug 落到 `public/assets/art/` 后回填。
- ⚠️ **存量类型错误 7 个**（`npx tsc --noEmit`）：`astro.config.mjs` 的 Vite 双版本 Plugin 类型冲突 1 个、`gallery.ts` 6 个（闭包内 null 收窄）。原 `desktop.ts` 那 2 个随重写消失。不影响 `npm run build`（esbuild 不做类型检查），归画廊后续处理。
- 🗑 **两张贴纸 PNG 是孤儿资源**：`public/assets/desktop/{sticker-fighting.png, sticker-hearts.png}` 代码里没引用——黄文件夹的爱心贴纸是内联 SVG（`EntryArt.astro` 的 `dt-sticker-hearts`），「FIGHTING」是两段纯文字（`dt-sticker-fight`）。仅 `welcome-balloon.png` 被 `desktop.astro` 用上。可留作后续素材，或清理。

---

## 6. 交接规则（手册 §六 防覆盖）

1. **只做精修，不重构**：已有架构（原生 Three + 原生 JS + Tailwind v4 + Phaser）经确认，别换栈。
2. **Claude Code 与 Cursor 不同时开同一项目**；切换工具前先 `git commit`。
3. **改内容走 `src/data/`**，改样式走 `global.css` 的 `@theme`，改交互走对应 `scripts/`。
4. **英文命名**，资源放 `public/assets/`，代码引用绝对路径 `/assets/...`。
5. **每完成一张卡**：跑 `npm run build` 验证 → `git status` 汇报 → 等人确认 commit。
6. **不确定标 `⚠️ 待确认`**，禁止编造与 TODO 空壳。
