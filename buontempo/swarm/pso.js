var id = 0;

function makeParticles(number, width, height) {
  var particles = [];
  var i;
  for (i = 0; i < number; ++i) {
    x = getRandomInt(0.1*width, 0.9*width);
    y = height/2.0;
    var velocity = { x:getRandomInt(-5, 5), y:getRandomInt(0, 5)};
    particles.push ( { x: x,
	               y: y,
	               best: {x:x, y:y},
	               velocity: velocity } );
  }
  return particles;
}

function init() {
  if (id === 0) {
    var canvas = document.getElementById('myCanvas');
    document.getElementById("Go").innerHTML="stop";
    particles = makeParticles(20, canvas.width, canvas.height);
    var epoch = 0;
    draw(particles, epoch);
    var bestGlobal = particles[0]; //or whatever... pso will update this
    id = setTimeout(function () {
            pso(particles, epoch, bestGlobal, canvas.height, canvas.width);
         },
         150);
  }
  else {
    clearInterval(id);
    id = 0;
    var canvas = document.getElementById('myCanvas');
    document.getElementById("Go").innerHTML="go";
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function best(first, second) {
  if (first.y > second.y) {
    return first;
  }
  return second;
}

function updateBest(particles, bestGlobal) {
  particles.forEach( function(item) {
    bestGlobal = best(item, bestGlobal);
    item.best = best(item.best, item);
  });
  return bestGlobal;
}

function move_in_range(velocity, max, item, property) {
  var value = item[property] + velocity;
  if (value < 0) {
    item[property] = 0;
  }
  else if (value > max) {
    item[property] = max;
  }
  else {
    item[property] = value;
    item.velocity[property] = velocity;
  }
}

function move(particles, w, c1, c2, height, width, bestGlobal) {
  var r1;
  var r2;
  var vy;
  var vy;
  particles.forEach(function(current) {
    r1 = getRandomInt(0, 5);
    r2 = getRandomInt(0, 5);
    vy = (w * current.velocity.y)
	  + (c1 * r1 * (current.best.y - current.y))
	  + (c2 * r2 * (bestGlobal.y - current.y));
    vx = (w * current.velocity.x)
	  + (c1 * r1 * (current.best.x - current.x))
	  + (c2 * r2 * (bestGlobal.x - current.x));
    move_in_range(vy, height, current, "y");
    move_in_range(vx, width, current, "x");
  });
}


function draw(particles, epoch, particle_size) {
  var canvas = document.getElementById('myCanvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(180, 120, 60)";
    ctx.fillRect (2.5*particle_size, 2.5*particle_size,
		    canvas.width - 5*particle_size,
		    canvas.height - 5*particle_size);

    var result = document.getElementById("demo");
    result.innerHTML =  epoch;

    particles.forEach( function(particle) {
      ctx.fillStyle = "rgb(0,0,0)"; //another way to spell "black"
      ctx.fillRect (particle.x,
	      canvas.height - particle.y - particle_size/2,
	      particle_size, //width and height of particle - anything small
	      particle_size);
    });
  }
}


function pso(particles, epoch, bestGlobal, height, width) {
  epoch = epoch + 1;
  var inertiaWeight = 0.9;
  var personalWeight = 0.5;
  var swarmWeight = 0.5;
  var particle_size = 4;
  move(particles,
    inertiaWeight,
    personalWeight,
    swarmWeight,
    height - particle_size,
    width - particle_size,
    bestGlobal);
  draw(particles, epoch, particle_size);
  bestGlobal = updateBest(particles, bestGlobal);
  if (epoch < 40) {
    id = setTimeout(function () {
      pso(particles, epoch, bestGlobal, height, width);
    }, 150);
  }
}
