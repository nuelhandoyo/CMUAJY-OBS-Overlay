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
  const shapeClass = getLayoutShapeClass(config.layoutShape);
  const slideBorderStyle = getFrameBorderStyle(
    config.showCameraFrame,
    config.frameBorderColor,
    config.frameBorderWidth,
    config.layoutShape
  );

  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      {/* 16:9 Presentation Slide Canvas Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`aspect-video max-h-full max-w-full w-full bg-slate-950 ${shapeClass} relative shadow-2xl flex items-center justify-center`}
        style={slideBorderStyle}
      >
        <SlideCanvas config={config} isAudienceView={true} imageFitMode="contain" className="w-full h-full" />
      </motion.div>
    </div>
  );
};
