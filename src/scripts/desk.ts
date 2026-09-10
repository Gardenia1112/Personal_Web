// 深夜工位 3D 场景
// Phase 1-2：room_full.glb 实模 + 开场剧本 + Hover 统一状态机（GSAP 驱动）
// 参考 handoff/references/awwwards/john-particias-comfort-space.md：鼠标带动视角摇晃 + 昼夜切换
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { gsap } from "gsap";
import { deskObjects, introPopOrder, type DeskObject } from "../data/objects";
import { navigateWithTransition } from "./transition";

const MODEL_URL = "/models/room_full.glb";
// 开场剧本标记走 sessionStorage：同一标签页内刷新/来回跳页会跳过，关掉标签页再来重播一次
// （02 §1.1 原文写 localStorage 只播一次，2026-09-04 用户改为「每个会话播一次」）
const INTRO_KEY = "yb-design:intro:played";

// 等距 2.5D：正交相机沿固定方向俯视，靠 frustum 缩放取景（D1）
const VIEW_DIR = new THREE.Vector3(1, 0.82, 1).normalize();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const SWAY_RIGHT = new THREE.Vector3().crossVectors(VIEW_DIR, WORLD_UP).normalize();
const SWAY_UP = new THREE.Vector3().crossVectors(SWAY_RIGHT, VIEW_DIR).normalize();

const FIT_INTRO = 1.9; // 开场取景（更广）
const FIT_IDLE = 1.5; // 定机位取景：留一圈余量，让身后的背景大字从房间四周透出来
const FIT_ACTIVE = 0.72; // ACTIVE：镜头飞近（D5）
const SWAY_AMOUNT = 0.22; // 视角摇晃幅度（× 场景半径），克制为主
const SWAY_EASE = 0.055; // lerp 系数，越小越黏
const HERO_PARALLAX = 26; // 背景大字的反向位移上限（px），比前景多走一点才显得远
const HOVER_COLOR = new THREE.Color("#00d9ff");
const ACTIVE_MS = 380; // 与 transition.ts 的 FADE_MS 对齐：飞近与渐黑同时发生

interface DeskMat {
  mat: THREE.MeshStandardMaterial;
  baseEmissive: THREE.Color;
  baseIntensity: number;
}

interface DeskItem {
  data: DeskObject;
  root: THREE.Object3D;
  mats: DeskMat[];
  basePos: THREE.Vector3;
  baseScale: THREE.Vector3;
  liftVec: THREE.Vector3; // 世界「上」换算到父空间后的浮起向量
  center: THREE.Vector3; // 世界包围盒中心（镜头聚焦 / DOM 投影用）
  top: THREE.Vector3; // 世界包围盒顶部中心（台灯灯光 / 热点锚点 / 咖啡彩蛋定位）
  size: THREE.Vector3;
  hover: { t: number };
  hotspot: HTMLElement | null; // 屏幕上的热点圆点（Scene.astro 渲染，位置每帧投影过来）
  hotspotAnchor: THREE.Vector3; // 圆点吸附的世界坐标（物件正上方）
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// gsap tween/timeline → Promise（避免依赖 thenable 类型）
function tweenDone(t: { eventCallback(type: string, callback: () => void): void }): Promise<void> {
  return new Promise((r) => t.eventCallback("onComplete", r));
}

/** 把「世界坐标系里向上 worldLength」换算成物件父空间的位移向量（模型各物件有旋转/非均匀缩放，不能直接动 local Y） */
function liftInParentSpace(obj: THREE.Object3D, worldLength: number) {
  const v = WORLD_UP.clone().multiplyScalar(worldLength);
  const parent = obj.parent;
  if (!parent) return v;
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  parent.getWorldQuaternion(q);
  parent.getWorldScale(s);
  v.applyQuaternion(q.invert());
  return v.set(v.x / (s.x || 1), v.y / (s.y || 1), v.z / (s.z || 1));
}

// ── 奶茶彩蛋：从咖啡杯右上角弹出的可爱对话框 ──
function buildEasterPopup(): HTMLElement {
  const el = document.createElement("div");
  el.className = "easter-pop";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "今日奶茶推荐");
  document.body.appendChild(el);
  return el;
}


/** 3D 不可用（无 WebGL / 低端机 / 模型加载失败）时露出静态 DOM 菜单，避免白屏 */
function degradeToFallback() {
  document.documentElement.classList.add("is-fallback");
}

/** 运行时性能探测（v2 任务 1）：默认保留 3D，仅在有硬伤时降级
 *  - ?gl=off / ?three=off 手动强制降级（调试用）
 *  - 无 WebGL 上下文 → 降级
 *  - 低端机（≤2 核 或 ≤1GB 内存）→ 降级
 *  其余（含手机中高端机）保留 3D。 */
function shouldDegrade(): boolean {
  const params = new URLSearchParams(location.search);
  if (params.get("gl") === "off" || params.get("three") === "off") return true;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return true;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 2 || mem <= 1) return true;
  return false;
}

export function initDesk(container: HTMLElement) {
  // 移动端不再按宽度/粗指针一律降级；改为运行时性能探测（见 shouldDegrade）。
  if (shouldDegrade()) {
    degradeToFallback();
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swayEnabled = window.matchMedia("(pointer: fine)").matches && !reduceMotion;
  // 手机 touch 拖拽旋转：围绕 WORLD_UP 偏航 + 俯仰（clamp），桌面(pointer:fine)由鼠标 sway 接管，两者互斥
  const orbit = { yaw: 0, pitch: 0 };

  // 场景不设背景色：画布保持透明，好让 #hero-type 的背景大字从 3D 工位后面透出来
  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  const camTarget = new THREE.Vector3(); // 当前看向点（开场推镜 / ACTIVE 飞近都改它）
  const camFocus = new THREE.Vector3(); // 工位中心，定机位的看向点
  const camState = { fit: FIT_INTRO, dist: 10, radius: 1 };
  const sway = { x: 0, y: 0 };
  const swayTo = { x: 0, y: 0 };

  function updateCamera() {
    const aspect = container.clientWidth / container.clientHeight || 1;
    const half = camState.fit * camState.radius;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.near = 0.01;
    // 房间壳比「工位」大得多，远平面留足余量，别把墙和窗切掉
    camera.far = camState.dist + camState.radius * 60;
    camera.updateProjectionMatrix();
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearAlpha(0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = "block";
  // 手机拖拽旋转：禁止浏览器把手势抢去做页面平移/缩放
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  // ── 两套光照管线（手册 §3 精修 2）──
  // 黑夜：台灯 PointLight 暖光 + 弱冷色 Ambient；白天：HemisphereLight + DirectionalLight 暖色
  const ambientLight = new THREE.AmbientLight("#3b4556", 1.1);
  scene.add(ambientLight);
  const lampLight = new THREE.PointLight("#ffb974", 0, 0, 2);
  scene.add(lampLight);
  const hemiLight = new THREE.HemisphereLight("#fff4e2", "#6b5847", 0);
  scene.add(hemiLight);
  const sunLight = new THREE.DirectionalLight("#ffe6bf", 0);
  sunLight.position.set(4, 8, 6);
  scene.add(sunLight);

  const items: DeskItem[] = [];
  const itemRoots: THREE.Object3D[] = []; // Raycaster 只打这 6 件，不遍历整间房
  const itemByRoot = new Map<THREE.Object3D, DeskItem>();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const introOverlay = document.getElementById("intro-overlay");
  const introHint = document.getElementById("intro-hint");
  // 触屏（手机/平板）没有「鼠标靠近」，提示改为拖拽旋转 + 点按
  if (introHint && window.matchMedia("(pointer: coarse)").matches) {
    introHint.textContent = "拖拽旋转 · 点按发光图标探索工位";
  }
  const loadingHint = document.getElementById("loading-hint");
  const hotspotLayer = document.getElementById("hotspots");
  const heroType = document.getElementById("hero-type");
  let hovered: DeskItem | null = null;
  let ready = false;
  let activating = false;

  const easterPop = buildEasterPopup();
  /** 对话框锚在咖啡杯世界坐标；每帧投影到屏幕右上角 */
  const easterAnchor = new THREE.Vector3();
  let easterOpen = false;
  let easterTimer = 0;

  function hideEaster() {
    window.clearTimeout(easterTimer);
    easterTimer = 0;
    if (!easterPop.classList.contains("show")) {
      easterOpen = false;
      return;
    }
    easterPop.classList.remove("show");
    // 等关场动效播完再停锚点跟踪
    window.clearTimeout(easterTimer);
    easterTimer = window.setTimeout(() => {
      easterOpen = false;
      easterTimer = 0;
    }, 300);
  }

  function placeEasterPop() {
    if (!easterOpen) return;
    const p = projectToScreen(easterAnchor);
    const maxL = Math.max(12, container.clientWidth - 260);
    const left = Math.min(Math.max(12, p.x + 14), maxL);
    // 再往上抬一截，给对话框留空
    const top = Math.min(Math.max(56, p.y - 36), container.clientHeight - 24);
    easterPop.style.left = `${Math.round(left)}px`;
    easterPop.style.top = `${Math.round(top)}px`;
  }

  function showEaster(coffee: DeskItem | undefined) {
    if (coffee) easterAnchor.copy(coffee.top);
    window.clearTimeout(easterTimer);
    easterPop.innerHTML = `
      <p class="easter-body" role="status" aria-live="polite">今日奶茶推荐：蜜雪冰城芝士奶盖四季春！My Favorite❤</p>
    `;
    easterOpen = true;
    placeEasterPop();
    // 先落 hidden 态再强制回流，确保再次打开也有入场动效
    easterPop.classList.remove("show");
    void easterPop.offsetWidth;
    easterPop.classList.add("show");
    easterTimer = window.setTimeout(hideEaster, 3000);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideEaster();
  });

  // ── 台灯：仅主页浅/深（模型光照 + 本页 DOM）；localStorage 记住，回工位不丢 ──
  // 持久范围：仅首页（desk）记住台灯状态；
  // 跨页不生效、不影响其他路由 —— Phase 7 裁定
  const THEME_KEY = "yb-design:desk-theme";
  function readStoredTheme(): "dark" | "light" {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  }
  let theme: "dark" | "light" = readStoredTheme();

  const NIGHT = {
    ambient: new THREE.Color("#3b4556"),
    ambientIntensity: 1.1,
    lamp: 1,
    hemi: 0,
    sun: 0,
  };
  const DAY = {
    ambient: new THREE.Color("#fff0d8"),
    ambientIntensity: 0.5,
    lamp: 0.12,
    hemi: 1.15,
    sun: 1.5,
  };

  /** animate=true 时用 GSAP 过渡，避免光照突变；false 用于首帧直接落位 */
  function applyTheme(mode: "dark" | "light", animate: boolean) {
    theme = mode;
    document.documentElement.dataset.deskTheme = mode;
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* private mode */
    }
    const to = mode === "light" ? DAY : NIGHT;
    const lampPeak = lampLight.userData.peak as number;
    const smooth = animate && !reduceMotion;
    // duration:0 的 gsap.to 要等下一 tick 才落值，首帧会闪一下旧光照，所以这里分流到 gsap.set
    const set = (target: object, vars: gsap.TweenVars) =>
      smooth ? gsap.to(target, { ...vars, duration: 0.7, ease: "power2.inOut" }) : gsap.set(target, vars);
    set(ambientLight.color, { r: to.ambient.r, g: to.ambient.g, b: to.ambient.b });
    set(ambientLight, { intensity: to.ambientIntensity });
    set(lampLight, { intensity: lampPeak * to.lamp });
    set(hemiLight, { intensity: to.hemi });
    set(sunLight, { intensity: to.sun });
  }

  // ── 02 §4 状态机：IDLE → HOVER → ACTIVE（GSAP 统一驱动）──
  function applyHoverState(item: DeskItem) {
    const t = item.hover.t;
    item.root.position.copy(item.basePos).addScaledVector(item.liftVec, t);
    item.root.scale.copy(item.baseScale).multiplyScalar(1 + 0.028 * t);
    for (const { mat, baseEmissive, baseIntensity } of item.mats) {
      mat.emissive.copy(baseEmissive).lerp(HOVER_COLOR, t * 0.75);
      mat.emissiveIntensity = baseIntensity + (0.85 - baseIntensity) * t;
    }
  }

  function setHover(item: DeskItem | null) {
    if (item === hovered) return;
    const prev = hovered;
    hovered = item;
    prev?.hotspot?.classList.remove("is-hot");
    item?.hotspot?.classList.add("is-hot");
    if (prev) {
      gsap.to(prev.hover, {
        t: 0,
        duration: 0.32,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => applyHoverState(prev),
      });
    }
    if (item) {
      gsap.to(item.hover, {
        t: 1,
        duration: 0.26,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => applyHoverState(item),
      });
    }
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    swayTo.x = pointer.x;
    swayTo.y = pointer.y;

    if (!ready || activating) return;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(itemRoots, true)[0];
    let found: DeskItem | null = null;
    let o: THREE.Object3D | null = hit ? hit.object : null;
    while (o && !found) {
      found = itemByRoot.get(o) ?? null;
      o = o.parent;
    }
    // 悬停标题统一由热点圆点的标签显示，这里只负责 3D 侧的 HOVER 态
    setHover(found);

    // 自定义光标（D12）靠这个类变成「可点」环形；container 上的原生 cursor 是它的 CSS 兜底
    document.documentElement.classList.toggle("cursor-hot", !!found);
    container.style.cursor = found ? "pointer" : "default";
  }

  /** ACTIVE：镜头飞近该物件 + 渐黑跳转（D5，转场统一走 TransitionController） */
  function activate(item: DeskItem) {
    activating = true;
    document.documentElement.classList.remove("cursor-hot");
    container.style.cursor = "default";
    if (!reduceMotion) {
      gsap.to(camTarget, {
        x: item.center.x,
        y: item.center.y,
        z: item.center.z,
        duration: ACTIVE_MS / 1000,
        ease: "power2.in",
      });
      gsap.to(camState, {
        fit: FIT_ACTIVE,
        duration: ACTIVE_MS / 1000,
        ease: "power2.in",
        onUpdate: updateCamera,
      });
    }
    navigateWithTransition(item.data.route);
  }

  /** 物件的点击动作（3D 拾取与热点圆点共用） */
  function runAction(item: DeskItem) {
    const r = item.data.route;
    if (r === "theme") applyTheme(theme === "dark" ? "light" : "dark", true);
    else if (r === "coffee") showEaster(items.find((i) => i.data.id === "coffee"));
    else activate(item);
  }

  function onClick() {
    if (!ready || activating || !hovered) return;
    // touch 拖拽旋转结束后浏览器仍会补发一次 click，这里吞掉，避免「转完视角就误跳页」
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    runAction(hovered);
  }

  /** 热点圆点：hover / 键盘聚焦都联动 3D 的 HOVER 态，点击等价于点物件本身 */
  function bindHotspot(item: DeskItem) {
    const el = item.hotspot;
    if (!el) return;
    const enter = () => {
      if (ready && !activating) setHover(item);
    };
    const leave = () => {
      if (ready && !activating && hovered === item) setHover(null);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (ready && !activating) runAction(item);
    });
  }

  /** 背景大字：实测每行文本宽再回推字号，把每行都撑满整宽
   *  CSS 里按字符数估的字号只是无 JS 时的兜底，粗黑体各系统字宽不一，估算会切掉行尾字母 */
  function fitHeroType() {
    if (!heroType) return;
    const cs = getComputedStyle(heroType);
    const target = heroType.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (target <= 0) return;
    for (const line of Array.from(heroType.querySelectorAll<HTMLElement>(".hero-line"))) {
      line.style.fontSize = "100px";
      const w = line.scrollWidth;
      if (w > 0) line.style.fontSize = `${(target / w) * 100}px`;
    }
  }

  /** 开场结束（或跳过开场）后再露出热点圆点与背景大字 */
  function revealChrome() {
    hotspotLayer?.classList.add("is-ready");
    fitHeroType();
    if (heroType) gsap.to(heroType, { autoAlpha: 1, duration: 0.9, ease: "power2.out" });
  }

  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("click", onClick);

  // ── 手机 touch 拖拽旋转（v2 任务 1）：拖过阈值视为旋转并吞掉随后的 click，短触仍走 hover→点按跳转 ──
  let dragging = false;
  let dragMoved = false;
  let suppressClick = false;
  let lastX = 0;
  let lastY = 0;
  const DRAG_THRESHOLD = 6; // px，超过才算旋转，避免把轻点误判成拖拽
  container.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch") return;
    dragging = true;
    dragMoved = false;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  container.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerType !== "touch") return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    if (!dragMoved && Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
    dragMoved = true;
    orbit.yaw += dx * 0.005;
    orbit.pitch = Math.max(-0.9, Math.min(0.9, orbit.pitch + dy * 0.005));
  });
  const endDrag = () => {
    if (dragMoved) suppressClick = true;
    dragging = false;
    dragMoved = false;
  };
  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    updateCamera();
    renderer.setSize(container.clientWidth, container.clientHeight);
    fitHeroType();
  });
  // 粗黑体是系统字体，理论上不需要等下载；仍挂一次以防浏览器晚一帧才拿到度量
  document.fonts?.ready.then(fitHeroType);

  // ── 开场剧本（02 §1.1 ①-⑧）──
  function markIntroPlayed() {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* 隐私模式下写不进去，下次仍会播 */
    }
  }

  function projectToScreen(world: THREE.Vector3) {
    const v = world.clone().project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * container.clientWidth,
      y: (-v.y * 0.5 + 0.5) * container.clientHeight,
    };
  }

  /** ④ 电脑屏幕亮起：抬电脑的自发光，并把亮起后的值当作新的 IDLE 基线，hover 仍能在此之上加亮
   *  ⚠️ 模型里没有独立的 obj_screen 节点，只能整台电脑一起泛光，强度压低当屏幕漏光处理 */
  function lightUpScreen(computer: DeskItem) {
    const lit = new THREE.Color("#12384a");
    for (const m of computer.mats) {
      m.baseEmissive.copy(lit);
      m.baseIntensity = 0.3;
      gsap.to(m.mat.emissive, { r: lit.r, g: lit.g, b: lit.b, duration: 0.6, ease: "power2.out" });
      gsap.to(m.mat, { emissiveIntensity: 0.3, duration: 0.6, ease: "power2.out" });
    }
  }

  async function playIntro(computer: DeskItem | undefined) {
    const tl = gsap.timeline();

    // ① 台灯「啪」亮起，暖光扩散；黑幕淡出
    tl.to(introOverlay, { autoAlpha: 0, duration: 1.0, ease: "power2.inOut" }, 0);
    tl.fromTo(lampLight, { intensity: 0 }, { intensity: lampLight.intensity, duration: 0.5, ease: "power2.in" }, 0);
    tl.fromTo(ambientLight, { intensity: 0 }, { intensity: ambientLight.intensity, duration: 1.0, ease: "power2.out" }, 0);

    // ② 镜头从桌面一角缓慢推近
    const corner = camFocus
      .clone()
      .addScaledVector(SWAY_RIGHT, camState.radius * 0.55)
      .addScaledVector(WORLD_UP, camState.radius * 0.18);
    gsap.set(camTarget, { x: corner.x, y: corner.y, z: corner.z });
    tl.to(camTarget, { x: camFocus.x, y: camFocus.y, z: camFocus.z, duration: 1.6, ease: "power2.inOut" }, 0.3);
    tl.to(camState, { fit: FIT_IDLE, duration: 1.6, ease: "power2.inOut", onUpdate: updateCamera }, 0.3);

    // ③ 物件逐个「弹簧弹出」落到桌面
    introPopOrder.forEach((id, i) => {
      const item = items.find((x) => x.data.id === id);
      if (!item) return;
      const from = item.basePos.clone().addScaledVector(item.liftVec, -7);
      const proxy = { p: 0 };
      tl.fromTo(
        proxy,
        { p: 0 },
        {
          p: 1,
          duration: 0.9,
          ease: "back.out(1.8)",
          onUpdate: () => item.root.position.lerpVectors(from, item.basePos, proxy.p),
        },
        0.9 + i * 0.13
      );
    });

    await tweenDone(tl);

    // ④ 屏幕亮起（原先投影在屏幕上的「姓名 · 职位」已删除，只留亮屏这一拍）
    if (computer) {
      lightUpScreen(computer);
      await delay(700);
    }

    // ⑤ 提示「拖拽 / 滚动 探索工位」
    if (introHint) await tweenDone(gsap.to(introHint, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }));

    // ⑥ 咖啡热气已随装饰精简删除；⑦ hover 状态机；⑧ 点击 ACTIVE 由事件驱动
    markIntroPlayed();
    ready = true;
    revealChrome();
  }

  function skipIntro(computer: DeskItem | undefined) {
    camState.fit = FIT_IDLE;
    updateCamera();
    if (introOverlay) introOverlay.style.display = "none";
    if (computer) lightUpScreen(computer);
    if (introHint) gsap.set(introHint, { autoAlpha: 1 });
    ready = true;
    revealChrome();
  }

  // ── 加载 room_full.glb（D4：单文件 + mesh 命名 obj_*）──
  const loader = new GLTFLoader();
  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      model.updateWorldMatrix(true, true);

      const box = new THREE.Box3();
      const tmpBox = new THREE.Box3();

      for (const data of deskObjects) {
        const root = model.getObjectByName(data.mesh);
        if (!root) continue; // 模型缺件时静默跳过，不编造占位物

        // 58 个材质里有 10 个被多物件共用，必须克隆，否则 hover 发光会串到别的物件上
        const mats: DeskMat[] = [];
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mesh.material = Array.isArray(mesh.material)
            ? list.map((m) => m.clone())
            : (list[0] as THREE.Material).clone();
          const cloned = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of cloned) {
            const std = m as THREE.MeshStandardMaterial;
            if (!std.emissive) continue;
            mats.push({
              mat: std,
              baseEmissive: std.emissive.clone(),
              baseIntensity: std.emissiveIntensity ?? 1,
            });
          }
        });

        tmpBox.setFromObject(root);
        const size = tmpBox.getSize(new THREE.Vector3());
        const center = tmpBox.getCenter(new THREE.Vector3());
        const liftLen = THREE.MathUtils.clamp(size.y * 0.22, 0.01, 0.12);

        const item: DeskItem = {
          data,
          root,
          mats,
          basePos: root.position.clone(),
          baseScale: root.scale.clone(),
          liftVec: liftInParentSpace(root, liftLen),
          center,
          top: new THREE.Vector3(center.x, tmpBox.max.y, center.z),
          size,
          hover: { t: 0 },
          hotspot: hotspotLayer?.querySelector<HTMLElement>(`.hotspot[data-id="${data.id}"]`) ?? null,
          hotspotAnchor: new THREE.Vector3(center.x, tmpBox.max.y, center.z),
        };
        items.push(item);
        itemRoots.push(root);
        itemByRoot.set(root, item);
        box.union(tmpBox);
      }

      if (items.length === 0) {
        // 模型在位但一个 obj_* 都没匹配上 → 与加载失败同等处理，露出静态菜单
        degradeToFallback();
        if (introOverlay) introOverlay.style.display = "none";
        return;
      }

      // 取景：只框「工位」（6 件可点物件的并集）而非整间房
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      camState.radius = sphere.radius;
      camState.dist = sphere.radius * 6;
      camFocus.copy(sphere.center);
      camTarget.copy(camFocus);
      updateCamera();

      // 热点圆点：吸附在物件正上方一点，位置随场景尺度自适应
      for (const item of items) {
        item.hotspotAnchor.copy(item.top).addScaledVector(WORLD_UP, camState.radius * 0.06);
        bindHotspot(item);
      }
      // 模型里缺件时对应的圆点没有物件可跟，直接摘掉，别在左上角留个孤儿
      hotspotLayer?.querySelectorAll<HTMLElement>(".hotspot").forEach((el) => {
        if (!items.some((i) => i.data.id === el.dataset.id)) el.remove();
      });

      const lamp = items.find((i) => i.data.id === "lamp");
      if (lamp) {
        lampLight.position.copy(lamp.top);
        lampLight.distance = camState.radius * 8;
      }
      // 台灯暖光按 decay=2 的平方衰减定标，随模型尺度自适应，避免过曝/过暗
      lampLight.userData.peak = Math.max(4, camState.radius * camState.radius * 4);
      lampLight.intensity = lampLight.userData.peak;
      applyTheme(theme, false);

      const computer = items.find((i) => i.data.id === "computer");
      if (loadingHint) loadingHint.style.display = "none";

      // 每个会话播一次；带 ?intro 进来强制重播，省得调动效时要手动清标记
      const forceIntro = new URLSearchParams(location.search).has("intro");
      const played = (() => {
        if (forceIntro) return false;
        try {
          return sessionStorage.getItem(INTRO_KEY) === "1";
        } catch {
          return false;
        }
      })();

      if (played || reduceMotion) skipIntro(computer);
      else playIntro(computer);
    },
    (e) => {
      if (!loadingHint) return;
      loadingHint.textContent = e.total
        ? `加载工位模型 ${Math.round((e.loaded / e.total) * 100)}%`
        : `加载工位模型 ${(e.loaded / 1024 / 1024).toFixed(1)} MB`;
    },
    () => {
      // 模型加载失败（离线 / 部署时 glb 未随包发布）→ 露出静态菜单，不白屏
      degradeToFallback();
      if (loadingHint) {
        loadingHint.textContent = "3D 工位加载失败，已切换为静态导航";
        loadingHint.classList.add("is-error");
      }
      if (introOverlay) introOverlay.style.display = "none";
    }
  );

  // ── 帧率自保护（v2 任务 1 可选）：模型就绪后若连续 60 帧都 >50ms（<20fps），带 ?gl=off 重载降级 ──
  let lastFrameMs = performance.now();
  let slowStreak = 0;
  let degraded = false;

  // ── 主循环：鼠标视角摇晃（lerp）+ 手机 touch 拖拽旋转 ──
  function frame() {
    requestAnimationFrame(frame);

    if (ready && !degraded) {
      const now = performance.now();
      const dt = now - lastFrameMs;
      lastFrameMs = now;
      if (dt > 50) {
        slowStreak += 1;
        if (slowStreak >= 60) {
          degraded = true;
          const u = new URL(location.href);
          u.searchParams.set("gl", "off");
          location.replace(u.toString());
          return;
        }
      } else {
        slowStreak = 0;
      }
    }

    if (swayEnabled) {
      sway.x += (swayTo.x - sway.x) * SWAY_EASE;
      sway.y += (swayTo.y - sway.y) * SWAY_EASE;
    }
    const amp = camState.radius * SWAY_AMOUNT;

    // 视线基向量：基础 VIEW_DIR 先绕 WORLD_UP 偏航，再绕右轴俯仰（桌面 orbit 恒为 0，等效原状）
    const dir = VIEW_DIR.clone().applyAxisAngle(WORLD_UP, orbit.yaw);
    const right = new THREE.Vector3().crossVectors(dir, WORLD_UP).normalize();
    dir.applyAxisAngle(right, orbit.pitch);
    const up = new THREE.Vector3().crossVectors(right, dir).normalize();

    camera.position
      .copy(camTarget)
      .addScaledVector(dir, camState.dist)
      .addScaledVector(right, sway.x * amp)
      .addScaledVector(up, sway.y * amp * 0.55);
    camera.up.copy(up);
    camera.lookAt(camTarget);

    // 背景大字朝反方向微移：和前景工位形成视差，读起来才有前后空间
    if (heroType && swayEnabled) {
      heroType.style.transform = `translate3d(${-sway.x * HERO_PARALLAX}px, ${-sway.y * HERO_PARALLAX * 0.6}px, 0)`;
    }

    camera.updateMatrixWorld();

    // 热点圆点跟着物件投影到屏幕（4 个导航物件，开销可忽略）
    if (ready) {
      for (const item of items) {
        if (!item.hotspot) continue;
        const p = projectToScreen(item.hotspotAnchor);
        item.hotspot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      }
    }

    if (easterOpen) {
      const coffee = items.find((i) => i.data.id === "coffee");
      if (coffee) easterAnchor.copy(coffee.top);
      placeEasterPop();
    }

    renderer.render(scene, camera);
  }
  frame();
}
