import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { OverlayConfig } from '../../types';
import { Radio, Sparkles } from 'lucide-react';
import {
  getLayoutShapeClass,
  getLayoutInnerShapeClass,
  getLayoutBadgeShapeClass,
} from '../../utils/shapeUtils';
import { getFontFamilyClass } from '../../utils/fontColorUtils';

interface WaitingScreenViewProps {
  config: OverlayConfig;
}

export const WaitingScreenView: React.FC<WaitingScreenViewProps> = ({ config }) => {
  const [secondsLeft, setSecondsLeft] = useState(config.waitingCountdownMinutes * 60);
  const shapeClass = getLayoutShapeClass(config.layoutShape);
  const innerShapeClass = getLayoutInnerShapeClass(config.layoutShape);
  const badgeShapeClass = getLayoutBadgeShapeClass(config.layoutShape);
  const fontClass = getFontFamilyClass(config.waitingFontFamily || config.lowerThirdFont);

  const isFrosted = config.themePreset === 'frosted_light';
  const bgColor = config.waitingBgColor || config.customPrimaryBgColor || (isFrosted ? 'rgba(255, 255, 255, 0.85)' : config.themePreset === 'cream' ? '#FFF7E5' : '#093A6E');
  const accentColor = config.waitingAccentColor || config.customAccentColor || (isFrosted ? '#FFFFFF' : config.themePreset === 'cream' ? '#093A6E' : '#A88337');

  const isLightBg = isFrosted || bgColor.toUpperCase().includes('FFF7E5') || bgColor.toUpperCase().includes('FAF3E0') || bgColor.toUpperCase().includes('FFFFFF') || bgColor.toUpperCase().includes('F8FAFC') || bgColor.includes('255, 255, 255');

  useEffect(() => {
    setSecondsLeft(config.waitingCountdownMinutes * 60);
  }, [config.waitingCountdownMinutes]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return {
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  const timeStr = formatTime(secondsLeft);

  return (
    <div className={`w-full h-full relative flex flex-col items-center justify-center p-6 md:p-8 bg-transparent text-slate-900 overflow-hidden ${fontClass}`}>
      {/* Soft Cyber Background Light Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={`max-w-4xl w-full backdrop-blur-2xl ${isFrosted ? 'border-2 shadow-[0_25px_60px_rgba(0,0,0,0.18)]' : 'border-4 shadow-[0_25px_60px_rgba(15,23,42,0.4)]'} ${shapeClass} p-8 md:p-10 text-center flex flex-col items-center z-10 relative overflow-hidden`}
        style={{
          backgroundColor: isFrosted ? 'rgba(255, 255, 255, 0.85)' : `${bgColor}F5`,
          borderColor: accentColor,
        }}
      >
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 font-black text-xs px-4 py-1.5 ${badgeShapeClass} uppercase tracking-widest mb-6 shadow-md ${
          isFrosted ? 'bg-slate-950 text-white' : isLightBg ? 'bg-[#093A6E] text-[#FFF7E5]' : 'bg-[#FFF7E5] text-[#093A6E]'
        }`}>
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{config.waitingBadgeText || 'SIARAN SEGERA DIMULAI'}</span>
        </div>

        {/* Custom Waiting Title */}
        <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl ${
          isFrosted ? 'text-slate-950' : isLightBg ? 'text-[#093A6E]' : 'text-[#FFF7E5]'
        }`}>
          {config.waitingTitle || 'SELAMAT DATANG DI LIVE STREAMING'}
        </h1>

        {/* Custom Waiting Subtitle */}
        {config.waitingSubtitle && (
          <p className={`text-base md:text-xl font-semibold mt-3 max-w-2xl ${
            isFrosted ? 'text-slate-600' : isLightBg ? 'text-[#926C35]' : 'text-[#A88337]'
          }`}>
            {config.waitingSubtitle}
          </p>
        )}

        {/* Countdown Clock Display */}
        <div className="my-6 md:my-8 flex items-center justify-center gap-4">
          <div className={`p-4 min-w-[110px] shadow-2xl ${innerShapeClass} border-2 ${
            isFrosted ? 'bg-white/95 border-slate-200 text-slate-950' : isLightBg ? 'bg-white border-[#093A6E]' : 'bg-[#093A6E] border-[#FFF7E5]'
          }`}>
            <span className={`text-4xl md:text-6xl font-black font-mono ${
              isFrosted ? 'text-slate-950' : isLightBg ? 'text-[#093A6E]' : 'text-[#FFF7E5]'
            }`}>
              {timeStr.mins}
            </span>
            <span className={`block text-xs uppercase tracking-widest font-bold mt-1 ${
              isFrosted ? 'text-slate-500' : isLightBg ? 'text-[#926C35]' : 'text-[#A88337]'
            }`}>
              MENIT
            </span>
          </div>

          <span className={`text-4xl font-bold animate-ping ${
            isFrosted ? 'text-slate-800' : isLightBg ? 'text-[#093A6E]' : 'text-[#FFF7E5]'
          }`}>:</span>

          <div className={`p-4 min-w-[110px] shadow-2xl ${innerShapeClass} border-2 ${
            isFrosted ? 'bg-white/95 border-slate-200 text-slate-950' : isLightBg ? 'bg-white border-[#093A6E]' : 'bg-[#093A6E] border-[#FFF7E5]'
          }`}>
            <span className={`text-4xl md:text-6xl font-black font-mono ${
              isFrosted ? 'text-slate-950' : isLightBg ? 'text-[#093A6E]' : 'text-[#FFF7E5]'
            }`}>
              {timeStr.secs}
            </span>
            <span className={`block text-xs uppercase tracking-widest font-bold mt-1 ${
              isFrosted ? 'text-slate-500' : isLightBg ? 'text-[#926C35]' : 'text-[#A88337]'
            }`}>
              DETIK
            </span>
          </div>
        </div>

        {/* Custom Waiting Message */}
        {config.waitingMessage && (
          <div className={`text-xs md:text-sm font-medium mb-6 flex items-center gap-2 px-4 py-2 ${innerShapeClass} border ${
            isFrosted ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm' : isLightBg ? 'bg-amber-100/80 border-amber-300 text-[#093A6E]' : 'bg-[#093A6E]/80 border-[#FFF7E5]/40 text-[#FFF7E5]'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{config.waitingMessage}</span>
          </div>
        )}

        {/* Speaker Card Preview */}
        {config.speaker.name && (
          <div className={`${innerShapeClass} p-3.5 max-w-md w-full flex items-center justify-center text-center shadow-lg border ${
            isFrosted ? 'bg-white/95 border-slate-200 shadow-md text-slate-900' : isLightBg ? 'bg-white/90 border-[#093A6E]/30 text-[#093A6E]' : 'bg-[#093A6E] border-[#FFF7E5]/40 text-[#FFF7E5]'
          }`}>
            <div>
              <div className={`text-[10px] font-extrabold uppercase tracking-wider ${
                isFrosted ? 'text-slate-500' : isLightBg ? 'text-[#926C35]' : 'text-[#A88337]'
              }`}>
                {config.speaker.institution || 'INSTITUSI PEMBICARA'}
              </div>
              <div className={`text-base font-extrabold mt-0.5 ${
                isFrosted ? 'text-slate-950' : isLightBg ? 'text-[#093A6E]' : 'text-[#FFF7E5]'
              }`}>{config.speaker.name}</div>
              {config.speaker.title && <div className={`text-xs ${
                isFrosted ? 'text-slate-600' : isLightBg ? 'text-slate-600' : 'text-slate-200'
              }`}>{config.speaker.title}</div>}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

