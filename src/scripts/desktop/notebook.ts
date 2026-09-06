type NotebookRoot = HTMLElement & { _nbOff?: () => void };

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initNotebook(root: HTMLElement) {
  const host = root as NotebookRoot;
  host._nbOff?.();

  const pages = [...root.querySelectorAll<HTMLElement>(".nb-page")];
  if (pages.length === 0) return;

  let armed = false;
  const timers = new Map<HTMLElement, number>();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const page = entry.target as HTMLElement;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
          page.classList.add("is-in");
          if (!armed || reduced()) return;
          page.classList.add("is-turning");
          window.clearTimeout(timers.get(page));
          timers.set(
            page,
            window.setTimeout(() => page.classList.remove("is-turning"), 600)
          );
        }
      });
    },
    { threshold: [0.18, 0.4] }
  );

  function playCover() {
    const cover = root.querySelector<HTMLElement>("[data-nb-cover]");
    if (!cover) return;
    const open = () => {
      cover.classList.add("is-open");
      window.setTimeout(() => cover.classList.add("is-away"), 920);
    };
    if (reduced()) {
      cover.classList.add("is-open", "is-away");
      return;
    }
    window.setTimeout(open, 720);
    cover.addEventListener("click", open, { once: true });
  }

  playCover();
  pages.forEach((page) => io.observe(page));
  window.requestAnimationFrame(() => {
    armed = true;
  });

  const tilts = [...root.querySelectorAll<HTMLElement>(".nb-figure--photo, [data-nb-toy]")];
  const onMove = (e: PointerEvent) => {
    if (reduced() || e.pointerType === "touch") return;
    const el = (e.currentTarget as HTMLElement) ?? null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
    el.style.transform = `rotate(${x * 0.4}deg) translate(${x.toFixed(1)}px, ${(y - 6).toFixed(1)}px)`;
  };
  const onLeave = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).style.transform = "";
  };
  tilts.forEach((el) => {
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  });

  host._nbOff = () => {
    io.disconnect();
    timers.forEach((id) => window.clearTimeout(id));
    tilts.forEach((el) => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
    host._nbOff = undefined;
  };
}
