// 深夜工位 3D 场景（Phase 1 骨架：等距 2.5D + 6 个 P0 物件 + hover 高亮 + 点击跳路由）
import * as THREE from "three";
import { p0Objects, type DeskObject } from "../data/objects";

interface DeskMesh {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  data: DeskObject;
  baseY: number;
}

export function initDesk(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0f1115");

  // 等距 2.5D：正交相机，斜上方俯视
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

  // 光照：暗环境 + 台灯暖光（02 §1）
  scene.add(new THREE.AmbientLight("#3b4556", 1.4));
  const lampLight = new THREE.PointLight("#ffb974", 3, 25, 2);
  lampLight.position.set(2.6, 3.5, -1.2);
  scene.add(lampLight);

  // 桌面
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.4, 5.5),
    new THREE.MeshStandardMaterial({ color: "#1a1d24", roughness: 0.8 })
  );
  desk.position.set(0, -0.7, 0);
  scene.add(desk);

  // P0 物件（Phase 1 用简单几何体占位，后续换 img2three.js 模型）
  const items: DeskMesh[] = [];
  const hoverLabel = document.getElementById("hover-label");

  for (const obj of p0Objects) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(obj.size[0], obj.size[1], obj.size[2]),
      new THREE.MeshStandardMaterial({ color: obj.color, roughness: 0.5, metalness: 0.15 })
    );
    mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
    scene.add(mesh);
    items.push({ mesh, data: obj, baseY: obj.position[1] });
  }

  // hover 状态机（02 §4）：IDLE → HOVER → ACTIVE
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: DeskMesh | null = null;

  function setHover(item: DeskMesh | null) {
    if (hovered) {
      hovered.mesh.position.y = hovered.baseY;
      hovered.mesh.rotation.y = 0;
      hovered.mesh.material.emissive.set("#000000");
    }
    hovered = item;
    if (hovered) {
      hovered.mesh.position.y = hovered.baseY + 0.35; // 浮起
      hovered.mesh.rotation.y = 0.08; // 轻微旋转
      hovered.mesh.material.emissive.set("#00d9ff"); // 发光边缘
    }
  }

  function onPointerMove(e: PointerEvent) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(items.map((i) => i.mesh), false)[0];
    const item = hit ? (items.find((i) => i.mesh === hit.object) ?? null) : null;
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
