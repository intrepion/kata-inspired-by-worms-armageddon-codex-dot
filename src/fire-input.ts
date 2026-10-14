import type { Game } from "./engine";

export type FireSource = "space" | "pointer" | "activation";

// A release belongs to the control that began the hold, even if other inputs occur.
export class FireInput {
  private source: FireSource | null = null;
  constructor(private getGame: () => Game) {}

  private currentSource() {
    if (!this.getGame().charging) this.source = null;
    return this.source;
  }
  press(source: FireSource) {
    if (this.currentSource() !== null) return false;
    const game = this.getGame();
    if (!game.beginCharge()) return false;
    if (game.charging) this.source = source;
    return true;
  }
  release(source: FireSource) {
    if (this.currentSource() !== source) return false;
    this.source = null;
    return this.getGame().releaseCharge();
  }
  activate() {
    return this.currentSource() === "activation"
      ? this.release("activation")
      : this.press("activation");
  }
  cancel() {
    this.source = null;
    this.getGame().cancelCharge();
  }
}
