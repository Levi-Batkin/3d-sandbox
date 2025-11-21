import * as THREE from 'three';
import { PLAYER_CONFIG, BlockType, CHUNK_HEIGHT } from '../config.js';

/**
 * Player class - handles player movement, controls, and interactions
 */
class Player {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    this.position = new THREE.Vector3(0, 50, 0);
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Player state
    this.isGrounded = false;
    this.isFlying = false;
    
    // Controls state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      flyDown: false,
      sprint: false
    };

    // Mouse control
    this.pitch = -0.3; // Start looking slightly downward to see terrain
    this.yaw = 0;
    this.mouseSensitivity = 0.002;

    // Block interaction
    this.selectedBlock = BlockType.GRASS;
    this.reach = PLAYER_CONFIG.reach;

    this.setupControls();
    this.updateCameraPosition();
  }

  setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': this.keys.forward = true; break;
        case 'KeyS': this.keys.backward = true; break;
        case 'KeyA': this.keys.left = true; break;
        case 'KeyD': this.keys.right = true; break;
        case 'Space': this.keys.jump = true; break;
        case 'ShiftLeft': this.keys.flyDown = true; break;
        case 'ControlLeft': this.keys.sprint = true; break;
        case 'KeyF': this.toggleFly(); break;
        case 'Digit1': this.selectedBlock = BlockType.GRASS; this.updateInventoryUI(); break;
        case 'Digit2': this.selectedBlock = BlockType.DIRT; this.updateInventoryUI(); break;
        case 'Digit3': this.selectedBlock = BlockType.STONE; this.updateInventoryUI(); break;
        case 'Digit4': this.selectedBlock = BlockType.WOOD; this.updateInventoryUI(); break;
        case 'Digit5': this.selectedBlock = BlockType.LEAVES; this.updateInventoryUI(); break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': this.keys.forward = false; break;
        case 'KeyS': this.keys.backward = false; break;
        case 'KeyA': this.keys.left = false; break;
        case 'KeyD': this.keys.right = false; break;
        case 'Space': this.keys.jump = false; break;
        case 'ShiftLeft': this.keys.flyDown = false; break;
        case 'ControlLeft': this.keys.sprint = false; break;
      }
    });

    // Mouse controls
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body) {
        this.yaw -= e.movementX * this.mouseSensitivity;
        this.pitch -= e.movementY * this.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      }
    });

    // Mouse click for block interaction
    document.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement === document.body) {
        if (e.button === 0) { // Left click - break block
          this.breakBlock();
        } else if (e.button === 2) { // Right click - place block
          this.placeBlock();
        }
      }
    });

    // Prevent context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Request pointer lock when clicking on the game
    document.body.addEventListener('click', () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    });
  }

  toggleFly() {
    this.isFlying = !this.isFlying;
    if (this.isFlying) {
      this.velocity.y = 0;
    }
  }

  updateInventoryUI() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
      const blockTypes = [BlockType.GRASS, BlockType.DIRT, BlockType.STONE, BlockType.WOOD, BlockType.LEAVES];
      if (blockTypes[index] === this.selectedBlock) {
        slot.classList.add('active');
      } else {
        slot.classList.remove('active');
      }
    });
  }

  /**
   * Raycast from camera to find block player is looking at
   */
  raycast() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    const origin = raycaster.ray.origin;
    const direction = raycaster.ray.direction;
    const step = 0.1;
    const maxDistance = this.reach;

    let lastAirBlock = null;

    for (let distance = 0; distance < maxDistance; distance += step) {
      const point = origin.clone().add(direction.clone().multiplyScalar(distance));
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      const z = Math.floor(point.z);

      const block = this.world.getBlock(x, y, z);
      
      if (block !== BlockType.AIR) {
        return {
          hit: true,
          position: new THREE.Vector3(x, y, z),
          placePosition: lastAirBlock
        };
      }
      
      lastAirBlock = new THREE.Vector3(x, y, z);
    }

    return { hit: false };
  }

  breakBlock() {
    const result = this.raycast();
    if (result.hit) {
      this.world.setBlock(result.position.x, result.position.y, result.position.z, BlockType.AIR);
    }
  }

  /**
   * Check if a position is occupied by the player
   * Uses the player's bounding box to prevent placing blocks inside the player
   */
  isPositionOccupiedByPlayer(x, y, z) {
    // Define player bounding box and cache floor/ceil values for performance
    const minX = Math.floor(this.position.x - PLAYER_CONFIG.radius);
    const maxX = Math.ceil(this.position.x + PLAYER_CONFIG.radius);
    const minY = Math.floor(this.position.y);
    const maxY = Math.ceil(this.position.y + PLAYER_CONFIG.height);
    const minZ = Math.floor(this.position.z - PLAYER_CONFIG.radius);
    const maxZ = Math.ceil(this.position.z + PLAYER_CONFIG.radius);
    
    // Check if block position intersects with player bounding box
    return x >= minX && x <= maxX &&
           y >= minY && y <= maxY &&
           z >= minZ && z <= maxZ;
  }

  placeBlock() {
    const result = this.raycast();
    if (result.hit && result.placePosition) {
      const { x, y, z } = result.placePosition;
      // Don't place block where player is standing
      if (!this.isPositionOccupiedByPlayer(x, y, z)) {
        this.world.setBlock(x, y, z, this.selectedBlock);
      }
    }
  }

  /**
   * Check collision in a direction
   * Uses a bounding box approach to check if the player collides with any solid blocks
   */
  checkCollision(offset) {
    const testPos = this.position.clone().add(offset);
    
    // Define player bounding box and cache floor/ceil values for performance
    const minX = Math.floor(testPos.x - PLAYER_CONFIG.radius);
    const maxX = Math.ceil(testPos.x + PLAYER_CONFIG.radius);
    const minY = Math.floor(testPos.y);
    const maxY = Math.ceil(testPos.y + PLAYER_CONFIG.height);
    const minZ = Math.floor(testPos.z - PLAYER_CONFIG.radius);
    const maxZ = Math.ceil(testPos.z + PLAYER_CONFIG.radius);
    
    // Check all blocks that intersect with the player's bounding box
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const block = this.world.getBlock(x, y, z);
          if (block !== BlockType.AIR) {
            // Found a collision with a solid block
            return true;
          }
        }
      }
    }
    
    return false;
  }

  update(deltaTime) {
    // Calculate movement direction
    this.direction.set(0, 0, 0);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

    if (this.keys.forward) this.direction.add(forward);
    if (this.keys.backward) this.direction.sub(forward);
    if (this.keys.right) this.direction.add(right);
    if (this.keys.left) this.direction.sub(right);

    if (this.direction.length() > 0) {
      this.direction.normalize();
    }

    // Apply movement
    const speed = this.isFlying ? PLAYER_CONFIG.flySpeed : PLAYER_CONFIG.speed;
    const moveSpeed = this.keys.sprint ? speed * PLAYER_CONFIG.sprintMultiplier : speed;
    const moveVector = this.direction.clone().multiplyScalar(moveSpeed * deltaTime);

    if (this.isFlying) {
      // Flying controls
      if (this.keys.jump) {
        moveVector.y += PLAYER_CONFIG.flySpeed * deltaTime;
      }
      if (this.keys.flyDown) {
        moveVector.y -= PLAYER_CONFIG.flySpeed * deltaTime;
      }
    } else {
      // Apply gravity
      this.velocity.y -= PLAYER_CONFIG.gravity * deltaTime;

      // Check if grounded
      const groundCheck = new THREE.Vector3(0, -0.1, 0);
      this.isGrounded = this.checkCollision(groundCheck);

      if (this.isGrounded) {
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
        }
        if (this.keys.jump) {
          this.velocity.y = PLAYER_CONFIG.jumpForce;
        }
      }

      moveVector.y += this.velocity.y * deltaTime;
    }

    // Apply collision detection for horizontal movement
    const horizontalMove = new THREE.Vector3(moveVector.x, 0, 0);
    if (!this.checkCollision(horizontalMove)) {
      this.position.add(horizontalMove);
    }

    const depthMove = new THREE.Vector3(0, 0, moveVector.z);
    if (!this.checkCollision(depthMove)) {
      this.position.add(depthMove);
    }

    // Apply vertical movement
    const verticalMove = new THREE.Vector3(0, moveVector.y, 0);
    if (!this.checkCollision(verticalMove)) {
      this.position.add(verticalMove);
    } else if (moveVector.y < 0) {
      this.velocity.y = 0;
    }

    // Keep player above world floor
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    }

    this.updateCameraPosition();
  }

  updateCameraPosition() {
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  serialize() {
    return {
      position: this.position.toArray(),
      pitch: this.pitch,
      yaw: this.yaw,
      selectedBlock: this.selectedBlock,
      isFlying: this.isFlying
    };
  }

  deserialize(data) {
    this.position.fromArray(data.position);
    this.pitch = data.pitch;
    this.yaw = data.yaw;
    this.selectedBlock = data.selectedBlock;
    this.isFlying = data.isFlying;
    this.updateCameraPosition();
    this.updateInventoryUI();
  }
}

export default Player;
