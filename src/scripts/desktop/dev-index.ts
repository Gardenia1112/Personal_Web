// 桌面红文件夹：键盘高亮；滚轮时用坐标找行，避免 hover 丢；点击走 ThumbFull
import { bindThumbFullLinks, expandThenGo } from "../thumbfull";

export function initDevIndex(root: HTMLElement) {
  const rows = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-wx-row]"));
  if (rows.length === 0) return;

  let index = 0;
  let armed = false;
  let pointerX = 0;
  let pointerY = 0;

  function live() {
    const layer = root.closest<HTMLElement>("[data-folder-layer]");
    const view = root.closest<HTMLElement>("[data-folder-view]");
    return Boolean(layer && !layer.hidden && view && !view.hidden);
  }

  function paint(opts: { scroll?: boolean } = {}) {
    rows.forEach((row, i) => row.classList.toggle("is-hot", armed && i === index));
    if (opts.scroll && armed) rows[index]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function move(delta: number) {
    if (!armed) {
      armed = true;
      index = delta < 0 ? rows.length - 1 : 0;
    } else {
      index = (index + delta + rows.length) % rows.length;
    }
    paint({ scroll: true });
  }

  function go(row = rows[armed ? index : 0]) {
    if (!row) return;
    expandThenGo(row);
  }

  function hotFromPoint(x: number, y: number) {
    if (!live()) return;
    const hit = document.elementFromPoint(x, y)?.closest<HTMLAnchorElement>("[data-wx-row]");
    if (!hit) return;
    const i = rows.indexOf(hit);
    if (i < 0 || (armed && i === index)) return;
    armed = true;
    index = i;
    paint();
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

  window.addEventListener(
    "pointermove",
    (e) => {
      if (!live() || e.pointerType === "touch") return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      hotFromPoint(pointerX, pointerY);
    },
    { passive: true }
  );

  const scroller = root.closest<HTMLElement>("[data-folder-layer]") ?? root;
  function onScrollTrack() {
    if (!live()) return;
    hotFromPoint(pointerX, pointerY);
    requestAnimationFrame(() => hotFromPoint(pointerX, pointerY));
  }
  scroller.addEventListener("wheel", onScrollTrack, { passive: true });
  scroller.addEventListener("scroll", onScrollTrack, { passive: true });

  bindThumbFullLinks(root);
}
