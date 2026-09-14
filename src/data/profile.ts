// 01 §3 关于我 —— 结构化数据
// 站内署名统一走这里：name 与 author 均取笔名 赵彼方（真名不再进入源码）
export const author = "赵彼方";

export interface ProfileStat {
  label: string;
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  note?: string;
}

export const profile = {
  name: "赵彼方",
  avatar: "", // Models 目录已移除；头像路径待补标准证件照
  education: "大学本科",
  // 口径：宽泛求职，不写成单一游戏岗。jobTitle 作中性副标题，jobIntention 是面向招聘的求职意向
  jobTitle: "本科在读 · 求职中",
  jobIntention: "游戏客户端开发 / 软件开发 / 前后端开发 / 测试",
  phone: "19967792313",
  email: "m19967792313@163.com",
  wechat: "lszbf111", // 真实微信号，按用户裁定保留（含旧品牌 lszbf，勿参与全局替换）
  website: "",
  github: "https://github.com/Gardenia1112",
  gitee: "https://gitee.com/bfnya/Unity_Game2025.git",
  // 简历分两个方向：技术岗（游戏客户端）与美工岗（2D 场景），下载入口在 /contact
  resumes: {
    tech: {
      href: "/resume/tech-resume.pdf",
      download: "辽宁大学27届赵韵婷.pdf",
    },
    art: {
      href: "/resume/art-resume.pdf",
      download: "艺术简历.pdf",
    },
  },

  // 个人主页（关于我 · NOW 屏的快捷入口）
  social: [
    { label: "GitHub", url: "https://github.com/Gardenia1112", handle: "Gardenia1112" },
    { label: "Gitee", url: "https://gitee.com/bfnya", handle: "bfnya" },
  ],

  // 首页背景排版大字：铺满视口、位于 3D 工位之后形成前后空间感
  // ⚠️ 按用户要求不含真名；三行长度接近才能各自撑满一行宽度
  heroLines: ["LATE NIGHT", "GAME CLIENT", "WORKSTATION"],

  // 个人介绍（01 §3.2）
  intro: {
    tagline:
      "辽宁大学测控技术与仪器本科在读，主攻 Unity 客户端开发，能独立完成玩法系统从设计到落地的闭环。",
    habit: "能把设计稿转成可运行代码；卡了就开 Profiler、看日志，对性能与 Bug 有「强迫症式」的调试习惯。",
    method: "架构与性能自己把关，重复代码用 AI 提速；中小项目独立承担核心模块，团队项目约定接口后并行开发。",
    goal: "深耕游戏客户端方向，同时具备自测与工具链意识，目标是做出稳定、好玩、能交付的系统。",
  },

  // 教育背景（01 §3.3）—— 末行「课外自学」为非科班转方向的关键证据
  education_detail: {
    school: "辽宁大学（本科）",
    major: "测控技术与仪器",
    period: "2023.09 – 至今",
    courses: [
      "C 语言程序设计",
      "MATLAB 科学计算与仿真",
      "工程数学",
      "嵌入式系统",
      "虚拟仪器设计与应用",
      "课外自学 Unity/C#、客户端工程实践、UE5 蓝图",
    ],
  },

  // 专业技能（01 §3.4）—— items 为完整表述，tags 用于「键盘打散成技能标签」
  // 只保留简历里有明确证据的技能，无实证的已删除
  skills: [
    {
      category: "编程语言",
      items:
        "C#（熟练：协程、泛型状态机、对象池、CSV 序列化 / 文件 I/O）；C++ / Python（可阅读与 AI 辅助）",
      tags: ["C#", "C++", "Python", "协程", "状态机", "对象池", "CSV 序列化", "文件 I/O"],
    },
    {
      category: "游戏引擎",
      items: "Unity3D（熟悉，Gameplay 可迁移）；UE5（蓝图学习中）；Godot（了解）",
      tags: ["Unity3D", "UE5 · 蓝图", "Godot"],
    },
    {
      category: "开发工具",
      items: "Git（分支管理 / Code Review）、Visual Studio、Cursor / Copilot、Profiler",
      tags: ["Git", "分支管理", "Code Review", "Visual Studio", "Cursor", "Copilot", "Profiler"],
    },
    {
      category: "工程方法",
      items: "状态机 / 事件驱动 / 数据驱动（CSV）；对象池 / GC 优化；性能基线回归",
      tags: ["状态机", "事件驱动", "数据驱动", "对象池", "GC 优化", "性能基线回归"],
    },
  ],

  // 关键数字（屏3 数据卡片 · 数字滚动）：value 为目标值，decimals 为小数位，
  // prefix/suffix 为前后缀，note 为补充说明（如 35 → 60 FPS）
  stats: [
    { label: "累计营收", value: 2.7, decimals: 1, prefix: "¥", suffix: " 万" },
    { label: "软件著作权", value: 2, decimals: 0, suffix: " 项" },
    { label: "测试场景帧率", value: 60, decimals: 0, suffix: " FPS", note: "35 → 60 FPS" },
    { label: "性能提升", value: 71, decimals: 0, prefix: "+", suffix: "%" },
  ] as ProfileStat[],
};
