// 展板实体：走进触发区「亮起」（发光边框 + 缩放 pop）
import Phaser from "phaser";
import type { GameBoardData } from "../../data/aboutGame";

export class Board {
  readonly container: Phaser.GameObjects.Container;
  readonly x: number;
  readonly data: GameBoardData;
  private scene: Phaser.Scene;
  private glow: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private active = false;

  constructor(scene: Phaser.Scene, data: GameBoardData, x: number, y: number) {
    this.scene = scene;
    this.data = data;
    this.x = x;

    const panel = scene.add.rectangle(0, 0, 230, 150, 0x1a1d24).setStrokeStyle(2, 0x2a2f3a);
    this.glow = scene.add.rectangle(0, 0, 244, 164, 0x00d9ff, 0);
    this.label = scene.add
      .text(0, 0, String(data.index).padStart(2, "0"), {
        fontFamily: "monospace",
        fontSize: "34px",
        color: "#00d9ff",
      })
      .setOrigin(0.5);

    this.container = scene.add.container(x, y, [this.glow, panel, this.label]);
  }

  setActive(active: boolean) {
    if (active === this.active) return;
    this.active = active;
    if (active) {
      this.scene.tweens.add({ targets: this.glow, fillAlpha: 0.55, duration: 220, ease: "Sine.easeOut" });
      this.scene.tweens.add({ targets: this.container, scale: 1.06, duration: 220, ease: "Back.easeOut" });
      this.label.setColor("#7ff3ff");
    } else {
      this.scene.tweens.add({ targets: this.glow, fillAlpha: 0, duration: 180 });
      this.scene.tweens.add({ targets: this.container, scale: 1, duration: 180 });
      this.label.setColor("#00d9ff");
    }
  }
}
