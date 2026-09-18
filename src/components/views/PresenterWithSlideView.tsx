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

  const isLeftCamera = config.slide1LeftContentType === 'camera';
  const leftCameraIsCam1 = config.slide1LeftCameraSource === 'camera1';

  // Left source (70% 16:9 box):
  const leftCameraDeviceId = leftCameraIsCam1 ? config.camera1DeviceId : config.camera2DeviceId;
  const leftCameraMirrored = leftCameraIsCam1 ? config.camera1Mirrored : config.camera2Mirrored;
  const leftCameraActive = leftCameraIsCam1 ? (config.camera1Active !== false) : (config.camera2Active !== false);
  const leftCameraLabel = leftCameraIsCam1
    ? (config.camera1Label || 'KAMERA 1 (UTAMA)')
    : (config.camera2Label || 'KAMERA 2 (TAMU)');

  // Right column (30% vertical box):
  // When left is using Camera 1, right automatically uses Camera 2 so two distinct cameras are shown.
  // Otherwise, right uses Camera 1.
  const rightUsesCamera2 = isLeftCamera && leftCameraIsCam1;
  const rightCameraDeviceId = rightUsesCamera2 ? config.camera2DeviceId : config.camera1DeviceId;
  const rightCameraMirrored = rightUsesCamera2 ? config.camera2Mirrored : config.camera1Mirrored;
  const rightCameraActive = rightUsesCamera2 ? (config.camera2Active !== false) : (config.camera1Active !== false);
  const rightCameraLabel = rightUsesCamera2
    ? (config.camera2Label || 'KAMERA 2 (TAMU)')
    : (config.camera1Label || 'KAMERA 1 (UTAMA)');

  return (
    <div className="w-full h-full relative p-8 flex items-center justify-center bg-transparent font-sans overflow-hidden">
      <div className="w-full max-w-full flex items-stretch justify-center gap-6 overflow-hidden">
        {/* LEFT / MAIN COLUMN: Presentation Slide Box OR Camera Box (7:3 Proportions -> 70% Width, Strictly 16:9 Aspect Ratio) */}
        <motion.div
          key={`left-col-${isLeftCamera ? 'camera' : 'slide'}-${leftCameraDeviceId || 'default'}`}
          initial={{ opacity: 0, scale: 0.96, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`flex-[7] min-w-0 aspect-video bg-slate-950 ${shapeClass} relative flex flex-col shrink-0 shadow-2xl overflow-hidden`}
          style={frameStyle}
        >
          {isLeftCamera ? (
            <CameraBox
              cameraMode={config.cameraMode}
              deviceId={leftCameraDeviceId}
              isMirrored={leftCameraMirrored}
              isActive={leftCameraActive}
              chromaColor={config.chromaColor}
              showFrame={false}
              shape={config.layoutShape}
              label={leftCameraLabel}
              className="w-full h-full"
            />
          ) : (
            <SlideCanvas
              config={config}
              isAudienceView={true}
              imageFitMode={config.slideImageFit || 'contain'}
              className="w-full h-full"
            />
          )}
        </motion.div>

        {/* RIGHT COLUMN: Presenter Camera Box (7:3 Proportions -> 30% Width, Height cleanly matches the 16:9 Slide box) */}
        <motion.div
          key={`right-col-${rightCameraDeviceId || 'default'}`}
          initial={{ opacity: 0, scale: 0.96, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className={`flex-[3] min-w-0 self-stretch ${shapeClass} relative shrink-0 shadow-2xl flex items-center justify-center overflow-hidden`}
          style={frameStyle}
        >
          <CameraBox
            cameraMode={config.cameraMode}
            deviceId={rightCameraDeviceId}
            isMirrored={rightCameraMirrored}
            isActive={rightCameraActive}
            chromaColor={config.chromaColor}
            showFrame={false}
            shape={config.layoutShape}
            label={rightCameraLabel}
            className="w-full h-full"
          />
        </motion.div>
      </div>
    </div>
  );
};
