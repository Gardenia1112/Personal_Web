// 游戏化 About —— Phaser 3 入口 + 主场景
// 群岛架构：Phaser 只在 /about 加载，首页 3D 与二级页 DOM 互不干扰
import Phaser from "phaser";
import {
  gameBoards,
  WORLD_WIDTH,
  BOARD_X_START,
  BOARD_GAP,
  PLAYER_START_X,
  TRIGGER_RANGE,
} from "../../data/aboutGame";
import { InputManager } from "./input";
import { Player } from "./player";
import { Board } from "./board";

class GameScene extends Phaser.Scene {
  private inputMgr!: InputManager;
  private player!: Player;
  private boards: Board[] = [];
  private activeBoard: Board | null = null;
  private panelEl: HTMLElement | null = null;
  private groundY = 0;

  constructor() {
    super({ key: "game" });
  }

  setPanelEl(el: HTMLElement | null) {
    this.panelEl = el;
  }

  create() {
    const h = this.scale.height;
    this.groundY = h * 0.74;

    this.cameras.main.setBackgroundColor("#0f1115");

    // 地面
    this.add.rectangle(WORLD_WIDTH / 2, this.groundY, WORLD_WIDTH, 4, 0x2a2f3a);

    // 4 个展板
    this.boards = gameBoards.map((b, i) => new Board(this, b, BOARD_X_START + i * BOARD_GAP, this.groundY - 80));

    // 玩家
    this.player = new Player(this, PLAYER_START_X, this.groundY - 22);

    // 相机（水平跟随，锁定世界边界）
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, h);
    this.cameras.main.startFollow(this.player.container, true, 0.12, 1);

    // 输入
    this.inputMgr = new InputManager(this);

    // ESC 返回工位
    this.input.keyboard?.on("keydown-ESC", () => {
      window.location.href = "/";
    });
  }

  update(_time: number, delta: number) {
    this.player.update(delta / 1000, this.inputMgr.getAxis());
    this.updateBoards();
  }

  private updateBoards() {
    const px = this.player.container.x;
    let nearest: Board | null = null;
    let minDist = Infinity;
    for (const b of this.boards) {
      const d = Math.abs(b.x - px);
      if (d < TRIGGER_RANGE && d < minDist) {
        nearest = b;
        minDist = d;
      }
    }
    if (nearest !== this.activeBoard) {
      this.activeBoard = nearest;
      for (const b of this.boards) b.setActive(b === nearest);
      this.renderPanel(nearest);
    }
  }

  private renderPanel(board: Board | null) {
    const el = this.panelEl;
    if (!el) return;
    if (!board) {
      el.classList.remove("visible");
      return;
    }
    const d = board.data;
    const tag = d.tagline ? `<p class="board-tagline">${d.tagline}</p>` : "";
    const lines = d.lines.map((l) => `<li>${l}</li>`).join("");
    el.innerHTML = `
      <div class="board-head">
        <span class="board-index">0${d.index}</span>
        <h2 class="board-title">${d.title}</h2>
      </div>
      ${tag}
      <ul class="board-lines">${lines}</ul>
    `;
    el.classList.add("visible");
  }
}

export function createGameIntro(container: HTMLElement, panelEl: HTMLElement | null) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: "#0f1115",
    scale: { mode: Phaser.Scale.RESIZE },
    scene: [GameScene],
  });
  const scene = game.scene.getScene("game") as GameScene;
  scene.setPanelEl(panelEl);
}
