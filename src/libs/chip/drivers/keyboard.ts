/**
 *
 * CHIP-8 keyboard adapter
 * @author Darryl Walker
 *
 */

import Cpu from './cpu';

export default class Keyboard {
  /**
   * make a slot for our cpu
   */

  cpu;

  /**
   * we need to map keys from a modern keyboard to the 16-key one CHIP-8 suppors
   */

  constructor(cpu: Cpu) {
    this.cpu = cpu;
    this.listen();
  }

  public press(key: string) {
    let input;

    /**
     * use switch to listen for the keys we care about
     */

    switch (key) {
      /**
       * pause / unpause when esc/spacebar is pressed
       */
      case ' ':
      case 'Escape': {
        if (this.cpu.running) {
          this.cpu.stop();
        } else {
          this.cpu.start();
        }
        break;
      }
      /**
       * below inputs are mapped to the hex pad
       * we'll copy this guy because i cant think of a better way
       * https://github.com/eshyong/Chip-8-Emulator
       * |1|2|3|C|		=>		|1|2|3|4|
       * |4|5|6|D|		=>		|Q|W|E|R|
       * |7|8|9|E|		=>		|A|S|D|F|
       * |A|0|B|F|		=>		|Z|X|C|V|
       */
      case '1': {
        input = 0x0001;
        break;
      }
      case '2': {
        input = 0x0002;
        break;
      }
      case '3': {
        input = 0x0003;
        break;
      }
      case '4': {
        input = 0x000c;
        break;
      }
      case 'q': {
        input = 0x0004;
        break;
      }
      case 'w': {
        input = 0x0005;
        break;
      }
      case 'e': {
        input = 0x0006;
        break;
      }
      case 'r': {
        input = 0x000d;
        break;
      }
      case 'a': {
        input = 0x0007;
        break;
      }
      case 's': {
        input = 0x0008;
        break;
      }
      case 'd': {
        input = 0x0009;
        break;
      }
      case 'f': {
        input = 0x000e;
        break;
      }
      case 'z': {
        input = 0x000a;
        break;
      }
      case 'x': {
        input = 0x0000;
        break;
      }
      case 'c': {
        input = 0x000b;
        break;
      }
      case 'v': {
        input = 0x000f;
        break;
      }
      default: {
        break;
      }
    }

    /**
     * pass the input to the cpu
     */

    if (input) {
      this.cpu.input(input);
    }
  }

  public release() {
    this.cpu.input(0);
  }

  listen() {
    if (this.cpu) {
      document.addEventListener('keydown', event => {
        const { key } = event;

        this.press(key);
      });

      /**
       * listen for keyup and clear the key register
       * send it 0 if we're clear because why on earth should it be anything but
       * note to self: when consulting the ancient texts they are not 1-2-1 gospel. ta.
       */
      document.addEventListener('keyup', () => {
        this.release();
      });
    }
  }
}
