// 横向视差画廊（决策 D10）—— /works 与 /awards 共用
// 参考：codrops「Creating a smooth horizontal parallax gallery, from DOM to WebGL」（方案 A：纯 DOM 视差）
// ⚠️ 滚动本体走原生 lerp + rAF，GSAP 只负责入场与切 tab 的过渡（手册 §6 硬约束）
import { gsap } from "gsap";

/** 画廊分组 tab；key 为分组键（"all" = 不过滤），param 为写进 ?category= 的取值 */
export interface GalleryTab {
  key: string;
  label: string;
  param?: string;
}

/** 画廊条目。内容由调用页从 src/data/*.ts 组装，组件与脚本都不含写死文案 */
export interface GalleryItem {
  id: string;
  title: string;
  group: string;
  meta?: string; // 副标题（角色 · 时间 / 获奖等级）
  tag?: string; // 角标（量化成果 / 分类）
  cover?: string; // 封面图，缺图时走文字版占位
  href?: string; // 整卡跳转（→ 详情页）
  preview?: string; // 点击放大（证书图片）
  download?: string; // 点击下载（PDF / Office 证书）
  actionLabel?: string; // download 卡片上的提示文案
  optional?: boolean; // 默认隐藏，由画廊上的开关显示（如校级 / 院级奖项）
}

const EASE = 0.08; // lerp 系数，过大会抖（见手册附录 B）
const PARALLAX = 10; // 图片自身宽度的百分比；图片 125% 宽 + left:-12.5%，10% 刚好吃满预留量
const WHEEL_SCALE = 1.1;
const KEY_STEP = 420;

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

export function initGallery(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>(".gallery__viewport");
  const track = root.querySelector<HTMLElement>(".gallery__track");
  if (!viewport || !track) return;

  const progress = root.querySelector<HTMLElement>(".gallery__progress i");
  const tabsBar = root.querySelector<HTMLElement>(".gallery__tabs");
  const optionalToggle = root.querySelector<HTMLInputElement>("[data-gallery-toggle]");
  const allItems = Array.from(track.querySelectorAll<HTMLElement>(".gallery__item"));

  let target = 0;
  let current = 0;
  let max = 0;
  let group = "all";
  let visible = allItems;

  function measure() {
    max = Math.max(0, track.scrollWidth - viewport.clientWidth);
    target = clamp(target, 0, max);
    current = clamp(current, 0, max);
    root.classList.toggle("is-static", max === 0);
  }

  // 图片在容器内反向位移：离视口中心越远，位移越大（视差）
  function applyParallax() {
    const mid = viewport.clientWidth / 2;
    const vpLeft = viewport.getBoundingClientRect().left;
    for (const item of visible) {
      const img = item.querySelector<HTMLElement>(".gallery__img");
      if (!img) continue;
      const rect = item.getBoundingClientRect();
      const delta = (rect.left - vpLeft + rect.width / 2 - mid) / viewport.clientWidth;
      img.style.transform = `translate3d(${clamp(delta, -1, 1) * -PARALLAX}%, 0, 0)`;
    }
  }

  function frame() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.05) current = target;
    track.style.transform = `translate3d(${-current}px, 0, 0)`;
    if (progress) progress.style.transform = `scaleX(${max === 0 ? 1 : current / max})`;
    applyParallax();
    requestAnimationFrame(frame);
  }

  // ── 输入：滚轮 / 拖拽（含触屏）/ 方向键 ──
  viewport.addEventListener(
    "wheel",
    (e) => {
      if (max === 0) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      target = clamp(target + delta * WHEEL_SCALE, 0, max);
      e.preventDefault();
    },
    { passive: false }
  );

  const DRAG_SLOP = 6; // 超过这个位移算拖拽，不算点击
  let dragId: number | null = null;
  let dragStartX = 0;
  let dragStartTarget = 0;
  let dragged = false;

  viewport.addEventListener("pointerdown", (e) => {
    if (max === 0 || dragId !== null) return;
    dragId = e.pointerId;
    dragStartX = e.clientX;
    dragStartTarget = target;
    dragged = false;
    root.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", (e) => {
    if (dragId !== e.pointerId) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > DRAG_SLOP) {
      dragged = true;
      viewport.setPointerCapture(dragId);
    }
    target = clamp(dragStartTarget - dx, 0, max);
  });
  const endDrag = (e: PointerEvent) => {
    if (dragId !== e.pointerId) return;
    if (viewport.hasPointerCapture(dragId)) viewport.releasePointerCapture(dragId);
    dragId = null;
    root.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  // 拖完松手别顺手触发卡片跳转
  viewport.addEventListener(
    "click",
    (e) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  viewport.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    target = clamp(target + (e.key === "ArrowRight" ? KEY_STEP : -KEY_STEP), 0, max);
    e.preventDefault();
  });

  window.addEventListener("resize", measure);

  // ── 分组 tab（仅 /works 传入；GSAP 负责重排过渡）──
  function applyFilter(animate: boolean) {
    const showOptional = optionalToggle?.checked ?? false;
    visible = allItems.filter(
      (el) =>
        (group === "all" || el.dataset.group === group) && (showOptional || el.dataset.optional !== "1")
    );
    const shown = new Set(visible);
    for (const el of allItems) el.hidden = !shown.has(el);
    target = 0;
    current = 0;
    measure();
    if (animate) {
      gsap.fromTo(
        visible,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", clearProps: "opacity,transform" }
      );
    }
    const empty = root.querySelector<HTMLElement>(".gallery__empty");
    if (empty) empty.hidden = visible.length > 0;
  }

  if (tabsBar) {
    tabsBar.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(".gallery__tab");
      if (!btn || btn.classList.contains("is-active")) return;
      tabsBar.querySelectorAll(".gallery__tab").forEach((t) => t.classList.remove("is-active"));
      btn.classList.add("is-active");
      group = btn.dataset.group ?? "all";
      applyFilter(true);
      // ⚠️ 静态站构建期没有 query，分类一律客户端读写（手册硬约束）
      const url = new URL(location.href);
      const param = btn.dataset.param;
      if (param) url.searchParams.set("category", param);
      else url.searchParams.delete("category");
      history.replaceState(null, "", url);
    });
  }

  // 初始分组：客户端读 location.search（禁用 Astro.url.searchParams）
  const initialParam = new URLSearchParams(location.search).get("category");
  const initialBtn = initialParam
    ? tabsBar?.querySelector<HTMLElement>(`.gallery__tab[data-param="${CSS.escape(initialParam)}"]`)
    : null;
  if (initialBtn && tabsBar) {
    tabsBar.querySelectorAll(".gallery__tab").forEach((t) => t.classList.remove("is-active"));
    initialBtn.classList.add("is-active");
  }
  const startBtn = initialBtn ?? tabsBar?.querySelector<HTMLElement>(".gallery__tab.is-active");
  group = startBtn?.dataset.group ?? "all";
  optionalToggle?.addEventListener("change", () => applyFilter(true));
  applyFilter(false);

  // 入场：GSAP（滚动本体仍是 lerp）
  gsap.fromTo(
    visible,
    { opacity: 0, y: 36 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.07,
      ease: "power3.out",
      clearProps: "opacity,transform",
      delay: 0.1,
    }
  );

  requestAnimationFrame(frame);
}
