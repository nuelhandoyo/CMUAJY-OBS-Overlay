import type { CSSProperties } from 'react';
import { LowerThirdShape } from '../types';

export const getFrameBorderRadius = (shape?: LowerThirdShape | string): string => {
  switch (shape) {
    case 'bevel':
      return '28px 4px 28px 4px';
    case 'sharp':
    default:
      return '4px';
  }
};

/**
 * Returns consistent Tailwind CSS border-radius class for outer containers/frames
 * (Slide Canvas box, Camera box, Waiting screen main card, Full view frames, etc.)
 */
export const getLayoutShapeClass = (shape?: LowerThirdShape | string): string => {
  switch (shape) {
    case 'bevel':
      return 'rounded-tl-[28px] rounded-br-[28px] rounded-tr-[4px] rounded-bl-[4px]';
    case 'sharp':
    default:
      return 'rounded-[4px]';
  }
};

/**
 * Returns consistent Tailwind CSS border-radius class for inner boxes, PIP windows, countdown blocks, and cards
 */
export const getLayoutInnerShapeClass = (shape?: LowerThirdShape | string): string => {
  switch (shape) {
    case 'bevel':
      return 'rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px]';
    case 'sharp':
    default:
      return 'rounded-[4px]';
  }
};

/**
 * Returns consistent Tailwind CSS border-radius class for small tags, badges, and status pills
 */
export const getLayoutBadgeShapeClass = (shape?: LowerThirdShape | string): string => {
  switch (shape) {
    case 'bevel':
      return 'rounded-tl-md rounded-br-md rounded-tr-[2px] rounded-bl-[2px]';
    case 'sharp':
    default:
      return 'rounded-[4px]';
  }
};

/**
 * Returns standard inline style for frame borders and hardware-accelerated rounded corner clipping
 * across Slide Canvas, Camera Boxes, and PIP layers.
 */
export const getFrameBorderStyle = (
  showFrame: boolean = true,
  frameColor: string = '#093A6E',
  borderWidth: 'thin' | 'normal' | 'thick' | 'extra_thick' | string = 'normal',
  shape: LowerThirdShape | string = 'sharp'
): CSSProperties => {
  const getPx = (bw?: string) => {
    switch (bw) {
      case 'thin':
        return '2px';
      case 'thick':
        return '6px';
      case 'extra_thick':
        return '8px';
      case 'normal':
      default:
        return '4px';
    }
  };

  const pxWidth = getPx(borderWidth);
  const radius = getFrameBorderRadius(shape);

  return {
    borderWidth: showFrame ? pxWidth : '0px',
    borderColor: frameColor || '#093A6E',
    borderStyle: 'solid',
    borderRadius: radius,
    boxShadow: showFrame ? `0 0 25px ${(frameColor || '#093A6E')}40` : 'none',
    overflow: 'hidden',
    isolation: 'isolate',
    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
  };
};
