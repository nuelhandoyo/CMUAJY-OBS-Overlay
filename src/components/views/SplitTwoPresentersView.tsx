import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { getLayoutShapeClass, getFrameBorderStyle } from '../../utils/shapeUtils';

interface SplitTwoPresentersViewProps {
  config: OverlayConfig;
}

export const SplitTwoPresentersView: React.FC<SplitTwoPresentersViewProps> = ({ config }) => {
  const shapeClass = getLayoutShapeClass(config.layoutShape);
  const frameStyle1 = getFrameBorderStyle(
    config.showCameraFrame,
    config.frameBorderColor,
    config.frameBorderWidth,
    config.layoutShape
  );
  const frameStyle2 = getFrameBorderStyle(
    config.showCameraFrame,
    config.frameBorderColor || '#0284C7',
    config.frameBorderWidth,
    config.layoutShape
  );

  return (
    <div className="w-full h-full relative p-8 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      <div className="w-full h-full flex items-center justify-center gap-8 overflow-hidden">
        {/* Presenter 1 / Host */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 aspect-video max-h-[850px] ${shapeClass} relative flex items-center justify-center`}
          style={frameStyle1}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={false}
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
          className={`flex-1 aspect-video max-h-[850px] ${shapeClass} relative flex items-center justify-center`}
          style={frameStyle2}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={false}
            shape={config.layoutShape}
            label="PEMBICARA 2 / MODERATOR"
            className="w-full h-full"
          />
        </motion.div>
      </div>
    </div>
  );
};
