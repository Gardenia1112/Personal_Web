// 02 §3.1 游戏化介绍 —— 4 个展板内容（内容对应 01 §3）
export interface GameBoardData {
  id: string;
  index: number;
  title: string;
  kicker: string;
  tagline?: string;
  cover: string;
  gallery?: string[];
  reel?: string[];
  lines: string[];
  subtitle?: string;
  scrollTexts?: string[];
  cta?: { label: string; href: string };
}

export const gameBoards: GameBoardData[] = [
  {
    id: "start",
    index: 1,
    title: "一切从那个方块世界开始",
    kicker: "START",
    cover: "/assets/about/chapter-start.png",
    gallery: [
      "/assets/about/chapter-start.png",
      "/assets/about/start-mine.png",
      "/assets/about/start-blender.jpg",
      "/assets/about/start-play.png",
    ],
    lines: [
      "我玩的第一个游戏是《我的世界》——在那个什么都能拆、什么都能搭的世界里，我盖出了属于自己的第一栋房子，那种成就感至今记得",
      "后来知道了材质包、模组、地图，才发现同一个游戏还能被改造成这么多样子，心里那颗「我也想做」的种子就是这时候埋下的",
      "但热情归热情，那时候网没现在这么方便，查资料、找教程处处碰壁，想看更详细的内容还得啃外网",
      "为了读懂那些英文教程，我硬着头皮学英语、折腾上网、照着写下第一行 Java 脚本……对一个小孩来说，确实太累了",
      "学的东西太多太杂，学业也一度没跟上，有一阵子，我真的怀疑自己是不是走错了路",
    ],
  },
  {
    id: "turning",
    index: 2,
    title: "一颗种子，终于发了芽",
    kicker: "TURNING POINT",
    cover: "/assets/about/turning-gujian.png",
    gallery: [
      "/assets/about/turning-gujian.png",
      "/assets/about/turning-bayonetta.png",
      "/assets/about/turning-unity.png",
      "/assets/about/turning-dmc.png",
    ],
    lines: [
      "上了高一，接触到更多单机大作——GTA、鬼泣、猎天使魔女、荒野大镖客、古剑奇谭……",
      "原来游戏还能做到这种程度，那颗种子一下子就破了土：我要做游戏",
      "也是在那时，我第一次打开了 Unity，写出了第一个能跑的小东西",
      "正好赶上分科，我几乎没有犹豫就选了理科——那一刻觉得，自己离那个梦，好像又近了一步",
    ],
  },
  {
    id: "now",
    index: 3,
    title: "现在的我",
    kicker: "NOW",
    tagline: "游戏制作人 · 本科在读",
    cover: "/assets/about/now-unity.jpg",
    gallery: [
      "/assets/about/now-unity.jpg",
      "/assets/about/now-fsm.png",
      "/assets/about/now-desk-night.png",
      "/assets/about/now-buhuige.png",
    ],
    reel: [
      "/assets/about/now-art-field.jpg",
      "/assets/about/now-art-garden.jpg",
      "/assets/about/now-art-park.jpg",
      "/assets/about/now-art-split.jpg",
      "/assets/about/now-art-triptych.jpg",
      "/assets/about/now-art-ending.png",
      "/assets/about/now-art-statue.jpg",
      "/assets/about/now-art-lnu.jpg",
    ],
    lines: [
      "如今我主攻游戏制作，从玩法想到落地，一个人能从策划案捋到可运行的代码",
      "擅长性能优化（对象池、GC 调优）和清晰架构（状态机、组件化、事件解耦）",
      "数据驱动、序列化、文件 I/O 这一套也都熟悉，团队协作走标准 Git 工作流、做过 Code Review、带过新人",
      "一路绕了点路，但回头看，每一步都没白走——现在做的，正是小时候想做的事",
    ],
  },
  {
    id: "ending",
    index: 4,
    title: "向未来全速前进！",
    kicker: "NEXT LEVEL · NEW GAME!",
    cover: "/assets/about/chapter-ending.png",
    lines: [],
    subtitle: "让我们一起做出最好玩的游戏。",
    scrollTexts: [
      "NEW GAME!",
      "Press Start to Continue",
      "LEVEL UP",
      "SELECT YOUR CHARACTER",
      "INSERT COIN",
    ],
    cta: { label: "联系我 →", href: "/contact" },
  },
];

// 横版世界：一路小旗子，最后一面结束
export const WORLD_WIDTH = 2400;
export const FLAG_X_START = 420;
export const FLAG_GAP = 560;
export const PLAYER_START_X = 72;
export const TRIGGER_RANGE = 64;
