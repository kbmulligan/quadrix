/** quadrix.js - A classic arcade clone written in javascript 
 *                       using the Pixi.js and Tink libraries.
 *
 *                       Pixi.js - http://www.pixijs.com/ 
 *                       Tink - https://github.com/kittykatattack/tink
 * Author: kbmulligan
 * Date started: May 2020
 * Latest Edits: May 2020
 * Version: 0.1
 * digmshiphter@gmail.com
 * Twitter: n1t0r
 
    Copyright (c) <2020> <K. Brett Mulligan>

    Permission is hereby granted, free of charge, to any person obtaining 
    a copy of this software and associated documentation files 
    (the "Software"), to deal in the Software without restriction, including 
    without limitation the rights to use, copy, modify, merge, publish, 
    distribute, sublicense, and/or sell copies of the Software, and to permit 
    persons to whom the Software is furnished to do so, subject to the 
    following conditions:

    The above copyright notice and this permission notice shall be included in 
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
    DEALINGS IN THE SOFTWARE.
 */
/**

    TODO: 
        - Next piece display
        - Ghost piece
        - Hard drop

*/

//Test that Pixi is working
console.log(PIXI);

var Text = PIXI.Text;

//colors
var blue = 0x66CCFF;
var red = 0xFF0000;
var green = 0x00FF00;
var yellow = 0xFFFF00;
var orange = 0xFFA500;
var purple = 0xFF00FF;
var greenNeon1 = 0x39FF14;
var greenNeon2 = 0x1cb200;
var white = 0xffffff;
var black = 0x000000;
var lightgray = 0xbbbbbb;
var darkgray = 0x555555;

var blockColor = greenNeon1; 
var textColor = white;


let blockColors = [1, 2, 3, 4, 5, 6, 7];

// Primitive vars
var blockLength = 20,
    blockWidth = 22,
    blockMargin = 2;
let borderMargin = 5;

const EMPTY = 0;
const FULL = 1;
const FLOOR = 5;
const WALL = 5;


// Games vars
var state = pause,
    level = 1,
    score = 0,
    lives = 3,
    lines = 0,
    startingLives = 3;

let gameTime = 0;
let gameTick = 500;     
let acceleration = 0.95;     // how quickly the game speeds up when a line is cleared
                             // lower is faster 

let lastAdvance = 0;     
let dropTime = 200;     

let levelUpScore = 1000;     // score to reach before next level

// Board vars
let rows = 25;
let cols = 15;

let gridOffsetX = innerWidth * 0.5 - ((blockWidth + blockMargin) * (cols - WALL)/2);
let gridOffsetY = 50;

let uiOffsetX = innerWidth * 0.05;
let uiOffsetY = 50;

// AI/Cheat

// Config vars
var debugMode = false,
    mouseControl = true;
let showBorder = true;
let debugShowAllGrid = false;


// Texts
var livesLabel = "LIVES: ";
var linesLabel = "LINES: ";
var scoreLabel = "SCORE: ";
var levelLabel = "LEVEL: ";


//Create the renderer
var renderer = PIXI.autoDetectRenderer(256, 256);

if (renderer.type == PIXI.RENDERER_TYPE.WEBGL) {
   console.log('Using WebGL...');
} else {
  console.log('Using Canvas...');
};


//Configure the renderer
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoDensity = true;
renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();


// link tink
var t = new Tink(PIXI, renderer.view);
var pointer = t.makePointer();


// UTILITY FUNCTIONS ////////////////////////////////////////////////
function randomSign (chanceNeg) {
    var val = Math.random() - chanceNeg;
    var sign = 0;
    if (val > 0) {
        sign = 1;
    }
    else {
        sign = -1;
    }
    return sign;
}

// INPUT CODE ///////////////////////////////////////////////////////
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

// input code setup
var up = 38;
var down = 40;
var left = 37;
var right = 39;
var space = 32;
var enter = 13;
var esc = 27;

var keyLeft = keyboard(left);
var keyRight = keyboard(right);
var keyUp = keyboard(up);
var keyDown = keyboard(down);
var keySpace = keyboard(space);
var keyEnter = keyboard(enter);
var keyEsc = keyboard(esc);

keyRight.press = function() {
    if (state == play) {
        activeBlock.moveRight(frozenGrid);
    }
};
keyRight.release = function() {
    ;
};

keyLeft.press = function() {
    if (state == play) {
        activeBlock.moveLeft(frozenGrid);
    }
};
keyLeft.release = function() {
    ;
};

keyUp.press = function() {
    if (state == play) {
        activeBlock.rotate(frozenGrid);
    }
};
keyUp.release = function() {
    ;
};

keyDown.press = function() {
    dropOne(activeBlock);
};
keyDown.release = function() {
    ;
};

keyEsc.press = function() {
    ;
};
keyEsc.release = function () {
    togglePause();
};

keySpace.press = function() {
    ;
};
keySpace.release = function() {
    togglePause();
    //randomizeGrid(frozenGrid);
    ;
};

keyEnter.press = function() {
    ;
};
keyEnter.release = function () {
    resetGame();
    pauseGame();
};

pointer.tap = function () {
    // console.log("The pointer was tapped.");
    ;
};

pointer.press = function () {
    // console.log("The pointer was pressed.");
    // togglePause();
    ; 
};

pointer.release = function () {
    // console.log("The pointer was released.");
    ;
};

// GAME CONTROL /////////////////////////////////////////////////////
function pauseGame () {
    txtPaused.visible = true;
    pointer.visible = true;

    state = pause;
}

function unPauseGame () {
    txtPaused.visible = false;
    //pointer.visible = false;

    state = play;
}

function togglePause () {
    if (state == play) {
        pauseGame();
    }

    else if (state == pause) {
        unPauseGame();
    }
}

function resetGame () {
    txtGameOver.visible = false;
    lives = startingLives;
    score = 0;
}
    
function resetLevel (level) {
    txtGameOver.visible = false;
    activeBlock.start();
    activeBlock.getNewBlock();
    draw();
}

function nextLevel (jump) {
    level += jump;
    resetLevel(level);
    pauseGame();
}

// GAME TEXTS ///////////////////////////////////////////////////////
var defaultFont = {fontFamily: "Courier", 
                   fontSize: 32, 
                   fontWeight: "bold",
                   fill: textColor, 
                   align: "center"};
var txtLives = new Text(
  livesLabel + lives,
  defaultFont 
);
txtLives.visible = false;

var txtLines = new Text(
  linesLabel + lines,
  defaultFont
);

var txtScore = new Text(
  scoreLabel + score,
  defaultFont
);

var txtLevel = new Text(
  levelLabel + level,
  defaultFont 
);

var txtPaused = new Text(
  "PAUSED",
  defaultFont
);

var txtGameOver = new Text(
  "GAME OVER",
  defaultFont
);

var txtCredits = new Text(
  "nitor",
  defaultFont
);


txtGameOver.visible = false;
txtPaused.visible = true;
txtCredits.visible = false;

txtScore.position.set(uiOffsetX, uiOffsetY + txtScore.height * 0.1);
txtLines.position.set(uiOffsetX, uiOffsetY + txtScore.height * 1.1);
txtLevel.position.set(uiOffsetX, uiOffsetY + txtScore.height * 2.1);
txtLives.position.set(uiOffsetX, uiOffsetY + txtScore.height * 4.1);
txtPaused.position.set(window.innerWidth/2 - txtPaused.width/2, window.innerHeight*0.85);
txtGameOver.position.set(window.innerWidth/2 - txtGameOver.width/2, window.innerHeight*0.5);

txtScore.alpha = 0.9;
txtLives.alpha = 0.9;
txtLevel.alpha = 0.9;
txtPaused.alpha = 1.0;
txtGameOver.alpha = 1.0;


function makeRectangle (initx, inity, length, width, color) {
    var rectangle = new PIXI.Graphics();
    rectangle.beginFill(color);
    rectangle.drawRect(0, 0, length, width);
    rectangle.endFill();
    rectangle.x = initx;
    rectangle.y = inity;
    rectangle.vx = 0;
    rectangle.vy = 0;

    return rectangle;
}

function makeCircle (initx, inity, radius, color) {
    var circle = new PIXI.Graphics();
    circle.beginFill(color);
    circle.drawCircle(0, 0, radius);
    circle.endFill();
    circle.radius = radius;
    circle.x = initx;
    circle.y = inity;
    circle.vx = 0;
    circle.vy = 0;

    return circle;
}

function makeBlock (initx, inity, color) {
    var block = makeRectangle(initx, inity, blockWidth, blockWidth, color)
    return block;
}


// create grid and all possible blocks in the grid
let frozenGrid = [];
let blocks = [];
let blocksBackground = [];

initGrid(frozenGrid);
initBlocks(blocks, blockColor);
initBlocks(blocksBackground, black);
drawGrid(frozenGrid, blocks);

// initialize grid with blocks 
function initGrid (grid) {
    for (var i = 0; i < rows; i++) {
        grid.push([]);
        for (var j = 0; j < cols; j++) {
            grid[i].push(EMPTY); 
            if (i < FLOOR || j > cols - WALL - 1) {
                grid[i][j] = FULL; 
                if (i < FLOOR && j > cols - WALL - 1) {
                    grid[i][j] = EMPTY;
                }
            }
        }
    }
}

// initialize all graphical blocks 
function initBlocks (blocks, color) {
    for (var i = 0; i < rows; i++) {
        blocks.push([]);
        for (var j = 0; j < cols; j++) {
            let blockx = makeBlock(gridOffsetX + j * (blockWidth + blockMargin), 
                                   gridOffsetY + (rows-1) * (blockWidth + blockMargin)
                                   - i * (blockWidth + blockMargin), 
                                   green);

            // add to blocks array for future reference
            blocks[i].push(blockx); 
        }
    }
}

function drawGrid (grid, blocks) {

    // border/background
    /*
    let border1 = makeRectangle(gridOffsetX - blockMargin, 
                               gridOffsetY - blockMargin, 
                               (blockWidth + blockMargin) * cols + blockMargin, 
                               (blockWidth + blockMargin) * rows + blockMargin, 
                               darkgray);
    stage.addChild(border1);
    */

    let borderOuter = makeRectangle(
                          gridOffsetX - borderMargin, 
                          gridOffsetY - borderMargin, 
                          (blockWidth + blockMargin) * (cols - WALL) + borderMargin * 2, 
                          (blockWidth + blockMargin) * (rows - FLOOR) + borderMargin * 2, 
                          blue);
    let borderInner = makeRectangle(
                          gridOffsetX, 
                          gridOffsetY, 
                          (blockWidth + blockMargin) * (cols - WALL) - blockMargin, 
                          (blockWidth + blockMargin) * (rows - FLOOR) - blockMargin, 
                          black);


    if (showBorder) {
        stage.addChild(borderOuter);
        stage.addChild(borderInner);
    }

    // add all possible blocks
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {

            // add to stage for render
            //stage.addChild(blocksBackground[i][j]);
            stage.addChild(blocks[i][j]);
            // console.log("block added to stage", i, j);

            // only turn it on if the grid says so
            let inPlayableArea = i >= FLOOR && j < cols - WALL;
            if (grid[i][j] && (inPlayableArea || debugShowAllGrid)) {
                blocks[i][j].visible = true;
            } else {
                blocks[i][j].visible = false;
            }
        }
    }

    return true;
}

function randomizeGrid (grid) {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            let occupied = Math.round(Math.random());
            grid[i][j] = occupied; 
        }
    }
}

// BLOCK TYPES //////////////////////////////////////////////////////
let block_i = [
                  [[1,0,0,0],
                   [1,0,0,0],
                   [1,0,0,0],
                   [1,0,0,0]],
                  [[1,1,1,1],
                   [0,0,0,0],
                   [0,0,0,0],
                   [0,0,0,0]]
              ];

let block_t = [
                  [[1,1,1,0],
                   [0,1,0,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[1,0,0,0],
                   [1,1,0,0],
                   [1,0,0,0],
                   [0,0,0,0]],
                  [[0,1,0,0],
                   [1,1,1,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[0,1,0,0],
                   [1,1,0,0],
                   [0,1,0,0],
                   [0,0,0,0]]
              ];

let block_s = [
                  [[0,1,1,0],
                   [1,1,0,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[1,0,0,0],
                   [1,1,0,0],
                   [0,1,0,0],
                   [0,0,0,0]]
              ];

let block_z = [
                  [[1,1,0,0],
                   [0,1,1,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[0,1,0,0],
                   [1,1,0,0],
                   [1,0,0,0],
                   [0,0,0,0]]
              ];

let block_l = [
                  [[1,1,1,0],
                   [1,0,0,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[1,0,0,0],
                   [1,0,0,0],
                   [1,1,0,0],
                   [0,0,0,0]],
                  [[0,0,1,0],
                   [1,1,1,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[1,1,0,0],
                   [0,1,0,0],
                   [0,1,0,0],
                   [0,0,0,0]]
              ];

let block_j = [
                  [[1,1,1,0],
                   [0,0,1,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[0,1,0,0],
                   [0,1,0,0],
                   [1,1,0,0],
                   [0,0,0,0]],
                  [[1,0,0,0],
                   [1,1,1,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[1,1,0,0],
                   [1,0,0,0],
                   [1,0,0,0],
                   [0,0,0,0]]
              ];

let block_o = [
                  [[1,1,0,0],
                   [1,1,0,0],
                   [0,0,0,0],
                   [0,0,0,0]],
                  [[1,1,0,0],
                   [1,1,0,0],
                   [0,0,0,0],
                   [0,0,0,0]]
              ];


let patterns = [block_i, block_t, block_l, block_j, block_s, block_z, block_o];

var activeBlock = {};
var ghostBlock = {};


// rotates current block to the next sequence
activeBlock.rotate = function(g) {

    // advance rotation and wrap if too far
    activeBlock.rot += 1;
    if (activeBlock.rot >= activeBlock.pattern.length) {
        activeBlock.rot = 0;
    }

    // reverse if would be invalid grid state
    let proposedGrid = addGrids(activeBlock, normalizeGrid(g));
    if (hasOverlap(proposedGrid)) {
        activeBlock.rot -= 1;
        if (activeBlock.rot < 0) {
            activeBlock.rot = activeBlock.pattern.length - 1;
        }
        //console.log("ROTATE NOT A GREAT IDEA");
    }

    //console.log("ROTATE: ", activeBlock.rot);
};

activeBlock.moveLeft = function(g) {

    // move
    activeBlock.x -= 1;

    // limit
    activeBlock.x = Math.max(activeBlock.x, 0); 

    // limit
    let proposedGrid = addGrids(activeBlock, normalizeGrid(g));
    if (hasOverlap(proposedGrid)) {
        activeBlock.x += 1;
        //console.log("BLOCK LEFT NOT A GREAT IDEA, OVERLAPS");
    }

    //console.log("BLOCK LEFT");
};


activeBlock.moveRight = function(g) {

    // move
    activeBlock.x += 1;

    // limit
    let proposedGrid = addGrids(activeBlock, normalizeGrid(g));
    if (hasOverlap(proposedGrid)) {
        activeBlock.x -= 1;
        //console.log("BLOCK RIGHT NOT A GREAT IDEA, OVERLAPS");
    }

    //console.log("BLOCK RIGHT");
};

activeBlock.start = function() {
    activeBlock.y = frozenGrid.length - 1;
    activeBlock.x = Math.floor(Math.random() * 4) + 3;
};


function plant (block, g) {
    let newGrid = flatten(block, g);
    return newGrid;
};


activeBlock.getNewBlock = function() {
    let selection = Math.floor(Math.random() * patterns.length);

    if (debugMode)  {
        let narrowChoice = [0,1,6];
        selection = narrowChoice[Math.floor(Math.random() * narrowChoice.length)]
    }

    activeBlock.pattern = patterns[selection];
    activeBlock.rot = Math.floor(Math.random() * activeBlock.pattern.length);

    // add color
    activeBlock.colorNum = Math.floor(Math.random() * blockColors.length) + 1;

    //console.log("NEW BLOCK:", selection, activeBlock.rot);
}

// go through the game grid and update the block graphics
function updateGrid (grid, blocks) {

    // check all possible blocks
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            // only turn it on if the grid says so
            let inPlayableArea = i >= FLOOR && j < cols - WALL;
            if (grid[i][j] && (inPlayableArea || debugShowAllGrid)) {
                blocks[i][j].visible = true;
                stage.removeChild(blocks[i][j]);

                let blockColor = getBlockColor(grid[i][j]);
                blocks[i][j] = makeBlock(gridOffsetX + j * (blockWidth + blockMargin), 
                                   gridOffsetY + (rows-1) * (blockWidth + blockMargin)
                                   - i * (blockWidth + blockMargin), 
                                   blockColor);
                stage.addChild(blocks[i][j]);
            } else {
                blocks[i][j].visible = false;
            }
        }
    }

    return true;
}

function getBlockColor (num) {
    let color = white;

    if (num == 1) {
        color = green;
    } 
    if (num == 2) {
        color = red;
    } 
    if (num == 3) {
        color = yellow;
    } 
    if (num == 4) {
        color = blue;
    } 
    if (num == 5) {
        color = orange;
    } 
    if (num == 6) {
        color = purple;
    } 
    if (num == 7) {
        color = white;
    } 

    return color;
}

// move block b down by one row, returns true if it's now hitting something 
function dropOne (b) {
    
    b.y -= 1;
    let proposedGrid = addGrids(b, normalizeGrid(frozenGrid));

    if (hasOverlap(proposedGrid)) {
        //console.log("DROP ONE: NOT GONNA, HAS OVERLAP");

        b.y += 1;
        frozenGrid = plant(b, frozenGrid);
        b.start();
        b.getNewBlock();

    } else {
        ; 
    }

    return;
}

// given a block and a grid, return a new grid with block written in
// LOGICAL OR THE CONTENTS OF EACH CELL
function flatten (b, grid) {
    let flatGrid = [];

    // copy current grid into flatGrid
    for (let row of grid) {
        flatGrid.push(row.slice(0));
    }

    // copy pattern of current active block into the flatGrid
    for (let j = 0; j < b.pattern[b.rot].length; j++) {
        for (let i = 0; i < b.pattern[b.rot][j].length; i++) {
            let blockCell = b.pattern[b.rot][j][i];
            let gridCell = flatGrid[b.y - j][b.x + i];
            if (blockCell > 0) {
                flatGrid[b.y - j][b.x + i] = blockCell * b.colorNum;
            } else {
                flatGrid[b.y - j][b.x + i] = gridCell;
            }
        } 
    }

    return flatGrid;
}

// given a block and a grid, return a new grid with block written in
// ADDS THE CONTENTS OF EACH CELL
function addGrids (b, grid) {
    let sumGrid = [];

    // copy current grid into flatGrid
    for (let row of grid) {
        sumGrid.push(row.slice(0));
    }

    // copy pattern of current active block into the flatGrid
    for (let j = 0; j < b.pattern[b.rot].length; j++) {
        for (let i = 0; i < b.pattern[b.rot][j].length; i++) {
            let blockCell = b.pattern[b.rot][j][i];
            let gridCell = sumGrid[b.y - j][b.x + i];
            sumGrid[b.y - j][b.x + i] = blockCell + gridCell;  
        } 
    }

    return sumGrid;
}

// checks each cell in grid for value greater than 1
function hasOverlap (grid) {
    let totalCollisions = 0;
    let collisions = [];

    for (let row of grid) {
        collisions = row.filter(x => x > 1);
        totalCollisions += collisions.length;
    }
    
    //console.log("HAS OVERLAP FOUND X COLLISIONS: ", totalCollisions);
    return totalCollisions > 0;
}

// given grid, returns a list of indices of rows in the grid that are full
function getFullRows (grid) {
    let rowList = [];

    for (let i = 0; i < grid.length; i++) {
        if (sumRow(grid[i]) >= cols) {
            console.log("SUM: ", i, sumRow(grid[i]));
            rowList.push(i);
        } 
    }

    return rowList;
}


// given a grid and a row index:
//     -- remove the row from the grid, shifting down 
function removeRow (grid, i) {

    console.log("REMOVING ROW: ", i);

    // remove the row at index i 
    grid.splice(i,1);

    // create new empty row 
    let newRow = newEmptyRow();

    // insert new row into grid at the top
    grid.splice(grid.length - 1, 0, newRow);
       
    console.log("NEW GRID: ", grid);

    return;
}

function newEmptyRow () {
    let newRow = [];
    for (var j = 0; j < cols; j++) {
        let value = EMPTY; 
        if (j > cols - WALL - 1) {
            value = FULL;
        }

        newRow.push(value); 
    }
    return newRow;
}


// add UI elements before start
stage.addChild(txtScore);
stage.addChild(txtLives);
stage.addChild(txtLines);
stage.addChild(txtLevel);
stage.addChild(txtPaused);
stage.addChild(txtGameOver);
stage.addChild(txtCredits);

// initialize activeBlock
activeBlock.start();
activeBlock.getNewBlock();

/*
let test = [0,1,2,3,4,105];
console.log(test);
console.log(normalizeRow(test));
*/

// GOGO GADGET GAMELOOP!!!
console.log("Game loop starting...");
gameLoop();


function distance (ax, ay, bx, by) {
    return Math.sqrt(Math.pow((ax-bx),2) + (Math.pow((ay-by),2)));
}


// MAIN GAME LOOP ///////////////////////////////////////////////////
function gameLoop (timestamp) {
    requestAnimationFrame(gameLoop);
    t.update();
    state(timestamp);
    draw();
}

function update (ts) {

    // update UI text elements
    txtLives.text = livesLabel + lives;
    txtLines.text = linesLabel + lines;
    txtScore.text = scoreLabel + score;
    txtLevel.text = levelLabel + level;

    // do a game tick if it's time
    if (ts > gameTick + gameTime) {
        gameTime = Math.floor(ts); 
        dropOne(activeBlock);
    } 

    // check for completed rows and increase score based on any
    let fullRows = getFullRows(normalizeGrid(frozenGrid));

    let removed = 0;
    while (fullRows.length > 0) {

        console.log("FULL ROWS: ", fullRows);

        // remove one full row
        removeRow(frozenGrid, fullRows[0]);

        // check for any more
        fullRows = getFullRows(normalizeGrid(frozenGrid));

        removed += 1;
    }

    if (removed > 0) {
        score += removed*removed * 10; 
        lines += removed;

        // increase speed
        gameTick *= acceleration;
    }


    


    if (dead(frozenGrid)) {
        txtGameOver.visible = true;
        pauseGame();
        console.log("Appears this is a dead game state.");
    }

    if (won()) {
        nextLevel(1);       // advance 1 level
    }

    
    // DO THIS STUFF ALL THE TIME AS FAST AS POSSIBLE

    // update location of ghost piece
    while (false) {

    }


    // faster drop for keyDown
    if (keyDown.isDown && ts > lastAdvance + dropTime ) {
        lastAdvance = ts;
        dropOne(activeBlock);
    }

    // transform the gamespace with the changes to the current active block
    let drawingGrid = flatten(activeBlock, frozenGrid);

    // match the graphical grid by asking the game grid what it should look like
    updateGrid(drawingGrid, blocks);

}

function dead (g) {
   
    // select top row from  
    let topRow = g[g.length - 1]; 

    // say dead if any permanent blocks occupy first row
    // return  sumRow(topRow) >= 0;
    return false;
}

function normalizeRow (row) {
    return row.map(x => x > 0 ? 1 : 0 );
}

function normalizeGrid (g) {
    let ng = [];

    for (let r of g) {
        ng.push(normalizeRow(r));
    }

    return ng;
}

function sumRow (row) {
    return row.reduce((sum, x) => (sum + x), 0);
}

function won () {
    return score > levelUpScore;
}

function anyVisible (sprites) {
    var anyVis = false;
    for (var i = 0; i < sprites.length; i++) {
        if (sprites[i].visible == true) {
            anyVis = true;
        }
    }
    return anyVis;
}



function play (timestamp) {

    // pointer mx for when it drifts off canvas and then back on
    // pointer.visible = false;

    update(timestamp);
    animate();
}

function toggleVisible (x) {
    x.visible = !x.visible; 
    return;
}

function kill () {
    lives -= 1;
}


function animate() {
    ;
}

function pause (timestamp) {
    ;
}


function draw () {
    //Tell the `renderer` to `render` the `stage`
    renderer.render(stage);
}

