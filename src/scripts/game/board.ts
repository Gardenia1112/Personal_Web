// 小旗子：碰到就收起消失，不再当底边大卡
import * as Phaser from "phaser";
import { type GameBoardData } from "../../data/aboutGame";

const POLE_H = 86;
const COLORS = [0xffef00, 0xffd700, 0xf5c400, 0xff8ab8];

export class Flag {
  readonly container: Phaser.GameObjects.Container;
  readonly x: number;
  readonly data: GameBoardData;
  collected = false;
  private scene: Phaser.Scene;
  private cloth: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, data: GameBoardData, x: number, floorY: number, tintIndex: number) {
    this.scene = scene;
    this.data = data;
    this.x = x;

    const pole = scene.add.rectangle(0, -POLE_H / 2, 5, POLE_H, 0x6b5344);
    const cap = scene.add.circle(0, -POLE_H, 5, 0xffd700);
    this.cloth = scene.add.graphics();
    this.drawCloth(COLORS[tintIndex % COLORS.length]);

    this.container = scene.add.container(x, floorY, [pole, this.cloth, cap]);
    scene.tweens.add({
      targets: this.cloth,
      scaleX: { from: 1, to: 0.86 },
      duration: 700 + tintIndex * 80,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  setY(floorY: number) {
    this.container.y = floorY;
  }

  get y() {
    return this.container.y;
  }

  get hitY() {
    return this.container.y - 56;
  }

  hide() {
    this.scene.tweens.killTweensOf(this.cloth);
    this.container.setVisible(false);
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this.scene.tweens.killTweensOf(this.cloth);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y - 28,
      scaleX: 0.4,
      scaleY: 1.15,
      duration: 280,
      ease: "Back.easeIn",
      onComplete: () => this.container.setVisible(false),
    });
  }

  private drawCloth(color: number) {
    this.cloth.clear();
    this.cloth.fillStyle(color, 1);
    this.cloth.beginPath();
    this.cloth.moveTo(4, -POLE_H + 6);
    this.cloth.lineTo(54, -POLE_H + 28);
    this.cloth.lineTo(4, -POLE_H + 48);
    this.cloth.closePath();
    this.cloth.fillPath();
    this.cloth.lineStyle(2, 0xb8860b, 0.55);
    this.cloth.strokePath();
  }
}
