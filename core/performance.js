/**
 * Performance Monitoring and Optimization System
 * Tracks performance metrics and provides optimization insights
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    
    // Performance thresholds
    this.thresholds = {
      firstContentfulPaint: 1800, // 1.8 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
      timeToInteractive: 3800 // 3.8 seconds
    };
    
    this.init();
  }
  
  /**
   * Initialize performance monitoring
   */
  init() {
    if (this.isInitialized) return;
    
    this.setupPerformanceObservers();
    this.setupResourceTiming();
    this.setupUserTiming();
    this.setupMemoryMonitoring();
    this.setupNetworkMonitoring();
    
    this.isInitialized = true;
    console.log('Performance Monitor initialized');
  }
  
  /**
   * Setup performance observers
   */
  setupPerformanceObservers() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('firstContentfulPaint', entry.startTime);
            this.recordMetric('firstPaint', entry.startTime);
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Paint observer setup failed:', error);
      }
      
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largestContentfulPaint', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observer setup failed:', error);
      }
      
      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('firstInputDelay', entry.processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observer setup failed:', error);
      }
      
      // Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.recordMetric('cumulativeLayoutShift', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observer setup failed:', error);
      }
    }
  }
  
  /**
   * Setup resource timing monitoring
   */
  setupResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.analyzeResource(entry);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource observer setup failed:', error);
      }
    }
    
    // Monitor existing resources
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => this.analyzeResource(resource));
    }
  }
  
  /**
   * Setup user timing marks and measures
   */
  setupUserTiming() {
    // Monitor custom performance marks
    if ('PerformanceObserver' in window) {
      try {
        const userTimingObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordMetric(`userTiming_${entry.name}`, entry.duration);
            }
          }
        });
        userTimingObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('User timing observer setup failed:', error);
      }
    }
  }
  
  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.recordMetric('memoryUsed', memory.usedJSHeapSize);
        this.recordMetric('memoryTotal', memory.totalJSHeapSize);
        this.recordMetric('memoryLimit', memory.jsHeapSizeLimit);
      }, 5000);
    }
  }
  
  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.recordMetric('networkType', connection.effectiveType);
      this.recordMetric('networkDownlink', connection.downlink);
      this.recordMetric('networkRtt', connection.rtt);
      
      connection.addEventListener('change', () => {
        this.recordMetric('networkType', connection.effectiveType);
        this.recordMetric('networkDownlink', connection.downlink);
        this.recordMetric('networkRtt', connection.rtt);
      });
    }
  }
  
  /**
   * Analyze resource performance
   */
  analyzeResource(entry) {
    const url = new URL(entry.name);
    const resourceType = this.getResourceType(url.pathname);
    
    this.recordMetric(`resource_${resourceType}_duration`, entry.duration);
    this.recordMetric(`resource_${resourceType}_size`, entry.transferSize || 0);
    
    // Check for slow resources
    if (entry.duration > 1000) {
      this.recordSlowResource(entry);
    }
    
    // Check for large resources
    if (entry.transferSize && entry.transferSize > 100000) {
      this.recordLargeResource(entry);
    }
  }
  
  /**
   * Get resource type from URL
   */
  getResourceType(pathname) {
    if (pathname.endsWith('.css')) return 'css';
    if (pathname.endsWith('.js')) return 'js';
    if (pathname.endsWith('.html')) return 'html';
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (pathname.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }
  
  /**
   * Record performance metric
   */
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });
    
    // Keep only last 100 values
    if (this.metrics.get(name).length > 100) {
      this.metrics.get(name).shift();
    }
    
    // Check thresholds
    this.checkThreshold(name, value);
    
    // Notify observers
    this.notifyObservers(name, value);
  }
  
  /**
   * Check performance thresholds
   */
  checkThreshold(name, value) {
    const threshold = this.thresholds[name];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded: ${name} = ${value}ms (threshold: ${threshold}ms)`);
      this.emitThresholdExceeded(name, value, threshold);
    }
  }
  
  /**
   * Record slow resource
   */
  recordSlowResource(entry) {
    console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);
    
    this.recordMetric('slowResources', {
      url: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      timestamp: Date.now()
    });
  }
  
  /**
   * Record large resource
   */
  recordLargeResource(entry) {
    console.warn(`Large resource detected: ${entry.name} size: ${entry.transferSize} bytes`);
    
    this.recordMetric('largeResources', {
      url: entry.name,
      size: entry.transferSize,
      duration: entry.duration,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const report = {
      timestamp: Date.now(),
      metrics: {},
      recommendations: [],
      score: 0
    };
    
    // Calculate averages for key metrics
    for (const [name, values] of this.metrics) {
      if (values.length > 0) {
        const avg = values.reduce((sum, item) => sum + item.value, 0) / values.length;
        report.metrics[name] = {
          average: avg,
          latest: values[values.length - 1]?.value,
          count: values.length
        };
      }
    }
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.metrics);
    
    // Calculate performance score
    report.score = this.calculatePerformanceScore(report.metrics);
    
    return report;
  }
  
  /**
   * Generate optimization recommendations
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    // Check FCP
    if (metrics.firstContentfulPaint?.average > 2000) {
      recommendations.push({
        type: 'critical',
        metric: 'First Contentful Paint',
        message: 'Consider optimizing critical rendering path and reducing render-blocking resources',
        impact: 'high'
      });
    }
    
    // Check LCP
    if (metrics.largestContentfulPaint?.average > 3000) {
      recommendations.push({
        type: 'critical',
        metric: 'Largest Contentful Paint',
        message: 'Optimize largest content element loading and consider image optimization',
        impact: 'high'
      });
    }
    
    // Check FID
    if (metrics.firstInputDelay?.average > 150) {
      recommendations.push({
        type: 'important',
        metric: 'First Input Delay',
        message: 'Reduce JavaScript execution time and optimize event handlers',
        impact: 'medium'
      });
    }
    
    // Check CLS
    if (metrics.cumulativeLayoutShift?.average > 0.15) {
      recommendations.push({
        type: 'important',
        metric: 'Cumulative Layout Shift',
        message: 'Set explicit dimensions for images and avoid inserting content above existing content',
        impact: 'medium'
      });
    }
    
    // Check resource sizes
    if (metrics.resource_css_size?.average > 50000) {
      recommendations.push({
        type: 'suggestion',
        metric: 'CSS Size',
        message: 'Consider splitting CSS into critical and non-critical paths',
        impact: 'low'
      });
    }
    
    if (metrics.resource_js_size?.average > 100000) {
      recommendations.push({
        type: 'suggestion',
        metric: 'JavaScript Size',
        message: 'Consider code splitting and lazy loading for JavaScript',
        impact: 'low'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Calculate performance score (0-100)
   */
  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // Deduct points for poor performance
    if (metrics.firstContentfulPaint?.average > 2000) score -= 20;
    if (metrics.largestContentfulPaint?.average > 3000) score -= 20;
    if (metrics.firstInputDelay?.average > 150) score -= 15;
    if (metrics.cumulativeLayoutShift?.average > 0.15) score -= 15;
    
    // Bonus points for good performance
    if (metrics.firstContentfulPaint?.average < 1000) score += 10;
    if (metrics.largestContentfulPaint?.average < 1500) score += 10;
    if (metrics.firstInputDelay?.average < 50) score += 5;
    if (metrics.cumulativeLayoutShift?.average < 0.05) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Add performance observer
   */
  addObserver(name, callback) {
    if (!this.observers.has(name)) {
      this.observers.set(name, []);
    }
    this.observers.get(name).push(callback);
    
    return () => {
      const callbacks = this.observers.get(name);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify observers
   */
  notifyObservers(name, value) {
    const callbacks = this.observers.get(name);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(name, value);
        } catch (error) {
          console.warn('Performance observer callback error:', error);
        }
      });
    }
  }
  
  /**
   * Emit threshold exceeded event
   */
  emitThresholdExceeded(metric, value, threshold) {
    const event = new CustomEvent('performanceThresholdExceeded', {
      detail: {
        metric,
        value,
        threshold,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Mark performance milestone
   */
  mark(name) {
    if ('mark' in performance) {
      performance.mark(name);
    }
  }
  
  /**
   * Measure performance between marks
   */
  measure(name, startMark, endMark) {
    if ('measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    const result = {};
    for (const [name, values] of this.metrics) {
      if (values.length > 0) {
        result[name] = values[values.length - 1].value;
      }
    }
    return result;
  }
  
  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.clear();
  }
  
  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      metrics: Object.fromEntries(this.metrics),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
  
  /**
   * Destroy performance monitor
   */
  destroy() {
    // Clear all observers and metrics
    this.observers.clear();
    this.metrics.clear();
    this.isInitialized = false;
  }
}

// Create global instance
window.performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
