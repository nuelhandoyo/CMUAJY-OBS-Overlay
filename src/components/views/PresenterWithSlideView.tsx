import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { SlideCanvas } from '../overlay/SlideCanvas';
import { getLayoutShapeClass, getFrameBorderStyle } from '../../utils/shapeUtils';

interface PresenterWithSlideViewProps {
  config: OverlayConfig;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const PresenterWithSlideView: React.FC<PresenterWithSlideViewProps> = ({
  config,
}) => {
  const shapeClass = getLayoutShapeClass(config.layoutShape);
  const frameStyle = getFrameBorderStyle(
    config.showCameraFrame,
    config.frameBorderColor,
    config.frameBorderWidth,
    config.layoutShape
  );

  return (
    <div className="w-full h-full relative p-8 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      <div className="w-full max-w-full flex items-stretch justify-center gap-6 overflow-hidden">
        {/* LEFT / MAIN COLUMN: Presentation Slide Box (7:3 Proportions -> 70% Width, Strictly 16:9 Aspect Ratio) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`flex-[7] min-w-0 aspect-video bg-slate-950 ${shapeClass} relative flex flex-col shrink-0 shadow-2xl`}
          style={frameStyle}
        >
          <SlideCanvas config={config} isAudienceView={true} imageFitMode="contain" className="w-full h-full" />
        </motion.div>

        {/* RIGHT COLUMN: Presenter Camera Box (7:3 Proportions -> 30% Width, Height cleanly matches the 16:9 Slide box) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className={`flex-[3] min-w-0 self-stretch ${shapeClass} relative shrink-0 shadow-2xl flex items-center justify-center`}
          style={frameStyle}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={false}
            shape={config.layoutShape}
            className="w-full h-full"
          />
        </motion.div>
      </div>
    </div>
  );
};
