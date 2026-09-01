import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { SlideCanvas } from '../overlay/SlideCanvas';
import { getLayoutShapeClass, getFrameBorderStyle, getLayoutInnerShapeClass } from '../../utils/shapeUtils';

interface FullSlideWithPipViewProps {
  config: OverlayConfig;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const FullSlideWithPipView: React.FC<FullSlideWithPipViewProps> = ({
  config,
}) => {
  const shapeClass = getLayoutShapeClass(config.layoutShape);
  const pipShapeClass = getLayoutInnerShapeClass(config.layoutShape);
  const slideBorderStyle = getFrameBorderStyle(
    config.showCameraFrame,
    config.frameBorderColor,
    config.frameBorderWidth,
    config.layoutShape
  );
  const pipBorderStyle = getFrameBorderStyle(
    config.showCameraFrame,
    config.frameBorderColor,
    'normal',
    config.layoutShape
  );

  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      {/* 16:9 Slide Canvas Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`aspect-video max-h-full max-w-full w-full bg-slate-950 ${shapeClass} relative shadow-2xl flex items-center justify-center`}
        style={slideBorderStyle}
      >
        <SlideCanvas config={config} isAudienceView={true} imageFitMode="contain" className="w-full h-full" />

        {/* PIP Presenter Camera Overlay in Bottom Right Corner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className={`absolute bottom-6 right-6 z-20 w-80 aspect-video ${pipShapeClass} shadow-2xl bg-slate-900 ring-4 ring-slate-950/40 flex items-center justify-center`}
          style={pipBorderStyle}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={false}
            shape={config.layoutShape}
            className="w-full h-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
