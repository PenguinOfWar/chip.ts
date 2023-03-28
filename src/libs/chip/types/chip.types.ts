export interface IChip extends IChipContext {
  cpu: ICpu;
}

export interface IChipContext {
  frame: number;
  speed: number;
}

export interface ICpu {
  counter: number;
  delayTimer: number;
  key: number;
  memory: Uint8Array;
  pointer: number;
  registers: Uint8Array;
  running: boolean;
  screen: Uint8Array;
  soundTimer: number;
  stack: Uint16Array;
  stackPointer: number;
}
