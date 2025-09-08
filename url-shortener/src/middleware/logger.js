class Logger {
  constructor() {
    this.enabled = true;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  log(level, message, data = {}) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // In a real application, this would send to a logging service
    // For this demo, we'll just store in memory and show in console
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('app_logs', JSON.stringify(logs));
    
    // For debugging during development only (would be removed in production)
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
    }
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  error(message, data = {}) {
    this.log('error', message, data);
  }

  getLogs() {
    return JSON.parse(localStorage.getItem('app_logs') || '[]');
  }

  clearLogs() {
    localStorage.removeItem('app_logs');
  }
}

// Create a singleton instance
const logger = new Logger();
export default logger;