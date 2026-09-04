// /desktop 的三个入口（内容唯一来源）
// ⚠️ 2026-09-04 用户决策，这一页改了三轮：
//   ① 从「拟物桌面 OS（窗口 + 拖拽）」改为「入口选择台」，覆盖 handoff/tasks/PHASE4 卡的窗口系统与图标位置持久化；
//   ② 再去掉介绍详情页与页面文字——选择台上只剩图标，名字只在悬停时浮出，点开直接弹内容。
//      所以这里不再有 title / blurb / meta / cta，偏差记在 docs/03 §3。
//   ③ 简历入口整个撤掉，改到 /about 页做下载链接，所以这里从四个变三个，也不再需要 file 字段。
export type DesktopEntryId = "works" | "art" | "blog";

/** pop = 点一下就地弹内容（作品摊开）；route = 点一下直接换页 */
export type DesktopAction = "pop" | "route";

export interface DesktopEntry {
  id: DesktopEntryId;
  art: "folder-red" | "folder-amber" | "logo"; // 图标视觉，样式在 desktop.css
  label: string; // 悬停浮出的名字（触屏降级时直接显示在图标下）
  kicker: string; // 名字下面那行小字
  tip?: string; // 图标悬停短标签（博客入口这类）
  action: DesktopAction;
  href?: string; // action=route 的目标
}

export const desktopEntries: DesktopEntry[] = [
  { id: "works", art: "folder-red", label: "项目与作品", kicker: "01 · 开发", action: "pop" },
  { id: "art", art: "folder-amber", label: "画与设计", kicker: "02 · 美术", action: "pop" },
  { id: "blog", art: "logo", label: "博客", kicker: "03 · 写作", tip: "博客入口", action: "route", href: "/blog" },
];
