/**
 *
 * CHIP.ts - A CHIP-8 emulator in TypeScript
 * @author Darryl Walker
 *
 */

import Cpu from './drivers/cpu';
import Gfx from './drivers/gfx';
import Keyboard from './drivers/keyboard';

export default class Chip {
  /**
   * Configure our preferred target framerate
   * We'll also configure our frame pointer and play state
   * Timing function from https://gist.github.com/addyosmani/5434533#gistcomment-2018050
   */

  speed = 100;
  frame = 0;

  /**
   * stub our cpu and gfx so we can access them publicly
   */

  public cpu;
  public gfx;
  public keyboard;

  /**
   * i couldnt figure out how to make typescript happy with canvas so i've checked it can't be null up the chain - bit risky tho
   *
   * @param rom - a CHIP-8 rom file as a Uint8Array
   * @param canvas - an html canvas element for our renderer
   */

  constructor(rom: Uint8Array, canvas: any) {
    const gfx = new Gfx(canvas);
    const cpu = new Cpu(rom, gfx);

    this.cpu = cpu;
    this.gfx = gfx;

    this.keyboard = new Keyboard(cpu);

    this.start(cpu, gfx);
  }

  /**
   * start will kick off our timing function
   * this is going to check 60 times per second
   * requestAnimationFrame is a browser API that helps us
   * with render timing
   */

  start(cpu: Cpu, gfx: Gfx) {
    let working = false;

    setInterval(() => {
      if (working) {
        return;
      }

      working = true;
      cpu.next();
      working = false;
    }, 1000 / this.speed);

    /**
     * let's start a clock
     */

    const animateLoop = () => {
      this.frame = requestAnimationFrame(animateLoop);

      const screen = cpu.display;
      gfx.paint(screen);
    };

    /**
     * Once started the animateLoop function will call itself recursively
     */

    this.frame = requestAnimationFrame(animateLoop);
  }

  /**
   * shut it all down fellas
   * only call this if you're about to destroy the class
   * this ensures event listeners and audio loops are destroyed
   */
  public stop() {
    cancelAnimationFrame(this.frame);
    this.cpu.halt();
  }
}
