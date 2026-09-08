// 01 §5 美术作品 —— 结构化数据（绘画/设计/建模/剪辑）
// 素材已落到 public/assets/art/ 下；src 一律指向磁盘上真实存在的文件，绝不编造路径。
// label = 文件名去后缀（草稿标题，供展示与 alt 用；第 6 步 [需用户确认]）。

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

// 绘画：paintings/ 26 张，1:1 映射（文件名去后缀为标题）
const paint = (file: string): ArtPiece => ({
  label: file.replace(/\.png$/, ""),
  kind: "image",
  src: `/assets/art/paintings/${file}`,
});

const PAINTINGS = [
  "人鱼氛围.png",
  "企划1改2.png",
  "企划2太阳月亮电影.png",
  "作曲家QQQ人.png",
  "俞定延.png",
  "兄妹骨科.png",
  "又是梦女ww浴袍.png",
  "哈哈小两口荒野求生来的.png",
  "喜欢太白的老师生日快乐（？.png",
  "小暹罗.png",
  "小楼宇logo帆布包.png",
  "很好的小孩打光.png",
  "怎么这么文艺3.png",
  "我们今天结婚了~tiaose.png",
  "我擦，血腥中二病。原.png",
  "我曹有鬼红绿色盲.png",
  "我曹这是。。？.png",
  "无限流游戏卧槽.png",
  "武士！调色.png",
  "甜品店沙发2223.png",
  "生贺ww相框版.png",
  "白桦林杀人案件调色.png",
  "眼睛条.png",
  "这个也好鬼ts.png",
  "透卡11111.png",
  "透卡xqj1.png",
];

export const artworks: Artwork[] = [
  {
    slug: "illustration",
    name: "插画 / 原画（人物、场景、条漫、透卡等）",
    category: "绘画",
    status: "done",
    pieces: PAINTINGS.map(paint),
  },
  {
    slug: "lnu-ip",
    name: "辽宁大学 IP / 文创设计（logo、帆布包、背卡等）",
    category: "设计",
    status: "done",
    pieces: [
      { label: "Logo", kind: "image", src: "/assets/art/辽大IP/logo.png" },
      // 备选：帆布包小logo蓝色.png / 帆布包小logo黄色.png
      { label: "帆布包", kind: "image", src: "/assets/art/辽大IP/帆布包logo黑色.png" },
      // 备选：考试周背卡背.jpg
      { label: "背卡", kind: "image", src: "/assets/art/辽大IP/考试周贝卡.jpg" },
      // 备选：1948中文2.0.png / 1948中文古风.png / 1948中文水墨风.png / 1948中文蓝色系.png
      { label: "1948 字体", kind: "image", src: "/assets/art/辽大IP/1948中文.png" },
      // 备选：校徽.jpg
      { label: "校徽衍生", kind: "image", src: "/assets/art/辽大IP/校徽.png" },
    ],
  },
  {
    slug: "modeling",
    name: "3D 建模作品（Blender / Maya）",
    category: "建模",
    status: "done",
    pieces: [
      // 组1 BF（备选渲染：bf2-4.png）
      { label: "BF 模型", kind: "image", src: "/assets/art/Models/bf.png" },
      // 组2 cx（备选渲染：cx2-3.png）
      { label: "cx 模型", kind: "image", src: "/assets/art/Models/cx.png" },
      // 组3 tys
      { label: "tys 模型", kind: "image", src: "/assets/art/Models/tys.png" },
      // 组4 风车：⚠️ 仅有参考图（非成品渲染），[需用户确认] 是否占用此位
      { label: "风车参考", kind: "image", src: "/assets/art/Models/风车参考.jpg" },
    ],
  },
  {
    slug: "editing",
    name: "视频剪辑 / 演示片（3 支）",
    category: "剪辑",
    status: "done",
    pieces: [
      { label: "演示片 01", kind: "video", src: "/assets/art/editing/reel-01.mp4" },
      { label: "演示片 02", kind: "video", src: "/assets/art/editing/reel-02.mp4" },
      { label: "演示片 03", kind: "video", src: "/assets/art/editing/reel-03.mp4" },
    ],
  },
];
