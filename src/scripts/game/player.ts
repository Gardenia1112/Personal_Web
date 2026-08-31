// 像素小人（色块占位）—— 含 Idle/Running 状态机
import Phaser from "phaser";
import { WORLD_WIDTH } from "../../data/aboutGame";

export enum PlayerState {
  Idle = "Idle",
  Running = "Running",
}

const SPEED = 340; // px/s
const CLAMP_PAD = 40;

export class Player {
  readonly container: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Rectangle;
  private head: Phaser.GameObjects.Rectangle;
  private eye: Phaser.GameObjects.Rectangle;
  private legL: Phaser.GameObjects.Rectangle;
  private legR: Phaser.GameObjects.Rectangle;
  private state: PlayerState = PlayerState.Idle;
  private facing: 1 | -1 = 1;
  private walkT = 0;
  private idleT = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.body = scene.add.rectangle(0, -18, 34, 38, 0x00d9ff);
    this.head = scene.add.rectangle(0, -44, 26, 26, 0xf8fafc);
    this.eye = scene.add.rectangle(9, -44, 5, 5, 0x0f1115);
    this.legL = scene.add.rectangle(-9, 4, 12, 16, 0x1a1d24);
    this.legR = scene.add.rectangle(9, 4, 12, 16, 0x1a1d24);
    this.container = scene.add.container(x, y, [this.legL, this.legR, this.body, this.head, this.eye]);
  }

  setState(next: PlayerState) {
    if (next === this.state) return;
    this.state = next;
  }

  update(dt: number, axis: number) {
    if (axis !== 0) {
      this.setState(PlayerState.Running);
      this.facing = axis > 0 ? 1 : -1;
      this.container.x = Phaser.Math.Clamp(this.container.x + axis * SPEED * dt, CLAMP_PAD, WORLD_WIDTH - CLAMP_PAD);
      // 跑步腿部摆动
      this.walkT += dt * 12;
      const stride = Math.sin(this.walkT) * 6;
      this.legL.y = 4 + stride;
      this.legR.y = 4 - stride;
    } else {
      this.setState(PlayerState.Idle);
      this.legL.y = 4;
      this.legR.y = 4;
      this.idleT += dt;
    }
    // 朝向翻转（眼睛跟随方向）
    this.container.scaleX = this.facing;
    // 呼吸 / 跑步上下浮动
    const bob = this.state === PlayerState.Running ? Math.sin(this.walkT * 0.5) * 1.5 : Math.sin(this.idleT * 2.5) * 0.8;
    this.body.y = -18 + bob;
  }
}
