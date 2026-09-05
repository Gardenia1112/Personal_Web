// A / D / ← / → 推小球。鼠标只转眼睛，不推球。
import Phaser from "phaser";

export class InputManager {
  private keys: Record<string, Phaser.Input.Keyboard.Key> | null;
  private leftAt = 0;
  private rightAt = 0;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    this.keys = kb ? (kb.addKeys("A,D,LEFT,RIGHT") as Record<string, Phaser.Input.Keyboard.Key>) : null;

    kb?.on("keydown-A", () => {
      this.leftAt = performance.now();
    });
    kb?.on("keydown-LEFT", () => {
      this.leftAt = performance.now();
    });
    kb?.on("keydown-D", () => {
      this.rightAt = performance.now();
    });
    kb?.on("keydown-RIGHT", () => {
      this.rightAt = performance.now();
    });
  }

  getAxis(): number {
    if (!this.keys) return 0;
    const left = this.keys.A.isDown || this.keys.LEFT.isDown;
    const right = this.keys.D.isDown || this.keys.RIGHT.isDown;
    if (left && right) return this.leftAt >= this.rightAt ? -1 : 1;
    if (left) return -1;
    if (right) return 1;
    return 0;
  }
}
