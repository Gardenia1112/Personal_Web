// 01 §3 关于我 —— 结构化数据
export const profile = {
  name: "赵韵婷",
  age: 21,
  education: "大学本科",
  jobTitle: "游戏客户端开发工程师",
  phone: "19967792313",
  email: "m19967792313@163.com",
  wechat: "lszbf111",
  website: "lszbf.com",
  github: "https://github.com/Gardenia1112",
  gitee: "https://gitee.com/bfnya/Unity_Game2025.git",
  avatar: "/素材/品牌/head.png",

  // 个人介绍（01 §3.2）
  intro: {
    tagline:
      "重度游戏玩家（游戏时长 5800 天，类型全面）转型创造者，具备从玩法设计到功能实现的完整闭环思维。",
    habit: "能把设计稿转成可运行代码；对性能与 BUG 有「强迫症式」调试习惯；喜欢做详细计划。",
    method: "习惯通过日志与断点定位问题；中小项目独立承担全部核心模块。",
    goal: "Unity/Godot 工程能力 + 持续学习自驱力，深耕全栈游戏客户端方向。",
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

  // 专业技能（01 §3.4）
  skills: [
    {
      category: "编程语言",
      items:
        "C#（熟练，可独立开发完整 Unity 项目：协程、状态机、对象池、CSV 序列化与文件 I/O，了解 Lambda/泛型/Linq/反射）；C/C++/Java/Python（基础，可阅读 + AI 辅助）",
    },
    {
      category: "游戏引擎",
      items: "Unity3D（熟悉）；UE5（了解：蓝图）；Godot（了解：GDScript 简单 2D）",
    },
    {
      category: "开发工具",
      items:
        "Git（熟练：分支管理、Code Review、冲突解决）；Visual Studio；AI 辅助编程（Claude、Cursor、Copilot、CodeGeeX）",
    },
    {
      category: "其他技术",
      items: "性能优化（对象池、GC 优化）；Shader（基础，能写简单 Shader）",
    },
  ],
};
