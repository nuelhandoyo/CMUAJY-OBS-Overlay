import React from 'react';

interface FuturisticBackgroundProps {
  backgroundUrl?: string;
}

const DEFAULT_GIF_URL = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6dzhwbGlqaG5qYW5yYjE0bzMzZmh2YmZnYjJ3YzhxZTkybG1tayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UYBDCJjwOd9Re/giphy.gif';

export const FuturisticBackground: React.FC<FuturisticBackgroundProps> = ({ backgroundUrl }) => {
  const bgUrl = backgroundUrl || DEFAULT_GIF_URL;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#030712]">
      {/* Background Image / Animated GIF Layer */}
      {bgUrl ? (
        <>
          <img
            src={bgUrl}
            alt="Live Overlay Background"
            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
          />
          {/* Subtle dark tint gradient for visual contrast on overlays */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </>
      ) : (
        <>
          {/* Deep Cyber Space Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0b1528] to-[#020617] animate-pulse-slow" />

          {/* Cybernetic Perspective Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0284c71a_1px,transparent_1px),linear-gradient(to_bottom,#0284c71a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
          />

          {/* Animated Sci-Fi Grid Flow Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.08)_50%,transparent_100%)] bg-[size:100%_8rem] animate-cyber-scan" />

          {/* Futuristic Energy Cores / Ambient Glow Nodes */}
          <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] bg-cyan-600/15 rounded-full blur-[120px] animate-orb-1" />
          <div className="absolute -bottom-32 -right-32 w-[42rem] h-[42rem] bg-blue-600/20 rounded-full blur-[140px] animate-orb-2" />
        </>
      )}

      {/* Cybernetic HUD Geometry Corners (Top-Left & Bottom-Right) */}
      <svg className="absolute top-4 left-4 w-16 h-16 text-cyan-500/30 stroke-current fill-none pointer-events-none z-10" viewBox="0 0 100 100">
        <path d="M0,30 L0,0 L30,0 M0,0 L40,40" strokeWidth="2" />
        <circle cx="40" cy="40" r="3" className="fill-cyan-400/50" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-16 h-16 text-cyan-500/30 stroke-current fill-none pointer-events-none rotate-180 z-10" viewBox="0 0 100 100">
        <path d="M0,30 L0,0 L30,0 M0,0 L40,40" strokeWidth="2" />
        <circle cx="40" cy="40" r="3" className="fill-cyan-400/50" />
      </svg>
    </div>
  );
};

