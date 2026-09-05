// 01 §5 美术作品 —— 结构化数据（绘画/设计/建模/剪辑）
// 源素材在 assets/{images,models,videos}/；发布缩略图由 Phase 7 落到 public/assets/ 后再填 src。
// 不编造路径：没 src 的条目只占位。

export interface ArtPiece {
  label: string;
  kind: "image" | "video";
  src?: string;
}

export interface Artwork {
  slug: string;
  name: string;
  category: "绘画" | "设计" | "建模" | "剪辑";
  cover?: string;
  status: "done" | "todo";
  pieces: ArtPiece[];
}

function slots(n: number, kind: ArtPiece["kind"], prefix: string): ArtPiece[] {
  return Array.from({ length: n }, (_, i) => ({
    label: `${prefix} ${String(i + 1).padStart(2, "0")}`,
    kind,
  }));
}

export const artworks: Artwork[] = [
  {
    slug: "illustration",
    name: "插画 / 原画（人物、场景、条漫、透卡等）",
    category: "绘画",
    status: "done",
    pieces: slots(26, "image", "插画"),
  },
  {
    slug: "lnu-ip",
    name: "辽宁大学 IP / 文创设计（logo、帆布包、背卡等）",
    category: "设计",
    status: "done",
    pieces: [
      { label: "Logo", kind: "image" },
      { label: "帆布包", kind: "image" },
      { label: "背卡", kind: "image" },
      { label: "1948 字体", kind: "image" },
      { label: "校徽衍生", kind: "image" },
    ],
  },
  {
    slug: "modeling",
    name: "3D 建模作品（Blender / Maya）",
    category: "建模",
    status: "done",
    pieces: slots(4, "image", "建模"),
  },
  {
    slug: "editing",
    name: "视频剪辑 / 演示片（3 支）",
    category: "剪辑",
    status: "done",
    pieces: slots(3, "video", "演示片"),
  },
];
