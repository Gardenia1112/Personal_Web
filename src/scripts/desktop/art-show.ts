export function initArtShowSkins() {
  initModelingSwap();
  initEditingReels();
}

function initModelingSwap() {
  const root = document.querySelector<HTMLElement>('[data-art-show="modeling"]');
  if (!root || root.dataset.asReady === "1") return;
  root.dataset.asReady = "1";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.addEventListener("click", (e) => {
    const thumb = (e.target as HTMLElement).closest<HTMLElement>("[data-as-thumb]");
    const hero = root.querySelector<HTMLElement>("[data-as-hero]");
    if (!thumb || !hero || !root.contains(thumb)) return;
    if (root.dataset.asSwapping === "1") return;

    const heroMedia = hero.querySelector<HTMLElement>(":scope > .as-media");
    const thumbMedia = thumb.querySelector<HTMLElement>(":scope > .as-media");
    if (!heroMedia || !thumbMedia) return;

    const heroIndex = hero.dataset.index ?? "";
    hero.dataset.index = thumb.dataset.index ?? "";
    thumb.dataset.index = heroIndex;

    const nextHero = thumbMedia.cloneNode(true) as HTMLElement;
    const nextThumb = heroMedia.cloneNode(true) as HTMLElement;

    if (reduce.matches) {
      heroMedia.replaceWith(nextHero);
      thumbMedia.replaceWith(nextThumb);
      return;
    }

    root.dataset.asSwapping = "1";
    crossfade(hero, heroMedia, nextHero);
    crossfade(thumb, thumbMedia, nextThumb, () => {
      root.dataset.asSwapping = "";
    });
  });
}

function crossfade(
  host: HTMLElement,
  outgoing: HTMLElement,
  incoming: HTMLElement,
  onDone?: () => void,
) {
  incoming.classList.add("as-media--in");
  host.append(incoming);
  outgoing.classList.add("is-out");
  void incoming.offsetWidth;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => incoming.classList.add("is-in"));
  });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    outgoing.remove();
    incoming.classList.remove("as-media--in", "is-in");
    onDone?.();
  };
  incoming.addEventListener("transitionend", (ev) => {
    if (ev.propertyName === "opacity") finish();
  });
  window.setTimeout(finish, 520);
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
