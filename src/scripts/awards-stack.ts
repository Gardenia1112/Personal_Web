// /awards · 悬停展开 + 跟随滚视：当前夹始终落在可视区内
const TONES = ["moss", "fern", "sage", "mint", "leaf", "mist"] as const;

let root: HTMLElement | null = null;
let bound = false;
let leaveTimer = 0;
let scrollTimer = 0;
let openFolder: HTMLElement | null = null;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTone(folder: HTMLElement, tone: string) {
  for (const t of TONES) folder.classList.remove(`as-folder--${t}`);
  folder.classList.add(`as-folder--${tone}`);
}

function bringTabFront(folder: HTMLElement, tab: HTMLElement) {
  const index = tab.dataset.asIndex ?? "0";
  folder.querySelectorAll<HTMLElement>("[data-as-tab]").forEach((t) => {
    const on = t === tab;
    t.classList.toggle("is-front", on);
    t.setAttribute("aria-pressed", on ? "true" : "false");
  });
  folder.querySelectorAll<HTMLElement>("[data-as-card]").forEach((card) => {
    card.hidden = card.dataset.asIndex !== index;
  });
  const tone = tab.dataset.asTone;
  if (tone) applyTone(folder, tone);
  if (folder.classList.contains("is-open")) keepFolderInView(folder);
}

/** 把当前夹滚进视野：标签顶边留白，展开后尽量看全，必要时上下跟滚 */
function keepFolderInView(folder: HTMLElement) {
  window.clearTimeout(scrollTimer);
  const run = () => {
    const rect = folder.getBoundingClientRect();
    const vh = window.innerHeight;
    const topPad = 72; // 避开回工位钮 + 标签探出
    const bottomPad = 16;
    let delta = 0;

    if (rect.top < topPad) {
      delta = rect.top - topPad;
    } else if (rect.bottom > vh - bottomPad) {
      delta = rect.bottom - (vh - bottomPad);
      // 夹很高时优先保证顶部标签可见
      if (rect.top - delta < topPad) {
        delta = rect.top - topPad;
      }
    }

    if (Math.abs(delta) < 3) return;
    window.scrollBy({
      top: delta,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  // 等 CSS 展开高度落地后再量（约 280ms）
  requestAnimationFrame(() => {
    run();
    scrollTimer = window.setTimeout(run, 300);
  });
}

function setOpen(folder: HTMLElement, open: boolean) {
  const toggle = folder.querySelector<HTMLElement>("[data-as-toggle]");
  const label = folder.querySelector<HTMLElement>("[data-as-toggle-label]");
  const chevron = folder.querySelector<HTMLElement>(".as-chevron");
  folder.classList.toggle("is-open", open);
  toggle?.setAttribute("aria-expanded", open ? "true" : "false");
  if (label) label.textContent = open ? "收起" : "展开";
  if (chevron) chevron.textContent = open ? "∨" : "<";
}

function openFolderEl(folder: HTMLElement) {
  if (openFolder && openFolder !== folder) {
    setOpen(openFolder, false);
    openFolder.classList.remove("is-hot");
  }
  setOpen(folder, true);
  folder.classList.add("is-hot");
  openFolder = folder;
  keepFolderInView(folder);
}

function closeFolderEl(folder: HTMLElement) {
  setOpen(folder, false);
  folder.classList.remove("is-hot");
  if (openFolder === folder) openFolder = null;
}

function lightboxEl() {
  return document.querySelector<HTMLElement>("[data-as-lightbox]");
}

function openLightbox(src: string) {
  const box = lightboxEl();
  const img = box?.querySelector<HTMLImageElement>("[data-as-lightbox-img]");
  if (!box || !img) return;
  img.src = src;
  box.classList.add("show");
  box.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  const box = lightboxEl();
  if (!box) return;
  box.classList.remove("show");
  box.setAttribute("aria-hidden", "true");
  const img = box.querySelector<HTMLImageElement>("[data-as-lightbox-img]");
  if (img) img.removeAttribute("src");
}

export function initAwardsStack() {
  root = document.querySelector<HTMLElement>("[data-awards-stack]");
  if (!root || bound) return;
  bound = true;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 触屏没有「悬停」，简介里的交互说明改为「点按」
  const lede = document.querySelector<HTMLElement>(".as-lede");
  if (lede && !fine) {
    lede.textContent = "奖项按时间叠成文件柜；同层最多三份。点按标签把文件抽到前面，点按整层即展开，再点收起。";
  }

  root.querySelectorAll<HTMLElement>("[data-as-folder]").forEach((folder) => {
    folder.addEventListener("mouseenter", () => {
      window.clearTimeout(leaveTimer);
      folder.classList.add("is-hot");
      if (fine) openFolderEl(folder);
    });

    folder.addEventListener("mouseleave", () => {
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        closeFolderEl(folder);
      }, 80);
    });
  });

  root.addEventListener(
    "pointerover",
    (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tab = t.closest<HTMLElement>("[data-as-tab]");
      if (!tab) return;
      const folder = tab.closest<HTMLElement>("[data-as-folder]");
      if (folder) bringTabFront(folder, tab);
    },
    true
  );

  if (!fine) {
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-as-preview]") || t.closest("[data-as-pdf-open]") || t.closest("a[download]") || t.closest(".as-embed-link")) return;
      const tab = t.closest<HTMLElement>("[data-as-tab]");
      if (tab) {
        const folder = tab.closest<HTMLElement>("[data-as-folder]");
        if (folder) {
          bringTabFront(folder, tab);
          openFolderEl(folder);
        }
        return;
      }
      const folder = t.closest<HTMLElement>("[data-as-folder]");
      if (!folder) return;
      if (folder.classList.contains("is-open")) closeFolderEl(folder);
      else openFolderEl(folder);
    });
  }

  root.addEventListener("click", (e) => {
    const t = e.target as HTMLElement | null;
    const preview = t?.closest<HTMLElement>("[data-as-preview]");
    if (preview?.dataset.asPreview) {
      e.preventDefault();
      openLightbox(preview.dataset.asPreview);
    }
  });

  // PDF 默认不挂载 iframe：点「查看 PDF」才加载，避免首屏拉浏览器 PDF 查看器（任务 13）
  root.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-as-pdf-open]");
    const src = btn?.dataset.asPdfOpen;
    if (!btn || !src) return;
    const box = btn.closest<HTMLElement>("[data-as-pdf]");
    e.preventDefault();
    const frame = document.createElement("iframe");
    frame.src = `${src}#view=FitH`;
    frame.title = btn.getAttribute("aria-label") ?? "PDF 证书";
    frame.loading = "lazy";
    box?.classList.add("is-open");
    box?.insertBefore(frame, box.firstChild);
    btn.remove();
  });

  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    if (t.closest("[data-as-lightbox-close]") || t.matches("[data-as-lightbox]")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}
