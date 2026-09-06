type OsRoot = HTMLElement & { _osOff?: () => void };

const GLYPHS = "01█▓▒░#*+-/<>¥$%@ABCDEFGHJKLMNPQRSTUVWXYZアイウエオカキクケコサシスセソ";

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scramble(el: HTMLElement, delay = 0) {
  const text = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = text;
  if (reduced() || !text) {
    el.textContent = text;
    return;
  }
  const chars = [...text];
  let frame = 0;
  const total = delay + 14 + chars.length * 2;
  const tick = () => {
    frame += 1;
    el.textContent = chars
      .map((c, i) => {
        if (c === " " || c === "·" || c === "│" || c === "░" || c === "–") return c;
        if (frame > delay + 6 + i * 2) return c;
        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
      })
      .join("");
    if (frame < total) window.requestAnimationFrame(tick);
    else el.textContent = text;
  };
  tick();
}

export function initSensorOs(root: HTMLElement) {
  const host = root as OsRoot;
  host._osOff?.();

  const stage = root.querySelector<HTMLElement>("[data-zl-stage]");
  const wins = [...root.querySelectorAll<HTMLElement>("[data-zl-win]")];
  const openers = [...root.querySelectorAll<HTMLElement>("[data-zl-open]")];
  const closers = [...root.querySelectorAll<HTMLElement>("[data-zl-close]")];
  const offs: Array<() => void> = [];

  function on(el: Window | Document | HTMLElement, type: string, fn: EventListener, opt?: AddEventListenerOptions) {
    el.addEventListener(type, fn, opt);
    offs.push(() => el.removeEventListener(type, fn, opt));
  }

  function bootWin(id: string) {
    const win = wins.find((w) => w.dataset.zlWin === id);
    win?.querySelectorAll<HTMLElement>("[data-zl-boot-win]").forEach((el, i) => scramble(el, i * 4));
  }

  function openWin(id: string) {
    stage?.classList.add("is-open");
    wins.forEach((w) => w.classList.toggle("is-active", w.dataset.zlWin === id));
    openers.forEach((el) => el.classList.toggle("is-on", el.dataset.zlOpen === id));
    bootWin(id);
  }

  function closeWin() {
    stage?.classList.remove("is-open");
    wins.forEach((w) => w.classList.remove("is-active"));
    openers.forEach((el) => el.classList.remove("is-on"));
  }

  openers.forEach((el) => {
    on(el, "click", (e) => {
      e.stopPropagation();
      const id = el.dataset.zlOpen;
      if (id) openWin(id);
    });
  });

  closers.forEach((el) => {
    on(el, "click", (e) => {
      e.stopPropagation();
      closeWin();
    });
  });

  if (stage) {
    on(stage, "click", (e) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-zl-win]")) return;
      closeWin();
    });
  }

  on(window, "keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape") closeWin();
  });

  on(
    window,
    "wheel",
    (e) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(".zl-win__body")) return;
      e.preventDefault();
    },
    { passive: false }
  );

  function startOs() {
    root.classList.add("is-booted");
    root.querySelectorAll<HTMLElement>("[data-zl-boot]").forEach((el, i) => scramble(el, i * 3));
  }

  function playLoader() {
    const loader = root.querySelector<HTMLElement>("[data-zl-loader]");
    if (!loader || reduced()) {
      loader?.classList.add("is-done");
      startOs();
      return;
    }
    const cells = [...loader.querySelectorAll<HTMLElement>(".zl-loader__cell")];
    const lines = [...loader.querySelectorAll<HTMLElement>("[data-zl-load-line]")];
    cells.forEach((cell, i) => {
      window.setTimeout(() => cell.classList.add("is-on"), 90 + i * 42);
    });
    lines.forEach((el, i) => scramble(el, 6 + i * 8));
    window.setTimeout(() => {
      loader.classList.add("is-done");
      startOs();
    }, 90 + cells.length * 42 + 380);
  }

  playLoader();

  host._osOff = () => {
    offs.forEach((off) => off());
    host._osOff = undefined;
  };
}
