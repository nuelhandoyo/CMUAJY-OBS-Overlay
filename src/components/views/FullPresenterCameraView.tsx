import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { CameraBox } from '../overlay/CameraBox';
import { getLayoutShapeClass, getFrameBorderStyle } from '../../utils/shapeUtils';

interface FullPresenterCameraViewProps {
  config: OverlayConfig;
}

export const FullPresenterCameraView: React.FC<FullPresenterCameraViewProps> = ({ config }) => {
  const isNoBorder = config.layoutMode === 'full_presenter_noborder';
  const shapeClass = isNoBorder ? 'rounded-none' : getLayoutShapeClass(config.layoutShape);
  const frameStyle = isNoBorder
    ? { borderRadius: '0px', borderWidth: '0px' }
    : getFrameBorderStyle(
        config.showCameraFrame,
        config.frameBorderColor,
        config.frameBorderWidth,
        config.layoutShape
      );

  const isCamera2 = config.primaryActiveCamera === 'camera2';
  const activeDeviceId = isCamera2 ? config.camera2DeviceId : config.camera1DeviceId;
  const isMirrored = isCamera2 ? config.camera2Mirrored : config.camera1Mirrored;
  const isActive = isCamera2 ? config.camera2Active !== false : config.camera1Active !== false;
  const label = isCamera2 ? (config.camera2Label || 'KAMERA 2') : (config.camera1Label || 'KAMERA 1');

  if (isNoBorder) {
    return (
      <div className="w-full h-full relative p-0 flex items-center justify-center bg-transparent font-sans overflow-hidden">
        {/* Full Screen Camera Area (Without Border / Edge-to-Edge) */}
        <motion.div
          key={`full-noborder-${config.primaryActiveCamera}-${config.cameraMode}-${activeDeviceId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="w-full h-full relative overflow-hidden rounded-none border-0 shadow-none"
        >
          <CameraBox
            cameraMode={config.cameraMode}
            deviceId={activeDeviceId}
            isMirrored={isMirrored}
            isActive={isActive}
            chromaColor={config.chromaColor}
            showFrame={false}
            shape="sharp"
            label={label}
            className="w-full h-full rounded-none"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      {/* Full Presenter Camera Area with Frame */}
      <motion.div
        key={`full-framed-${config.primaryActiveCamera}-${config.cameraMode}-${activeDeviceId}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`w-full h-full max-h-[940px] relative ${shapeClass} shadow-2xl flex items-center justify-center`}
        style={frameStyle}
      >
        <CameraBox
          cameraMode={config.cameraMode}
          deviceId={activeDeviceId}
          isMirrored={isMirrored}
          isActive={isActive}
          chromaColor={config.chromaColor}
          showFrame={false}
          shape={config.layoutShape}
          label={label}
          className="w-full h-full"
        />
      </motion.div>
    </div>
  );
};
