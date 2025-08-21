/**
 * Responsive Utilities System
 * Provides JavaScript-based responsive design features and device detection
 */

export class ResponsiveUtils {
  constructor() {
    this.breakpoints = {
      xs: 320,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1200,
      '2xl': 1400
    };
    
    this.currentBreakpoint = 'md';
    this.isTouchDevice = this.detectTouchDevice();
    this.isMobile = this.detectMobile();
    this.orientation = this.getOrientation();
    
    this.observers = new Map();
    this.resizeCallbacks = [];
    
    this.init();
  }
  
  /**
   * Initialize responsive utilities
   */
  init() {
    this.updateBreakpoint();
    this.setupEventListeners();
    this.setupResizeObserver();
  }
  
  /**
   * Detect touch device
   */
  detectTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
  }
  
  /**
   * Detect mobile device
   */
  detectMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad|phone|tablet/.test(userAgent);
  }
  
  /**
   * Get current orientation
   */
  getOrientation() {
    if (window.screen && window.screen.orientation) {
      return window.screen.orientation.type;
    }
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
  
  /**
   * Update current breakpoint
   */
  updateBreakpoint() {
    const width = window.innerWidth;
    let newBreakpoint = 'xs';
    
    for (const [breakpoint, minWidth] of Object.entries(this.breakpoints)) {
      if (width >= minWidth) {
        newBreakpoint = breakpoint;
      } else {
        break;
      }
    }
    
    if (newBreakpoint !== this.currentBreakpoint) {
      const oldBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = newBreakpoint;
      this.emitBreakpointChange(oldBreakpoint, newBreakpoint);
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Resize event
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    });
    
    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        this.emitOrientationChange();
      }, 100);
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.emitVisibilityChange(!document.hidden);
    });
  }
  
  /**
   * Setup resize observer for specific elements
   */
  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          const element = entry.target;
          const callback = this.observers.get(element);
          if (callback) {
            callback(entry.contentRect);
          }
        });
      });
    }
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    this.updateBreakpoint();
    
    // Call all registered resize callbacks
    this.resizeCallbacks.forEach(callback => {
      try {
        callback({
          width: window.innerWidth,
          height: window.innerHeight,
          breakpoint: this.currentBreakpoint,
          orientation: this.orientation
        });
      } catch (error) {
        console.warn('Resize callback error:', error);
      }
    });
  }
  
  /**
   * Emit breakpoint change event
   */
  emitBreakpointChange(oldBreakpoint, newBreakpoint) {
    const event = new CustomEvent('breakpointChange', {
      detail: {
        oldBreakpoint,
        newBreakpoint,
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    window.dispatchEvent(event);
    
    // Update CSS custom properties
    document.documentElement.style.setProperty('--current-breakpoint', newBreakpoint);
    document.documentElement.style.setProperty('--is-mobile', this.isMobile ? '1' : '0');
    document.documentElement.style.setProperty('--is-touch', this.isTouchDevice ? '1' : '0');
  }
  
  /**
   * Emit orientation change event
   */
  emitOrientationChange() {
    const event = new CustomEvent('orientationChange', {
      detail: {
        orientation: this.orientation,
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Emit visibility change event
   */
  emitVisibilityChange(isVisible) {
    const event = new CustomEvent('visibilityChange', {
      detail: {
        isVisible,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }
  
  /**
   * Check if current breakpoint matches
   */
  isBreakpoint(breakpoint) {
    return this.currentBreakpoint === breakpoint;
  }
  
  /**
   * Check if current breakpoint is at least
   */
  isBreakpointAtLeast(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }
  
  /**
   * Check if current breakpoint is at most
   */
  isBreakpointAtMost(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }
  
  /**
   * Check if device is touch
   */
  isTouch() {
    return this.isTouchDevice;
  }
  
  /**
   * Check if device is mobile
   */
  isMobileDevice() {
    return this.isMobile;
  }
  
  /**
   * Get current orientation
   */
  getCurrentOrientation() {
    return this.orientation;
  }
  
  /**
   * Check if orientation is portrait
   */
  isPortrait() {
    return this.orientation === 'portrait';
  }
  
  /**
   * Check if orientation is landscape
   */
  isLandscape() {
    return this.orientation === 'landscape';
  }
  
  /**
   * Get viewport dimensions
   */
  getViewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight
    };
  }
  
  /**
   * Get safe area insets
   */
  getSafeAreaInsets() {
    if (CSS.supports('padding: env(safe-area-inset-top)')) {
      return {
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'),
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0'),
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'),
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0')
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  /**
   * Add resize observer to element
   */
  observeElement(element, callback) {
    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
      this.observers.set(element, callback);
    }
    
    return () => {
      this.unobserveElement(element);
    };
  }
  
  /**
   * Remove resize observer from element
   */
  unobserveElement(element) {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(element);
      this.observers.delete(element);
    }
  }
  
  /**
   * Add resize callback
   */
  onResize(callback) {
    this.resizeCallbacks.push(callback);
    
    return () => {
      const index = this.resizeCallbacks.indexOf(callback);
      if (index > -1) {
        this.resizeCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Add breakpoint change listener
   */
  onBreakpointChange(callback) {
    window.addEventListener('breakpointChange', callback);
    
    return () => {
      window.removeEventListener('breakpointChange', callback);
    };
  }
  
  /**
   * Add orientation change listener
   */
  onOrientationChange(callback) {
    window.addEventListener('orientationChange', callback);
    
    return () => {
      window.removeEventListener('orientationChange', callback);
    };
  }
  
  /**
   * Add visibility change listener
   */
  onVisibilityChange(callback) {
    window.addEventListener('visibilityChange', callback);
    
    return () => {
      window.removeEventListener('visibilityChange', callback);
    };
  }
  
  /**
   * Apply responsive classes to element
   */
  applyResponsiveClasses(element, classes) {
    const currentClasses = element.className.split(' ');
    
    // Remove existing responsive classes
    const filteredClasses = currentClasses.filter(cls => 
      !cls.includes('responsive-') && !cls.includes('breakpoint-')
    );
    
    // Add new responsive classes
    const responsiveClasses = Object.entries(classes).map(([breakpoint, classList]) => {
      if (Array.isArray(classList)) {
        return classList.map(cls => `responsive-${breakpoint}-${cls}`).join(' ');
      }
      return `responsive-${breakpoint}-${classList}`;
    }).join(' ');
    
    element.className = [...filteredClasses, responsiveClasses].filter(Boolean).join(' ');
  }
  
  /**
   * Create responsive element
   */
  createResponsiveElement(tag, responsiveClasses, content) {
    const element = document.createElement(tag);
    
    if (responsiveClasses) {
      this.applyResponsiveClasses(element, responsiveClasses);
    }
    
    if (content) {
      if (typeof content === 'string') {
        element.textContent = content;
      } else if (content instanceof Node) {
        element.appendChild(content);
      } else if (Array.isArray(content)) {
        content.forEach(item => {
          if (item instanceof Node) {
            element.appendChild(item);
          }
        });
      }
    }
    
    return element;
  }
  
  /**
   * Get device capabilities
   */
  getDeviceCapabilities() {
    return {
      touch: this.isTouchDevice,
      mobile: this.isMobile,
      orientation: this.orientation,
      breakpoint: this.currentBreakpoint,
      viewport: this.getViewport(),
      safeArea: this.getSafeAreaInsets(),
      features: {
        webGL: this.hasWebGL(),
        webAudio: this.hasWebAudio(),
        serviceWorker: 'serviceWorker' in navigator,
        pushNotifications: 'PushManager' in window,
        geolocation: 'geolocation' in navigator
      }
    };
  }
  
  /**
   * Check WebGL support
   */
  hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check Web Audio support
   */
  hasWebAudio() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
  
  /**
   * Destroy responsive utilities
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.observers.clear();
    this.resizeCallbacks.length = 0;
    
    // Remove event listeners
    window.removeEventListener('breakpointChange', this.handleResize);
    window.removeEventListener('orientationChange', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleResize);
  }
}

// Create global instance
window.responsiveUtils = new ResponsiveUtils();

export default ResponsiveUtils;
