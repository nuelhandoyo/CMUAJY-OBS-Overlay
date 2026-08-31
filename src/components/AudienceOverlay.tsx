import React, { useRef, useState, useEffect } from 'react';
import { OverlayConfig } from '../types';
import { LowerThird } from './overlay/LowerThird';
import { TickerBar } from './overlay/TickerBar';
import { FuturisticBackground } from './overlay/FuturisticBackground';
import { PresenterWithSlideView } from './views/PresenterWithSlideView';
import { SlideWithTwoPresentersView } from './views/SlideWithTwoPresentersView';
import { FullSlideWithPipView } from './views/FullSlideWithPipView';
import { FullSlideOnlyView } from './views/FullSlideOnlyView';
import { FullPresenterCameraView } from './views/FullPresenterCameraView';
import { SplitTwoPresentersView } from './views/SplitTwoPresentersView';
import { WaitingScreenView } from './views/WaitingScreenView';
import { getLogoSizeClass } from '../utils/fontColorUtils';

interface AudienceOverlayProps {
  config: OverlayConfig;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  isEmbeddedPreview?: boolean;
}

export const AudienceOverlay: React.FC<AudienceOverlayProps> = ({
  config,
  onNextSlide,
  onPrevSlide,
  isEmbeddedPreview = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  // Dynamic Resolution Scaling Engine:
  // Automatically scales the canonical 1920x1080 stage to fit any screen resolution
  // perfectly, including 4K UHD (3840x2160), 2K QHD (2560x1440), 1080p FHD, and admin preview containers.
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      const scaleX = clientWidth / 1920;
      const scaleY = clientHeight / 1080;
      const calculatedScale = Math.min(scaleX, scaleY);
      setScale(calculatedScale > 0 ? calculatedScale : 1);
    };

    updateScale();

    // Use ResizeObserver for accurate sizing inside containers/OBS browser source
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateScale);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const logoSizeClass = getLogoSizeClass(config.logoSize);
  const opacity = config.logoOpacity !== undefined ? config.logoOpacity : 1.0;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden flex items-center justify-center bg-black select-none ${
        isEmbeddedPreview ? 'rounded-2xl border-2 border-slate-700 shadow-2xl aspect-video' : 'fixed inset-0'
      }`}
    >
      {/* 
        CANONICAL 1920x1080 HIGH-FIDELITY / 4K SCALED STAGE
        Scales up seamlessly to 4K (2.0x) or 1440p (1.33x) with ultra-sharp vector graphics, 
        smooth fonts, and precise broadcast proportions.
      */}
      <div
        className="w-[1920px] h-[1080px] shrink-0 relative flex flex-col font-sans overflow-hidden bg-[#030712]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Futuristic Animated Technology Background */}
        <FuturisticBackground backgroundUrl={config.backgroundUrl} />

        {/* Top Logo Watermark Overlay */}
        {config.showLogos && config.layoutMode !== 'waiting' && (
          <div className="absolute top-5 left-8 right-8 z-30 pointer-events-none flex items-center justify-between">
            {(config.logoPosition === 'top_left' || config.logoPosition === 'both_corners') &&
              config.activeLogoUrl && (
                <div
                  className={`transition-all duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] ${logoSizeClass}`}
                  style={{ opacity }}
                >
                  {config.activeLogoUrl.startsWith('<svg') ? (
                    <div
                      className="w-full h-full flex items-center"
                      dangerouslySetInnerHTML={{ __html: config.activeLogoUrl }}
                    />
                  ) : (
                    <img
                      src={config.activeLogoUrl}
                      alt="Logo 1"
                      className="h-full w-auto object-contain"
                    />
                  )}
                </div>
              )}

            <div className="flex-1" />

            {(config.logoPosition === 'top_right' || config.logoPosition === 'both_corners') &&
              config.secondLogoUrl && (
                <div
                  className={`transition-all duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] ${logoSizeClass}`}
                  style={{ opacity }}
                >
                  {config.secondLogoUrl.startsWith('<svg') ? (
                    <div
                      className="w-full h-full flex items-center"
                      dangerouslySetInnerHTML={{ __html: config.secondLogoUrl }}
                    />
                  ) : (
                    <img
                      src={config.secondLogoUrl}
                      alt="Logo 2"
                      className="h-full w-auto object-contain"
                    />
                  )}
                </div>
              )}
          </div>
        )}

        {/* Selected Layout View Layer */}
        <div className="w-full flex-1 min-h-0 relative overflow-hidden z-10">
          {config.layoutMode === 'presenter_slide' && (
            <PresenterWithSlideView
              config={config}
              onNextSlide={onNextSlide}
              onPrevSlide={onPrevSlide}
            />
          )}

          {config.layoutMode === 'slide_two_presenters' && (
            <SlideWithTwoPresentersView
              config={config}
              onNextSlide={onNextSlide}
              onPrevSlide={onPrevSlide}
            />
          )}

          {config.layoutMode === 'full_slide_pip' && (
            <FullSlideWithPipView
              config={config}
              onNextSlide={onNextSlide}
              onPrevSlide={onPrevSlide}
            />
          )}

          {config.layoutMode === 'full_slide_only' && (
            <FullSlideOnlyView
              config={config}
              onNextSlide={onNextSlide}
              onPrevSlide={onPrevSlide}
            />
          )}

          {(config.layoutMode === 'full_presenter' || config.layoutMode === 'full_presenter_noborder') && (
            <FullPresenterCameraView config={config} />
          )}

          {config.layoutMode === 'split_two' && (
            <SplitTwoPresentersView config={config} />
          )}

          {config.layoutMode === 'waiting' && (
            <WaitingScreenView config={config} />
          )}

          {/* Lower Third Layer (Inside main stage, above ticker) */}
          <LowerThird config={config} />
        </div>

        {/* Ticker Layer at bottom */}
        <TickerBar config={config} />
      </div>
    </div>
  );
};

