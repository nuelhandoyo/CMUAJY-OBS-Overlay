import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { SlideCanvas } from '../overlay/SlideCanvas';
import { getLayoutShapeClass } from '../../utils/shapeUtils';

interface SlideWithTwoPresentersViewProps {
  config: OverlayConfig;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const SlideWithTwoPresentersView: React.FC<SlideWithTwoPresentersViewProps> = ({
  config,
}) => {
  const shapeClass = getLayoutShapeClass(config.layoutShape);

  return (
    <div className="w-full h-full relative p-3 md:p-5 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      <div className="w-full max-w-7xl max-h-full flex items-stretch justify-center gap-3 md:gap-5 overflow-hidden">
        {/* LEFT / MAIN COLUMN: Presentation Slide Box (16:9 Aspect Ratio) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`aspect-video max-h-full max-w-[70%] w-full bg-slate-950 ${shapeClass} overflow-hidden border-2 border-slate-700/80 shadow-[0_15px_40px_rgba(15,23,42,0.3)] relative flex flex-col shrink-0`}
        >
          <SlideCanvas config={config} isAudienceView={true} imageFitMode="contain" />
        </motion.div>

        {/* RIGHT COLUMN: 2 Presenter Camera Boxes (Stacked Vertically) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="w-[30%] max-w-[340px] flex flex-col gap-2 md:gap-3 shrink-0 self-stretch justify-between"
        >
          {/* Top Camera: Presenter 1 */}
          <div className={`flex-1 w-full min-h-0 bg-slate-950 ${shapeClass} overflow-hidden border-2 border-slate-700/80 shadow-[0_10px_25px_rgba(15,23,42,0.3)] relative`}>
            <CameraBox
              cameraMode={config.cameraMode}
              chromaColor={config.chromaColor}
              showFrame={config.showCameraFrame}
              frameColor={config.frameBorderColor}
              borderWidth={config.frameBorderWidth}
              shape={config.layoutShape}
              label="PEMBICARA 1"
              className="w-full h-full"
            />
          </div>

          {/* Bottom Camera: Presenter 2 */}
          <div className={`flex-1 w-full min-h-0 bg-slate-950 ${shapeClass} overflow-hidden border-2 border-slate-700/80 shadow-[0_10px_25px_rgba(15,23,42,0.3)] relative`}>
            <CameraBox
              cameraMode={config.cameraMode}
              chromaColor={config.chromaColor}
              showFrame={config.showCameraFrame}
              frameColor="#0284C7"
              borderWidth={config.frameBorderWidth}
              shape={config.layoutShape}
              label="PEMBICARA 2"
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
