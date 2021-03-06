// Add the state checkboxes
var survive_checkboxes = [];
var born_checkboxes = [];
function makeCheckbox(name, num) {
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.onchange = saveState;
  return checkbox;
}
function td(content) {
  var td = document.createElement("td");
  td.appendChild(content);
  return td;
}
for(var i = 8 ; i >= 0; i--) {
  var c = makeCheckbox('survive', i);
  survive_checkboxes.splice(0,0,c);

  document.getElementById("s_list").appendChild(td(c));

  c = makeCheckbox('born', i);
  born_checkboxes.splice(0,0,c);
  document.getElementById("b_list").appendChild(td(c));
}

function randomButton(checkbox_list) {
  var button = document.createElement("button");
  button.innerText = "Randomize"
  button.onclick = function() {
    for(var id in checkbox_list) {
      if ( Math.random() > .5)
        checkbox_list[id].checked = true
      else
        checkbox_list[id].checked = false
    }
    saveState()
  }
  return button
}
document.getElementById("s_list").appendChild(randomButton(survive_checkboxes));
document.getElementById("b_list").appendChild(randomButton(born_checkboxes));
function rrs() {
  var checkbox_list = survive_checkboxes.concat(born_checkboxes);
    for(var id in checkbox_list) {
      if ( Math.random() > .5)
      checkbox_list[id].checked = true
    else
      checkbox_list[id].checked = false
  }
  saveState()
  singlePoint();
}


function saveState() {
  var state = survive_checkboxes.concat(born_checkboxes);
  var value = ""
  for(var id in state) {
    value += state[id].checked?1:0;
  }
  location.hash = WIDTH + "x" + HEIGHT + "x" + cellSize + "x" + value
}
function loadState() {
  var args = location.hash.substr(1).split('x')

  WIDTH = parseInt(args[0]) || 100;
  HEIGHT = parseInt(args[1]) || 100;
  // Cell dimension
  cellSize = parseInt(args[2]) || 10;

  state = args[3] || "001100000000100000" // gol


  var buttons = survive_checkboxes.concat(born_checkboxes);
  for(var id in state) {
    buttons[id].checked = state[id] == '1'
  }
  saveState();
}

// parse hash args
// #NxN = width x height
// #NxNxN = width x height x cell_size

// World dimensions
var WIDTH;
var HEIGHT;
// Cell dimension
var cellSize;
loadState(); // Read the args

var world = [];
var stateImageData = [];
var ALIVE = 1, DEAD = 0;

var canvas = document.getElementsByTagName("canvas")[0];
canvas.width = WIDTH * cellSize;
canvas.height = HEIGHT * cellSize;
var ctx = canvas.getContext('2d');

function newImageData(val) {
  var data = ctx.createImageData(cellSize, cellSize);
  for(var i = 0 ; i < cellSize * cellSize ; i++ ) {
    data.data[i*4+0]=val;
    data.data[i*4+1]=val;
    data.data[i*4+2]=val;
    data.data[i*4+3]=255;
  }
  return data;
}
stateImageData[ALIVE] = newImageData(0); // alive is black
stateImageData[DEAD] = newImageData(255); // dead is white

function drawCell(state, row, col) {
  ctx.putImageData(stateImageData[state], col * cellSize, row*cellSize);
}

function setCell(state, row, col) { // Update the map (and screen).
  if(world[row][col] != state) {
    world[row][col] = state;
    drawCell(state, row, col);
  }
}

var dragging = false;
canvas.onmousedown = function(e) {
  dragging = true;
  var row = e.y/cellSize |0;
  var col = e.x/cellSize |0;

  setCell(ALIVE, row, col);
}
canvas.onmouseup = function(e) {
  dragging = false;
}
canvas.onmousemove = function(e) {
  canvas.onmousedown(e);
}

// Create a new world.
function initalize(fill_percent) {
  for(var row = 0 ; row < HEIGHT; row++) {
    world.push([]);
    for(var col = 0 ; col < WIDTH ; col++)
      setCell(Math.random() < fill_percent? ALIVE: DEAD, row, col);
      //setCell((row%2) ? ALIVE : DEAD, row, col);
  }
}
initalize(.5);
function singlePoint() {
  for(var row = 0 ; row < HEIGHT; row++) {
    world.push([]);
    for(var col = 0 ; col < WIDTH ; col++)
      if (row != (HEIGHT>>1) || col != (WIDTH>>1))
        setCell(DEAD, row, col);
      else
        setCell(ALIVE, row, col);
  }
}

(function loop() {
  var top_row = world[0].slice(0); // used later.
  var prev_row = world[HEIGHT-1].slice(0); // row above current row.
  for(var row = 0 ; row < HEIGHT; row++) {
    var cur_row = world[row].slice(0); // copy of current row before modification
    var next_row = (row+1 == HEIGHT) ? top_row : world[row+1];

    var n = []; // delete me
    for(var col = 0 ; col < WIDTH ; col++) {
      var l = col ? col -1 : WIDTH -1; // left column
      var r = col == WIDTH-1 ? 0 : col + 1 ; // right column

      var cur_state = cur_row[col]
      var neighbors =
        (prev_row[l] == ALIVE ? 1 : 0) +
        (prev_row[col] == ALIVE ? 1 : 0) +
        (prev_row[r] == ALIVE ? 1 : 0) +
        (next_row[l] == ALIVE ? 1 : 0) +
        (next_row[col] == ALIVE ? 1 : 0) +
        (next_row[r] == ALIVE ? 1 : 0) +
        (cur_row[l] == ALIVE ? 1 : 0) +
        (cur_row[r] == ALIVE ? 1 : 0);

      setCell(computeState(cur_state, neighbors), row, col);
    }
    prev_row = cur_row;
  }
  requestAnimationFrame(loop);
})();

function computeState(cur, neigh) {
  if(cur == ALIVE)
    next_state = survive_checkboxes[neigh].checked
  else // cur == DEAD
    next_state = born_checkboxes[neigh].checked

  if(next_state)
    return ALIVE;
  return DEAD;
}



