import React, { useEffect, useState } from 'react';
import { OverlayConfig } from './types';
import { loadOverlayConfig, saveOverlayConfig, subscribeOverlayConfig } from './utils/storageSync';
import { AdminPanel } from './components/AdminPanel';
import { AudienceOverlay } from './components/AudienceOverlay';
import { Monitor, Shield, Radio } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<OverlayConfig>(loadOverlayConfig());
  const [viewMode, setViewMode] = useState<'admin' | 'audience'>('admin');

  useEffect(() => {
    // Determine view mode from URL search query parameter (e.g., ?view=audience)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'audience' || window.location.pathname.startsWith('/audience')) {
      setViewMode('audience');
    }

    // Subscribe to cross-tab / cross-window real-time config updates
    const unsubscribe = subscribeOverlayConfig((newConfig) => {
      setConfig(newConfig);
    });

    return () => {
      unsubscribe();
    };
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
  if (viewMode === 'audience') {
    return (
      <div className="w-screen h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Toggle Bar on hover at top right in case user opened in main window */}
        <div className="fixed top-2 right-2 z-50 opacity-0 hover:opacity-100 transition-opacity bg-white/95 border border-slate-300 p-1.5 rounded-xl text-xs flex items-center gap-2 text-slate-800 backdrop-blur-md shadow-xl">
          <button
            onClick={() => setViewMode('admin')}
            className="px-3 py-1 bg-[#093A6E] text-white font-extrabold rounded-lg hover:bg-blue-900 cursor-pointer flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Ke Panel Admin</span>
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

  // 2. ADMIN OPERATOR PANEL VIEW WITH VIEW SWITCHER
  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navigation Bar to switch views in Light Mode */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="font-extrabold text-[#093A6E]">Campus Ministry UAJY — Stream Overlay</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Misa Katolik, Seminar & Workshop</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('admin')}
            className={`px-3.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'admin'
                ? 'bg-[#093A6E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Halaman Admin</span>
          </button>

          <button
            onClick={() => setViewMode('audience')}
            className={`px-3.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'audience'
                ? 'bg-[#093A6E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Tampilan Audience (Fullscreen OBS)</span>
          </button>
        </div>
      </div>

      <AdminPanel
        config={config}
        onChangeConfig={handleConfigChange}
        onOpenAudienceWindow={handleOpenAudienceWindow}
      />
    </div>
  );
}
