/** quadrix.js - A classic tetris clone written in javascript 
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

//Test that Pixi is working
console.log(PIXI);

var Text = PIXI.Text;

//colors
var blue = 0x66CCFF;
var red = 0xFF0000;
var greenNeon1 = 0x39FF14;
var greenNeon2 = 0x1cb200;
var white = 0xffffff;
var black = 0x000000;
var lightgray = 0xbbbbbb;
var darkgray = 0x555555;

var blockColor = greenNeon1; 
var textColor = white;


// Primitive vars
var blockLength = 20,
    blockWidth = 22,
    blockMargin = 4;

const EMPTY = 0;

// Games vars
var state = pause,
    level = 1,
    score = 0,
    lives = 3,
    startingLives = 3;

let gameTime = 0;
let gameTick = 500;     

// Board vars
let rows = 25;
let cols = 10;

let gridOffsetX = innerWidth/2 - ((blockWidth + blockMargin) * cols/2);
let gridOffsetY = 50;

// AI/Cheat

// Config vars
var debugMode = false,
    mouseControl = true;

// Texts
var livesLabel = "lives: ";
var scoreLabel = "score: ";
var levelLabel = "level: ";


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
    activeBlock.moveRight();
};
keyRight.release = function() {
    ;
};

keyLeft.press = function() {
    activeBlock.moveLeft();
};
keyLeft.release = function() {
    ;
};

keyUp.press = function() {
    activeBlock.rotate();
};
keyUp.release = function() {
    ;
};

keyDown.press = function() {
    ;
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
    //togglePause();
    randomizeGrid(frozenGrid);
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
    togglePause();
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
    ball.visible = true;
    draw();
}

function nextLevel (jump) {
    level += jump;
    resetLevel(level);
    pauseGame();
}

// GAME TEXTS ///////////////////////////////////////////////////////
var txtLives = new Text(
  livesLabel + lives,
  {font: "bold 32px courier", fill: textColor}
);

var txtScore = new Text(
  scoreLabel + score,
  {font: "bold 32px courier", fill: textColor}
);

var txtLevel = new Text(
  levelLabel + level,
  {font: "bold 32px courier", fill: textColor}
);

var txtPaused = new Text(
  "PAUSED",
  {font: "bold 64px courier", fill: textColor}
);

var txtGameOver = new Text(
  "GAME OVER",
  {font: "bold 72px courier", fill: textColor}
);

var txtCredits = new Text(
  "nitor",
  {font: "bold 64px courier", fill: textColor}
);


txtGameOver.visible = false;
txtPaused.visible = true;
txtCredits.visible = false;

txtScore.position.set(window.innerWidth - (txtScore.width * 1.4), txtScore.height * 0.1);
txtLives.position.set(window.innerWidth*0.02, txtLives.height * 0.1);
txtLevel.position.set(window.innerWidth*0.5 - txtLevel.width/2, txtLevel.height * 0.1);
txtPaused.position.set(window.innerWidth*0.2 - txtPaused.width/2, window.innerHeight*0.45);
txtGameOver.position.set(window.innerWidth/2 - txtGameOver.width/2, window.innerHeight*0.6);

txtScore.alpha = 0.9;
txtLives.alpha = 0.9;
txtLevel.alpha = 0.9;
txtPaused.alpha = 1.0;
txtGameOver.alpha = 1.0;

stage.addChild(txtScore);
stage.addChild(txtLives);
stage.addChild(txtLevel);
stage.addChild(txtPaused);
stage.addChild(txtGameOver);
stage.addChild(txtCredits);

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

function makeBlock (initx, inity) {
    var block = makeRectangle(initx, inity, blockWidth, blockWidth, blockColor)
    return block;
}


// create grid and all possible blocks in the grid
let frozenGrid = [];
let blocks = [];

initGrid(frozenGrid);
initBlocks(blocks);
drawGrid(frozenGrid, blocks);

// initialize grid with blocks 
function initGrid (grid) {
    for (var i = 0; i < rows; i++) {
        grid.push([]);
        for (var j = 0; j < cols; j++) {

            // random at first just for testing
            grid[i].push(EMPTY); 
        }
    }
}

// initialize all graphical blocks 
function initBlocks (blocks) {
    for (var i = 0; i < rows; i++) {
        blocks.push([]);
        for (var j = 0; j < cols; j++) {
            let blockx = makeBlock(gridOffsetX + j * (blockWidth + blockMargin), 
                                   gridOffsetY + (rows-1) * (blockWidth + blockMargin)
                                   - i * (blockWidth + blockMargin));

            // add to blocks array for future reference
            blocks[i].push(blockx); 
        }
    }
}

function drawGrid (grid, blocks) {

    // border/background
    let border = makeRectangle(gridOffsetX - blockMargin, 
                               gridOffsetY - blockMargin, 
                               (blockWidth + blockMargin) * cols + blockMargin, 
                               (blockWidth + blockMargin) * rows + blockMargin, 
                               darkgray);
    stage.addChild(border);

    // add all possible blocks
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {

            // add to stage for render
            stage.addChild(blocks[i][j]);
            // console.log("block added to stage", i, j);

            // only turn it on if the grid says so
            if (grid[i][j]) {
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


let bx = 50;
let by = 50;
let block1 = makeBlock(bx,by);
let block2 = makeBlock(bx + (blockWidth + blockMargin), by);
let block3 = makeBlock(bx + (blockWidth + blockMargin) * 2, by);
let block4 = makeBlock(bx, by + (blockWidth + blockMargin));
stage.addChild(block1);
stage.addChild(block2);
stage.addChild(block3);
stage.addChild(block4);

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


var activeBlock = {};

activeBlock.x = 3;
activeBlock.y = 20;
activeBlock.pattern = block_s;
activeBlock.rot = 1;
activeBlock.height = activeBlock.pattern[activeBlock.rot].length;
activeBlock.width = activeBlock.pattern[activeBlock.rot][0].length;

activeBlock.rotate = function() {
    activeBlock.rot += 1;
    activeBlock.rot = activeBlock.rot % activeBlock.pattern.length; 

    console.log("ROTATE: ", activeBlock.rot);
};

activeBlock.moveLeft = function() {
    activeBlock.x -= 1;
    activeBlock.x = Math.max(activeBlock.x, 0); 
    console.log("BLOCK LEFT");
};


activeBlock.moveRight = function() {
    activeBlock.x += 1;
    activeBlock.x = Math.min(activeBlock.x, cols - activeBlock.width); 
    console.log("BLOCK RIGHT");
};



// go through the game grid and update the block graphics
function updateGrid (grid, blocks) {

    // check all possible blocks
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            // only turn it on if the grid says so
            if (grid[i][j]) {
                blocks[i][j].visible = true;
            } else {
                blocks[i][j].visible = false;
            }
        }
    }

    return true;
}

function dropOne () {

    score += 1;

    toggleVisible(block2);

    // heartbeat
    // grid[0][0] = !grid[0][0]; 


    activeBlock.y -= 1;
    activeBlock.y = Math.max(activeBlock.y, activeBlock.height - 1);

    return;
}

// given a block and a grid, return a new grid with block written in
function flatten (b, grid) {
    let flatGrid = [];

    // copy current grid into flatGrid
    for (let row of grid) {
        flatGrid.push(row.slice(0));
    }

    // copy pattern of current active block into the flatGrid
    for (let j = 0; j < b.pattern[b.rot].length; j++) {
        for (let i = 0; i < b.pattern[b.rot][j].length; i++) {
            flatGrid[b.y - j][b.x + i] = b.pattern[b.rot][j][i];
        } 
    }

    return flatGrid;
}




// GOGO GADGET GAMELOOP!!!
console.log("Game loop starting...");
gameLoop();


// COLLISION LOGIC //////////////////////////////////////////////////

function detectCollisions () {
    ;
}

function boundObject (object) {
    if (object.x < 0) {
        object.x = 0;
        object.vx = 0;
    }
    if (object.y < 0) {
        object.y = 0;
        object.vy = 0;
    }
    if (object.x > window.innerWidth - object.width) {
        object.x = window.innerWidth - object.width;
        object.vx = 0;
    }
    if (object.y > window.innerHeight - object.height) {
        object.y = window.innerHeight - object.height;
        object.vy = 0;
    }
}

function bounceObject (object) {
    if (object.x < object.radius) {
        object.x = object.radius;
        object.vx = -object.vx;
    }
    
    if (object.x > window.innerWidth - object.radius) {
        object.x = window.innerWidth - object.radius;
        object.vx = -object.vx;
    }

    if (object.y < object.radius) {
        object.y = object.radius;
        object.vy = -object.vy;
    }
    if (object.y > window.innerHeight - object.radius) {
        object.y = window.innerHeight - object.radius;
        
        kill();
    }
}

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


    txtLives.text = livesLabel + lives;
    txtScore.text = scoreLabel + score;
    txtLevel.text = levelLabel + level;

    // do a game tick if it's time
    if (ts > gameTick + gameTime) {
        gameTime = Math.floor(ts); 

        dropOne();
    } 

    if (mouseControl) {
        ;
    }

    if (dead()) {
        txtGameOver.visible = true;
        pauseGame();
    }

    if (won()) {
        nextLevel(1);       // advance 1 level
    }

    // transform the gamespace with the changes to the current active block
    let drawingGrid = flatten(activeBlock, frozenGrid);

    // match the graphical grid by asking the game grid what it should look like
    updateGrid(drawingGrid, blocks);
}

function won () {
    return false;
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

    detectCollisions();
    
    animate();
}

function toggleVisible (x) {
    x.visible = !x.visible; 
    return;
}

function kill () {
    lives -= 1;
}

function dead () {
    return lives == 0;
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

