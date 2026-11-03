import { test } from "node:test";
import assert from "node:assert/strict";
import { Game, W } from "../src/engine.ts";
function candidate(g: Game) {
  for (let x = 20; x < W - 20; x += 10)
    if (Math.abs(x - g.captain.x) > 80 && g.teleportLanding(x)) return x;
  throw Error("No landing");
}
test("blink relocates without damage or terrain edits, spends crew ammo and the turn", () => {
  const g = new Game(4, 0, "hotseat");
  g.weapon = "teleport";
  const x = candidate(g),
    u = g.captain,
    terrain = g.terrain.cells.slice(),
    hp = g.units.map((u) => u.hp);
  assert.equal(g.teleport(x), true);
  assert.equal(u.x, x);
  assert.equal(u.vx, 0);
  assert.equal(g.phase, "settle");
  assert.equal(g.teleports[0], 0);
  assert.equal(g.projectile, null);
  assert.deepEqual(
    g.units.map((u) => u.hp),
    hp,
  );
  assert.deepEqual(g.terrain.cells, terrain);
  assert.equal(g.teleport(x + 20), false);
  for (let i = 0; i < 120 && g.turn === 1; i++) g.step();
  assert.equal(g.team, 1);
  assert.equal(g.teleports[1], 1);
});
test("invalid, occupied and flooded destinations preserve ammo and the current turn", () => {
  const g = new Game();
  g.weapon = "teleport";
  for (const x of [NaN, -2, 961, g.units[1].x])
    assert.equal(g.teleport(x), false);
  const x = candidate(g);
  g.water = 260;
  assert.equal(g.teleport(x), false);
  assert.equal(g.phase, "aim");
  assert.equal(g.teleports[0], 1);
});
test("pause, exhausted ammo and elapsed turns forbid blink; range is unlimited", () => {
  const g = new Game();
  g.weapon = "teleport";
  const x = candidate(g);
  g.paused = true;
  assert.equal(g.teleport(x), false);
  g.paused = false;
  g.teleports[0] = 0;
  assert.equal(g.teleport(x), false);
  g.teleports[0] = 1;
  g.timer = 0;
  assert.equal(g.teleport(x), false);
  const range = new Game(1, 0, "range");
  range.weapon = "teleport";
  assert.equal(range.teleport(candidate(range)), true);
  assert.equal(range.teleports[0], 1);
});
test("Fire activation blinks immediately without a held projectile charge", () => {
  const g = new Game();
  g.weapon = "teleport";
  g.destinationX = candidate(g);
  assert.equal(g.beginCharge(), true);
  assert.equal(g.charging, false);
  assert.equal(g.phase, "settle");
});
test("saves preserve crew ammunition and older saves receive one blink per crew", () => {
  const g = new Game();
  g.weapon = "teleport";
  g.destinationX = candidate(g);
  g.teleport(g.destinationX);
  const loaded = Game.load(g.save());
  assert.deepEqual(loaded.teleports, [0, 1]);
  assert.equal(loaded.captain.x, g.captain.x);
  const old = JSON.parse(g.save());
  delete old.state.teleports;
  delete old.state.destinationX;
  old.state.weapon = "pod";
  assert.deepEqual(Game.load(JSON.stringify(old)).teleports, [1, 1]);
  for (const teleports of [[2, 1], [-1, 1], [0.5, 1], null])
    assert.throws(() =>
      Game.load(JSON.stringify({ ...old, state: { ...old.state, teleports } })),
    );
});
