// Codrops MagneticButtons 风格：.magnetic-btn 吸住 + elastic 回弹（全局单例）
import { gsap } from "gsap";

declare global {
  interface Window {
    __magneticInited?: boolean;
  }
}

const BOUND = "data-magnetic-bound";

function canMagnetize() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function bindMagnetic(el: HTMLElement) {
  if (el.getAttribute(BOUND) === "1") return;
  el.setAttribute(BOUND, "1");

  const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "elastic.out(1, 0.3)" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "elastic.out(1, 0.3)" });

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const dy = (e.clientY - rect.top - rect.height / 2) * 0.3;
    xTo(dx);
    yTo(dy);
  });

  el.addEventListener("mouseleave", () => {
    xTo(0);
    yTo(0);
  });
}

function bindAll(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>(".magnetic-btn").forEach(bindMagnetic);
}

/** 幂等：全站只跑一次；MutationObserver 自动绑定后加的 .magnetic-btn */
export function initMagneticButtons() {
  if (typeof window === "undefined") return;
  if (window.__magneticInited) return;
  window.__magneticInited = true;

  if (!canMagnetize()) return;

  bindAll(document);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.classList.contains("magnetic-btn")) bindMagnetic(node);
        bindAll(node);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
