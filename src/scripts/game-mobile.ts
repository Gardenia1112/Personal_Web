// 流浪尸潮⑥：移动端（<640px）纯滑动页的折叠/展开交互。桌面端（>=900px）走 game-monitor.ts，本脚本不加载。
export function initGameMobile(root: HTMLElement) {
  // CH-03 源码：默认折叠，点「查看源码」展开/收起
  const toggle = root.querySelector<HTMLButtonElement>("[data-game-code-toggle]");
  const codeList = root.querySelector<HTMLElement>("[data-game-code-list]");
  if (toggle && codeList) {
    const setOpen = (open: boolean) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "收起源码" : "查看源码";
      codeList.classList.toggle("is-open", open);
    };
    setOpen(false);
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
  }

  // CH-03 长文件截断：点「展开全部」整段展开
  root.querySelectorAll<HTMLButtonElement>("[data-game-code-more]").forEach((btn) => {
    const file = btn.closest<HTMLElement>(".game-code-file");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "收起" : "展开全部";
      file?.classList.toggle("is-open", open);
    });
  });

  // CH-04 记录：手风琴（单开），点标题展开/收起
  const rows = [...root.querySelectorAll<HTMLElement>("[data-game-file-row]")];
  rows.forEach((row) => {
    const tab = row.querySelector<HTMLButtonElement>("[data-game-file-tab]");
    if (!tab) return;
    tab.setAttribute("aria-expanded", "false");
    tab.addEventListener("click", () => {
      const wasOpen = row.classList.contains("is-open");
      rows.forEach((r) => {
        r.classList.remove("is-open");
        r.querySelector<HTMLButtonElement>("[data-game-file-tab]")?.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        row.classList.add("is-open");
        tab.setAttribute("aria-expanded", "true");
      }
    });
  });
}
