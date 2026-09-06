// 01 §4 开发项目 —— 四段式结构化数据（+ 真实素材路径 / 量化成果可视化）
export interface ProjectMetric {
  label: string;
  before: string;
  after: string;
  pct: number; // 条形填充百分比
  note: string; // +71% / −18%
}

export interface StudioSection {
  label: string;
  body: string;
}

export interface TeamMember {
  name: string;
  role: string;
  desc: string;
}

export interface Project {
  slug: string;
  name: string;
  role: string;
  period: string;
  problem: string;
  tech: string;
  contribution: string;
  result: string;
  links: { label: string; url: string }[];
  status: "done" | "todo";
  /** 目录进详情：expand = 先胀缩略图；slide = 整页滑入；boot = 渐黑后电视启动（尸潮） */
  enter?: "expand" | "slide" | "boot";
  /** 详情页皮：共用骨架上的字阶 / 媒体节奏 */
  skin?: "is-shibing" | "is-buhuige" | "is-zhilian" | "is-qidian";
  media?: {
    cover?: string; // 封面
    arch?: string; // 架构图
    video?: string; // 实机视频（mp4）
    gallery?: string[]; // 附加图
  };
  metrics?: ProjectMetric[]; // 量化成果可视化（02 §9）
  skills?: string[];
  solution?: string;
  team?: TeamMember[];
  sections?: StudioSection[];
}

export const projects: Project[] = [
  {
    slug: "wandering-corpse-tide",
    name: "流浪尸潮",
    role: "个人项目 · 主程序 / 主策划",
    period: "2025.03 – 2026.01",
    problem:
      "2.5D 动作肉鸽游戏，初始平均帧率仅 35FPS、内存占用高；团队策划 / 美工产出不足。",
    tech:
      "C# 面向对象 + 组件化架构；泛型状态机（FSM）；2.5D 渲染管线（URP Decal 动态阴影、视差背景）；事件驱动解耦战斗/UI/经济；数据驱动（ScriptableObject）实现肉鸽三选一、动态难度、局外成长；对象池管理。",
    contribution:
      "主策划 + 主程序：技术选型、架构搭建、Git 协作流程、任务拆分与带新人、能力系统设计；角色移动/二段跳/冲刺/射击手感优化。",
    result: "平均帧率 35→60FPS、内存峰值 −18%；核心战斗与架构框架完善可扩展。",
    links: [{ label: "Gitee 源码", url: "https://gitee.com/bfnya/Unity_Game2025.git" }],
    status: "done",
    enter: "boot",
    skin: "is-shibing",
    media: {
      cover: "/assets/projects/01-cover.png",
      arch: "/assets/projects/01-arch.png",
      video: "/assets/projects/01-gameplay.mp4",
      gallery: ["/assets/projects/concept-01.png", "/assets/projects/making-of.png"],
    },
    metrics: [
      { label: "平均帧率", before: "35 FPS", after: "60 FPS", pct: 71, note: "+71%" },
      { label: "内存峰值", before: "100%", after: "82%", pct: 82, note: "−18%" },
    ],
  },
  {
    slug: "buhuige-studio",
    name: "不绘鸽工作室",
    role: "国家级创业实践项目 · 负责人",
    period: "2024.12 – 2026.04",
    problem:
      "瞄准高校文创与虚拟仿真两块空白市场：校园 IP 定制需求旺盛却缺乏专业团队，实验教学受器材环境限制、老旧 2D 软件难满足数字化需求。不绘鸽以「文创 IP + 数字技术 + 定制服务」切入，做高校场景的垂直解决方案。",
    solution:
      "文创 IP + 数字技术 + 定制服务的双产品线：艺术类（IP/3D 动画/Live2D/游戏美术/衍生品）+ 理工类（气垫导轨/倾角传感/力学/电磁/热学仿真）。",
    tech: "Unity 核心架构；物理仿真；3D 建模；UI；动画；音效",
    skills: [
      "Unity 核心架构",
      "物理仿真",
      "3D 建模",
      "UI",
      "动画",
      "音效",
      "虚拟仿真",
      "IP 设计",
      "衍生品开发",
    ],
    contribution:
      "三人团队形成「管理统筹—技术开发—设计运营」的协同：负责人（赵韵婷）主抓统筹、商业拓展、财务与校方合作；技术核心（谢炜琳）攻坚 Unity 虚拟仿真与软著；设计运营（韩宛吟）主导原创 IP、视觉与店铺运营。",
    result:
      "累计营收 2.7 万元，净利润率 69.7%；登记两项国家软件著作权（大学物理实验气垫导轨软件 V1.0、倾角传感器监测系统软件 V1.0），并在全国大学生物理实验竞赛等赛事中获国家级 2 项、省级 6 项。（2025SR0979528、2025SR2140826）",
    links: [],
    status: "done",
    enter: "expand",
    skin: "is-buhuige",
    media: {
      cover: "/assets/projects/03-cover.png",
    },
    team: [
      { name: "赵韵婷", role: "负责人", desc: "统筹管理、商业拓展、财务与校方合作" },
      { name: "谢炜琳", role: "技术核心", desc: "Unity 虚拟仿真、软著与技术攻坚" },
      { name: "韩宛吟", role: "设计运营", desc: "原创 IP、视觉设计与店铺运营" },
    ],
    sections: [
      {
        label: "01 我们是谁",
        body: "瞄准高校文创与虚拟仿真两块空白市场：校园 IP 定制需求旺盛却缺乏专业团队，实验教学受器材环境限制、老旧 2D 软件难满足数字化需求。不绘鸽以「文创 IP + 数字技术 + 定制服务」切入，做高校场景的垂直解决方案。",
      },
      {
        label: "02 做什么",
        body: "文创 IP + 数字技术 + 定制服务的双产品线：艺术类（IP/3D 动画/Live2D/游戏美术/衍生品）+ 理工类（气垫导轨/倾角传感/力学/电磁/热学仿真）。",
      },
      {
        label: "03 怎么做",
        body: "以「物理为骨·艺术为形·商业为翼」为理念，用文创 IP + 数字技术 + 定制服务的双产品线，市场化运作，为高校场景提供垂直解决方案。",
      },
      {
        label: "04 做到了什么",
        body: "累计营收 2.7 万元，净利润率 69.7%；登记两项国家软件著作权（大学物理实验气垫导轨软件 V1.0、倾角传感器监测系统软件 V1.0），并在全国大学生物理实验竞赛等赛事中获国家级 2 项、省级 6 项。（2025SR0979528、2025SR2140826）",
      },
    ],
  },
  {
    slug: "zhilian-tilt-sensor",
    name: "智联传感：基于倾角传感器的安全监测系统",
    role: "团队项目 · 代码 + 统筹",
    period: "2025",
    problem: "安全监测场景需要基于倾角传感器的实时数据采集与监测软件。",
    tech: "倾角传感器数据采集 + 监测系统软件（详见作品开发文档）。",
    contribution: "代码实现 + 团队统筹分工。",
    result: "获软件著作权（登记号 2025SR0979528）。",
    links: [],
    status: "done",
    skin: "is-zhilian",
    media: {
      cover: "/assets/projects/02-cover.png",
    },
  },
  {
    slug: "air-track-virtual-lab",
    name: "气垫导轨虚拟仿真实验",
    role: "团队项目 · 实验室模块 + 导出 + 统筹",
    period: "2025",
    problem: "大学物理实验「气垫导轨」的虚拟仿真教学需求（中国大学生计算机设计大赛作品）。",
    tech: "气垫导轨虚拟仿真教学实验软件（详见设计开发文档）。",
    contribution: "实验室模块 + 结尾导出功能开发，参与统筹分工（UI 部分由他人完成）。",
    result: "获软件著作权（登记号 2025SR2140826）；中国大学生计算机设计大赛参赛。",
    links: [],
    status: "done",
    skin: "is-qidian",
  },
];
