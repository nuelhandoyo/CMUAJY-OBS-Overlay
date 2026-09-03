import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OverlayConfig } from '../../types';
import { getCanvaEmbedUrl } from '../../utils/canva';
import { Layers } from 'lucide-react';

interface SlideCanvasProps {
  config: OverlayConfig;
  isAudienceView?: boolean;
  className?: string;
  imageFitMode?: 'cover' | 'contain';
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  config,
  isAudienceView = true,
  className = '',
  imageFitMode = 'contain',
}) => {
  const isChromaMode = config.slideSourceType === 'chroma_green';
  const chromaBgColor = config.slideChromaColor || config.chromaColor || '#00FF00';
  const isCanvaMode = config.slideSourceType === 'canva_embed';
  const canvaEmbedSrc = getCanvaEmbedUrl(config.canvaUrl);
  const currentSlide = config.slides[config.activeSlideIndex] || config.slides[0];
  const shouldHideControls = isAudienceView && config.hideCanvaControlsOnAudience !== false;

  if (isChromaMode) {
    return (
      <div
        className={`relative w-full h-full overflow-hidden flex items-center justify-center font-sans ${className}`}
        style={{
          backgroundColor: chromaBgColor,
          borderRadius: 'inherit',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        }}
      >
        {!isAudienceView && (
          <div className="bg-slate-900/95 backdrop-blur-md text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 border border-emerald-500/40 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Slide Box: Chroma Green ({chromaBgColor})</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center ${className}`}
      style={{
        borderRadius: 'inherit',
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      }}
    >
      <AnimatePresence mode="wait">
        {isCanvaMode ? (
          <motion.div
            key="canva-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center"
            style={{
              borderRadius: 'inherit',
              overflow: 'hidden',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            }}
          >
            {shouldHideControls ? (
              /* Audience View: Clip Canva bottom controls/page numbers cleanly */
              <iframe
                src={canvaEmbedSrc}
                title="Canva Presentation Audience View"
                className="w-full h-[calc(100%+48px)] -mb-[48px] border-0 aspect-video pointer-events-auto"
                style={{
                  borderRadius: 'inherit',
                  border: 'none',
                }}
                allow="fullscreen"
                allowFullScreen
              />
            ) : (
              /* Operator / Unclipped View */
              <iframe
                src={canvaEmbedSrc}
                title="Canva Presentation View"
                className="w-full h-full border-0 aspect-video"
                style={{
                  borderRadius: 'inherit',
                  border: 'none',
                }}
                allow="fullscreen"
                allowFullScreen
              />
            )}
          </motion.div>
        ) : currentSlide?.imageUrl ? (
          <motion.div
            key="image-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: 'inherit',
              overflow: 'hidden',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.id || currentSlide.imageUrl || config.activeSlideIndex}
                src={currentSlide.imageUrl}
                alt={currentSlide.title || 'Slide Image'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className={`w-full h-full aspect-video ${
                  imageFitMode === 'cover' ? 'object-cover' : 'object-contain'
                }`}
                style={{
                  borderRadius: 'inherit',
                }}
              />
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-900 w-full h-full"
            style={{ borderRadius: 'inherit' }}
          >
            <Layers className="w-16 h-16 mb-3 text-slate-500 animate-pulse" />
            <p className="font-bold text-lg text-slate-200">Tampilan Slide Presentasi</p>
            <p className="text-sm mt-1 text-slate-400">
              Pilih atau masukkan link Canva / Gambar melalui Panel Admin
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
