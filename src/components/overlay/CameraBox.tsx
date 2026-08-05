import React from 'react';
import { CameraMode, LowerThirdShape } from '../../types';
import { getLayoutShapeClass } from '../../utils/shapeUtils';

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
  showFrame = true,
  frameColor = '#3B82F6',
  borderWidth = 'normal',
  shape = 'rounded',
  className = 'w-full h-full',
}) => {
  const shapeClass = getLayoutShapeClass(shape);

  const getPxWidth = (bw?: string) => {
    switch (bw) {
      case 'thin': return '2px';
      case 'thick': return '6px';
      case 'extra_thick': return '8px';
      case 'normal':
      default: return '4px';
    }
  };

  const pxWidth = getPxWidth(borderWidth);

  return (
    <div
      className={`relative ${shapeClass} overflow-hidden shadow-2xl transition-all duration-300 flex items-center justify-center ${className}`}
      style={{
        borderWidth: showFrame ? pxWidth : '0px',
        borderColor: frameColor,
        boxShadow: showFrame ? `0 0 25px ${frameColor}40` : 'none',
      }}
    >
      {/* 1. CHROMA GREEN (#00FF00) MODE */}
      {cameraMode === 'chroma_green' && (
        <div
          className="w-full h-full"
          style={{ backgroundColor: chromaColor || '#00FF00' }}
        />
      )}

      {/* 2. TRANSPARENT MODE */}
      {cameraMode === 'transparent' && (
        <div className="w-full h-full bg-transparent relative flex items-center justify-center border-2 border-dashed border-slate-500/30">
          <div className="bg-slate-900/70 text-slate-300 text-xs px-3 py-1 rounded-md backdrop-blur-sm">
            Area Transparan (Cutout OBS)
          </div>
        </div>
      )}
    </div>
  );
};
