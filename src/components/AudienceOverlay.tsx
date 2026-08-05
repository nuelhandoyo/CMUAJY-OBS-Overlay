import React from 'react';
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
  const logoSizeClass = getLogoSizeClass(config.logoSize);
  const opacity = config.logoOpacity !== undefined ? config.logoOpacity : 1.0;

  return (
    <div
      className={`relative w-full h-full font-sans overflow-hidden select-none flex flex-col ${
        isEmbeddedPreview ? 'rounded-2xl border-2 border-slate-700 shadow-2xl' : 'fixed inset-0'
      }`}
      style={{
        aspectRatio: '16/9',
      }}
    >
      {/* Futuristic Animated Technology Background */}
      <FuturisticBackground backgroundUrl={config.backgroundUrl} />

      {/* Top Logo Watermark Overlay */}
      {config.showLogos && config.layoutMode !== 'waiting' && (
        <div className="absolute top-3 left-4 right-4 z-30 pointer-events-none flex items-center justify-between">
          {(config.logoPosition === 'top_left' || config.logoPosition === 'both_corners') &&
            config.activeLogoUrl && (
              <div
                className={`transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${logoSizeClass}`}
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
                className={`transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${logoSizeClass}`}
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
  );
};
