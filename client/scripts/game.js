import Config from './config.js';
import Controls from './controls.js';

class Game {
  constructor() {
    this.controls = new Controls();

    this.intervalId = null;
    this.isRunning = false;

    this.state = {
      sizeX: Config.SURFACE_SIZE,
      sizeY: Config.SURFACE_SIZE,
      tiles: {} // {[x,y]: tile}
    }

    this.initializeState();
    this.intializeControls();

    console.log(this.state);
  }

  throwError(msg) {
    alert(msg);
  }

  intializeControls() {
    if (this.controls.anyElementIsMissing()) {
      throwError('Not all elements');
    }


    this.controls.startButton.addEventListener('click', this.startGame.bind(this));
    this.controls.stopButton.addEventListener('click', this.stopGame.bind(this));
    this.controls.resetButton.addEventListener('click', this.resetGame.bind(this));

    this.controls.initialize(this.state);
  }

  getAddress(i, j) {
    return `${i},${j}`;
  }

  isAccessible(address) {
    const tile = this.state.tiles[address];
    return tile && tile.isParticle === false && tile.isObstacle === false;
  }

  updateState() {
    let tile, coordinates, i, j, nextTile,
      nextAddress, places;

    const newTiles = {};

    Object.keys(this.state.tiles)
      .forEach((address) => {
        places = [];
        coordinates = address.split(',');
        i = +coordinates[0];
        j = +coordinates[1];
        tile = this.state.tiles[address];

        if (tile.isObstacle || tile.isParticle === false) {
          return;
        }

        // this one is already at the end
        if (j === Config.SURFACE_SIZE - 1) {
          return;
        }

        // try to go down: y + 1
        if (this.isAccessible(this.getAddress(i, j + 1))) {
          nextAddress = this.getAddress(i, j + 1);
        } else {
          // if not possible try randomly one of these addresses

          // x + 1
          nextAddress = this.getAddress(i + 1, j);
          if (this.isAccessible(nextAddress)) {
            places.push(nextAddress);
          }

          // x - 1
          nextAddress = this.getAddress(i - 1, j);
          if (this.isAccessible(nextAddress)) {
            places.push(nextAddress);
          }

          // y - 1
          nextAddress = this.getAddress(i, j - 1);
          if (this.isAccessible(nextAddress)) {
            places.push(nextAddress);
          }

          nextAddress = places[Math.floor(Math.random() * (places.length))];
        }

        // if no new address or already taken, sorry no movement this time
        if (!nextAddress || newTiles[nextAddress]) {
          return;
        }

        nextTile = this.state.tiles[nextAddress];

        if (!nextTile) debugger;
        if (nextTile.isParticle) debugger;
        if (newTiles[nextAddress]) debugger;

        tile.isParticle = false;
        newTiles[nextAddress] = {
          ...nextTile,
          isParticle: true
        };
      });

    if (Object.keys(newTiles).length === 0) {
      this.stopGame();
      return;
    }

    this.state.tiles = Object.assign({}, this.state.tiles, newTiles);
  }

  startGame() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.updateState();
      this.controls.renderSurface(this.state)
      this.controls.updateFrames();

    }, Config.GAME_SPEED);
  }

  stopGame() {
    this.isRunning = false;
    clearInterval(this.intervalId);
  }

  resetGame() {
    this.initializeState();
    this.controls.initialize(this.state);
  }

  onTileEnter(tile, event) {
    if (this.isRunning || event.which !== 1) {
      return;
    }

    if (tile.isParticle) {
      tile.isParticle = false;
    }

    if (tile.y === 0) {
      tile.isParticle = !tile.isParticle;
    } else {
      tile.isObstacle = !tile.isObstacle;
    }

    this.controls.renderSurface(this.state);
  }

  getTileWidth() {
    return Config.CONTAINER_SIZE / this.state.sizeX;
  }

  getTileHeight() {
    return Config.CONTAINER_SIZE / this.state.sizeY;
  }

  initializeState() {
    this.state.tiles = {};

    const width = this.getTileHeight();
    const height = this.getTileHeight();

    let x, y, element, isObstacle, isParticle;

    for (let i = 0; i < this.state.sizeX; i++) {
      for (let j = 0; j < this.state.sizeY; j++) {
        x = i * width;
        y = j * height;
        element = this.controls.createTileElement(x, y, width, height);
        isObstacle = false;
        isParticle = false;

        const tile = { x, y, width, height, element, isObstacle, isParticle };

        element.addEventListener('mouseenter', this.onTileEnter.bind(this, tile));

        this.state.tiles[this.getAddress(i, j)] = tile;
      }
    }
  }
}

new Game();