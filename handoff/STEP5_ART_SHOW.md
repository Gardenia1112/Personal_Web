# Step 5 — ArtShow 四皮 + 全局灯箱 + 粉色球体背景

> 美术作品 Step 5 实施手册。Cursor 读此文件执行。
> 方案已与用户锁定，本文件 = 唯一事实源。先出分批计划，逐批确认后改代码。

---

## 0. 总览

| 部分 | 内容 |
|---|---|
| **Part A** | ArtShow 四套皮（绘画密胶片 / 设计静物 / 建模大静帧 / 剪辑宽条）+ 全局灯箱 |
| **Part B** | 粉色球体背景（canvas 2D，目录页 + 详情页）|

**决策锁定：**
- 性格来自**排版差异**，交互统一（点卡→灯箱）
- 灯箱 = 全局单实例 `<dialog>`（原生 `showModal` → Esc + 焦点陷阱 + 焦点回归），**只翻当前分类**
- 建模本期**只做 CSS 主/辅 + 统一灯箱**，不做"点小图换主卡"（留 Phase 7）
- 密网格列宽 **`minmax(400px, 1fr)`**（1920 约 4 列）
- `sub` **不渲染**（分类在顶栏 + 角标色）
- 入场动画**不动**

**真实字段（`src/data/art.ts`）：**
```ts
ArtPiece { label: string; kind: "image" | "video"; src?: string }  // src 全空
Artwork  { slug; name; category: "绘画"|"设计"|"建模"|"剪辑"; cover?; status; pieces: ArtPiece[] }
```
映射（**不编字段、不改 art.ts**）：
- `no` = `i+1` → `01`..`NN`
- `title` = `piece.label`（**是 `label`，非 `name`**）
- `sub` = 不渲染
- 图 = `piece.src`（空 → `.as-ph` 占位）
- `unit` = `pieces[0].kind === "video" ? "支" : "件"`

**分类色 token（CSS `[data-art-show]`，不进数据）：**
`illustration:#e07a5f` / `lnu-ip:#3d7a6e` / `modeling:#5c6bc0` / `editing:#b5834a`

---

## 1. 改动文件清单

| 文件 | 动作 |
|---|---|
| `src/scripts/desktop/pink-blobs.ts` | **新**：canvas 球体 + show/hide + reduced-motion + visibility |
| `src/components/ArtShow.astro` | 重写：`.as` 四皮壳 + `<dialog>` + `initLightbox()` |
| `src/components/ArtPieceCard.astro` | **新**：共用卡（一卡四皮）|
| `src/styles/art-show.css` | **新**：四套变体 + 占位卡 + 灯箱 + `.blob-bg` 层叠 |
| `src/styles/art-gallery.css` | + `.blob-bg` + `[data-art-gallery]{z-index:2}` |
| `src/scripts/desktop/folder-views.ts` | **仅两行**：`openFolder("art")`→`showBlobs()`，关层→`hideBlobs()` |

**不改：** `art.ts`、`thumbfull.ts`、`gallery.ts`、`lightbox.ts`（在 Part A 步骤 3 新建）、Nav、DevIndex、四套开发详情、`[slug].astro`（入场不动）、任何 `.md`。

---

## 2. 实施顺序（分批，每批停一下验）

```
批次 1 — Part B 球体（独立、可见、易验）
  1a. pink-blobs.ts
  1b. css 层叠 + show/hide 挂载（folder-views + ArtShow）
  1c. 验：目录页/详情页球体、层叠、显隐、reduced-motion
批次 2 — Part A 四皮静态
  2a. art-show.css 四皮
  2b. ArtPieceCard + ArtShow markup
  2c. 验：四条路由排版
批次 3 — Part A 灯箱
  3a. lightbox.ts + <dialog> + initLightbox
  3b. 验：占位翻页、Esc、backdrop、焦点回归、reduced-motion
批次 4 — 回归
  4a. Step 4 / 四套开发 / Nav / DevIndex / build
```

**每批：Cursor 出 diff → 用户确认 → 改 → build → 用户浏览器验 → 下一批。**

---

# Part A — ArtShow 四皮 + 灯箱

## A1. `src/components/ArtShow.astro`（重写）

```astro
---
import type { Artwork } from "../data/art";
import { artworks } from "../data/art";
import ArtPieceCard from "./ArtPieceCard.astro";
import "../styles/art-show.css";

interface Props { artwork: Artwork; }
const { artwork } = Astro.props;
const unit = artwork.pieces[0]?.kind === "video" ? "支" : "件";
const no = String(artworks.findIndex((a) => a.slug === artwork.slug) + 1).padStart(2, "0");
---
<section class="as" data-art-show={artwork.slug} data-art-slug={artwork.slug}>
  <header class="as-bar" data-thumbfull-copy>
    <p class="as-kicker"><b>{no}</b> {artwork.category} · {artwork.pieces.length}{unit}</p>
    <p class="as-hint">Scroll · Click to view</p>
  </header>
  <div class="as-grid">
    {artwork.pieces.map((p, i) => (
      <ArtPieceCard piece={p} cat={artwork.slug} index={i} />
    ))}
  </div>
</section>

<dialog id="art-lightbox" class="lb" aria-labelledby="lb-title">
  <button class="lb-close" type="button" aria-label="关闭">×</button>
  <button class="lb-prev" type="button" aria-label="上一张">‹</button>
  <figure class="lb-stage">
    <div class="lb-media"></div>
    <figcaption id="lb-title" class="lb-cap"></figcaption>
  </figure>
  <button class="lb-next" type="button" aria-label="下一张">›</button>
</dialog>

<script>
  import { initLightbox } from "../scripts/desktop/lightbox";
  initLightbox();
</script>
```

**关键点：**
- 顶栏带 `data-thumbfull-copy` **且** `data-art-slug`（双保险，兼容类选择器）
- `<dialog>` 放 section 内（每页一个实例，原生管理）

## A2. `src/components/ArtPieceCard.astro`（新）

```astro
---
import type { ArtPiece } from "../data/art";
interface Props { piece: ArtPiece; cat: string; index: number; }
const { piece, cat, index } = Astro.props;
const no = String(index + 1).padStart(2, "0");
---
<a class="as-card" href={`#p-${no}`} data-as-card data-cat={cat} data-index={index} data-no-transition>
  <div class="as-media">
    {piece.src ? (
      <img class="as-img" src={piece.src} alt="" />
    ) : (
      <div class="as-ph">
        <i class="as-ph-mark" aria-hidden="true"></i>
        <span class="as-ph-no">{no}</span>
        <span class="as-ph-title">{piece.label}</span>
      </div>
    )}
  </div>
</a>
```

- click 由 `lightbox.ts` 事件委托 `preventDefault`，不走 ThumbFull
- `src` 有值才出 `<img>`，不编路径

## A3. `src/styles/art-show.css`（新，仅 `[data-art-show]`）

```css
[data-art-show="illustration"] { --cat: #e07a5f; }
[data-art-show="lnu-ip"]      { --cat: #3d7a6e; }
[data-art-show="modeling"]    { --cat: #5c6bc0; }
[data-art-show="editing"]     { --cat: #b5834a; }

html[data-page="sheet"]:has([data-art-show]) body {
  background: #fff8f3;
}

.as {
  min-height: 100vh;
  padding: 88px clamp(20px, 4vw, 64px) 72px;
  color: #3b1f2b;
  position: relative;
  z-index: 2;            /* 高于 .blob-bg(1) */
}
.as-bar { /* 顶栏，对齐 Step4 信息密度 */ }
.as-card { position: relative; display: block; overflow: hidden; border-radius: 0; z-index: 3; }
.as-media { width: 100%; height: 100%; }
.as-ph {
  position: relative;
  aspect-ratio: 3/4;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 16px 18px;
  background: #fff6f0;
}
.as-ph-mark { position: absolute; top: 0; left: 0; width: 6px; height: 6px; background: var(--cat); }
.as-ph-no {
  font-size: clamp(40px, 6vw, 72px); font-weight: 800;
  color: color-mix(in srgb, var(--cat) 35%, #fff6f0);
}
.as-ph-title { font-size: clamp(14px, 1.4vw, 18px); }

/* ① 绘画 · 密胶片（~4 列）*/
[data-art-show="illustration"] .as-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

/* ② 设计 · 静物单列 */
[data-art-show="lnu-ip"] .as-grid { max-width: 720px; margin: 0 auto; display: grid; gap: 48px; }
[data-art-show="lnu-ip"] .as-ph { aspect-ratio: 4/3; flex-direction: row; align-items: center; gap: 24px; }
@media (max-width: 640px) { [data-art-show="lnu-ip"] .as-grid { max-width: none; } }

/* ③ 建模 · 大静帧（CSS 主/辅 + 统一灯箱，不写 JS 换主卡）*/
[data-art-show="modeling"] .as-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
[data-art-show="modeling"] .as-card:first-child { grid-column: 1 / -1; }
[data-art-show="modeling"] .as-card:first-child .as-ph { aspect-ratio: 16/9; }

/* ④ 剪辑 · 宽条时间线 */
[data-art-show="editing"] .as-grid { display: flex; flex-direction: column; gap: 12px; }
[data-art-show="editing"] .as-card { height: 120px; }
[data-art-show="editing"] .as-ph { aspect-ratio: auto; height: 100%; flex-direction: row; align-items: center; }

/* ===== 灯箱 ===== */
.lb { border: none; padding: 0; color: inherit; }
.lb::backdrop { background: rgba(40, 24, 28, 0.46); }
.lb[open] { animation: lb-fade .24s ease; }
.lb .lb-stage { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.lb .lb-media { width: min(80vw, 900px); aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
.lb .lb-ph {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  padding: 32px; background: #fff6f0; color: #3b1f2b;
}
.lb .lb-ph-no { font-size: clamp(56px, 10vw, 120px); font-weight: 800; color: color-mix(in srgb, var(--cat) 35%, #fff6f0); }
.lb .lb-cap { display: flex; gap: 12px; font-size: 18px; }
@keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .lb[open] { animation: none; }
  .lb-media img, .lb-ph { transform: none; }
}

/* ===== 球体背景层（Part B，内容之下）===== */
.blob-bg {
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  z-index: 1;              /* 奶油底(0)之上，内容(2)之下 */
  pointer-events: none;
  display: none;
}
```

## A4. `src/scripts/desktop/lightbox.ts`（新）

```ts
import { artworks, type ArtPiece } from "../../data/art";

const CAT_COLOR: Record<string, string> = {
  illustration: "#e07a5f",
  "lnu-ip": "#3d7a6e",
  modeling: "#5c6bc0",
  editing: "#b5834a",
};

export function initLightbox() {
  if (window.__lbInited) return;   // guard：防重复初始化
  window.__lbInited = true;

  const dialog = document.getElementById("art-lightbox") as HTMLDialogElement | null;
  if (!dialog) return;

  let currentCat = "", currentIdx = 0, pieces: ArtPiece[] = [], trigger: HTMLElement | null = null;

  function piecesOf(slug: string): ArtPiece[] {
    return artworks.find((a) => a.slug === slug)?.pieces ?? [];
  }
  function fmt(n: number) { return String(n).padStart(2, "0"); }

  function openLightbox(cat: string, index: number, el: HTMLElement) {
    currentCat = cat;
    pieces = piecesOf(cat);
    currentIdx = index;
    trigger = el;
    render();
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  function render() {
    const p = pieces[currentIdx];
    const stage = dialog!.querySelector(".lb-media");
    const cap = dialog!.querySelector(".lb-cap");
    if (!stage || !cap) return;
    stage.innerHTML = p.src
      ? `<img src="${p.src}" alt="">`
      : `<div class="lb-ph" style="--cat:${CAT_COLOR[currentCat] ?? "#999"}">
           <span class="lb-ph-no">${fmt(currentIdx + 1)}</span>
           <span class="lb-ph-title">${p.label}</span>
         </div>`;
    cap.innerHTML = `<span>${fmt(currentIdx + 1)}</span><span>${p.label}</span>`;
  }

  function next() { currentIdx = (currentIdx + 1) % pieces.length; render(); }
  function prev() { currentIdx = (currentIdx - 1 + pieces.length) % pieces.length; render(); }

  // 事件委托（document，卡片可动态）
  document.addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest("[data-as-card]") as HTMLElement | null;
    if (!card || !dialog) return;
    e.preventDefault();
    openLightbox(card.dataset.cat!, +card.dataset.index!, card);
  });
  dialog.querySelector(".lb-next")?.addEventListener("click", next);
  dialog.querySelector(".lb-prev")?.addEventListener("click", prev);
  dialog.querySelector(".lb-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
  dialog.addEventListener("close", () => { trigger?.focus(); });  // 焦点回归
}

declare global { interface Window { __lbInited?: boolean } }
```

**关键：**
- `guard` 防重复初始化（ArtShow 是路由组件，`<script>` 每次进页面执行）
- 事件委托 `document`（卡片动态安全）
- 只翻当前 `slug` 的 `pieces[]`（循环）
- 占位阶段翻占位序列可用；Phase 7 填 `src` 后自动出真图（结构不变）

## A5. `[slug].astro` 兼容（不改逻辑，仅确认）

- 保留 `data-art-slug` + `data-thumbfull-copy` → 入场 slide 不断
- `initArtShow` 若内部有 `if (!el.querySelector(".ag-set-track")) return;` 之类**早退**，须确认**入场相关逻辑仍执行**（软空转）。若破坏入场，改成"找不到轨道也继续初始化入场"。**入场动画用户已声明不需要改，但若 Part 2 做完发现 slide 断了，优先查此处。**

---

# Part B — 粉色球体背景

## B1. `src/scripts/desktop/pink-blobs.ts`（新）

```ts
interface BlobOpts {
  count?: number;        // 默认按视口面积（16–40）
  minR?: number;         // 默认 20
  maxR?: number;         // 默认 90
  alphaMin?: number;     // 默认 0.08
  alphaMax?: number;     // 默认 0.28
  speed?: number;        // 默认 0.15
}

interface Ball {
  x: number; y: number; r: number;
  vx: number; vy: number;
  alpha: number; phase: number; freq: number; color: string;
}

const PINKS = ["255,145,175", "241,156,187", "255,179,198", "255,214,224"];

let blobs: { stop(): void } | null = null;
let canvas: HTMLCanvasElement | null = null;
let raf = 0, running = true;

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

function ensureCanvas(): HTMLCanvasElement {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.className = "blob-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  return canvas;
}

export function showBlobs(opts: BlobOpts = {}) {
  const c = ensureCanvas();
  c.style.display = "block";
  if (!blobs) blobs = start(c, opts);
  running = true;
}

export function hideBlobs() {
  if (canvas) canvas.style.display = "none";
  running = false;
  if (raf) cancelAnimationFrame(raf);
}

function start(canvas: HTMLCanvasElement, opts: BlobOpts): { stop(): void } {
  const ctx = canvas.getContext("2d")!;
  let w = 0, h = 0, balls: Ball[] = [];

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    drawStatic(ctx, canvas, opts);
    return { stop() {} };
  }

  function resize() {
    w = canvas.width = canvas.clientWidth;
    h = canvas.height = canvas.clientHeight;
    const area = w * h;
    const count = opts.count ?? Math.round(Math.min(40, Math.max(16, area / 60000)));
    balls = Array.from({ length: count }, () => makeBall());
  }

  function makeBall(): Ball {
    const r = rand(opts.minR ?? 20, opts.maxR ?? 90);
    return {
      x: Math.random() * (w || 1),
      y: Math.random() * (h || 1),
      r,
      vx: (Math.random() - 0.5) * 2 * (opts.speed ?? 0.15),
      vy: (Math.random() - 0.5) * 2 * (opts.speed ?? 0.15),
      alpha: rand(opts.alphaMin ?? 0.08, opts.alphaMax ?? 0.28),
      phase: Math.random() * Math.PI * 2,
      freq: 0.0003 + Math.random() * 0.0007,
      color: PINKS[Math.floor(Math.random() * PINKS.length)],
    };
  }

  function step(t: number) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const drift = Math.sin(t * 0.0001) * 0.05;

    for (const b of balls) {
      b.x += b.vx + drift + Math.sin(t * b.freq + b.phase) * 0.08;
      b.y += b.vy + Math.cos(t * b.freq + b.phase) * 0.08;
      // 回绕（无缝，不反弹）
      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.1,
        b.x, b.y, b.r
      );
      grad.addColorStop(0, `rgba(255,255,255,${b.alpha * 0.9})`);
      grad.addColorStop(0.4, `rgba(${b.color},${b.alpha})`);
      grad.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  const onResize = () => { cancelAnimationFrame(raf); resize(); raf = requestAnimationFrame(step); };
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else { running = true; raf = requestAnimationFrame(step); }
  });

  resize();
  raf = requestAnimationFrame(step);

  return {
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    },
  };
}

function drawStatic(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, opts: BlobOpts) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  for (let i = 0; i < 12; i++) {
    const r = rand(opts.minR ?? 20, opts.maxR ?? 90);
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const alpha = rand(opts.alphaMin ?? 0.08, opts.alphaMax ?? 0.28);
    const color = PINKS[i % PINKS.length];
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
    grad.addColorStop(0.4, `rgba(${color},${alpha})`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}
```

## B2. 挂载点（show/hide 接现有生命周期）

**目录页（黄文件夹）：** `folder-views.ts`
- `openFolder("art")` 成功 → `showBlobs()`
- 关层（**Esc + 回箭头，两处都要**）→ `hideBlobs()`
- **推荐**：在统一的 `closeFolder()` 出口调一次，避免分散遗漏

**详情页（`/art/*`）：** `ArtShow.astro` 的 `<script>`
```ts
import { showBlobs, hideBlobs } from "./pink-blobs";
showBlobs();
window.addEventListener("beforeunload", hideBlobs);
```
（路由组件卸载时 `hideBlobs`，避免球体漂到其它页）

**单 canvas 全局复用**：`ensureCanvas()` 只创建一个，`show/hide` 只切 `display`。

## B3. CSS 层叠（已在 A3 `.blob-bg` 给出）

**自下而上：**
`body 奶油底(0)` → `.blob-bg 球体(1)` → `[data-art-gallery]/[data-art-show] 内容(2)` → 花粉罩(2) → 卡片/物件(3)

**验：** 球体在卡片/文字之下，占位卡、贴纸、编号清晰可读。

---

# 验收清单（做完跑，共 15 条）

## 球体（Part B，6 条）
- [ ] 目录页（黄文件夹打开）：粉色球体缓慢到处移动（自然，不死板）
- [ ] 详情页（`/art/*`）：同样球体背景
- [ ] 球体 = 径向渐变半透明气泡（有体积感，非实心平圆）
- [ ] 数量/大小随机、极慢、边界**回绕**无缝（看不到撞墙反弹）
- [ ] **球体在卡片/文字之下**：占位卡、贴纸、编号清晰可读
- [ ] **关黄文件夹 → 球体消失**（不漂在桌面上）；切非美术页 → 消失
- [ ] `prefers-reduced-motion`：停止动画（静态渐变球体）
- [ ] 后台标签页：暂停 rAF；resize：重分布不闪

## Step 5（Part A，9 条）
- [ ] `/art/illustration`：密网格 ~4 列（400px），26 件
- [ ] `/art/lnu-ip`：单列疏居中（max-width 720px），5 件；窄屏满宽
- [ ] `/art/modeling`：首张满宽 16/9 主 + 小格，4 件；点都进灯箱
- [ ] `/art/editing`：宽条横排（height 120px），3 支，无时长
- [ ] 占位 = 编号 + `label` + 角标色（`sub` 不渲染）
- [ ] 点卡 → 灯箱淡入，显示大号占位（no + label）
- [ ] 灯箱内：← → / 箭头翻**本类**下一张（循环）；Esc 关；backdrop 点击关；关闭后**焦点回归**触发卡
- [ ] guard 防重复初始化；顶栏双保险属性；入场 slide 不断
- [ ] Step 4（黄文件夹物件/花粉/视差/ThumbFull/统一尺寸）/ 四套开发详情 / Nav / DevIndex 不受影响
- [ ] `npm run build` 通过

---

# 风险与待定

1. **`initArtShow` 软空转**：若 `[slug].astro` 的 `initArtShow` 因找不到 `.ag-set-track` 早退，可能破坏入场 slide。**Part 2 做完先验"进 `/art/*` 有没有入场动画"**，断了查此处。
2. **`folder-views` 关层路径全覆盖**：Esc 与回箭头两处都要 `hideBlobs()`，建议放统一 `closeFolder` 出口。
3. **`guard` 重复初始化**：已加 `window.__lbInited`，若仍有"点一次开两次"，确认 `<script>` 是否被 Astro 打包成多次执行。
4. **建模主/辅**：本期仅 CSS，不做 JS 换主卡（Phase 7）。

---

# 给 Cursor 的执行指令（用户发这一句即可）

> 读 `handoff/STEP5_ART_SHOW.md` 并按它执行 Step 5（Part A 四皮 + 灯箱 + Part B 粉色球体）。
> 先只出「改动文件清单 + 分批 diff 计划」，我确认后再分批改代码，**每批停一下验**。
> 顺序：**批次 1 球体 → 批次 2 四皮静态 → 批次 3 灯箱 → 批次 4 回归**。
> 严格按文件里的字段映射（`piece.label`、`kind`、`src`）、分类色 token、z-index 层叠、guard、双保险属性。
> 不改：`art.ts`、thumbfull、gallery、Nav、DevIndex、四套开发详情、`[slug].astro` 入场。
> 每批改完跑 `npm run build`，把 diff + 截图/录屏 + build 结果给我核对。不要 commit。
