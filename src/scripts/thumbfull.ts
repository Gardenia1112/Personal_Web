export const THUMB_KEY = "lszbf:thumbfull";
const TV_BOOT_KEY = "lszbf:tv-boot";

export type ThumbFullPayload = {
  slug: string;
  src: string;
  expanded?: boolean;
  full?: boolean;
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearDeskEnter() {
  try {
    sessionStorage.removeItem("lszbf:dtx");
  } catch {
    /* ignore */
  }
}

export function writeThumbFull(data: ThumbFullPayload) {
  try {
    clearDeskEnter();
    sessionStorage.setItem(THUMB_KEY, JSON.stringify(data));
  } catch {
    /* 隐私模式：详情页按直链落地 */
  }
}

export function readThumbFull(): ThumbFullPayload | null {
  try {
    const raw = sessionStorage.getItem(THUMB_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ThumbFullPayload;
    if (!data?.slug) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearThumbFull() {
  try {
    sessionStorage.removeItem(THUMB_KEY);
  } catch {
    /* ignore */
  }
}

export function hasThumbFull() {
  try {
    return Boolean(sessionStorage.getItem(THUMB_KEY));
  } catch {
    return false;
  }
}

function slugFromHref(href: string) {
  return href.split("/").filter(Boolean).pop() ?? "";
}

function mediaSrc(media: HTMLImageElement) {
  return media.currentSrc || media.src || "";
}

function coverSrc(row: HTMLAnchorElement) {
  const img = row.querySelector<HTMLImageElement>(".wx-thumb img, .ag-media img, img.ag-img");
  if (!img) return "";
  return mediaSrc(img);
}

function destSize(row: HTMLAnchorElement) {
  const artCard = row.classList.contains("ag-item");
  return {
    w: document.documentElement.clientWidth,
    h: artCard ? window.innerHeight : Math.min(window.innerHeight * 0.72, 820),
  };
}

function safeCoverSrc(src: string) {
  if (!src.startsWith("/") || src.startsWith("//")) return "";
  return src.replace(/["')\\\s]/g, "");
}

function wantsExpand(row: HTMLAnchorElement) {
  return row.dataset.wxEnter === "expand";
}

function paintSheet() {
  const root = document.documentElement;
  root.style.backgroundColor = "#f0f8ff";
  if (document.body) {
    document.body.style.transition = "none";
    document.body.style.background = "#f0f8ff";
  }
}

/** 胀开终点垫在 html 上，换页时封面不动，蓝底留给落地再渐显 */
function paintCoverHold(src: string, full?: boolean) {
  const clean = safeCoverSrc(src);
  if (!clean) return;
  const root = document.documentElement;
  root.style.backgroundColor = "transparent";
  root.style.backgroundImage = `url("${clean}")`;
  root.style.backgroundRepeat = "no-repeat";
  root.style.backgroundPosition = "top left";
  root.style.backgroundSize = full ? "100vw 100vh" : "100vw min(72vh, 820px)";
  if (document.body) {
    document.body.style.transition = "none";
    document.body.style.background = "transparent";
  }
}

function goNow(href: string, cover?: string, full?: boolean) {
  if (cover) paintCoverHold(cover, full);
  else paintSheet();
  window.location.href = href;
}

function rememberFolderFrom(row: HTMLElement) {
  const view = row.closest<HTMLElement>("[data-folder-view]");
  const id = view?.dataset.folderView;
  try {
    if (id === "dev" || id === "art") sessionStorage.setItem("lszbf:folder", id);
    else sessionStorage.removeItem("lszbf:folder");
  } catch {
    /* ignore */
  }
}

function goSlide(href: string, slug: string) {
  writeThumbFull({ slug, src: "", expanded: false });
  goNow(href);
}

function wantsPageEnter(row: HTMLAnchorElement) {
  const enter = row.dataset.wxEnter ?? "";
  return (
    enter === "boot" ||
    enter === "stick" ||
    enter === "osboot" ||
    enter === "cover" ||
    row.classList.contains("wx-row--tube") ||
    row.classList.contains("wx-row--board") ||
    row.classList.contains("wx-row--os") ||
    row.classList.contains("wx-row--lab")
  );
}

/** 四皮详情页自己播入场；其余仍走胀开 / 滑入 */
export function expandThenGo(row: HTMLAnchorElement) {
  const href = row.getAttribute("href");
  if (!href) return;
  rememberFolderFrom(row);
  const slug = slugFromHref(href);
  const src = coverSrc(row);

  if (wantsPageEnter(row)) {
    try {
      sessionStorage.removeItem(THUMB_KEY);
      sessionStorage.removeItem(TV_BOOT_KEY);
    } catch {
      /* ignore */
    }
    window.location.href = href;
    return;
  }

  if (!wantsExpand(row) || !src || reducedMotion()) {
    goSlide(href, slug);
    return;
  }

  const thumb = row.querySelector<HTMLElement>(".wx-thumb, .ag-media");
  const media = thumb?.querySelector<HTMLImageElement>("img");
  if (!thumb || !media) {
    goSlide(href, slug);
    return;
  }

  const start = thumb.getBoundingClientRect();
  if (start.width < 8 || start.height < 8) {
    goSlide(href, slug);
    return;
  }

  const destW = window.innerWidth;
  const destH = destSize(row).h;
  const sx = start.width / destW;
  const sy = start.height / destH;
  const from = `translate(${start.left}px, ${start.top}px) scale(${sx}, ${sy})`;

  writeThumbFull({ slug, src, expanded: true });

  row.classList.add("is-expanding");
  row.closest(".wx-list, .ag-track")?.querySelectorAll<HTMLElement>(".wx-row, .ag-item").forEach((el) => {
    if (el !== row) el.classList.add("is-leaving");
  });
  document.documentElement.classList.add("is-thumbfull-leaving");

  thumb.classList.add("thumbfull-fly");
  thumb.style.width = "100vw";
  thumb.style.height = "min(72vh, 820px)";
  thumb.style.transform = from;
  document.body.appendChild(thumb);

  media.classList.add("thumbfull-fly-media");
  media.style.width = "100%";
  media.style.height = "100%";
  media.style.transform = `scale(${1 / sx}, ${1 / sy})`;

  const motion: KeyframeAnimationOptions = {
    duration: 900,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: "forwards",
  };
  const anim = thumb.animate([{ transform: from }, { transform: "translate(0, 0) scale(1, 1)" }], motion);
  media.animate([{ transform: `scale(${1 / sx}, ${1 / sy})` }, { transform: "scale(1, 1)" }], motion);

  anim.finished.catch(() => undefined).then(() => goNow(href, src));
}

export function bindThumbFullLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>("[data-wx-row]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      expandThenGo(row);
    });
  });
}

function slideRoot() {
  return (
    document.querySelector<HTMLElement>("body > article") ??
    document.querySelector<HTMLElement>("[data-art-show]")
  );
}

function dropHold() {
  const root = document.documentElement;
  root.classList.remove("is-thumbfull-hold");
  root.style.backgroundImage = "";
  root.style.backgroundSize = "";
  root.style.backgroundRepeat = "";
  root.style.backgroundPosition = "";
  root.style.backgroundColor = "";
  if (document.body) {
    document.body.style.background = "";
    document.body.style.transition = "";
  }
  document.getElementById("thumbfull-hold-style")?.remove();
  document.getElementById("thumbfull-hold")?.remove();
  document.getElementById("thumbfull-vt")?.remove();
}

function slideIn(el: HTMLElement, distance = 36) {
  return el.animate(
    [
      { transform: `translateY(${distance}px)`, opacity: 0 },
      { transform: "none", opacity: 1 },
    ],
    { duration: 560, easing: "cubic-bezier(0.16, 0.84, 0.3, 1)", fill: "forwards" }
  );
}

function fadeCopy(nodes: HTMLElement[]) {
  nodes.forEach((el) => {
    el.style.opacity = "0";
    el.animate(
      [
        { transform: "translateY(16px)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 480, easing: "ease-out", fill: "forwards" }
    );
  });
}

/** 详情页：胀开项 = 封面+纸底一起滑入再出字；其余整页滑入 */
export function arriveThumbFull(slug: string, copy?: HTMLElement | null) {
  const data = readThumbFull();
  const root = document.documentElement;
  const match = Boolean(data && data.slug === slug);

  const fanRise = root.dataset.enter === "rise" || root.dataset.enter === "veil";
  if (slug === "wandering-corpse-tide" || fanRise || !match || reducedMotion()) {
    root.classList.remove("is-thumbfull", "is-thumbfull-arrive", "is-thumbfull-slide", "is-thumbfull-hold");
    dropHold();
    clearThumbFull();
    return;
  }

  const page = slideRoot();

  if (data?.expanded) {
    const extras = Array.from(
      document.querySelectorAll<HTMLElement>(".pd-body, .sheet-home, .game-hud, .game-chrome")
    );
    const nodes = [copy, ...extras].filter((el): el is HTMLElement => Boolean(el));
    nodes.forEach((el) => {
      el.style.opacity = "0";
    });
    const deep = document.documentElement.dataset.tone === "deep";
    const board = Boolean(document.querySelector(".is-buhuige"));
    const sheetColor = deep ? "#0f1115" : board ? "#e8e4db" : "#f0f8ff";
    const sheetFrom = deep ? "rgba(15, 17, 21, 0)" : board ? "rgba(232, 228, 219, 0)" : "rgba(240, 248, 255, 0)";
    const sheet = document.body.animate(
      [{ backgroundColor: sheetFrom }, { backgroundColor: sheetColor }],
      { duration: 480, easing: "ease-out", fill: "forwards" }
    );
    fadeCopy(nodes);
    const done = () => {
      dropHold();
      root.classList.remove("is-thumbfull", "is-thumbfull-arrive", "is-thumbfull-slide");
    };
    sheet.finished.then(done).catch(done);
  } else if (!data?.expanded && page) {
    root.classList.remove("is-thumbfull", "is-thumbfull-arrive");
    const anim = slideIn(page, 30);
    const done = () => {
      dropHold();
      root.classList.remove("is-thumbfull-slide");
    };
    anim.finished.then(done).catch(done);
  } else {
    root.classList.remove("is-thumbfull", "is-thumbfull-arrive", "is-thumbfull-slide");
    dropHold();
  }

  clearThumbFull();
}
