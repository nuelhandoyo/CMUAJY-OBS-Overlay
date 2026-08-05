import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { SlideCanvas } from '../overlay/SlideCanvas';
import { getLayoutShapeClass } from '../../utils/shapeUtils';

interface FullSlideWithPipViewProps {
  config: OverlayConfig;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const FullSlideWithPipView: React.FC<FullSlideWithPipViewProps> = ({
  config,
}) => {
  const shapeClass = getLayoutShapeClass(config.layoutShape);

  return (
    <div className="w-full h-full relative p-2 md:p-4 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      {/* 16:9 Slide Canvas Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`aspect-video max-h-full max-w-full w-full bg-slate-950 ${shapeClass} overflow-hidden relative shadow-2xl border-2 border-slate-700/80 flex items-center justify-center`}
      >
        <SlideCanvas config={config} isAudienceView={true} imageFitMode="contain" />

        {/* PIP Presenter Camera Overlay in Bottom Right Corner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 w-48 md:w-64 aspect-video ${shapeClass} overflow-hidden shadow-2xl border-2 border-amber-400/90 bg-slate-900 ring-4 ring-slate-950/40`}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={config.showCameraFrame}
            frameColor={config.frameBorderColor}
            borderWidth={config.frameBorderWidth}
            shape={config.layoutShape}
            className="w-full h-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
