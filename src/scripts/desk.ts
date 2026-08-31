// 深夜工位 3D 场景（Phase 1 骨架）
// 02 §1 等距 2.5D 工位 + 台灯暖光；02 §4 物件状态机 IDLE → HOVER → ACTIVE
import * as THREE from "three";
import { p0Objects, type DeskObject } from "../data/objects";

interface DeskItem {
  group: THREE.Group;
  meshes: THREE.Mesh[];
  data: DeskObject;
  baseY: number; // 静止时 group 的 Y（物件底贴桌面 y=0）
}

const HOVER_LIFT = 0.35; // hover 浮起高度
const HOVER_TILT = 0.08; // hover 轻微旋转

function mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.15, ...opts });
}

// 用简单几何体（立方体/胶囊）占位，按 obj.geometry 区分形态；后续换 img2three.js 模型
function buildObject(obj: DeskObject): { group: THREE.Group; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  const meshes: THREE.Mesh[] = [];
  const [w, h, d] = obj.size;
  const c = obj.color;

  const add = (m: THREE.Mesh) => {
    m.userData.deskId = obj.id;
    // 记录默认自发光色，hover 时统一高亮、离开时还原（台灯灯头自带暖光）
    m.userData.baseEmissive = "#" + (m.material as THREE.MeshStandardMaterial).emissive.getHexString();
    meshes.push(m);
    group.add(m);
    return m;
  };

  switch (obj.geometry) {
    case "monitor": {
      // 屏幕 + 底座
      const stand = add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.2, d * 1.4), mat("#1a1d24")));
      stand.position.y = h * 0.1;
      const screen = add(new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.75, d), mat(c)));
      screen.position.y = h * 0.2 + h * 0.375;
      break;
    }
    case "gamepad": {
      // 平躺胶囊，长轴沿 X（手柄）
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
    case "folder":
    case "notebook":
    case "box":
    default: {
      const box = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)));
      box.position.y = h / 2;
      break;
    }
  }

  return { group, meshes };
}

export function initDesk(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0f1115");

  // 等距 2.5D：正交相机斜上方俯视
  const frustumSize = 12;
  const aspect = container.clientWidth / container.clientHeight || 1;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    100
  );
  camera.position.set(9, 9, 9);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  // 光照（02 §1）：暗环境光 + 台灯暖光
  scene.add(new THREE.AmbientLight("#3b4556", 1.4));
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

  // 桌面（顶面在 y=0，物件坐于其上）
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.3, 5.5),
    new THREE.MeshStandardMaterial({ color: "#1a1d24", roughness: 0.85 })
  );
  desk.position.y = -0.15;
  scene.add(desk);

  // P0 物件（数据来自 src/data/objects.ts）
  const items: DeskItem[] = [];
  for (const obj of p0Objects) {
    const { group, meshes } = buildObject(obj);
    group.position.set(obj.position[0], obj.position[1], obj.position[2]);
    scene.add(group);
    items.push({ group, meshes, data: obj, baseY: obj.position[1] });
  }

  // 台灯暖光跟随灯头位置
  const lamp = p0Objects.find((o) => o.id === "lamp");
  if (lamp) {
    lampLight.position.set(lamp.position[0], lamp.position[1] + lamp.size[1], lamp.position[2]);
  }

  // 02 §4 状态机：IDLE → HOVER → ACTIVE
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoverLabel = document.getElementById("hover-label");
  let hovered: DeskItem | null = null;

  function setHover(item: DeskItem | null) {
    if (hovered) {
      hovered.group.position.y = hovered.baseY;
      hovered.group.rotation.y = 0;
      for (const m of hovered.meshes) {
        (m.material as THREE.MeshStandardMaterial).emissive.set(m.userData.baseEmissive);
      }
    }
    hovered = item;
    if (hovered) {
      hovered.group.position.y = hovered.baseY + HOVER_LIFT;
      hovered.group.rotation.y = HOVER_TILT;
      for (const m of hovered.meshes) {
        (m.material as THREE.MeshStandardMaterial).emissive.set("#00d9ff");
      }
    }
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(items.map((i) => i.group), true)[0];
    const item = hit ? items.find((i) => i.data.id === hit.object.userData.deskId) ?? null : null;
    setHover(item);

    if (item && hoverLabel) {
      hoverLabel.textContent = item.data.title;
      hoverLabel.style.left = `${e.clientX}px`;
      hoverLabel.style.top = `${e.clientY}px`;
      hoverLabel.classList.add("visible");
    } else if (hoverLabel) {
      hoverLabel.classList.remove("visible");
    }
    container.style.cursor = item ? "pointer" : "default";
  }

  function onClick() {
    if (!hovered) return;
    if (hovered.data.route === "theme") {
      // 台灯主题切换：Phase 6 实现
      console.log("[desk] 台灯主题切换（Phase 6 实现）");
    } else {
      window.location.href = hovered.data.route;
    }
  }

  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("click", onClick);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const a = container.clientWidth / container.clientHeight || 1;
    camera.left = (frustumSize * a) / -2;
    camera.right = (frustumSize * a) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
