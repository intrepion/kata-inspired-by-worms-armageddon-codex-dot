# Burrow Brigade

An original backyard artillery game: small critters, big crater energy. Private skirmish prototype built with TypeScript and Canvas. All art, terrain, names and sound are original.

## Play locally

```sh
cd /Users/intrepion/Documents/Codex/2026-10-12/task/kata-inspired-by-worms-armageddon-codex-dot
npm ci
npm run build
npm run preview -- --port 5211 --strictPort
```

Open http://127.0.0.1:5211. The delivered build is served by a session-only detached Vite preview process with its log at /tmp/burrow-brigade-5211.log. It has no boot/login persistence. Existing ports 5173–5210 were preserved.

Move with A/D or arrows, jump with W/↑, aim with [ / ], adjust power with +/−, fire with Space, pause with Escape. On-screen controls provide all actions. One volley per turn; water is fatal. The tide rises after turn 12. Solo AI, hotseat and range; three battlefields; Seed Pod, timed Hop Bomb and Garden Glove. Save/Load preserves terrain and in-flight volleys.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

See docs/SPEC.md, docs/DECISIONS.md, docs/REVIEWS.md and docs/QA.md for decisions, tests and actual browser evidence.
