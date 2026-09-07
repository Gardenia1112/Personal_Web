// 全站转场控制器（决策 D5 / D6）—— 所有跳转统一「渐黑」
// 站内三套页面（首页 3D / about Phaser / desktop OS）各有独立 <html>，未启用 Astro ClientRouter，
// 因此这里用「离场盖黑 → 真实跳转 → 新页首屏前盖黑 → 淡出」实现跨页不闪烁：
// 离场时写 sessionStorage 标记，新页面由 TransitionOverlay.astro 的 inline 脚本在首屏绘制前读标记直接盖黑。
const FLAG = "lszbf:tx";
const SLIDE_FLAG = "lszbf:dtx";
const COVER_CLASS = "tx-covered";
const FADE_MS = 380; // 必须与 global.css 里 #transition-overlay 的 transition 时长一致
const SLIDE_MS = 420;
const THUMB_KEY = "lszbf:thumbfull";

function hasThumbFull() {
  try {
    return Boolean(sessionStorage.getItem(THUMB_KEY));
  } catch {
    return false;
  }
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function folderEntry(url: string) {
  try {
    const path = new URL(url, location.href).pathname.replace(/\/$/, "") || "/";
    // /awards 已迁工位 overlay，不再映射桌面文件夹
    if (path === "/works") return "dev";
    if (path === "/art") return "art";
  } catch {
    /* ignore */
  }
  return null;
}

function resolveUrl(url: string) {
  const folder = folderEntry(url);
  if (!folder) return url;
  try {
    sessionStorage.setItem("lszbf:folder", folder);
  } catch {
    /* ignore */
  }
  return "/desktop";
}

function pendingFolder() {
  try {
    const id = sessionStorage.getItem("lszbf:folder");
    return id === "dev" || id === "art";
  } catch {
    return false;
  }
}

/** 上滑进 / 下滑回，不盖黑。回目录不写 dtx，避免先播桌面 fall 再滑开文件夹。 */
export function navigateSlide(url: string, dir: "rise" | "fall") {
  url = resolveUrl(url);
  try {
    if (pendingFolder()) sessionStorage.removeItem(SLIDE_FLAG);
    else sessionStorage.setItem(SLIDE_FLAG, dir);
  } catch {
    /* 隐私模式：目标页没有入场动画 */
  }
  if (reducedMotion() || hasThumbFull()) {
    window.location.href = url;
    return;
  }
  const root = document.documentElement;
  root.dataset.slide = dir;
  root.classList.add("is-slide-leaving");
  window.setTimeout(() => {
    window.location.href = url;
  }, SLIDE_MS);
}

function isSlideBack(a: HTMLAnchorElement) {
  return a.classList.contains("sheet-home") || a.dataset.fall !== undefined;
}

/** 渐黑后跳转（供 desk.ts 等程序化导航调用） */
export function navigateWithTransition(url: string) {
  url = resolveUrl(url);
  // ThumbFull：有封面 rect 时不盖黑，让详情页从缩略图位置连续胀开
  if (hasThumbFull() || reducedMotion() || !document.getElementById("transition-overlay")) {
    window.location.href = url;
    return;
  }
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {
    /* 隐私模式下 sessionStorage 不可用，退化为无衔接跳转 */
  }
  document.documentElement.classList.add(COVER_CLASS);
  window.setTimeout(() => {
    window.location.href = url;
  }, FADE_MS);
}

// 需要放行的链接：新窗口 / 下载 / 非 http 协议 / 跨站 / 纯锚点 / 显式退出
function shouldIntercept(a: HTMLAnchorElement, e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return false;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname && url.search === location.search) return false;
  return true;
}

export function initTransitions() {
  const root = document.documentElement;

  // 由 inline 脚本在首屏前盖上的黑幕：等一帧再撤，确保 opacity:1 已参与首帧绘制
  // 尸潮电视启动自己揭幕，这里不要提前掀开
  if (root.classList.contains(COVER_CLASS) && !root.classList.contains("is-tv-boot")) {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove(COVER_CLASS)));
  } else if (root.classList.contains("is-tv-boot")) {
    window.setTimeout(() => root.classList.remove(COVER_CLASS, "is-tv-boot"), 2200);
  }

  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null;
    if (!a) return;
    if (isSlideBack(a)) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      navigateSlide(a.href, "fall");
      return;
    }
    if (!shouldIntercept(a, e)) return;
    e.preventDefault();
    navigateWithTransition(a.href);
  });

  // 浏览器后退命中缓存页时，黑幕可能仍是盖住状态
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) root.classList.remove(COVER_CLASS);
  });
}
