// 01 §4 开发项目 —— 四段式结构化数据（+ 真实素材路径 / 量化成果可视化）
export interface ProjectMetric {
  label: string;
  before: string;
  after: string;
  pct: number; // 条形填充百分比
  note: string; // +71% / −18%
}

export interface ContentMedia {
  type: "image" | "video" | "pdf";
  src: string;
  caption?: string;
}

export interface ContentSection {
  h3?: string;
  paragraphs?: string[];
  list?: string[];
  table?: { key: string; value: string }[];
  media?: ContentMedia[];
}

export interface SideItem {
  kind: "bookmark" | "sticker" | "note";
  label: string;
  text?: string;
}

export interface PageBlock {
  type: "para" | "list" | "metrics" | "quote";
  text?: string;
  items?: string[];
  metrics?: { label: string; value: string }[];
}

export interface NotebookPage {
  id: string;
  file?: string;
  chapter?: string;
  pageNo: string;
  heading: string;
  lede?: string;
  blocks: PageBlock[];
  sidebar?: SideItem[];
  tags?: string[];
  media?: ContentMedia[];
}

export interface NotebookCover {
  title: string;
  subtitle?: string;
  meta?: string;
}

export interface OsDesktopMeta {
  manufacture: string;
  team: string;
  role: string;
  period: string;
  license: string;
}

export interface AppWindow {
  id: string;
  icon: string;
  title: string;
  desc: string;
  body?: string;
  sections?: ContentSection[];
  screenshots?: string[];
  video?: string;
  pdf?: string;
  slides?: string[];
  arch?: string;
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
  nameEn?: string;
  role: string;
  period: string;
  problem: string;
  tech: string;
  contribution: string;
  result: string;
  links: { label: string; url: string }[];
  status: "done" | "todo";
  /** 详情页入场：boot 花屏 / stick 曲线贴物 / osboot 格栅开机 / cover 封面翻开；expand/slide 留给其余页 */
  enter?: "expand" | "slide" | "boot" | "stick" | "osboot" | "cover";
  /** 详情页皮：共用骨架上的字阶 / 媒体节奏 */
  skin?: "is-shibing" | "is-buhuige" | "is-zhilian" | "is-qidian";
  media?: {
    cover?: string; // 封面
    arch?: string; // 架构图
    video?: string; // 实机视频（mp4）
    pdf?: string;
    gallery?: string[]; // 附加图
    desktop?: {
      wallpaper?: string;
      windows: AppWindow[];
      meta?: OsDesktopMeta;
    };
    notebook?: {
      cover?: NotebookCover;
      pages: NotebookPage[];
    };
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
      "三人团队形成「管理统筹—技术开发—设计运营」的协同：负责人（赵彼方）主抓统筹、商业拓展、财务与校方合作；技术核心（谢炜琳）攻坚 Unity 虚拟仿真与软著；设计运营（韩宛吟）主导原创 IP、视觉与店铺运营。",
    result:
      "累计营收 2.7 万元，净利润率 69.7%；登记两项国家软件著作权（大学物理实验气垫导轨软件 V1.0、倾角传感器监测系统软件 V1.0），并在全国大学生物理实验竞赛等赛事中获国家级 2 项、省级 6 项。（2025SR0979528、2025SR2140826）",
    links: [],
    status: "done",
    enter: "stick",
    skin: "is-buhuige",
    media: {
      cover: "/assets/projects/03-cover.png",
    },
    team: [
      { name: "赵彼方", role: "负责人", desc: "统筹管理、商业拓展、财务与校方合作" },
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
    nameEn: "ZHILIAN SENSOR",
    role: "团队项目 · 代码 + 统筹",
    period: "2025",
    problem: "安全监测场景需要基于倾角传感器的实时数据采集与监测软件。",
    tech: "倾角传感器数据采集 + 监测系统软件（详见作品开发文档）。",
    contribution: "代码实现 + 团队统筹分工。",
    result: "获软件著作权（登记号 2025SR0979528）。",
    links: [],
    status: "done",
    enter: "osboot",
    skin: "is-zhilian",
    media: {
      desktop: {
        meta: {
          manufacture: "2025.01",
          team: "ZBF · XWL · HWY",
          role: "负责人 · 嵌入式开发",
          period: "2025 – 2026",
          license: "软著 2025SR0979528",
        },
        windows: [
          {
            id: "monitor",
            icon: "icon-monitor",
            title: "监测台",
            desc: "产品介绍 · 实时倾角监测主界面",
            body: "面向建筑安全的无线倾角实时监测系统。三轴 MEMS 传感器采集姿态角，经智能混合滤波后由 ESP8266 上传云端，后端实现三维可视化与多级报警。核心指标：精度 ±0.01° · 采样 10Hz · 响应 <1s · 功耗 <200mA · IP65 · -20~+60℃。",
            screenshots: [],
            video: "",
            slides: [],
            sections: [
              {
                h3: "痛点",
                paragraphs: ["安全监测场景需要基于倾角传感器的实时数据采集与监测软件。"],
              },
              {
                h3: "解决方案",
                paragraphs: [
                  "面向建筑安全的无线倾角实时监测系统。三轴 MEMS 传感器采集姿态角，经智能混合滤波后由 ESP8266 上传云端，后端实现三维可视化与多级报警。",
                ],
                media: [
                  { type: "video", src: "/assets/projects/zhilian-demo.mp4", caption: "演示视频" },
                  { type: "image", src: "/assets/projects/zhilian-monitor-overview.png", caption: "监测台总览" },
                  { type: "image", src: "/assets/projects/zhilian-monitor-dashboard.png", caption: "监测主界面" },
                ],
              },
              {
                h3: "核心指标",
                table: [
                  { key: "精度", value: "±0.01°" },
                  { key: "采样", value: "10Hz" },
                  { key: "响应", value: "<1s" },
                  { key: "功耗", value: "<200mA" },
                  { key: "防护", value: "IP65" },
                  { key: "工作温度", value: "-20~+60℃" },
                ],
                media: [{ type: "image", src: "/assets/projects/zhilian-monitor-precision.png", caption: "精度示意" }],
              },
            ],
          },
          {
            id: "acquire",
            icon: "icon-acquire",
            title: "数据采集",
            desc: "产品介绍 · 硬件与算法架构",
            body: "双 MCU 架构：Arduino（主控，实时采集+报警）+ ESP8266（网络协处理器，WiFi/云端通信），任务解耦。关键技术：智能混合滤波 · 云边协同协议 · 自适应标定 · 多模式倾角解算（单轴/双轴/球面）。",
            screenshots: [],
            video: "",
            slides: [],
            sections: [
              {
                h3: "硬件架构",
                paragraphs: [
                  "双 MCU 架构：Arduino（主控，实时采集+报警）+ ESP8266（网络协处理器，WiFi/云端通信），任务解耦。",
                ],
                media: [
                  { type: "image", src: "/assets/projects/zhilian-acquire-hardware.png", caption: "硬件架构" },
                  { type: "image", src: "/assets/projects/zhilian-acquire-pcb.png", caption: "PCB" },
                ],
              },
              {
                h3: "核心算法",
                list: ["智能混合滤波", "云边协同协议", "自适应标定", "多模式倾角解算（单轴/双轴/球面）"],
                media: [
                  { type: "image", src: "/assets/projects/zhilian-acquire-filter.png", caption: "滤波" },
                  { type: "image", src: "/assets/projects/zhilian-acquire-algorithm.png", caption: "算法" },
                ],
              },
              {
                h3: "关键代码模块",
                media: [{ type: "image", src: "/assets/projects/zhilian-acquire-code.png", caption: "关键代码" }],
              },
            ],
          },
          {
            id: "log",
            icon: "icon-log",
            title: "运行日志",
            desc: "我的任务 · 嵌入式核心开发",
            body: "ZBF · 负责人（团队：ZBF / XWL / HWY，辽宁大学物理学院）。负责嵌入式端核心开发：传感器驱动、滤波与倾角解算、报警逻辑（四级阈值）、电源管理，以及软著申请与答辩。技术栈：C++（Arduino / ESP8266）、WiFi/UDP/TCP 通信、OTA。",
            screenshots: [],
            video: "",
            slides: [],
            sections: [
              {
                h3: "我的职责",
                paragraphs: ["ZBF · 负责人（团队：ZBF / XWL / HWY，辽宁大学物理学院）。"],
                list: ["传感器驱动", "滤波与倾角解算", "报警逻辑（四级阈值）", "电源管理", "软著申请与答辩"],
              },
              {
                h3: "技术栈",
                table: [
                  { key: "语言 / 平台", value: "C++（Arduino / ESP8266）" },
                  { key: "通信", value: "WiFi / UDP / TCP" },
                  { key: "更新", value: "OTA" },
                ],
                media: [
                  { type: "image", src: "/assets/projects/zhilian-log-code.png", caption: "嵌入式代码" },
                  { type: "image", src: "/assets/projects/zhilian-log-ide.png", caption: "开发环境" },
                  { type: "image", src: "/assets/projects/zhilian-log-team.png", caption: "团队分工" },
                ],
              },
            ],
          },
          {
            id: "archive",
            icon: "icon-archive",
            title: "归档",
            desc: "成果 · 软著与赛事",
            body: "软件著作权 2025SR0979528（倾角传感器监测系统软件）；辽宁省大学生智能技术应用大赛 · 物联网类（2025）。",
            screenshots: [],
            video: "",
            slides: [],
            pdf: "/assets/awards/2025SR0979528-tilt-sensor-software.pdf",
            sections: [
              {
                h3: "知识产权",
                paragraphs: ["软件著作权 2025SR0979528（倾角传感器监测系统软件）。"],
                media: [
                  {
                    type: "pdf",
                    src: "/assets/awards/2025SR0979528-tilt-sensor-software.pdf",
                    caption: "软著 2025SR0979528",
                  },
                  { type: "image", src: "/assets/projects/zhilian-archive-cert.png", caption: "软著证书" },
                ],
              },
              {
                h3: "竞赛获奖",
                paragraphs: ["辽宁省大学生智能技术应用大赛 · 物联网类（2025）。"],
                media: [{ type: "image", src: "/assets/projects/zhilian-archive-award.png", caption: "赛事证书" }],
              },
              {
                h3: "商业与展望",
                paragraphs: ["答辩材料与后续规划见归档图（规模与预测值待补）。"],
                media: [
                  { type: "image", src: "/assets/projects/zhilian-archive-defense-01.png", caption: "答辩 01" },
                  { type: "image", src: "/assets/projects/zhilian-archive-defense-02.png", caption: "答辩 02" },
                  { type: "image", src: "/assets/projects/zhilian-archive-defense-03.png", caption: "答辩 03" },
                  { type: "image", src: "/assets/projects/zhilian-archive-roadmap.png", caption: "路线图" },
                ],
              },
            ],
          },
        ],
      },
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
    enter: "cover",
    skin: "is-qidian",
    media: {
      pdf: "/assets/awards/2025SR2140826-air-track-software.pdf",
      notebook: {
        cover: {
          title: "气垫导轨虚拟仿真实验",
          subtitle: "“立体物理” · 大学物理实验 · 虚拟仿真",
          meta: "2025 · 中国大学生计算机设计大赛 · 2025SR2140826",
        },
        pages: [
          {
            id: "p01",
            file: "FILE 01",
            chapter: "CH 01 问题定义",
            pageNo: "01/09",
            heading: "为什么要做这个实验",
            lede: "仪器昂贵、误差难控、时空受限 —— 传统气垫导轨实验的三道坎。",
            blocks: [
              {
                type: "para",
                text: "传统气垫导轨实验依赖真实硬件：仪器价格昂贵，创新实验难以推广；学生操作易引入误差；受场地与时间限制，无法随时实验。",
              },
              {
                type: "para",
                text: "虚拟仿真实验打破这些限制：可随时随地开展，实现「一人一机」，及时获得实验数据；可按需设置参数与条件，进行多样化探索。",
              },
            ],
            sidebar: [
              { kind: "bookmark", label: "LAB" },
              { kind: "sticker", label: "2025" },
            ],
            tags: ["虚拟仿真", "大学物理", "教学实验"],
            media: [{ type: "image", src: "/assets/projects/qidian-apparatus-01.png", caption: "气垫导轨装置" }],
          },
          {
            id: "p02",
            file: "FILE 01",
            chapter: "CH 01 问题定义",
            pageNo: "02/09",
            heading: "这是一个什么作品",
            lede: "中国大学生计算机设计大赛参赛作品。",
            blocks: [
              {
                type: "para",
                text: "作品名：「立体物理」气垫导轨虚拟教学实验（作品编号 2025023491）。大类：微课与 AI 辅助教学；小类：中、小学数学或自然科学课程。",
              },
              {
                type: "para",
                text: "基于 Unity 开发，高度还原气垫导轨实验场景。用户可便捷开展测加速度与速度、验证动量守恒定律等实验，以交互形式深化理解物理原理，打破时空限制，助力物理实验教学。",
              },
              {
                type: "list",
                items: [
                  "作品编号 2025023491",
                  "参赛：中国大学生计算机设计大赛（2025）",
                  "平台：Windows / Linux",
                ],
              },
            ],
            sidebar: [{ kind: "sticker", label: "CASE" }],
            tags: ["参赛作品", "教学实验"],
            media: [{ type: "image", src: "/assets/projects/qidian-setup-01.png", caption: "实验台全景" }],
          },
          {
            id: "p03",
            file: "FILE 02",
            chapter: "CH 02 技术方案",
            pageNo: "03/09",
            heading: "怎么搭起来",
            lede: "Unity + Blender + C#，从建模到可交互的完整管线。",
            blocks: [
              {
                type: "para",
                text: "开发流程：Blender 3.6 构建白模（气垫导轨、滑块等）→ 绘制并赋予材质 → 导入 Unity 拼接场景 → 设置摄像机、环境光、碰撞箱与物理属性，完成程序场景基底。",
              },
              {
                type: "list",
                items: [
                  "建模：Blender 3.6（白模 + 材质节点）",
                  "引擎：Unity（物理引擎 PhysX）",
                  "脚本：C#（Visual Studio）",
                  "图像处理：Photoshop",
                  "UI：Unity 2D 界面 + TextMeshPro",
                ],
              },
              {
                type: "para",
                text: "开发环境以 Windows 为主，运行展示支持 Windows / Linux。",
              },
            ],
            sidebar: [{ kind: "note", label: "详见设计开发文档" }],
            tags: ["仿真软件", "建模", "物理引擎"],
            media: [{ type: "image", src: "/assets/projects/qidian-sensor-01.png", caption: "传感/采集模块" }],
          },
          {
            id: "p04",
            file: "FILE 02",
            chapter: "CH 02 技术方案",
            pageNo: "04/09",
            heading: "实验软件怎么用",
            lede: "三个场景，参数可调，数据自动成表。",
            blocks: [
              {
                type: "para",
                text: "系统提供三个实验场景入口：弹性碰撞、完全非弹性碰撞、加速度测量。学生点击进入对应场景。",
              },
              {
                type: "list",
                items: [
                  "弹性碰撞：质量/初速度可调，显示碰撞前后速度，验证动量守恒",
                  "完全非弹性碰撞：滑块粘连动画，显示共速值，计算动能损耗",
                  "加速度测量：固定光电门间距，自动计算加速度",
                  "参数设置：质量、初速度、恢复系数；光电门记录时间",
                  "数据展示：动态生成表格（速度/动量/加速度），支持实验报告一键生成",
                ],
              },
              {
                type: "quote",
                text: "操作极简：界面仅保留核心参数输入与启动按钮，学生无需复杂培训即可上手。",
              },
            ],
            tags: ["数据采集", "数据分析", "实验报告"],
            media: [
              { type: "image", src: "/assets/projects/qidian-data-01.png", caption: "采集数据/曲线" },
              { type: "image", src: "/assets/projects/qidian-platform-01.png", caption: "分析平台界面" },
            ],
          },
          {
            id: "p05",
            file: "FILE 03",
            chapter: "CH 03 我的贡献",
            pageNo: "05/09",
            heading: "我做了哪部分",
            lede: "团队三人（ZBF · XWL · HWY），我担任统筹，分工比例 40%。",
            blocks: [
              {
                type: "para",
                text: "团队共三人（ZBF · XWL · HWY）。我在项目中负责统筹，并承担『实验主体编程 + 动画效果』方向的核心开发。",
              },
              {
                type: "list",
                items: [
                  "实验主体逻辑(C#/Unity 物理)",
                  "碰撞检测与动量/加速度计算",
                  "数据记录与表格生成(PlayerPrefs)",
                  "部分动画与交互效果",
                  "软著申请与答辩材料",
                ],
              },
              {
                type: "quote",
                text: "整体分工比例 ZBF : XWL : HWY ≈ 40% : 30% : 30%。",
              },
            ],
            sidebar: [{ kind: "sticker", label: "UI 由组员二完成" }],
            tags: ["统筹", "物理逻辑", "数据"],
          },
          {
            id: "p06",
            file: "FILE 03",
            chapter: "CH 03 我的贡献",
            pageNo: "06/09",
            heading: "分工边界",
            lede: "明确自己写的部分，不揽他人成果。",
            blocks: [
              {
                type: "quote",
                text: "UI 界面与 2D 交互由组员二完成；仪器建模、场景整体设计与视频剪辑由组员一完成；实验主体编程、动画与汇报由组员三（ZBF）完成。",
              },
              {
                type: "para",
                text: "因此本页记录的「我的贡献」仅指我直接负责的模块，协作部分如实归属对应成员。",
              },
            ],
            sidebar: [{ kind: "bookmark", label: "ROLE" }],
            tags: ["分工", "统筹"],
            media: [{ type: "video", src: "/assets/projects/qidian-demo.mp4", caption: "实验演示" }],
          },
          {
            id: "p07",
            file: "FILE 04",
            chapter: "CH 04 成果",
            pageNo: "07/09",
            heading: "最后拿到什么",
            lede: "软件著作权 + 国家级赛事参赛。",
            blocks: [
              {
                type: "metrics",
                metrics: [
                  { label: "软著登记号", value: "2025SR2140826" },
                  { label: "年份", value: "2025" },
                  { label: "赛事", value: "中国大学生计算机设计大赛" },
                ],
              },
              {
                type: "para",
                text: "获得软件著作权（登记号 2025SR2140826，大学物理实验气垫导轨软件，V1.0）。",
              },
              {
                type: "para",
                text: "作品参赛中国大学生计算机设计大赛（微课与 AI 辅助教学类，2025），完成从建模、开发到答辩的完整闭环。",
              },
            ],
            sidebar: [{ kind: "sticker", label: "CERT" }],
            tags: ["软著", "参赛", "知识产权"],
            media: [{ type: "image", src: "/assets/projects/qidian-archive-cert.png", caption: "软著证书" }],
          },
          {
            id: "p08",
            file: "FILE 04",
            chapter: "CH 04 成果",
            pageNo: "08/09",
            heading: "答辩材料",
            lede: "答辩 PPT 与教学文档已归档。",
            blocks: [
              {
                type: "para",
                text: "答辩 PPT 与教学文档已整理归档（详见「设计开发文档」）。内容涵盖项目背景、实验原理、资源开发、实验内容与项目总结五部分。",
              },
              {
                type: "list",
                items: ["答辩 PPT（5 章结构）", "教学文档（教学目的 / 设计 / 素材 / 反思 / 测试）", "演示视频"],
              },
            ],
            tags: ["答辩", "文档"],
            media: [
              { type: "image", src: "/assets/projects/qidian-defense-01.png", caption: "答辩 PPT 关键页 01" },
              { type: "image", src: "/assets/projects/qidian-defense-02.png", caption: "答辩 PPT 关键页 02" },
              { type: "image", src: "/assets/projects/qidian-defense-03.png", caption: "答辩 PPT 关键页 03" },
            ],
          },
          {
            id: "p09",
            file: "FILE 04",
            chapter: "CH 05 附录",
            pageNo: "09/09",
            heading: "归档",
            lede: "软著证书原件（PDF）。",
            blocks: [
              {
                type: "para",
                text: "软件著作权 2025SR2140826（大学物理实验气垫导轨软件，V1.0）。下方为证书原件扫描件。",
              },
            ],
            sidebar: [{ kind: "bookmark", label: "PDF" }],
            tags: ["软著 V1.0", "归档"],
            media: [
              {
                type: "pdf",
                src: "/assets/awards/2025SR2140826-air-track-software.pdf",
                caption: "软件著作权证书",
              },
            ],
          },
        ],
      },
    },
  },
];
