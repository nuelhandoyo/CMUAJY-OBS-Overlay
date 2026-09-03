import { OverlayConfig } from '../types';
import { defaultConfig } from '../data/defaultConfig';

const STORAGE_PREFIX = 'obs_overlay_config_room_';
const CHANNEL_PREFIX = 'obs_overlay_channel_';

export function sanitizeRoomCode(raw: string | null | undefined): string {
  if (!raw) return 'UAJY-MISA';
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
  return cleaned || 'UAJY-MISA';
}

export function getSessionCodeFromUrl(): string {
  if (typeof window === 'undefined') return 'UAJY-MISA';
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code') || urlParams.get('room') || urlParams.get('session');
  
  if (codeParam) {
    const code = sanitizeRoomCode(codeParam);
    try {
      localStorage.setItem('obs_overlay_active_room', code);
    } catch {}
    return code;
  }

  // Check hash or localStorage fallback
  const hash = window.location.hash;
  if (hash.includes('code=')) {
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const hashVal = hashParams.get('code');
    if (hashVal) return sanitizeRoomCode(hashVal);
  }

  try {
    const savedRoom = localStorage.getItem('obs_overlay_active_room');
    if (savedRoom) return sanitizeRoomCode(savedRoom);
  } catch {}

  return 'UAJY-MISA';
}

export function setSessionCodeInUrl(code: string, viewMode: 'admin' | 'audience' = 'admin') {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeRoomCode(code);
  try {
    localStorage.setItem('obs_overlay_active_room', sanitized);
    const url = new URL(window.location.href);
    url.searchParams.set('code', sanitized);
    if (viewMode === 'audience') {
      url.searchParams.set('view', 'audience');
    } else {
      url.searchParams.set('view', 'operator');
    }
    window.history.pushState({ room: sanitized, view: viewMode }, '', url.toString());
  } catch (e) {
    console.warn('Unable to update URL session code:', e);
  }
}

export const DEFAULT_CONFIG_VERSION = 2;

export function sanitizeConfig(parsed: any): OverlayConfig {
  const cfg = { ...defaultConfig, ...parsed };

  // If parsed data is from an older version or unversioned, apply new requested defaults
  if (!parsed?.configVersion || parsed.configVersion < DEFAULT_CONFIG_VERSION) {
    cfg.configVersion = DEFAULT_CONFIG_VERSION;
    cfg.layoutMode = 'full_presenter_noborder';
    cfg.cameraMode = 'chroma_green';
    cfg.cameraSourceType = 'chroma_green';
    cfg.chromaColor = '#00FF00';
    cfg.showCameraFrame = false;
    cfg.camera1Active = false;
    cfg.camera2Active = false;
    cfg.showTicker = false;
    cfg.showLowerThird = false;
    cfg.showLiturgyTracker = false;
  }

  // Ensure high-legibility defaults and safe layout states
  cfg.showLogos = false;
  cfg.activeLogoUrl = '';
  cfg.secondLogoUrl = '';

  if (cfg.logoPosition === 'both_corners' && !cfg.secondLogoUrl) {
    cfg.logoPosition = 'top_left';
  }
  if (cfg.lowerThirdStyle === 'uajy_signature') {
    cfg.lowerThirdStyle = 'classic_signature';
  }
  if (cfg.lowerThirdFont === 'serif' || cfg.lowerThirdFont === 'cinzel') {
    cfg.lowerThirdFont = 'sans';
  }
  if (cfg.waitingFontFamily === 'serif' || cfg.waitingFontFamily === 'cinzel') {
    cfg.waitingFontFamily = 'sans';
  }
  if (cfg.tickerFontFamily === 'serif' || cfg.tickerFontFamily === 'cinzel') {
    cfg.tickerFontFamily = 'sans';
  }

  if (!cfg.backgroundUrl) {
    cfg.backgroundUrl = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6dzhwbGlqaG5qYW5yYjE0bzMzZmh2YmZnYjJ3YzhxZTkybG1tayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UYBDCJjwOd9Re/giphy.gif';
  }

  if (!cfg.themePreset) {
    cfg.themePreset = 'cream';
    cfg.customPrimaryBgColor = '#FFF7E5';
    cfg.customAccentColor = '#093A6E';
    cfg.customNameColor = '#093A6E';
    cfg.customTitleColor = '#926C35';
    cfg.frameBorderColor = '#093A6E';
    cfg.tickerBgColor = '#FFF7E5';
    cfg.tickerTextColor = '#093A6E';
    cfg.tickerBadgeBgColor = '#093A6E';
    cfg.waitingBgColor = '#FFF7E5';
    cfg.waitingAccentColor = '#093A6E';
  }

  if (!cfg.liturgyItems || !Array.isArray(cfg.liturgyItems) || cfg.liturgyItems.length === 0) {
    cfg.liturgyItems = defaultConfig.liturgyItems;
  }
  if (typeof cfg.activeLiturgyIndex !== 'number' || cfg.activeLiturgyIndex < 0) {
    cfg.activeLiturgyIndex = 0;
  }
  if (cfg.showLiturgyTracker === undefined) {
    cfg.showLiturgyTracker = true;
  }
  if (!cfg.liturgyTrackerPosition) {
    cfg.liturgyTrackerPosition = 'top_right';
  }

  return cfg;
}

export function loadOverlayConfig(roomCode: string = getSessionCodeFromUrl()): OverlayConfig {
  const code = sanitizeRoomCode(roomCode);
  const storageKey = `${STORAGE_PREFIX}${code}`;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      return sanitizeConfig(parsed);
    }
  } catch (err) {
    console.error('Failed to parse overlay config from localStorage:', err);
  }
  return defaultConfig;
}

// Debounce map for server POST to avoid flooding during slider drags
const saveTimeouts = new Map<string, number>();

export function saveOverlayConfig(config: OverlayConfig, roomCode: string = getSessionCodeFromUrl()): void {
  const code = sanitizeRoomCode(roomCode);
  const storageKey = `${STORAGE_PREFIX}${code}`;
  const channelName = `${CHANNEL_PREFIX}${code}`;

  // 1. Instant local storage & broadcast for same-browser instances
  try {
    localStorage.setItem(storageKey, JSON.stringify(config));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(channelName);
        bc.postMessage(config);
        setTimeout(() => bc.close(), 100);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  } catch (err) {
    console.error('Failed to save overlay config locally:', err);
  }

  // 2. Dispatch to backend server with slight debounce for network efficiency
  if (saveTimeouts.has(code)) {
    window.clearTimeout(saveTimeouts.get(code));
  }

  const timeoutId = window.setTimeout(async () => {
    try {
      await fetch(`/api/session/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
    } catch (err) {
      // Backend may be offline in static-only preview mode, local sync remains active
      console.warn('Server sync POST notification:', err);
    }
    saveTimeouts.delete(code);
  }, 40);

  saveTimeouts.set(code, timeoutId);
}

export interface SyncStatus {
  status: 'connected' | 'syncing' | 'offline';
  code: string;
  subscribers: number;
  lastSyncTime: number;
}

export function subscribeOverlayConfig(
  roomCode: string,
  onConfigUpdate: (config: OverlayConfig) => void,
  onStatusChange?: (status: SyncStatus) => void
): () => void {
  const code = sanitizeRoomCode(roomCode);
  const storageKey = `${STORAGE_PREFIX}${code}`;
  const channelName = `${CHANNEL_PREFIX}${code}`;

  let isDestroyed = false;
  let eventSource: EventSource | null = null;
  let pollInterval: number | null = null;
  let lastReceivedTimestamp = 0;

  const notifyStatus = (status: 'connected' | 'syncing' | 'offline', subscribers = 1) => {
    if (onStatusChange) {
      onStatusChange({
        status,
        code,
        subscribers,
        lastSyncTime: Date.now(),
      });
    }
  };

  // 1. Local Storage Event Listener (Cross-tab same browser)
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === storageKey && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        onConfigUpdate(sanitizeConfig(parsed));
        notifyStatus('connected');
      } catch (e) {
        console.error('Error parsing storage event payload:', e);
      }
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  // 2. Local Broadcast Channel (Same browser instant)
  let channel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(channelName);
      channel.onmessage = (event) => {
        if (event.data) {
          onConfigUpdate(sanitizeConfig(event.data));
          notifyStatus('connected');
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel init error:', e);
    }
  }

  // 3. Initial Server Hydration
  const fetchLatestFromServer = async () => {
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          if (data.lastUpdated > lastReceivedTimestamp) {
            lastReceivedTimestamp = data.lastUpdated;
            onConfigUpdate(sanitizeConfig(data.config));
            // Cache locally
            try {
              localStorage.setItem(storageKey, JSON.stringify(data.config));
            } catch {}
          }
          notifyStatus('connected', data.activeSubscribers || 1);
        }
      }
    } catch (err) {
      console.warn('Initial server hydration warning:', err);
    }
  };

  fetchLatestFromServer();

  // 4. Server-Sent Events (SSE) Stream for cross-browser / OBS real-time synchronization
  const connectSSE = () => {
    if (isDestroyed || typeof EventSource === 'undefined') return;

    try {
      eventSource = new EventSource(`/api/session/${encodeURIComponent(code)}/events`);

      eventSource.onopen = () => {
        notifyStatus('connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'sync' || payload.type === 'connected') {
            if (payload.config) {
              lastReceivedTimestamp = payload.timestamp || Date.now();
              onConfigUpdate(sanitizeConfig(payload.config));
              // Cache locally
              try {
                localStorage.setItem(storageKey, JSON.stringify(payload.config));
              } catch {}
            }
            notifyStatus('connected', payload.subscribers || 1);
          }
        } catch (e) {
          console.error('Failed to parse SSE message:', e);
        }
      };

      eventSource.onerror = () => {
        notifyStatus('syncing');
        // Close and let polling or reconnect happen
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Attempt reconnect in 3 seconds if not destroyed
        if (!isDestroyed) {
          setTimeout(connectSSE, 3000);
        }
      };
    } catch (err) {
      console.warn('SSE connection initialization warning:', err);
    }
  };

  connectSSE();

  // 5. Background Polling Fallback (Every 2.5s) to guarantee resilience in OBS browser source
  pollInterval = window.setInterval(async () => {
    if (isDestroyed) return;
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config && data.lastUpdated > lastReceivedTimestamp) {
          lastReceivedTimestamp = data.lastUpdated;
          onConfigUpdate(sanitizeConfig(data.config));
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.config));
          } catch {}
          notifyStatus('connected', data.activeSubscribers || 1);
        }
      }
    } catch {
      // Offline fallback
    }
  }, 2500);

  // Cleanup
  return () => {
    isDestroyed = true;
    window.removeEventListener('storage', handleStorageEvent);
    if (channel) {
      try {
        channel.close();
      } catch {}
    }
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
    }
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  };
}
