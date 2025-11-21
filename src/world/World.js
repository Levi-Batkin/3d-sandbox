import Chunk from './Chunk.js';
import NoiseGenerator from '../utils/NoiseGenerator.js';
import { CHUNK_SIZE, CHUNK_HEIGHT, RENDER_DISTANCE, BlockType, TERRAIN_PARAMS } from '../config.js';

/**
 * World class - manages all chunks and world generation
 */
class World {
  constructor(scene, seed = Date.now()) {
    this.scene = scene;
    this.seed = seed;
    this.chunks = new Map();
    this.noise = new NoiseGenerator(seed);
  }

  /**
   * Get chunk key from chunk coordinates
   */
  getChunkKey(chunkX, chunkZ) {
    return `${chunkX},${chunkZ}`;
  }

  /**
   * Get chunk at chunk coordinates
   */
  getChunk(chunkX, chunkZ) {
    return this.chunks.get(this.getChunkKey(chunkX, chunkZ));
  }

  /**
   * Get or create chunk at chunk coordinates
   */
  getOrCreateChunk(chunkX, chunkZ) {
    let chunk = this.getChunk(chunkX, chunkZ);
    if (!chunk) {
      chunk = new Chunk(chunkX, chunkZ, this);
      this.chunks.set(this.getChunkKey(chunkX, chunkZ), chunk);
      this.generateChunkTerrain(chunk);
    }
    return chunk;
  }

  /**
   * Get block at world coordinates
   */
  getBlock(x, y, z) {
    if (y < 0 || y >= CHUNK_HEIGHT) {
      return BlockType.AIR;
    }

    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const chunk = this.getChunk(chunkX, chunkZ);

    if (!chunk) {
      return BlockType.AIR;
    }

    const localX = x - chunkX * CHUNK_SIZE;
    const localZ = z - chunkZ * CHUNK_SIZE;
    return chunk.getBlock(localX, y, localZ);
  }

  /**
   * Set block at world coordinates
   */
  setBlock(x, y, z, blockType) {
    if (y < 0 || y >= CHUNK_HEIGHT) {
      return false;
    }

    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const chunk = this.getOrCreateChunk(chunkX, chunkZ);

    const localX = x - chunkX * CHUNK_SIZE;
    const localZ = z - chunkZ * CHUNK_SIZE;
    chunk.setBlock(localX, y, localZ, blockType);

    // Mark adjacent chunks as dirty if block is on chunk border
    if (localX === 0) {
      const adjacentChunk = this.getChunk(chunkX - 1, chunkZ);
      if (adjacentChunk) adjacentChunk.dirty = true;
    }
    if (localX === CHUNK_SIZE - 1) {
      const adjacentChunk = this.getChunk(chunkX + 1, chunkZ);
      if (adjacentChunk) adjacentChunk.dirty = true;
    }
    if (localZ === 0) {
      const adjacentChunk = this.getChunk(chunkX, chunkZ - 1);
      if (adjacentChunk) adjacentChunk.dirty = true;
    }
    if (localZ === CHUNK_SIZE - 1) {
      const adjacentChunk = this.getChunk(chunkX, chunkZ + 1);
      if (adjacentChunk) adjacentChunk.dirty = true;
    }

    return true;
  }

  /**
   * Generate terrain for a chunk
   */
  generateChunkTerrain(chunk) {
    const { scale, octaves, persistence, lacunarity, heightMultiplier, baseHeight, treeChance } = TERRAIN_PARAMS;

    // Generate base terrain
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = chunk.chunkX * CHUNK_SIZE + x;
        const worldZ = chunk.chunkZ * CHUNK_SIZE + z;

        // Generate height using noise
        const noiseValue = this.noise.octaveNoise2D(
          worldX * scale,
          worldZ * scale,
          octaves,
          persistence,
          lacunarity
        );

        const height = Math.max(0, Math.floor(baseHeight + noiseValue * heightMultiplier));

        // Place blocks
        for (let y = 0; y < height && y < CHUNK_HEIGHT; y++) {
          let blockType;
          if (y === height - 1) {
            blockType = BlockType.GRASS;
          } else if (y >= height - 4) {
            blockType = BlockType.DIRT;
          } else {
            blockType = BlockType.STONE;
          }
          chunk.setBlock(x, y, z, blockType);
        }

        // Randomly place trees
        if (height < CHUNK_HEIGHT - 6 && Math.random() < treeChance) {
          this.generateTree(worldX, height, worldZ);
        }
      }
    }
  }

  /**
   * Generate a simple tree at world coordinates
   */
  generateTree(x, y, z) {
    const trunkHeight = 4 + Math.floor(Math.random() * 2);
    
    // Trunk
    for (let i = 0; i < trunkHeight; i++) {
      this.setBlock(x, y + i, z, BlockType.WOOD);
    }

    // Leaves (simple sphere)
    const leafStart = y + trunkHeight - 1;
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (dx === 0 && dz === 0 && dy < 3) continue; // Skip trunk area
          const dist = Math.sqrt(dx * dx + dz * dz + dy * dy * 0.5);
          if (dist < 2.5) {
            this.setBlock(x + dx, leafStart + dy, z + dz, BlockType.LEAVES);
          }
        }
      }
    }
  }

  /**
   * Update chunks based on player position
   */
  updateChunks(playerX, playerZ) {
    const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

    // Load chunks around player
    const chunksToKeep = new Set();
    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        const chunkX = playerChunkX + x;
        const chunkZ = playerChunkZ + z;
        const key = this.getChunkKey(chunkX, chunkZ);
        chunksToKeep.add(key);

        const chunk = this.getOrCreateChunk(chunkX, chunkZ);
        if (chunk.dirty) {
          chunk.generateMesh();
        }
      }
    }

    // Unload distant chunks
    for (const [key, chunk] of this.chunks.entries()) {
      if (!chunksToKeep.has(key)) {
        chunk.dispose();
        this.chunks.delete(key);
      }
    }
  }

  /**
   * Serialize world data for saving
   */
  serialize() {
    const chunksData = [];
    for (const chunk of this.chunks.values()) {
      chunksData.push(chunk.serialize());
    }
    return {
      seed: this.seed,
      chunks: chunksData
    };
  }

  /**
   * Load world data
   */
  deserialize(data) {
    this.seed = data.seed;
    this.noise = new NoiseGenerator(this.seed);
    
    // Clear existing chunks
    for (const chunk of this.chunks.values()) {
      chunk.dispose();
    }
    this.chunks.clear();

    // Load saved chunks
    for (const chunkData of data.chunks) {
      const chunk = new Chunk(chunkData.chunkX, chunkData.chunkZ, this);
      chunk.deserialize(chunkData);
      this.chunks.set(this.getChunkKey(chunk.chunkX, chunk.chunkZ), chunk);
    }
  }

  dispose() {
    for (const chunk of this.chunks.values()) {
      chunk.dispose();
    }
    this.chunks.clear();
  }
}

export default World;
