/**
 *
 * CHIP.ts canvas render methods
 * @author Darryl Walker
 *
 */

export default class Gfx {
  /**
   * we get 2 whole colours to play with here
   * our background will be black and our foreground classic monochrome green
   */

  colors = {
    background: '#000',
    foreground: '#00ff00'
  };

  /**
   * This class will receive input from a buffer and draw a new screen
   * Canvas is convenient and cool so we'll use that
   */

  canvas: any = null;
  context: CanvasRenderingContext2D | null = null;
  grid = false;

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
   * giving up and resorting to any type
   * seems to work now
   * we'll assign our canvas to a local property
   */

  constructor(canvas: any) {
    this.canvas = canvas.current;
    this.boot();
  }

  public toggleGrid() {
    this.grid = !this.grid;
  }

  /**
   * Some basic canvas stuff here we're going to get a 2d canvas context
   * we're going to give the canvas height and width dimension * scale
   */

  boot() {
    this.context = this.canvas.getContext('2d');
    this.canvas.width = this.resolution.x * this.resolution.scale;
    this.canvas.height = this.resolution.y * this.resolution.scale;
  }

  public paint(screen: Uint8Array) {
    if (this.context) {
      const context = this.context;
      const resolution = this.resolution;

      screen.map((pixel, position) => {
        /**
         * return the remainder of the position and multiply it by our scale to get our x/y position
         */
        const x = (position % resolution.x) * resolution.scale;
        const y = Math.floor(position / resolution.x) * resolution.scale;

        /**
         * our pixel is either on or off (0 or 1) so here we present an array with two options
         * off is 0 or background color
         * on is 1 or foreground color
         */

        context.fillStyle = [this.colors.background, this.colors.foreground][
          pixel
        ];

        context.strokeStyle = [this.colors.background, this.colors.foreground][
          pixel
        ];

        /**
         * at our x and y coordinate paint a a square matching our scale size and fill color
         */

        if (pixel || !this.grid) {
          context.fillRect(x, y, this.resolution.scale, this.resolution.scale);
        } else {
          context.strokeRect(
            x,
            y,
            this.resolution.scale,
            this.resolution.scale
          );
        }
        return pixel;
      });
    }
  }
}
