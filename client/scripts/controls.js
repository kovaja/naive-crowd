import Config from './config.js';

export default class Controls {

  constructor() {
    this.mainContainer = document.getElementById(Config.MAIN_CONTAINER_ID);
    this.startButton = document.getElementById(Config.START_BUTTON_ID);
    this.stopButton = document.getElementById(Config.STOP_BUTTON_ID);
    this.resetButton = document.getElementById(Config.RESET_BUTTON_ID);
    this.framesLabel = document.getElementById(Config.FRAMES_LABEL_ID);
  }

  initialize(state) {
    this.frames = Config.INIT_FRAMES_COUNT;
    this.updateFrames();

    Object.keys(state.tiles).forEach((coordinates) => this.mainContainer.appendChild(state.tiles[coordinates].element));
  }

  anyElementIsMissing() {
    return !this.startButton || !this.resetButton || !this.stopButton || !this.framesLabel || !this.mainContainer;
  }

  getStyle(tile) {
    let fill = '#000000';

    if (tile.isObstacle) {
      fill = Config.OBSTACLE_COLOR;
    } else if (tile.isParticle) {
      fill = Config.PARTICLE_COLOR;
    } else {
      fill = Config.SURFACE_COLOR;
    }

    return `fill:${fill}; stroke: #000; cursor: pointer`;
  }

  createTileElement(x, y, w, h) {
    const rect = document.createElementNS(Config.SVG_NS, 'rect');

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('style', this.getStyle({}));

    return rect;
  }

  renderSurface(state) {
    let tile, newStyle;

    Object.keys(state.tiles)
      .forEach((coordinates) => {
        tile = state.tiles[coordinates];
        newStyle = this.getStyle(tile);

        if (newStyle === tile.element.style.fill) {
          return; // skip when same so we don't have to touch DOM
        }

        tile.element.style = newStyle;
      });
  }

  updateFrames() {
    this.frames++;
    this.framesLabel.innerText = this.frames;
  }
}