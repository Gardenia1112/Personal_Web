// 01 §3 关于我 —— 结构化数据
// 站内署名统一走这里：name 与 author 均取笔名 赵彼方（真名不再进入源码）
export const author = "赵彼方";

export const profile = {
  name: "赵彼方",
  age: 21,
  education: "大学本科",
  jobTitle: "游戏制作人",
  phone: "19967792313",
  email: "m19967792313@163.com",
  wechat: "lszbf111",
  website: "",
  github: "https://github.com/Gardenia1112",
  gitee: "https://gitee.com/bfnya/Unity_Game2025.git",
  resume: "/resume.pdf", // 简历文件；下载入口在 /about 与 /contact，不另开页面

  // 首页背景排版大字：铺满视口、位于 3D 工位之后形成前后空间感
  // ⚠️ 按用户要求不含真名；三行长度接近才能各自撑满一行宽度
  heroLines: ["LATE NIGHT", "GAME CLIENT", "WORKSTATION"],

  // 个人介绍（01 §3.2）
  intro: {
    tagline:
      "重度游戏玩家（游戏时长 5800 天，类型全面）转型创造者，具备从玩法设计到功能实现的完整闭环思维。",
    habit: "能把设计稿转成可运行代码；对性能与 BUG 有「强迫症式」调试习惯；喜欢做详细计划。",
    method: "习惯通过日志与断点定位问题；中小项目独立承担全部核心模块。",
    goal: "Unity/Godot 工程能力 + 持续学习自驱力，深耕游戏制作方向。",
  },

  // 教育背景（01 §3.3）
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
    ],
  },

  // 专业技能（01 §3.4）—— items 为完整表述，tags 用于「键盘打散成技能标签」
  skills: [
    {
      category: "编程语言",
      items:
        "C#（熟练，可独立开发完整 Unity 项目：协程、状态机、对象池、CSV 序列化与文件 I/O，了解 Lambda/泛型/Linq/反射）；C/C++/Java/Python（基础，可阅读 + AI 辅助）",
      tags: [
        "C#",
        "C/C++",
        "Java",
        "Python",
        "协程",
        "状态机",
        "对象池",
        "CSV 序列化",
        "文件 I/O",
        "Lambda",
        "泛型",
        "Linq",
        "反射",
      ],
    },
    {
      category: "游戏引擎",
      items: "Unity3D（熟悉）；UE5（了解：蓝图）；Godot（了解：GDScript 简单 2D）",
      tags: ["Unity3D", "UE5 · 蓝图", "Godot", "GDScript"],
    },
    {
      category: "开发工具",
      items:
        "Git（熟练：分支管理、Code Review、冲突解决）；Visual Studio；AI 辅助编程（Claude、Cursor、Copilot、CodeGeeX）",
      tags: ["Git", "分支管理", "Code Review", "Visual Studio", "Claude", "Cursor", "Copilot", "CodeGeeX"],
    },
    {
      category: "其他技术",
      items: "性能优化（对象池、GC 优化）；Shader（基础，能写简单 Shader）",
      tags: ["性能优化", "GC 优化", "Shader", "2.5D 渲染", "URP"],
    },
  ],
};
