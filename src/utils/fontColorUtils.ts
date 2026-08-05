import { LowerThirdFont } from '../types';

export const getFontFamilyClass = (font?: LowerThirdFont | string): string => {
  switch (font) {
    case 'poppins':
      return 'font-sans tracking-wide font-semibold';
    case 'oswald':
      return 'font-sans tracking-widest uppercase font-black';
    case 'display':
      return 'font-sans font-black tracking-wider uppercase';
    case 'mono':
      return 'font-mono';
    case 'sans':
    default:
      return 'font-sans';
  }
};

export const getFrameBorderWidthClass = (width?: string): string => {
  switch (width) {
    case 'thin':
      return 'border-[2px]';
    case 'thick':
      return 'border-[6px]';
    case 'extra_thick':
      return 'border-[8px]';
    case 'normal':
    default:
      return 'border-[4px]';
  }
};

export const getLogoSizeClass = (size?: string): string => {
  switch (size) {
    case 'small':
      return 'h-7 md:h-10 max-w-[120px] md:max-w-[160px]';
    case 'large':
      return 'h-14 md:h-20 max-w-[200px] md:max-w-[280px]';
    case 'medium':
    default:
      return 'h-10 md:h-14 max-w-[160px] md:max-w-[220px]';
  }
};
