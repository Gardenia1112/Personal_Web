// 自定义光标（决策 D12 / 手册 §7.1，参考 handoff/references/awwwards/heron-ai.md）
// 白色光点 + lerp 拖尾；粗指针或 prefers-reduced-motion 时直接不启用，退回系统光标（混合式的「兜底」那一半）
const TRAIL = 12; // 拖尾节点数
const LEAD_EASE = 0.4; // 光点跟手速度
const TRAIL_EASE = 0.28; // 拖尾节点追前一个节点的速度
const HOT_SELECTOR = 'a, button, [role="button"], input, select, textarea, label, [data-cursor="hot"]';

interface Point {
  x: number;
  y: number;
}

export function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.getElementById("cursor");
  const dot = root?.querySelector<HTMLElement>(".cursor-dot");
  if (!root || !dot) return;

  // 拖尾节点由脚本生成：越靠后越小越淡
  const trail: { el: HTMLElement; p: Point }[] = [];
  for (let i = 0; i < TRAIL; i++) {
    const el = document.createElement("i");
    el.className = "cursor-trail";
    const k = 1 - i / TRAIL;
    el.style.setProperty("--s", `${0.72 * k + 0.12}`);
    el.style.setProperty("--o", `${0.5 * k * k}`);
    root.appendChild(el);
    trail.push({ el, p: { x: 0, y: 0 } });
  }

  document.documentElement.classList.add("has-custom-cursor");

  const target: Point = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const lead: Point = { ...target };
  for (const t of trail) t.p = { ...target };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      root.classList.add("is-visible");
      root.classList.toggle("is-hot", !!(e.target as HTMLElement | null)?.closest?.(HOT_SELECTOR));
    },
    { passive: true }
  );

  // 指针离开窗口 / 切走标签页时别把光点留在原地
  document.addEventListener("mouseleave", () => root.classList.remove("is-visible"));
  window.addEventListener("blur", () => root.classList.remove("is-visible"));
  window.addEventListener("pointerdown", () => root.classList.add("is-press"));
  window.addEventListener("pointerup", () => root.classList.remove("is-press"));

  function frame() {
    requestAnimationFrame(frame);
    lead.x += (target.x - lead.x) * LEAD_EASE;
    lead.y += (target.y - lead.y) * LEAD_EASE;
    dot!.style.transform = `translate3d(${lead.x}px, ${lead.y}px, 0) translate(-50%, -50%)`;

    let prev = lead;
    for (const t of trail) {
      t.p.x += (prev.x - t.p.x) * TRAIL_EASE;
      t.p.y += (prev.y - t.p.y) * TRAIL_EASE;
      t.el.style.transform = `translate3d(${t.p.x}px, ${t.p.y}px, 0) translate(-50%, -50%) scale(var(--s))`;
      prev = t.p;
    }
  }
  requestAnimationFrame(frame);
}
