"use strict";

import ContentManager from "./contentManager.js";
import Debug from "./debug.js";
import { clearContext } from "./graphics.js";
import Point from "./point.js";
import { isDefined } from "./utilities.js";

const tilesetCanvas = document.getElementById("tileset-canvas");
const tilesetCtx = tilesetCanvas.getContext("2d");
const mapCanvas = document.getElementById("map-canvas");
const mapCtx = mapCanvas.getContext("2d");
const mapArrayTextarea = document.getElementById("map-array-textarea");
const content = new ContentManager();
let tileset = null;
let tileSize = 16;
let zoom = 2;
let selectedTile = null;
let selectedRow = null;
let selectedCol = null;
let defaultTile = 255;
let map = null;
let mapArray = null;

const setupCanvas = (canvas) => {
  canvas.oncontextmenu = (e) => {
    e.preventDefault();
  };

  const context = canvas.getContext("2d");

  context.imageSmoothingEnabled = false;

  clearContext(context, canvas);
};

const setTileset = () => {
  tileset = content.getAssetByName("tileset");
};

const resizeTilesetCanvas = () => {
  tilesetCanvas.height = tileset.height * zoom;

  tilesetCtx.imageSmoothingEnabled = false;
};

const drawTileset = () => {
  clearContext(tilesetCtx, tilesetCanvas);

  tilesetCtx.drawImage(
    tileset,
    0,
    0,
    tileset.width * zoom,
    tileset.height * zoom
  );
};

const createEmptyMap = () => {
  map = new Array(10);

  for (let y = 0; y < map.length; y++) {
    map[y] = new Array(10);

    for (let x = 0; x < map[y].length; x++) {
      map[y][x] = defaultTile;
    }
  }
};

const drawMap = () => {
  clearContext(mapCtx, mapCanvas);

  for (let y = 0; y < map.length; y++)
    for (let x = 0; x < map[y].length; x++) {
      mapCtx.drawImage(
        tileset,
        tileToCol(map[y][x]) * tileSize,
        tileToRow(map[y][x]) * tileSize,
        tileSize,
        tileSize,
        x * tileSize * zoom,
        y * tileSize * zoom,
        tileSize * zoom,
        tileSize * zoom
      );
    }
};

const pointerPosition = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  return new Point(e.clientX - rect.left, e.clientY - rect.top);
};

const translatedPointerPosition = (pos) => {
  return new Point(pos.x / zoom, pos.y / zoom);
};

const tilesetWidthInTiles = () => {
  return Math.ceil(tileset.width / tileSize);
};

const tilesetHeightInTiles = () => {
  return Math.ceil(tileset.height / tileSize);
};

const tileToCol = (tile) => {
  const row = Math.floor(tile / tilesetWidthInTiles());
  return tile - row * tilesetWidthInTiles();
};

const tileToRow = (tile) => {
  return Math.floor(tile / tilesetWidthInTiles());
};

const selectTile = (pos) => {
  if (
    pos.x > tileset.width ||
    pos.y > tileset.height ||
    pos.x <= 0 ||
    pos.y <= 0
  ) {
    Debug.log(`pointer outside of tileset (tileset width is ${tileset.width})`);
    return;
  }

  selectedCol = Math.ceil(pos.x / tileSize) - 1;
  selectedRow = Math.ceil(pos.y / tileSize) - 1;

  Debug.log(`selecting tile at ${selectedCol}, ${selectedRow}`);

  selectedTile = selectedRow * tilesetWidthInTiles() + selectedCol;

  Debug.log(`selected tile ${selectedTile}`);
};

const highlightSelectedTile = () => {
  clearContext(tilesetCtx, tilesetCanvas);
  drawTileset();

  Debug.log(`highlighting tile at ${selectedCol}, ${selectedRow}`);

  const highlightPosX = selectedCol * tileSize * zoom;
  const highlightPosY = selectedRow * tileSize * zoom;

  tilesetCtx.strokeStyle = "magenta";
  tilesetCtx.lineWidth = 2;
  tilesetCtx.strokeRect(
    highlightPosX,
    highlightPosY,
    tileSize * zoom,
    tileSize * zoom
  );
};

const setTilesetPointerEvent = () => {
  tilesetCanvas.onpointerdown = (e) => {
    const pos = pointerPosition(e, tilesetCanvas);

    Debug.log(`pointer down on tileset canvas at pos ${pos.x}, ${pos.y}`);

    const translatedPos = translatedPointerPosition(pos);

    selectTile(translatedPos);
    highlightSelectedTile();
  };
};

const placeTile = (translatedPos) => {
  Debug.log(`placing tile ${selectedTile}`);

  const mapPosX = Math.floor(translatedPos.x / tileSize);
  const mapPosY = Math.floor(translatedPos.y / tileSize);

  map[mapPosY][mapPosX] = selectedTile;

  Debug.log(`placed tile ${selectedTile} at ${mapPosX}, ${mapPosY}`);

  drawMap();
  createMapArray();
  writeMapArray();
};

const setMapPointerEvent = () => {
  mapCanvas.onpointerdown = (e) => {
    const pos = pointerPosition(e, mapCanvas);

    Debug.log(`pointer down on map canvas at pos ${pos.x}, ${pos.y}`);

    const translatedPos = translatedPointerPosition(pos);

    if (!isDefined(selectedTile)) {
      Debug.log(`not placing tile, selected tile was ${selectedTile}`);
      return;
    }
    placeTile(translatedPos);
  };
};

const createMapArray = () => {
  mapArray = new Array(map.length);

  for (let y = 0; y < map.length; y++) {
    let mapRow = "[";

    for (let x = 0; x < map[y].length; x++) {
      mapRow += `${map[y][x]}`;

      if (x < map[y].length - 1) {
        mapRow += ", ";
      }
    }

    mapRow += "]";

    if (y < map.length - 1) {
      mapRow += ",\n";
    }

    mapArray[y] = mapRow;
  }
};

const writeMapArray = () => {
  let mapArrayString = "";

  mapArray.forEach((element) => {
    mapArrayString += `${element}`;
  });

  mapArrayTextarea.value = mapArrayString;
};

const initialize = () => {
  setupCanvas(tilesetCanvas);
  setupCanvas(mapCanvas);
  setTileset();
  resizeTilesetCanvas();
  drawTileset();
  createEmptyMap();
  drawMap();
  setTilesetPointerEvent();
  setMapPointerEvent();
  createMapArray();
  writeMapArray();
};

const loadContent = () => {
  content.onFinishedLoading = () => {
    initialize();
  };
  content.loadContent();
};

window.onload = () => {
  loadContent();
};
