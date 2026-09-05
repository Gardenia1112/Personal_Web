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
  shape?: "landscape" | "portrait" | "tile";
  tone?: string; // 无封面时的色板键，由调用页从分类映射
}

const EASE = 0.085;
const PARALLAX = 16; // 图片 140% 宽 + left:-20%，约 ±16% 刚好吃满预留量
const WHEEL_SCALE = 1.15;

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initGallery(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>(".gallery__viewport");
  const track = root.querySelector<HTMLElement>(".gallery__track");
  if (!viewport || !track) return;

  const progress = root.querySelector<HTMLElement>(".gallery__progress i");
  const tabsBar = root.querySelector<HTMLElement>(".gallery__tabs");
  const optionalToggle = root.querySelector<HTMLInputElement>("[data-gallery-toggle]");
  const allItems = Array.from(track.querySelectorAll<HTMLElement>(".gallery__item"));
  const ease = reducedMotion() ? 1 : EASE;

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
    root.querySelectorAll<HTMLButtonElement>(".gallery__nav").forEach((btn) => {
      btn.disabled = max === 0;
    });
  }

  function renumber() {
    visible.forEach((el, i) => {
      const num = String(i + 1).padStart(2, "0");
      const slot = el.querySelector(".gallery__num");
      if (slot) slot.textContent = num;
    });
  }

  function applyParallax() {
    if (reducedMotion()) return;
    const mid = viewport.clientWidth / 2;
    const vpLeft = viewport.getBoundingClientRect().left;
    for (const item of visible) {
      const layer = item.querySelector<HTMLElement>(".gallery__img, .gallery__paper");
      if (!layer) continue;
      // 证书要看全文，不做大位移裁切
      if (item.classList.contains("gallery__item--portrait")) continue;
      const rect = item.getBoundingClientRect();
      const delta = (rect.left - vpLeft + rect.width / 2 - mid) / viewport.clientWidth;
      layer.style.transform = `translate3d(${clamp(delta, -1, 1) * -PARALLAX}%, 0, 0)`;
    }
  }

  function frame() {
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.05) current = target;
    track.style.transform = `translate3d(${-current}px, 0, 0)`;
    if (progress) progress.style.transform = `scaleX(${max === 0 ? 1 : current / max})`;
    applyParallax();
    requestAnimationFrame(frame);
  }

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

  const DRAG_SLOP = 6;
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

  function step(dir: number) {
    const first = visible[0];
    const width = first ? first.getBoundingClientRect().width + 32 : 480;
    target = clamp(target + dir * width, 0, max);
  }

  viewport.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    step(e.key === "ArrowRight" ? 1 : -1);
    e.preventDefault();
  });

  root.querySelectorAll<HTMLButtonElement>(".gallery__nav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.dataset.dir);
      if (!Number.isFinite(dir) || dir === 0) return;
      step(dir);
    });
  });

  window.addEventListener("resize", measure);

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
    renumber();
    if (animate && !reducedMotion()) {
      gsap.fromTo(
        visible,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.55, stagger: 0.05, ease: "power2.out", clearProps: "opacity,transform" }
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
      const url = new URL(location.href);
      const param = btn.dataset.param;
      if (param) url.searchParams.set("category", param);
      else url.searchParams.delete("category");
      history.replaceState(null, "", url);
    });
  }

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

  if (!reducedMotion()) {
    gsap.fromTo(
      visible,
      { opacity: 0, x: 56 },
      {
        opacity: 1,
        x: 0,
        duration: 0.75,
        stagger: 0.07,
        ease: "power3.out",
        clearProps: "opacity,transform",
        delay: 0.08,
      }
    );
  }

  const images = Array.from(track.querySelectorAll("img"));
  void Promise.all(
    images.map(
      (img) =>
        img.complete ||
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  ).then(measure);

  requestAnimationFrame(frame);
}
