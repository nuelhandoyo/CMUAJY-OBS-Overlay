import React from 'react';
import { CameraMode, LowerThirdShape } from '../../types';
import { getLayoutShapeClass, getFrameBorderStyle } from '../../utils/shapeUtils';

interface CameraBoxProps {
  cameraMode: CameraMode;
  chromaColor?: string;
  showFrame?: boolean;
  frameColor?: string;
  borderWidth?: 'thin' | 'normal' | 'thick' | 'extra_thick' | string;
  shape?: LowerThirdShape;
  label?: string;
  className?: string;
}

export const CameraBox: React.FC<CameraBoxProps> = ({
  cameraMode,
  chromaColor = '#00FF00',
  showFrame = false,
  frameColor = '#3B82F6',
  borderWidth = 'normal',
  shape = 'rounded',
  className = 'w-full h-full',
}) => {
  const shapeClass = getLayoutShapeClass(shape);
  const borderStyle = getFrameBorderStyle(showFrame, frameColor, borderWidth, shape);

  return (
    <div
      className={`relative ${shapeClass} overflow-hidden transition-all duration-300 flex items-center justify-center ${className}`}
      style={{
        ...borderStyle,
        borderRadius: 'inherit',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      }}
    >
      {/* 1. CHROMA GREEN (#00FF00) MODE */}
      {cameraMode === 'chroma_green' && (
        <div
          className="w-full h-full"
          style={{ backgroundColor: chromaColor || '#00FF00', borderRadius: 'inherit' }}
        />
      )}

      {/* 2. TRANSPARENT MODE */}
      {cameraMode === 'transparent' && (
        <div
          className="w-full h-full bg-transparent relative flex items-center justify-center border-2 border-dashed border-slate-500/30"
          style={{ borderRadius: 'inherit' }}
        >
          <div className="bg-slate-900/70 text-slate-300 text-xs px-3 py-1 rounded-md backdrop-blur-sm">
            Area Transparan (Cutout OBS)
          </div>
        </div>
      )}
    </div>
  );
};
