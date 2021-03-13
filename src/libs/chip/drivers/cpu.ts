/**
 *
 * CHIP-8 CPU emulator class
 * @author Darryl Walker
 *
 */

export default class Cpu {
  /**
   * CHIP-8 has 4096 8-bit (1 byte) memory locations
   * A byte will be the smallest addressable location for this exercise
   * Each byte can be 0 or 1
   *
   * Our 4096 decimal can expressed as 0x1000 in hexadecimal
   * We will create a new ArrayBuffer and pass it to Uint8Array (unsigned integer with a range of 0-255)
   * Array buffer will handle our raw data for us e.g. 0x1000 => 4096
   */

  public memory = new Uint8Array(new ArrayBuffer(0x1000));

  /**
   * CHIP-8 has 16 8-bit data registers named V0 to VF
   * We create a new Uint8Array with 16 register locations
   */

  public registers = new Uint8Array(16);

  /**
   * Our stack will need to store return addresses
   * We will need 16 of these 16-bit addresses
   */

  public stack = new Uint16Array(16);

  /**
   * Our stack pointer will store where in our 16 length stack we should be
   */

  public stackPointer = 0;

  /**
   * Here we configure graphics and sound
   * CHIP-8 has a display resolution of 64x32
   */

  public resolution = {
    x: 64,
    y: 32
  };

  /**
   * Our screen space will be an array representing pixels
   * left to right, top to bottom, 8-bits (1-byte) each
   */

  public screen = new Uint8Array(this.resolution.x * this.resolution.y);

  /**
   * We need to define our program counter
   * This is the next instruction that should be executed by our cpu
   * CHIP-8 starts at 0x200 leaving the lowest 512 bytes (0-511) free
   * We'll store font data there later
   */

  public counter = 0x200;

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
     */
    const opcode =
      (this.memory[this.counter] << 8) | this.memory[this.counter + 1];

    /**
     * here a bitwise AND (&) compares two numbers and casts them to numbers if they arent numbers
     * my head hurts
     */

    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;

    console.log(this.counter, opcode, x, y, opcode & 0xf000);

    /**
     * increment our counter to move to the next instruction
     */

    this.counter += 2;
  }
}
