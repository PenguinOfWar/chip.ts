/**
 *
 * CHIP.ts - A CHIP-8 emulator in TypeScript
 * @author Darryl Walker
 *
 */

import Cpu from './drivers/cpu';

export default class Chip {
  /**
   * Configure our preferred target framerate
   * We'll also configure our frame pointer and play state
   * Timing function from https://gist.github.com/addyosmani/5434533#gistcomment-2018050
   */

  fps = 60;
  frame = 0;

  constructor(rom: Uint8Array) {
    this.start(new Cpu(rom));
  }

  /**
   * start will kick off our timing function
   * this is going to check 60 times per second
   * requestAnimationFrame is a browser API that helps us
   * with render timing
   */

  start(cpu: Cpu) {
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

        cpu.tick();
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
