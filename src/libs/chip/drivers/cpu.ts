/**
 *
 * CHIP-8 CPU emulator class
 * @author Darryl Walker
 *
 */

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

  constructor(rom: Uint8Array) {
    this.load(rom);
  }

  /**
   * We take the ROM file represented as a Uint8Array and map into memory
   * Here we need to ecounter for the original interpreter positions
   * For this reason, most programs written for the original system begin at memory location 512 (0x200)
   * We shift all the memory addresses over by 512 (or 0x200 for fun)
   */

  load(rom: Uint8Array) {
    rom.map((instruction, address) => {
      /**
       * take the instrction and the array index as our memory address
       * map this into our emulators memory
       */

      const addressMap = address + 0x200;

      this.memory[addressMap] = instruction;

      return instruction;
    });
  }

  /**
   * Our processor will perform an instruction once per tick
   * During this time we will check the opcode and see what it needs to do
   */

  public tick() {
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

    if (opcode === 27138) {
      console.log(27138, opcode & 0x0f00, x);
      console.log(27138, opcode & 0x00f0, y);
    }

    /**
     * all of our instructions are two bytes long
     * increment our counter+2 to move to the next instruction by default
     */

    this.counter += 2;

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
       * This can be a few things but we only really care about two of them - 00E0 and 00EE
       */
      case 0x0000: {
        switch (opcode) {
          /**
           * 00E0 / disp_clear() - clears the screen
           */
          case 0x00e0:
            // this.renderer.clear();
            // for (var i = 0; i < this.display.length; i++) {
            //   this.display[i] = 0;
            // }
            console.log('Render clear');
            break;

          // RET
          // 00EE
          // Return from subroutine.
          case 0x00ee:
            // this.pc = this.stack[--this.sp];
            console.log('Return from subroutine');
            break;
        }
        break;
      }
      /**
       * 6XNN - Sets VX to NN
       * opcode AND 0xFF hex / 255 dec = 2 dec / 02 hex
       * therefore register 10 now has a value of two
       */
      case 0x6000: {
        console.log('Setting VX to NN', x, opcode & 0xff);
        this.registers[x] = opcode & 0xff;
        break;
      }
      default: {
        // throw new Error(`Unknown opcode: ${opcode.toString(16)}`);
      }
    }
  }
}
