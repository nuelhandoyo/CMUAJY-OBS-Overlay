import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraMode, LowerThirdShape } from '../../types';
import { getLayoutShapeClass, getFrameBorderStyle } from '../../utils/shapeUtils';
import { Video, VideoOff, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { acquireCameraStream, releaseCameraStream, checkSecureContext } from '../../utils/cameraStreamService';

interface CameraBoxProps {
  cameraMode: CameraMode;
  deviceId?: string;
  isMirrored?: boolean;
  isActive?: boolean;
  chromaColor?: string;
  showFrame?: boolean;
  frameColor?: string;
  borderWidth?: 'thin' | 'normal' | 'thick' | 'extra_thick' | string;
  shape?: LowerThirdShape;
  label?: string;
  className?: string;
}

export const CameraBox: React.FC<CameraBoxProps> = ({
  cameraMode = 'live_device',
  deviceId,
  isMirrored = false,
  isActive = true,
  chromaColor = '#00FF00',
  showFrame = false,
  frameColor = '#3B82F6',
  borderWidth = 'normal',
  shape = 'rounded',
  label,
  className = 'w-full h-full',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [insecureContext, setInsecureContext] = useState<boolean>(false);

  const shapeClass = getLayoutShapeClass(shape);
  const borderStyle = getFrameBorderStyle(showFrame, frameColor, borderWidth, shape);

  // Manage Live Camera Stream when cameraMode is 'live_device'
  useEffect(() => {
    let isCancelled = false;
    const targetDevId = deviceId;

    if (cameraMode !== 'live_device' || isActive === false) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setError(null);
      return;
    }

    const startCamera = async () => {
      setIsLoading(true);
      setError(null);
      setPermissionDenied(false);
      setInsecureContext(false);

      const sec = checkSecureContext();
      if (!sec.isSecure) {
        setInsecureContext(true);
        setError(sec.message || 'Kamera diblokir oleh browser dalam mode HTTP.');
        setIsLoading(false);
        return;
      }

      try {
        const mediaStream = await acquireCameraStream(targetDevId);

        if (isCancelled) {
          releaseCameraStream(targetDevId);
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((e) => {
            console.warn('Autoplay video warning:', e);
          });
        }
        setIsLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.warn('Gagal memuat stream kamera:', err);
        setIsLoading(false);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          setError('Izin kamera belum diaktifkan di browser.');
        } else {
          setError(err?.message || 'Gagal menghubungkan ke feed kamera.');
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      releaseCameraStream(targetDevId);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraMode, deviceId, isActive]);

  const handleRequestPermission = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tempStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      setPermissionDenied(false);
      setError(null);
      // Reload stream
      if (deviceId) {
        const s = await acquireCameraStream(deviceId);
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      alert('Izin kamera tetap diblokir. Harap aktifkan izin kamera di address bar browser Anda (ikon gembok / kamera).');
    }
  };

  return (
    <div
      className={`relative ${shapeClass} overflow-hidden transition-all duration-300 flex items-center justify-center bg-slate-950 ${className}`}
      style={{
        ...borderStyle,
        borderRadius: 'inherit',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      }}
    >
      <AnimatePresence mode="wait">
        {/* 1. LIVE CAMERA DEVICE STREAM (WebRTC / Capture Card / OBS Virtual Cam) */}
        {cameraMode === 'live_device' && (
          <motion.div
            key={`live-${deviceId}-${isActive}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isMirrored ? '-scale-x-100' : 'scale-x-100'
              }`}
            />

            {/* Standby / Loading / Error Overlay if no active video */}
            {(!stream || error || isLoading) && (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-10 select-none">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Menghubungkan ke Feed Kamera...
                    </span>
                  </div>
                ) : insecureContext ? (
                  <div className="flex flex-col items-center gap-2.5 max-w-sm p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-white">
                    <ShieldAlert className="w-8 h-8 text-rose-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-rose-200">
                      Koneksi Tidak Aman (HTTP)
                    </span>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Browser memblokir kamera karena dibuka melalui IP/HTTP. Silakan buka melalui <strong>http://localhost:3000</strong> di komputer ini.
                    </p>
                  </div>
                ) : permissionDenied ? (
                  <div className="flex flex-col items-center gap-2.5 max-w-sm">
                    <AlertCircle className="w-9 h-9 text-rose-500" />
                    <span className="text-sm font-extrabold text-white">
                      Izin Kamera Diperlukan
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Sistem membutuhkan izin untuk menampilkan video dari webcam / capture card Anda.
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                    >
                      Izinkan Akses Kamera
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 max-w-xs">
                    <div className="w-12 h-12 rounded-2xl bg-[#093A6E]/80 border border-amber-400/40 flex items-center justify-center shadow-lg">
                      <Video className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      {label || 'Feed Kamera'}
                    </span>
                    {error ? (
                      <span className="text-[11px] text-rose-300 font-medium px-2 py-1 bg-rose-950/60 rounded border border-rose-800/80 leading-snug">
                        {error}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        {deviceId ? 'Device Terhubung' : 'Pilih perangkat di Tab Kamera'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* 2. CHROMA GREEN (#00FF00) MODE */}
        {cameraMode === 'chroma_green' && (
          <motion.div
            key={`chroma-${chromaColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-full relative flex items-center justify-center"
            style={{ backgroundColor: chromaColor || '#00FF00', borderRadius: 'inherit' }}
          />
        )}

        {/* 3. TRANSPARENT MODE */}
        {cameraMode === 'transparent' && (
          <motion.div
            key="transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-full bg-transparent relative flex items-center justify-center"
            style={{ borderRadius: 'inherit' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
