import React, { useEffect, useRef } from 'react';
import { OverlayConfig } from '../../types';
import { useCameraDeviceList } from '../../hooks/useCameraDevice';
import {
  Video,
  Camera,
  RefreshCw,
  Check,
  AlertCircle,
  FlipHorizontal,
  Power,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';

interface CameraManagerProps {
  config: OverlayConfig;
  updateConfig: (fields: Partial<OverlayConfig>) => void;
}

export const CameraManager: React.FC<CameraManagerProps> = ({ config, updateConfig }) => {
  const {
    devices,
    hasPermission,
    isLoading,
    error,
    requestPermission,
    refreshDevices,
  } = useCameraDeviceList();

  const preview1Ref = useRef<HTMLVideoElement>(null);
  const preview2Ref = useRef<HTMLVideoElement>(null);

  // Preview live streams in admin panel for camera 1
  useEffect(() => {
    let stream1: MediaStream | null = null;
    if (config.cameraMode === 'live_device' && config.camera1Active !== false) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: config.camera1DeviceId
            ? { deviceId: { exact: config.camera1DeviceId } }
            : true,
          audio: false,
        })
        .then((s) => {
          stream1 = s;
          if (preview1Ref.current) {
            preview1Ref.current.srcObject = s;
            preview1Ref.current.play().catch(() => {});
          }
        })
        .catch((e) => {
          console.warn('Cam 1 admin preview err:', e);
        });
    }

    return () => {
      if (stream1) {
        stream1.getTracks().forEach((t) => t.stop());
      }
      if (preview1Ref.current) {
        preview1Ref.current.srcObject = null;
      }
    };
  }, [config.cameraMode, config.camera1DeviceId, config.camera1Active]);

  // Preview live streams in admin panel for camera 2
  useEffect(() => {
    let stream2: MediaStream | null = null;
    if (config.cameraMode === 'live_device' && config.camera2Active !== false) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: config.camera2DeviceId
            ? { deviceId: { exact: config.camera2DeviceId } }
            : true,
          audio: false,
        })
        .then((s) => {
          stream2 = s;
          if (preview2Ref.current) {
            preview2Ref.current.srcObject = s;
            preview2Ref.current.play().catch(() => {});
          }
        })
        .catch((e) => {
          console.warn('Cam 2 admin preview err:', e);
        });
    }

    return () => {
      if (stream2) {
        stream2.getTracks().forEach((t) => t.stop());
      }
      if (preview2Ref.current) {
        preview2Ref.current.srcObject = null;
      }
    };
  }, [config.cameraMode, config.camera2DeviceId, config.camera2Active]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-black text-[#093A6E] flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-500" />
            Pengaturan Kamera Siaran & Video Input
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Pilih perangkat webcam / capture card, atur 2 kamera independen untuk mode Slide+1, Slide+2, 1 Kamera, dan 2 Kamera.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => requestPermission()}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{hasPermission ? '✓ Izin Diberikan' : 'Izinkan Kamera'}</span>
          </button>

          <button
            onClick={() => refreshDevices()}
            disabled={isLoading}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-all cursor-pointer"
            title="Muat Ulang Daftar Perangkat Kamera"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Camera Source Mode Selection (3 Modes) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#093A6E]" />
          Mode Output Kamera di OBS / Browser:
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mode 1: Live WebRTC / Capture Card */}
          <button
            onClick={() => updateConfig({ cameraMode: 'live_device' })}
            className={`p-3.5 rounded-2xl border-2 text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              config.cameraMode === 'live_device'
                ? 'border-[#093A6E] bg-blue-50/70 shadow-md ring-2 ring-blue-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#093A6E] flex items-center gap-1.5">
                📹 Kamera Langsung (WebRTC)
              </span>
              {config.cameraMode === 'live_device' && (
                <span className="text-[9px] bg-[#093A6E] text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full">
                  AKTIF
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Menampilkan video langsung dari webcam, capture card (Cam Link), atau OBS Virtual Camera.
            </p>
          </button>

          {/* Mode 2: Chroma Green (#00FF00) */}
          <button
            onClick={() => updateConfig({ cameraMode: 'chroma_green' })}
            className={`p-3.5 rounded-2xl border-2 text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              config.cameraMode === 'chroma_green'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-emerald-800 flex items-center gap-1.5">
                💚 Chroma Green (#00FF00)
              </span>
              {config.cameraMode === 'chroma_green' && (
                <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                  AKTIF
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Kotak hijau terang untuk ditembus filter Chroma Key di OBS Studio.
            </p>
          </button>

          {/* Mode 3: Transparent Cutout */}
          <button
            onClick={() => updateConfig({ cameraMode: 'transparent' })}
            className={`p-3.5 rounded-2xl border-2 text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
              config.cameraMode === 'transparent'
                ? 'border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-purple-800 flex items-center gap-1.5">
                ✨ Transparan (OBS Layer)
              </span>
              {config.cameraMode === 'transparent' && (
                <span className="text-[9px] bg-purple-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                  AKTIF
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Area berlubang tembus pandang untuk di-layer di atas video kamera OBS.
            </p>
          </button>
        </div>
      </div>

      {/* 2. DUAL CAMERA DEVICE SLOTS (CAMERA 1 & CAMERA 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* ================= CAMERA 1 CARD ================= */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#093A6E] text-amber-300 font-mono font-black text-xs flex items-center justify-center">
                1
              </span>
              <span className="font-black text-sm text-[#093A6E]">
                KAMERA 1 (UTAMA)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateConfig({ camera1Mirrored: !config.camera1Mirrored })}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  config.camera1Mirrored
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-300 text-slate-600'
                }`}
                title="Cerminkan / Flip Horizontal Kamera 1"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Mirror</span>
              </button>

              <button
                onClick={() => updateConfig({ camera1Active: config.camera1Active === false })}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  config.camera1Active !== false
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-rose-100 border-rose-300 text-rose-700'
                }`}
                title={config.camera1Active !== false ? 'Matikan Kamera 1' : 'Nyalakan Kamera 1'}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Device Selection Dropdown for Camera 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-700">
              PILIH PERANGKAT KAMERA 1:
            </label>
            <select
              value={config.camera1DeviceId || ''}
              onChange={(e) => updateConfig({ camera1DeviceId: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#093A6E] focus:border-[#093A6E]"
            >
              <option value="">-- Kamera Default Sistem (Otomatis) --</option>
              {devices.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Kamera ${idx + 1}`}
                </option>
              ))}
            </select>
            {devices.length === 0 && (
              <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                💡 Klik tombol "Izinkan Kamera" di atas agar daftar webcam/capture card Anda muncul.
              </p>
            )}
          </div>

          {/* Label Input for Camera 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-700">
              NAMA / LABEL KAMERA 1:
            </label>
            <input
              type="text"
              value={config.camera1Label || ''}
              onChange={(e) => updateConfig({ camera1Label: e.target.value })}
              placeholder="Contoh: Kamera 1 - Pastor / Selebran"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          {/* Mini Live Preview for Camera 1 */}
          {config.cameraMode === 'live_device' && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                Preview Live Kamera 1:
              </span>
              <div className="w-full aspect-video bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-300 shadow-inner">
                <video
                  ref={preview1Ref}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${config.camera1Mirrored ? '-scale-x-100' : ''}`}
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {config.camera1Label || 'KAMERA 1'}
                </span>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
            📌 Digunakan pada: <strong>Slide + 1 Kamera</strong>, <strong>Slot Atas Slide + 2</strong>, <strong>Kamera 1 Split</strong>, dan <strong>PIP</strong>.
          </div>
        </div>

        {/* ================= CAMERA 2 CARD ================= */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-700 text-white font-mono font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="font-black text-sm text-sky-900">
                KAMERA 2 (KEDUA)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateConfig({ camera2Mirrored: !config.camera2Mirrored })}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  config.camera2Mirrored
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-300 text-slate-600'
                }`}
                title="Cerminkan / Flip Horizontal Kamera 2"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Mirror</span>
              </button>

              <button
                onClick={() => updateConfig({ camera2Active: config.camera2Active === false })}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  config.camera2Active !== false
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-rose-100 border-rose-300 text-rose-700'
                }`}
                title={config.camera2Active !== false ? 'Matikan Kamera 2' : 'Nyalakan Kamera 2'}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Device Selection Dropdown for Camera 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-700">
              PILIH PERANGKAT KAMERA 2:
            </label>
            <select
              value={config.camera2DeviceId || ''}
              onChange={(e) => updateConfig({ camera2DeviceId: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
            >
              <option value="">-- Pilih Kamera Kedua / Capture Card 2 --</option>
              {devices.map((device, idx) => (
                <option key={device.deviceId || idx} value={device.deviceId}>
                  {device.label || `Kamera ${idx + 1}`}
                </option>
              ))}
            </select>
            {devices.length < 2 && (
              <p className="text-[10px] text-slate-500 bg-white p-1.5 rounded-lg border border-slate-200">
                ℹ️ Hubungkan webcam kedua atau capture card tambahan di komputer Anda jika ingin 2 angle kamera berbeda.
              </p>
            )}
          </div>

          {/* Label Input for Camera 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-700">
              NAMA / LABEL KAMERA 2:
            </label>
            <input
              type="text"
              value={config.camera2Label || ''}
              onChange={(e) => updateConfig({ camera2Label: e.target.value })}
              placeholder="Contoh: Kamera 2 - Lektor / Paduan Suara"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          {/* Mini Live Preview for Camera 2 */}
          {config.cameraMode === 'live_device' && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                Preview Live Kamera 2:
              </span>
              <div className="w-full aspect-video bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-300 shadow-inner">
                <video
                  ref={preview2Ref}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${config.camera2Mirrored ? '-scale-x-100' : ''}`}
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {config.camera2Label || 'KAMERA 2'}
                </span>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
            📌 Digunakan pada: <strong>Slot Bawah Slide + 2 Kamera</strong>, <strong>Kamera 2 Split</strong>, dan pilihan kamera solo.
          </div>
        </div>
      </div>

      {/* 3. SOLO CAMERA SWITCHER (FOR 1 KAMERA LAYOUTS) */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#093A6E] uppercase tracking-wide flex items-center gap-1.5">
            🎯 Pilihan Kamera Aktif untuk Mode "1 Kamera" Solo:
          </span>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Saat Anda memilih layout 1 Kamera (Full Screen atau Dengan Frame), tentukan kamera mana yang ingin ditampilkan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => updateConfig({ primaryActiveCamera: 'camera1' })}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
              (config.primaryActiveCamera || 'camera1') === 'camera1'
                ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm ring-2 ring-amber-400'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>📹 Kamera 1</span>
            {(config.primaryActiveCamera || 'camera1') === 'camera1' && <Check className="w-3.5 h-3.5 text-amber-300" />}
          </button>

          <button
            onClick={() => updateConfig({ primaryActiveCamera: 'camera2' })}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
              config.primaryActiveCamera === 'camera2'
                ? 'bg-sky-700 text-white border-sky-700 shadow-sm ring-2 ring-amber-400'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>📹 Kamera 2</span>
            {config.primaryActiveCamera === 'camera2' && <Check className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* 4. FRAME STYLING & CHROMA KEY COLOR */}
      <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
            Garis Bingkai Kamera (Border Frame) & Mode Screen
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => updateConfig({ showCameraFrame: !config.showCameraFrame })}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                config.showCameraFrame
                  ? 'bg-[#093A6E] text-white border-[#093A6E]'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {config.showCameraFrame ? 'Bingkai Aktif' : 'Tanpa Bingkai'}
            </button>

            <button
              onClick={() => updateConfig({ layoutMode: 'full_presenter_noborder', showCameraFrame: false })}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                config.layoutMode === 'full_presenter_noborder' && !config.showCameraFrame
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
            >
              <span>📹 Set Mode: Full Screen (Tanpa Border)</span>
            </button>

            <input
              type="color"
              value={config.frameBorderColor || '#093A6E'}
              onChange={(e) => updateConfig({ frameBorderColor: e.target.value })}
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-xs"
              title="Warna Garis Bingkai Kamera"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
            Warna Chroma Key Green (Jika Menggunakan Mode Chroma)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.chromaColor || '#00FF00'}
              onChange={(e) => updateConfig({ chromaColor: e.target.value })}
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-xs"
            />
            <input
              type="text"
              value={config.chromaColor || '#00FF00'}
              onChange={(e) => updateConfig({ chromaColor: e.target.value })}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
