# About Me 页面大改 — Claude 执行提示词

> **用法**：把本文档整体发给 Claude，并将「附录 A：动效参考」替换为你本地 `G:\PersonalWeb\handoff\references\` 的实际内容即可。
> **目标**：一次性产出可运行的完整实现（Astro + 原生 TS，**不引入** GSAP / Framer Motion 等第三方动画库）。

---

## 一、任务总纲

把 `src/pages/about.astro` 及其引用的 `src/data/aboutGame.ts`、`src/data/profile.ts` 改造成一个**全屏滑动（Full-page Snap）叙事页面**。

### 必须满足的硬约束

1. **三端一致**：手机（<640px）、平板（640–1024px）、电脑（>1024px）**使用同一套布局与交互**，仅通过断点调整间距、字号、单屏内容密度。**不做**「桌面横排、移动竖排」的两套结构。
2. **竖直整屏 Snap**：每一屏 = 一个叙事章节（展板）。滚动/滑动时整屏吸附（Snap），节奏等同 PPT 翻页。
3. **进度条导航**：页面一侧（桌面/平板靠右，手机靠底部或顶部）常驻一条**线性进度条**，实时反映当前所处屏数与总屏数。这是**唯一**的导航 UI；不加分页圆点、不加额外按钮。
4. **技术栈锁定**：Astro + 原生 TypeScript + CSS（scroll-snap / IntersectionObserver / Web Animations API 任选）。**禁止** `npm install` 新增动画库。
5. **响应式断点**：`640px`、`1024px`。进度条位置、字号、屏内留白在此三档间平滑过渡。
6. **文案不动**：本次**只改布局与动效**，文案沿用现有字段（`profile.ts`、`aboutGame.ts`）。Claude **不得**改写、精简或新增任何正文文字——若布局导致文字溢出，用排版手段（间距、字号、滚动）解决，不改字。

### 验收标准（完成后逐条自测）

- [ ] 桌面端滚轮、触控板、触控屏均能整屏 Snap，无半屏悬停。
- [ ] 手机竖屏单手上下滑，每滑一次恰好一屏。
- [ ] 平板（含分屏状态下）与桌面行为一致，进度条位置正确。
- [ ] 进度条填充比例 = （当前屏索引）/（总屏数 - 1），切换时平滑过渡。
- [ ] 键盘 `↑` `↓` `PageUp` `PageDown` `Home` `End` 可导航。
- [ ] 缩放回退到 400% 仍不破版（内容可纵向滚动兜底）。
- [ ] 无 `layout shift`、无水平滚动条（`overflow-x: hidden` 兜底）。
- [ ] Lighthouse 无障碍：可聚焦、有 `aria-label`、进度条用 `role="progressbar"`。
- [ ] **零新增依赖**：`package.json` 无变化。

---

## 二、内容结构（4 屏）

沿用现有 4 个展板，**保留关卡命名**（这是本站辨识度，不要丢）：

| 屏 | 章节名 | 内容来源字段 | 视觉基调 |
|---|---|---|---|
| 1 | START · 一切从那个方块世界开始 | `aboutGame.ts` 展板 1 | 暗色 / 像素 / 起点感 |
| 2 | TURNING POINT · 一颗种子 | 展板 2 | 过渡 / 觉醒 |
| 3 | NOW · 现在的我 | 展板 3 + `profile.ts`（技能、证据数字） | 最重 / 数据亮出 |
| 4 | NEXT LEVEL · 向未来全速前进 | 展板 4（subtitle、scrollTexts） | 收尾 / CTA |

**屏 3（NOW）是核心**，把 `profile.ts` 的技能四组 + 关键数字（营收、软著、帧率）做成**数据卡片网格**，与展板正文并排。

---

## 三、交互与动效规格

### 3.1 滑动机制

- 使用 CSS `scroll-snap-type: y mandatory` + 每屏 `scroll-snap-align: start`。
- 容器设 `height: 100dvh`（**用 `dvh` 而非 `vh`**，规避移动端地址栏伸缩）；`overflow-y: scroll`。
- 每屏 `min-height: 100dvh`，内容居中，超出时可屏内局部滚动（该屏 `overflow-y: auto`）。
- 用 `IntersectionObserver` 监听各屏，进入视口 ≥50% 时置为「当前屏」。

### 3.2 进度条

- 形态：**细线 + 填充段**（填充段可用 `transform: scaleY / scaleX` 做过渡，性能优于改 `height`/`width`）。
- 位置：
  - 桌面/平板：右侧居中，竖直方向（`scaleY`）。
  - 手机：顶部或底部，水平方向（`scaleX`）。
  - 通过断点切换 `flex-direction` / 锚点，**不要**用两套 DOM。
- 点击/触按进度条某位置 → 跳转对应屏（`scrollTo({ behavior: 'smooth' })`）。
- `aria`：`role="progressbar"`、`aria-valuenow`、`aria-valuemin="0"`、`aria-valuemax="总屏数-1"`。

### 3.3 屏切换动效（进入视口时触发，只播一次）

- **入场**：内容块 `opacity 0 → 1` + 轻微位移（`translateY(24px) → 0`），`cubic-bezier(0.22, 1, 0.36, 1)`，时长 **600–800ms**。
- **数字滚动**：屏 3 的关键数字（营收、软著数、帧率、百分比）用 `requestAnimationFrame` 从 0 缓动到目标值，**仅在首次进入视口时触发一次**。
- **章节标题**：关卡命名文字可做字符级错位淡入（纯 CSS `@keyframes`，无需库）。
- **约束**：所有动效尊重 `prefers-reduced-motion`——该媒体查询命中时，仅保留即时显示、关闭位移与数字滚动。
- **性能**：优先 `transform` / `opacity`；不使用 `scroll` 事件做驱动（用 IO），`passive: true`。

### 3.4 主题衔接

- 保持现有「深夜工位 / 像素 / 游戏」视觉语言（配色、字体、光标风格）。
- 进度条样式沿用现有强调色；若现站有 CSS 变量（如 `--accent`），直接引用，**不要**硬编码新色值。

---

## 四、架构与文件组织

按以下结构产出，保持与现有 Astro 项目一致：

```
src/
├── pages/about.astro              # 重写：组装 <Section> + <ProgressBar>
├── components/about/
│   ├── Section.astro              # 单屏容器：slot + 入场观察逻辑
│   ├── ProgressBar.astro          # 进度条（含点击跳转）
│   └── NowStats.astro             # 屏3 数据卡片网格（读 profile.ts skills）
├── data/
│   ├── profile.ts                 # 不动字段，仅读取
│   └── aboutGame.ts               # 不动字段，仅读取
└── styles/about.css               # 新增：scroll-snap、断点、动效 keyframes
```

- 数据**继续走现有的 TS 文件**，组件用 `import` 读取，不要改成硬编码字符串。
- 动效逻辑放在 `Section.astro` 内联 `<script>` 或 `about.ts`，**不**污染全局。

---

## 五、执行步骤（按顺序）

1. **先读现有代码**：`src/pages/about.astro`、`src/data/profile.ts`、`src/data/aboutGame.ts`，以及 `src/styles/` 下相关样式。完整理解当前字段结构与视觉变量后再动手。
2. **读附录 A 的参考文件**，提取其中的动效意图（时长、缓动、触发方式、层级关系），**映射**到第 3 节的规格中——参考文件是「效果标准」，第 3 节是「实现约束」，二者冲突时**优先**第 3 节（硬约束）。
3. 创建 `components/about/` 三个组件 + `styles/about.css`。
4. 重写 `about.astro`：渲染 4 个 `<Section>`，屏 3 内嵌 `<NowStats>`，页级挂载 `<ProgressBar>`。
5. 实现 Snap + IO 观察 + 进度条联动 + 键盘导航。
6. 跑断点：在 360 / 768 / 1024 / 1440 四个宽度逐屏检查；进度条位置在 1024 处切换方向。
7. 按「验收标准」逐条自检，全部通过后交付。

---

## 六、边界与禁忌（明确不要做的事）

- ❌ 不要做横向滑动（本次统一竖直 Snap）。
- ❌ 不要加拖拽、不要加 3D 翻转、不要做视差长滚动——保持干净的整屏吸附。
- ❌ 不要给每屏堆多个动画；入场动效**单一**、克制。
- ❌ 不要改动任何文案字段，不要「优化措辞」。
- ❌ 不要新增 `package.json` 依赖。
- ❌ 不要破坏现有「桌面 / 获奖 / 联系我」等其他页面的导航。
- ❌ 不要在 `about.astro` 里写大段 `<script>`；逻辑封装进组件。
- ❌ 不要使用 `100vh`（移动端地址栏问题），一律 `100dvh` 并给 `100vh` 兜底。

---

## 附录 A：动效参考文件地址：G:\PersonalWeb\handoff\references

### 参考文件速览（Claude 读取后填写）

读完附录 A 后，在此用 3–5 行归纳**真正要迁移的动效要点**，例如：
- 时长基准：___ms
- 缓动函数：___
- 触发方式（滚动驱动 / 时间轴 / 交互触发）：___
- 层级/视差关系：___
- 与本提示词第 3 节的冲突点及取舍：___

---

## 附录 B：决策记录（供 Claude 参考，勿改动代码）

以下为本次设计定稿，Claude 无需再询问确认：

| 项目 | 决策 |
|---|---|
| 滑动形态 | 竖直整屏 Snap |
| 响应式 | 一套布局自适应（640 / 1024 断点） |
| 导航 UI | 仅线性进度条（无圆点、无额外按钮） |
| 内容结构 | 保留 4 展板 + 关卡命名；屏 3 加数据卡片网格 |
| 动效库 | 无（原生 TS + CSS） |
| 文案 | 沿用现有字段，本次不改 |
| 交付 | 一次性完整实现 |
| 主题 | 保持「深夜工位 / 像素 / 游戏」视觉语言 |

