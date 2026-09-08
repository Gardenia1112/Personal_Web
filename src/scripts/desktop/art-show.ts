export function initArtShowSkins() {
  initEditingReels();
}

function initEditingReels() {
  const root = document.querySelector<HTMLElement>('[data-art-show="editing"]');
  if (!root || root.dataset.asReady === "1") return;
  root.dataset.asReady = "1";

  root.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("video")) return;
    const reel = t.closest<HTMLElement>("[data-as-reel]");
    if (!reel || !root.contains(reel)) return;

    const wasOpen = reel.classList.contains("is-open");
    root.querySelectorAll<HTMLElement>("[data-as-reel].is-open").forEach((el) => {
      el.classList.remove("is-open");
      pauseReel(el);
    });
    if (wasOpen) return;

    reel.classList.add("is-open");
    playReel(reel);
  });
}

function playReel(reel: HTMLElement) {
  const video = reel.querySelector("video");
  if (!video) return;
  video.currentTime = 0;
  const start = () => video.play().catch(() => {
    video.muted = true;
    return video.play().catch(() => {});
  });
  start();
}

function pauseReel(reel: HTMLElement) {
  const video = reel.querySelector("video");
  if (!video) return;
  video.pause();
}
