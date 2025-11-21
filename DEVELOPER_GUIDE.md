# Developer Guide

## Project Overview

This is a Minecraft-like 3D voxel sandbox game built with Three.js, featuring procedural terrain generation, chunk-based world management, and persistent save/load functionality.

## Quick Start

### Development
```bash
npm install
npm run dev
```
Opens at http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```

## Architecture

### Modular Design
The project uses a clean separation of concerns:

```
src/
├── Game.js              # Main orchestrator
├── config.js            # All game constants
├── main.js              # Entry point
├── player/
│   └── Player.js        # Controls, interactions, physics
├── world/
│   ├── World.js         # Chunk management
│   └── Chunk.js         # Individual chunk logic
├── utils/
│   └── NoiseGenerator.js # Perlin noise for terrain
├── storage/
│   └── StorageManager.js # IndexedDB persistence
└── ui/
    └── UIManager.js     # HUD and menu management
```

### Key Systems

#### 1. World System (src/world/)
- **Chunk.js**: Represents a 16x64x16 section of world
  - `getBlock(x, y, z)`: Get block at local coordinates
  - `setBlock(x, y, z, type)`: Set block type
  - `generateMesh()`: Creates optimized Three.js mesh
  - Uses greedy meshing to reduce polygon count
  
- **World.js**: Manages all chunks
  - `getOrCreateChunk(x, z)`: Load/create chunks on demand
  - `updateChunks(playerX, playerZ)`: Dynamic chunk loading
  - `generateChunkTerrain()`: Procedural terrain generation
  - `generateTree()`: Places procedural trees

#### 2. Player System (src/player/)
- **Player.js**: First-person controller
  - Movement: WASD, jumping, flying
  - Collision detection with multi-point checks
  - Raycasting for block interaction
  - `breakBlock()` / `placeBlock()`: Block manipulation

#### 3. Storage System (src/storage/)
- **StorageManager.js**: IndexedDB wrapper
  - `saveWorld()`: Persist world and player state
  - `loadWorld()`: Restore saved game
  - `hasSavedWorld()`: Check for existing saves

#### 4. UI System (src/ui/)
- **UIManager.js**: All UI interactions
  - FPS counter, position display
  - Menu management
  - HUD updates

## Configuration

All game parameters are in `src/config.js`:

```javascript
// Chunk settings
CHUNK_SIZE = 16          // Width/depth of chunks
CHUNK_HEIGHT = 64        // Height of chunks
RENDER_DISTANCE = 4      // Chunks loaded around player

// Terrain generation
TERRAIN_PARAMS = {
  scale: 0.05,           // Noise frequency
  octaves: 4,            // Detail levels
  heightMultiplier: 20,  // Terrain variation
  treeChance: 0.01      // Tree density
}

// Player settings
PLAYER_CONFIG = {
  speed: 5,              // Movement speed
  jumpForce: 8,          // Jump strength
  reach: 5,              // Block interaction distance
  gravity: 20            // Gravity strength
}
```

## Adding New Features

### Adding a New Block Type

1. Add to `BlockType` enum in config.js:
```javascript
export const BlockType = {
  // ... existing
  NEWBLOCK: 6
};
```

2. Add properties:
```javascript
export const BlockProperties = {
  [BlockType.NEWBLOCK]: {
    name: 'New Block',
    solid: true,
    transparent: false,
    color: 0xFFFFFF  // RGB hex color
  }
};
```

3. Add to inventory UI in index.html:
```html
<div class="inventory-slot" data-block="newblock">
  🆕<br>New
</div>
```

4. Add key binding in Player.js setupControls():
```javascript
case 'Digit6': 
  this.selectedBlock = BlockType.NEWBLOCK; 
  this.updateInventoryUI(); 
  break;
```

### Modifying Terrain Generation

Edit `World.js` > `generateChunkTerrain()`:
- Adjust noise parameters for different landscapes
- Change block placement logic for custom biomes
- Add custom structure generation like `generateTree()`

### Adding New Structures

Create a new method in `World.js`:
```javascript
generateStructure(x, y, z) {
  // Place blocks using this.setBlock(x, y, z, type)
}
```

Call from `generateChunkTerrain()` with appropriate conditions.

## Performance Considerations

### Chunk System
- Only renders visible faces (face culling)
- Greedy meshing combines adjacent faces
- Chunks unload when outside render distance
- Dirty flag prevents unnecessary mesh regeneration

### Optimization Tips
- Reduce `RENDER_DISTANCE` for lower-end systems
- Adjust `CHUNK_HEIGHT` to reduce world size
- Disable shadows in Game.js for better performance:
  ```javascript
  this.renderer.shadowMap.enabled = false;
  ```

## Common Development Tasks

### Debugging World Generation
```javascript
// In World.js generateChunkTerrain(), add:
console.log(`Chunk (${chunk.chunkX}, ${chunk.chunkZ}): generated`);
```

### Testing Block Interactions
```javascript
// In Player.js breakBlock()/placeBlock(), add:
console.log(`Block at (${x}, ${y}, ${z}): ${blockType}`);
```

### Monitoring Performance
- FPS displayed in HUD automatically
- Check chunk count in HUD
- Use browser DevTools Performance tab

## Build System

### Vite Configuration
- Entry point: `index.html` → `src/main.js`
- Three.js bundled automatically
- Source maps enabled for debugging
- Hot module replacement in dev mode

### Production Build
```bash
npm run build
```
Creates optimized bundle in `dist/`:
- Minified JavaScript
- Tree-shaken dependencies
- Gzip-compressed assets

## Testing

See `TESTING.md` for comprehensive testing checklist.

### Quick Smoke Test
1. Start dev server
2. Click "New Game"
3. Verify terrain generates
4. Test WASD movement
5. Break/place blocks (left/right click)
6. Save game (ESC → Save)
7. Reload page
8. Click "Continue"
9. Verify position restored

## Troubleshooting

### Build Fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear dist: `rm -rf dist`
- Check Node version: `node --version` (needs 14+)

### Game Won't Load
- Check browser console for errors
- Verify WebGL support: https://get.webgl.org/
- Clear IndexedDB in browser DevTools

### Poor Performance
- Reduce RENDER_DISTANCE in config.js
- Disable shadows in Game.js
- Close other browser tabs
- Try different browser (Chrome recommended)

### Chunks Not Loading
- Check console for errors in World.js
- Verify updateChunks() is being called
- Increase RENDER_DISTANCE temporarily

## Dependencies

- **three** (^0.160.0): WebGL rendering library
- **vite** (^5.0.0): Build tool and dev server

No runtime dependencies other than Three.js, keeping bundle size small.

## Browser Compatibility

Requires:
- WebGL 1.0+
- IndexedDB API
- Pointer Lock API
- ES6+ JavaScript support

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancement Ideas

- Multiplayer via WebSockets
- More biome types (desert, snow, ocean)
- Crafting system
- Day/night cycle
- Dynamic lighting
- Mob system
- Advanced fluid simulation
- Texture atlases for more detailed blocks

## License

MIT - Free to use and modify