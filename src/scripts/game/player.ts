// 侧面黄球：圆眼睛跟着鼠标看；只有键盘走路，碰到旗子会跳一下
import Phaser from "phaser";
import { WORLD_WIDTH } from "../../data/aboutGame";
import { footFx } from "./fx";

export enum PlayerState {
  Idle = "Idle",
  Running = "Running",
}

const SPEED = 340;
const ACCEL = 2200;
const DECEL = 2800;
const CLAMP_PAD = 40;
const BODY_R = 32;
const EYE_R = 13;
const PUPIL_R = 6;
const EYE_X = 12;
const EYE_Y = -6;
const PUPIL_TRAVEL = 5.5;

export class Player {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private body: Phaser.GameObjects.Arc;
  private eye: Phaser.GameObjects.Arc;
  private pupil: Phaser.GameObjects.Arc;
  private wink: Phaser.GameObjects.Graphics;
  private onHideHint: (() => void) | null = null;
  private state: PlayerState = PlayerState.Idle;
  private facing: 1 | -1 = 1;
  private eyeX = EYE_X;
  private vx = 0;
  private restY = 0;
  private hopping = false;
  private locked = false;
  private party = false;
  private hintOn = true;
  private stepCd = 0;
  private stepN = 0;

  get facingDir(): 1 | -1 {
    return this.facing;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.restY = y;

    this.body = scene.add.circle(0, 0, BODY_R, 0xf5c400);
    this.eye = scene.add.circle(EYE_X, EYE_Y, EYE_R, 0xffffff);
    this.pupil = scene.add.circle(EYE_X + 3, EYE_Y - 2, PUPIL_R, 0x111111);
    this.wink = scene.add.graphics();
    this.drawWink();
    this.wink.setVisible(false);

    this.container = scene.add.container(x, y, [this.body, this.eye, this.pupil, this.wink]);
  }

  setHintHandler(fn: () => void) {
    this.onHideHint = fn;
  }

  setRestY(y: number) {
    this.restY = y;
    if (!this.hopping) this.container.y = y;
  }

  setState(next: PlayerState) {
    if (next === this.state) return;
    this.state = next;
  }

  private spawnFootFx() {
    footFx(this.scene, this.container.x, this.container.y + BODY_R, this.facing, this.stepN);
  }

  hideHint() {
    if (!this.hintOn) return;
    this.hintOn = false;
    this.onHideHint?.();
  }

  private drawWink() {
    this.wink.clear();
    this.wink.lineStyle(6.5, 0x111111, 1);
    this.wink.beginPath();
    this.wink.moveTo(-8, -10);
    this.wink.lineTo(8, 0);
    this.wink.lineTo(-8, 10);
    this.wink.strokePath();
  }

  private setSquint(on: boolean) {
    this.eye.setVisible(!on);
    this.pupil.setVisible(!on);
    this.wink.setVisible(on);
  }

  hop() {
    if (this.hopping || this.party) return;
    this.hopping = true;
    this.setSquint(true);
    this.scene.tweens.add({
      targets: this.container,
      y: this.restY - 92,
      duration: 260,
      ease: "Quad.easeOut",
      yoyo: true,
      onComplete: () => {
        this.container.y = this.restY;
        this.hopping = false;
        this.setSquint(false);
      },
    });
  }

  lock() {
    this.locked = true;
    this.vx = 0;
  }

  celebrate() {
    this.lock();
    if (this.party) return;
    this.party = true;
    this.bounce();
  }

  hide() {
    this.party = false;
    this.locked = true;
    this.scene.tweens.killTweensOf(this.container);
    this.container.setVisible(false);
  }

  private bounce() {
    if (!this.party) return;
    this.hopping = true;
    this.setSquint(true);
    this.scene.tweens.add({
      targets: this.container,
      y: this.restY - 78,
      duration: 240,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.container.y = this.restY;
        this.hopping = false;
        this.setSquint(false);
        if (this.party) this.scene.time.delayedCall(90, () => this.bounce());
      },
    });
  }

  lookAt(worldX: number, worldY: number) {
    this.eyeX += (this.facing * EYE_X - this.eyeX) * 0.22;
    this.eye.x = this.eyeX;
    this.eye.y = EYE_Y;
    this.wink.setPosition(this.eyeX, EYE_Y);
    this.wink.setScale(this.facing, 1);

    if (this.hopping) return;

    const ex = this.container.x + this.eye.x;
    const ey = this.container.y + this.eye.y;
    const ang = Math.atan2(worldY - ey, worldX - ex);
    this.pupil.x = this.eye.x + Math.cos(ang) * PUPIL_TRAVEL;
    this.pupil.y = this.eye.y + Math.sin(ang) * PUPIL_TRAVEL;
  }

  update(dt: number, axis: number, lookX: number, lookY: number) {
    if (this.locked) {
      this.vx = 0;
      this.lookAt(lookX, lookY);
      return;
    }
    const target = Phaser.Math.Clamp(axis, -1, 1) * SPEED;
    const rate = Math.abs(target) > Math.abs(this.vx) ? ACCEL : DECEL;
    if (this.vx < target) this.vx = Math.min(target, this.vx + rate * dt);
    else this.vx = Math.max(target, this.vx - rate * dt);

    if (Math.abs(this.vx) > 10) {
      this.setState(PlayerState.Running);
      this.facing = this.vx > 0 ? 1 : -1;
      this.container.x = Phaser.Math.Clamp(this.container.x + this.vx * dt, CLAMP_PAD, WORLD_WIDTH - CLAMP_PAD);
      this.body.rotation += this.vx * dt * 0.035;
      this.hideHint();
      this.stepCd -= dt;
      if (this.stepCd <= 0) {
        this.stepCd = 0.1;
        this.stepN += 1;
        this.spawnFootFx();
      }
    } else {
      this.vx = 0;
      this.setState(PlayerState.Idle);
      this.stepCd = 0;
    }

    this.lookAt(lookX, lookY);
  }
}
