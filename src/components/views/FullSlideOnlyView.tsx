import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { SlideCanvas } from '../overlay/SlideCanvas';
import { getLayoutShapeClass, getFrameBorderStyle } from '../../utils/shapeUtils';

interface FullSlideOnlyViewProps {
  config: OverlayConfig;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const FullSlideOnlyView: React.FC<FullSlideOnlyViewProps> = ({
  config,
}) => {
  // If showCameraFrame is false (default) or layout is full_slide_noborder, render completely borderless edge-to-edge
  const isNoBorder = config.layoutMode === 'full_slide_noborder' || !config.showCameraFrame;
  const shapeClass = isNoBorder ? 'rounded-none' : getLayoutShapeClass(config.layoutShape);
  const slideBorderStyle = isNoBorder
    ? { borderRadius: '0px', borderWidth: '0px' }
    : getFrameBorderStyle(
        config.showCameraFrame,
        config.frameBorderColor,
        config.frameBorderWidth,
        config.layoutShape
      );

  if (isNoBorder) {
    return (
      <div className="w-full h-full relative p-0 m-0 flex items-center justify-center bg-black font-sans overflow-hidden">
        {/* Full Screen Slide Canvas - 100% Edge-to-Edge Without Border */}
        <motion.div
          key={`full-slide-noborder-${config.activeSlideIndex}-${config.slideSourceType}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="w-full h-full relative overflow-hidden rounded-none border-0 shadow-none flex items-center justify-center"
        >
          <SlideCanvas
            config={config}
            isAudienceView={true}
            imageFitMode={config.slideImageFit || 'contain'}
            className="w-full h-full rounded-none border-0"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      {/* 16:9 Presentation Slide Canvas Box with Frame Border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`aspect-video max-h-full max-w-full w-full bg-slate-950 ${shapeClass} relative shadow-2xl flex items-center justify-center`}
        style={slideBorderStyle}
      >
        <SlideCanvas
          config={config}
          isAudienceView={true}
          imageFitMode={config.slideImageFit || 'contain'}
          className="w-full h-full"
        />
      </motion.div>
    </div>
  );
};
