import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { getLayoutShapeClass } from '../../utils/shapeUtils';

interface SplitTwoPresentersViewProps {
  config: OverlayConfig;
}

export const SplitTwoPresentersView: React.FC<SplitTwoPresentersViewProps> = ({ config }) => {
  const shapeClass = getLayoutShapeClass(config.layoutShape);

  return (
    <div className="w-full h-full relative p-3 md:p-5 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      <div className="w-full max-w-6xl max-h-full flex items-center justify-center gap-4 md:gap-6 overflow-hidden">
        {/* Presenter 1 / Host */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 max-w-[48%] aspect-video ${shapeClass} overflow-hidden border-2 border-slate-700/80 shadow-xl relative`}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={config.showCameraFrame}
            frameColor={config.frameBorderColor}
            borderWidth={config.frameBorderWidth}
            shape={config.layoutShape}
            label="PEMBICARA 1 / HOST"
            className="w-full h-full"
          />
        </motion.div>

        {/* Presenter 2 / Guest */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`flex-1 max-w-[48%] aspect-video ${shapeClass} overflow-hidden border-2 border-slate-700/80 shadow-xl relative`}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={config.showCameraFrame}
            frameColor="#0284C7"
            borderWidth={config.frameBorderWidth}
            shape={config.layoutShape}
            label="PEMBICARA 2 / MODERATOR"
            className="w-full h-full"
          />
        </motion.div>
      </div>
    </div>
  );
};
