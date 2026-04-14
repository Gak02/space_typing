import './styles/main.css';
import './styles/game.css';
import './styles/screens.css';
import { GameLoop } from './core/game-loop';
import { Renderer } from './ui/renderer';
import { InputHandler } from './ui/input-handler';

const app = document.getElementById('app');
if (!app) throw new Error('App element not found');

const game = new GameLoop();
const renderer = new Renderer(app, game);
const inputHandler = new InputHandler();

let lastPhase = '';

// Input handling
inputHandler.start((char) => {
  const state = game.getState();
  if (state.phase.type !== 'playing') return;

  const result = game.handleInput(char);
  if (result.status === 'wrong') {
    renderer.showWrongFlash();
  }
});

// Game loop using requestAnimationFrame
let lastTime = 0;

function tick(timestamp: number): void {
  if (lastTime === 0) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  const state = game.getState();

  // Only tick game logic during playing phase
  if (state.phase.type === 'playing') {
    game.update(delta);
  }

  // Re-render when phase changes or during gameplay
  const currentPhase = state.phase.type;
  if (currentPhase !== lastPhase || currentPhase === 'playing') {
    renderer.render(game.getState());
    lastPhase = currentPhase;
  }

  requestAnimationFrame(tick);
}

// Initial render
renderer.render(game.getState());

// Start the loop
requestAnimationFrame(tick);
