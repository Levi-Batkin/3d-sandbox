# 3D Voxel Sandbox

A Minecraft-like 3D voxel sandbox game built with Three.js and running entirely in the browser.

![Game Screenshot](screenshot.png)

## Features

### ✨ Core Features
- **Voxel-based 3D Environment**: Explore a world made entirely of blocks
- **Procedural Terrain Generation**: Infinite, randomly generated terrain with biomes
- **Chunk System**: Efficient chunk loading and unloading based on player position
- **First-Person Controls**: Smooth WASD movement with mouse look
- **Physics System**: Realistic gravity, jumping, and collision detection
- **Block Interaction**: Break and place blocks with mouse clicks
- **Inventory System**: Select from 5 different block types
- **Save/Load System**: Save your world progress to IndexedDB
- **Flying Mode**: Toggle flying for creative building

### 🎮 Block Types
- 🟩 Grass
- 🟫 Dirt
- ⬜ Stone
- 🟧 Wood
- 🟢 Leaves

## Controls

| Action | Key/Button |
|--------|-----------|
| Move Forward | W |
| Move Backward | S |
| Move Left | A |
| Move Right | D |
| Jump | Space |
| Fly Down (Flying Mode) | Shift |
| Sprint | Ctrl |
| Toggle Flying | F |
| Break Block | Left Click |
| Place Block | Right Click |
| Select Block 1-5 | Number Keys 1-5 |
| Open Menu | ESC |

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Levi-Batkin/3d-sandbox.git
cd 3d-sandbox
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To build the game for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Project Structure

```
3d-sandbox/
├── src/
│   ├── config.js           # Game configuration and constants
│   ├── main.js             # Entry point
│   ├── Game.js             # Main game orchestrator
│   ├── player/
│   │   └── Player.js       # Player controls and interactions
│   ├── world/
│   │   ├── World.js        # World management and chunk loading
│   │   └── Chunk.js        # Individual chunk generation and rendering
│   ├── utils/
│   │   └── NoiseGenerator.js  # Perlin noise for terrain
│   ├── storage/
│   │   └── StorageManager.js  # IndexedDB save/load system
│   └── ui/
│       └── UIManager.js    # UI updates and interactions
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite build configuration
```

## Technology Stack

- **Rendering**: Three.js (WebGL)
- **Build Tool**: Vite
- **Data Storage**: IndexedDB
- **Physics**: Custom lightweight collision system

## Configuration

You can modify game parameters in `src/config.js`:

- **Chunk Settings**: Size, height, render distance
- **Terrain Generation**: Noise parameters, height multipliers, tree density
- **Player Settings**: Speed, jump force, reach distance
- **Block Types**: Colors and properties

## Architecture

### Modular Design
The game is built with a modular architecture separating concerns:

- **World System**: Manages chunk generation, loading, and unloading
- **Rendering System**: Handles all Three.js rendering with optimized mesh generation
- **Player System**: Controls player movement, camera, and block interactions
- **Storage System**: Provides save/load functionality using IndexedDB
- **UI System**: Manages all UI updates and menu interactions

### Chunk System
- World is divided into 16x64x16 chunks
- Chunks are dynamically loaded/unloaded based on player position
- Greedy meshing algorithm reduces polygon count
- Adjacent chunks marked dirty when blocks change at borders

### Terrain Generation
- Uses Perlin-like noise for natural-looking terrain
- Multiple octaves create varied landscape features
- Configurable parameters for different biome types
- Procedural tree generation

## Performance Optimizations

- **Greedy Meshing**: Reduces polygon count by merging adjacent faces
- **Frustum Culling**: Only renders visible chunks
- **Chunk Unloading**: Removes distant chunks from memory
- **Indexed Geometry**: Efficient vertex reuse
- **Face Culling**: Only renders exposed block faces

## Future Enhancements (Optional)

- **Multiplayer Support**: WebSocket-based multiplayer (Socket.io)
- **More Block Types**: Additional blocks and materials
- **Crafting System**: Combine blocks to create new items
- **Day/Night Cycle**: Dynamic lighting based on time
- **Water and Fluids**: Fluid simulation system
- **Mobs and NPCs**: Add creatures and characters
- **Advanced Biomes**: More varied terrain types

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

Requires WebGL support and IndexedDB API.

## License

MIT License - feel free to use this project for learning or building your own voxel games!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Fast build tool

Inspired by Minecraft and voxel game development tutorials.