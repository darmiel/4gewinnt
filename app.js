const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

// make canvas biiiiiiiig
const height = document.defaultView.innerHeight * 0.9;
const width = document.defaultView.innerWidth * 0.9;

canvas.height = height;
canvas.width = width;

// background: black
canvas.style.background = "#2c3e50";

// make ROUND tiles
const columns = 7;
const rows = 6;
const offset = 10;

const tileHeight = Math.floor(height / rows - offset);
const tileWidth = Math.floor(width / columns - offset);

const rowObj = [];

const defaultColor = "#3498db";
const hoverColor = "#2980b9";

let ended = false;

for (let x = offset; x < width; x += tileWidth + offset) {
  const obj = {
    id: rowObj.length + 1,
    xStart: x,
    xEnd: x + tileWidth,
    nobs: [],
  };

  console.log("Rows:", rowObj);

  for (let y = offset; y < height; y += tileHeight + offset) {
    ctx.fillStyle = defaultColor;
    ctx.fillRect(x, y, tileWidth, tileHeight);

    obj.nobs.push({
      x1: x,
      y1: y,
      x2: x + tileWidth,
      y2: y + tileHeight,
      color: defaultColor,
    });
  }

  rowObj.push(obj);
}

// Hover "animation"
/** @param {MouseEvent} event */
canvas.onmousemove = (event) => {
  const x = event.clientX - offset;
  for (const row of rowObj) {
    if (row.xStart <= x && row.xEnd >= x) {
      for (const nob of row.nobs) {
        if (nob.color !== defaultColor) {
          continue;
        }
        nob.color = hoverColor;

        ctx.fillStyle = hoverColor; // highlight color
        ctx.fillRect(nob.x1, nob.y1, tileWidth, tileHeight);
      }
    } else {
      for (const nob of row.nobs) {
        if (nob.color !== hoverColor) {
          continue;
        }
        nob.color = defaultColor;

        ctx.fillStyle = defaultColor;
        ctx.fillRect(nob.x1, nob.y1, tileWidth, tileHeight);
      }
    }
  }
};

let currentRound = 0;
const playerCount = 2;
const playerColors = [
  "#f1c40f",
  "#e74c3c",
  "#2ecc71",
  "#1abc9c",
  "#9b59b6",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#ecf0f1",
];

function check4(nobArray) {
  let same = {
    num: 0,
    color: undefined,
  };

  for (const nob of nobArray) {
    if (nob.color == defaultColor || nob.color == hoverColor) {
      same.num = 0;
      continue;
    }
    if (same.color == undefined || same.color == nob.color) {
      same.num++;
    } else {
      same.num = 0;
    }
    same.color = nob.color;

    if (same.num >= 4) {
      return nob.color;
    }
  }

  return undefined;
}

function getWinnerVertical() {
  for (const row of rowObj) {
    const winner = check4(row.nobs);
    if (winner != undefined) {
      return winner;
    }
  }
  return undefined;
}

function getWinnerHorizontal() {
  for (let i = 0; i < rows; i++) {
    const rowNobs = [];

    for (const row of rowObj) {
      rowNobs.push(row.nobs[i]);
    }

    const winner = check4(rowNobs);
    if (winner != undefined) {
      return winner;
    }
  }

  return undefined;
}

function getWinnerCross1(nobX, nobY) {
  const allNobs = [];

  let rowId = 0;
  for (const row of rowObj) {
    allNobs[rowId++] = row.nobs;
  }

  const rowNobs = [];

  // find starting nobX and nobY
  let startNobX = nobX;
  let startNobY = nobY;

  while (startNobX > 0 && startNobY < rows - 1) {
    startNobX--;
    startNobY++;
  }

  rowNobs.push(allNobs[startNobX][startNobY]);
  while (startNobX < columns - 1 && startNobY > 0) {
    startNobX++;
    startNobY--;

    rowNobs.push(allNobs[startNobX][startNobY]);
  }

  return check4(rowNobs);
}

function getWinnerCross2(nobX, nobY) {
  const allNobs = [];

  let rowId = 0;
  for (const row of rowObj) {
    allNobs[rowId++] = row.nobs;
  }

  const rowNobs = [];

  // find starting nobX and nobY
  let startNobX = nobX;
  let startNobY = nobY;

  while (startNobX > 0 && startNobY > 0) {
    startNobX--;
    startNobY--;
  }

  rowNobs.push(allNobs[startNobX][startNobY]);
  while (startNobX < columns - 1 && startNobY < rows - 1) {
    startNobX++;
    startNobY++;

    rowNobs.push(allNobs[startNobX][startNobY]);
  }

  return check4(rowNobs);
}

function isWinner(nobX, nobY) {
  const winner =
    getWinnerVertical() ??
    getWinnerHorizontal() ??
    getWinnerCross1(nobX, nobY) ??
    getWinnerCross2(nobX, nobY);

  console.log(winner);
  if (winner != undefined) {
    ended = true;

    // make all nobs in thaaat color
    for (const row of rowObj) {
      for (const nob of row.nobs) {
        nob.color = winner;
        ctx.fillStyle = nob.color;
        ctx.fillRect(nob.x1, nob.y1, tileWidth, tileHeight);
      }
    }
  }
}

// Clickidiclickclack
/** @param {MouseEvent} event */
canvas.onmousedown = (event) => {
  if (ended) {
    alert("Das Spiel wurde bereits gewonnen du Wurst");
    return;
  }
  const x = event.clientX - offset;
  let nobX = -1;
  for (const row of rowObj) {
    nobX++;

    if (x < row.xStart || x > row.xEnd) {
      continue;
    }

    // get most bottom nob from column
    let nob = undefined;
    for (const n of row.nobs) {
      if (n.color !== hoverColor) {
        continue;
      }
      if (nob == undefined || n.y2 > nob.y2) {
        nob = n;
      }
    }

    if (nob == undefined || nob == null) {
      alert("Spalte is voll du Depp!");
      return;
    }
    
    // row found
    currentRound++;

    let nobY = -1;
    for (const n of row.nobs) {
      nobY++;
      if (n == nob) {
        break;
      }
    }

    console.log("Found nob:", nob);

    const currentPlayer = currentRound % playerCount;
    const playerColor = playerColors[currentPlayer % playerColors.length];

    // color nob to player color
    nob.color = playerColor;
    ctx.fillStyle = nob.color;
    ctx.fillRect(nob.x1, nob.y1, tileWidth, tileHeight);

    console.log("Clicked nob:", nobX, "|", nobY);

    isWinner(nobX, nobY);
    break;
  }
};
