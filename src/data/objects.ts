// 02 §2 工位物件 → 路由 映射表（P0 优先，Phase 1 先做 6 个核心物件）
export interface DeskObject {
  id: string;
  title: string; // hover 标题
  route: string; // 点击跳转路由
  position: [number, number, number]; // 等距桌面坐标
  color: string;
  geometry: "box" | "monitor" | "gamepad" | "lamp" | "folder" | "notebook" | "coffee";
  size: [number, number, number];
}

// 02 §2.1 P0（必须有）
export const p0Objects: DeskObject[] = [
  {
    id: "monitor",
    title: "显示器 · 首页",
    route: "/",
    position: [0, 0, -1.6],
    color: "#2a2f3a",
    geometry: "monitor",
    size: [2.2, 1.4, 0.3],
  },
  {
    id: "gamepad",
    title: "游戏手柄 · 关于我",
    route: "/about",
    position: [2.6, 0, 1.2],
    color: "#a855f7",
    geometry: "gamepad",
    size: [1.4, 0.5, 0.8],
  },
  {
    id: "desktop",
    title: "电脑桌面 · 作品 / 博客",
    route: "/works",
    position: [0.2, 0, 1.7],
    color: "#00d9ff",
    geometry: "box",
    size: [0.6, 0.9, 0.5],
  },
  {
    id: "folder",
    title: "纸质文件夹 · 获奖证书",
    route: "/awards",
    position: [-2.4, 0, 0.8],
    color: "#ffb974",
    geometry: "folder",
    size: [1.2, 0.8, 0.2],
  },
  {
    id: "notebook",
    title: "本子 · 联系我",
    route: "/contact",
    position: [-1.1, 0, 2.1],
    color: "#e2e8f0",
    geometry: "notebook",
    size: [1.0, 1.3, 0.15],
  },
  {
    id: "lamp",
    title: "台灯 · 主题切换",
    route: "theme", // 特殊：切换主题，不跳路由
    position: [2.6, 0, -1.2],
    color: "#ffb974",
    geometry: "lamp",
    size: [0.6, 1.4, 0.6],
  },
];

// 02 §2.1 P1（第二版增强；Phase 2 先放咖啡杯做开场 idle 热气）
export const p1Objects: DeskObject[] = [
  {
    id: "coffee",
    title: "咖啡 · 彩蛋",
    route: "coffee", // 特殊：Phase 6 彩蛋（热气加速弹邮箱/微信）
    position: [-1.8, 0, -1.4],
    color: "#5b3a29",
    geometry: "coffee",
    size: [0.5, 0.4, 0.5],
  },
];
