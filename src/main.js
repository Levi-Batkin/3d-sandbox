import Game from './Game.js';

/**
 * Main entry point for the 3D Voxel Sandbox game
 */

// Create and initialize the game when the page loads
window.addEventListener('DOMContentLoaded', async () => {
  const game = new Game();
  
  try {
    await game.init();
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Error initializing game:', error);
    // Display error to user
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: monospace;
        text-align: center;
      ">
        <h2>Error Initializing Game</h2>
        <p>${error.message}</p>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
  }
});
