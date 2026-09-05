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
    w: window.innerWidth,
    h: artCard ? window.innerHeight : Math.min(window.innerHeight * 0.72, 820),
  };
}

function goSlide(href: string, slug: string) {
  writeThumbFull({ slug, src: "", expanded: false });
  window.location.href = href;
}

/** 当前页：有封面则缩略图胀到 hero 尺寸再跳；缺封面 / 占位框走 slide-in */
export function expandThenGo(row: HTMLAnchorElement) {
  const href = row.getAttribute("href");
  if (!href) return;
  const slug = slugFromHref(href);
  const src = coverSrc(row);

  if (!src || reducedMotion()) {
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

  const { w: destW, h: destH } = destSize(row);
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

function slideRoot() {
  return (
    document.querySelector<HTMLElement>("body > article") ??
    document.querySelector<HTMLElement>("[data-art-show]")
  );
}

/** 详情 / 展示页：胀开已在上一页播完则只淡入文案；缺封面则整页 slide-in */
export function arriveThumbFull(slug: string, copy?: HTMLElement | null) {
  const data = readThumbFull();
  const root = document.documentElement;
  const match = Boolean(data && data.slug === slug);

  if (!match || reducedMotion()) {
    root.classList.remove("is-thumbfull", "is-thumbfull-arrive", "is-thumbfull-slide");
    clearThumbFull();
    return;
  }

  if (data?.expanded && copy) {
    root.classList.remove("is-thumbfull", "is-thumbfull-slide", "is-thumbfull-arrive");
    copy.animate(
      [
        { transform: "translateY(20px)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 560, easing: "ease-out", fill: "forwards" }
    );
  } else if (!data?.expanded) {
    root.classList.remove("is-thumbfull", "is-thumbfull-arrive");
    const page = slideRoot();
    if (page) {
      const anim = page.animate(
        [
          { transform: "translateY(30px)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 480, easing: "ease-out", fill: "forwards" }
      );
      const done = () => root.classList.remove("is-thumbfull-slide");
      anim.finished.then(done).catch(done);
    } else {
      root.classList.remove("is-thumbfull-slide");
    }
  } else {
    root.classList.remove("is-thumbfull", "is-thumbfull-arrive", "is-thumbfull-slide");
  }

  clearThumbFull();
}
