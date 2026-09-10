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
  const mqMobile = window.matchMedia("(max-width: 639px)");

  // 本次"打开窗口"是否压入了一条历史（决定显式关窗是否需 history.back 回退）
  let pushed = false;

  function on(el: Window | Document | HTMLElement, type: string, fn: EventListener, opt?: AddEventListenerOptions) {
    el.addEventListener(type, fn, opt);
    offs.push(() => el.removeEventListener(type, fn, opt));
  }

  function bootWin(id: string) {
    const win = wins.find((w) => w.dataset.zlWin === id);
    win?.querySelectorAll<HTMLElement>("[data-zl-boot-win]").forEach((el, i) => scramble(el, i * 4));
  }

  function applyActive(id: string) {
    wins.forEach((w) => w.classList.toggle("is-active", w.dataset.zlWin === id));
    openers.forEach((el) => el.classList.toggle("is-on", el.dataset.zlOpen === id));
    bootWin(id);
  }

  function openWin(id: string) {
    const wasOpen = stage?.classList.contains("is-open") ?? false;
    if (!wasOpen) {
      // 浏览器返回语义：桌面端打开窗口时压入一条历史（含 #module 深链），回退键先关窗口。
      // 移动端浮层是同一页内的全屏覆盖，「返回」只关浮层，因此用 replaceState 写深链而不压历史，
      // 避免 history.back() 把用户带回上一个真实页面（作品目录）。
      try {
        if (mqMobile.matches) {
          history.replaceState({ zlWin: id }, "", `#module=${id}`);
          pushed = false;
        } else {
          history.pushState({ zlWin: id }, "", `#module=${id}`);
          pushed = true;
        }
      } catch {
        /* 隐私模式 / 文件协议下可能抛错，忽略即可 */
        pushed = false;
      }
      stage?.classList.add("is-open");
    } else {
      // 已打开：仅切换模块，不新增历史条目，但同步 hash
      try {
        history.replaceState({ zlWin: id }, "", `#module=${id}`);
      } catch {
        /* ignore */
      }
    }
    applyActive(id);
  }

  function closeWin() {
    stage?.classList.remove("is-open");
    wins.forEach((w) => w.classList.remove("is-active"));
    openers.forEach((el) => el.classList.remove("is-on"));
  }

  // 显式关窗（× / 背景 / Esc）：先关窗。桌面端再 history.back() 回退深链历史；
  // 移动端无压历史，只把 #module 深链从当前条目抹掉，留在智联 OS 图标网格本页。
  function closeAndBack() {
    if (!stage?.classList.contains("is-open")) return;
    closeWin();
    if (pushed) {
      pushed = false;
      try {
        history.back();
      } catch {
        /* popstate 已兜底关窗 */
      }
    } else {
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch {
        /* ignore */
      }
    }
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
      closeAndBack();
    });
  });

  if (stage) {
    on(stage, "click", (e) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-zl-win]")) return;
      closeAndBack();
    });
  }

  on(window, "keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape") closeAndBack();
  });

  // 浏览器后退 / 前进：若窗口开着则先关窗口（对应 openWin 里压入的历史条目）
  on(window, "popstate", () => {
    pushed = false;
    if (stage?.classList.contains("is-open")) closeWin();
  });

  // 深链 / 手动改 hash（#module=xxx）：同步打开对应窗口
  function syncFromHash() {
    const m = location.hash.match(/#module=([^&]+)/);
    const id = m ? decodeURIComponent(m[1]) : null;
    if (!id) return;
    if (!wins.some((w) => w.dataset.zlWin === id)) return;
    if (!stage?.classList.contains("is-open")) {
      stage?.classList.add("is-open");
      pushed = false;
    }
    applyActive(id);
  }
  on(window, "hashchange", () => syncFromHash());

  // 桌面端：OS 是固定视口，拦截滚轮防止页面滚动；移动端已改滚动页，放行整页滚动
  if (!mqMobile.matches) {
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
  }

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
  // 深链（#module=xxx）：加载即打开对应模块，刷新保持
  syncFromHash();

  host._osOff = () => {
    offs.forEach((off) => off());
    host._osOff = undefined;
  };
}
