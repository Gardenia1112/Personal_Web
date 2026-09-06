type BoardRoot = HTMLElement & { _boardOff?: () => void };

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function startCurves(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) return () => undefined;

  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return () => undefined;

  gl.shaderSource(
    vs,
    "attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}"
  );
  gl.shaderSource(
    fs,
    "precision mediump float;uniform vec2 u_res;uniform float u_t;uniform float u_grow;void main(){vec2 uv=gl_FragCoord.xy/u_res;vec2 p=(uv-0.5)/max(u_grow,0.08)+0.5;float glow=0.0;for(int i=0;i<7;i++){float fi=float(i);float y=0.18+fi*0.11+sin(p.x*6.2+u_t*1.4+fi*0.9)*0.055;glow+=smoothstep(0.018,0.0,abs(p.y-y));}float fade=smoothstep(0.0,0.12,u_grow);vec3 ink=vec3(0.12,0.09,0.06);vec3 gold=vec3(0.96,0.78,0.22);gl_FragColor=vec4(mix(ink,gold,clamp(glow,0.0,1.0)),clamp(glow*0.85,0.0,0.72)*fade);}"
  );
  gl.compileShader(vs);
  gl.compileShader(fs);
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => undefined;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  const uRes = gl.getUniformLocation(prog, "u_res");
  const uT = gl.getUniformLocation(prog, "u_t");
  const uGrow = gl.getUniformLocation(prog, "u_grow");

  let raf = 0;
  let live = true;
  const t0 = performance.now();

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function tick() {
    if (!live || !gl) return;
    size();
    const t = (performance.now() - t0) / 1000;
    const grow = Math.min(1, t / 0.7);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, t);
    gl.uniform1f(uGrow, grow);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = window.requestAnimationFrame(tick);
  }

  tick();
  return () => {
    live = false;
    window.cancelAnimationFrame(raf);
  };
}

export function initClueBoard(root: HTMLElement) {
  const host = root as BoardRoot;
  host._boardOff?.();

  const wall = root.querySelector<HTMLElement>("[data-clue-wall]");
  if (!wall) return;

  const items = [...root.querySelectorAll<HTMLElement>("[data-clue-item]")];
  const legend = root.querySelector<HTMLElement>(".bb-legend");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-bb-webgl]");
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const offs: Array<() => void> = [];
  let stopCurves: (() => void) | undefined;

  function on(el: Window | Document | HTMLElement, type: string, fn: EventListener, opt?: AddEventListenerOptions) {
    el.addEventListener(type, fn, opt);
    offs.push(() => el.removeEventListener(type, fn, opt));
  }

  function clear() {
    items.forEach((item) => item.classList.remove("is-hot"));
    wall.classList.remove("is-focus");
  }

  function focus(item: HTMLElement) {
    items.forEach((el) => el.classList.toggle("is-hot", el === item));
    wall.classList.add("is-focus");
  }

  function finishEnter() {
    root.classList.remove("is-entering");
    items.forEach((item) => item.classList.add("is-stuck"));
    legend?.classList.add("is-in");
  }

  function playEnter() {
    if (reduced()) {
      finishEnter();
      return;
    }
    if (canvas) stopCurves = startCurves(canvas);
    legend?.classList.add("is-in");
    items.forEach((item, i) => {
      window.setTimeout(() => {
        item.classList.add("is-sticking");
        item.addEventListener(
          "animationend",
          () => {
            item.classList.remove("is-sticking");
            item.classList.add("is-stuck");
            if (i === items.length - 1) root.classList.remove("is-entering");
          },
          { once: true }
        );
      }, 520 + i * 90);
    });
    window.setTimeout(finishEnter, 520 + items.length * 90 + 700);
  }

  playEnter();

  on(window, "wheel", (e) => {
    e.preventDefault();
  }, { passive: false });

  items.forEach((item) => {
    on(item, "pointerenter", () => {
      if (coarse) return;
      focus(item);
    });
    on(item, "pointerleave", () => {
      if (coarse) return;
      clear();
    });
    on(item, "click", (e) => {
      if (!coarse) return;
      e.preventDefault();
      e.stopPropagation();
      if (item.classList.contains("is-hot")) clear();
      else focus(item);
    });
  });

  on(wall, "click", (e) => {
    if (!coarse) return;
    if ((e.target as HTMLElement | null)?.closest("[data-clue-item]")) return;
    clear();
  });

  host._boardOff = () => {
    stopCurves?.();
    offs.forEach((off) => off());
    host._boardOff = undefined;
  };
}
