import * as THREE from 'three';
import World from './world/World.js';
import Player from './player/Player.js';
import StorageManager from './storage/StorageManager.js';
import UIManager from './ui/UIManager.js';
import { BlockProperties, CHUNK_HEIGHT } from './config.js';

/**
 * Main Game class - orchestrates all game systems
 */
class Game {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.player = null;
    this.storage = new StorageManager();
    this.ui = new UIManager();
    
    this.clock = new THREE.Clock();
    this.isRunning = false;
  }

  /**
   * Initialize the game
   */
  async init() {
    // Initialize storage
    await this.storage.init();

    // Set up Three.js scene
    this.setupScene();

    // Set up UI callbacks
    this.ui.setupMenuHandlers({
      onNewGame: () => this.startNewGame(),
      onContinue: () => this.continueGame(),
      onSave: () => this.saveGame()
    });

    // Check if there's a saved world
    const hasSaved = await this.storage.hasSavedWorld();
    this.ui.enableContinueButton(hasSaved);

    // Show menu
    this.ui.showMenu(true);

    // Start render loop (even when in menu)
    this.animate();
  }

  /**
   * Set up Three.js scene, camera, renderer, and lighting
   */
  setupScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.up.set(0, 1, 0); // Ensure Y-axis is up

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * Start a new game
   */
  async startNewGame() {
    this.ui.showLoading(true);

    // Clean up existing world
    if (this.world) {
      this.world.dispose();
    }

    // Create new world
    this.world = new World(this.scene, Date.now());
    
    // Create player
    this.player = new Player(this.camera, this.world);
    
    // Find a good spawn position (top of terrain)
    let spawnY = 50;
    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      const block = this.world.getBlock(0, y, 0);
      if (block !== 0) { // Found solid block
        spawnY = y + 2; // Spawn 2 blocks above to ensure clearance
        break;
      }
    }
    this.player.position.set(0, spawnY, 0);
    this.player.updateCameraPosition();

    this.isRunning = true;
    this.ui.showLoading(false);
  }

  /**
   * Continue from saved game
   */
  async continueGame() {
    this.ui.showLoading(true);

    try {
      const savedData = await this.storage.loadWorld();
      
      if (savedData) {
        // Clean up existing world
        if (this.world) {
          this.world.dispose();
        }

        // Load world
        this.world = new World(this.scene, savedData.world.seed);
        this.world.deserialize(savedData.world);

        // Load player
        this.player = new Player(this.camera, this.world);
        this.player.deserialize(savedData.player);

        this.isRunning = true;
        this.ui.showLoading(false);
      } else {
        console.error('No saved game found');
        this.startNewGame();
      }
    } catch (error) {
      console.error('Error loading game:', error);
      this.startNewGame();
    }
  }

  /**
   * Save current game state
   */
  async saveGame() {
    if (!this.world || !this.player) {
      console.warn('No active game to save');
      return;
    }

    this.ui.showLoading(true);

    try {
      const worldData = this.world.serialize();
      const playerData = this.player.serialize();
      
      await this.storage.saveWorld(worldData, playerData);
      
      console.log('Game saved successfully');
      this.ui.enableContinueButton(true);
    } catch (error) {
      console.error('Error saving game:', error);
    }

    this.ui.showLoading(false);
  }

  /**
   * Update game state
   */
  update(deltaTime) {
    if (!this.isRunning || !this.world || !this.player) return;

    // Update player
    this.player.update(deltaTime);

    // Update world chunks based on player position
    this.world.updateChunks(this.player.position.x, this.player.position.z);

    // Update UI
    this.ui.updatePosition(
      this.player.position.x,
      this.player.position.y,
      this.player.position.z
    );
    this.ui.updateChunkInfo(this.world.chunks.size);

    // Update block looking at info
    const raycastResult = this.player.raycast();
    if (raycastResult.hit) {
      const block = this.world.getBlock(
        raycastResult.position.x,
        raycastResult.position.y,
        raycastResult.position.z
      );
      const blockName = BlockProperties[block]?.name || 'Unknown';
      this.ui.updateBlockInfo(blockName);
    } else {
      this.ui.updateBlockInfo(null);
    }
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
    this.ui.updateFPS();
  }

  /**
   * Main game loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap delta time
    
    this.update(deltaTime);
    this.render();
  }
}

export default Game;
