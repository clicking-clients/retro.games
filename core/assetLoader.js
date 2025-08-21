/**
 * Asset Loader System
 * Handles dynamic loading of game modules, CSS, and other resources
 */

export class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.failedAssets = new Set();
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }
  
  /**
   * Load game assets based on configuration
   */
  async loadGameAssets(gameConfig) {
    const assets = [];
    
    // Load required modules
    if (gameConfig.modules) {
      for (const moduleName of gameConfig.modules) {
        assets.push(this.loadModule(moduleName));
      }
    }
    
    // Load game-specific CSS if it exists
    const cssPath = `../games/${gameConfig.id}/styles.css`;
    assets.push(this.loadCSS(cssPath));
    
    // Load game-specific JavaScript
    const jsPath = `../games/${gameConfig.id}/game.js`;
    assets.push(this.loadScript(jsPath));
    
    try {
      const results = await Promise.allSettled(assets);
      this.handleLoadResults(results, gameConfig);
      return results;
    } catch (error) {
      console.error('Failed to load game assets:', error);
      throw error;
    }
  }
  
  /**
   * Load a specific module
   */
  async loadModule(moduleName) {
    const moduleMap = {
      audio: '../core/audio.js',
      fireworks: '../core/fireworks.js',
      rocket: '../core/rocket.js'
    };
    
    if (moduleMap[moduleName]) {
      return this.loadScript(moduleMap[moduleName]);
    } else {
      console.warn(`Unknown module: ${moduleName}`);
      return null;
    }
  }
  
  /**
   * Load a JavaScript file
   */
  async loadScript(src, retryCount = 0) {
    // Check cache first
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }
    
    // Check if failed
    if (this.failedAssets.has(src)) {
      throw new Error(`Asset failed to load: ${src}`);
    }
    
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      
      script.onload = () => {
        this.cache.set(src, script);
        this.loadingPromises.delete(src);
        resolve(script);
      };
      
      script.onerror = (error) => {
        this.loadingPromises.delete(src);
        
        if (retryCount < this.maxRetries) {
          console.warn(`Failed to load script, retrying (${retryCount + 1}/${this.maxRetries}): ${src}`);
          setTimeout(() => {
            this.loadScript(src, retryCount + 1).then(resolve).catch(reject);
          }, this.retryDelay * (retryCount + 1));
        } else {
          this.failedAssets.add(src);
          reject(new Error(`Failed to load script after ${this.maxRetries} retries: ${src}`));
        }
      };
      
      document.head.appendChild(script);
    });
    
    this.loadingPromises.set(src, promise);
    return promise;
  }
  
  /**
   * Load a CSS file
   */
  async loadCSS(href, retryCount = 0) {
    // Check cache first
    if (this.cache.has(href)) {
      return this.cache.get(href);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href);
    }
    
    // Check if failed
    if (this.failedAssets.has(href)) {
      throw new Error(`CSS failed to load: ${href}`);
    }
    
    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      link.onload = () => {
        this.cache.set(href, link);
        this.loadingPromises.delete(href);
        resolve(link);
      };
      
      link.onerror = (error) => {
        this.loadingPromises.delete(href);
        
        if (retryCount < this.maxRetries) {
          console.warn(`Failed to load CSS, retrying (${retryCount + 1}/${this.maxRetries}): ${href}`);
          setTimeout(() => {
            this.loadCSS(href, retryCount + 1).then(resolve).catch(reject);
          }, this.retryDelay * (retryCount + 1));
        } else {
          this.failedAssets.add(href);
          reject(new Error(`Failed to load CSS after ${this.maxRetries} retries: ${href}`));
        }
      };
      
      document.head.appendChild(link);
    });
    
    this.loadingPromises.set(href, promise);
    return promise;
  }
  
  /**
   * Load an image
   */
  async loadImage(src, retryCount = 0) {
    // Check cache first
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }
    
    // Check if failed
    if (this.failedAssets.has(src)) {
      throw new Error(`Image failed to load: ${src}`);
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = (error) => {
        this.loadingPromises.delete(src);
        
        if (retryCount < this.maxRetries) {
          console.warn(`Failed to load image, retrying (${retryCount + 1}/${this.maxRetries}): ${src}`);
          setTimeout(() => {
            this.loadImage(src, retryCount + 1).then(resolve).catch(reject);
          }, this.retryDelay * (retryCount + 1));
        } else {
          this.failedAssets.add(src);
          reject(new Error(`Failed to load image after ${this.maxRetries} retries: ${src}`));
        }
      };
      
      img.src = src;
    });
    
    this.loadingPromises.set(src, promise);
    return promise;
  }
  
  /**
   * Load JSON data
   */
  async loadJSON(url, retryCount = 0) {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }
    
    // Check if failed
    if (this.failedAssets.has(url)) {
      throw new Error(`JSON failed to load: ${url}`);
    }
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.cache.set(url, data);
        this.loadingPromises.delete(url);
        resolve(data);
      } catch (error) {
        this.loadingPromises.delete(url);
        
        if (retryCount < this.maxRetries) {
          console.warn(`Failed to load JSON, retrying (${retryCount + 1}/${this.maxRetries}): ${url}`);
          setTimeout(() => {
            this.loadJSON(url, retryCount + 1).then(resolve).catch(reject);
          }, this.retryDelay * (retryCount + 1));
        } else {
          this.failedAssets.add(url);
          reject(new Error(`Failed to load JSON after ${this.maxRetries} retries: ${url}`));
        }
      }
    });
    
    this.loadingPromises.set(url, promise);
    return promise;
  }
  
  /**
   * Preload critical assets
   */
  async preloadAssets(assetList) {
    const preloadPromises = [];
    
    for (const asset of assetList) {
      switch (asset.type) {
        case 'script':
          preloadPromises.push(this.loadScript(asset.src));
          break;
        case 'css':
          preloadPromises.push(this.loadCSS(asset.href));
          break;
        case 'image':
          preloadPromises.push(this.loadImage(asset.src));
          break;
        case 'json':
          preloadPromises.push(this.loadJSON(asset.url));
          break;
        default:
          console.warn(`Unknown asset type: ${asset.type}`);
      }
    }
    
    return Promise.allSettled(preloadPromises);
  }
  
  /**
   * Handle load results and report status
   */
  handleLoadResults(results, gameConfig) {
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`Asset loading complete for ${gameConfig.title}:`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.warn('Some assets failed to load. Game may not function properly.');
    }
    
    // Emit event for analytics
    if (typeof window !== 'undefined' && window.gameLoader) {
      window.gameLoader.emit('assetsLoaded', {
        gameId: gameConfig.id,
        successful,
        failed,
        total: results.length
      });
    }
  }
  
  /**
   * Clear cache for specific asset
   */
  clearCache(src) {
    this.cache.delete(src);
    this.failedAssets.delete(src);
  }
  
  /**
   * Clear entire cache
   */
  clearAllCache() {
    this.cache.clear();
    this.failedAssets.clear();
    this.loadingPromises.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      failed: this.failedAssets.size,
      total: this.cache.size + this.loadingPromises.size + this.failedAssets.size
    };
  }
  
  /**
   * Check if asset is cached
   */
  isCached(src) {
    return this.cache.has(src);
  }
  
  /**
   * Check if asset is loading
   */
  isLoading(src) {
    return this.loadingPromises.has(src);
  }
  
  /**
   * Check if asset failed to load
   */
  hasFailed(src) {
    return this.failedAssets.has(src);
  }
  
  /**
   * Get loading progress
   */
  getLoadingProgress() {
    const total = this.cache.size + this.loadingPromises.size + this.failedAssets.size;
    if (total === 0) return 100;
    
    const completed = this.cache.size + this.failedAssets.size;
    return Math.round((completed / total) * 100);
  }
  
  /**
   * Wait for all pending loads to complete
   */
  async waitForAllLoads() {
    const promises = Array.from(this.loadingPromises.values());
    if (promises.length === 0) return;
    
    await Promise.allSettled(promises);
  }
  
  /**
   * Unload unused assets to free memory
   */
  unloadUnusedAssets(keepList = []) {
    const toRemove = [];
    
    for (const [src, asset] of this.cache) {
      if (!keepList.includes(src)) {
        toRemove.push(src);
      }
    }
    
    for (const src of toRemove) {
      this.clearCache(src);
    }
    
    console.log(`Unloaded ${toRemove.length} unused assets`);
  }
}

// Create global instance
window.assetLoader = new AssetLoader();

export default AssetLoader;
