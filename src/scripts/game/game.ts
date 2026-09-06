// 游戏化 About —— Phaser 3 入口 + 主场景
// 群岛架构：Phaser 只在 /about 加载，首页 3D 与二级页 DOM 互不干扰
import * as Phaser from "phaser";
import {
  gameBoards,
  WORLD_WIDTH,
  FLAG_X_START,
  FLAG_GAP,
  PLAYER_START_X,
  TRIGGER_RANGE,
  type GameBoardData,
} from "../../data/aboutGame";
import { navigateWithTransition } from "../transition";
import { InputManager } from "./input";
import { Player } from "./player";
import { Flag } from "./board";
import { FX_BRONZE, FX_GOLD, cardHitFx, fireworks } from "./fx";

const NOW_CODE = `class Ability_Dash : Ability_Base { void Tick(float dt){ vx*=1.8f; } }
class Ability_Jump : Ability_Base { bool Can()=>grounded; }
FSM Idle->Run->Jump->Hurt->Death
objectPool.Get<Bullet>(); GC.Collect? no
Serialize(saveSlot) File.WriteAllBytes
eventBus.Emit("HIT") CodeReview LGTM
0x7FF 0xA855F7 git commit -m "client"
ScriptableObject rogue.choice[3]
state.Enter(); state.Exit();
using UnityEngine; using System.IO;
// 00d9ff a855f7 ffb974
void LateUpdate(){ LookAt(mouse); }
IEnumerator SpawnWave(){ yield return null; }
${"01 3F C# FSM POOL I/O GIT  ".repeat(18)}`;

class GameScene extends Phaser.Scene {
  private inputMgr!: InputManager;
  private player!: Player;
  private flags: Flag[] = [];
  private panelEl: HTMLElement | null = null;
  private floorY = 0;
  private trail!: Phaser.GameObjects.Graphics;
  private hintEl: HTMLElement | null = null;
  private panelBody: HTMLElement | null = null;
  private ctaEl: HTMLAnchorElement | null = null;
  private stageCover: string | null = null;
  private scrollTimer = 0;
  private scrollFade = 0;
  private scrollIdx = 0;
  private scrollTexts: string[] = [];
  private scrollEl: HTMLElement | null = null;
  private celebrating = false;
  private browsing = false;
  private browseIndex = 0;
  private wheelLock = false;
  private partyFx = 0;
  private onWheel: ((e: WheelEvent) => void) | null = null;

  constructor() {
    super({ key: "game" });
  }

  setPanelEl(el: HTMLElement | null) {
    this.panelEl = el;
  }

  create() {
    this.setPanelEl(this.registry.get("boardPanel") ?? null);
    const h = this.scale.height;
    this.placeOnFloor(h);

    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    this.trail = this.add.graphics().setDepth(1);

    this.flags = gameBoards.map((b, i) => new Flag(this, b, FLAG_X_START + i * FLAG_GAP, this.floorY, i));
    this.flags.forEach((f) => f.container.setDepth(2));

    this.player = new Player(this, PLAYER_START_X, this.floorY);
    this.player.container.setDepth(4);

    this.hintEl = document.getElementById("about-hint");
    this.panelBody = document.getElementById("board-panel-body");
    this.ctaEl = document.getElementById("about-ending-cta") as HTMLAnchorElement | null;
    this.ctaEl?.addEventListener("click", (e) => {
      e.preventDefault();
      const href = this.ctaEl?.getAttribute("href") || "/contact";
      navigateWithTransition(href);
    });
    this.player.setHintHandler(() => this.hintEl?.classList.remove("is-on"));

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, h);
    this.cameras.main.startFollow(this.player.container, true, 0.12, 0);
    this.pinBallLeft(this.scale.width);

    this.scale.on("resize", (size: Phaser.Structs.Size) => {
      this.placeOnFloor(size.height);
      this.player.setRestY(this.floorY);
      this.flags.forEach((f) => f.setY(this.floorY));
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, size.height);
      this.pinBallLeft(size.width);
    });

    this.inputMgr = new InputManager(this);
    this.bindWheel();

    document.getElementById("about-wipe")?.classList.add("is-away");

    this.input.keyboard?.on("keydown-ESC", () => {
      navigateWithTransition("/");
    });
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;
    const p = this.input.activePointer;
    if (!this.browsing) {
      this.player.update(dt, this.celebrating ? 0 : this.inputMgr.getAxis(), p.worldX, p.worldY);
      this.drawTrail();
      this.layoutHint();
      this.updateFlags();
    }
    if (this.celebrating && !this.browsing) {
      this.partyFx -= dt;
      if (this.partyFx <= 0) {
        this.partyFx = 0.55;
        fireworks(this, this.player.container.x, this.player.container.y - 20);
      }
    }
  }

  private placeOnFloor(h: number) {
    this.floorY = h - 72;
  }

  private pinBallLeft(viewW: number) {
    this.cameras.main.setFollowOffset(72 - viewW / 2, 0);
  }

  private bindWheel() {
    this.onWheel = (e: WheelEvent) => {
      if (!this.celebrating) return;
      e.preventDefault();
      if (this.wheelLock) return;
      const dir = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(dir) < 10) return;
      this.enterBrowse();
      const next = Phaser.Math.Clamp(this.browseIndex + (dir > 0 ? 1 : -1), 0, gameBoards.length - 1);
      if (next === this.browseIndex) return;
      this.wheelLock = true;
      this.browseIndex = next;
      this.renderPanel(gameBoards[next] ?? null);
      window.setTimeout(() => {
        this.wheelLock = false;
      }, 380);
    };
    window.addEventListener("wheel", this.onWheel, { passive: false });
  }

  private enterBrowse() {
    if (this.browsing) return;
    this.browsing = true;
    this.player.hide();
    this.flags.forEach((f) => f.hide());
    this.trail.clear();
    this.trail.setVisible(false);
    this.cameras.main.stopFollow();
    document.documentElement.classList.add("about-browse");
    this.hintEl?.classList.remove("is-on");
    this.browseIndex = Math.max(0, gameBoards.length - 1);
  }

  private layoutHint() {
    const el = this.hintEl;
    if (!el || !el.classList.contains("is-on")) return;
    const cam = this.cameras.main;
    const sx = this.player.container.x - cam.scrollX;
    const sy = this.player.container.y - cam.scrollY;
    const w = el.offsetWidth || 168;
    const h = el.offsetHeight || 44;
    const pad = 12;
    const left = Phaser.Math.Clamp(sx + 46, pad, this.scale.width - w - pad);
    const top = Phaser.Math.Clamp(sy - h / 2, pad, this.scale.height - h - pad);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  private drawTrail() {
    const x = this.player.container.x;
    this.trail.clear();
    if (this.browsing || this.celebrating || Math.abs(x - PLAYER_START_X) < 2) return;
    this.trail.lineStyle(12, FX_BRONZE, 0.18);
    this.trail.lineBetween(PLAYER_START_X, this.floorY, x, this.floorY);
    this.trail.lineStyle(4, FX_GOLD, 0.95);
    this.trail.lineBetween(PLAYER_START_X, this.floorY, x, this.floorY);
  }

  private updateFlags() {
    if (this.celebrating || this.browsing) return;
    const px = this.player.container.x;
    for (const flag of this.flags) {
      if (flag.collected) continue;
      if (Math.abs(flag.x - px) >= TRIGGER_RANGE) continue;
      flag.collect();
      this.renderPanel(flag.data);
      this.player.hop();
      cardHitFx(this, flag.x, flag.hitY);
      if (flag.data.id === "ending") this.startCelebrate();
      break;
    }
  }

  private startCelebrate() {
    if (this.celebrating) return;
    this.celebrating = true;
    this.browseIndex = gameBoards.length - 1;
    this.player.celebrate();
    this.flags.forEach((f) => {
      if (!f.collected) f.hide();
    });
    this.partyFx = 0;
    const line = this.hintEl?.querySelector("p");
    if (line) line.textContent = "滚轮左右查看介绍";
    this.hintEl?.classList.add("is-on");
  }

  private stopScroll() {
    if (this.scrollTimer) window.clearInterval(this.scrollTimer);
    if (this.scrollFade) window.clearTimeout(this.scrollFade);
    this.scrollTimer = 0;
    this.scrollFade = 0;
    this.scrollEl = null;
    this.scrollTexts = [];
  }

  private reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private paintScroll(animate: boolean) {
    const el = this.scrollEl;
    if (!el || !this.scrollTexts.length) return;
    const next = this.scrollTexts[this.scrollIdx];
    if (!animate || this.reduceMotion()) {
      el.classList.remove("is-out");
      el.classList.add("is-in");
      el.textContent = next;
      return;
    }
    el.classList.remove("is-in");
    el.classList.add("is-out");
    if (this.scrollFade) window.clearTimeout(this.scrollFade);
    this.scrollFade = window.setTimeout(() => {
      el.textContent = next;
      el.classList.remove("is-out");
      void el.offsetWidth;
      el.classList.add("is-in");
    }, 280);
  }

  private startScroll(texts: string[]) {
    this.stopScroll();
    if (!texts.length) return;
    this.scrollTexts = texts;
    this.scrollIdx = 0;
    this.scrollEl = document.getElementById("about-ending-scroll");
    this.paintScroll(false);
    this.scrollTimer = window.setInterval(() => {
      this.scrollIdx = (this.scrollIdx + 1) % this.scrollTexts.length;
      this.paintScroll(true);
    }, 2500);
  }

  private setCta(board: GameBoardData | null) {
    const el = this.ctaEl;
    if (!el) return;
    const cta = board?.cta;
    if (!cta) {
      el.classList.remove("is-on");
      return;
    }
    const href = cta.href || "#";
    if (!cta.href) console.warn("ending CTA missing href");
    el.innerHTML = `<span class="about-ending-cta-star" aria-hidden="true">✦</span>${cta.label}`;
    el.setAttribute("href", href);
    el.classList.add("is-on");
  }

  private fillCopy(board: GameBoardData | null) {
    const el = this.panelEl;
    const body = this.panelBody;
    if (!el || !body) return;
    this.stopScroll();
    this.setCta(board);
    if (!board) {
      body.innerHTML = "";
      el.classList.remove("visible", "has-stage");
      document.documentElement.classList.remove("about-staged");
      delete document.documentElement.dataset.aboutChapter;
      return;
    }
    document.documentElement.dataset.aboutChapter = board.id;
    const d = board;
    const no = String(d.index).padStart(2, "0");
    const deco = `<span class="about-deco" aria-hidden="true"><i class="d-star"></i><i class="d-cube"></i><i class="d-dot"></i><i class="d-hand"></i></span>`;
    const media = `
      <figure class="about-board-media">
        <div class="about-board-pic" style="background-image:url('${d.cover}')"></div>
      </figure>
    `;
    const wallOf = (shots: string[]) =>
      `<div class="about-wall">${shots
        .map((src, i) => `<figure class="about-polaroid is-${i}"><img src="${src}" alt="" /></figure>`)
        .join("")}</div>`;
    if (d.id === "start") {
      const [lead, ...rest] = d.lines;
      body.innerHTML = `
        <article class="about-board is-start">
          ${deco}
          ${wallOf(d.gallery ?? [d.cover])}
          <div class="about-board-copy">
            <p class="about-stage-kicker">${d.kicker}</p>
            <h2 class="about-stage-title">${d.title}</h2>
            <p class="about-lead">${lead}</p>
            <ol class="about-story">${rest.map((l, i) => `<li><em>0${i + 2}</em><span>${l}</span></li>`).join("")}</ol>
          </div>
          <p class="about-board-meta">${no} X · ${d.kicker}</p>
        </article>
      `;
    } else if (d.id === "turning") {
      body.innerHTML = `
        <article class="about-board is-turning">
          ${deco}
          ${wallOf(d.gallery ?? [d.cover])}
          <div class="about-board-copy">
            <p class="about-stage-kicker">${d.kicker}</p>
            <h2 class="about-stage-title">${d.title}</h2>
            <div class="about-notes">${d.lines.map((l) => `<p>${l}</p>`).join("")}</div>
          </div>
          <p class="about-board-meta">${no} X · ${d.kicker}</p>
        </article>
      `;
    } else if (d.id === "now") {
      const reel = [...(d.reel ?? []), ...(d.reel ?? [])]
        .map((src) => `<img src="${src}" alt="" />`)
        .join("");
      body.innerHTML = `
        <article class="about-board is-now">
          <pre class="about-code" aria-hidden="true">${NOW_CODE}</pre>
          ${deco}
          ${wallOf(d.gallery ?? [d.cover])}
          <div class="about-board-copy">
            <p class="about-stage-kicker">${d.kicker}</p>
            <h2 class="about-stage-title">${d.title}</h2>
            ${d.tagline ? `<p class="about-stage-tagline">${d.tagline}</p>` : ""}
            <ul class="about-facts">${d.lines.map((l) => `<li>${l}</li>`).join("")}</ul>
          </div>
          ${d.reel?.length ? `<div class="about-reel"><div class="about-reel-track">${reel}</div></div>` : ""}
          <p class="about-board-meta">${no} X · ${d.kicker}</p>
        </article>
      `;
    } else if (d.id === "ending") {
      body.innerHTML = `
        <article class="about-board is-ending">
          <div class="about-end-card">
            <p class="about-ending-scroll" id="about-ending-scroll"></p>
            <h2 class="about-end-title" data-title="${d.title}">${d.title}</h2>
            ${d.subtitle ? `<p class="about-end-sub">${d.subtitle}</p>` : ""}
          </div>
          <span class="about-end-deco" aria-hidden="true">
            <i class="end-star s1">✦</i>
            <i class="end-star s2">✦</i>
            <i class="end-star s3">✦</i>
            <i class="end-star s4">✦</i>
            <i class="end-star s5">✦</i>
            <i class="end-star s6">✦</i>
            <i class="end-pix pix-pad"></i>
            <i class="end-pix pix-arrow"></i>
            <i class="end-pix pix-bit"></i>
          </span>
        </article>
      `;
      this.startScroll(d.scrollTexts ?? []);
    }
    el.classList.remove("visible");
    void el.offsetWidth;
    el.classList.add("visible");
  }

  private renderPanel(board: GameBoardData | null) {
    const el = this.panelEl;
    if (!el) return;

    const from = this.stageCover;
    const to = board?.cover ?? null;
    if (from === to) {
      this.fillCopy(board);
      return;
    }

    this.stageCover = to;
    el.classList.add("is-ready");
    el.classList.toggle("has-stage", Boolean(board));
    document.documentElement.classList.toggle("about-staged", Boolean(board));
    this.fillCopy(board);
  }
}

export function createGameIntro(container: HTMLElement, panelEl: HTMLElement | null) {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    transparent: true,
    backgroundColor: "rgba(0,0,0,0)",
    scale: { mode: Phaser.Scale.RESIZE },
    scene: [GameScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set("boardPanel", panelEl);
      },
    },
  });
}
