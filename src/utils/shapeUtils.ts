import { LowerThirdShape } from '../types';

export const getLayoutShapeClass = (shape?: LowerThirdShape | string): string => {
  switch (shape) {
    case 'sharp':
      return 'rounded-[7px]';
    case 'bevel':
      return 'rounded-tl-3xl rounded-br-3xl rounded-tr-none rounded-bl-none';
    case 'pill':
      return 'rounded-[2rem] md:rounded-[2.5rem]';
    case 'rounded':
    default:
      return 'rounded-2xl md:rounded-3xl';
  }
};
