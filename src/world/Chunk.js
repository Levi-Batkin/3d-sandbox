import * as THREE from 'three';
import { CHUNK_SIZE, CHUNK_HEIGHT, BlockType, BlockProperties } from '../config.js';

/**
 * Chunk class - represents a 16x64x16 section of the world
 */
class Chunk {
  constructor(chunkX, chunkZ, world) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.world = world;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    this.mesh = null;
    this.dirty = true;
  }

  /**
   * Get block index from local coordinates
   */
  getBlockIndex(x, y, z) {
    return x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
  }

  /**
   * Get block at local chunk coordinates
   */
  getBlock(x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return BlockType.AIR;
    }
    return this.blocks[this.getBlockIndex(x, y, z)];
  }

  /**
   * Set block at local chunk coordinates
   */
  setBlock(x, y, z, blockType) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return;
    }
    this.blocks[this.getBlockIndex(x, y, z)] = blockType;
    this.dirty = true;
  }

  /**
   * Check if a face should be rendered (is it exposed to air?)
   */
  shouldRenderFace(x, y, z, dx, dy, dz) {
    const nx = x + dx;
    const ny = y + dy;
    const nz = z + dz;

    // Check in adjacent chunk if needed
    if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
      const worldX = this.chunkX * CHUNK_SIZE + nx;
      const worldZ = this.chunkZ * CHUNK_SIZE + nz;
      const block = this.world.getBlock(worldX, ny, worldZ);
      return block === BlockType.AIR;
    }

    const neighbor = this.getBlock(nx, ny, nz);
    return neighbor === BlockType.AIR;
  }

  /**
   * Generate mesh for this chunk using greedy meshing
   */
  generateMesh() {
    if (!this.dirty) return;

    // Remove old mesh
    if (this.mesh) {
      this.world.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];
    let vertexCount = 0;

    // Iterate through all blocks in the chunk
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const blockType = this.getBlock(x, y, z);
          if (blockType === BlockType.AIR) continue;

          const props = BlockProperties[blockType];
          const worldX = this.chunkX * CHUNK_SIZE + x;
          const worldZ = this.chunkZ * CHUNK_SIZE + z;

          // Check each face
          const faces = [
            { dir: [0, 1, 0], vertices: [[0,1,0], [1,1,0], [1,1,1], [0,1,1]], color: props.topColor || props.color }, // Top
            { dir: [0, -1, 0], vertices: [[0,0,1], [1,0,1], [1,0,0], [0,0,0]], color: props.bottomColor || props.color }, // Bottom
            { dir: [0, 0, 1], vertices: [[0,0,1], [0,1,1], [1,1,1], [1,0,1]], color: props.color }, // Front
            { dir: [0, 0, -1], vertices: [[1,0,0], [1,1,0], [0,1,0], [0,0,0]], color: props.color }, // Back
            { dir: [1, 0, 0], vertices: [[1,0,1], [1,1,1], [1,1,0], [1,0,0]], color: props.color }, // Right
            { dir: [-1, 0, 0], vertices: [[0,0,0], [0,1,0], [0,1,1], [0,0,1]], color: props.color } // Left
          ];

          for (const face of faces) {
            if (this.shouldRenderFace(x, y, z, ...face.dir)) {
              const color = new THREE.Color(face.color);
              
              // Add vertices
              for (const v of face.vertices) {
                vertices.push(
                  worldX + v[0],
                  y + v[1],
                  worldZ + v[2]
                );
                colors.push(color.r, color.g, color.b);
              }

              // Add indices for two triangles
              indices.push(
                vertexCount, vertexCount + 1, vertexCount + 2,
                vertexCount, vertexCount + 2, vertexCount + 3
              );
              vertexCount += 4;
            }
          }
        }
      }
    }

    if (vertices.length === 0) {
      this.dirty = false;
      return;
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.world.scene.add(this.mesh);

    this.dirty = false;
  }

  /**
   * Convert chunk data to saveable format
   */
  serialize() {
    return {
      chunkX: this.chunkX,
      chunkZ: this.chunkZ,
      blocks: Array.from(this.blocks)
    };
  }

  /**
   * Load chunk data from saved format
   */
  deserialize(data) {
    this.blocks = new Uint8Array(data.blocks);
    this.dirty = true;
  }

  dispose() {
    if (this.mesh) {
      this.world.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}

export default Chunk;
