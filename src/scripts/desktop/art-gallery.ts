// 黄文件夹：四类卡片横拖；点卡胀开后进 /art/[slug] 展示页（不在文件夹里再套一层）
import { expandThenGo } from "../thumbfull";

const EASE = 0.08;
const PARALLAX = 10;
const WHEEL_SCALE = 1.15;
const DRAG_SLOP = 6;

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Strip = {
  viewport: HTMLElement;
  track: HTMLElement;
  layers: HTMLElement[];
  target: number;
  current: number;
  max: number;
};

function makeStrip(viewport: HTMLElement, track: HTMLElement, layers: HTMLElement[]): Strip {
  return { viewport, track, layers, target: 0, current: 0, max: 0 };
}

function measureStrip(s: Strip) {
  s.max = Math.max(0, s.track.scrollWidth - s.viewport.clientWidth);
  s.target = clamp(s.target, 0, s.max);
  s.current = clamp(s.current, 0, s.max);
}

function bindStrip(s: Strip, live: () => boolean, opts?: { parallax?: boolean }) {
  const ease = reducedMotion() ? 1 : EASE;
  const useParallax = Boolean(opts?.parallax) && !reducedMotion();

  function applyParallax() {
    if (!useParallax) return;
    const mid = s.viewport.clientWidth / 2;
    const vpLeft = s.viewport.getBoundingClientRect().left;
    for (const layer of s.layers) {
      const item = layer.closest<HTMLElement>(".ag-item, .ag-piece") ?? layer;
      const rect = item.getBoundingClientRect();
      const delta = (rect.left - vpLeft + rect.width / 2 - mid) / s.viewport.clientWidth;
      layer.style.transform = `translate3d(${clamp(delta, -1, 1) * -PARALLAX}%, 0, 0)`;
    }
  }

  function tick() {
    s.current += (s.target - s.current) * ease;
    if (Math.abs(s.target - s.current) < 0.05) s.current = s.target;
    s.track.style.transform = `translate3d(${-s.current}px, 0, 0)`;
    applyParallax();
  }

  s.viewport.addEventListener(
    "wheel",
    (e) => {
      if (!live() || s.max === 0) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      s.target = clamp(s.target + delta * WHEEL_SCALE, 0, s.max);
      e.preventDefault();
    },
    { passive: false }
  );

  let dragId: number | null = null;
  let dragStartX = 0;
  let dragStartTarget = 0;
  let dragged = false;

  s.viewport.addEventListener("pointerdown", (e) => {
    if (!live() || dragId !== null) return;
    if ((e.target as HTMLElement).closest("video, button, input")) return;
    dragId = e.pointerId;
    dragStartX = e.clientX;
    dragStartTarget = s.target;
    dragged = false;
    s.viewport.classList.add("is-dragging");
  });

  s.viewport.addEventListener("pointermove", (e) => {
    if (dragId !== e.pointerId) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > DRAG_SLOP) {
      dragged = true;
      s.viewport.setPointerCapture(dragId);
    }
    s.target = clamp(dragStartTarget - dx, 0, s.max);
  });

  const endDrag = (e: PointerEvent) => {
    if (dragId !== e.pointerId) return;
    if (s.viewport.hasPointerCapture(dragId)) s.viewport.releasePointerCapture(dragId);
    dragId = null;
    s.viewport.classList.remove("is-dragging");
    window.setTimeout(() => {
      dragged = false;
    }, 0);
  };
  s.viewport.addEventListener("pointerup", endDrag);
  s.viewport.addEventListener("pointercancel", endDrag);

  return {
    tick,
    measure: () => measureStrip(s),
    step(dir: number) {
      const first = s.track.firstElementChild as HTMLElement | null;
      const width = first ? first.getBoundingClientRect().width + 24 : 560;
      s.target = clamp(s.target + dir * width, 0, s.max);
    },
    wasDrag: () => dragged,
  };
}

function folderLive(root: HTMLElement) {
  const layer = root.closest<HTMLElement>("[data-folder-layer]");
  const view = root.closest<HTMLElement>("[data-folder-view]");
  return Boolean(layer && !layer.hidden && view && !view.hidden);
}

export function initArtGallery(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>(".ag-viewport");
  const track = root.querySelector<HTMLElement>(".ag-track");
  if (!viewport || !track) return;

  // 移动端（<640px）：画廊改单列竖排，禁用横拖与胀开，整卡走原生 <a> 跳转（任务 ①）
  if (window.matchMedia("(max-width: 639px)").matches) return;

  const cards = Array.from(track.querySelectorAll<HTMLAnchorElement>("[data-ag-item]"));
  const cardLayers = cards
    .map((el) => el.querySelector<HTMLElement>(".ag-photo > *"))
    .filter((el): el is HTMLElement => Boolean(el));

  const live = () => folderLive(root);
  const strip = bindStrip(makeStrip(viewport, track, cardLayers), live, { parallax: true });

  viewport.addEventListener(
    "click",
    (e) => {
      if (!live()) return;
      const row = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("[data-ag-item]");
      if (!row) return;
      e.preventDefault();
      e.stopPropagation();
      if (strip.wasDrag()) return;
      expandThenGo(row);
    },
    true
  );

  window.addEventListener("keydown", (e) => {
    if (!live()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      strip.step(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  let wasLive = false;
  function frame() {
    const on = live();
    if (on && !wasLive) strip.measure();
    wasLive = on;
    if (on) strip.tick();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    if (live()) strip.measure();
  });

  strip.measure();
  requestAnimationFrame(frame);
}

export function initArtShow(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>("[data-ag-set-view]");
  const track = root.querySelector<HTMLElement>(".ag-set-track");
  if (!viewport || !track) return;

  const layers = Array.from(track.querySelectorAll<HTMLElement>("img, .ag-piece-ph"));
  const video = Boolean(root.querySelector("video"));
  const strip = bindStrip(makeStrip(viewport, track, layers), () => true, { parallax: !video });

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      strip.step(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  window.addEventListener("resize", () => strip.measure());
  strip.measure();

  function frame() {
    strip.tick();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
