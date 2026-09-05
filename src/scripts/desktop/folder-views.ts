// 桌面文件夹子状态：点红/黄文件夹打开 overlay，Escape / 关闭钮收回
import { initDevIndex } from "./dev-index";

export type FolderId = "dev" | "art" | "awards";

let currentFolder: FolderId | null = null;

function layerEl() {
  return document.getElementById("dt-folder-layer");
}

export function getCurrentFolder() {
  return currentFolder;
}

export function openFolder(id: FolderId) {
  const layer = layerEl();
  if (!layer) return;
  if (currentFolder === id && !layer.hidden) return;
  document.querySelectorAll<HTMLElement>("[data-pop]").forEach((el) => {
    el.hidden = true;
  });
  document.getElementById("dt-stage")?.classList.remove("is-fanned");
  document.querySelectorAll(".dt-card.is-open").forEach((el) => el.classList.remove("is-open"));
  currentFolder = id;
  layer.querySelectorAll<HTMLElement>("[data-folder-view]").forEach((view) => {
    view.hidden = view.dataset.folderView !== id;
  });
  const closeBtn = layer.querySelector<HTMLElement>("[data-folder-close]");
  if (closeBtn) closeBtn.hidden = id === "awards";
  layer.hidden = false;
  document.documentElement.classList.add("is-folder-open");
}

export function closeFolder() {
  const layer = layerEl();
  if (!layer) return;
  currentFolder = null;
  layer.querySelectorAll<HTMLElement>("[data-folder-view]").forEach((view) => {
    view.hidden = true;
  });
  layer.hidden = true;
  document.documentElement.classList.remove("is-folder-open");
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
    initDevIndex(artGallery);
  }

  const baked = document.documentElement.dataset.initialFolder;
  if (baked === "dev" || baked === "art" || baked === "awards") {
    openFolder(baked);
  } else {
    try {
      const pending = sessionStorage.getItem("lszbf:folder");
      if (pending === "dev" || pending === "art" || pending === "awards") {
        sessionStorage.removeItem("lszbf:folder");
        openFolder(pending);
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
      const card = t.closest<HTMLElement>("[data-open-folder]");
      if (!card) return;
      const id = card.dataset.openFolder as FolderId | undefined;
      if (id !== "dev" && id !== "art" && id !== "awards") return;
      e.preventDefault();
      openFolder(id);
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentFolder && currentFolder !== "awards") closeFolder();
  });
}
