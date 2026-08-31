// 02 §3.1 游戏化介绍 —— 4 个展板内容（内容对应 01 §3）
export interface GameBoardData {
  id: string;
  index: number;
  title: string;
  tagline?: string;
  lines: string[];
}

export const gameBoards: GameBoardData[] = [
  {
    id: "who",
    index: 1,
    title: "我是谁",
    tagline: "赵韵婷 · 游戏客户端开发工程师",
    lines: [
      "重度游戏玩家（游戏时长 5800 天，类型全面）转型创造者",
      "具备从玩法设计到功能实现的完整闭环思维",
      "能把设计稿转成可运行代码，对性能与 BUG 有「强迫症式」调试习惯",
    ],
  },
  {
    id: "journey",
    index: 2,
    title: "我的旅程",
    lines: [
      "5 岁 · 执柄 — 第一次握起手柄",
      "战双 · 动作游戏深度玩家",
      "2023 · 辽宁大学 · 测控技术与仪器",
      "现在 · 深耕游戏客户端开发方向",
    ],
  },
  {
    id: "core",
    index: 3,
    title: "核心竞争力",
    lines: [
      "性能优化 · 对象池 / GC 优化（35 → 60FPS，内存 −18%）",
      "架构 · 泛型状态机 / 组件化 / 事件驱动解耦",
      "数据驱动 · ScriptableObject / CSV 序列化与文件 I/O",
      "工程 · Git 协作 / Code Review / 任务拆分与带新人",
    ],
  },
  {
    id: "education",
    index: 4,
    title: "教育背景",
    tagline: "辽宁大学（本科）· 测控技术与仪器 · 2023.09 – 至今",
    lines: ["C 语言程序设计 · MATLAB 科学计算与仿真", "工程数学 · 嵌入式系统 · 虚拟仪器设计与应用", "英语 CET-4 / CET-6"],
  },
];

// 横版世界配置
export const WORLD_WIDTH = 2600;
export const BOARD_X_START = 600;
export const BOARD_GAP = 650;
export const PLAYER_START_X = 200;
export const TRIGGER_RANGE = 170;
