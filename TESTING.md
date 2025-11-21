# Testing Guide

## How to Test the 3D Voxel Sandbox Game

### Prerequisites
- A modern web browser with WebGL support (Chrome, Firefox, Edge, Safari)
- Node.js installed

### Running the Game

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to the URL shown in the terminal (usually `http://localhost:3000`)
   - You should see the game menu

### Testing Checklist

#### Menu System
- [ ] Game menu appears on load
- [ ] "New Game" button is enabled
- [ ] "Continue" button is disabled if no saved game exists
- [ ] "Save Game" button is visible

#### Starting a New Game
- [ ] Click "New Game"
- [ ] Loading indicator appears briefly
- [ ] Game world generates with terrain
- [ ] Player spawns at a valid position
- [ ] HUD displays FPS, position, and chunk count

#### Player Controls
- [ ] WASD keys move the player
- [ ] Mouse look rotates the camera
- [ ] Space bar makes player jump
- [ ] F key toggles flying mode
- [ ] Shift key moves player down in flying mode
- [ ] Player collides with blocks (cannot walk through them)

#### Block Interaction
- [ ] Crosshair appears in center of screen
- [ ] Left clicking breaks blocks
- [ ] Right clicking places blocks
- [ ] Blocks can be placed in valid positions
- [ ] "Looking at" display shows block type when aiming at a block

#### Inventory System
- [ ] 5 inventory slots visible at bottom
- [ ] Current slot is highlighted
- [ ] Number keys 1-5 select different block types
- [ ] Selected block type is used when placing

#### World Generation
- [ ] Terrain has varied heights
- [ ] Grass blocks on surface
- [ ] Dirt blocks below grass
- [ ] Stone blocks at lower depths
- [ ] Trees occasionally generate
- [ ] New chunks load as player moves

#### Save/Load System
- [ ] ESC key opens menu
- [ ] "Save Game" button saves the game
- [ ] After saving, "Continue" button becomes enabled
- [ ] Closing and reopening the game allows continuing
- [ ] Loaded game preserves player position and world changes

#### Performance
- [ ] FPS counter shows reasonable framerate (30+ FPS)
- [ ] Chunk count updates as player moves
- [ ] No significant lag when breaking/placing blocks
- [ ] Smooth camera movement

#### UI Elements
- [ ] All text is readable
- [ ] Controls info visible in bottom right
- [ ] HUD updates in real-time
- [ ] Menu can be toggled with ESC

### Common Issues and Solutions

**Issue: Black screen on load**
- Solution: Check browser console for errors. Ensure WebGL is supported.

**Issue: Poor performance**
- Solution: Try reducing render distance in config.js (RENDER_DISTANCE)

**Issue: Cannot place/break blocks**
- Solution: Ensure pointer lock is active (click on game screen)

**Issue: Save/Load not working**
- Solution: Check if IndexedDB is enabled in browser settings

### Browser Console Tests

Open the browser console (F12) and verify:
- No JavaScript errors
- Console shows "Game initialized successfully"
- Three.js library loads correctly

### Build Test

To test the production build:
```bash
npm run build
npm run preview
```

Navigate to the preview URL and test all features again.

### Automated Checks

The following should pass:
```bash
# Build without errors
npm run build

# No TypeScript/linting errors (if configured)
npm run lint
```

### WebGL Feature Detection

The game requires:
- WebGL 1.0 or higher
- IndexedDB support
- Pointer Lock API
- requestAnimationFrame API

Check compatibility at: https://get.webgl.org/

### Expected Behavior Summary

1. **Startup**: Menu loads → Click New Game → World generates → Player spawns
2. **Exploration**: Move around → Chunks load dynamically → Terrain is varied
3. **Building**: Select block → Place blocks → Create structures
4. **Mining**: Break blocks → World updates → Adjacent chunks update
5. **Saving**: ESC → Save Game → State persists to IndexedDB
6. **Loading**: Restart browser → Continue → Return to saved position

All features should work smoothly with no errors in the console.