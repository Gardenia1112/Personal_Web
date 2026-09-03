// 01 §5 美术作品 —— 结构化数据（绘画/设计/建模/剪辑，源素材均已提供）
// 源素材位置：绘画 → assets/images/；设计 → assets/images/（辽大IP）；建模 → assets/models/；剪辑 → assets/videos/
// 发布：缩略图/演示片由 Phase 7 复制到 public/assets/ 后再填 cover 字段。
export interface Artwork {
  slug: string;
  name: string;
  category: "绘画" | "设计" | "建模" | "剪辑";
  cover?: string;
  status: "done" | "todo";
}

export const artworks: Artwork[] = [
  { slug: "illustration", name: "插画 / 原画（人物、场景、条漫、透卡等）", category: "绘画", status: "done" },
  { slug: "lnu-ip", name: "辽宁大学 IP / 文创设计（logo、帆布包、背卡等）", category: "设计", status: "done" },
  { slug: "modeling", name: "3D 建模作品（Blender / Maya）", category: "建模", status: "done" },
  { slug: "editing", name: "视频剪辑 / 演示片（3 支）", category: "剪辑", status: "done" },
];
