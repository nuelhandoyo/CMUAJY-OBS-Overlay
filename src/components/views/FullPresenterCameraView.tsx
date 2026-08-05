import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { getLayoutShapeClass } from '../../utils/shapeUtils';

interface FullPresenterCameraViewProps {
  config: OverlayConfig;
}

export const FullPresenterCameraView: React.FC<FullPresenterCameraViewProps> = ({ config }) => {
  const isNoBorder = config.layoutMode === 'full_presenter_noborder';
  const shapeClass = isNoBorder ? 'rounded-none' : getLayoutShapeClass(config.layoutShape);

  if (isNoBorder) {
    return (
      <div className="w-full h-full relative p-0 flex items-center justify-center bg-transparent font-sans overflow-hidden">
        {/* Full Screen Camera Area (Without Border / Edge-to-Edge) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full relative overflow-hidden rounded-none border-0 shadow-none"
        >
          <CameraBox
            cameraMode={config.cameraMode}
            chromaColor={config.chromaColor}
            showFrame={false}
            frameColor={config.frameBorderColor}
            borderWidth="0px"
            shape="sharp"
            className="w-full h-full rounded-none"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative p-2 md:p-4 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      {/* Full Presenter Camera Area with Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full h-full max-w-7xl relative overflow-hidden ${shapeClass} border-2 border-slate-700/80 shadow-2xl`}
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
    </div>
  );
};

