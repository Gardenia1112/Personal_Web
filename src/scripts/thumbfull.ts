export const THUMB_KEY = "lszbf:thumbfull";

export type ThumbFullPayload = {
  slug: string;
  src: string;
  expanded?: boolean;
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function writeThumbFull(data: ThumbFullPayload) {
  try {
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

function mediaSrc(media: HTMLElement) {
  return media instanceof HTMLImageElement ? media.currentSrc || media.src : "";
}

/** 当前页：点中的卡片缩略图当场胀到全宽，再进详情（Codrops ThumbFull） */
export function expandThenGo(row: HTMLAnchorElement) {
  const href = row.getAttribute("href");
  if (!href) return;
  const slug = slugFromHref(href);
  const thumb = row.querySelector<HTMLElement>(".wx-thumb");
  const media = thumb?.querySelector<HTMLElement>("img, .wx-ph");

  if (!thumb || !media || reducedMotion()) {
    writeThumbFull({ slug, src: media ? mediaSrc(media) : "", expanded: true });
    window.location.href = href;
    return;
  }

  const start = thumb.getBoundingClientRect();
  if (start.width < 8 || start.height < 8) {
    writeThumbFull({ slug, src: mediaSrc(media), expanded: true });
    window.location.href = href;
    return;
  }

  const destW = window.innerWidth;
  const destH = Math.min(window.innerHeight * 0.72, 820);
  const sx = start.width / destW;
  const sy = start.height / destH;
  const from = `translate(${start.left}px, ${start.top}px) scale(${sx}, ${sy})`;

  writeThumbFull({ slug, src: mediaSrc(media), expanded: true });

  row.classList.add("is-expanding");
  row.closest(".wx-list")?.querySelectorAll<HTMLElement>(".wx-row").forEach((el) => {
    if (el !== row) el.classList.add("is-leaving");
  });
  document.documentElement.classList.add("is-thumbfull-leaving");

  thumb.classList.add("thumbfull-fly");
  thumb.style.width = `${destW}px`;
  thumb.style.height = `${destH}px`;
  thumb.style.transform = from;
  document.body.appendChild(thumb);

  media.classList.add("thumbfull-fly-media");
  media.style.width = `${destW}px`;
  media.style.height = `${destH}px`;
  media.style.transform = `scale(${1 / sx}, ${1 / sy})`;

  const motion: KeyframeAnimationOptions = {
    duration: 900,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: "forwards",
  };
  const anim = thumb.animate([{ transform: from }, { transform: "translate(0, 0) scale(1, 1)" }], motion);
  media.animate([{ transform: `scale(${1 / sx}, ${1 / sy})` }, { transform: "scale(1, 1)" }], motion);

  const go = () => {
    window.location.href = href;
  };
  anim.finished.then(go).catch(go);
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

/** 详情页：胀开已在上一页播完，这里只淡入文案 */
export function arriveThumbFull(slug: string, copy?: HTMLElement | null) {
  const data = readThumbFull();
  document.documentElement.classList.remove("is-thumbfull", "is-thumbfull-arrive");
  const match = Boolean(data && data.slug === slug && data.expanded);
  if (match && copy && !reducedMotion()) {
    copy.animate(
      [
        { transform: "translateY(20px)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 560, easing: "ease-out", fill: "forwards" }
    );
  }
  clearThumbFull();
}
