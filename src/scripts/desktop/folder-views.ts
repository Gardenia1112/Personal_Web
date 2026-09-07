// 桌面文件夹子状态：点红/黄文件夹打开 overlay，Escape / 关闭钮收回
import { initDevIndex } from "./dev-index";
import { initArtGallery } from "./art-gallery";
import { hideBlobs, showBlobs } from "./pink-blobs";

export type FolderId = "dev" | "art";

const SLIDE_MS = 480;
let currentFolder: FolderId | null = null;
let closeTimer = 0;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function layerEl() {
  return document.getElementById("dt-folder-layer");
}

export function getCurrentFolder() {
  return currentFolder;
}

function finishReturn() {
  document.documentElement.classList.remove("is-folder-return");
  delete document.documentElement.dataset.returnFolder;
}

export function openFolder(id: FolderId) {
  const layer = layerEl();
  if (!layer) return;
  if (currentFolder === id && !layer.hidden && layer.classList.contains("is-in")) return;
  document.querySelectorAll<HTMLElement>("[data-pop]").forEach((el) => {
    el.hidden = true;
  });
  document.getElementById("dt-stage")?.classList.remove("is-fanned");
  document.querySelectorAll(".dt-card.is-open").forEach((el) => el.classList.remove("is-open"));
  const returning = document.documentElement.classList.contains("is-folder-return");
  const alreadyIn = !layer.hidden && layer.classList.contains("is-in");
  currentFolder = id;
  layer.querySelectorAll<HTMLElement>("[data-folder-view]").forEach((view) => {
    view.hidden = view.dataset.folderView !== id;
  });
  const closeBtn = layer.querySelector<HTMLElement>("[data-folder-close]");
  if (closeBtn) closeBtn.hidden = true;
  window.clearTimeout(closeTimer);
  layer.classList.remove("is-out");
  layer.hidden = false;
  document.documentElement.classList.add("is-folder-open");
  if (id === "art") showBlobs();
  else hideBlobs();
  if (returning) {
    if (!layer.classList.contains("is-in") && !reducedMotion()) {
      requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("is-in")));
    } else {
      layer.classList.add("is-in");
    }
    window.setTimeout(finishReturn, reducedMotion() ? 0 : 440);
    return;
  }
  if (alreadyIn || reducedMotion()) {
    layer.classList.add("is-in");
    return;
  }
  layer.classList.remove("is-in");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => layer.classList.add("is-in"));
  });
}

function hideFolder(layer: HTMLElement) {
  currentFolder = null;
  layer.querySelectorAll<HTMLElement>("[data-folder-view]").forEach((view) => {
    view.hidden = true;
  });
  layer.hidden = true;
  layer.classList.remove("is-in", "is-out");
  document.documentElement.classList.remove("is-folder-open");
}

export function closeFolder() {
  const layer = layerEl();
  if (!layer || layer.hidden) return;
  hideBlobs();
  if (reducedMotion() || !layer.classList.contains("is-in")) {
    hideFolder(layer);
    return;
  }
  layer.classList.remove("is-in");
  layer.classList.add("is-out");
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => hideFolder(layer), SLIDE_MS);
}

export function initFolderViews() {
  const layer = layerEl();
  const devIndex = layer?.querySelector<HTMLElement>("[data-dev-index]");
  if (devIndex && !devIndex.dataset.wxBound) {
    devIndex.dataset.wxBound = "1";
    initDevIndex(devIndex);
  }
  const artGallery = layer?.querySelector<HTMLElement>("[data-art-gallery]");
  if (artGallery && !artGallery.dataset.wxBound) {
    artGallery.dataset.wxBound = "1";
    initArtGallery(artGallery);
  }

  const baked = document.documentElement.dataset.initialFolder;
  const returning = document.documentElement.dataset.returnFolder;
  if (baked === "dev" || baked === "art") {
    openFolder(baked);
  } else {
    try {
      const pending =
        returning === "dev" || returning === "art"
          ? returning
          : sessionStorage.getItem("lszbf:folder");
      if (pending === "dev" || pending === "art") {
        sessionStorage.removeItem("lszbf:folder");
        openFolder(pending);
      } else if (pending === "awards") {
        // 旧会话残留：奖项已迁工位
        sessionStorage.removeItem("lszbf:folder");
      }
    } catch {
      /* ignore */
    }
  }

  if (document.documentElement.dataset.folderViews === "1") return;
  document.documentElement.dataset.folderViews = "1";

  document.addEventListener(
    "click",
    (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-folder-close]")) {
        closeFolder();
        return;
      }
      if (t.closest(".dt-home") && (currentFolder === "dev" || currentFolder === "art")) {
        e.preventDefault();
        closeFolder();
        return;
      }
      const card = t.closest<HTMLElement>("[data-open-folder]");
      if (!card) return;
      const id = card.dataset.openFolder as FolderId | undefined;
      if (id !== "dev" && id !== "art") return;
      e.preventDefault();
      openFolder(id);
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !currentFolder) return;
    closeFolder();
  });
}
