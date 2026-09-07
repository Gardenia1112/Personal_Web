// 01 §6 获奖与证书 —— 结构化数据（AwardsStack / 工位文件堆 overlay）
export interface Award {
  name: string;
  level: string;
  category: "省级及以上" | "校级院级" | "待补" | "证书";
  /** 左标签缩略称呼（Mosby 文件夹 tab） */
  tab: string;
  /** 排序用年份（新→旧） */
  year: number;
  file?: string;
  status: "done" | "todo";
  hide?: boolean; // 校级/院级，默认收起
  /** 展开区说明；拿不准不写 */
  blurb?: string;
  project?: string;
  role?: string;
}

const ASSET = "/assets/awards";

function src(file?: string) {
  return file ? `${ASSET}/${file}` : undefined;
}

export const awards: Award[] = [
  // 省级及以上
  {
    name: "2025 辽宁省大学生物理竞赛",
    level: "省一等奖",
    category: "省级及以上",
    tab: "省物一·25",
    year: 2025,
    file: "2025-physics-1st.pdf",
    status: "done",
  },
  {
    name: "2025 辽宁省大学生物理竞赛",
    level: "省二等奖",
    category: "省级及以上",
    tab: "省物二·25",
    year: 2025,
    file: "2025-physics-2nd.pdf",
    status: "done",
  },
  {
    name: "2025 CIMC「西门子杯」中国智能制造挑战赛全国初赛（本科组）",
    level: "二等奖",
    category: "省级及以上",
    tab: "西门子·25",
    year: 2025,
    file: "2025-cimc-siemens-2nd.jpg",
    status: "done",
  },
  {
    name: "第二十七届中国机器人及人工智能大赛",
    level: "省级优秀奖",
    category: "省级及以上",
    tab: "机器人·25",
    year: 2025,
    file: "2025-robot-ai-excellence.pdf",
    status: "done",
  },
  {
    name: "2025 辽宁省大学生智能技术应用大赛",
    level: "三等奖",
    category: "省级及以上",
    tab: "智技赛·25",
    year: 2025,
    file: "2025-liaoning-intelligent-tech-3rd.pdf",
    status: "done",
  },
  {
    name: "2025 辽宁省第六届智能制造科普创意创新大赛",
    level: "二等奖",
    category: "省级及以上",
    tab: "智造科普·25",
    year: 2025,
    file: "2025-smart-mfg-2nd.jpg",
    status: "done",
  },
  {
    name: "2025 辽宁大学 Proteus 仿真设计大赛暨辽宁赛区选拔赛",
    level: "二等奖",
    category: "省级及以上",
    tab: "Proteus·25",
    year: 2025,
    file: "2025-proteus-2nd.jpg",
    status: "done",
  },
  {
    name: "中国国际大学生创新大赛（2025）辽宁大学选拔赛",
    level: "一等奖",
    category: "省级及以上",
    tab: "大创选拔·25",
    year: 2025,
    file: "2025-innovation-1st.xls",
    status: "done",
    project: "不绘鸽工作室",
  },
  {
    name: "2024 全国大学生物理实验竞赛（创新）",
    level: "国家二等奖",
    category: "省级及以上",
    tab: "国物实·24",
    year: 2024,
    file: "2024-physics-national-2nd.jpg",
    status: "done",
  },
  {
    name: "2024 辽宁省大学生物理竞赛",
    level: "省二等奖",
    category: "省级及以上",
    tab: "省物二·24",
    year: 2024,
    file: "2024-liaoning-physics-2nd.png",
    status: "done",
  },
  {
    name: "2024「和鲸杯」辽宁省大学生计算机设计竞赛",
    level: "三等奖",
    category: "省级及以上",
    tab: "和鲸杯·24",
    year: 2024,
    file: "2024-hejing-cup-computer-design-3rd.jpg",
    status: "done",
  },
  {
    name: "全国大学生数学建模竞赛",
    level: "辽宁省一等奖",
    category: "省级及以上",
    tab: "数模省一·24",
    year: 2024,
    file: "2024-math-modeling-liaoning-1st.jpg",
    status: "done",
  },

  // 校级 / 院级（可隐藏）
  {
    name: "辽宁大学智能技术应用大赛（2025）",
    level: "校级二等奖",
    category: "校级院级",
    tab: "辽大智技·25",
    year: 2025,
    file: "2025-lnu-intelligent-tech-2nd.pdf",
    status: "done",
    hide: true,
  },
  {
    name: "辽宁大学 2024 校园合唱比赛",
    level: "校级二等奖",
    category: "校级院级",
    tab: "合唱·24",
    year: 2024,
    file: "2024-lnu-choir-2nd.jpg",
    status: "done",
    hide: true,
  },
  {
    name: "2024「挑战杯」辽宁大学物理学院创业计划竞赛",
    level: "院级三等奖",
    category: "校级院级",
    tab: "挑战杯·24",
    year: 2024,
    file: "2024-challenge-cup-3rd.jpg",
    status: "done",
    hide: true,
  },

  // 证书
  {
    name: "英语六级 CET-6",
    level: "大学英语六级",
    category: "证书",
    tab: "CET-6",
    year: 2025,
    file: "CET6.pdf",
    status: "done",
    blurb: "大学英语六级成绩证明。",
  },
  {
    name: "英语四级 CET-4",
    level: "大学英语四级",
    category: "证书",
    tab: "CET-4",
    year: 2024,
    file: "CET4.pdf",
    status: "done",
    blurb: "大学英语四级成绩证明。",
  },
  {
    name: "软件著作权：倾角传感器监测系统软件",
    level: "2025SR0979528",
    category: "证书",
    tab: "软著·倾角",
    year: 2025,
    file: "2025SR0979528-tilt-sensor-software.pdf",
    status: "done",
    project: "智联传感：基于倾角传感器的安全监测系统",
    role: "代码实现 + 团队统筹",
  },
  {
    name: "软件著作权：大学物理实验气垫导轨软件",
    level: "2025SR2140826",
    category: "证书",
    tab: "软著·气轨",
    year: 2025,
    file: "2025SR2140826-air-track-software.pdf",
    status: "done",
    project: "气轨虚拟实验室",
  },
  {
    name: "国家级大创项目结题证书",
    level: "不绘鸽工作室",
    category: "证书",
    tab: "大创结题",
    year: 2025,
    file: "project-completion-cert.pdf",
    status: "done",
    project: "不绘鸽工作室",
    role: "负责人",
  },
];

/** 文件绝对路径（组件/脚本用） */
export function awardFileUrl(file?: string) {
  return src(file);
}

/** 按年份新→旧；同年保持数组相对顺序 */
export function awardsSorted(list: Award[] = awards) {
  return [...list].sort((a, b) => b.year - a.year);
}

/**
 * 把奖项收成「文件柜层」：每层 1–3 条（伪随机、构建期稳定），便于同层多标签。
 */
export function awardsLayers(list: Award[] = awards, maxPerLayer = 3): Award[][] {
  const sorted = awardsSorted(list);
  const layers: Award[][] = [];
  let i = 0;
  let seed = (sorted.length * 2654435761) >>> 0;
  while (i < sorted.length) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const n = (seed % maxPerLayer) + 1;
    const take = Math.min(n, sorted.length - i);
    layers.push(sorted.slice(i, i + take));
    i += take;
  }
  return layers;
}

/** /awards 页头文案（Mosby 首页式标题区） */
export const awardsPage = {
  brand: "LSZBF · FILES",
  kicker: "Awards & Certificates",
  title: "获奖与证书",
  lede: "奖项按时间叠成文件柜；同层最多三份。悬停标签把文件抽到前面，悬停整层即展开，移开自动收回。",
};
