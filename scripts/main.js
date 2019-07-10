const SVG_NS = 'http://www.w3.org/2000/svg';
const SURFACE_COLOR = 'rgb(220, 220, 220)';
const OBSTACLE_COLOR = 'rgb(255, 0, 0)';
const PARTICLE_COLOR = 'rgb(0, 255, 0)';

const MAIN_CONTAINER_ID = 'main-canvas';
const START_BUTTON_ID = 'start-button';
const STOP_BUTTON_ID = 'stop-button';
const RESET_BUTTON_ID = 'reset-button';
const FRAMES_LABEL_ID = 'frames-label';
const GAME_SPEED = 100;
const INIT_FRAMES_COUNT = -1;
const SURFACE_SIZE = 30;
const CONTAINER_SIZE = 500;

const mainContainer = document.getElementById(MAIN_CONTAINER_ID);
const startButton = document.getElementById(START_BUTTON_ID);
const stopButton = document.getElementById(STOP_BUTTON_ID);
const resetButton = document.getElementById(RESET_BUTTON_ID);
const framesLabel = document.getElementById(FRAMES_LABEL_ID);

let intervalId;
let isRunning = false;
let frames = INIT_FRAMES_COUNT;

let state = {
  sizeX: SURFACE_SIZE,
  sizeY: SURFACE_SIZE,
  tiles: {} // {[x,y]: tile}
};

function throwError(msg) {
  alert(msg);
}

function anyElementIsMissing() {
  return !startButton || !resetButton || !stopButton || !framesLabel || !mainContainer;
}


function getTileWidth() {
  return CONTAINER_SIZE / state.sizeX;
}

function getTileHeight() {
  return CONTAINER_SIZE / state.sizeY;
}


function getAddress(i, j) {
  return `${i},${j}`;
}

function createTileElement(x, y, w, h) {
  const rect = document.createElementNS(SVG_NS, 'rect');

  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('style', getStyle({}));

  return rect;
}

function onTileEnter(tile, event) {
  if (isRunning || event.which !== 1) {
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

  renderSurface();
}

function initializeState() {
  state.tiles = {};

  const width = getTileHeight();
  const height = getTileHeight();

  let x, y, element, isObstacle, isParticle;

  for (let i = 0; i < state.sizeX; i++) {
    for (let j = 0; j < state.sizeY; j++) {
      x = i * width;
      y = j * height;
      element = createTileElement(x, y, width, height);
      isObstacle = false;
      isParticle = false;

      const tile = { x, y, width, height, element, isObstacle, isParticle };

      element.addEventListener('mouseenter', onTileEnter.bind(null, tile));

      state.tiles[getAddress(i, j)] = tile;
    }
  }
}

function initializeSurface() {
  let tile;
  Object.keys(state.tiles).forEach((coordinates) => {
    tile = state.tiles[coordinates]
    mainContainer.appendChild(tile.element);
  });
}

function getStyle(tile) {
  fill = '#000000';

  if (tile.isObstacle) {
    fill = OBSTACLE_COLOR;
  } else if (tile.isParticle) {
    fill = PARTICLE_COLOR;
  } else {
    fill = SURFACE_COLOR;
  }

  return `fill:${fill}; stroke: #000; cursor: pointer`;
}

function isAccessible(address) {
  const tile = state.tiles[address];
  return tile && tile.isParticle === false && tile.isObstacle === false;
}

function computeNewState() {
  let tile, coordinates, i, j, nextTile,
    nextAddress, places;
  const newTiles = {};

  Object.keys(state.tiles)
    .forEach(function (address) {
      places = [];
      coordinates = address.split(',');
      i = +coordinates[0];
      j = +coordinates[1];
      tile = state.tiles[address];

      if (tile.isObstacle || tile.isParticle === false) {
        return;
      }

      // this one is already at the end
      if (j === SURFACE_SIZE - 1) {
        return;
      }

      // try to go down: y + 1
      if (isAccessible(getAddress(i, j + 1))) {
        nextAddress = getAddress(i, j + 1);
      } else {
        // if not possible try randomly one of these addresses

        // x + 1
        nextAddress = getAddress(i + 1, j);
        if (isAccessible(nextAddress)) {
          places.push(nextAddress);
        }

        // x - 1
        nextAddress = getAddress(i - 1, j);
        if (isAccessible(nextAddress)) {
          places.push(nextAddress);
        }

        // y - 1
        nextAddress = getAddress(i, j - 1);
        if (isAccessible(nextAddress)) {
          places.push(nextAddress);
        }

        nextAddress = places[Math.floor(Math.random() * (places.length))];
      }

      // if no new address or already taken, sorry no movement this time
      if (!nextAddress || newTiles[nextAddress]) {
        return;
      }

      nextTile = state.tiles[nextAddress];

      if (!nextTile) debugger;
      if (nextTile.isParticle) debugger;
      if (newTiles[nextAddress]) debugger;

      tile.isParticle = false;
      newTiles[nextAddress] = {
        ...nextTile,
        isParticle: true
      };
    });

  state.tiles = Object.assign({}, state.tiles, newTiles);
}

function renderSurface() {
  let tile, newStyle;

  Object.keys(state.tiles)
    .forEach(function (coordinates) {
      tile = state.tiles[coordinates];
      newStyle = getStyle(tile);

      if (newStyle === tile.element.style.fill) {
        return; // skip when same so we don't have to touch DOM
      }

      tile.element.style = newStyle;
    });
}

function updateFrames() {
  frames++;
  framesLabel.innerText = frames;
}

function render() {
  computeNewState();
  renderSurface();
  updateFrames();
}

function startGame() {
  if (isRunning) {
    return;
  }

  frames = INIT_FRAMES_COUNT;
  isRunning = true;
  intervalId = setInterval(render, GAME_SPEED);
}

function stopGame() {
  isRunning = false;
  clearInterval(intervalId);
}

function initializeGame() {
  initializeState();
  initializeSurface();
}

if (anyElementIsMissing()) {
  throwError('Not all elements');
}

startButton.addEventListener('click', startGame);
stopButton.addEventListener('click', stopGame);
resetButton.addEventListener('click', initializeGame);

initializeGame();
console.log(state);
