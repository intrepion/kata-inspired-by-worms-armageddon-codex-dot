# Verification evidence

## Automated domain verification

17 passing Node tests. Deterministic fixed-step physics; positive/negative wind; swept thin-wall collision; grenade bounce and fuse; blast falloff, carving and knockback; ammo and duplicate fire; pause; drowning and simultaneous draw; active death and timer rotation; dry spawn on three maps; falling through carved ground; serialized volley continuation; malformed save rejection and nested method safety; bounded AI matches on all maps; inaccessible survivors and tide termination; phase-guarded configuration.
Targeted red/green: initial terrain seam failed with missing engine, then passed after occupancy terrain implementation. Grenade fixture initially started too far above the collision surface; corrected to one pixel above for a verified bounce. Subsequent save/input regression tests demonstrate review fixes. No claim that every test was authored test-first.

## Actual supported Chrome gameplay

Played solo using visible controls in local Chrome at port 5211. New match, Jump and Walk right, Seed Pod fire; Hop Bomb fire with ammo falling from 3 to 2; Save during volley, Pause, Load save, Resume; Garden Glove fire. Screenshot showed multiple real circular turf holes with critters at new elevations and depleted HP. Nightshade won on turn 12: Marmalade 0 creatures/0 HP, Nightshade 3 creatures/231 HP. Rematch restored 3 creatures/300 HP per crew and the initial terrain. Some player turns expired during build/check work; this was an assisted QA loss, not a claimed skilled win. No hidden state edits or clock acceleration were used.
Hotseat on Salad Bowl: Pip glove volley, then visible Pickle turn 2 and manual second-crew fire. Moonlit Mulch firing range: bomb fire, unlimited inventory. Narrow viewport 390×844: stacked controls, all three weapon buttons, readable HUD, map/mode/save actions and field guide remained usable. Final production page reloaded in Chrome with updated bracket-key guide. Screenshots in docs/qa.

## Limitations

AI evaluates 50 impact-projectile trajectories and primarily uses Seed Pods; no strategic pathfinding or bomb planning. No online multiplayer, campaign, fall damage, or terrain collapse. Range creatures can be eliminated; New match resets targets. Rendering is accessible via named controls and textual HUD, but the spatial battlefield remains visual. Saves are explicit browser-local snapshots; no automatic cloud persistence. Sound is optional synthesized weapon tones. Physics knockback/fall/water effects verified automatically plus visible crater/elevation and elimination in the match; no numeric browser instrumentation used.
