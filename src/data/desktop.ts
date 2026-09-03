// 02 §3.2 桌面 OS 四图标 → 路由（内容唯一来源；点击跳转由后续阶段接线）
export type DesktopIconId = "works" | "art" | "blog" | "resume";

export interface DesktopIcon {
  id: DesktopIconId;
  label: string;
  windowTitle: string;
  href: string;
  icon: string;
  folderClass?: "os-folder-red" | "os-folder-yellow";
}

export const desktopIcons: DesktopIcon[] = [
  {
    id: "works",
    label: "作品（开发）",
    windowTitle: "作品 Works（开发项目）",
    href: "/works",
    icon: "📁",
    folderClass: "os-folder-red",
  },
  {
    id: "art",
    label: "美术作品",
    windowTitle: "美术 Art（美术作品）",
    href: "/works?category=art",
    icon: "📁",
    folderClass: "os-folder-yellow",
  },
  {
    id: "blog",
    label: "博客",
    windowTitle: "博客 Blog",
    href: "/blog",
    icon: "🏷",
  },
  {
    id: "resume",
    label: "简历",
    windowTitle: "简历 Resume.pdf",
    href: "/resume.pdf",
    icon: "📄",
  },
];
