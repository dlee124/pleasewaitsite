const { Engine, Runner, Bodies, Body, Constraint, World, Mouse, MouseConstraint } = Matter;

const canvas = document.getElementById('cradle-canvas');
const W = 600, H = 500;
const NUM_BALLS = 5;
const BALL_R = 22;
const SPACING = 47;
const PIVOT_Y = 120;
const REST_Y = 270;
const STRING_LEN = REST_Y - PIVOT_Y - BALL_R;

let engine, runner, world, balls, constraints, mouseConstraint, mouse;


function isDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function colors() {
  return isDark()
    ? { bg: '#eeeeee', frame: '#a9a9a9', string: '#dadada' }
    : { bg: '#eeeeee', frame: '#a9a9a9', string: '#dadada' };
}


function buildCradle() {
  if (engine) { Runner.stop(runner); World.clear(world); Engine.clear(engine); }

  engine = Engine.create({ gravity: { y: 1.5 } });
  world = engine.world;
  runner = Runner.create();

  balls = [];
  constraints = [];

  const startX = W / 2 - ((NUM_BALLS - 1) * SPACING) / 2;

  for (let i = 0; i < NUM_BALLS; i++) {
    const x = startX + i * SPACING;
    const ball = Bodies.circle(x, REST_Y, BALL_R, {
      restitution: 0.99,
      friction: 0,
      frictionAir: 0.001,
      density: 0.05,
      label: 'ball'
    });
    balls.push(ball);

    // THIS IS JUST ONE STRING
    const c = Constraint.create({
      pointA: { x: x, y: PIVOT_Y },
      bodyB: ball,
      pointB: { x: 0, y: 0 },
      length: STRING_LEN,
      stiffness: 0.8,
      damping: 0
    });

    constraints.push(c);
    World.add(world, [ball, c]);
  }

  mouse = Mouse.create(canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  World.add(world, mouseConstraint);

  Runner.run(runner, engine);
  requestAnimationFrame(drawLoop);
}


canvas.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  mouse.position.x = touch.clientX - rect.left;
  mouse.position.y = touch.clientY - rect.top;
  mouse.button = 0;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  mouse.position.x = touch.clientX - rect.left;
  mouse.position.y = touch.clientY - rect.top;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  mouse.button = -1;
  e.preventDefault();
}, { passive: false });

function raiseBalls(count, side) {
  const angle = -Math.PI / 4;
  if (side === 'left' || side === 'both') {
    for (let i = 0; i < count; i++) {
      const b = balls[i];
      const dx = Math.sin(angle) * STRING_LEN;
      const dy = -Math.cos(angle) * STRING_LEN;
      Body.setPosition(b, { x: b.position.x + dx, y: PIVOT_Y + BALL_R + dy });
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, 0);
    }
  }
  if (side === 'right' || side === 'both') {
    for (let i = 0; i < count; i++) {
      const b = balls[NUM_BALLS - 1 - i];
      const dx = -Math.sin(angle) * STRING_LEN;
      const dy = -Math.cos(angle) * STRING_LEN;
      Body.setPosition(b, { x: b.position.x + dx, y: PIVOT_Y + BALL_R + dy });
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, 0);
    }
  }
}

function drawLoop() {
  requestAnimationFrame(drawLoop);
  const ctx = canvas.getContext('2d');
  const c = colors();

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = c.bg;
  ctx.roundRect(0, 0, W, H, 12);
  ctx.fill();

  const frameTop = PIVOT_Y - 30;
  const frameLeft = W / 2 - ((NUM_BALLS - 1) * SPACING) / 2 - 36;
  const frameRight = W / 2 + ((NUM_BALLS - 1) * SPACING) / 2 + 36;

  ctx.strokeStyle = c.frame;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  ctx.beginPath(); ctx.moveTo(frameLeft, frameTop); ctx.lineTo(frameRight, frameTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frameLeft, frameTop); ctx.lineTo(frameLeft, frameTop + 160); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frameRight, frameTop); ctx.lineTo(frameRight, frameTop + 160); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frameLeft, frameTop + 14); ctx.lineTo(frameRight, frameTop + 14); ctx.stroke();

  // THESE ARE THE STRINGS
  for (let i = 0; i < constraints.length; i++) {
    ctx.lineWidth = 1;

    // this makes it curved and elastic and whatnot
    const con = constraints[i];
    const b = con.bodyB;
    const ax = con.pointA.x, ay = con.pointA.y;
    const bx = b.position.x + con.pointB.x;
    const by = b.position.y + con.pointB.y;

    const midX = (ax + bx) / 2 + b.velocity.x * 2;
    const midY = (ay + by) / 2 + b.velocity.y * 2;

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(midX, midY, bx, by);
    ctx.stroke();
  }

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    ctx.beginPath();
    ctx.arc(b.position.x, b.position.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#f7f7f7';
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

buildCradle();

/*
// 
document.getElementById('resetBtn').addEventListener('click', () => {
  buildCradle();
});
*/
