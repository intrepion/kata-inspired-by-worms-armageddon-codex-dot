# Autonomous design interview

User authorized recommended defaults without questions. Frontier 1: original creature skirmish, private repository, no monetization, desktop and mobile controls. Frontier 2: three creatures per crew; artillery physics, three weapons, bounded AI, hotseat, range; original vector drawing and synthesized sound. Frontier 3: destructible occupancy grid, fixed clock, serialization, rising tide and turn cap. Frontier 4: tests at public engine commands and physics interfaces; independent two-axis review against the initial documentation commit. All branches resolved within delegated scope.
Skills consulted: Matt Pocock grill-with-docs, grilling, domain-modeling, implement, tdd and code-review at github.com/mattpocock/skills. User authorization overrides interview confirmation and seam confirmation requirements. No tracker needed: docs/SPEC.md is the originating spec.


## 2026-10-14: charging defaults

The user authorized the focused Worms charging correction with recommended defaults, local implementation/tests/docs, and no optional questions. The PC manual's hold-Space/release shooting skill is the baseline: https://retrogamer.biz/wp-content/uploads/2015/10/Worms_Armageddon_-_Manual_-_PC.pdf (controls, pp.4–8 and 25). The exact original ramp rate has not been measured. We choose a linear two-second 10–100% ramp, capped until release, retaining the existing projectile speed mapping. This is an explicit prototype timing convention, not a claim of frame-exact original behavior. Garden Glove remains instant melee. Enter/assistive activation toggles charge/release for people who cannot maintain a hold; it uses the same timed meter rather than restoring the old preset skill.

Lifecycle interruptions discard held input, and charge is not restored from saves. The existing version-1 codec is kept for valid old saves and in-flight volleys. User instructions supersede the skills' optional interview/seam confirmations and the Implement skill's commit instruction; publication is handled separately by the coordinator after verification. Implement/TDD/Code Review and Grill with Docs/domain terminology were consulted.
