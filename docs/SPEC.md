# Burrow Brigade specification

Original canvas artillery skirmish: coral Marmalade crew versus teal Nightshade crew, three creatures each. Keyboard and named screen controls. AI by default; local hotseat and range optional. Three seeded terrain presets. No commercial assets.
Movement walks along solid turf, jumps, and falls through carved holes. Projectiles use fixed 1/60-second simulation and swept substeps; gravity and wind change trajectories. Seed Pod explodes on impact, Hop Bomb bounces with a 2.4-second fuse (three per creature), and Garden Glove is a short-range blast. Blast has radial damage, genuine terrain carving and knockback. Water and world exit kill creatures. All creatures settle before rotating crews; active death and simultaneous elimination are handled. Thirty-second turn deadline. Rising tide after turn 12 plus maximum 50 turns ensures termination. Pause halts physics and AI. Restart replaces all pending work. Saves preserve full terrain and simulation at fixed ticks; invalid saves fail safely.
AI searches bounded angle/power candidates, penalizes friendly damage, and fires a legal weapon. It must take finite turns and complete matches. Range explains controls and permits free weapon use.
Public test seams authorized by delegated requirement: terrain generation/carving and collision, projectile step, blast, match commands/step, save codec and AI planner. Test observable behavior, with targeted red/green evidence.


## Focused fidelity correction: weapon charging

Normal Space and pointer Fire use hold-and-release charging for Seed Pod and Hop Bomb. A hold starts at 10% power, reaches 100% in two seconds of simulation time, and caps until release. Release fires once; charging never spends ammunition. Garden Glove remains an instant melee action. Movement/jumping are locked during charge. Explicit keyboard/assistive activation of the Fire button toggles charge/release without a power preset. Mixed controls cannot release one another's holds and repeated presses do not reset charge.

Pause, blur, document hiding, pointer cancellation/lost capture, Save/Load, restart, weapon change, active death and turn expiry cancel pending input; a subsequent release cannot fire. Existing valid version-1 saves continue to load with the same terrain, units and projectile state; charging is transient. Tests use the public Game charge/pause/step/save commands and FireInput press/release/cancel/activation seam. No fuse, rope, camera, art or story changes are included.
