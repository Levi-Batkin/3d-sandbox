/**
 * Storage Manager - handles saving and loading world data using IndexedDB
 */
class StorageManager {
  constructor() {
    this.dbName = 'VoxelSandboxDB';
    this.version = 1;
    this.db = null;
  }

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('worlds')) {
          db.createObjectStore('worlds', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Save world data
   */
  async saveWorld(worldData, playerData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['worlds'], 'readwrite');
      const store = transaction.objectStore('worlds');

      const saveData = {
        id: 'main',
        timestamp: Date.now(),
        world: worldData,
        player: playerData
      };

      const request = store.put(saveData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load world data
   */
  async loadWorld() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['worlds'], 'readonly');
      const store = transaction.objectStore('worlds');
      const request = store.get('main');

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a saved world exists
   */
  async hasSavedWorld() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['worlds'], 'readonly');
      const store = transaction.objectStore('worlds');
      const request = store.get('main');

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete saved world
   */
  async deleteWorld() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['worlds'], 'readwrite');
      const store = transaction.objectStore('worlds');
      const request = store.delete('main');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save settings
   */
  async saveSetting(key, value) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load setting
   */
  async loadSetting(key, defaultValue = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export default StorageManager;
