import React, { useEffect, useState, useCallback } from 'react';
import { OverlayConfig } from './types';
import {
  loadOverlayConfig,
  saveOverlayConfig,
  subscribeOverlayConfig,
  getSessionCodeFromUrl,
  setSessionCodeInUrl,
  sanitizeRoomCode,
  SyncStatus,
} from './utils/storageSync';
import { AdminPanel } from './components/AdminPanel';
import { AudienceOverlay } from './components/AudienceOverlay';
import { Monitor, Shield, Radio, Copy, Check, ExternalLink, Wifi, Key } from 'lucide-react';

// Helper to determine viewMode from search params, hash, or pathname
function detectViewMode(): 'admin' | 'audience' {
  if (typeof window === 'undefined') return 'admin';
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view')?.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  if (
    viewParam === 'audience' ||
    viewParam === 'obs' ||
    viewParam === 'stream' ||
    viewParam === 'overlay' ||
    hash.includes('audience') ||
    hash.includes('obs') ||
    path.endsWith('/audience') ||
    path.endsWith('/obs')
  ) {
    return 'audience';
  }
  return 'admin';
}

export default function App() {
  const [roomCode, setRoomCode] = useState<string>(getSessionCodeFromUrl);
  const [config, setConfig] = useState<OverlayConfig>(() => loadOverlayConfig(getSessionCodeFromUrl()));
  const [viewMode, setViewMode] = useState<'admin' | 'audience'>(detectViewMode);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'syncing',
    code: getSessionCodeFromUrl(),
    subscribers: 1,
    lastSyncTime: Date.now(),
  });

  // Sync viewMode and roomCode with browser history / URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setViewMode(detectViewMode());
      const newCode = getSessionCodeFromUrl();
      if (newCode !== roomCode) {
        setRoomCode(newCode);
        setConfig(loadOverlayConfig(newCode));
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [roomCode]);

  // Subscribe to real-time updates for the current roomCode (across tabs, browsers, and OBS)
  useEffect(() => {
    // Ensure URL has current roomCode
    setSessionCodeInUrl(roomCode, viewMode);

    const unsubscribe = subscribeOverlayConfig(
      roomCode,
      (newConfig) => {
        setConfig(newConfig);
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomCode, viewMode]);

  const handleSwitchView = useCallback((newMode: 'admin' | 'audience') => {
    setViewMode(newMode);
    setSessionCodeInUrl(roomCode, newMode);
  }, [roomCode]);

  const handleRoomCodeChange = useCallback((newCodeRaw: string) => {
    const newCode = sanitizeRoomCode(newCodeRaw);
    if (!newCode || newCode === roomCode) return;
    setRoomCode(newCode);
    setSessionCodeInUrl(newCode, viewMode);
    const initialForRoom = loadOverlayConfig(newCode);
    setConfig(initialForRoom);
  }, [roomCode, viewMode]);

  const handleConfigChange = (newConfig: OverlayConfig) => {
    setConfig(newConfig);
    saveOverlayConfig(newConfig, roomCode);
  };

  // Automatic Slide Rotation Effect when autoAdvanceSlides is enabled
  useEffect(() => {
    if (
      !config.autoAdvanceSlides ||
      config.slideSourceType !== 'image_deck' ||
      !config.slides ||
      config.slides.length <= 1
    ) {
      return;
    }

    const intervalSec =
      config.autoAdvanceIntervalSeconds && config.autoAdvanceIntervalSeconds > 0
        ? config.autoAdvanceIntervalSeconds
        : 10;

    const timer = setInterval(() => {
      // Only advance automatically on admin window to avoid multiple callers
      if (viewMode === 'admin') {
        setConfig((prevConfig) => {
          if (
            !prevConfig.autoAdvanceSlides ||
            prevConfig.slideSourceType !== 'image_deck' ||
            !prevConfig.slides ||
            prevConfig.slides.length <= 1
          ) {
            return prevConfig;
          }
          const nextIdx = (prevConfig.activeSlideIndex + 1) % prevConfig.slides.length;
          const updated = { ...prevConfig, activeSlideIndex: nextIdx };
          saveOverlayConfig(updated, roomCode);
          return updated;
        });
      }
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [
    config.autoAdvanceSlides,
    config.autoAdvanceIntervalSeconds,
    config.slideSourceType,
    config.slides?.length,
    viewMode,
    roomCode,
  ]);

  const handleOpenAudienceWindow = () => {
    const audienceUrl = `${window.location.origin}${window.location.pathname}?view=audience&code=${encodeURIComponent(roomCode)}`;
    window.open(audienceUrl, 'OBS_Audience_Overlay_Window', 'width=1920,height=1080');
  };

  const copyUrl = (type: 'audience' | 'operator') => {
    const viewParam = type === 'audience' ? 'audience' : 'operator';
    const targetUrl = `${window.location.origin}${window.location.pathname}?view=${viewParam}&code=${encodeURIComponent(roomCode)}`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedNotification(type === 'audience' ? `URL OBS [${roomCode}] Tersalin!` : `URL Operator [${roomCode}] Tersalin!`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleNextSlide = () => {
    if (config.slides.length === 0) return;
    const nextIdx = (config.activeSlideIndex + 1) % config.slides.length;
    handleConfigChange({ ...config, activeSlideIndex: nextIdx });
  };

  const handlePrevSlide = () => {
    if (config.slides.length === 0) return;
    const prevIdx = (config.activeSlideIndex - 1 + config.slides.length) % config.slides.length;
    handleConfigChange({ ...config, activeSlideIndex: prevIdx });
  };

  // 1. STANDALONE AUDIENCE / OBS BROWSER SOURCE VIEW
  // Clean 100% full-screen output for OBS Studio (Fits any resolution, never cropped)
  if (viewMode === 'audience') {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden relative select-none">
        {/* Discreet hover utility for testing inside standard browsers (invisible on stream) */}
        <div className="fixed top-2 right-2 z-50 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl text-xs flex items-center gap-2 text-white backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold px-1.5">
            <Key className="w-3 h-3 text-amber-400" />
            <span>KODE: {roomCode}</span>
          </div>
          <button
            onClick={() => handleSwitchView('admin')}
            className="px-3 py-1 bg-[#093A6E] text-white font-extrabold rounded-lg hover:bg-blue-800 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Ke Panel Operator</span>
          </button>
        </div>

        <AudienceOverlay
          config={config}
          onNextSlide={handleNextSlide}
          onPrevSlide={handlePrevSlide}
          isEmbeddedPreview={false}
        />
      </div>
    );
  }

  // 2. ADMIN OPERATOR PANEL VIEW WITH VIEW SWITCHER & DIRECT URL LINKS
  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header Bar with View Switcher & Direct OBS URL Tools */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-extrabold text-[#093A6E] text-sm">Campus Ministry UAJY</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-300/80 px-2.5 py-1 rounded-lg">
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Kunci Sesi:</span>
            <span className="font-mono font-black text-amber-950 text-xs">{roomCode}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold">Real-Time Sync Aktif</span>
          </div>
        </div>

        {/* Quick URL Copy & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {copiedNotification && (
            <div className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 animate-bounce shadow-md">
              <Check className="w-3.5 h-3.5" />
              <span>{copiedNotification}</span>
            </div>
          )}

          {/* Quick Copy Buttons for both URLs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => copyUrl('audience')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs hover:text-[#093A6E]"
              title={`Salin URL OBS: .../?view=audience&code=${roomCode}`}
            >
              <Copy className="w-3.5 h-3.5 text-amber-500" />
              <span>Salin URL OBS</span>
            </button>
            <button
              onClick={() => copyUrl('operator')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs hover:text-[#093A6E]"
              title={`Salin URL Operator: .../?view=operator&code=${roomCode}`}
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>Salin URL Operator</span>
            </button>
          </div>

          {/* View Mode Toggle Pill */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleSwitchView('admin')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'admin'
                  ? 'bg-[#093A6E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel Operator</span>
            </button>

            <button
              onClick={() => handleSwitchView('audience')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'audience'
                  ? 'bg-[#093A6E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>Layar Audience (OBS)</span>
            </button>
          </div>
        </div>
      </div>

      <AdminPanel
        config={config}
        onChangeConfig={handleConfigChange}
        onOpenAudienceWindow={handleOpenAudienceWindow}
        onSwitchToAudienceView={() => handleSwitchView('audience')}
        roomCode={roomCode}
        onChangeRoomCode={handleRoomCodeChange}
        syncStatus={syncStatus}
      />
    </div>
  );
}
