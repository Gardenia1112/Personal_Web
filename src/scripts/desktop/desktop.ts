// /desktop 选择台（原生 JS + GSAP）
// 文件夹：悬停仍扇出预览；点击打开桌面子状态（开发索引 / 美术占位）
// 博客仍直接换页。Escape / 关闭钮收回子状态
import gsap from "gsap";
import { desktopEntries } from "../../data/desktop";
import { getCurrentFolder } from "./folder-views";

const ENTER_FLAG = "lszbf:dtx";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initDesktop(stage: HTMLElement) {
  const shelf = stage.querySelector<HTMLElement>("#dt-shelf");
  const veil = document.getElementById("dt-veil");
  const cardTip = document.getElementById("dt-card-tip");
  if (!shelf) return;

  const cards = new Map<string, HTMLElement>();
  stage.querySelectorAll<HTMLElement>("[data-entry]").forEach((el) => cards.set(el.dataset.entry!, el));
  const pops = new Map<string, HTMLElement>();
  stage.querySelectorAll<HTMLElement>("[data-pop]").forEach((el) => pops.set(el.dataset.pop!, el));
  const entryById = new Map(desktopEntries.map((e) => [e.id as string, e]));

  let current: string | null = null;
  let fanGen = 0;
  let openTimer = 0;
  let closeTimer = 0;

  /** 袋面左下 = 卡片飞出原点 */
  function originOf(card: HTMLElement) {
    const pocket = card.querySelector<HTMLElement>(".dt-folder-pocket") ?? card;
    const r = pocket.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + 6 };
  }

  function fanItems(pop: HTMLElement) {
    return Array.from(pop.querySelectorAll<HTMLElement>(".dt-fan-item"));
  }

  function sheetPose(card: HTMLElement, i: number, w: number, h: number) {
    const sheets = card.querySelectorAll<HTMLElement>(".dt-folder-sheet");
    const el = sheets[i] ?? card.querySelector<HTMLElement>(".dt-folder-pocket") ?? card;
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - w / 2,
      y: r.top + r.height / 2 - h / 2,
      scale: Math.max(0.28, Math.min(r.width / w, r.height / h)),
      rotate: -12 + i * 8,
    };
  }

  function belongsTo(id: string, target: EventTarget | null) {
    if (!(target instanceof Node)) return false;
    return Boolean(cards.get(id)?.contains(target) || pops.get(id)?.contains(target));
  }

  function hostOf(card: HTMLElement) {
    return (card.closest("li") as HTMLElement | null) ?? card;
  }

  function toLocal(host: HTMLElement, x: number, y: number) {
    const r = host.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  }

  function hideCardTip() {
    if (!cardTip) return;
    cardTip.classList.remove("is-on");
    cardTip.textContent = "";
  }

  function placeCardTip(item: HTMLElement) {
    if (!cardTip) return;
    const r = item.getBoundingClientRect();
    const tw = cardTip.offsetWidth;
    const th = cardTip.offsetHeight;
    const pointerX = 16;
    let left = r.left + r.width * 0.72 - (tw - pointerX);
    let top = r.top - th - 8;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    top = Math.max(8, top);
    cardTip.style.left = `${left}px`;
    cardTip.style.top = `${top}px`;
  }

  function showCardTip(item: HTMLElement) {
    if (!cardTip) return;
    const text = item.dataset.tip;
    if (!text) {
      hideCardTip();
      return;
    }
    cardTip.textContent = text;
    cardTip.classList.add("is-on");
    requestAnimationFrame(() => placeCardTip(item));
  }

  /** 袋口为圆心，对称扇形弹出（参考图：左右倾角、卡片落在袋口上方） */
  function playArc(pop: HTMLElement, card: HTMLElement, animate: boolean) {
    const items = fanItems(pop);
    if (!items.length) return;
    const n = items.length;
    const host = hostOf(card);
    const pocket = card.querySelector<HTMLElement>(".dt-folder-pocket") ?? card;
    const box = pocket.getBoundingClientRect();
    const origin = toLocal(host, originOf(card).x, originOf(card).y);
    const w = 126;
    const h = 126;
    const baseR = box.width * 0.74;
    const laid = items.map((item, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const deg = -50 + t * 100;
      const angle = deg * (Math.PI / 180);
      const from = sheetPose(card, i, w, h);
      const fromLocal = toLocal(host, from.x, from.y);
      return {
        item,
        i,
        from: { ...from, x: fromLocal.x, y: fromLocal.y },
        rotate: deg * 0.36,
        w,
        h,
        x: origin.x + Math.sin(angle) * baseR - w / 2,
        y: origin.y - Math.cos(angle) * baseR - h * 0.72,
      };
    });

    const pad = 16;
    const hostBox = host.getBoundingClientRect();
    laid.forEach((p) => {
      const left = hostBox.left + p.x;
      const right = left + p.w;
      if (left < pad) p.x += pad - left;
      if (right > window.innerWidth - pad) p.x -= right - (window.innerWidth - pad);
    });

    laid.forEach((p) => {
      p.item.dataset.z = String(20 + p.i);
      p.item.dataset.restY = String(p.y);
      p.item.classList.remove("is-front");
      gsap.killTweensOf(p.item);
      gsap.set(p.item, {
        position: "absolute",
        left: 0,
        top: 0,
        width: p.w,
        height: p.h,
        zIndex: 20 + p.i,
        transformOrigin: "50% 100%",
      });
      if (!animate || reducedMotion()) {
        gsap.set(p.item, { x: p.x, y: p.y, scale: 1, rotate: p.rotate, opacity: 1 });
        return;
      }
      gsap.fromTo(
        p.item,
        { x: p.from.x, y: p.from.y, scale: p.from.scale, rotate: p.from.rotate * 0.4, opacity: 1 },
        { x: p.x, y: p.y, scale: 1, rotate: p.rotate, opacity: 1, duration: 0.7, delay: 0.04 * p.i, ease: "expo.out" }
      );
    });
  }

  function packArc(pop: HTMLElement, card: HTMLElement) {
    hideCardTip();
    const items = fanItems(pop);
    const host = hostOf(card);
    items.forEach((item, i) => {
      item.classList.remove("is-front");
      gsap.killTweensOf(item);
      item.style.zIndex = item.dataset.z ?? String(20 + i);
      const w = item.offsetWidth || 126;
      const h = item.offsetHeight || 126;
      const to = sheetPose(card, i, w, h);
      const local = toLocal(host, to.x, to.y);
      gsap.to(item, {
        x: local.x,
        y: local.y,
        scale: to.scale,
        rotate: to.rotate,
        opacity: 0,
        duration: 0.36,
        delay: 0.03 * i,
        ease: "power2.in",
      });
    });
  }

  const open = (id: string, opts: { animate?: boolean } = {}) => {
    const card = cards.get(id);
    const pop = pops.get(id);
    if (!card || !pop || current === id) return;
    const { animate = true } = opts;
    const token = ++fanGen;

    if (current) {
      const prev = pops.get(current);
      const prevCard = cards.get(current);
      if (prev && prevCard) packArc(prev, prevCard);
      if (prev) {
        window.setTimeout(() => {
          if (token !== fanGen) return;
          prev.hidden = true;
        }, 380);
      }
      cards.get(current)?.classList.remove("is-open");
    }

    stage.classList.add("is-fanned");
    card.classList.add("is-open");
    pops.forEach((el, key) => {
      if (key !== id && key !== current) el.hidden = true;
    });
    pop.hidden = false;
    current = id;
    requestAnimationFrame(() => {
      if (current !== id) return;
      playArc(pop, card, animate);
    });
  };

  const closeFan = () => {
    if (!current) return;
    const id = current;
    const card = cards.get(id)!;
    const pop = pops.get(id);
    const token = ++fanGen;
    hideCardTip();

    if (pop) {
      packArc(pop, card);
      window.setTimeout(() => {
        if (token !== fanGen) return;
        pop.hidden = true;
        fanItems(pop).forEach((item) => gsap.set(item, { clearProps: "all" }));
      }, 380);
    }

    stage.classList.remove("is-fanned");
    card.classList.remove("is-open");
    current = null;
  };

  function intendOpen(id: string) {
    if (getCurrentFolder()) return;
    window.clearTimeout(closeTimer);
    window.clearTimeout(openTimer);
    if (current === id) return;
    openTimer = window.setTimeout(() => open(id), 40);
  }

  function intendClose(id: string) {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (current === id) closeFan();
    }, 180);
  }

  function leaveTo(href: string, kind: "rise" | "veil") {
    try {
      sessionStorage.removeItem("lszbf:thumbfull");
      sessionStorage.removeItem("lszbf:folder");
      sessionStorage.setItem(ENTER_FLAG, kind);
    } catch {
      /* 隐私模式：目标页没有入场动画 */
    }
    if (reducedMotion()) {
      window.location.href = href;
      return;
    }
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      window.location.href = href;
    };
    const tl = gsap.timeline({ onComplete: go });
    if (kind === "rise") {
      tl.to(stage, { y: "-14vh", opacity: 0, duration: 0.42, ease: "power2.in" }, 0);
    } else {
      tl.to(stage, { scale: 0.96, opacity: 0.25, duration: 0.3, ease: "power2.in" }, 0);
      if (veil) tl.to(veil, { autoAlpha: 1, duration: 0.34, ease: "power2.out" }, 0.04);
    }
    window.setTimeout(go, kind === "rise" ? 440 : 400);
  }

  function bindHoverZone(el: HTMLElement, id: string) {
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      intendOpen(id);
    });
    el.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch") return;
      if (belongsTo(id, e.relatedTarget)) return;
      intendClose(id);
    });
  }

  cards.forEach((card, id) => {
    const entry = entryById.get(id);
    const canFan = pops.has(id);

    if (canFan) {
      bindHoverZone(card, id);
      card.addEventListener("focus", () => intendOpen(id));
      card.addEventListener("blur", (e) => {
        if (belongsTo(id, e.relatedTarget)) return;
        intendClose(id);
      });
    }

    card.addEventListener("click", () => {
      if (entry?.action === "route" && entry.href) {
        leaveTo(entry.href, "veil");
      }
    });

    if (card.dataset.tip) {
      card.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch") return;
        showCardTip(card);
      });
      card.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "touch") return;
        if (belongsTo(id, e.relatedTarget)) return;
        hideCardTip();
      });
    }
  });

  function liftFanItem(item: HTMLElement) {
    item.classList.add("is-front");
    item.style.zIndex = "80";
    showCardTip(item);
    if (reducedMotion()) return;

    const pop = () => {
      if (!item.classList.contains("is-front")) return;
      const restY = Number(item.dataset.restY);
      if (!Number.isFinite(restY)) return;
      gsap.to(item, {
        y: restY - 12,
        scale: 1.08,
        duration: 0.48,
        ease: "back.out(1.6)",
        overwrite: "auto",
        onUpdate: () => {
          if (item.classList.contains("is-front")) placeCardTip(item);
        },
      });
    };

    const scale = Number(gsap.getProperty(item, "scale")) || 0;
    if (scale >= 0.9) {
      pop();
      return;
    }
    const wait = () => {
      if (!item.classList.contains("is-front")) return;
      const next = Number(gsap.getProperty(item, "scale")) || 0;
      if (next < 0.9) {
        gsap.delayedCall(0.08, wait);
        return;
      }
      pop();
    };
    gsap.delayedCall(0.08, wait);
  }

  function dropFanItem(item: HTMLElement, i: number) {
    item.classList.remove("is-front");
    item.style.zIndex = item.dataset.z ?? String(20 + i);
    hideCardTip();
    const restY = Number(item.dataset.restY);
    if (reducedMotion() || !Number.isFinite(restY)) return;
    gsap.to(item, {
      y: restY,
      scale: 1,
      duration: 0.34,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  pops.forEach((pop, id) => {
    fanItems(pop).forEach((item, i) => {
      bindHoverZone(item, id);
      item.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch") return;
        liftFanItem(item);
      });
      item.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "touch") return;
        dropFanItem(item, i);
      });
    });
  });

  stage.querySelectorAll<HTMLAnchorElement>("a[data-rise]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (getCurrentFolder()) return;
      leaveTo(a.getAttribute("href")!, "rise");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current && !getCurrentFolder()) closeFan();
  });
}
