import { useState, useEffect, useCallback } from 'react';
import { checkSecureContext, getCleanVideoDevices } from '../utils/cameraStreamService';

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

export function useCameraDeviceList() {
  const [devices, setDevices] = useState<CameraDeviceInfo[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState<boolean>(true);

  const enumerateCameras = useCallback(async () => {
    const sec = checkSecureContext();
    if (!sec.isSecure) {
      setIsSecure(false);
      setError(sec.message || 'Kamera tidak didukung dalam koneksi HTTP tidak aman.');
      return [];
    }
    setIsSecure(true);

    try {
      const cleanDevices = await getCleanVideoDevices();
      setDevices(cleanDevices);

      // Cek apakah perangkat sudah memiliki label nama asli (tanda izin sudah diberikan)
      const hasNamedDevices = cleanDevices.some(
        (d) => d.label && !d.label.includes('Izinkan kamera untuk melihat nama asli')
      );
      if (hasNamedDevices) {
        setHasPermission(true);
      }

      return cleanDevices;
    } catch (err: any) {
      console.warn('Gagal membaca daftar perangkat kamera:', err);
      setError(err?.message || 'Gagal membaca kamera');
      return [];
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const sec = checkSecureContext();
    if (!sec.isSecure) {
      setError(sec.message || 'MediaDevices API tidak tersedia dalam mode HTTP.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buka stream singkat untuk meminta izin browser
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // Segera matikan stream pembuka izin
      tempStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });

      setHasPermission(true);
      await enumerateCameras();
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Izin kamera ditolak atau tidak tersedia:', err);
      setHasPermission(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Izin kamera ditolak oleh browser. Klik ikon gembok/kamera di address bar untuk mengizinkan.');
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        setError('Kamera fisik sedang digunakan oleh aplikasi lain (OBS Studio / Zoom). Tutup aplikasi tersebut atau gunakan mode Chroma Green di OBS.');
      } else {
        setError(err?.message || 'Izin kamera gagal diperoleh.');
      }
      setIsLoading(false);
      return false;
    }
  }, [enumerateCameras]);

  useEffect(() => {
    enumerateCameras();

    // Periksa status permission via Permissions API jika didukung browser
    if (typeof navigator !== 'undefined' && (navigator as any).permissions?.query) {
      try {
        (navigator as any).permissions
          .query({ name: 'camera' })
          .then((permissionStatus: any) => {
            if (permissionStatus.state === 'granted') {
              setHasPermission(true);
              enumerateCameras();
            } else if (permissionStatus.state === 'denied') {
              setHasPermission(false);
            }
            permissionStatus.onchange = () => {
              setHasPermission(permissionStatus.state === 'granted');
              enumerateCameras();
            };
          })
          .catch(() => {});
      } catch {}
    }

    const handleDeviceChange = () => {
      enumerateCameras();
    };

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [enumerateCameras]);

  return {
    devices,
    hasPermission,
    isLoading,
    error,
    isSecure,
    requestPermission,
    refreshDevices: enumerateCameras,
  };
}
