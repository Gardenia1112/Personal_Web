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
  const offs: Array<() => void> = [];

  function on(el: Window | Document | HTMLElement, type: string, fn: EventListener, opt?: AddEventListenerOptions) {
    el.addEventListener(type, fn, opt);
    offs.push(() => el.removeEventListener(type, fn, opt));
  }

  function clear() {
    items.forEach((item) => item.classList.remove("is-hot"));
    wall.classList.remove("is-focus");
  }

  function focus(item: HTMLElement) {
    items.forEach((el) => el.classList.toggle("is-hot", el === item));
    wall.classList.add("is-focus");
  }

  function finishEnter() {
    root.classList.remove("is-entering");
    items.forEach((item) => item.classList.add("is-stuck"));
    legend?.classList.add("is-in");
  }

  function playEnter() {
    if (reduced()) {
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

  on(window, "wheel", (e) => {
    e.preventDefault();
  }, { passive: false });

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
      if (item.classList.contains("is-hot")) clear();
      else focus(item);
    });
  });

  on(wall, "click", (e) => {
    if (!coarse) return;
    if ((e.target as HTMLElement | null)?.closest("[data-clue-item]")) return;
    clear();
  });

  host._boardOff = () => {
    offs.forEach((off) => off());
    host._boardOff = undefined;
  };
}
