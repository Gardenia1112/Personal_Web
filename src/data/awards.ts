// 01 §6 获奖与证书 —— 结构化数据
export interface Award {
  name: string;
  level: string;
  category: "省级及以上" | "校级院级" | "待补" | "奖学金" | "证书";
  file?: string;
  status: "done" | "todo";
  hide?: boolean; // 校级/院级，建站时可隐藏
}

export const awards: Award[] = [
  // 省级及以上
  { name: "2024 辽宁省大学生物理竞赛", level: "省二等奖", category: "省级及以上", file: "2024-liaoning-physics-2nd.png", status: "done" },
  { name: "2024 全国大学生物理实验竞赛（创新）", level: "国家二等奖", category: "省级及以上", file: "2024-physics-national-2nd.jpg", status: "done" },
  { name: "2025 辽宁省大学生物理竞赛", level: "省一等奖", category: "省级及以上", file: "2025-physics-1st.pdf", status: "done" },
  { name: "2025 辽宁省大学生物理竞赛", level: "省二等奖", category: "省级及以上", file: "2025-physics-2nd.pdf", status: "done" },
  { name: "2025 CIMC「西门子杯」中国智能制造挑战赛全国初赛（本科组）", level: "二等奖", category: "省级及以上", file: "2025-cimc-siemens-2nd.jpg", status: "done" },
  { name: "第二十七届中国机器人及人工智能大赛", level: "省级优秀奖", category: "省级及以上", file: "2025-robot-ai-excellence.pdf", status: "done" },
  { name: "2024「和鲸杯」辽宁省大学生计算机设计竞赛", level: "三等奖", category: "省级及以上", file: "2024-hejing-cup-computer-design-3rd.jpg", status: "done" },
  { name: "2025 辽宁省大学生智能技术应用大赛", level: "三等奖", category: "省级及以上", file: "2025-liaoning-intelligent-tech-3rd.pdf", status: "done" },
  { name: "2025 辽宁省第六届智能制造科普创意创新大赛", level: "二等奖", category: "省级及以上", file: "2025-smart-mfg-2nd.jpg", status: "done" },
  { name: "2025 辽宁大学 Proteus 仿真设计大赛暨辽宁赛区选拔赛", level: "二等奖", category: "省级及以上", file: "2025-proteus-2nd.jpg", status: "done" },
  { name: "中国国际大学生创新大赛（2025）辽宁大学选拔赛", level: "一等奖", category: "省级及以上", file: "2025-innovation-1st.xls", status: "done" },

  // 校级 / 院级（可隐藏）
  { name: "辽宁大学智能技术应用大赛（2025）", level: "校级二等奖", category: "校级院级", file: "2025-lnu-intelligent-tech-2nd.pdf", status: "done", hide: true },
  { name: "辽宁大学 2024 校园合唱比赛", level: "校级二等奖", category: "校级院级", file: "2024-lnu-choir-2nd.jpg", status: "done", hide: true },
  { name: "2024「挑战杯」辽宁大学物理学院创业计划竞赛", level: "院级三等奖", category: "校级院级", file: "2024-challenge-cup-3rd.jpg", status: "done", hide: true },

  // 待补
  { name: "全国大学生数学建模竞赛", level: "辽宁省一等奖", category: "待补", status: "todo" },

  // 奖学金
  { name: "辽宁大学二等奖学金", level: "2023–2024-1", category: "奖学金", file: "scholarship-2023-2024-1.pdf", status: "done" },
  { name: "辽宁大学单项奖学金", level: "2024 / 2025", category: "奖学金", file: "merit-scholarship.pdf", status: "done" },

  // 证书
  { name: "英语四级 CET-4", level: "大学英语四级", category: "证书", file: "CET4.pdf", status: "done" },
  { name: "英语六级 CET-6", level: "大学英语六级", category: "证书", file: "CET6.pdf", status: "done" },
  { name: "软件著作权：倾角传感器监测系统软件", level: "2025SR0979528", category: "证书", file: "2025SR0979528-tilt-sensor-software.pdf", status: "done" },
  { name: "软件著作权：大学物理实验气垫导轨软件", level: "2025SR2140826", category: "证书", file: "2025SR2140826-air-track-software.pdf", status: "done" },
  { name: "国家级大创项目结题证书", level: "不绘鸽工作室", category: "证书", file: "project-completion-cert.pdf", status: "done" },
];
