/**
 *
 * CHIP.ts - A CHIP-8 emulator in TypeScript
 * @author Darryl Walker
 *
 */

import Cpu from './drivers/cpu';
import Gfx from './drivers/gfx';

export default class Chip {
  /**
   * Configure our preferred target framerate
   * We'll also configure our frame pointer and play state
   * Timing function from https://gist.github.com/addyosmani/5434533#gistcomment-2018050
   */

  fps = 60;
  frame = 0;

  /**
   * stub our cpu and gfx so we can access them publicly
   */

  public cpu;
  public gfx;

  /**
   * i couldnt figure out how to make typescript happy with canvas so i've checked it can't be null up the chain - bit risky tho
   *
   * @param rom - a CHIP-8 rom file as a Uint8Array
   * @param canvas - an html canvas element for our renderer
   */

  constructor(rom: Uint8Array, canvas: any, fps?: number) {
    const gfx = new Gfx(canvas);
    const cpu = new Cpu(rom, gfx);

    if (fps) {
      this.fps = fps;
    }

    this.cpu = cpu;
    this.gfx = gfx;

    this.start(cpu, gfx);
  }

  /**
   * start will kick off our timing function
   * this is going to check 60 times per second
   * requestAnimationFrame is a browser API that helps us
   * with render timing
   */

  start(cpu: Cpu, gfx: Gfx) {
    /**
     * I just learned about performance
     * This is cool
     */

    let then: number = performance.now();

    const interval = 1000 / this.fps;
    const tolerance = 0.1;

    const animateLoop = (now: number) => {
      this.frame = requestAnimationFrame(animateLoop);

      const delta = now - then;

      if (delta >= interval - tolerance) {
        then = now - (delta % interval);

        /**
         * Code within this block is executed once per frame
         */

        cpu.next();

        const screen = cpu.display;
        gfx.paint(screen);
      }
    };

    /**
     * Once started the animateLoop function will call itself recursively
     */

    this.frame = requestAnimationFrame(animateLoop);
  }

  stop() {
    cancelAnimationFrame(this.frame);
  }
}
