/**
 * UI Manager - handles all UI updates and interactions
 */
class UIManager {
  constructor() {
    this.elements = {
      menu: document.getElementById('menu'),
      fps: document.getElementById('fps'),
      position: document.getElementById('position'),
      chunkInfo: document.getElementById('chunk-info'),
      blockInfo: document.getElementById('block-info'),
      loading: document.getElementById('loading'),
      newGame: document.getElementById('new-game'),
      continueGame: document.getElementById('continue-game'),
      saveGame: document.getElementById('save-game')
    };

    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fps = 0;
  }

  /**
   * Show/hide menu
   */
  showMenu(show = true) {
    if (show) {
      this.elements.menu.classList.remove('hidden');
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else {
      this.elements.menu.classList.add('hidden');
    }
  }

  /**
   * Show/hide loading indicator
   */
  showLoading(show = true) {
    if (show) {
      this.elements.loading.classList.remove('hidden');
    } else {
      this.elements.loading.classList.add('hidden');
    }
  }

  /**
   * Enable/disable continue button
   */
  enableContinueButton(enabled) {
    this.elements.continueGame.disabled = !enabled;
    this.elements.continueGame.style.opacity = enabled ? '1' : '0.5';
  }

  /**
   * Update FPS counter
   */
  updateFPS() {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.elements.fps.textContent = `FPS: ${this.fps}`;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }
  }

  /**
   * Update position display
   */
  updatePosition(x, y, z) {
    this.elements.position.textContent = 
      `Position: (${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)})`;
  }

  /**
   * Update chunk info
   */
  updateChunkInfo(chunkCount) {
    this.elements.chunkInfo.textContent = `Chunks: ${chunkCount}`;
  }

  /**
   * Update block looking at info
   */
  updateBlockInfo(blockName) {
    this.elements.blockInfo.textContent = `Looking at: ${blockName || 'None'}`;
  }

  /**
   * Set up menu button handlers
   */
  setupMenuHandlers(callbacks) {
    this.elements.newGame.addEventListener('click', () => {
      this.showMenu(false);
      callbacks.onNewGame();
    });

    this.elements.continueGame.addEventListener('click', () => {
      this.showMenu(false);
      callbacks.onContinue();
    });

    this.elements.saveGame.addEventListener('click', () => {
      callbacks.onSave();
    });

    // ESC key to show menu
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        const isMenuVisible = !this.elements.menu.classList.contains('hidden');
        this.showMenu(!isMenuVisible);
      }
    });
  }
}

export default UIManager;
