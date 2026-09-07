/** Codrops Alonso：悬停时临时移动 current，离开后回到页面当前项 */

const CURRENT = "menu__item--current";

export function initLineMenu(root?: ParentNode) {
  const menus = [...(root ?? document).querySelectorAll<HTMLElement>(".menu--alonso")];
  for (const menu of menus) {
    if (menu.dataset.lmInited === "1") continue;
    menu.dataset.lmInited = "1";

    const items = [...menu.querySelectorAll<HTMLElement>(".menu__item:not(.menu__line)")];
    const pageCurrent = items.find((el) => el.classList.contains(CURRENT)) ?? items[0];

    const setCurrent = (item: HTMLElement | null) => {
      items.forEach((el) => el.classList.remove(CURRENT));
      (item ?? pageCurrent)?.classList.add(CURRENT);
    };

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => setCurrent(item));
      item.addEventListener("focusin", () => setCurrent(item));
    });

    menu.addEventListener("mouseleave", () => setCurrent(pageCurrent));
    menu.addEventListener("focusout", (e) => {
      if (!menu.contains((e as FocusEvent).relatedTarget as Node | null)) {
        setCurrent(pageCurrent);
      }
    });
  }
}
