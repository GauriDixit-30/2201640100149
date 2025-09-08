import { v4 as uuidv4 } from 'uuid';
import logger from '../middleware/logger';

class URLManager {
  constructor() {
    this.storageKey = 'shortened_urls';
    this.loadURLs();
  }

  loadURLs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.urls = stored ? JSON.parse(stored) : {};
      logger.info('URLs loaded from storage', { count: Object.keys(this.urls).length });
    } catch (error) {
      logger.error('Failed to load URLs from storage', { error });
      this.urls = {};
    }
  }

  saveURLs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.urls));
      logger.info('URLs saved to storage', { count: Object.keys(this.urls).length });
    } catch (error) {
      logger.error('Failed to save URLs to storage', { error });
    }
  }

  generateShortCode() {
    return uuidv4().substring(0, 8);
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  isValidShortCode(code) {
    const regex = /^[a-zA-Z0-9_-]{1,20}$/;
    return regex.test(code);
  }

  isShortCodeUnique(code) {
    return !this.urls[code];
  }

  createShortURL(longURL, validityMinutes = 30, customShortCode = null) {
    // Validate inputs
    if (!this.isValidURL(longURL)) {
      logger.warn('Invalid URL provided', { longURL });
      throw new Error('Please provide a valid URL');
    }

    let shortCode = customShortCode;
    
    if (shortCode) {
      if (!this.isValidShortCode(shortCode)) {
        logger.warn('Invalid short code provided', { shortCode });
        throw new Error('Short code must be alphanumeric and 1-20 characters long');
      }
      
      if (!this.isShortCodeUnique(shortCode)) {
        logger.warn('Short code already exists', { shortCode });
        throw new Error('This short code is already in use. Please choose another one.');
      }
    } else {
      shortCode = this.generateShortCode();
      // Ensure uniqueness for generated codes
      while (!this.isShortCodeUnique(shortCode)) {
        shortCode = this.generateShortCode();
      }
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + validityMinutes * 60000);

    const urlData = {
      longURL,
      shortCode,
      createdAt: now.toISOString(),
      expiry: expiry.toISOString(),
      clicks: []
    };

    this.urls[shortCode] = urlData;
    this.saveURLs();
    
    logger.info('Short URL created', { shortCode, longURL, expiry });
    
    return {
      shortURL: `${window.location.origin}/${shortCode}`,
      ...urlData
    };
  }

  getURL(shortCode) {
    const urlData = this.urls[shortCode];
    
    if (!urlData) {
      logger.warn('Short URL not found', { shortCode });
      return null;
    }

    // Check if URL has expired
    const now = new Date();
    const expiry = new Date(urlData.expiry);
    
    if (now > expiry) {
      logger.info('Short URL expired', { shortCode, expiry });
      delete this.urls[shortCode];
      this.saveURLs();
      return null;
    }

    return urlData;
  }

  recordClick(shortCode, source = 'direct') {
    const urlData = this.getURL(shortCode);
    
    if (!urlData) {
      return null;
    }

    const clickData = {
      timestamp: new Date().toISOString(),
      source,
      location: this.getCoarseLocation()
    };

    urlData.clicks.push(clickData);
    this.saveURLs();
    
    logger.info('Click recorded', { shortCode, clickData });
    
    return urlData.longURL;
  }

  getCoarseLocation() {
    // In a real app, this would use a geolocation API
    // For demo purposes, we'll return a mock location
    const locations = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'India', 'Brazil'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getAllURLs() {
    return Object.values(this.urls);
  }

  deleteURL(shortCode) {
    if (this.urls[shortCode]) {
      delete this.urls[shortCode];
      this.saveURLs();
      logger.info('URL deleted', { shortCode });
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const urlManager = new URLManager();
export default urlManager;