// About 全屏 Snap 页交互：当前屏检测（IO ≥50%）、进度条联动 + 点击跳转、键盘导航、入场 .is-in。
export function initAbout(): void {
  const viewport = document.querySelector<HTMLElement>(".about-viewport");
  const screens = Array.from(document.querySelectorAll<HTMLElement>(".about-screen"));
  const progress = document.querySelector<HTMLElement>(".about-progress");
  const fill = progress?.querySelector<HTMLElement>(".about-progress-fill");
  const track = progress?.querySelector<HTMLElement>(".about-progress-track");
  if (!viewport || screens.length === 0) return;

  const total = screens.length;
  let current = 0;

  const setProgress = (ratio: number): void => {
    fill?.style.setProperty("--progress", ratio.toFixed(4));
    progress?.setAttribute("aria-valuenow", String(Math.round(ratio * (total - 1))));
  };

  const setCurrent = (i: number, scroll = false): void => {
    const target = Math.max(0, Math.min(total - 1, i));
    current = target;
    setProgress(total > 1 ? target / (total - 1) : 0);
    screens.forEach((s, idx) => {
      s.classList.toggle("is-current", idx === target);
      if (idx === target) s.classList.add("is-in"); // 只加不减，保证入场只播一次
    });
    if (scroll) viewport.scrollTo({ top: screens[target].offsetTop, behavior: "smooth" });
  };

  // 当前屏检测：进入视口 ≥50%
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const idx = screens.indexOf(entry.target as HTMLElement);
        if (idx >= 0) setCurrent(idx);
      }
    },
    { root: viewport, threshold: 0.5 }
  );
  screens.forEach((s) => io.observe(s));

  // 进度条点击 / 触按跳转
  progress?.addEventListener("click", (ev) => {
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const vertical = window.matchMedia("(min-width: 640px)").matches;
    const ratio = vertical
      ? (ev.clientY - rect.top) / rect.height
      : (ev.clientX - rect.left) / rect.width;
    setCurrent(Math.round(Math.min(1, Math.max(0, ratio)) * (total - 1)), true);
  });

  // 键盘导航
  window.addEventListener("keydown", (ev) => {
    const el = ev.target as HTMLElement | null;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
    if (document.documentElement.classList.contains("lm-open")) return; // 菜单抽屉打开时忽略
    switch (ev.key) {
      case "ArrowDown":
      case "PageDown":
        ev.preventDefault();
        setCurrent(current + 1, true);
        break;
      case "ArrowUp":
      case "PageUp":
        ev.preventDefault();
        setCurrent(current - 1, true);
        break;
      case "Home":
        ev.preventDefault();
        setCurrent(0, true);
        break;
      case "End":
        ev.preventDefault();
        setCurrent(total - 1, true);
        break;
    }
  });

  // 初始进入第一屏
  setCurrent(0);
}
