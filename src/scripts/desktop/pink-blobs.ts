interface BlobOpts {
  count?: number;
  minR?: number;
  maxR?: number;
  alphaMin?: number;
  alphaMax?: number;
  speed?: number;
}

interface Ball {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  freq: number;
  color: string;
}

const PINKS = ["255,145,175", "241,156,187", "255,179,198", "255,214,224"];

let blobs: { stop(): void } | null = null;
let canvas: HTMLCanvasElement | null = null;
let raf = 0;
let running = true;
let tick: ((t: number) => void) | null = null;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function hostEl() {
  return (
    document.querySelector<HTMLElement>("[data-folder-view='art']:not([hidden])") ??
    document.querySelector<HTMLElement>("[data-art-show]") ??
    document.body
  );
}

function ensureCanvas(): HTMLCanvasElement {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "blob-bg";
    canvas.setAttribute("aria-hidden", "true");
  }
  const host = hostEl();
  if (canvas.parentElement !== host) host.insertBefore(canvas, host.firstChild);
  return canvas;
}

export function showBlobs(opts: BlobOpts = {}) {
  const c = ensureCanvas();
  c.style.display = "block";
  if (!blobs) blobs = start(c, opts);
  running = true;
  if (!raf && tick) raf = requestAnimationFrame(tick);
}

export function hideBlobs() {
  if (canvas) canvas.style.display = "none";
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function start(host: HTMLCanvasElement, opts: BlobOpts): { stop(): void } {
  const ctx = host.getContext("2d")!;
  let w = 0;
  let h = 0;
  let balls: Ball[] = [];

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    drawStatic(ctx, host, opts);
    return { stop() {} };
  }

  function resize() {
    w = host.width = host.clientWidth;
    h = host.height = host.clientHeight;
    const area = w * h;
    const count = opts.count ?? Math.round(Math.min(40, Math.max(16, area / 60000)));
    balls = Array.from({ length: count }, () => makeBall());
  }

  function makeBall(): Ball {
    const r = rand(opts.minR ?? 20, opts.maxR ?? 90);
    return {
      x: Math.random() * (w || 1),
      y: Math.random() * (h || 1),
      r,
      vx: (Math.random() - 0.5) * 2 * (opts.speed ?? 0.15),
      vy: (Math.random() - 0.5) * 2 * (opts.speed ?? 0.15),
      alpha: rand(opts.alphaMin ?? 0.08, opts.alphaMax ?? 0.28),
      phase: Math.random() * Math.PI * 2,
      freq: 0.0003 + Math.random() * 0.0007,
      color: PINKS[Math.floor(Math.random() * PINKS.length)],
    };
  }

  function step(t: number) {
    if (!running) {
      raf = 0;
      return;
    }
    ctx.clearRect(0, 0, w, h);
    const drift = Math.sin(t * 0.0001) * 0.05;

    for (const b of balls) {
      b.x += b.vx + drift + Math.sin(t * b.freq + b.phase) * 0.08;
      b.y += b.vy + Math.cos(t * b.freq + b.phase) * 0.08;
      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
      grad.addColorStop(0, `rgba(255,255,255,${b.alpha * 0.9})`);
      grad.addColorStop(0.4, `rgba(${b.color},${b.alpha})`);
      grad.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  tick = step;

  const onResize = () => {
    cancelAnimationFrame(raf);
    resize();
    if (running) raf = requestAnimationFrame(step);
  };
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (canvas?.style.display === "block") {
      running = true;
      raf = requestAnimationFrame(step);
    }
  });

  resize();
  raf = requestAnimationFrame(step);

  return {
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("resize", onResize);
    },
  };
}

function drawStatic(ctx: CanvasRenderingContext2D, host: HTMLCanvasElement, opts: BlobOpts) {
  host.width = host.clientWidth;
  host.height = host.clientHeight;
  for (let i = 0; i < 12; i++) {
    const r = rand(opts.minR ?? 20, opts.maxR ?? 90);
    const x = Math.random() * host.width;
    const y = Math.random() * host.height;
    const alpha = rand(opts.alphaMin ?? 0.08, opts.alphaMax ?? 0.28);
    const color = PINKS[i % PINKS.length];
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
    grad.addColorStop(0.4, `rgba(${color},${alpha})`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
