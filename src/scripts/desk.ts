// 深夜工位 3D 场景
// Phase 1：等距 2.5D 工位 + 6 物件导航；Phase 2：开场剧本 + Hover 统一状态机
// 02 §1.1 开场 ①-⑧：台灯亮 → 镜头推近 → 物件弹簧弹出 → 显示器打字机 → 提示 → 咖啡 idle
import * as THREE from "three";
import { gsap } from "gsap";
import { p0Objects, p1Objects, type DeskObject } from "../data/objects";
import { profile } from "../data/profile";

interface DeskItem {
  group: THREE.Group;
  meshes: THREE.Mesh[];
  data: DeskObject;
  baseY: number;
}

const HOVER_LIFT = 0.35; // hover 浮起
const HOVER_TILT = 0.08; // hover 旋转
const INTRO_KEY = "lszbf:intro:played";

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
      // 底座 + 屏幕（屏幕初始熄灭，④ 亮起）
      const stand = add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.2, d * 1.4), mat("#1a1d24")));
      stand.position.y = h * 0.1;
      const screen = add(new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.75, d), mat("#0e141a")));
      screen.position.y = h * 0.2 + h * 0.375;
      group.userData.screen = screen; // 供 ④ 亮起 + 打字机投影
      break;
    }
    case "gamepad": {
      // 平躺胶囊，长轴沿 X
      const cap = add(new THREE.Mesh(new THREE.CapsuleGeometry(h / 2, w - h, 4, 12), mat(c)));
      cap.rotation.z = Math.PI / 2;
      cap.position.y = h / 2;
      break;
    }
    case "lamp": {
      // 底座 + 灯臂 + 灯头（灯头自带暖光 emissive）
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
      // 杯身 + 杯把 + 液面 + 热气（热气为 MeshBasicMaterial，不参与 hover 发光）
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

export function initDesk(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0f1115");

  // 等距 2.5D：正交相机，可变 frustumSize 实现「镜头推近」
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

  // 光照（02 §1）：暗环境光 + 台灯暖光
  const ambientLight = new THREE.AmbientLight("#3b4556", 1.4);
  scene.add(ambientLight);
  const lampLight = new THREE.PointLight("#ffb974", 4, 30, 2);
  scene.add(lampLight);

  // 地面（承接暖光光晕）
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: "#0f1115", roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.6;
  scene.add(floor);

  // 桌面（顶面 y=0，物件坐于其上）
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.3, 5.5),
    new THREE.MeshStandardMaterial({ color: "#1a1d24", roughness: 0.85 })
  );
  desk.position.y = -0.15;
  scene.add(desk);

  // P0 + P1 物件（数据来自 src/data/objects.ts）
  const items: DeskItem[] = [];
  for (const obj of [...p0Objects, ...p1Objects]) {
    const { group, meshes } = buildObject(obj);
    group.position.set(obj.position[0], obj.position[1], obj.position[2]);
    scene.add(group);
    items.push({ group, meshes, data: obj, baseY: obj.position[1] });
  }

  // 台灯暖光跟随灯头
  const lamp = p0Objects.find((o) => o.id === "lamp");
  if (lamp) lampLight.position.set(lamp.position[0], lamp.position[1] + lamp.size[1], lamp.position[2]);

  // 咖啡热气
  const coffeeItem = items.find((i) => i.data.id === "coffee");
  const steam = (coffeeItem?.group.userData.steam as THREE.Mesh[] | undefined) ?? [];
  const steamBase = (coffeeItem?.group.userData.steamBase as number) ?? 0.4;

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
        // 标题打字机
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
    if (r === "theme") console.log("[desk] 台灯主题切换（Phase 6 实现）");
    else if (r === "coffee") console.log("[desk] 咖啡彩蛋（Phase 6 实现）");
    else window.location.href = r;
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
    const popIds = ["monitor", "gamepad", "desktop", "folder", "notebook", "coffee"];
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
    // 已播过：直接呈现静态工位
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
    // ⑥ 咖啡热气循环飘动（idle）
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
}
