import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OverlayConfig, Speaker } from '../../types';

import { getFontFamilyClass } from '../../utils/fontColorUtils';

interface LowerThirdProps {
  config: OverlayConfig;
  speakerOverride?: Speaker;
  positionClass?: string;
}

const getShapeClass = (shape?: string) => {
  switch (shape) {
    case 'bevel':
      return {
        container: 'rounded-tl-2xl rounded-br-2xl rounded-tr-[4px] rounded-bl-[4px]',
        tag: 'rounded-tl-xl rounded-br-xl rounded-tr-[4px] rounded-bl-[4px]',
        accentPill: 'rounded-[4px]',
        card: 'rounded-tl-xl rounded-br-xl rounded-tr-[4px] rounded-bl-[4px]',
      };
    case 'sharp':
    default:
      return {
        container: 'rounded-[4px]',
        tag: 'rounded-[4px]',
        accentPill: 'rounded-[4px]',
        card: 'rounded-[4px]',
      };
  }
};

const getFontClass = (font?: string) => {
  return getFontFamilyClass(font);
};

const getColorPalette = (color?: string, themePreset?: 'cream' | 'dark' | 'frosted_light') => {
  if (themePreset === 'frosted_light' || color === 'frosted_white') {
    return {
      bg: 'bg-white/85 text-slate-900 border-2 border-white shadow-[0_15px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl',
      borderLeft: 'border-l-8 border-l-slate-900',
      nameText: 'text-slate-950 font-black',
      titleText: 'text-slate-700 font-semibold',
      tagBg: 'bg-slate-900 text-white shadow-sm font-black',
      dockedBg: 'bg-white/90 border-t-4 border-b-2 border-white text-slate-900 shadow-2xl backdrop-blur-2xl',
      accent1: 'bg-slate-900',
      accent2: 'bg-slate-600',
    };
  }

  if (themePreset === 'dark') {
    return {
      bg: 'bg-[#093A6E] text-[#FFF7E5] border-2 border-[#FFF7E5] shadow-2xl backdrop-blur-md',
      borderLeft: 'border-l-8 border-l-[#FFF7E5]',
      nameText: 'text-[#FFF7E5]',
      titleText: 'text-[#A88337]',
      tagBg: 'bg-[#FFF7E5] text-[#093A6E]',
      dockedBg: 'bg-[#093A6E] border-t-4 border-b-2 border-[#FFF7E5] text-[#FFF7E5]',
      accent1: 'bg-[#FFF7E5]',
      accent2: 'bg-[#A88337]',
    };
  }

  if (themePreset === 'cream' || (!themePreset && color === 'navy')) {
    return {
      bg: 'bg-[#FFF7E5] text-[#093A6E] border-2 border-[#093A6E] shadow-2xl backdrop-blur-md',
      borderLeft: 'border-l-8 border-l-[#093A6E]',
      nameText: 'text-[#093A6E]',
      titleText: 'text-[#926C35]',
      tagBg: 'bg-[#093A6E] text-[#FFF7E5]',
      dockedBg: 'bg-[#FFF7E5] border-t-4 border-b-2 border-[#093A6E] text-[#093A6E]',
      accent1: 'bg-[#093A6E]',
      accent2: 'bg-[#A88337]',
    };
  }

  switch (color) {
    case 'frosted_white':
      return {
        bg: 'bg-white/85 text-slate-900 border-2 border-white shadow-[0_15px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl',
        borderLeft: 'border-l-8 border-l-slate-900',
        nameText: 'text-slate-950 font-black',
        titleText: 'text-slate-700 font-semibold',
        tagBg: 'bg-slate-900 text-white shadow-sm font-black',
        dockedBg: 'bg-white/90 border-t-4 border-b-2 border-white text-slate-900 shadow-2xl backdrop-blur-2xl',
        accent1: 'bg-slate-900',
        accent2: 'bg-slate-600',
      };
    case 'blue':
      return {
        bg: 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-950 text-white',
        borderLeft: 'border-l-8 border-l-cyan-400',
        nameText: 'text-cyan-300',
        titleText: 'text-slate-200',
        tagBg: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950',
        dockedBg: 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-950 border-t-2 border-b border-cyan-400/80 text-white',
        accent1: 'bg-cyan-400',
        accent2: 'bg-blue-400',
      };
    case 'crimson':
      return {
        bg: 'bg-gradient-to-r from-rose-950 via-red-900 to-slate-950 text-white',
        borderLeft: 'border-l-8 border-l-rose-400',
        nameText: 'text-rose-200',
        titleText: 'text-rose-100/90',
        tagBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
        dockedBg: 'bg-gradient-to-r from-rose-950 via-red-900 to-slate-950 border-t-2 border-b border-rose-400/80 text-white',
        accent1: 'bg-rose-500',
        accent2: 'bg-pink-400',
      };
    case 'emerald':
      return {
        bg: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white',
        borderLeft: 'border-l-8 border-l-emerald-400',
        nameText: 'text-emerald-300',
        titleText: 'text-emerald-100/90',
        tagBg: 'bg-emerald-400 text-slate-950',
        dockedBg: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border-t-2 border-b border-emerald-400/80 text-white',
        accent1: 'bg-emerald-400',
        accent2: 'bg-teal-400',
      };
    case 'gold':
      return {
        bg: 'bg-stone-950/95 text-stone-100 border border-amber-500/40',
        borderLeft: 'border-l-8 border-l-amber-400',
        nameText: 'text-amber-200',
        titleText: 'text-stone-300',
        tagBg: 'bg-amber-400 text-slate-950',
        dockedBg: 'bg-stone-950/95 border-t-2 border-b border-amber-400/90 text-amber-100',
        accent1: 'bg-amber-400',
        accent2: 'bg-yellow-500',
      };
    case 'dark':
      return {
        bg: 'bg-slate-950/95 text-white border border-slate-800',
        borderLeft: 'border-l-8 border-l-blue-500',
        nameText: 'text-white',
        titleText: 'text-slate-300',
        tagBg: 'bg-blue-600 text-white',
        dockedBg: 'bg-slate-950/95 border-t-2 border-b border-blue-500/80 text-white',
        accent1: 'bg-blue-500',
        accent2: 'bg-blue-400',
      };
    case 'custom':
      return {
        bg: 'text-slate-900 border border-slate-400/60 shadow-2xl',
        borderLeft: 'border-l-8',
        nameText: 'font-bold',
        titleText: 'opacity-90',
        tagBg: 'text-white font-extrabold',
        dockedBg: 'border-t-2 border-b text-slate-900',
        accent1: 'bg-[#093A6E]',
        accent2: 'bg-[#A88337]',
      };
    case 'navy':
    default:
      return {
        bg: 'bg-gradient-to-r from-[#093A6E] via-[#0D4B8B] to-[#072B52] text-white border border-[#A88337]/50',
        borderLeft: 'border-l-8 border-l-[#A88337]',
        nameText: 'text-[#FFF7E5]',
        titleText: 'text-[#FFF7E5]/90',
        tagBg: 'bg-gradient-to-r from-[#A88337] to-[#926C35] text-[#FFF7E5]',
        dockedBg: 'bg-gradient-to-r from-[#093A6E]/95 via-[#0D4B8B]/95 to-[#093A6E]/95 border-t-2 border-b border-[#A88337]/80 text-white',
        accent1: 'bg-[#A88337]',
        accent2: 'bg-[#926C35]',
      };
  }
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  config,
  speakerOverride,
  positionClass,
}) => {
  const isWaitingLayout = config.layoutMode === 'waiting';
  const isTopPosition = config.lowerThirdPosition === 'top_left' || config.lowerThirdPosition === 'top_center';
  // Automatically deactivate Name Tag (Lower Third) when Liturgy Floating Rundown Tracker is active in the same position
  const isVisible = config.showLowerThird && !isWaitingLayout && (isTopPosition || !config.showLiturgyTracker);

  const currentSpeaker = speakerOverride || config.speaker;
  const style = config.lowerThirdStyle;

  const shapeClass = getShapeClass(config.lowerThirdShape);
  const fontClass = getFontClass(config.lowerThirdFont);
  const colorPalette = getColorPalette(config.lowerThirdColor, config.themePreset);

  const isMultiSpeakerLayout =
    config.layoutMode === 'split_two' || config.layoutMode === 'slide_two_presenters';

  const isDockedMode = isMultiSpeakerLayout;

  const isCentered =
    config.lowerThirdPosition === 'bottom_center' || config.lowerThirdPosition === 'top_center';

  const scale =
    typeof config.lowerThirdScale === 'number' && config.lowerThirdScale > 0
      ? config.lowerThirdScale
      : 1.0;

  const getResolvedPositionClass = () => {
    if (positionClass) return positionClass;
    switch (config.lowerThirdPosition) {
      case 'bottom_center':
        return 'bottom-5 sm:bottom-7 md:bottom-9 left-1/2 -translate-x-1/2';
      case 'bottom_left_inset':
        return 'bottom-5 sm:bottom-7 md:bottom-9 left-6 sm:left-12 md:left-20 lg:left-28';
      case 'bottom_left':
        return 'bottom-4 left-4 md:bottom-6 md:left-6';
      case 'top_center':
        return 'top-4 sm:top-6 md:top-8 left-1/2 -translate-x-1/2';
      case 'top_left':
        return 'top-4 left-4 md:top-6 md:left-6';
      default:
        // Default: Center-bottom
        return 'bottom-5 sm:bottom-7 md:bottom-9 left-1/2 -translate-x-1/2';
    }
  };

  const getTransformOrigin = () => {
    if (isDockedMode) return 'bottom center';
    switch (config.lowerThirdPosition) {
      case 'bottom_center':
        return 'bottom center';
      case 'top_center':
        return 'top center';
      case 'top_left':
        return 'top left';
      case 'bottom_left_inset':
      case 'bottom_left':
      default:
        return 'bottom left';
    }
  };

  const resolvedPositionClass = getResolvedPositionClass();

  const getDockedStyle = () => {
    if (config.lowerThirdColor && config.lowerThirdColor !== 'navy') {
      const isLightPalette =
        config.themePreset === 'frosted_light' ||
        config.lowerThirdColor === 'frosted_white' ||
        config.lowerThirdColor === 'custom';
      return {
        container: `${colorPalette.dockedBg} backdrop-blur-md shadow-2xl ${fontClass}`,
        sp1Inst: colorPalette.nameText,
        sp1Name: isLightPalette && (config.themePreset === 'frosted_light' || config.lowerThirdColor === 'frosted_white') ? 'text-slate-950 font-black' : 'text-white font-extrabold',
        sp1Title: colorPalette.titleText,
        badgeBorder: isLightPalette && (config.themePreset === 'frosted_light' || config.lowerThirdColor === 'frosted_white') ? 'border-slate-300 text-slate-800' : 'border-white/30 text-white',
        sp2Inst: colorPalette.nameText,
        sp2Name: isLightPalette && (config.themePreset === 'frosted_light' || config.lowerThirdColor === 'frosted_white') ? 'text-slate-950 font-black' : 'text-white font-extrabold',
        sp2Title: colorPalette.titleText,
        accent1: colorPalette.accent1,
        accent2: colorPalette.accent2,
      };
    }

    switch (style) {
      case 'sleek_modern':
        return {
          container: `bg-slate-950/95 border-t-2 border-b border-blue-500/80 text-white backdrop-blur-md shadow-2xl ${fontClass}`,
          sp1Inst: 'text-blue-400',
          sp1Name: 'text-white',
          sp1Title: 'text-slate-300',
          badgeBorder: 'border-blue-500/40 text-blue-300',
          sp2Inst: 'text-blue-400',
          sp2Name: 'text-white',
          sp2Title: 'text-slate-300',
          accent1: 'bg-blue-500',
          accent2: 'bg-blue-400',
        };
      case 'minimal_gold':
        return {
          container: `bg-stone-950/95 border-t-2 border-b border-amber-400/90 text-amber-100 backdrop-blur-md shadow-2xl ${fontClass}`,
          sp1Inst: 'text-amber-400 font-black tracking-widest',
          sp1Name: 'text-amber-200 font-bold',
          sp1Title: 'text-stone-300',
          badgeBorder: 'border-amber-400/40 text-amber-300',
          sp2Inst: 'text-amber-400 font-black tracking-widest',
          sp2Name: 'text-amber-200 font-bold',
          sp2Title: 'text-stone-300',
          accent1: 'bg-amber-400',
          accent2: 'bg-yellow-500',
        };
      case 'futuristic_glass':
        return {
          container: `bg-emerald-950/90 border-t-2 border-b border-emerald-400/80 text-emerald-100 backdrop-blur-xl shadow-[0_-5px_25px_rgba(16,185,129,0.25)] ${fontClass}`,
          sp1Inst: 'text-emerald-400 font-mono font-bold',
          sp1Name: 'text-white font-extrabold',
          sp1Title: 'text-emerald-200/90',
          badgeBorder: 'border-emerald-400/40 text-emerald-300',
          sp2Inst: 'text-teal-400 font-mono font-bold',
          sp2Name: 'text-white font-extrabold',
          sp2Title: 'text-teal-200/90',
          accent1: 'bg-emerald-400',
          accent2: 'bg-teal-400',
        };
      case 'classic_signature':
      case 'uajy_signature':
      default:
        if (config.themePreset === 'frosted_light' || config.lowerThirdColor === 'frosted_white') {
          return {
            container: `bg-white/90 border-t-4 border-b-2 border-white text-slate-900 backdrop-blur-2xl shadow-2xl ${fontClass}`,
            sp1Inst: 'text-slate-950 font-black',
            sp1Name: 'text-slate-950 font-extrabold',
            sp1Title: 'text-slate-700 font-bold',
            badgeBorder: 'border-slate-300 text-slate-900',
            sp2Inst: 'text-slate-950 font-black',
            sp2Name: 'text-slate-950 font-extrabold',
            sp2Title: 'text-slate-700 font-bold',
            accent1: 'bg-slate-900',
            accent2: 'bg-slate-600',
          };
        }
        if (config.themePreset === 'dark') {
          return {
            container: `bg-[#093A6E] border-t-4 border-b-2 border-[#FFF7E5] text-[#FFF7E5] shadow-2xl ${fontClass}`,
            sp1Inst: 'text-[#FFF7E5] font-black',
            sp1Name: 'text-[#FFF7E5] font-extrabold',
            sp1Title: 'text-[#A88337] font-bold',
            badgeBorder: 'border-[#FFF7E5]/60 text-[#FFF7E5]',
            sp2Inst: 'text-[#FFF7E5] font-black',
            sp2Name: 'text-[#FFF7E5] font-extrabold',
            sp2Title: 'text-[#A88337] font-bold',
            accent1: 'bg-[#FFF7E5]',
            accent2: 'bg-[#A88337]',
          };
        }
        if (config.themePreset === 'cream' || (!config.themePreset && (config.lowerThirdColor === 'navy' || !config.lowerThirdColor))) {
          return {
            container: `bg-[#FFF7E5] border-t-4 border-b-2 border-[#093A6E] text-[#093A6E] shadow-2xl ${fontClass}`,
            sp1Inst: 'text-[#093A6E] font-black',
            sp1Name: 'text-[#093A6E] font-extrabold',
            sp1Title: 'text-[#926C35] font-bold',
            badgeBorder: 'border-[#093A6E]/40 text-[#093A6E]',
            sp2Inst: 'text-[#093A6E] font-black',
            sp2Name: 'text-[#093A6E] font-extrabold',
            sp2Title: 'text-[#926C35] font-bold',
            accent1: 'bg-[#093A6E]',
            accent2: 'bg-[#A88337]',
          };
        }
        return {
          container: `bg-gradient-to-r from-[#093A6E]/95 via-[#0D4B8B]/95 to-[#093A6E]/95 border-t-2 border-b border-[#A88337]/80 text-white backdrop-blur-md shadow-2xl ${fontClass}`,
          sp1Inst: 'text-[#A88337]',
          sp1Name: 'text-[#FFF7E5]',
          sp1Title: 'text-slate-200',
          badgeBorder: 'border-[#A88337]/40 text-[#A88337]',
          sp2Inst: 'text-[#926C35]',
          sp2Name: 'text-[#FFF7E5]',
          sp2Title: 'text-slate-200',
          accent1: 'bg-[#A88337]',
          accent2: 'bg-[#926C35]',
        };
    }
  };

  const dockedTheme = getDockedStyle();

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        isDockedMode ? (
          /* DOCKED BANNER MODE (For 2-Speaker Layouts) */
          <motion.div
            key={`lt-docked-${config.lowerThirdAnimationKey}-${currentSpeaker.name}-${config.layoutMode}-${style}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              transform: scale !== 1.0 ? `scale(${scale})` : undefined,
              transformOrigin: 'bottom center',
            }}
            className={`w-full ${dockedTheme.container} px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-20`}
          >
            {isMultiSpeakerLayout ? (
              /* Dual Speaker Banner Layout */
              <div className="w-full flex items-center justify-between gap-2 md:gap-4">
                {/* Speaker 1 (Host / Left) */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <div className={`w-2 h-8 ${dockedTheme.accent1} ${shapeClass.accentPill} shrink-0`} />
                  <div className="truncate">
                    <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider truncate ${dockedTheme.sp1Inst}`}>
                      {currentSpeaker.institution || 'PEMBICARA'}
                    </div>
                    <div className={`text-xs md:text-sm font-black truncate leading-tight ${dockedTheme.sp1Name}`}>
                      {currentSpeaker.name || 'Nama Pembicara'}
                    </div>
                    {currentSpeaker.title && (
                      <div className={`text-[10px] md:text-xs truncate font-medium ${dockedTheme.sp1Title}`}>
                        {currentSpeaker.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Badge Divider */}
                <div className={`hidden sm:flex flex-col items-center justify-center px-4 border-x ${dockedTheme.badgeBorder} shrink-0`}>
                  <span className={`text-[9px] font-black tracking-widest uppercase ${dockedTheme.sp1Inst}`}>PASTORAL &amp; LITURGI</span>
                  <span className="text-[11px] font-bold">CAMPUS MINISTRY</span>
                </div>

                {/* Speaker 2 (Guest / Right) */}
                <div className="flex-1 min-w-0 flex items-center justify-end text-right gap-2.5">
                  <div className="truncate">
                    <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider truncate ${dockedTheme.sp2Inst}`}>
                      {config.speaker2?.institution || 'PEMBICARA 2 / MODERATOR'}
                    </div>
                    <div className={`text-xs md:text-sm font-black truncate leading-tight ${dockedTheme.sp2Name}`}>
                      {config.speaker2?.name || 'Prof. Dr. Antonius Budi, Ph.D.'}
                    </div>
                    {config.speaker2?.title && (
                      <div className={`text-[10px] md:text-xs truncate font-medium ${dockedTheme.sp2Title}`}>
                        {config.speaker2?.title}
                      </div>
                    )}
                  </div>
                  <div className={`w-2 h-8 ${dockedTheme.accent2} ${shapeClass.accentPill} shrink-0`} />
                </div>
              </div>
            ) : (
              /* Single Speaker Full Width Banner */
              <div className="w-full flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-9 ${dockedTheme.accent1} ${shapeClass.accentPill} shrink-0`} />
                  <div className="truncate">
                    {currentSpeaker.institution && (
                      <div className={`text-[10px] md:text-xs font-black uppercase tracking-widest truncate ${dockedTheme.sp1Inst}`}>
                        {currentSpeaker.institution}
                      </div>
                    )}
                    <div className={`text-base md:text-lg font-black tracking-tight leading-tight truncate ${dockedTheme.sp1Name}`}>
                      {currentSpeaker.name || 'Nama / Judul Kegiatan'}
                    </div>
                    {currentSpeaker.title && (
                      <div className={`text-xs md:text-sm font-medium truncate ${dockedTheme.sp1Title}`}>
                        {currentSpeaker.title}
                      </div>
                    )}
                  </div>
                </div>
                {currentSpeaker.topic && (
                  <div className={`hidden sm:block text-right bg-black/20 border border-white/20 px-3.5 py-1.5 ${shapeClass.tag} shrink-0`}>
                    <div className={`text-[10px] font-extrabold uppercase tracking-wider ${dockedTheme.sp1Inst}`}>TOPIK MATERI</div>
                    <div className="text-xs font-bold max-w-xs truncate">{currentSpeaker.topic}</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* FLOATING MODE (For Standard Single Presenter Views - Center, Inset, or Corner) */
          <motion.div
            key={`lt-${config.lowerThirdAnimationKey}-${currentSpeaker.name}-${currentSpeaker.title}-${style}-${config.lowerThirdColor}-${config.themePreset}-${config.lowerThirdPosition}-${scale}`}
            initial={{
              opacity: 0,
              y: isCentered ? 30 : 0,
              x: isCentered ? 0 : -50,
              scale: scale * 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
              scale: scale,
            }}
            exit={{
              opacity: 0,
              y: isCentered ? 20 : 0,
              x: isCentered ? 0 : -50,
              scale: scale * 0.95,
            }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{
              transformOrigin: getTransformOrigin(),
            }}
            className={`absolute ${resolvedPositionClass} z-30 w-auto max-w-[92vw] sm:max-w-xl md:max-w-2xl pointer-events-none flex flex-col ${
              isCentered ? 'items-center text-center' : 'items-start text-left'
            } ${fontClass}`}
          >
            {(style === 'classic_signature' || style === 'uajy_signature') && (
              <div
                className={`relative ${colorPalette.bg} ${
                  isCentered
                    ? 'border-t-4 border-b-2 border-amber-400/90 px-6 sm:px-8 py-3.5 sm:py-4 items-center text-center'
                    : `${colorPalette.borderLeft} p-4 md:p-5 px-6 items-start text-left`
                } ${shapeClass.container} shadow-2xl backdrop-blur-md overflow-hidden flex flex-col gap-1.5`}
              >
                {/* Background glow */}
                <div
                  className={`absolute ${
                    isCentered ? 'left-1/2 -translate-x-1/2 -bottom-10' : '-right-8 -bottom-8'
                  } w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none`}
                />

                {/* Institution Tag inside the card */}
                {currentSpeaker.institution && (
                  <div className={`${isCentered ? 'self-center mx-auto' : 'self-start'} mb-0.5`}>
                    <span
                      className={`inline-block px-3 py-1 ${colorPalette.tagBg} ${shapeClass.tag} font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-xs`}
                    >
                      {currentSpeaker.institution}
                    </span>
                  </div>
                )}

                <div className={isCentered ? 'text-center' : 'text-left'}>
                  <h2
                    className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-tight ${colorPalette.nameText}`}
                  >
                    {currentSpeaker.name || 'Nama / Judul Kegiatan'}
                  </h2>
                  {currentSpeaker.title && (
                    <p className={`text-xs sm:text-sm font-medium mt-0.5 ${colorPalette.titleText}`}>
                      {currentSpeaker.title}
                    </p>
                  )}
                </div>

                {/* Topic line */}
                {currentSpeaker.topic && (
                  <div
                    className={`mt-1 pt-1.5 border-t border-white/15 flex items-center ${
                      isCentered ? 'justify-center text-center' : 'justify-start text-left'
                    } gap-2 text-xs opacity-90 font-medium`}
                  >
                    <span className="italic truncate">{currentSpeaker.topic}</span>
                  </div>
                )}
              </div>
            )}

            {style === 'sleek_modern' && (
              <div
                className={`${colorPalette.bg} ${
                  isCentered
                    ? 'border-t-4 border-b-2 border-blue-500/80 px-6 sm:px-8 py-3.5 sm:py-4 items-center text-center'
                    : `${colorPalette.borderLeft} p-4 md:p-5 items-start text-left`
                } ${shapeClass.container} shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-1.5`}
              >
                {currentSpeaker.institution && (
                  <div
                    className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${
                      colorPalette.nameText
                    } ${isCentered ? 'text-center' : 'text-left'}`}
                  >
                    {currentSpeaker.institution}
                  </div>
                )}
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight ${
                    isCentered ? 'text-center' : 'text-left'
                  }`}
                >
                  {currentSpeaker.name || 'Nama / Judul Kegiatan'}
                </div>
                {currentSpeaker.title && (
                  <div
                    className={`text-xs sm:text-sm font-medium ${colorPalette.titleText} ${
                      isCentered ? 'text-center' : 'text-left'
                    }`}
                  >
                    {currentSpeaker.title}
                  </div>
                )}
                {currentSpeaker.topic && (
                  <div
                    className={`text-xs opacity-80 mt-1 pt-1.5 border-t border-white/10 w-full ${
                      isCentered ? 'text-center' : 'text-left'
                    }`}
                  >
                    Topik/Detail: <span className={`font-medium ${colorPalette.nameText}`}>{currentSpeaker.topic}</span>
                  </div>
                )}
              </div>
            )}

            {style === 'minimal_gold' && (
              <div
                className={`${colorPalette.bg} ${
                  isCentered
                    ? 'border-t-4 border-b-2 border-amber-400/90 px-6 sm:px-8 py-3.5 sm:py-4 items-center text-center'
                    : `${colorPalette.borderLeft} p-4 md:p-5 items-start text-left`
                } ${shapeClass.container} shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-1.5`}
              >
                {currentSpeaker.institution && (
                  <div
                    className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${
                      colorPalette.nameText
                    } ${isCentered ? 'text-center' : 'text-left'}`}
                  >
                    {currentSpeaker.institution}
                  </div>
                )}
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${colorPalette.nameText} ${
                    isCentered ? 'text-center' : 'text-left'
                  }`}
                >
                  {currentSpeaker.name || 'Nama / Judul Kegiatan'}
                </div>
                {currentSpeaker.title && (
                  <div
                    className={`text-xs sm:text-sm font-medium ${colorPalette.titleText} ${
                      isCentered ? 'text-center' : 'text-left'
                    }`}
                  >
                    {currentSpeaker.title}
                  </div>
                )}
                {currentSpeaker.topic && (
                  <div
                    className={`text-xs opacity-80 mt-1 pt-1.5 border-t border-stone-800 w-full ${
                      isCentered ? 'text-center' : 'text-left'
                    }`}
                  >
                    Topik: <span className={`font-medium ${colorPalette.nameText}`}>{currentSpeaker.topic}</span>
                  </div>
                )}
              </div>
            )}

            {style === 'futuristic_glass' && (
              <div
                className={`${colorPalette.bg} ${
                  isCentered
                    ? 'border-t-4 border-b-2 border-emerald-400/80 px-6 sm:px-8 py-3.5 sm:py-4 items-center text-center'
                    : `${colorPalette.borderLeft} p-4 md:p-5 items-start text-left`
                } ${shapeClass.container} shadow-[0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-xl flex flex-col gap-1.5`}
              >
                {currentSpeaker.institution && (
                  <div className={`${isCentered ? 'self-center mx-auto' : 'self-start'} mb-0.5`}>
                    <span
                      className={`px-2.5 py-0.5 ${shapeClass.tag} ${colorPalette.tagBg} text-[10px] sm:text-xs font-bold tracking-wider uppercase inline-block`}
                    >
                      {currentSpeaker.institution}
                    </span>
                  </div>
                )}
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
                    isCentered ? 'text-center' : 'text-left'
                  }`}
                >
                  {currentSpeaker.name || 'Nama / Judul Kegiatan'}
                </div>
                {currentSpeaker.title && (
                  <div
                    className={`text-xs sm:text-sm font-medium mt-0.5 ${colorPalette.titleText} ${
                      isCentered ? 'text-center' : 'text-left'
                    }`}
                  >
                    {currentSpeaker.title}
                  </div>
                )}
                {currentSpeaker.topic && (
                  <div
                    className={`text-xs opacity-90 mt-1.5 pt-1.5 border-t border-white/10 w-full ${
                      isCentered ? 'text-center' : 'text-left'
                    }`}
                  >
                    <span className={colorPalette.nameText}>{currentSpeaker.topic}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
