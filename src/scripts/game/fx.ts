// About 特效：配色与 Animocons / mo.js 的 Burst + 环 + 射线同构，画在 Phaser 里
import Phaser from "phaser";

export const FX_LEMON = 0xffef00;
export const FX_CREAM = 0xfffdd0;
export const FX_GOLD = 0xffd700;
export const FX_BRONZE = 0xb8860b;
export const FX_COLORS = [FX_LEMON, FX_CREAM, FX_GOLD, FX_BRONZE];

const DEPTH = 14;

function pick() {
  return FX_COLORS[Phaser.Math.Between(0, FX_COLORS.length - 1)];
}

function drop(obj: Phaser.GameObjects.GameObject) {
  obj.destroy();
}

function drawStar(g: Phaser.GameObjects.Graphics, r: number, color: number) {
  g.fillStyle(color, 1);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.38;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
}

export function ripple(
  scene: Phaser.Scene,
  x: number,
  y: number,
  opts: { start?: number; end?: number; stroke?: number; duration?: number; delay?: number; color?: number; alpha?: number } = {},
) {
  const start = opts.start ?? 10;
  const color = opts.color ?? pick();
  const ring = scene.add.circle(x, y, start, color, 0).setStrokeStyle(opts.stroke ?? 12, color, opts.alpha ?? 0.8).setDepth(DEPTH);
  scene.tweens.add({
    targets: ring,
    scale: (opts.end ?? 72) / start,
    alpha: 0,
    duration: opts.duration ?? 700,
    delay: opts.delay ?? 0,
    ease: "Sine.easeOut",
    onComplete: () => drop(ring),
  });
}

export function sparkDot(scene: Phaser.Scene, x: number, y: number, dx: number, dy: number, color = pick()) {
  const dot = scene.add.circle(x, y, Phaser.Math.Between(3, 6), color, 1).setDepth(DEPTH);
  scene.tweens.add({
    targets: dot,
    x: x + dx,
    y: y + dy,
    alpha: 0,
    scale: 0.15,
    duration: Phaser.Math.Between(360, 560),
    ease: "Quad.easeOut",
    onComplete: () => drop(dot),
  });
}

export function sparkStar(scene: Phaser.Scene, x: number, y: number, dx: number, dy: number, color = pick()) {
  const g = scene.add.graphics();
  drawStar(g, Phaser.Math.Between(5, 9), color);
  const wrap = scene.add.container(x, y, [g]).setDepth(DEPTH);
  scene.tweens.add({
    targets: wrap,
    x: x + dx,
    y: y + dy,
    alpha: 0,
    scaleX: 0.2,
    scaleY: 0.2,
    angle: Phaser.Math.Between(-80, 80),
    duration: Phaser.Math.Between(420, 640),
    ease: "Quad.easeOut",
    onComplete: () => drop(wrap),
  });
}

export function footFx(scene: Phaser.Scene, x: number, y: number, facing: 1 | -1, step: number) {
  const back = -facing;
  if (step % 2 === 0) {
    ripple(scene, x, y, { start: 5, end: 26, stroke: 3, duration: 360, color: pick(), alpha: 0.75 });
  }
  sparkDot(scene, x + Phaser.Math.Between(-8, 8), y, back * Phaser.Math.Between(10, 22), Phaser.Math.Between(8, 20));
  if (step % 3 === 0) {
    sparkStar(scene, x + Phaser.Math.Between(-6, 6), y, back * Phaser.Math.Between(8, 18), Phaser.Math.Between(6, 16));
  }
}

function speedLines(scene: Phaser.Scene, x: number, y: number) {
  const n = 16;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.1, 0.1);
    const g = scene.add.graphics().setDepth(DEPTH);
    const color = pick();
    const inner = 16;
    const outer = Phaser.Math.Between(78, 128);
    g.lineStyle(2.4, color, 0.95);
    g.lineBetween(Math.cos(ang) * inner, Math.sin(ang) * inner, Math.cos(ang) * outer, Math.sin(ang) * outer);
    g.setPosition(x, y);
    scene.tweens.add({
      targets: g,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 540,
      ease: "Cubic.easeOut",
      onComplete: () => drop(g),
    });
  }
}

export function fireworks(scene: Phaser.Scene, x: number, y: number) {
  const n = 20;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.18, 0.18);
    const swirl = (i % 2 === 0 ? 1 : -1) * 0.65;
    const dist = Phaser.Math.Between(70, 150);
    const dx = Math.cos(ang + swirl) * dist;
    const dy = Math.sin(ang + swirl) * dist;
    const color = pick();
    if (i % 3 === 0) sparkStar(scene, x, y, dx, dy, color);
    else sparkDot(scene, x, y, dx, dy, color);
  }
}

export function punch(scene: Phaser.Scene, target: Phaser.GameObjects.Container) {
  scene.tweens.killTweensOf(target);
  const y = target.y;
  scene.tweens.add({
    targets: target,
    scaleX: 1.08,
    scaleY: 0.9,
    duration: 90,
    yoyo: true,
    ease: "Quad.easeOut",
    onComplete: () => {
      target.setScale(1);
      target.y = y;
    },
  });
}

export function cardHitFx(scene: Phaser.Scene, x: number, y: number) {
  ripple(scene, x, y, { start: 12, end: 110, stroke: 16, duration: 720, color: FX_GOLD, alpha: 0.85 });
  ripple(scene, x, y, { start: 10, end: 84, stroke: 10, duration: 820, delay: 110, color: FX_LEMON, alpha: 0.7 });
  ripple(scene, x, y, { start: 8, end: 64, stroke: 6, duration: 680, delay: 220, color: FX_CREAM, alpha: 0.55 });

  const flash = scene.add.circle(x, y, 18, FX_CREAM, 0.95).setDepth(DEPTH + 1);
  scene.tweens.add({
    targets: flash,
    scale: 3.4,
    alpha: 0,
    duration: 280,
    ease: "Quad.easeOut",
    onComplete: () => drop(flash),
  });

  speedLines(scene, x, y);
  fireworks(scene, x, y);
}
