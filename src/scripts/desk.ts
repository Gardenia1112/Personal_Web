// 深夜工位 3D 场景
// Phase 1-2：等距 2.5D 工位 + 开场剧本 + Hover 统一状态机
// Phase 5-6：键盘技能矩阵 / 台灯主题切换 / 彩蛋（咖啡/耳机/贴纸）/ 性能 HUD / 移动端降级
import * as THREE from "three";
import { gsap } from "gsap";
import { p0Objects, p1Objects, p2Objects, type DeskObject } from "../data/objects";
import { profile } from "../data/profile";
import { navigateWithTransition } from "./transition";

interface DeskItem {
  group: THREE.Group;
  meshes: THREE.Mesh[];
  data: DeskObject;
  baseY: number;
}

const HOVER_LIFT = 0.35; // hover 浮起
const HOVER_TILT = 0.08; // hover 旋转
const INTRO_KEY = "lszbf:intro:played";
const THEME_KEY = "lszbf:theme";

const CAM_START = new THREE.Vector3(13, 13, 13); // 开场远机位
const CAM_END = new THREE.Vector3(9, 9, 9); // 定机位
const FRUSTUM_START = 19; // 开场视角（更广）
const FRUSTUM_END = 12; // 定视角

const SCREEN_ON = { r: 0.16, g: 0.38, b: 0.5 }; // 显示器亮起后的屏幕色

function mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.15, ...opts });
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// gsap tween/timeline → Promise（避免依赖 thenable 类型）
function tweenDone(t: { eventCallback(type: string, callback: () => void): void }): Promise<void> {
  return new Promise((r) => t.eventCallback("onComplete", r));
}

// 打字机（isCancelled 用于 hover 标题快速切换时中断旧任务）
function typewriter(el: HTMLElement, text: string, speed: number, isCancelled?: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    el.textContent = "";
    let i = 0;
    const tick = () => {
      if (isCancelled && isCancelled()) return resolve();
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    };
    tick();
  });
}

// 占位几何体（立方体/胶囊），按 obj.geometry 区分；后续换 img2three.js 模型
function buildObject(obj: DeskObject): { group: THREE.Group; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  const meshes: THREE.Mesh[] = [];
  const [w, h, d] = obj.size;
  const c = obj.color;

  const add = (m: THREE.Mesh) => {
    m.userData.baseEmissive = "#" + (m.material as THREE.MeshStandardMaterial).emissive.getHexString();
    meshes.push(m);
    group.add(m);
    return m;
  };

  switch (obj.geometry) {
    case "monitor": {
      const stand = add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.2, d * 1.4), mat("#1a1d24")));
      stand.position.y = h * 0.1;
      const screen = add(new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.75, d), mat("#0e141a")));
      screen.position.y = h * 0.2 + h * 0.375;
      group.userData.screen = screen;
      break;
    }
    case "gamepad": {
      const cap = add(new THREE.Mesh(new THREE.CapsuleGeometry(h / 2, w - h, 4, 12), mat(c)));
      cap.rotation.z = Math.PI / 2;
      cap.position.y = h / 2;
      break;
    }
    case "lamp": {
      const base = add(new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.1, d), mat("#3a3f4a")));
      base.position.y = h * 0.05;
      const arm = add(new THREE.Mesh(new THREE.CapsuleGeometry(w * 0.25, h * 0.55, 4, 12), mat(c)));
      arm.position.y = h * 0.1 + h * 0.3;
      const head = add(
        new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, h * 0.2, d * 0.8), mat(c, { emissive: c, emissiveIntensity: 0.9 }))
      );
      head.position.y = h * 0.85;
      break;
    }
    case "coffee": {
      const cup = add(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.5, w * 0.42, h, 24), mat(c)));
      cup.position.y = h / 2;
      const handle = add(new THREE.Mesh(new THREE.TorusGeometry(w * 0.32, w * 0.08, 8, 16), mat(c)));
      handle.position.set(w * 0.5, h / 2, 0);
      const top = add(new THREE.Mesh(new THREE.CircleGeometry(w * 0.46, 24), mat("#2b1a12")));
      top.rotation.x = -Math.PI / 2;
      top.position.y = h * 0.98;
      const steam: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 8, 8),
          new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.4 })
        );
        s.userData.phase = i / 3;
        steam.push(s);
        group.add(s);
      }
      group.userData.steam = steam;
      group.userData.steamBase = h * 0.98;
      break;
    }
    case "keyboard": {
      // 机身 + 两排键帽
      const body = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)));
      body.position.y = h / 2;
      const keyMat = mat("#cbd5e1");
      for (let r = 0; r < 2; r++) {
        for (let k = 0; k < 7; k++) {
          const key = add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.09, h * 0.7, d * 0.07), keyMat));
          key.position.set(-w * 0.4 + k * (w * 0.13), h + h * 0.35, -d * 0.28 + r * (d * 0.56));
        }
      }
      break;
    }
    case "headphones": {
      // 半圆头梁 + 两个耳罩
      const band = add(new THREE.Mesh(new THREE.TorusGeometry(w * 0.42, h * 0.07, 8, 20, Math.PI), mat(c)));
      band.position.y = h * 0.62;
      const cupL = add(new THREE.Mesh(new THREE.CylinderGeometry(h * 0.22, h * 0.22, h * 0.28, 20), mat("#2a2f3a")));
      cupL.rotation.z = Math.PI / 2;
      cupL.position.set(-w * 0.42, h * 0.62, 0);
      const cupR = add(new THREE.Mesh(new THREE.CylinderGeometry(h * 0.22, h * 0.22, h * 0.28, 20), mat("#2a2f3a")));
      cupR.rotation.z = Math.PI / 2;
      cupR.position.set(w * 0.42, h * 0.62, 0);
      break;
    }
    case "sticker": {
      // 平贴桌面的发光贴纸 + 中心 Logo 色块
      const card = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, { emissive: c, emissiveIntensity: 0.5 })));
      card.position.y = h / 2 + 0.02;
      const mark = add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, h * 0.5, d * 1.2), mat("#a855f7")));
      mark.position.y = h / 2 + h * 0.5 + 0.02;
      break;
    }
    case "desktop":
    case "folder":
    case "notebook":
    case "box":
    default: {
      const box = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)));
      box.position.y = h / 2;
      break;
    }
  }

  group.userData.deskId = obj.id;
  return { group, meshes };
}

// ── 性能 HUD：流浪尸潮 35→60FPS / 内存 −18%（02 §9 场景可视化）──
function buildPerfHud(): HTMLElement {
  const el = document.createElement("div");
  el.className = "perf-hud";
  el.innerHTML = `
    <a class="perf-hud-link" href="/works/wandering-corpse-tide">
      <div class="perf-hud-head">
        <span class="perf-hud-title">流浪尸潮</span>
        <span class="perf-hud-tag">性能优化</span>
      </div>
      <div class="perf-row"><span class="perf-label">平均帧率</span><span class="perf-val">35 → 60 FPS</span></div>
      <div class="perf-bar"><i style="width:71%"></i></div>
      <div class="perf-row"><span class="perf-label">内存峰值</span><span class="perf-val">−18%</span></div>
      <div class="perf-bar"><i style="width:82%"></i></div>
    </a>
  `;
  document.body.appendChild(el);
  return el;
}

// ── 技能矩阵覆盖层（键盘点击 → 按键打散成技能标签）──
function buildSkillsOverlay(): HTMLElement {
  const el = document.createElement("div");
  el.className = "skills-overlay";
  el.innerHTML = `
    <div class="skills-panel">
      <button class="skills-close" aria-label="关闭">✕</button>
      <div class="skills-head">
        <span class="skills-index">⌨️</span>
        <div>
          <h2 class="skills-title">Skills 技能矩阵</h2>
          <p class="skills-sub">按键打散成技能标签</p>
        </div>
      </div>
      <div class="skills-grid"></div>
    </div>
  `;
  const grid = el.querySelector<HTMLElement>(".skills-grid")!;
  for (const s of profile.skills) {
    const sec = document.createElement("div");
    sec.className = "skills-cat";
    sec.innerHTML = `<h3 class="skills-cat-title">${s.category}</h3><div class="skills-tags"></div>`;
    const tags = sec.querySelector<HTMLElement>(".skills-tags")!;
    for (const t of s.tags) {
      const chip = document.createElement("span");
      chip.className = "skills-chip";
      chip.textContent = t;
      tags.appendChild(chip);
    }
    grid.appendChild(sec);
  }
  document.body.appendChild(el);
  return el;
}

function openSkills(overlay: HTMLElement) {
  overlay.classList.add("open");
  const chips = overlay.querySelectorAll<HTMLElement>(".skills-chip");
  gsap.fromTo(
    chips,
    {
      x: () => gsap.utils.random(-140, 140),
      y: () => gsap.utils.random(-90, 90),
      opacity: 0,
      scale: 0.4,
    },
    { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.025, ease: "back.out(1.7)" }
  );
}

function closeSkills(overlay: HTMLElement) {
  overlay.classList.remove("open");
}

// ── 彩蛋弹窗（咖啡 / 耳机 / 贴纸）──
const EASTER: Record<string, { icon: string; title: string; body: string; fields: [string, string][] }> = {
  coffee: {
    icon: "☕",
    title: "咖啡彩蛋",
    body: "来都来了，加个好友再走。",
    fields: [
      ["邮箱", profile.email],
      ["微信", profile.wechat],
    ],
  },
  headphones: {
    icon: "🎧",
    title: "耳机彩蛋",
    body: "深夜工位 BGM：键盘敲击 × 咖啡蒸汽 × 显示器电流声。",
    fields: [],
  },
  sticker: {
    icon: "🎨",
    title: "Logo 贴纸",
    body: "个人 Logo「lszbf」—— 像素风 + 霓虹描边。",
    fields: [
      ["GitHub", profile.github],
      ["网站", profile.website],
    ],
  },
};

function buildEasterPopup(): HTMLElement {
  const el = document.createElement("div");
  el.className = "easter-pop";
  document.body.appendChild(el);
  return el;
}

function showEaster(pop: HTMLElement, type: string) {
  const data = EASTER[type];
  if (!data) return;
  pop.innerHTML = `
    <button class="easter-close" aria-label="关闭">✕</button>
    <div class="easter-icon">${data.icon}</div>
    <h3 class="easter-title">${data.title}</h3>
    <p class="easter-body">${data.body}</p>
    ${data.fields
      .map(([k, v]) =>
        v.startsWith("http")
          ? `<div class="easter-field"><span>${k}</span><a class="easter-link" href="${v}" target="_blank" rel="noopener">${v}</a></div>`
          : `<div class="easter-field"><span>${k}</span><code>${v}</code><button class="easter-copy" data-copy="${v}">复制</button></div>`
      )
      .join("")}
  `;
  pop.querySelector<HTMLElement>(".easter-close")!.addEventListener("click", () => pop.classList.remove("show"));
  pop.querySelectorAll<HTMLElement>(".easter-copy").forEach((b) => {
    b.addEventListener("click", () => {
      const v = b.dataset.copy!;
      navigator.clipboard?.writeText(v);
      b.textContent = "已复制 ✓";
      setTimeout(() => (b.textContent = "复制"), 1200);
    });
  });
  pop.classList.add("show");
}

export function initDesk(container: HTMLElement) {
  // 移动端降级：粗指针 / 窄屏 → 不初始化 3D，由 .mobile-fallback 静态菜单兜底
  if (window.matchMedia("(pointer: coarse)").matches || container.clientWidth < 768) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0f1115");

  let frustumSize = FRUSTUM_START;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.copy(CAM_START);
  camera.lookAt(0, 0, 0);

  function updateCamera() {
    const a = container.clientWidth / container.clientHeight || 1;
    camera.left = (frustumSize * a) / -2;
    camera.right = (frustumSize * a) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
  }
  updateCamera();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight("#3b4556", 1.4);
  scene.add(ambientLight);
  const lampLight = new THREE.PointLight("#ffb974", 4, 30, 2);
  scene.add(lampLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: "#0f1115", roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.6;
  scene.add(floor);

  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.3, 5.5),
    new THREE.MeshStandardMaterial({ color: "#1a1d24", roughness: 0.85 })
  );
  desk.position.y = -0.15;
  scene.add(desk);

  // P0 + P1 + P2 物件（数据来自 src/data/objects.ts）
  const items: DeskItem[] = [];
  for (const obj of [...p0Objects, ...p1Objects, ...p2Objects]) {
    const { group, meshes } = buildObject(obj);
    group.position.set(obj.position[0], obj.position[1], obj.position[2]);
    scene.add(group);
    items.push({ group, meshes, data: obj, baseY: obj.position[1] });
  }

  const lamp = p0Objects.find((o) => o.id === "lamp");
  if (lamp) lampLight.position.set(lamp.position[0], lamp.position[1] + lamp.size[1], lamp.position[2]);

  const coffeeItem = items.find((i) => i.data.id === "coffee");
  const steam = (coffeeItem?.group.userData.steam as THREE.Mesh[] | undefined) ?? [];
  const steamBase = (coffeeItem?.group.userData.steamBase as number) ?? 0.4;

  // ── 台灯主题切换（02 §2 物件 #6）──
  let theme: "dark" | "light" = (() => {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  })();

  function applyTheme(mode: "dark" | "light") {
    theme = mode;
    document.documentElement.dataset.theme = mode;
    if (mode === "light") {
      scene.background = new THREE.Color("#dfe6ee");
      ambientLight.color.set("#ffffff");
      ambientLight.intensity = 1.1;
      lampLight.intensity = 0.7;
      floor.material.color.set("#cfd8e3");
      desk.material.color.set("#b7c2d0");
    } else {
      scene.background = new THREE.Color("#0f1115");
      ambientLight.color.set("#3b4556");
      ambientLight.intensity = 1.4;
      lampLight.intensity = 4;
      floor.material.color.set("#0f1115");
      desk.material.color.set("#1a1d24");
    }
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* ignore */
    }
  }
  applyTheme(theme);

  // ── DOM 层（性能 HUD / 技能矩阵 / 彩蛋弹窗）──
  const perfHud = buildPerfHud();
  const skillsOverlay = buildSkillsOverlay();
  const easterPop = buildEasterPopup();
  skillsOverlay.querySelector<HTMLElement>(".skills-close")!.addEventListener("click", () => closeSkills(skillsOverlay));
  skillsOverlay.addEventListener("click", (e) => {
    if (e.target === skillsOverlay) closeSkills(skillsOverlay);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSkills(skillsOverlay);
      easterPop.classList.remove("show");
    }
  });

  // 02 §4 状态机：IDLE → HOVER → ACTIVE
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoverLabel = document.getElementById("hover-label");
  let hovered: DeskItem | null = null;
  let typeToken = 0;
  let ready = false;

  function pickItem(hit: THREE.Intersection | undefined): DeskItem | null {
    if (!hit) return null;
    let o: THREE.Object3D | null = hit.object;
    while (o) {
      if (o.userData.deskId) return items.find((i) => i.data.id === o.userData.deskId) ?? null;
      o = o.parent;
    }
    return null;
  }

  function setHover(item: DeskItem | null) {
    if (hovered) {
      hovered.group.position.y = hovered.baseY;
      hovered.group.rotation.y = 0;
      for (const m of hovered.meshes) {
        const matr = m.material as THREE.MeshStandardMaterial;
        if (matr.emissive) matr.emissive.set(m.userData.baseEmissive);
      }
    }
    hovered = item;
    if (hovered) {
      hovered.group.position.y = hovered.baseY + HOVER_LIFT;
      hovered.group.rotation.y = HOVER_TILT;
      for (const m of hovered.meshes) {
        const matr = m.material as THREE.MeshStandardMaterial;
        if (matr.emissive) matr.emissive.set("#00d9ff");
      }
    }
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const item = pickItem(raycaster.intersectObjects(items.map((i) => i.group), true)[0]);
    const changed = item?.data.id !== hovered?.data.id;
    setHover(item);

    if (item && hoverLabel) {
      hoverLabel.style.left = `${e.clientX}px`;
      hoverLabel.style.top = `${e.clientY}px`;
      if (changed) {
        hoverLabel.classList.add("visible");
        const token = ++typeToken;
        typewriter(hoverLabel, item.data.title, 28, () => token !== typeToken);
      }
    } else if (hoverLabel) {
      hoverLabel.classList.remove("visible");
      typeToken++;
    }
    container.style.cursor = item ? "pointer" : "default";
  }

  function onClick() {
    if (!ready || !hovered) return;
    const r = hovered.data.route;
    if (r === "theme") {
      applyTheme(theme === "dark" ? "light" : "dark");
    } else if (r === "skills") {
      openSkills(skillsOverlay);
    } else if (r === "coffee") {
      showEaster(easterPop, "coffee");
    } else if (r === "headphones") {
      showEaster(easterPop, "headphones");
    } else if (r === "sticker") {
      showEaster(easterPop, "sticker");
    } else {
      navigateWithTransition(r);
    }
  }

  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("click", onClick);

  // 开场剧本（02 §1.1）
  const introOverlay = document.getElementById("intro-overlay");
  const screenText = document.getElementById("screen-text");
  const introHint = document.getElementById("intro-hint");
  const played = (() => {
    try {
      return localStorage.getItem(INTRO_KEY) === "1";
    } catch {
      return false;
    }
  })();

  function projectToScreen(obj: THREE.Object3D) {
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    v.project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * container.clientWidth,
      y: (-v.y * 0.5 + 0.5) * container.clientHeight,
    };
  }

  async function playIntro() {
    const tl = gsap.timeline();

    // ① 台灯「啪」亮 + 黑屏淡出
    tl.to(introOverlay, { autoAlpha: 0, duration: 1.0, ease: "power2.inOut" }, 0);
    tl.fromTo(lampLight, { intensity: 0 }, { intensity: 4, duration: 0.5, ease: "power2.in" }, 0);
    tl.fromTo(ambientLight, { intensity: 0 }, { intensity: 1.4, duration: 1.0, ease: "power2.out" }, 0);

    // ② 镜头从桌面一角缓慢推近
    tl.to(camera.position, { x: CAM_END.x, y: CAM_END.y, z: CAM_END.z, duration: 1.6, ease: "power2.inOut" }, 0.3);
    const zoomProxy = { v: frustumSize };
    tl.to(
      zoomProxy,
      {
        v: FRUSTUM_END,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          frustumSize = zoomProxy.v;
          updateCamera();
        },
      },
      0.3
    );

    // ③ 物件逐个弹簧弹出
    const popIds = ["monitor", "gamepad", "desktop", "folder", "notebook", "coffee", "keyboard", "headphones", "sticker"];
    popIds.forEach((id, i) => {
      const item = items.find((x) => x.data.id === id);
      if (!item) return;
      const t = 0.9 + i * 0.13;
      tl.fromTo(item.group.position, { y: item.baseY - 3.2 }, { y: item.baseY, duration: 0.9, ease: "back.out(1.8)" }, t);
      tl.fromTo(item.group.scale, { x: 0.5, y: 0.5, z: 0.5 }, { x: 1, y: 1, z: 1, duration: 0.45, ease: "power2.out" }, t);
    });

    await tweenDone(tl);

    // ④ 显示器亮起 + 打字机打出名字 + 定位
    const monitor = items.find((x) => x.data.id === "monitor");
    const screen = monitor?.group.userData.screen as THREE.Mesh | undefined;
    if (screen) {
      gsap.to(screen.material.color, { ...SCREEN_ON, duration: 0.6, ease: "power2.out" });
      if (screenText) {
        const p = projectToScreen(screen);
        screenText.style.left = `${p.x}px`;
        screenText.style.top = `${p.y}px`;
        gsap.set(screenText, { autoAlpha: 1 });
        await typewriter(screenText, `${profile.name} · ${profile.jobTitle}`, 55);
        await delay(300);
      }
    }

    // ⑤ 提示「拖拽 / 滚动 探索工位」
    if (introHint) await tweenDone(gsap.to(introHint, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }));

    ready = true;
  }

  if (played) {
    camera.position.copy(CAM_END);
    frustumSize = FRUSTUM_END;
    updateCamera();
    if (introOverlay) introOverlay.style.display = "none";
    const monitor = items.find((x) => x.data.id === "monitor");
    const screen = monitor?.group.userData.screen as THREE.Mesh | undefined;
    if (screen && screenText) {
      screen.material.color.setRGB(SCREEN_ON.r, SCREEN_ON.g, SCREEN_ON.b);
      const p = projectToScreen(screen);
      screenText.style.left = `${p.x}px`;
      screenText.style.top = `${p.y}px`;
      screenText.textContent = `${profile.name} · ${profile.jobTitle}`;
      gsap.set(screenText, { autoAlpha: 1 });
    }
    if (introHint) gsap.set(introHint, { autoAlpha: 1 });
    ready = true;
  } else {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
    playIntro();
  }

  function animate() {
    requestAnimationFrame(animate);
    camera.lookAt(0, 0, 0);
    const t = performance.now() / 1000;
    for (const s of steam) {
      const ph = (t * 0.4 + (s.userData.phase as number)) % 1;
      s.position.y = steamBase + ph * 0.7;
      s.position.x = Math.sin(t * 1.5 + (s.userData.phase as number) * 6.28) * 0.05;
      s.scale.setScalar(1 + ph * 0.8);
      (s.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - ph);
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    updateCamera();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 引用 perfHud 避免未使用告警（HUD 为纯静态 DOM，无需交互）
  void perfHud;
}
