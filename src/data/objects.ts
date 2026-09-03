// 02 §2 工位物件 → 路由 映射表
// mesh 字段对应 public/models/room_full.glb 里的节点名（手册 §2.1 命名规范 obj_*）
// ⚠️ 02 §2 里的 显示器 / 键盘 / 耳机 / 贴纸 四件在模型中没有对应 obj_ 节点，按用户决策已下线
export interface DeskObject {
  id: string;
  mesh: string; // room_full.glb 节点名，Raycaster 命中后据此找动作
  title: string; // hover 标题（打字机）
  route: string; // 点击跳转路由；特殊值 theme（切昼夜）/ coffee（彩蛋）
}

export const deskObjects: DeskObject[] = [
  {
    id: "computer",
    mesh: "obj_computer",
    title: "电脑 · 桌面系统",
    route: "/desktop",
  },
  {
    id: "gamepad",
    mesh: "obj_gamepad",
    title: "游戏手柄 · 关于我",
    route: "/about",
  },
  {
    id: "filepile",
    mesh: "obj_filepile",
    title: "文件堆 · 获奖证书",
    route: "/awards",
  },
  {
    id: "notebook",
    mesh: "obj_notebook",
    title: "日记本 · 联系我",
    route: "/contact",
  },
  {
    id: "lamp",
    mesh: "obj_lamp",
    title: "台灯 · 昼夜切换",
    route: "theme",
  },
  {
    id: "coffee",
    mesh: "obj_coffee",
    title: "咖啡杯 · 彩蛋",
    route: "coffee",
  },
];

/** 开场剧本 ③「物件逐个弹出」的顺序（02 §1.1） */
export const introPopOrder = ["computer", "gamepad", "filepile", "notebook", "lamp", "coffee"];
