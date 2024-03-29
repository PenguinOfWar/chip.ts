/**
 *
 * CHIP.ts - A CHIP-8 emulator in TypeScript
 * @author Darryl Walker
 *
 */

import Cpu from './drivers/cpu';
import Gfx from './drivers/gfx';
import Keyboard from './drivers/keyboard';
import { IChip, IChipContext } from './types/chip.types';

/**
 * export some common stuff
 */

export const games = [
  'Brix',
  'Invaders',
  'Tetris',
  'Pong',
  'UFO',
  'IBM',
  'Missile',
  'Tank',
  'Maze'
];

export const keypad = [
  ['1', '2', '3', '4'],
  ['q', 'w', 'e', 'r'],
  ['a', 's', 'd', 'f'],
  ['z', 'x', 'c', 'v']
];

export const instructions: IInstructions = {
  brix: 'Left: Q | Right: E',
  tetris: 'Left: W | Right: E | Rotate: Q',
  pong: 'P1 Up: 1 | P1 Down: Q | P2 Up: 4 | P2 Down: R',
  ufo: 'Up/Left: Q | Up: W | Up/Right: E',
  ibm: 'None',
  invaders: 'Start: W | Shoot: W| Left: Q | Right: R',
  missile: 'Shoot: S',
  tank: 'Shoot: W | Left: Q | Up: S | Right: E | Down: 2',
  maze: 'None'
};

export interface SpecialCases {
  [key: string]: any;
}

export interface IInstructions {
  [key: string]: string;
}

export default class Chip {
  /**
   * Configure our preferred target framerate
   * We'll also configure our frame pointer and play state
   * Timing function from https://gist.github.com/addyosmani/5434533#gistcomment-2018050
   */

  speed = 60;
  frame = 0;

  /**
   * stub our cpu and gfx so we can access them publicly
   */

  public cpu;
  public gfx;
  public keyboard;

  /**
   * lets fine tune some specific games
   * our maximum is 1000
   */

  specialCases: SpecialCases = {};

  /**
   * i couldnt figure out how to make typescript happy with canvas so i've checked it can't be null up the chain - bit risky tho
   *
   * @param rom - a CHIP-8 rom file as a Uint8Array
   * @param canvas - an html canvas element for our renderer
   */

  constructor(game: string, rom: Uint8Array, canvas: any) {
    this.dispatch.bind(this);

    /**
     * before we do anything check for special cases
     */

    if (this.specialCases[game.toLowerCase()]) {
      this.speed = this.specialCases[game.toLowerCase()].speed || this.speed;
    }

    const gfx = new Gfx(canvas);
    const cpu = new Cpu(rom, gfx);

    this.cpu = cpu;
    this.gfx = gfx;

    this.keyboard = new Keyboard(cpu);

    this.start(cpu, gfx);
  }

  /**
   * Custom event dispatcher so a 3rd party can listen in on what's happening
   * under the hood of chip
   */

  dispatch(context: IChip) {
    if (CustomEvent instanceof Function) {
      const data = {
        cpu: context.cpu,
        frame: context.frame,
        speed: context.speed
      };

      const cpuEvent = new CustomEvent('chipDebug', { detail: data });

      document.dispatchEvent(cpuEvent);
    }
  }

  /**
   * start will kick off our timing function
   * this is going to check 60 times per second
   * requestAnimationFrame is a browser API that helps us
   * with render timing
   */

  start(cpu: Cpu, gfx: Gfx) {
    let working = false;

    const context: IChipContext = {
      frame: this.frame,
      speed: this.speed
    };

    /**
     * let's start a clock
     */

    setInterval(() => {
      if (working) {
        return;
      }

      working = true;
      cpu.next(this.dispatch, context);
      working = false;
    }, 1000 / this.speed);

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
