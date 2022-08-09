// A generic grid containing cells.
// Grid contains a one-dimensional representation of a 2D grid.
class Grid {
    constructor(width, height) {
      this.cells = [];
      this.width = width;
      this.height = height;
      this.area = width * height;
    }
  
    set(x, y, value) {
      x = int(x);
      y = int(y);
      this.cells[this.xyToIndex(x, y)] = value;
    }
  
    get(x, y) {
      x = int(x);
      y = int(y);
      return this.cells[this.xyToIndex(x, y)]
    }
  
    getByIndex(index) {
      index = int(index);
      return this.cells[index];
    }
  
    // x, y coordinate to 1-d value in cells.
    xyToIndex(x, y) {
      x = int(x);
      y = int(y);
      return x + this.width * y;
    }
  
    // index in cells to x y coordinate.
    indexToXY(index) {
      const x = index % this.width;
      const y = index / this.width;
      return [x, y]
    }
  
    indexToVector(index) {
      const [x, y] = this.indexToXY(index);
      return createVector(x, y);
    }
  
    // Loop over each x y, returning its value as well.
    forEachXYValue(callback) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          callback(x, y, this.get(x, y));
        }
      }
    }
  
    // For a given x y, loop over its neighbor cells (adjacent and diagonal).
    // Cells outside bounds are not called.
    // The cell itself is not called.
    forEachXYNeighborValue(x, y, callback) {
      x = int(x);
      y = int(y);
      for (let oy = -1; oy <= 1; oy++) {
        const cy = y + oy;
        for (let ox = -1; ox <= 1; ox++) {
          const cx = x + ox;
          if (cx < 0 || cy < 0) {
            continue;
          }
          if (cx >= this.width || cy >= this.height) {
            continue;
          }
          if (cx === x && cy === y) {
            continue;
          }
          callback(cx, cy, this.get(cx, cy));
        }
      }
    }
  
    forEachIndexNeighborValue(index, callback) {
      const [x, y] = this.indexToXY(index);
      for (let oy = -1; oy <= 1; oy++) {
        const cy = y + oy;
        for (let ox = -1; ox <= 1; ox++) {
          const cx = x + ox;
          if (cx < 0 || cy < 0) {
            continue;
          }
          if (cx >= this.width || cy >= this.height) {
            continue;
          }
          if (cx === x && cy === y) {
            continue;
          }
          const outIndex = this.xyToIndex(cx, cy);
          callback(outIndex, this.cells[outIndex]);
        }
      }
    }
  
    // Loop over each index, returning its value as well.
    forEachIndexValue(callback) {
      for (let i = 0; i < this.area; i++) {
        callback(i, this.cells[i]);
      }
    }
  
    // Fills the grid with a certain value.
    fill(value) {
      this.forEachIndexValue((index, _) => {
        this.cells[index] = value;
      });
    }
  
    // Replace the grid value based on a callback.
    replaceEachXYValue(callback) {
      const newCells = [];
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const index = this.xyToIndex(x, y);
          const prevValue = this.cells[index];
          const newValue = callback(x, y, prevValue);
          newCells[index] = newValue;
        }
      }
      this.cells = newCells;
    }
  }
  
  // Renders a grid with a callback on how to handle each cell->color.
  function renderGrid(grid, colorFunc) {
    grid.forEachIndexValue((gridIndex, value) => {
      c = colorFunc(gridIndex, value);
      if (c === undefined) {
        return;
      }
      pixelIndex = gridIndex * 4;
      pixels[pixelIndex] = red(c);
      pixels[pixelIndex + 1] = green(c);
      pixels[pixelIndex + 2] = blue(c);
      pixels[pixelIndex + 3] = alpha(c);
    });
  }