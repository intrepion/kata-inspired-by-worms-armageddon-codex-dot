import { test } from "node:test";
import assert from "node:assert/strict";
import { Game, type Projectile } from "../src/engine.ts";

test("holding builds shot power without firing; release fires exactly once", () => {
  const g = new Game(42, 0, "hotseat");
  assert.equal(g.beginCharge(), true);
  assert.equal(g.power, 10);
  assert.equal(g.projectile, null);
  for (let i = 0; i < 60; i++) g.step();
  assert.equal(g.power, 55);
  assert.equal(g.projectile, null);
  assert.equal(g.phase, "aim");
  assert.equal(g.releaseCharge(), true);
  assert.equal(g.phase, "flight");
  const projectile = g.projectile as Projectile | null;
  assert.ok(projectile);
  assert.ok(Math.abs(Math.hypot(projectile.vx, projectile.vy) - 301.5) < 0.001);
  assert.equal(g.releaseCharge(), false);
});

test("an expired charge cannot fire now or on the next captain's turn", () => {
  const g = new Game(42, 0, "hotseat");
  g.timer = 1 / 60;
  g.beginCharge();
  g.step();
  assert.equal(g.charging, false);
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.projectile, null);
  for (let i = 0; i < 120; i++) g.step();
  assert.equal(g.turn, 2);
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.projectile, null);
});

test("pause cancels a held shot and releasing after resume does nothing", () => {
  const g = new Game(42, 0, "hotseat");
  g.beginCharge();
  for (let i = 0; i < 30; i++) g.step();
  g.setPaused(true);
  const timer = g.timer;
  for (let i = 0; i < 60; i++) g.step();
  assert.equal(g.timer, timer);
  assert.equal(g.charging, false);
  g.setPaused(false);
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.projectile, null);
  assert.equal(g.beginCharge(), true);
  assert.equal(g.power, 10);
});

test("save cancels charging and valid old saves still load without a held shot", () => {
  const g = new Game(42, 0, "hotseat");
  g.beginCharge();
  for (let i = 0; i < 60; i++) g.step();
  const raw = g.save();
  assert.equal(g.charging, false);
  assert.equal(g.releaseCharge(), false);
  const saved = JSON.parse(raw);
  delete saved.state.charging; // Legacy version 1 contained no held-input state.
  saved.state.power = 65;
  const restored = Game.load(JSON.stringify(saved));
  assert.equal(restored.power, 65);
  assert.equal(restored.releaseCharge(), false);
  assert.equal(restored.projectile, null);
  saved.state.charging = true;
  const stray = Game.load(JSON.stringify(saved));
  assert.equal(stray.releaseCharge(), false);
  assert.equal(stray.beginCharge(), true);
  assert.equal(stray.power, 10);
});

test("weapon changes cancel a charge instead of releasing a different weapon", () => {
  const g = new Game(42, 0, "hotseat");
  g.beginCharge();
  g.configure({ weapon: "bomb" });
  assert.equal(g.charging, false);
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.projectile, null);
  assert.equal(g.captain.bombs, 3);
});

test("charging locks movement and an elapsed clock forbids releasing a shot", () => {
  const g = new Game(42, 0, "hotseat");
  g.beginCharge();
  g.move(-1);
  g.jump();
  assert.equal(g.captain.vx, 0);
  assert.equal(g.captain.vy, 0);
  g.timer = 0;
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.projectile, null);
});

test("full charge stays capped until release and a bomb spends one inventory", () => {
  const g = new Game(42, 0, "hotseat");
  g.configure({ weapon: "bomb" });
  g.beginCharge();
  for (let i = 0; i < 180; i++) g.step();
  assert.equal(g.power, 100);
  assert.equal(g.phase, "aim");
  assert.equal(g.projectile, null);
  assert.equal(g.captain.bombs, 3);
  assert.equal(g.releaseCharge(), true);
  assert.equal(g.captain.bombs, 2);
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.captain.bombs, 2);
});

test("glove is instant while unavailable ammunition and AI turns cannot charge", () => {
  const g = new Game(42, 0, "hotseat");
  g.configure({ weapon: "bomb" });
  g.captain.bombs = 0;
  assert.equal(g.beginCharge(), false);
  g.configure({ weapon: "glove" });
  assert.equal(g.beginCharge(), true);
  assert.equal(g.phase, "settle");
  assert.equal(g.charging, false);
  assert.equal(g.releaseCharge(), false);
  const ai = new Game();
  ai.next();
  assert.equal(ai.beginCharge(), false);
});

test("active death discards the charge and cannot fire on the next turn", () => {
  const g = new Game(42, 0, "hotseat");
  g.beginCharge();
  g.captain.hp = 0;
  g.step();
  assert.equal(g.charging, false);
  assert.equal(g.releaseCharge(), false);
  assert.equal(g.projectile, null);
});
