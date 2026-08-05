import { OverlayConfig } from '../types';
import { defaultConfig } from '../data/defaultConfig';

const STORAGE_KEY = 'obs_overlay_config_v8';
const CHANNEL_NAME = 'obs_overlay_sync_channel';

let channel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }
}

export function loadOverlayConfig(): OverlayConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up legacy logos and enforce brand default theme
      parsed.showLogos = false;
      parsed.activeLogoUrl = '';
      parsed.secondLogoUrl = '';
      if (parsed.logoPosition === 'both_corners' && !parsed.secondLogoUrl) {
        parsed.logoPosition = 'top_left';
      }
      if (parsed.lowerThirdStyle === 'uajy_signature') {
        parsed.lowerThirdStyle = 'classic_signature';
      }

      // Enforce high-legibility sans-serif fonts
      if (parsed.lowerThirdFont === 'serif' || parsed.lowerThirdFont === 'cinzel') {
        parsed.lowerThirdFont = 'sans';
      }
      if (parsed.waitingFontFamily === 'serif' || parsed.waitingFontFamily === 'cinzel') {
        parsed.waitingFontFamily = 'sans';
      }
      if (parsed.tickerFontFamily === 'serif' || parsed.tickerFontFamily === 'cinzel') {
        parsed.tickerFontFamily = 'sans';
      }

      // Default backgroundUrl if not set
      if (!parsed.backgroundUrl) {
        parsed.backgroundUrl = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6dzhwbGlqaG5qYW5yYjE0bzMzZmh2YmZnYjJ3YzhxZTkybG1tayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UYBDCJjwOd9Re/giphy.gif';
      }

      // Default themePreset to cream if not set
      if (!parsed.themePreset) {
        parsed.themePreset = 'cream';
        parsed.customPrimaryBgColor = '#FFF7E5';
        parsed.customAccentColor = '#093A6E';
        parsed.customNameColor = '#093A6E';
        parsed.customTitleColor = '#926C35';
        parsed.frameBorderColor = '#093A6E';
        parsed.tickerBgColor = '#FFF7E5';
        parsed.tickerTextColor = '#093A6E';
        parsed.tickerBadgeBgColor = '#093A6E';
        parsed.waitingBgColor = '#FFF7E5';
        parsed.waitingAccentColor = '#093A6E';
      }

      return { ...defaultConfig, ...parsed };
    }
  } catch (err) {
    console.error('Failed to parse overlay config from localStorage:', err);
  }
  return defaultConfig;
}

export function saveOverlayConfig(config: OverlayConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    if (channel) {
      channel.postMessage(config);
    }
  } catch (err) {
    console.error('Failed to save overlay config:', err);
  }
}

export function subscribeOverlayConfig(callback: (config: OverlayConfig) => void): () => void {
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback({ ...defaultConfig, ...parsed });
      } catch (e) {
        console.error('Error parsing storage event payload:', e);
      }
    }
  };

  const handleMessage = (event: MessageEvent) => {
    if (event.data) {
      callback({ ...defaultConfig, ...event.data });
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  if (channel) {
    channel.addEventListener('message', handleMessage);
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
  };
}
