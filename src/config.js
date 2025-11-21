/**
 * Block Types Configuration
 * Defines all available block types and their properties
 */
export const BlockType = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5
};

export const BlockProperties = {
  [BlockType.AIR]: {
    name: 'Air',
    solid: false,
    transparent: true,
    color: 0x000000
  },
  [BlockType.GRASS]: {
    name: 'Grass',
    solid: true,
    transparent: false,
    color: 0x6B8E23,
    topColor: 0x7EC850,
    bottomColor: 0x8B7355
  },
  [BlockType.DIRT]: {
    name: 'Dirt',
    solid: true,
    transparent: false,
    color: 0x8B7355
  },
  [BlockType.STONE]: {
    name: 'Stone',
    solid: true,
    transparent: false,
    color: 0x808080
  },
  [BlockType.WOOD]: {
    name: 'Wood',
    solid: true,
    transparent: false,
    color: 0x8B4513
  },
  [BlockType.LEAVES]: {
    name: 'Leaves',
    solid: true,
    transparent: false,
    color: 0x228B22
  }
};

// Chunk configuration
export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;
export const RENDER_DISTANCE = 4; // Chunks in each direction
export const BLOCK_SIZE = 1;

// World generation parameters
export const TERRAIN_PARAMS = {
  scale: 0.05,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  heightMultiplier: 20,
  baseHeight: 20,
  treeChance: 0.01
};

// Player configuration
export const PLAYER_CONFIG = {
  height: 1.8,
  radius: 0.4,
  speed: 5,
  sprintMultiplier: 1.5,
  jumpForce: 8,
  gravity: 20,
  reach: 5, // Block reach distance
  flySpeed: 10
};
