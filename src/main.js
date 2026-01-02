import './style.css'
import Matter from 'matter-js'
import { levels } from './levels.js'
import { audioManager } from './audio.js'

// Module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Events = Matter.Events;

// Game State
let currentLevelIndex = 0;
let isLevelCompleted = false;

const state = {
  isDragging: false,
  startPoint: null,
};

// UI Elements
const uiStatus = document.getElementById('status-display');
const btnReset = document.getElementById('btn-reset');
const btnClear = document.getElementById('btn-clear');
const uiLayer = document.getElementById('ui-layer');

// Create dynamic level info UI
const levelInfo = document.createElement('div');
levelInfo.className = 'level-info';
levelInfo.innerHTML = `<h2 id="level-name"></h2><p id="level-instruction"></p>`;
// Insert after title
uiLayer.insertBefore(levelInfo, uiStatus);

// Setup Engine
const engine = Engine.create();
const world = engine.world;
engine.gravity.y = 1;

// Setup Renderer
const render = Render.create({
  element: document.getElementById('app'),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: 'transparent',
    pixelRatio: window.devicePixelRatio
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// --- Level Management ---
let ball = null;
let goal = null;

function loadLevel(index) {
  if (index >= levels.length) {
    index = 0; // Loop back or show credits
  }
  particleManager.clear();
  currentLevelIndex = index;
  const levelData = levels[index];
  isLevelCompleted = false;
  uiStatus.classList.remove('active');
  engine.timing.timeScale = 1;

  // Clear World
  Composite.clear(world);
  Engine.clear(engine); // Clear events to prevents duplicates if not careful, but we handle events globally

  // Re-add boundaries (always present)
  // Note: we might want custom boundaries per level, but global is fine for now
  // Actually, let's just use level obstacles.

  // 1. Create Obstacles
  const newBodies = [];

  // Static Obstacles
  levelData.obstacles.forEach(obs => {
    newBodies.push(Bodies.rectangle(obs.x, obs.y, obs.w, obs.h, {
      isStatic: true,
      angle: obs.angle,
      render: { fillStyle: '#444' },
      label: 'obstacle'
    }));
  });

  // 2. Create Goal
  goal = Bodies.rectangle(levelData.goalPos.x, levelData.goalPos.y, 80, 20, {
    isStatic: true,
    isSensor: true,
    render: {
      fillStyle: '#ff00ff',
      strokeStyle: '#ff00ff',
      lineWidth: 4,
    },
    label: 'goal'
  });
  newBodies.push(goal);

  // 3. Create Ball
  ball = Bodies.circle(levelData.ballPos.x, levelData.ballPos.y, 15, {
    restitution: 0.6,
    friction: 0.001,
    render: {
      fillStyle: '#00f3ff',
      strokeStyle: '#ffffff',
      lineWidth: 2
    },
    label: 'ball'
  });
  newBodies.push(ball);

  Composite.add(world, newBodies);

  // Update UI
  document.getElementById('level-name').innerText = `LEVEL ${index + 1}: ${levelData.name}`;
  document.querySelector('.instruction').innerText = levelData.instruction;

  // Initial sound to ensure context is ready (must be triggered by user, here assumes click flow)
  // We can't auto play here without interaction.
}

// Initial Load
loadLevel(0);


// --- Interaction Logic ---

// Drawing Lines
let tempLine = document.createElement('div');
tempLine.className = 'ghost-line';
document.getElementById('app').appendChild(tempLine);

const getMousePos = (e) => ({ x: e.clientX, y: e.clientY });

window.addEventListener('mousedown', (e) => {
  // Init Audio Context on first click
  audioManager.init();

  if (e.target.closest('button')) return; // Don't draw if clicking buttons

  state.isDragging = true;
  state.startPoint = getMousePos(e);
});

window.addEventListener('mousemove', (e) => {
  if (!state.isDragging) return;
  updateGhostLine(state.startPoint, getMousePos(e));
});

window.addEventListener('mouseup', (e) => {
  if (!state.isDragging) return;
  state.isDragging = false;
  tempLine.style.display = 'none';
  createWall(state.startPoint, getMousePos(e));
});

function updateGhostLine(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  tempLine.style.left = start.x + 'px';
  tempLine.style.top = start.y + 'px';
  tempLine.style.width = length + 'px';
  tempLine.style.transform = `rotate(${angle}deg)`;
  tempLine.style.display = 'block';
}

function createWall(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length < 10) return;

  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const angle = Math.atan2(dy, dx);

  const wall = Bodies.rectangle(mx, my, length, 10, {
    isStatic: true,
    angle: angle,
    render: {
      fillStyle: '#ffffff',
      strokeStyle: '#00f3ff',
      lineWidth: 1
    },
    label: 'user-wall'
  });

  Composite.add(world, wall);
  audioManager.playStart(); // Small tick sound
}


// --- Collision & Game Logic ---

Events.on(engine, 'collisionStart', (event) => {
  const pairs = event.pairs;

  pairs.forEach(pair => {
    // Sound on significant collision
    // Estimate impact by speed? Matter.js doesn't give impact force directly in collisionStart easily,
    // but we can check bodies speed.
    const speed = pair.bodyA.speed + pair.bodyB.speed;
    if (speed > 1) {
      audioManager.playBounce(speed);

      // Visual Burst
      // Find collision point (approximate) needs Matter.Collision but we don't have it easily here in pairs loop directly without detailed collision data
      // We'll just use the midpoint or body position for MVP
      const contactX = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
      const contactY = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;

      particleManager.createBurst(contactX, contactY, '#00f3ff', Math.min(speed * 2, 20));
    }

    // Win Check
    const labels = [pair.bodyA.label, pair.bodyB.label];
    if (labels.includes('ball') && labels.includes('goal')) {
      if (!isLevelCompleted) {
        completeLevel();
      }
    }
  });
});

function completeLevel() {
  isLevelCompleted = true;
  audioManager.playWin();
  uiStatus.innerText = "LEVEL CLEAR";
  uiStatus.classList.add('active');
  engine.timing.timeScale = 0.2; // Slow mo

  setTimeout(() => {
    loadLevel(currentLevelIndex + 1);
  }, 2000);
}


// --- Controls ---
btnReset.addEventListener('click', () => {
  // Just reload current level
  loadLevel(currentLevelIndex);
  audioManager.playStart();
});

btnClear.addEventListener('click', () => {
  const bodies = Composite.allBodies(world);
  const userWalls = bodies.filter(b => b.label === 'user-wall');
  Composite.remove(world, userWalls);
});

// Resize
window.addEventListener('resize', () => {
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
});

// --- Particles Integration ---
import { particleManager } from './particles.js';

// 1. Render Loop Hook
Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  particleManager.update();
  particleManager.render(ctx);
});

// 2. Trail Generation Hook
Events.on(engine, 'beforeUpdate', () => {
  if (ball && ball.speed > 1) {
    // Only leave trail if moving fast enough
    // Add some randomness so it's not a solid line
    if (Math.random() > 0.5) {
      particleManager.createTrail(ball.position.x, ball.position.y);
    }
  }
});
