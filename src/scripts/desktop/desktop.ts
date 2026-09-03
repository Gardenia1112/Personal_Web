// 拟物桌面系统（Phase 4）—— 窗口管理 / 拖拽 / 最小化 / 缩放
// 群岛架构：纯 DOM/CSS/vanilla JS，仅 /desktop 加载；范式参考 Reactbits 桌面窗口
import { desktopIcons, type DesktopIcon, type DesktopIconId } from "../../data/desktop";
import { projects } from "../../data/projects";

const APPS = Object.fromEntries(desktopIcons.map((icon) => [icon.id, icon])) as Record<
  DesktopIconId,
  DesktopIcon
>;

interface WinInstance {
  id: string;
  el: HTMLElement;
}

export function initDesktop(root: HTMLElement) {
  const windowsLayer = root.querySelector<HTMLElement>(".os-windows");
  if (!windowsLayer) return;

  const windows = new Map<string, WinInstance>();
  let zTop = 10;

  function bringToFront(el: HTMLElement) {
    el.style.zIndex = String(++zTop);
  }

  // 窗口内容：works 来自 projects 数据（01 §4），blog/resume 静态占位
  function contentFor(id: string): string {
    if (id === "works") {
      const items = projects
        .map(
          (p) => `
          <a class="os-file" href="/works/${p.slug}">
            <span class="os-file-name">${p.name}</span>
            <span class="os-file-meta">${p.role} · ${p.period}</span>
          </a>`
        )
        .join("");
      return `<div class="os-window-body">${items}</div>`;
    }
    if (id === "art") {
      const href = APPS.art.href;
      return `
        <div class="os-window-body">
          <p class="os-empty">美术作品（绘画 / 设计 / 建模 / 剪辑）。</p>
          <a class="os-file" href="${href}"><span class="os-file-name">前往美术作品 →</span></a>
        </div>`;
    }
    if (id === "blog") {
      const href = APPS.blog.href;
      return `
        <div class="os-window-body">
          <p class="os-empty">博客板块待启动（Phase 7 填充文章）。</p>
          <a class="os-file" href="${href}"><span class="os-file-name">前往博客 →</span></a>
        </div>`;
    }
    if (id === "resume") {
      const href = APPS.resume.href;
      return `
        <div class="os-window-body os-resume">
          <p class="os-empty">赵韵婷 · 游戏客户端开发工程师</p>
          <div class="os-resume-actions">
            <a class="os-btn os-btn-primary" href="${href}" target="_blank" rel="noopener">预览</a>
            <a class="os-btn" href="${href}" download>下载</a>
          </div>
        </div>`;
    }
    return "";
  }

  function buildWindow(app: DesktopIcon): WinInstance {
    const el = document.createElement("div");
    el.className = "os-window";
    el.style.left = `${96 + Math.random() * 48}px`;
    el.style.top = `${72 + Math.random() * 36}px`;
    el.innerHTML = `
      <div class="os-window-titlebar">
        <span class="os-window-title">${app.icon} ${app.windowTitle}</span>
        <div class="os-window-controls">
          <button class="os-btn os-min" title="最小化" aria-label="最小化">—</button>
          <button class="os-btn os-close" title="关闭" aria-label="关闭">✕</button>
        </div>
      </div>
      <div class="os-window-content">${contentFor(app.id)}</div>
      <div class="os-window-resize" title="拖拽缩放"></div>
    `;

    const titlebar = el.querySelector<HTMLElement>(".os-window-titlebar")!;
    const minBtn = el.querySelector<HTMLElement>(".os-min")!;
    const closeBtn = el.querySelector<HTMLElement>(".os-close")!;
    const resize = el.querySelector<HTMLElement>(".os-window-resize")!;

    makeDraggable(titlebar, el);
    makeResizable(resize, el);
    el.addEventListener("pointerdown", () => bringToFront(el));
    minBtn.addEventListener("click", () => {
      el.style.display = "none";
    });
    closeBtn.addEventListener("click", () => {
      el.remove();
      windows.delete(app.id);
    });

    return { id: app.id, el };
  }

  function openWindow(id: string) {
    const app = APPS[id];
    if (!app) return;
    const existing = windows.get(id);
    if (existing) {
      existing.el.style.display = "flex"; // 从最小化恢复
      bringToFront(existing.el);
      return;
    }
    const win = buildWindow(app);
    windowsLayer.appendChild(win.el);
    windows.set(id, win);
    bringToFront(win.el);
  }

  // 双击图标开窗
  root.querySelectorAll<HTMLElement>("[data-app]").forEach((icon) => {
    const app = icon.dataset.app;
    icon.addEventListener("dblclick", () => {
      if (app) openWindow(app);
    });
  });

  // ⚙️ 菜单下拉
  const menuBtn = root.querySelector<HTMLElement>("#os-menu-btn");
  const menuDropdown = root.querySelector<HTMLElement>("#os-menu-dropdown");
  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown?.classList.toggle("open");
  });
  document.addEventListener("click", () => menuDropdown?.classList.remove("open"));

  // Logo 贴纸拖拽
  const sticker = root.querySelector<HTMLElement>("#os-sticker");
  if (sticker) makeDraggable(sticker, sticker);
}

// 通用拖拽：pointer 事件，基于 offsetLeft/Top（与 style.left/top 同坐标系）
function makeDraggable(handle: HTMLElement, target: HTMLElement) {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const offX = target.offsetLeft;
    const offY = target.offsetTop;
    const move = (ev: PointerEvent) => {
      target.style.left = `${offX + (ev.clientX - startX)}px`;
      target.style.top = `${offY + (ev.clientY - startY)}px`;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
}

// 右下角缩放
function makeResizable(handle: HTMLElement, target: HTMLElement) {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = target.offsetWidth;
    const startH = target.offsetHeight;
    const move = (ev: PointerEvent) => {
      target.style.width = `${Math.max(260, startW + (ev.clientX - startX))}px`;
      target.style.height = `${Math.max(180, startH + (ev.clientY - startY))}px`;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
}
