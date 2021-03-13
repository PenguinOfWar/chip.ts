/**
 *
 * CHIP.ts canvas render methods
 * @author Darryl Walker
 *
 */

export default class Gfx {
  /**
   * This class will receive input from a buffer and draw a new screen
   * Canvas is convenient and cool so we'll use that
   */

  canvas: any = null;
  context: CanvasRenderingContext2D | null = null;

  /**
   * Here we configure graphics information
   * CHIP-8 has a display resolution of 64x32 and we'll scale it up 8 times
   * Our poor renderer is bound to his resolution forever :(
   */

  public resolution = {
    x: 64,
    y: 32,
    scale: 8
  };

  /**
   * Our screen space will be an array representing pixels
   * left to right, top to bottom, 8-bits (1-byte) each
   */

  public screen = new Uint8Array(this.resolution.x * this.resolution.y);

  /**
   * giving up and resorting to any type
   * seems to work now
   * we'll assign our canvas to a local property
   */

  constructor(canvas: any) {
    this.canvas = canvas.current;
    this.boot();
  }

  /**
   * Some basic canvas stuff here we're going to get a 2d canvas context
   * we're going to give the canvas height and width dimension * scale
   */

  boot() {
    this.context = this.canvas.getContext('2d');
    this.canvas.width = this.resolution.x * this.resolution.scale;
    this.canvas.height = this.resolution.y * this.resolution.scale;

    this.disp_clear();
  }

  disp_clear() {
    /**
     * man i cannot get typescript to shut the fuck about how this might be null
     * look at all this extra code
     * i love typescript but she doesnt make it easy
     */
    this.context?.clearRect &&
      this.context.clearRect(
        0,
        0,
        this.resolution.x * this.resolution.scale,
        this.resolution.y * this.resolution.scale
      );
  }

  public paint() {
    /**
     * Start every render by clearing the screen
     */
    this.disp_clear();

    if (this.context) {
      const context = this.context;
      const resolution = this.resolution;

      this.screen.map((pixel, position) => {
        const x = (position % resolution.x) * resolution.scale;
        const y = Math.floor(position / resolution.x) * resolution.scale;

        context.fillStyle = ['#000', '#00ff00'][pixel];
        context.fillRect(x, y, this.resolution.scale, this.resolution.scale);
        return pixel;
      });
    }
  }
}
