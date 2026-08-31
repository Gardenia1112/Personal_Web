// 统一输入层：A/D 或 ←/→ 键盘 + 鼠标位置，输出归一化水平轴 [-1, 1]
// 优先级：键盘按住时优先于鼠标；鼠标为模拟量（指针相对屏幕中线的偏移）
import Phaser from "phaser";

export class InputManager {
  private keys: Record<string, Phaser.Input.Keyboard.Key> | null;
  private lastKeyboardAxis = 0;

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    this.keys = kb ? (kb.addKeys("A,D,LEFT,RIGHT") as Record<string, Phaser.Input.Keyboard.Key>) : null;
  }

  private keyboardAxis(): number {
    if (!this.keys) return 0;
    const left = this.keys.A.isDown || this.keys.LEFT.isDown;
    const right = this.keys.D.isDown || this.keys.RIGHT.isDown;
    if (left && right) return this.lastKeyboardAxis; // 同时按，取后按者
    if (left) {
      this.lastKeyboardAxis = -1;
      return -1;
    }
    if (right) {
      this.lastKeyboardAxis = 1;
      return 1;
    }
    return 0;
  }

  private mouseAxis(): number {
    const p = this.scene.input.activePointer;
    const w = this.scene.scale.width;
    const cx = w / 2;
    const dead = w * 0.12; // 中央死区
    const x = p.x - cx;
    if (Math.abs(x) <= dead) return 0;
    return Phaser.Math.Clamp(x / (cx - dead), -1, 1);
  }

  getAxis(): number {
    const k = this.keyboardAxis();
    if (k !== 0) return k;
    return this.mouseAxis();
  }
}
