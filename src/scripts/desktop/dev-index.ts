// 桌面红文件夹：开发案例条键盘高亮，确认键走全站渐黑
import { navigateWithTransition } from "../transition";

export function initDevIndex(root: HTMLElement) {
  const rows = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-wx-row]"));
  if (rows.length === 0) return;

  let index = 0;
  let armed = false;

  function live() {
    const layer = root.closest<HTMLElement>("[data-folder-layer]");
    const view = root.closest<HTMLElement>("[data-folder-view]");
    return Boolean(layer && !layer.hidden && view && !view.hidden);
  }

  function paint() {
    rows.forEach((row, i) => row.classList.toggle("is-hot", armed && i === index));
    if (armed) rows[index]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function move(delta: number) {
    if (!armed) {
      armed = true;
      index = delta < 0 ? rows.length - 1 : 0;
    } else {
      index = (index + delta + rows.length) % rows.length;
    }
    paint();
  }

  function go() {
    const href = rows[armed ? index : 0]?.getAttribute("href");
    if (!href) return;
    navigateWithTransition(href);
  }

  window.addEventListener("keydown", (e) => {
    if (!live()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go();
    }
  });

  rows.forEach((row, i) => {
    row.addEventListener("mouseenter", () => {
      armed = true;
      index = i;
      paint();
    });
  });
}
