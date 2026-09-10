import gsap from "gsap";

type GameRoot = HTMLElement & { _gameOff?: () => void };

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const IDLE_SNOW = 0.32;
const GLYPHS = "01█▓▒░#*+-/<>¥$%@ABCDEFGHJKLMNPQRSTUVWXYZアイウエオカキクケコサシスセソ";

function paintSnow(
  dest: CanvasRenderingContext2D,
  grain: HTMLCanvasElement,
  grainCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  alpha: number
) {
  const sw = Math.max(1, Math.floor(w / 3));
  const sh = Math.max(1, Math.floor(h / 3));
  if (grain.width !== sw || grain.height !== sh) {
    grain.width = sw;
    grain.height = sh;
  }
  const img = grainCtx.createImageData(sw, sh);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() * 255;
    const stripe = ((i / 4) % sw) % 19 === 0 ? 55 : 0;
    d[i] = Math.min(255, n + stripe);
    d[i + 1] = n;
    d[i + 2] = Math.max(0, n - stripe * 0.45);
    d[i + 3] = 255 * alpha;
  }
  grainCtx.putImageData(img, 0, 0);
  dest.imageSmoothingEnabled = false;
  dest.clearRect(0, 0, w, h);
  dest.drawImage(grain, 0, 0, w, h);
}

function scramble(el: HTMLElement) {
  const text = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = text;
  if (reduced() || !text) {
    el.textContent = text;
    return;
  }
  const chars = [...text];
  let frame = 0;
  const total = 16 + chars.length * 2;
  const tick = () => {
    frame += 1;
    el.textContent = chars
      .map((c, i) => {
        if (c === " " || c === "-" || c === "/") return c;
        if (frame > 7 + i * 2) return c;
        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
      })
      .join("");
    if (frame < total) window.requestAnimationFrame(tick);
    else el.textContent = text;
  };
  tick();
}

export function initGameMonitor(root: HTMLElement) {
  const host = root as GameRoot;
  host._gameOff?.();

  const track = root.querySelector<HTMLElement>("[data-game-track]");
  const panels = [...root.querySelectorAll<HTMLElement>("[data-panel]")];
  if (!track || panels.length < 2) return;

  const hint = root.querySelector<HTMLElement>("[data-game-hint]");
  // 触屏没有滚轮，切台靠点按下方圆点，提示文案相应替换
  if (hint && window.matchMedia("(pointer: coarse)").matches) {
    hint.textContent = "点按圆点切台";
  }
  const step = root.querySelector<HTMLElement>("[data-game-step]");
  const dots = [...root.querySelectorAll<HTMLButtonElement>("[data-game-dot]")];
  const video = root.querySelector<HTMLVideoElement>("[data-game-video]");
  const flash = root.querySelector<HTMLElement>("[data-game-flash]");
  const glass = root.querySelector<HTMLElement>(".game-glass");
  const sound = root.querySelector<HTMLButtonElement>("[data-game-sound]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-game-crt]");
  const ctx = canvas?.getContext("2d", { alpha: true }) ?? null;
  const snowLayer = root.querySelector<HTMLElement>("[data-game-snow]");
  const bootEl = root.querySelector<HTMLElement>("[data-game-boot]");
  const grain = document.createElement("canvas");
  const grainCtx = grain.getContext("2d", { alpha: true });

  let index = 0;
  let locked = true;
  let acc = 0;
  let decay = 0;
  let cool = 0;
  let snow = reduced() ? 0 : 0.9;
  let snowRaf = 0;
  let snowFrame = 0;
  const offs: Array<() => void> = [];

  function on(
    el: Window | Document | HTMLElement,
    type: string,
    fn: EventListener,
    opt?: AddEventListenerOptions
  ) {
    el.addEventListener(type, fn, opt);
    offs.push(() => el.removeEventListener(type, fn, opt));
  }

  function sizeCrt() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function tickSnow() {
    snowRaf = 0;
    if (!canvas || !ctx || !grainCtx || reduced()) return;
    snowFrame += 1;
    const bursting = snow > IDLE_SNOW + 0.02;
    if (bursting || snowFrame % 2 === 0) {
      sizeCrt();
      paintSnow(ctx, grain, grainCtx, canvas.width, canvas.height, snow);
      if (bursting) snow = Math.max(IDLE_SNOW, snow * 0.82);
      else snow = IDLE_SNOW;
    }
    snowRaf = window.requestAnimationFrame(tickSnow);
  }

  function playLines(scope: ParentNode = panels[index] ?? root) {
    scope.querySelectorAll<HTMLElement>("[data-game-line]").forEach((el) => scramble(el));
  }

  function burst() {
    flash?.classList.add("is-on");
    glass?.classList.add("is-switching");
    snowLayer?.classList.add("is-burst");
    window.setTimeout(() => {
      flash?.classList.remove("is-on");
      glass?.classList.remove("is-switching");
      snowLayer?.classList.remove("is-burst");
    }, 480);
    if (reduced()) return;
    snow = 0.86;
    if (!snowRaf) snowRaf = window.requestAnimationFrame(tickSnow);
  }

  function sync() {
    if (step) step.textContent = `${String(index + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    panels.forEach((p, i) => {
      p.classList.toggle("is-on", i === index);
      p.inert = i !== index;
    });
    root.dataset.gameIndex = String(index);
    if (video) {
      if (index === 1) video.play().catch(() => undefined);
      else {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    }
  }

  function unlock() {
    locked = false;
    acc = 0;
    cool = performance.now() + 560;
  }

  function go(next: number) {
    if (locked || next === index || next < 0 || next >= panels.length) return;
    locked = true;
    acc = 0;
    index = next;
    sync();
    burst();
    hint?.classList.add("is-dim");
    window.setTimeout(() => playLines(), 160);

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      unlock();
    };

    if (reduced()) {
      gsap.set(track, { xPercent: -100 * index });
      done();
      return;
    }

    gsap.to(track, {
      xPercent: -100 * index,
      duration: 0.72,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: done,
      onInterrupt: done,
    });
    window.setTimeout(done, 820);
  }

  function liftCover() {
    document.documentElement.classList.remove("tx-covered", "is-tv-boot");
  }

  function playBoot() {
    locked = true;
    cool = performance.now() + 1800;
    snow = reduced() ? IDLE_SNOW : 1;
    bootEl?.classList.remove("is-off", "is-snow");
    bootEl?.classList.add("is-bars");
    if (reduced()) {
      bootEl?.classList.remove("is-bars");
      bootEl?.classList.add("is-off");
      liftCover();
      unlock();
      playLines();
      return;
    }
    window.setTimeout(() => {
      bootEl?.classList.remove("is-bars");
      bootEl?.classList.add("is-snow");
      snow = 0.98;
    }, 420);
    window.setTimeout(() => {
      bootEl?.classList.add("is-off");
      liftCover();
      window.setTimeout(() => {
        unlock();
        playLines();
      }, 320);
    }, 1100);
  }

  gsap.set(track, { xPercent: 0 });
  sync();
  sizeCrt();
  if (!reduced() && canvas && ctx && !snowRaf) snowRaf = window.requestAnimationFrame(tickSnow);
  playBoot();

  on(
    window,
    "wheel",
    ((e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (locked || performance.now() < cool) {
        acc = 0;
        return;
      }
      acc += e.deltaY + e.deltaX;
      window.clearTimeout(decay);
      decay = window.setTimeout(() => {
        acc = 0;
      }, 180);
      if (acc > 64) go(index + 1);
      else if (acc < -64) go(index - 1);
    }) as EventListener,
    { passive: false, capture: true }
  );

  on(window, "keydown", (e) => {
    if (locked || performance.now() < cool) return;
    const key = (e as KeyboardEvent).key;
    if (key === "ArrowRight" || key === "ArrowDown") go(index + 1);
    if (key === "ArrowLeft" || key === "ArrowUp") go(index - 1);
  });

  dots.forEach((dot) => {
    on(dot, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const i = Number(dot.dataset.gameDot);
      if (Number.isFinite(i)) go(i);
    });
  });

  const fileTabs = [...root.querySelectorAll<HTMLButtonElement>("[data-game-file-tab]")];
  const fileRows = [...root.querySelectorAll<HTMLElement>("[data-game-file-row]")];
  fileTabs.forEach((tab) => {
    on(tab, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const i = Number(tab.dataset.gameFileTab);
      if (!Number.isFinite(i)) return;
      fileTabs.forEach((t, n) => {
        if (n === i) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
      fileRows.forEach((row, n) => {
        row.classList.toggle("is-on", n === i);
      });
      const body = fileRows[i]?.querySelector<HTMLElement>("[data-game-file-page]");
      if (body) playLines(body);
    });
  });

  const lights = [...root.querySelectorAll<HTMLElement>("[data-relight]")];
  on(window, "pointermove", (e) => {
    const ev = e as PointerEvent;
    lights.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      const inside =
        ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      const stay = el.classList.contains("pd-hero-media");
      el.classList.toggle("is-lit", stay || inside);
      if (!stay && !inside) return;
      el.style.setProperty("--lx", `${((ev.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--ly", `${((ev.clientY - r.top) / r.height) * 100}%`);
    });
  });

  if (video && sound) {
    video.loop = true;
    video.disablePictureInPicture = true;
    const syncSound = () => {
      sound.textContent = video.muted ? "闭音" : "开音";
      sound.setAttribute("aria-pressed", video.muted ? "true" : "false");
    };
    syncSound();
    on(sound, "click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (!video.muted) video.play().catch(() => undefined);
      syncSound();
    });
    on(video, "ended", () => {
      if (index !== 1) return;
      video.currentTime = 0;
      video.play().catch(() => undefined);
    });
  }

  on(window, "resize", () => sizeCrt());

  host._gameOff = () => {
    window.cancelAnimationFrame(snowRaf);
    offs.forEach((off) => off());
    host._gameOff = undefined;
  };
}
