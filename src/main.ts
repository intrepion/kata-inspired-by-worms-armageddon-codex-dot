import { Game, W, H, DT, WEAPONS, type Mode, type Weapon } from "./engine";
import "./style.css";
const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
$("app").innerHTML =
  `<header><a class="brand" href="#">✳ BURROW BRIGADE</a><span>A tiny turf war.</span><button id="sound" aria-pressed="false">Sound off</button></header><main><section class="intro"><div><div class="eyebrow">BACKYARD BALLISTICS / VOL. 01</div><h1>Small critters.<br><em>Big crater energy.</em></h1></div><p>Claim your patch of paradise.<br>Try not to compost your friends.</p></section><section class="arena"><div class="score"><div id="coral"></div><div class="turn" id="turn" aria-live="polite"></div><div id="teal"></div></div><div class="world"><canvas id="game" width="960" height="540" aria-label="Artillery battlefield: creatures, terrain and projectile" tabindex="0"></canvas><div id="overlay" class="overlay" hidden></div><div class="map-tag" id="maptag"></div></div><div class="status"><span id="notice" role="status"></span><button id="pause">Pause</button></div><div class="controls"><div class="weapons" role="group" aria-label="Weapon selection">${Object.entries(
    WEAPONS,
  )
    .map(
      ([key, w], i) =>
        `<button data-weapon="${key}"><b>${["✦", "●", "☞"][i]} ${w.label}</b><small>${["Impact · unlimited", "Bounce · 2.4s fuse", "Close range · unlimited"][i]}</small></button>`,
    )
    .join(
      "",
    )}</div><div class="aim"><label>Angle <output id="anglevalue"></output><input id="angle" type="range" min="5" max="85" value="45"></label><label>Power <output id="powervalue"></output><input id="power" type="range" min="10" max="100" value="65"></label></div><div class="actions"><div><button id="left" aria-label="Walk left">←</button><button id="jump">Jump ↑</button><button id="right" aria-label="Walk right">→</button></div><button class="fire" id="fire">Fire! <small>SPACE</small></button></div></div></section><section class="bottom"><div class="setup"><label>Battlefield<select id="map"><option value="0">01 / Picnic Peaks</option><option value="1">02 / The Salad Bowl</option><option value="2">03 / Moonlit Mulch</option></select></label><label>Play mode<select id="mode"><option value="ai">Solo vs Nightshade AI</option><option value="hotseat">Local two-player hotseat</option><option value="range">Firing range</option></select></label><button id="new">New match</button><button id="save">Save</button><button id="load">Load save</button></div><details open><summary>Field guide</summary><p><b>1. Move</b> with ← → or A D, jump with W / ↑. Tap screen arrows to take a step. Facing follows movement.<br><b>2. Aim</b> with the sliders ([ ] angle; + − power). Wind bends shots. Dotted marks show the first second of flight, not the landing point.<br><b>3. Fire</b> with Space. One shot per turn. Hop Bombs bounce; the glove hits a nearby patch. Explosions carve real holes and throw critters. Water is fatal. After turn 12, the tide rises.<br><b>Escape</b> pauses. Hotseat alternates crews. Range is a sandbox with unlimited bombs. Saves include terrain and an in-flight volley.</p></details></section><footer>Grown from scratch. All creatures, maps and sounds are original. <span>KEEP YOUR ROOTS. LOSE THE TURF.</span></footer></main>`;
let game = new Game(),
  muted = true,
  audio: AudioContext | null = null;
const canvas = $<HTMLCanvasElement>("game"),
  ctx = canvas.getContext("2d")!;
const turf = document.createElement("canvas");
turf.width = 480;
turf.height = 270;
const tc = turf.getContext("2d")!;
let terrainRef = game.terrain,
  revision = -1;
function tone() {
  if (muted) return;
  audio ??= new AudioContext();
  void audio.resume();
  const o = audio.createOscillator(),
    v = audio.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(180, audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(45, audio.currentTime + 0.22);
  v.gain.setValueAtTime(0.15, audio.currentTime);
  v.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.3);
  o.connect(v);
  v.connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + 0.3);
}
function restart() {
  held.clear();
  acc = 0;
  game = new Game(
    42,
    Number($<HTMLSelectElement>("map").value),
    $<HTMLSelectElement>("mode").value as Mode,
  );
  sync();
}
function sync() {
  for (const t of [0, 1]) {
    const crew = game.units.filter((u) => u.team === t);
    $(t === 0 ? "coral" : "teal").innerHTML =
      `<b>${t === 0 ? "MARMALADE" : "NIGHTSHADE"}</b><span>${crew.filter((u) => u.hp > 0).length} critters · ${Math.ceil(crew.reduce((a, u) => a + u.hp, 0))} HP</span>`;
  }
  $("turn").innerHTML =
    `<b>${game.phase === "over" ? "GARDEN CLOSED" : game.captain.name + "'s turn"}</b><span>Turn ${game.turn} · ${Math.ceil(Math.max(0, game.timer))}s · Wind ${game.wind < 0 ? "←" : "→"} ${Math.abs(game.wind).toFixed(0)}</span>`;
  $("notice").textContent = game.notice;
  $("maptag").textContent = ["PICNIC PEAKS", "THE SALAD BOWL", "MOONLIT MULCH"][
    game.map
  ];
  $("anglevalue").textContent = game.angle + "°";
  $("powervalue").textContent = game.power + "%";
  $<HTMLInputElement>("angle").value = String(game.angle);
  $<HTMLInputElement>("power").value = String(game.power);
  const allowed = game.human && game.phase === "aim" && !game.paused;
  for (const id of ["fire", "left", "right", "jump", "angle", "power"])
    ($(id) as HTMLButtonElement).disabled = !allowed;
  document.querySelectorAll<HTMLButtonElement>("[data-weapon]").forEach((b) => {
    b.classList.toggle("selected", b.dataset.weapon === game.weapon);
    b.disabled =
      !allowed || (b.dataset.weapon === "bomb" && game.captain.bombs === 0);
    if (b.dataset.weapon === "bomb")
      b.querySelector("small")!.textContent =
        `Bounce · ${game.mode === "range" ? "∞" : game.captain.bombs} left · 2.4s`;
  });
  $("pause").textContent = game.paused ? "Resume" : "Pause";
  const over = $("overlay");
  over.hidden = !game.paused && game.phase !== "over";
  if (!over.hidden) {
    over.innerHTML = game.paused
      ? '<div class="eyebrow">TAKE A BREATHER</div><h2>Garden intermission.</h2><p>Your volley and turn clock are safely paused.</p><button id="resume">Resume</button>'
      : `<div class="eyebrow">THAT’S A WRAP</div><h2>${game.winner === null ? "Mutually composted." : game.winner === 0 ? "Marmalade takes the patch!" : "Nightshade takes the patch!"}</h2><p>${game.notice}</p><button id="rematch">Rematch</button>`;
    document.getElementById("resume")?.addEventListener("click", () => {
      game.paused = false;
      sync();
    });
    document.getElementById("rematch")?.addEventListener("click", restart);
  }
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#143541");
  sky.addColorStop(1, "#477169");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f2deaa";
  ctx.beginPath();
  ctx.arc(800, 80, 32, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#6c9180";
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 130, 350, 120, 90 + Math.sin(i) * 30, 0, 0, 7);
    ctx.fill();
  }
  if (terrainRef !== game.terrain || revision !== game.terrain.revision) {
    terrainRef = game.terrain;
    revision = terrainRef.revision;
    const im = tc.createImageData(480, 270);
    for (let y = 0; y < 270; y++)
      for (let x = 0; x < 480; x++) {
        const i = y * 480 + x;
        if (terrainRef.cells[i]) {
          const top = !terrainRef.cells[(y - 3) * 480 + x];
          const c = top
            ? [185, 202, 105]
            : (x * 7 + y * 13) % 31 < 3
              ? [148, 112, 76]
              : [109, 83, 62];
          im.data.set([...c, 255], i * 4);
        }
      }
    tc.putImageData(im, 0, 0);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(turf, 0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = "#44a6b8aa";
  ctx.fillRect(0, game.water, W, H - game.water);
  ctx.strokeStyle = "#91dde0";
  ctx.beginPath();
  for (let x = 0; x < W; x += 4) {
    const y = game.water + Math.sin(x / 22 + performance.now() / 700) * 2;
    if (!x) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (const u of game.units) {
    if (u.hp <= 0) continue;
    const active = u.id === game.active;
    ctx.save();
    ctx.translate(u.x, u.y);
    ctx.fillStyle = u.team === 0 ? "#f5a180" : "#79d2c0";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 12, 0, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-6, -11, 4, 8, -0.3, 0, 7);
    ctx.ellipse(6, -11, 4, 8, 0.3, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#102b33";
    ctx.beginPath();
    ctx.arc(-3, -3, 1.6, 0, 7);
    ctx.arc(4, -3, 1.6, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#102b33";
    ctx.beginPath();
    ctx.arc(1, 1, 3, 0, Math.PI);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "bold 12px system-ui";
    ctx.fillStyle = "#fff6df";
    ctx.fillText(u.name, 0, -35);
    ctx.fillStyle = "#152e35";
    ctx.fillRect(-17, -29, 34, 4);
    ctx.fillStyle = u.team === 0 ? "#f5a180" : "#79d2c0";
    ctx.fillRect(-17, -29, (34 * u.hp) / 100, 4);
    if (active && game.phase !== "over") {
      ctx.fillStyle = "#ffe098";
      ctx.beginPath();
      ctx.moveTo(-5, -49);
      ctx.lineTo(5, -49);
      ctx.lineTo(0, -41);
      ctx.fill();
    }
    ctx.restore();
  }
  if (game.phase === "aim") {
    const u = game.captain,
      a = (game.angle * Math.PI) / 180,
      v = 120 + game.power * 3.3;
    ctx.fillStyle = "#fff1b2";
    if (game.weapon === "glove") {
      ctx.strokeStyle = "#fff1b2";
      ctx.beginPath();
      ctx.arc(u.x + game.direction * 39, u.y - 2, 37, 0, 7);
      ctx.stroke();
    } else
      for (let i = 1; i <= 12; i++) {
        const t = i * 0.07,
          x =
            u.x +
            game.direction * (15 + Math.cos(a) * v * t) +
            (game.wind * t * t) / 2,
          y = u.y - 13 - Math.sin(a) * v * t + 105 * t * t;
        if (game.terrain.solid(x, y)) break;
        ctx.globalAlpha = 1 - i / 15;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 7);
        ctx.fill();
      }
    ctx.globalAlpha = 1;
  }
  if (game.projectile) {
    const p = game.projectile;
    ctx.fillStyle = p.weapon === "bomb" ? "#ffe09b" : "#f5a180";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, 7);
    ctx.fill();
  }
  if (game.blastVisual) {
    const b = game.blastVisual;
    ctx.fillStyle = `rgba(255,215,120,${b.life})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * (1 - b.life / 0.9), 0, 7);
    ctx.fill();
  }
}
$("new").onclick = restart;
$("pause").onclick = () => {
  game.paused = !game.paused;
  sync();
};
$("sound").onclick = () => {
  muted = !muted;
  $("sound").textContent = muted ? "Sound off" : "Sound on";
  $("sound").setAttribute("aria-pressed", String(!muted));
  tone();
};
$("fire").onclick = () => {
  if (game.fire()) tone();
  sync();
};
$("jump").onclick = () => game.jump();
for (const [id, dir] of [
  ["left", -1],
  ["right", 1],
] as const)
  $(id).onclick = () => {
    game.move(dir);
  };
for (const id of ["angle", "power"] as const)
  $(id).oninput = () => {
    game.configure({ [id]: Number($<HTMLInputElement>(id).value) });
    sync();
  };
document.querySelectorAll<HTMLButtonElement>("[data-weapon]").forEach(
  (b) =>
    (b.onclick = () => {
      game.configure({ weapon: b.dataset.weapon as Weapon });
      sync();
    }),
);
$("save").onclick = () => {
  try {
    localStorage.setItem("burrow-brigade-v1", game.save());
    game.notice = "Garden bottled. Save ready.";
  } catch {
    game.notice = "Storage unavailable. Your match continues.";
  }
  sync();
};
$("load").onclick = () => {
  try {
    const loaded = Game.load(localStorage.getItem("burrow-brigade-v1") ?? "");
    held.clear();
    acc = 0;
    game = loaded;
    $<HTMLSelectElement>("map").value = String(game.map);
    $<HTMLSelectElement>("mode").value = game.mode;
    game.notice = "Saved garden restored.";
  } catch {
    game.notice = "No valid save found. This garden is still yours.";
  }
  sync();
};
const held = new Set<string>();
addEventListener("keydown", (e) => {
  if ((e.target as HTMLElement).matches("input,select,button")) return;
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Escape"].includes(
      e.key,
    )
  )
    e.preventDefault();
  if (e.repeat && [" ", "Escape", "w", "ArrowUp"].includes(e.key)) return;
  held.add(e.key);
  if (e.key === "Escape") {
    game.paused = !game.paused;
    sync();
  }
  if (!game.human) return;
  if (e.key === " ") {
    if (game.fire()) tone();
  }
  if (e.key === "w" || e.key === "ArrowUp") game.jump();
  if (e.key === "[") game.configure({ angle: game.angle - 2 });
  if (e.key === "]") game.configure({ angle: game.angle + 2 });
  if (e.key === "+" || e.key === "=") game.configure({ power: game.power + 5 });
  if (e.key === "-") game.configure({ power: game.power - 5 });
  if (["1", "2", "3"].includes(e.key))
    game.configure({
      weapon: (["pod", "bomb", "glove"] as Weapon[])[Number(e.key) - 1],
    });
});
addEventListener("keyup", (e) => held.delete(e.key));
addEventListener("blur", () => {
  held.clear();
  game.paused = true;
  sync();
});
let last = performance.now(),
  acc = 0,
  ui = 0;
function frame(now: number) {
  acc += Math.min((now - last) / 1000, 0.1);
  last = now;
  while (acc >= DT) {
    if (held.has("a") || held.has("ArrowLeft")) game.move(-1);
    if (held.has("d") || held.has("ArrowRight")) game.move(1);
    game.step();
    acc -= DT;
  }
  draw();
  if (now - ui > 150) {
    sync();
    ui = now;
  }
  requestAnimationFrame(frame);
}
sync();
requestAnimationFrame(frame);
