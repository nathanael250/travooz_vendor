/**
 * Version checking utility to automatically clear cache when new version is deployed
 */

const APP_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_FILE = '/version.json';

let versionCheckInterval = null;

/**
 * Get current app version
 */
export const getCurrentVersion = () => {
  return APP_VERSION;
};

/**
 * Fetch version from server
 */
const fetchServerVersion = async () => {
  try {
    const response = await fetch(`${VERSION_FILE}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.version;
  } catch (error) {
    console.warn('[VersionCheck] Failed to fetch server version:', error);
    return null;
  }
};

/**
 * Clear all caches and reload
 */
const clearCacheAndReload = () => {
  console.log('[VersionCheck] New version detected. Clearing cache and reloading...');
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
  
  // Clear localStorage if needed (optional - be careful with this)
  // localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force reload
  window.location.reload(true);
};

/**
 * Check if new version is available
 */
const checkVersion = async () => {
  try {
    const serverVersion = await fetchServerVersion();
    
    if (!serverVersion) {
      // If we can't fetch version, don't do anything
      return;
    }
    
    const currentVersion = getCurrentVersion();
    
    if (serverVersion !== currentVersion) {
      console.log(`[VersionCheck] Version mismatch detected. Current: ${currentVersion}, Server: ${serverVersion}`);
      clearCacheAndReload();
    }
  } catch (error) {
    console.error('[VersionCheck] Error checking version:', error);
  }
};

/**
 * Start version checking
 */
export const startVersionCheck = () => {
  // Check immediately on load
  checkVersion();
  
  // Then check periodically
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval);
  }
  
  versionCheckInterval = setInterval(checkVersion, VERSION_CHECK_INTERVAL);
  
  // Also check when user comes back to the tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkVersion();
    }
  });
  
  // Check on focus
  window.addEventListener('focus', checkVersion);
};

/**
 * Stop version checking
 */
export const stopVersionCheck = () => {
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval);
    versionCheckInterval = null;
  }
};

