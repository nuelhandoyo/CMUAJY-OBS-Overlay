import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OverlayConfig, LiturgyStep } from '../../types';

interface LiturgyFloatingTrackerProps {
  config: OverlayConfig;
}

export const LiturgyFloatingTracker: React.FC<LiturgyFloatingTrackerProps> = ({ config }) => {
  const items = config.liturgyItems || [];
  const isVisible = Boolean(config.showLiturgyTracker && config.layoutMode !== 'waiting' && items.length > 0);

  const currentIndex = Math.max(0, Math.min(config.activeLiturgyIndex || 0, items.length > 0 ? items.length - 1 : 0));
  const currentStep: LiturgyStep = items[currentIndex] || { id: 'default', category: '', title: '' };

  const theme = config.themePreset || 'cream';
  const isFrosted = theme === 'frosted_light';
  const isDark = theme === 'dark';

  // Color Theme Styles focused strictly on high broadcast legibility & distant viewing
  const getThemeStyles = () => {
    if (isFrosted) {
      return {
        cardBg: 'bg-white/95 backdrop-blur-3xl border-white text-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.35)]',
        titleText: 'text-slate-950 font-black tracking-normal sm:tracking-wide',
        accentBar: 'bg-slate-900',
        postureBadge: 'bg-slate-900 text-white border-slate-700 shadow-md font-black',
        borderColor: 'border-2 border-white/90',
      };
    }

    if (isDark) {
      return {
        cardBg: 'bg-[#061e3b]/98 backdrop-blur-3xl border-amber-400/60 text-[#FFF7E5] shadow-[0_24px_70px_rgba(0,0,0,0.7)]',
        titleText: 'text-[#FFF7E5] font-black tracking-normal sm:tracking-wide',
        accentBar: 'bg-amber-400',
        postureBadge: 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black',
        borderColor: 'border-2 border-amber-400/50',
      };
    }

    // Default Cream Light Theme
    return {
      cardBg: 'bg-[#FFF7E5]/98 backdrop-blur-3xl border-[#093A6E]/40 text-[#093A6E] shadow-[0_20px_60px_rgba(9,58,110,0.35)]',
      titleText: 'text-[#093A6E] font-black tracking-normal sm:tracking-wide',
      accentBar: 'bg-[#093A6E]',
      postureBadge: 'bg-[#093A6E] text-[#FFF7E5] border-[#093A6E]/60 shadow-md font-black',
      borderColor: 'border-2 border-[#093A6E]/30',
    };
  };

  const themeStyle = getThemeStyles();

  // Posture icon selector
  const getPostureIcon = (posture?: string) => {
    if (!posture) return '✝️';
    const lower = posture.toLowerCase();
    if (lower.includes('berdiri')) return '🧍';
    if (lower.includes('duduk')) return '🪑';
    if (lower.includes('berlutut')) return '🧎';
    if (lower.includes('berjalan')) return '🚶';
    if (lower.includes('hening')) return '🤫';
    return '✝️';
  };

  return (
    <div
      className="absolute bottom-3 sm:bottom-5 md:bottom-6 inset-x-3 sm:inset-x-6 md:inset-x-10 z-40 pointer-events-none flex justify-center"
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={`liturgy-${currentIndex}-${config.liturgyAnimationKey || 1}-${currentStep.title}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`w-full rounded-[4px] px-5 sm:px-8 md:px-10 py-3.5 sm:py-5 md:py-6 flex items-center justify-between gap-4 sm:gap-8 ${themeStyle.cardBg} ${themeStyle.borderColor}`}
            style={{
              borderRadius: '4px',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            }}
          >
            {/* Left / Main: Procession / Activity Title */}
            <div className="flex-1 min-w-0 flex items-center gap-3.5 sm:gap-5 md:gap-6">
              <div className={`w-2 sm:w-2.5 md:w-3.5 h-8 sm:h-11 md:h-14 rounded-[2px] shrink-0 ${themeStyle.accentBar}`} />
              <h3
                className={`text-base sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase truncate leading-tight drop-shadow-sm ${themeStyle.titleText}`}
              >
                {currentStep.title}
              </h3>
            </div>

            {/* Right: Congregation Posture / Position Badge Only */}
            {currentStep.posture && (
              <div
                className={`shrink-0 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-3.5 rounded-[4px] text-sm sm:text-lg md:text-2xl font-black uppercase tracking-wider flex items-center gap-2 sm:gap-3 border ${themeStyle.postureBadge}`}
              >
                <span className="text-base sm:text-2xl md:text-3xl leading-none">
                  {getPostureIcon(currentStep.posture)}
                </span>
                <span className="whitespace-nowrap font-black">{currentStep.posture}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

