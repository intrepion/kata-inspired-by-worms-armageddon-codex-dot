import { test } from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.ts";
import { FireInput } from "../src/fire-input.ts";

test("only the initiating control can release a charge; repeats do not reset it", () => {
  const g = new Game(42, 0, "hotseat");
  const input = new FireInput(() => g);
  assert.equal(input.press("pointer"), true);
  for (let i = 0; i < 60; i++) g.step();
  assert.equal(input.press("space"), false);
  assert.equal(input.press("pointer"), false);
  assert.equal(g.power, 55);
  assert.equal(input.release("space"), false);
  assert.equal(g.projectile, null);
  assert.equal(input.release("pointer"), true);
  assert.ok(g.projectile);
  assert.equal(input.release("pointer"), false);
});

test("cancelled input cannot release a shot after resume or game replacement", () => {
  let g = new Game(42, 0, "hotseat");
  const input = new FireInput(() => g);
  for (const source of ["space", "pointer", "activation"] as const) {
    assert.equal(input.press(source), true);
    input.cancel(); // Pause, blur, visibility loss, pointer cancellation or Save/Load.
    g.setPaused(true);
    g.setPaused(false);
    assert.equal(input.release(source), false);
    assert.equal(g.projectile, null);
  }
  input.press("space");
  input.cancel();
  g = Game.load(new Game(42, 0, "hotseat").save());
  assert.equal(input.release("space"), false);
  assert.equal(g.projectile, null);
  assert.equal(input.press("pointer"), true);
  assert.equal(g.power, 10);
});

test("assistive activation toggles charging and fire; glove fires once on press", () => {
  const g = new Game(42, 0, "hotseat");
  const input = new FireInput(() => g);
  assert.equal(input.activate(), true);
  for (let i = 0; i < 30; i++) g.step();
  assert.equal(g.power, 32.5);
  assert.equal(g.projectile, null);
  assert.equal(input.activate(), true);
  assert.ok(g.projectile);
  assert.equal(input.activate(), false);
  const glove = new Game(42, 0, "hotseat");
  glove.configure({ weapon: "glove" });
  const melee = new FireInput(() => glove);
  assert.equal(melee.press("pointer"), true);
  assert.equal(glove.phase, "settle");
  const revision = glove.terrain.revision;
  assert.equal(melee.release("pointer"), false);
  assert.equal(melee.press("pointer"), false);
  assert.equal(glove.terrain.revision, revision);
});

test("a fresh input starts a new charge after the engine cancels the old one", () => {
  const g = new Game(42, 0, "hotseat");
  const input = new FireInput(() => g);
  input.activate();
  g.configure({ weapon: "bomb" });
  assert.equal(g.charging, false);
  assert.equal(input.activate(), true);
  assert.equal(g.charging, true);
  assert.equal(g.power, 10);
  input.cancel();
  input.press("space");
  g.next();
  assert.equal(input.press("pointer"), true);
  assert.equal(g.charging, true);
  assert.equal(input.release("space"), false);
  assert.equal(g.projectile, null);
});
