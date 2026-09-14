// 02 §3.1 游戏化介绍 —— 展板内容（内容对应 01 §3）
// 第 4 块「技能与教育」由 profile.ts 的结构化数据拼装，避免技能/教育双份维护
import { profile } from "./profile";

export interface GameBoardData {
  id: string;
  index: number;
  title: string;
  kicker: string;
  tagline?: string;
  cover: string;
  gallery?: string[];
  reel?: string[];
  lines: string[];
  subtitle?: string;
  scrollTexts?: string[];
  cta?: { label: string; href: string };
  resume?: { title: string; items: string[] }[];
}

// 第 4 块展板：把「教育背景 / 专业技能 / 工作方法」做成可滚动简历卡
const resumeBoard: GameBoardData = {
  id: "resume",
  index: 4,
  title: "技能与教育",
  kicker: "STATS",
  tagline: `求职意向 · ${profile.jobIntention}`,
  cover: "/assets/about/now-fsm.png",
  lines: [],
  resume: [
    {
      title: "教育背景",
      items: [
        `${profile.education_detail.school} · ${profile.education_detail.major} · ${profile.education_detail.period}`,
        `课程：${profile.education_detail.courses.join(" / ")}`,
      ],
    },
    ...profile.skills.map((s) => ({ title: s.category, items: [s.items] })),
    {
      title: "工作方法",
      items: [profile.intro.habit, profile.intro.method, profile.intro.goal],
    },
  ],
};

export const gameBoards: GameBoardData[] = [
  {
    id: "start",
    index: 1,
    title: "一切从那个方块世界开始",
    kicker: "START",
    cover: "/assets/about/chapter-start.png",
    gallery: [
      "/assets/about/chapter-start.png",
      "/assets/about/start-mine.png",
      "/assets/about/start-blender.jpg",
      "/assets/about/start-play.png",
    ],
    lines: [
      "我玩的第一个游戏是《我的世界》——盖出第一栋房子后，我开始好奇「游戏是怎么做出来的」。",
      "为了读懂英文教程，我硬着头皮学英语、写下第一行 Java 脚本，也第一次意识到：比起玩，我更想造。",
    ],
  },
  {
    id: "turning",
    index: 2,
    title: "一颗种子，终于发了芽",
    kicker: "TURNING POINT",
    cover: "/assets/about/turning-gujian.png",
    gallery: [
      "/assets/about/turning-gujian.png",
      "/assets/about/turning-bayonetta.png",
      "/assets/about/turning-unity.png",
      "/assets/about/turning-dmc.png",
    ],
    lines: [
      "高三第一次打开 Unity，写出第一个能跑的小东西，分科时没犹豫就选了理科。",
      "大学专业是测控技术与仪器（非科班），于是课外自学 Unity/C# 与客户端工程，靠一个个人战斗原型，把状态机、事件中心和对象池真正跑通了。",
    ],
  },
  {
    id: "now",
    index: 3,
    title: "现在的我",
    kicker: "NOW",
    tagline: "本科在读 · 求职中",
    cover: "/assets/about/now-unity.jpg",
    gallery: [
      "/assets/about/now-unity.jpg",
      "/assets/about/now-fsm.png",
      "/assets/about/now-desk-night.png",
      "/assets/about/now-buhuige.png",
    ],
    reel: [
      "/assets/about/now-art-field.jpg",
      "/assets/about/now-art-garden.jpg",
      "/assets/about/now-art-park.jpg",
      "/assets/about/now-art-split.jpg",
      "/assets/about/now-art-triptych.jpg",
      "/assets/about/now-art-ending.png",
      "/assets/about/now-art-statue.jpg",
      "/assets/about/now-art-lnu.jpg",
      "/assets/about/now-art-lnu-01.jpg",
      "/assets/about/now-art-lnu-02.jpg",
      "/assets/about/now-art-lnu-03.jpg",
      "/assets/about/now-art-lnu-04.jpg",
      "/assets/about/now-art-lnu-05.jpg",
      "/assets/about/now-art-lnu-06.jpg",
      "/assets/about/now-art-lnu-07.jpg",
      "/assets/about/now-art-lnu-08.jpg",
      "/assets/about/now-art-lnu-09.jpg",
      "/assets/about/now-art-lnu-10.jpg",
    ],
    lines: [
      "如今我能独立完成玩法系统的设计与落地，也带过 3 人小团队交付可上线内容。",
      "《流浪尸潮》个人项目：用状态机 + 事件中心拆分战斗 / 经济 / 成就 / UI，Profiler 定位 Update 开销后，测试场景帧率从 35 提升到 60 FPS（约 +71%），敌人生成改用对象池消除卡顿。",
      "不绘鸽工作室（国家级大创，负责人）：独立交付客户端架构与核心模块，项目累计营收 2.7 万元，产出软件著作权 2 项。",
      "用 C# 写 CSV 配置导出与数据处理工具，让策划能批量改配置；习惯 预期 → Play 对照 → 记录差异 → 验证后合入。",
      "工作之余也自己做 2D 插画与场景概念，能独立完成界面与关卡的视觉搭建，和程序对齐规格时更少返工。",
    ],
  },
  resumeBoard,
  {
    id: "ending",
    index: 5,
    title: "向未来全速前进！",
    kicker: "NEXT LEVEL · NEW GAME!",
    cover: "/assets/about/chapter-ending.png",
    lines: [],
    subtitle: "正在找 2027 届实习（游戏客户端 / 软件开发 / 前后端开发 / 测试），欢迎一起做出能跑、好玩、能交付的东西。",
    scrollTexts: [
      "NEW GAME!",
      "Press Start to Continue",
      "OPEN TO INTERNSHIP",
      "INSERT COIN",
    ],
    cta: { label: "联系我 →", href: "/contact" },
  },
];

// 横版世界：一路小旗子，最后一面结束
export const WORLD_WIDTH = 3000;
export const FLAG_X_START = 420;
export const FLAG_GAP = 560;
export const PLAYER_START_X = 72;
export const TRIGGER_RANGE = 64;
