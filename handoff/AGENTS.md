# AGENTS.md · Cursor 开机说明书（交接包 handoff/）

> 你接手的是**个人作品集网站 `lszbf.com`** 的精修与收尾工作。开工前花 3 分钟读完本文件，能少踩 80% 的坑。
> 本目录 `handoff/` 是**只读交接包**：规范、快照、6 张任务卡都在这里；真正要改的代码在**仓库根目录** `src/`、`public/`。

---

## 1. 交接包结构

```
handoff/
├── AGENTS.md            ← 本文件（开机说明书）
├── PROJECT_STATE.md     ← 进度快照（先读这个）
├── references/          ← 参考素材（⚠️ 只能你手动放：awwwards/codrops/recordings）
└── tasks/               ← 6 张任务卡（Phase 1-7 折叠成 6 张）
    ├── PHASE1-2-工位骨架与开场.md
    ├── PHASE3-游戏化介绍.md
    ├── PHASE4-桌面OS.md
    ├── PHASE5-细节物件.md
    ├── PHASE6-彩蛋与优化.md
    └── PHASE7-内容填充与部署.md
```

> 权威规范文档在仓库根 `docs/`（01/02/03，正文勿改）。要改设计，回根 `docs/` 改。
> `references/` 里的参考图/录屏只能你手动放。

---

## 2. 必读顺序（按此顺序，别跳）

1. `PROJECT_STATE.md` —— 现在到哪了、待补什么。
2. `docs/01-内容结构文档.md` —— 网站有哪些页面、每页写什么（正文不可改）。
3. `docs/02-视觉交互设计系统.md` —— 长什么样、物件映射、开场剧本、状态机（正文不可改）。
4. `docs/03-技术架构文档.md` —— 代码怎么跑、每一层在哪、数据字段、已知坑。
5. `handoff/tasks/` 里你负责的那张卡 —— 本次要精修的那一张。

---

## 3. 项目定位与世界观

- **主人**：赵韵婷，21 岁，游戏客户端开发方向。网站是她的「深夜工位」——一个 2.5D 等距 3D 桌面，桌上每件物品都能点。
- **风格**：开发向为主、轻艺术向为辅；深夜工位、台灯暖光、赛博点缀色。
- **配色 token**：`#1a1d24`（桌面）· `#0f1115`（深底）· `#00d9ff`（青）· `#a855f7`（紫）· `#ffb974`（暖橙）。集中在 `src/styles/global.css` 的 `@theme`。
- **交互灵魂**：桌面物件三态 `IDLE → HOVER → ACTIVE`，GSAP 统一驱动；进站先放「开场剧本」，二次访问跳过。

---

## 4. 技术栈（对齐 03 §1，别被旧文档误导）

Astro 5 + 原生 Three.js + 原生 JS + GSAP + Tailwind v4 + Phaser ^4.2.1（⚠️ 代码是 Phaser 3 风格 API，见 03 §9）+ TypeScript。
**不用** React / R3F / SCSS / typed.js。

---

## 5. 绝对规则（违反 = 返工）

1. **不改 01/02 正文**：两份是设计定稿，只能在别处引用；要改设计先问人。
2. **英文命名**：代码文件/资源路径一律英文 slug，禁用中文名；说明文件用 `.md` 后缀、空格用连字符 `-`、禁 `&` `/` `'` 等特殊字符。
3. **内容唯一来源是 `src/data/*.ts`**：改文字/项目/证书，改数据文件，不要硬编码进 `.astro` 组件。
4. **图片走 `public/assets/`**：站点图片放 `public/assets/{brand,projects,awards}/`，代码引用绝对路径 `/assets/...`。
5. **禁止 TODO 空壳**：文档和代码不留 `<!-- TODO -->` / `待填` 空占位；写不下就写「⚠️ 待确认」，但要有上下文。
6. **不确定就标 `⚠️ 待确认`**：别编造（技术栈、证书编号、时间线等拿不准的一律标注）。
7. **不要自动 commit / push**：精修阶段只改文件、跑 `git status` 汇报，提交由人确认。

---

## 6. 模型分工（重要）

- **默认（Claude Opus High / 主模型）**：做规划、跨文件重构、写文档、判断「该不该做」。Phase 3/4 用最强。
- **Fast（快速模型）**：只在人明确指定时，做单一文件的机械改动（改一个字、调一个颜色、批量重命名）。
- **除非人说「用 Fast」，否则一律用 High。** 精修阶段动作要小、要准，别大改架构。

---

## 7. 参考素材怎么喂（`handoff/references/`）

- `awwwards/` —— 网页整体参考（美术风格 / 排版 / 光标等，`.md` 说明可配图）。
- `codrops/` —— 动效参考（Codrops/Codepen 链接 + `.md` 说明「复刻哪部分」）。
- `recordings/` —— 动效录屏（5-10s，每个配同名 `.md` 说明）。
- **命名规则**：说明文件用 `.md` 后缀、英文命名、空格用连字符 `-`、禁 `&` `/` `'` 等特殊字符。

---

## 8. 交互规范速查

- **状态机**：`IDLE / HOVER / ACTIVE`，见 `src/scripts/desk.ts`，GSAP timeline 统一驱动。
- **开场剧本**：①-⑧ 步，`localStorage["lszbf:intro:played"]` 控制只播一次。
- **主题切换**：台灯物件 ↔ `localStorage["lszbf:theme"]`。
- **移动端降级**：`matchMedia("(pointer: coarse)")` 或 `clientWidth < 768` → 静态 DOM 菜单，不加载 3D。

---

## 9. 上手第一件事（检查清单）

- [ ] 读完 PROJECT_STATE → 01 → 02 → 03。
- [ ] `npm install` + `npm run dev`，本地起服务确认能跑。
- [ ] 打开 `/` `/about` `/desktop` `/works` `/awards` `/contact` 各扫一眼，对现状有体感。
- [ ] 找到你负责的那张任务卡，读「入场状态」，按「执行步骤」动手。
- [ ] 改完跑 `npm run build` 验证无报错，再 `git status` 汇报（不 commit）。
