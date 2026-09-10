// 01 §5 美术作品 —— 结构化数据（绘画/设计/剪辑）
// 构建期扫描 public/assets/art/ 下真实文件；label = 文件名去后缀。

import fs from "node:fs";
import path from "node:path";

export interface ArtPiece {
  label: string;
  kind: "image" | "video";
  src?: string;
}

export interface ArtGroup {
  title: string;
  pieces: ArtPiece[];
}

export interface Artwork {
  slug: string;
  name: string;
  category: "绘画" | "设计" | "剪辑" | "流浪尸潮 UI/场景素材";
  cover?: string;
  status: "done" | "todo";
  pieces: ArtPiece[];
  groups?: ArtGroup[];
}

const ART_ROOT = path.join(process.cwd(), "public", "assets", "art");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4"]);

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function stem(file: string) {
  return path.parse(file).name;
}

function scanDir(
  dirName: string,
  kind: "image" | "video",
  allowed: Set<string>,
): ArtPiece[] {
  const abs = path.join(ART_ROOT, dirName);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((d) => d.isFile() && allowed.has(path.extname(d.name).toLowerCase()))
    .map((d) => d.name)
    .sort(naturalSort)
    .map((file) => ({
      label: stem(file),
      kind,
      src: `/assets/art/${dirName}/${file}`,
    }));
}

function artwork(
  slug: string,
  name: string,
  category: Artwork["category"],
  pieces: ArtPiece[],
): Artwork {
  return {
    slug,
    name,
    category,
    cover: `/assets/art/${slug}/cover.jpg`,
    status: "done",
    pieces,
  };
}

export const artworks: Artwork[] = [
  artwork(
    "illustration",
    "插画 / 原画（人物、场景、条漫、透卡等）",
    "绘画",
    scanDir("illustration", "image", IMAGE_EXT),
  ),
  artwork(
    "lnu-ip",
    "辽宁大学 IP / 文创设计（logo、帆布包、背卡等）",
    "设计",
    scanDir("lnu-ip", "image", IMAGE_EXT),
  ),
  artwork(
    "editing",
    "视频剪辑 / 演示片",
    "剪辑",
    scanDir("editing", "video", VIDEO_EXT),
  ),
  // ④ 流浪尸潮 UI/场景素材 —— 全部资产按 4 组归类，复用现有卡片/详情样式
  (() => {
    const groups: ArtGroup[] = [
      { title: "UI 素材", pieces: scanDir("langshi-ui/ui", "image", IMAGE_EXT) },
      { title: "场景概念图", pieces: scanDir("langshi-ui/concept", "image", IMAGE_EXT) },
      { title: "功能物件拆分", pieces: scanDir("langshi-ui/objects", "image", IMAGE_EXT) },
      { title: "白盒 / 流程稿", pieces: scanDir("langshi-ui/tiles", "image", IMAGE_EXT) },
    ];
    const artworkEntry: Artwork = {
      slug: "langshi-ui",
      name: "流浪尸潮（2.5D 像素肉鸽射击 Demo）· UI / 场景素材",
      category: "流浪尸潮 UI/场景素材",
      cover: "/assets/art/langshi-ui/concept/主页面概念图.png",
      status: "done",
      pieces: groups.flatMap((g) => g.pieces),
      groups,
    };
    return artworkEntry;
  })(),
];
