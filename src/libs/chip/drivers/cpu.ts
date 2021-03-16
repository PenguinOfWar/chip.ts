/**
 *
 * CHIP-8 CPU emulator class
 * @author Darryl Walker
 *
 */

import Gfx from './gfx';
import { fonts } from '../assets/characters';

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class Cpu {
  /**
   * CHIP-8 has 4096 8-bit (1 byte) memory locations
   * A byte is normally the smallest addressable location
   * Each byte can be a value of 0-255
   *
   * Our 4096 decimal can expressed as 0x1000 in hexadecimal
   * We will create a new ArrayBuffer and pass it to Uint8Array (unsigned integer with a range of 0-255)
   * Array buffer will handle our raw data for us e.g. 0x1000 => 4096
   */

  memory = new Uint8Array(new ArrayBuffer(0x1000));

  /**
   * CHIP-8 has 16 8-bit data registers named V0 to VF
   * We create a new Uint8Array with 16 register locations
   */

  registers = new Uint8Array(16);

  /**
   * Our stack will need to store return addresses
   * We will need 16 of these 16-bit addresses
   */

  stack = new Uint16Array(16);

  /**
   * Our stack pointer will store where in our 16 length stack we should be
   */

  stackPointer = 0;

  /**
   * We need to define our program counter
   * This is the next instruction that should be executed by our cpu
   * CHIP-8 starts at 0x200 leaving the lowest 512 bytes (0-511) free
   * We'll store font data there later
   */

  counter = 0x200;

  /**
   * Assign a position for our graphics adapter
   */

  gfx;

  /**
   * okay so this is a pointer i've called pointer
   * in reality it's confusingly called "I"
   * i like mine better for now
   * on the CHIP-8 it's a 16-bit register so a regular number is fine
   */

  pointer = 0;

  /**
   * Our screen space will be an array representing pixels
   * left to right, top to bottom, 8-bits (1-byte) each
   */

  public screen = new Uint8Array();

  /**
   * we have two timers- one for delay and one for sound
   */

  delayTimer = 0;
  soundTimer = 0;

  /**
   * Keypad - used as input from a HEX keypad
   */

  keys: IKeys = {};

  /**
   * at any given time we can have one key pressed
   * so we'll keep track of it via a pointer
   */

  key = 0;

  /**
   * we will also need a virtual keyboard and sound adapter
   */

  speaker = new AudioContext();
  wave: OscillatorType = 'sawtooth';

  /**
   * We need a way to track whether or not ops should be paused
   * a boolean will do
   */

  public running = false;

  constructor(rom: Uint8Array, gfx: Gfx) {
    this.gfx = gfx;
    this.screen = new Uint8Array(this.gfx.resolution.x * this.gfx.resolution.y);
    this.load(rom);
  }

  /**
   * We take the ROM file represented as a Uint8Array and map into memory
   * Here we need to ecounter for the original interpreter positions
   * For this reason, most programs written for the original system begin at memory location 512 (0x200)
   * We shift all the memory addresses over by 512 (or 0x200 for fun)
   */

  load(rom: Uint8Array) {
    /**
     * load fonts first
     */

    this.loadFont();

    rom.map((instruction, address) => {
      /**
       * take the instrction and the array index as our memory address
       * map this into our emulators memory
       */

      const addressMap = address + 0x200;

      this.memory[addressMap] = instruction;

      return instruction;
    });

    /**
     * it's always useful if you remember to start the engine
     */
    this.start();
  }

  /**
   * We need to load a hexadecimal character set into the first few bytes of our memory
   * we have 512 free slots to play with in total
   */
  loadFont() {
    return fonts.map((char, index) => {
      return (this.memory[index] = char);
    });
  }

  public start() {
    this.running = true;
  }

  public stop() {
    this.running = false;
  }

  /**
   * We will provided a handle little API for the chip to call for a tick at the preferred rate
   * next will check if the cpu is running and tick if true
   */

  public next() {
    if (!this.running) {
      return;
    }

    this.tick();
  }

  /**
   * Our processor will perform an instruction once per tick
   * During this time we will check the opcode and see what it needs to do
   */

  tick() {
    /**
     * before we do anything we have to decrement our timers
     */

    if (this.delayTimer > 0) {
      --this.delayTimer;
    }

    if (this.soundTimer > 0) {
      /**
       * if the sound timer is exactly 1 fire a beep off
       */
      if (this.running && this.soundTimer === 1) {
        this.beep();
      }

      --this.soundTimer;
    }

    /**
     * This bit is a little confusing to me
     * I learned a lot of it from reading
     * https://github.com/alexanderdickson/Chip-8-Emulator/blob/5da6ac6a4753462d02ca7fe8d5a9398308b8d9d0/scripts/chip8.js#L193
     * We're shifting everything over bitwise 8 to the left
     * And then doing a bitwise or on each pair of bits. a OR b yields 1 if either a or b is 1.
     *
     * UPDATE
     * Bless this dude, who seems to be the reference for the above JS dude/dudette
     * https://github.com/eshyong/Chip-8-Emulator/blob/master/chip8.c
     *
     * Opcodes are two bytes long!
     * We're creating a hexidecimal here, I guess? Out of the two byte opcode
     *
     * here we take the first complete bite
     * in pongs case that's 6A hex / 106 decimalÎ
     * we also take the next byte which is conveniently 02 hex / 2 decimal
     *
     * fuck me
     * i guess this is a clever way of storing integers greater than 8 bits
     * which is cool as shit
     *
     * we take decimal 106 and we shift it left 8 places giving us decimal 27136
     *
     * then we take output of that left shift and give it to a bitwise OR - the single pipe dude
     * this guy adds them together
     * problem: 27136 | 2
     * result: 27138 decimal / 6a02 hex
     *
     * i guess we just got two bytes of storage out of one byte of data
     * how very... bitwise
     *
     */

    const opcode =
      (this.memory[this.counter] << 8) | this.memory[this.counter + 1];

    /**
     * here a bitwise AND (&) compares two numbers and casts them to numbers if they arent numbers
     * my head hurts
     *
     * Read here:
     * https://en.wikipedia.org/wiki/Bitwise_operation#AND
     *
     * Okay.
     * There's a lot going on here.
     * X is a two parter, first we take our opcode 27136 and give it 0x0f00 hex / 3840 decimal
     * this yields a00 hex / 2560 decimal
     *
     * we then shift the result over 8 places right yielding a hex / 10 decimal
     * giving us our register address for later!
     *
     * do similar for y taking 27136 and giving it 0x0000 hex / 0 decimal and go god i keep flopping back and forth
     * it's all hex i swear just different hex and i will tidy it up just look at the decimals
     *
     * shift it over 4 and it's still 0 / 0x0000
     *
     */

    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;
    const NN = opcode & 0x00ff;
    const JUMP = opcode & 0x0fff;
    let didJump = false;

    /**
     * then start checking opcodes
     *
     * our first check is the result of opcode AND 0xf000
     * continuing with the above we have 27138 & 61440 = 24576 decimal / 0x6000 hex
     *
     * this corresponds to opcode 6XNN!
     * https://en.wikipedia.org/wiki/CHIP-8#Opcode_table
     *
     * this is called checking the first nibble of the byte
     */

    switch (opcode & 0xf000) {
      /**
       * 0000
       * This can be a few things but we only really care about two of them - 00E0 and 00EE
       */
      case 0x0000: {
        switch (opcode) {
          /**
           * 00E0 / disp_clear() - clears the screen
           */
          case 0x00e0:
            this.gfx.disp_clear();
            break;

          /**
           * 00EE / return from a subroutine
           */
          case 0x00ee:
            if (this.stack[this.stackPointer] === 0) {
              console.warn('Invalid return from subroutine.');
            }

            this.counter = this.stack[this.stackPointer];
            this.stack[this.stackPointer] = 0;

            if (this.stackPointer > 0) {
              --this.stackPointer;
            }
            break;
        }
        break;
      }

      /**
       * 1NNN - Jumps to address NNN.
       */
      case 0x1000: {
        this.counter = JUMP;
        didJump = true;
        break;
      }

      /**
       * 2NNN - Calls subroutine at NNN.
       * Updates the counter to the next instruction
       * We store the return address for later and increment our stack size
       */
      case 0x2000: {
        if (this.stack[this.stackPointer] !== 0) {
          ++this.stackPointer;
        }
        this.stack[this.stackPointer] = this.counter;
        this.counter = JUMP;
        didJump = true;
        break;
      }

      /**
       * 3XNN/if(Vx==NN) - Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip a code block)
       */
      case 0x3000: {
        if (this.registers[x] === NN) {
          this.counter += 2;
        }
        break;
      }

      /**
       * 4XNN/if(Vx!=NN - Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump to skip a code block)
       */
      case 0x4000: {
        if (this.registers[x] !== NN) {
          this.counter += 2;
        }
        break;
      }

      /**
       * 5XY0/if(Vx==Vy) - Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip a code block)
       */
      case 0x5000: {
        if (this.registers[x] === this.registers[y]) {
          this.counter += 2;
        }
        break;
      }

      /**
       * 6XNN - Sets VX to NN
       * opcode AND 0xFF hex / 255 dec = 2 dec / 02 hex
       * therefore register 10 now has a value of two
       */
      case 0x6000: {
        this.registers[x] = opcode & 0xff;
        break;
      }

      /**
       * 7XNN - Adds NN to VX. (Carry flag is not changed)
       */
      case 0x7000: {
        this.registers[x] += NN;
        break;
      }

      /**
       * 8000 is an imposing list of VX and VY operations
       */

      case 0x8000: {
        switch (opcode & 0x000f) {
          /**
           * 8XY0/Vx=Vy - Sets VX to the value of VY.
           */
          case 0x0000: {
            this.registers[x] = this.registers[y];
            break;
          }

          /**
           * 8XY1/Vx=Vx|Vy - Sets VX to VX or VY. (Bitwise OR operation)
           */
          case 0x0001: {
            this.registers[x] = this.registers[x] | this.registers[y];
            break;
          }

          /**
           * 8XY2/Vx=Vx&Vy - Sets VX to VX and VY. (Bitwise AND operation)
           */
          case 0x0002: {
            this.registers[x] = this.registers[x] & this.registers[y];
            break;
          }

          /**
           * 8XY3/Vx=Vx^Vy - Sets VX to VX xor VY.
           */
          case 0x0003: {
            this.registers[x] = this.registers[x] ^ this.registers[y];
            break;
          }

          /**
           * 8XY4/Vx += Vy - Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
           */
          case 0x0004: {
            if (this.registers[x] + this.registers[y] > 255) {
              this.registers[0xf] = 1;
            } else {
              this.registers[0xf] = 0;
            }
            this.registers[x] += this.registers[y];
            break;
          }

          /**
           * 8XY5/Vx -= Vy - VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
           */
          case 0x0005: {
            if (this.registers[x] < this.registers[y]) {
              this.registers[0xf] = 0;
            } else {
              this.registers[0xf] = 1;
            }
            this.registers[x] -= this.registers[y];
            break;
          }

          /**
           * 8XY6/Vx>>=1 - Stores the least significant bit of VX in VF and then shifts VX to the right by 1.
           */
          case 0x0006: {
            if (this.registers[x] % 2 === 0) {
              this.registers[0xf] = 0;
            } else {
              this.registers[0xf] = 1;
            }
            this.registers[x] = this.registers[x] >> 1;
            break;
          }

          /**
           * 8XY7/Vx=Vy-Vx - Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
           */
          case 0x0007: {
            if (this.registers[y] < this.registers[x]) {
              this.registers[0xf] = 0;
            } else {
              this.registers[0xf] = 1;
            }
            this.registers[x] = this.registers[y] - this.registers[x];
            break;
          }

          /**
           * 8XYE/Vx<<=1 - Stores the most significant bit of VX in VF and then shifts VX to the left by 1
           */
          case 0x000e: {
            if (this.registers[x] < 128) {
              this.registers[0xf] = 0;
            } else {
              this.registers[0xf] = 1;
            }
            this.registers[x] = this.registers[x] << 1;
            break;
          }
          default: {
            throw new Error(
              `Unknown opcode in 8000 block: ${opcode.toString(16)}`
            );
          }
        }
        break;
      }

      /**
       * we (i) forgot about instruction 9
       * 9XY0/if(Vx!=Vy) - Skips the next instruction if VX doesn't equal VY. (Usually the next instruction is a jump to skip a code block)
       */
      case 0x9000: {
        // skip next instruction if VX not equals VY
        if (this.registers[x] !== this.registers[y]) {
          this.counter += 2;
        }
        break;
      }

      /**
       * ANNN - Sets pointer/I to address NNN
       */
      case 0xa000: {
        this.pointer = JUMP;
        break;
      }

      /**
       * BNNN - Jumps to addres that is sum of NNN and V0 (register 0)
       */
      case 0xb000: {
        this.counter = (opcode & 0xfff) + this.registers[0];
        didJump = true;
        break;
      }

      /**
       * CXNN/Vx=rand()&N - Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
       */
      case 0xc000: {
        this.registers[x] = Math.floor(Math.random() * 255) % 255 & NN;
        break;
      }

      /**
       * DXYN / draw(Vx,Vy,N) - Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N+1 pixels.
       */
      case 0xd000: {
        const height = opcode & 0x000f;

        /**
         * get our x and y coordinates from our register
         * use values at position VX and VY
         */

        let coordinates: ICoordinates = {
          x: this.registers[x],
          y: this.registers[y]
        };

        // set carry flag to 0
        this.registers[0xf] = 0;

        let spr;

        /**
         * drawing loop
         * try not to get it backwards like i did
         */
        for (let vertical = 0; vertical < height; vertical++) {
          spr = this.memory[this.pointer + vertical];

          for (
            let horizontal = 0;
            horizontal < this.gfx.resolution.scale;
            horizontal++
          ) {
            if (coordinates.x + horizontal === this.gfx.resolution.x) {
              coordinates.x = -horizontal;
            }
            if (coordinates.y + vertical === this.gfx.resolution.y) {
              coordinates.y = -vertical;
            }

            if ((spr & 0x80) > 0) {
              if (
                this.setPixel(
                  this.registers[x] + horizontal,
                  this.registers[y] + vertical
                )
              ) {
                this.registers[0xf] = 1;
              }
            }
            spr <<= 1;
          }
          coordinates.x = this.registers[x];
          coordinates.y = this.registers[y];
        }

        break;
      }

      /**
       * E000 can be one of two things, both bound to key presses
       * they are kind of the opposite of one another
       */
      case 0xe000: {
        switch (NN) {
          /**
           * EX9E/if(key()==Vx) - Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)
           */
          case 0x009e: {
            if (this.key === this.registers[x]) {
              this.counter += 2;
            }
            break;
          }

          /**
           * EXA1/if(key()!=Vx) - Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)
           */
          case 0x00a1: {
            if (this.key !== this.registers[x]) {
              this.counter += 2;
            }
            break;
          }
          default: {
            throw new Error(
              `Unknown opcode in e000 block: ${opcode.toString(16)}`
            );
          }
        }
        break;
      }

      /**
       * ol mate F000 can be a few things
       */
      case 0xf000: {
        switch (NN) {
          /**
           * FX07/get_delay() -	Sets VX to the value of the delay timer.
           */
          case 0x0007: {
            this.registers[x] = this.delayTimer;
            break;
          }
          /**
           * FX0A/get_key() - A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted until next key event)
           * What this means is we are actually going to halt the program and wait until a key is pressed
           */
          case 0x000a: {
            if (this.key === 0) {
              this.stop();
              return;
            } else {
              this.registers[x] = this.key;
              this.start();
            }
            break;
          }

          /**
           * FX15/delay_timer(Vx) - Sets the delay timer to VX.
           */
          case 0x0015: {
            this.delayTimer = this.registers[x];
            break;
          }

          /**
           * FX18/sound_timer(Vx) - Sets the sound timer to VX.
           */
          case 0x0018: {
            this.soundTimer = this.registers[x];
            break;
          }

          /**
           * X1E - Adds VX to pointer/I. VF is not affected
           */
          case 0x001e: {
            this.pointer += this.registers[x];
            break;
          }

          /**
           * FX29 - I=sprite_addr[Vx] - Sets I to the location of the sprite for the character in VX.
           * Characters 0-F (in hexadecimal) are represented by a 4x5 font.
           * we multiply by 5 to get there
           */
          case 0x0029: {
            this.pointer = this.registers[x] * 5;
            break;
          }

          /**
           * FX33/set_BCD - Stores the binary-coded decimal representation of VX, with the most significant of
           * three digits at the address in I, the middle digit at I plus 1, and the least significant digit at
           * I plus 2. (In other words, take the decimal representation of VX, place the hundreds digit in memory
           * at location in I, the tens digit at location I+1, and the ones digit at location I+2.)
           */
          case 0x0033: {
            const pointers = [
              this.registers[x] / 100,
              (this.registers[x] / 10) % 10,
              this.registers[x] % 10
            ];
            this.memory[this.pointer] = pointers[0];
            this.memory[this.pointer + 1] = pointers[1];
            this.memory[this.pointer + 2] = pointers[2];
            break;
          }

          /**
           * FX55/reg_dump(Vx,&I) - Stores V0 to VX (including VX) in memory starting at address I.
           */
          case 0x0055: {
            for (let i = 0; i <= x; i++) {
              this.memory[this.pointer + i] = this.registers[i];
            }
            break;
          }

          /**
           * FX65/reg_load(Vx,&I) - Fills V0 to VX (including VX) with values from memory starting at address I.
           */
          case 0x0065: {
            for (let i = 0; i <= x; i++) {
              this.registers[i] = this.memory[this.pointer + i];
            }
            this.pointer = this.pointer + x + 1;
            break;
          }
        }
        break;
      }
      default: {
        throw new Error(`Unknown opcode: ${opcode.toString(16)}`);
      }
    }

    /**
     * all of our instructions are two bytes long
     * increment our counter+2 to move to the next instruction by default
     */

    if (!didJump) {
      this.counter += 2;
    }
  }

  get display() {
    return this.screen;
  }

  /**
   * do our set pixel handling here
   */
  setPixel(x: number, y: number) {
    const width = this.gfx.resolution.x;
    const height = this.gfx.resolution.y;

    // If the pixel exceeds the dimensions,
    // wrap it back around.
    if (x > width) {
      x -= width;
    } else if (x < 0) {
      x += width;
    }

    if (y > height) {
      y -= height;
    } else if (y < 0) {
      y += height;
    }

    const location = x + y * width;

    this.display[location] ^= 1;

    return !this.screen[location];
  }

  /**
   * provide a public api for the keyboard drive to update the key pressed
   */
  public input(key: any) {
    this.key = key;
  }

  /**
   * CHIP-8 has a single voice speaker to beep at you
   * we'll make a beep method for our cpu (or anyone) to use
   */
  public beep() {
    if (this.speaker) {
      const oscillator = this.speaker.createOscillator();
      oscillator.connect(this.speaker.destination);
      /**
       * i think sawtooth sounds the most retro and its my code so we're sticking with it
       * there also seems to be an issue here with the oscillator context hanging around
       * cant quite figure out how to close it gracefully
       */
      oscillator.type = this.wave;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 100);
      return;
    }
  }

  /**
   * We need to add a halt procedure here primarily to close the audiocontext
   * it gets really annoying otherwise as sound loops can get stuck in the browser window
   * dont ask me how i know this
   */

  public halt() {
    if (this.speaker) {
      this.speaker.close();
    }
  }
}

export interface ICoordinates {
  x: number;
  y: number;
}

export interface IKeys {
  [key: number]: any;
}
