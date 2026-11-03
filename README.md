# Burrow Brigade

[Kata Arcade](https://intrepion.github.io/)

An original backyard artillery game: small critters, big crater energy. Private skirmish prototype built with TypeScript and Canvas. All art, terrain, names and sound are original.

## Play locally

```sh
cd /Users/intrepion/Documents/Codex/2026-10-12/task/kata-inspired-by-worms-armageddon-codex-dot
npm ci
npm run build
npm run preview -- --port 5211 --strictPort
```

Open http://127.0.0.1:5211. The delivered build is served by a session-only detached Vite preview process with its log at /tmp/burrow-brigade-5211.log. It has no boot/login persistence. Existing ports 5173–5210 were preserved.

Move with A/D or arrows, jump with W/↑, aim with [ / ], hold Space or the Fire button to build power, then release to fire; pause with Escape. Shot power rises from 10% to 100% in two seconds, caps without automatically firing, and is shown by a live meter. The Garden Glove fires immediately. Enter on the focused Fire button or assistive activation starts charging; activate again to release. Pause, window blur, hidden tabs, cancelled/lost pointer capture, Save/Load, weapon changes, active death and turn expiry discard a held shot. A new press is required after an interruption. Movement and jumping are locked while charging. On-screen controls provide all actions. Seed Pods detonate on a creature or terrain, including the shooter if a shot returns. One volley per turn; water is fatal. The tide rises after turn 12. Solo AI, hotseat and range; three battlefields; Seed Pod, timed Hop Bomb and Garden Glove. Save/Load preserves terrain and in-flight volleys.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

See docs/SPEC.md, docs/DECISIONS.md, docs/REVIEWS.md and docs/QA.md for decisions, tests and actual browser evidence.

## Play online

[Play the hosted game](https://intrepion.github.io/kata-inspired-by-worms-armageddon-codex-dot/)

## Arcade metadata

See [docs/arcade-metadata.md](docs/arcade-metadata.md) for the game-owned manifest and screenshot provenance.

### Burrow Blink

The fourth tool relocates the active creature and spends its turn without dealing damage. Select Burrow Blink, then click a battlefield column; keyboard users can set Landing column and activate Fire. Each crew gets one blink per match, with unlimited uses in the range. Landings snap to the surface and reject water, blocked bodies and other living creatures. The AI currently uses its existing artillery planner, not blinks. The [original Worms Armageddon manual](https://retrogamer.biz/wp-content/uploads/2015/10/Worms_Armageddon_-_Manual_-_PC.pdf), printed p.23, describes click-targeted teleportation. Surface-only targeting and the ammunition budget are prototype choices. Existing saves receive one blink per crew.
