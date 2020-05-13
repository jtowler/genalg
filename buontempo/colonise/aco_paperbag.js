/***
 * Excerpted from "Genetic Algorithms and Machine Learning for Programmers",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/fbmach for more book information.
***/
"use strict";
const edge = 10;
const scale = 150.0;

var id = 0;
var middle_start = false;

function init() {
  if (id === 0) {
    document.getElementById("click_draw").innerHTML="stop";
    var opt = document.getElementById("middle_start");
    if (opt) {
      middle_start = opt.checked;
    }
    begin();
  }
  else {
    stop();
  }
}


function stop() {
  clearInterval(id);
  id = 0;
  document.getElementById("click_draw").innerHTML="action";
}

function possible_positions(width, pos) {
  var possible = [
    {x: pos.x - 1, y: pos.y - 1},
    {x: pos.x,     y: pos.y - 1},
    {x: pos.x + 1, y: pos.y - 1},
    {x: pos.x - 1, y: pos.y},
    {x: pos.x + 1, y: pos.y},
    {x: pos.x - 1, y: pos.y + 1},
    {x: pos.x,     y: pos.y + 1},
    {x: pos.x + 1, y: pos.y + 1}
  ];

  return possible.filter( function(item) {
    return item.x >= 0 && item.x <= width
	  &&  item.y >= 0;
  });
}

function contains(a, obj){
  return a.findIndex( function(item) {
      return (item.x === obj.x && item.y === obj.y);
    }) !== -1;
}

function allowed_positions(width, pos, path) {
  var possible = possible_positions(width, pos);

  var allowed = [];
  var i = 0;
  for (i = 0; i < possible.length; i += 1) {
    if (!contains(path, possible[i])) {
      allowed.push(possible[i]);
    }
  }
  if (allowed.length === 0) {
      allowed = possible;
  }
  return allowed;
}

function next_pos(width, pos, path) {
  var allowed = allowed_positions(width, pos, path);
  var index = Math.floor(Math.random() * allowed.length);
  return allowed[index];
}

function start_pos(width) {
  if (middle_start) {
    return { x: Math.floor(width / 2), y: 0 };
  }
  return { x: Math.floor(Math.random() * (width+1)), y: 0 };
}

function random_path(height, width) {
  // Assume we start at the bottom
  //   If we get to the top, we're out so finish
  var path = [];
  var pos = start_pos(width);
  path.push(pos);

  while (pos.y < height) {
    pos = next_pos(width, pos, path);
    path.push(pos);
  }

  return path;
}

function make_paths(height, width, ants) {
  var paths = [];
  var i;
  for (i = 0; i < ants; i += 1) {
    paths.push( random_path(height, width) );
  }
  return paths;
}

function pheromone_at(pheromones, pos) {
  return pheromones.findIndex( function(item) {
      return (item.x === pos.x && item.y === pos.y);
    });
}

function taueta(pheromone, y) {
  var alpha = 1.0;
  var beta = 3.0;
  return Math.pow(pheromone, alpha) * Math.pow(y, beta);
}

function partial_sum(moves, pheromones){
  var total = 0.0;
  var index;
  var i;
  var cumulative = [total];
  for (i = 0; i < moves.length; i += 1) {
    index = pheromone_at(pheromones, moves[i]);
    if (index !== -1) {
      total += taueta(pheromones[index].weight, pheromones[index].y);
    }
    cumulative.push(total);
  }
  return cumulative;
}

function roulette_wheel_choice(moves, pheromones) {
  var cumulative = partial_sum(moves, pheromones);
  var total = cumulative[cumulative.length-1];
  var p = Math.random() * total;
  var i;

  for (i = 0; i < cumulative.length - 1; i += 1) {
    if (p > cumulative[i] && p <= cumulative[i+1]) {
      return moves[i];
    }
  }

  p = Math.floor(Math.random() * moves.length);
  return moves[p];
}

function pheromone_path(height, width, pheromones) {
  var path = [];
  var moves;
  var pos = start_pos(width);
  path.push(pos);

  while (pos.y < height) {
    moves = allowed_positions(width, pos, path);
    pos = roulette_wheel_choice(moves, pheromones);
    path.push(pos);
  }
  return path;
}

function new_paths(pheromones, height, width, ants) {
  var paths = [];
  var i;
  for (i = 0; i < ants; i += 1) {
    paths.push( pheromone_path(height, width, pheromones) );
  }
  return paths;
}

function euclidean_distance(first, second) {
  return Math.sqrt(Math.pow(first.x - second.x, 2)
		 + Math.pow(first.y - second.y, 2));
}

function total_length(path) {
  var i;
  var length = 0;
  for (i = 1; i < path.length; i += 1) {
    length += euclidean_distance(path[i-1], path[i]);
  }
  return length;
}

function find_best(paths) {
  var lengths = paths.map(function(item) {
    return total_length(item);
  });
  var minimum = Math.min(...lengths);
  return lengths.indexOf(minimum);
}

function find_worst(paths) {
  var lengths = paths.map(function(item) {
    return total_length(item);
  });
  var maximum = Math.max(...lengths);
  return lengths.indexOf(maximum);
}

function find_average(paths) {
  if (paths.length === 0) {
    return 0.0;
  }
  var sum = paths.reduce(function(sum, item) {
    return sum + total_length(item);
  }, 0);
  return sum / paths.length;
}

function path_to_string(height, path){
  var result = "";
  path.forEach(function (item){
    result = result +  " (" +
	    item.x +
	    ", " +
	    (height - item.y) +
	    ")";
  });
  return result;
}

function draw_path(ctx, edge, height, path) {
  if (path.length === 0) {
    return;
  }

  var x = function(pos) {
    return edge + pos.x * scale;
  };
  var y = function(pos) {
    return height - pos.y * scale;
  };

  ctx.beginPath();
  ctx.moveTo(x(path[0]), y(path[0]));

  path.slice(1).forEach( function(item){
    ctx.lineTo(x(item), y(item));
  });
  ctx.stroke();
}

function draw(iteration, paths) {
  var i;
  var canvas = document.getElementById("ant_canvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(180, 120, 60)";
    ctx.fillRect (edge, scale, canvas.width-2*edge, canvas.height-scale);
    ctx.lineWidth = 5;

    var result = document.getElementById("iteration");
    result.innerHTML = iteration;

    i = find_best(paths);
    draw_path(ctx, edge, canvas.height, paths[i]);
    var path = path_to_string(Math.floor(canvas.height/scale), paths[i]);
    document.getElementById("best").innerHTML += ", " + total_length(paths[i]).toFixed(2);
    document.getElementById("path").innerHTML = "\n " + path;

    i = find_worst(paths);
    ctx.setLineDash([5, 15]);
    draw_path(ctx, edge, canvas.height, paths[i]);
    ctx.setLineDash([]);
    document.getElementById("worst").innerHTML += ", " + total_length(paths[i]).toFixed(2);

    document.getElementById("average").innerHTML += ", " + find_average(paths).toFixed(2);
  }
}

function evaporate(pheromones) {
  var rho = 0.25;
  for(var i = 0; i < pheromones.length; i += 1) {
    pheromones[i].weight *= (1-rho);
  }
}

function add_new_pheromones(height, pheromones, path) {
  var index;
  var Q = 2.0 * height;
  var L = Q/total_length(path);

  path.forEach ( function(pos) {
    index = pheromone_at(pheromones, pos);
    if ( index !== -1 ) {
      pheromones[index].weight += L;
    }
    else {
      pheromones.push( {x: pos.x, y: pos.y, weight: L} );
    }
  });
}


function update(pheromones, paths, height) {
  evaporate(pheromones);
  paths.forEach( function(path){
    add_new_pheromones(height, pheromones, path);
  });
}

function aco(iteration, ants, pheromones, height, width) {
  var paths = new_paths(pheromones, height, width, ants);
  update(pheromones, paths, height);
  draw(iteration, paths);

  if (iteration === 50) {
    stop();
  }
  return iteration + 1;
}

function begin() {
  var iteration = 0;
  var canvas = document.getElementById("ant_canvas");
  var pheromones = [];
  var height = canvas.height / scale;
  var width = (canvas.width-2*edge) / scale;
  var ants = 25;
  var paths = make_paths(height, width, ants);
  update(pheromones, paths, height);
  draw(iteration, paths);
  id = setInterval(function() {
      iteration = aco(iteration, ants, pheromones, height, width);
    },
    100);
}
