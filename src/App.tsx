import React, { useEffect, useState, useCallback } from 'react';
import { OverlayConfig } from './types';
import { loadOverlayConfig, saveOverlayConfig, subscribeOverlayConfig } from './utils/storageSync';
import { AdminPanel } from './components/AdminPanel';
import { AudienceOverlay } from './components/AudienceOverlay';
import { Monitor, Shield, Radio, Copy, Check, ExternalLink } from 'lucide-react';

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
  const [config, setConfig] = useState<OverlayConfig>(loadOverlayConfig());
  const [viewMode, setViewMode] = useState<'admin' | 'audience'>(detectViewMode);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Sync viewMode with browser history (popstate / hashchange)
  useEffect(() => {
    const handleUrlChange = () => {
      setViewMode(detectViewMode());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Subscribe to cross-tab / cross-window real-time config updates
    const unsubscribe = subscribeOverlayConfig((newConfig) => {
      setConfig(newConfig);
    });

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      unsubscribe();
    };
  }, []);

  const handleSwitchView = useCallback((newMode: 'admin' | 'audience') => {
    setViewMode(newMode);
    try {
      const url = new URL(window.location.href);
      if (newMode === 'audience') {
        url.searchParams.set('view', 'audience');
      } else {
        url.searchParams.set('view', 'operator');
      }
      window.history.pushState({ view: newMode }, '', url.toString());
    } catch (e) {
      console.warn('Unable to pushState:', e);
    }
  }, []);

  const handleConfigChange = (newConfig: OverlayConfig) => {
    setConfig(newConfig);
    saveOverlayConfig(newConfig);
  };

  // Admin Heartbeat for Leader Election (prevents multi-tab race conditions)
  useEffect(() => {
    if (viewMode === 'admin') {
      const heartbeat = setInterval(() => {
        try {
          localStorage.setItem('admin_last_active', Date.now().toString());
        } catch (e) {
          // ignore
        }
      }, 2000);
      try {
        localStorage.setItem('admin_last_active', Date.now().toString());
      } catch (e) {}
      return () => clearInterval(heartbeat);
    }
  }, [viewMode]);

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
      // Check if this window should advance (Admin window or standalone Audience window)
      if (viewMode === 'audience') {
        const lastActive = Number(localStorage.getItem('admin_last_active') || '0');
        if (Date.now() - lastActive <= 5000) {
          // Admin panel is currently active in another window, let Admin handle advancing
          return;
        }
      }

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
        saveOverlayConfig(updated);
        return updated;
      });
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [
    config.autoAdvanceSlides,
    config.autoAdvanceIntervalSeconds,
    config.slideSourceType,
    config.slides?.length,
    viewMode,
  ]);

  const handleOpenAudienceWindow = () => {
    const audienceUrl = `${window.location.origin}${window.location.pathname}?view=audience`;
    window.open(audienceUrl, 'OBS_Audience_Overlay_Window', 'width=1920,height=1080');
  };

  const copyUrl = (type: 'audience' | 'operator') => {
    const param = type === 'audience' ? '?view=audience' : '?view=operator';
    const targetUrl = `${window.location.origin}${window.location.pathname}${param}`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedNotification(type === 'audience' ? 'URL OBS (Audience) Tersalin!' : 'URL Operator Tersalin!');
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
  // Clean 100% full-screen output for OBS Studio
  if (viewMode === 'audience') {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden relative select-none">
        {/* Discreet hover utility for testing inside standard browsers (invisible on stream) */}
        <div className="fixed top-2 right-2 z-50 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl text-xs flex items-center gap-2 text-white backdrop-blur-md shadow-2xl">
          <span className="text-[11px] text-amber-400 font-bold px-1.5">OBS Mode (?view=audience)</span>
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
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="font-extrabold text-[#093A6E] text-sm">Campus Ministry UAJY</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 font-medium hidden sm:inline">Stream Overlay System</span>
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
              title="Salin URL OBS: .../?view=audience"
            >
              <Copy className="w-3.5 h-3.5 text-amber-500" />
              <span>Salin URL OBS (?view=audience)</span>
            </button>
            <button
              onClick={() => copyUrl('operator')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs hover:text-[#093A6E]"
              title="Salin URL Operator: .../?view=operator"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>Salin URL Operator (?view=operator)</span>
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
      />
    </div>
  );
}

