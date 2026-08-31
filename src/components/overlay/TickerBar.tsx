import React from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { Radio, Instagram, Youtube, Globe } from 'lucide-react';
import { getFontFamilyClass } from '../../utils/fontColorUtils';

interface TickerBarProps {
  config: OverlayConfig;
}

export const TickerBar: React.FC<TickerBarProps> = ({ config }) => {
  if (!config.showTicker) return null;

  const fontClass = getFontFamilyClass(config.tickerFontFamily || config.lowerThirdFont);

  const fontSizeClass =
    config.tickerFontSize === 'small'
      ? 'text-sm'
      : config.tickerFontSize === 'large'
      ? 'text-lg font-bold'
      : 'text-base font-semibold';

  const bgColor = config.tickerBgColor || (config.themePreset === 'cream' ? '#FFF7E5' : '#093A6E');
  const textColor = config.tickerTextColor || (config.themePreset === 'cream' ? '#093A6E' : '#FFF7E5');
  const badgeBgColor = config.tickerBadgeBgColor || (config.themePreset === 'cream' ? '#093A6E' : '#FFF7E5');
  const badgeTitle = config.tickerBadgeTitle || 'INFORMASI';

  const isLightBg = bgColor.toUpperCase().includes('FFF7E5') || bgColor.toUpperCase().includes('FAF3E0') || bgColor.toUpperCase().includes('FFFFFF');
  const isBadgeLight = badgeBgColor.toUpperCase().includes('FFF7E5') || badgeBgColor.toUpperCase().includes('FAF3E0') || badgeBgColor.toUpperCase().includes('FFFFFF');
  const badgeTextColor = isBadgeLight ? '#093A6E' : '#FFF7E5';

  const dotColorClass = isLightBg ? 'text-[#093A6E] font-extrabold' : 'text-amber-400 font-extrabold';
  const igColorClass = isLightBg ? 'text-[#926C35] font-bold' : 'text-amber-300';
  const ytColorClass = isLightBg ? 'text-red-700 font-bold' : 'text-red-300';
  const webColorClass = isLightBg ? 'text-[#093A6E] font-bold' : 'text-blue-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      className={`w-full shrink-0 z-40 border-t-4 shadow-2xl h-14 flex items-center overflow-hidden ${fontClass}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTopColor: isLightBg ? '#093A6E' : '#FFF7E5',
      }}
    >
      {/* Ticker Title Badge */}
      <div
        className="font-black px-6 h-full flex items-center gap-2.5 text-sm tracking-wider uppercase shrink-0 shadow-md z-10"
        style={{
          backgroundColor: badgeBgColor,
          color: badgeTextColor,
        }}
      >
        <Radio className="w-4 h-4 animate-pulse" style={{ color: badgeTextColor }} />
        <span className="whitespace-nowrap font-extrabold">{badgeTitle}</span>
      </div>

      {/* Marquee Content Container */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div
          className={`whitespace-nowrap flex items-center gap-12 tracking-wide ${fontSizeClass}`}
          style={{
            animation: `marquee ${config.tickerSpeed || 25}s linear infinite`,
            color: textColor,
          }}
        >
          <span className="flex items-center gap-8">
            <span>{config.tickerText}</span>
            <span className={dotColorClass}>•</span>
            {config.instagramHandle && (
              <span className={`inline-flex items-center gap-1.5 ${igColorClass}`}>
                <Instagram className="w-4 h-4" />
                {config.instagramHandle}
              </span>
            )}
            {config.youtubeHandle && (
              <span className={`inline-flex items-center gap-1.5 ${ytColorClass}`}>
                <Youtube className="w-4 h-4" />
                {config.youtubeHandle}
              </span>
            )}
            {config.websiteUrl && (
              <span className={`inline-flex items-center gap-1.5 ${webColorClass}`}>
                <Globe className="w-4 h-4" />
                {config.websiteUrl}
              </span>
            )}
            <span className={dotColorClass}>•</span>
          </span>

          {/* Repeat for seamless marquee loop */}
          <span className="flex items-center gap-8">
            <span>{config.tickerText}</span>
            <span className={dotColorClass}>•</span>
            {config.instagramHandle && (
              <span className={`inline-flex items-center gap-1.5 ${igColorClass}`}>
                <Instagram className="w-4 h-4" />
                {config.instagramHandle}
              </span>
            )}
            {config.youtubeHandle && (
              <span className={`inline-flex items-center gap-1.5 ${ytColorClass}`}>
                <Youtube className="w-4 h-4" />
                {config.youtubeHandle}
              </span>
            )}
            {config.websiteUrl && (
              <span className={`inline-flex items-center gap-1.5 ${webColorClass}`}>
                <Globe className="w-4 h-4" />
                {config.websiteUrl}
              </span>
            )}
            <span className={dotColorClass}>•</span>
          </span>
        </div>
      </div>

      {/* CSS Keyframes inline */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  );
};
