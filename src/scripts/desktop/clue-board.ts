type BoardRoot = HTMLElement & { _boardOff?: () => void };

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initClueBoard(root: HTMLElement) {
  const host = root as BoardRoot;
  host._boardOff?.();

  const wall = root.querySelector<HTMLElement>("[data-clue-wall]");
  if (!wall) return;

  const items = [...root.querySelectorAll<HTMLElement>("[data-clue-item]")];
  const legend = root.querySelector<HTMLElement>(".bb-legend");
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mqMobile = window.matchMedia("(max-width: 639px)");
  const modals = [...root.querySelectorAll<HTMLElement>("[data-bb-modal]")];
  const offs: Array<() => void> = [];

  // 移动端浮层状态锁：防止重复触发
  let openId: string | null = null;

  function on(el: Window | Document | HTMLElement, type: string, fn: EventListener, opt?: AddEventListenerOptions) {
    el.addEventListener(type, fn, opt);
    offs.push(() => el.removeEventListener(type, fn, opt));
  }

  function clear() {
    items.forEach((item) => item.classList.remove("is-hot"));
    wall.classList.remove("is-focus");
    root.querySelectorAll<HTMLElement>(".bb-file-list li.is-open").forEach((li) => li.classList.remove("is-open"));
  }

  function focus(item: HTMLElement) {
    items.forEach((el) => el.classList.toggle("is-hot", el === item));
    wall.classList.add("is-focus");
  }

  function openModal(id: string) {
    if (openId === id) return;
    closeModal();
    openId = id;
    modals.forEach((m) => {
      const on = m.dataset.bbModal === id;
      m.classList.toggle("is-open", on);
      m.setAttribute("aria-hidden", String(!on));
    });
    root.classList.add("is-modal");
  }

  function closeModal() {
    if (!openId) return;
    openId = null;
    modals.forEach((m) => {
      m.classList.remove("is-open");
      m.setAttribute("aria-hidden", "true");
    });
    root.classList.remove("is-modal");
  }

  function finishEnter() {
    root.classList.remove("is-entering");
    items.forEach((item) => item.classList.add("is-stuck"));
    legend?.classList.add("is-in");
  }

  function playEnter() {
    // 移动端（<640px）卡片单列堆叠，跳过钉板入场动画，直接落地可见
    if (reduced() || mqMobile.matches) {
      finishEnter();
      return;
    }
    legend?.classList.add("is-in");
    items.forEach((item, i) => {
      window.setTimeout(() => {
        item.classList.add("is-sticking");
        item.addEventListener(
          "animationend",
          () => {
            item.classList.remove("is-sticking");
            item.classList.add("is-stuck");
            if (i === items.length - 1) root.classList.remove("is-entering");
          },
          { once: true }
        );
      }, 520 + i * 90);
    });
    window.setTimeout(finishEnter, 520 + items.length * 90 + 700);
  }

  playEnter();

  // 桌面端：钉板是固定视口，拦截滚轮防止页面滚动；移动端已改滚动页，放行整页滚动
  if (!mqMobile.matches) {
    on(window, "wheel", (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  items.forEach((item) => {
    on(item, "pointerenter", () => {
      if (coarse) return;
      focus(item);
    });
    on(item, "pointerleave", () => {
      if (coarse) return;
      clear();
    });
    on(item, "click", (e) => {
      if (!coarse) return;
      e.preventDefault();
      e.stopPropagation();
      if (mqMobile.matches) {
        // 移动端（<640px）：点击卡片 → 弹出详情浮层
        const id = item.dataset.bbOpen;
        if (id) openModal(id);
        return;
      }
      // 平板：保留原 hover 焦点切换（点开 / 再点收起）
      if (item.classList.contains("is-hot")) clear();
      else focus(item);
    });
  });

  on(wall, "click", (e) => {
    if (!coarse) return;
    if ((e.target as HTMLElement | null)?.closest("[data-clue-item]")) return;
    clear();
  });

  // 手机 tap 展开章节便利贴：仅平板保留；移动端改由浮层承载
  root.querySelectorAll<HTMLElement>(".bb-file-list li").forEach((li) => {
    on(li, "click", (e) => {
      if (!coarse || mqMobile.matches) return;
      e.preventDefault();
      e.stopPropagation();
      const open = li.classList.contains("is-open");
      li.parentElement
        ?.querySelectorAll<HTMLElement>("li.is-open")
        .forEach((o) => o.classList.remove("is-open"));
      if (!open) li.classList.add("is-open");
    });
  });

  // 移动端浮层关闭：点背景 / 空白 / 其他卡片（被遮罩拦截）→ 关；点内容区不误关
  modals.forEach((m) => {
    const btn = m.querySelector<HTMLElement>("[data-bb-close]");
    if (btn) on(btn, "click", () => closeModal());
  });

  on(document, "click", (e) => {
    if (!mqMobile.matches || !openId) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("[data-bb-modal-card]")) return; // 点内容区不关
    closeModal();
  });

  on(window, "keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape") closeModal();
  });

  host._boardOff = () => {
    offs.forEach((off) => off());
    host._boardOff = undefined;
  };
}
