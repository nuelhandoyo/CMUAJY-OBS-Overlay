import { useState, useEffect, useCallback } from 'react';

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

  const enumerateCameras = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      setError('MediaDevices API tidak didukung di browser ini.');
      return [];
    }

    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${index + 1} (${d.deviceId ? d.deviceId.slice(0, 8) + '...' : 'Default'})`,
          groupId: d.groupId,
        }));

      setDevices(videoDevices);
      return videoDevices;
    } catch (err: any) {
      console.warn('Gagal membaca daftar perangkat kamera:', err);
      setError(err?.message || 'Gagal membaca kamera');
      return [];
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('MediaDevices API tidak tersedia.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // Release immediate stream
      tempStream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      await enumerateCameras();
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Izin kamera ditolak atau tidak tersedia:', err);
      setHasPermission(false);
      setError(err?.message || 'Izin kamera ditolak oleh browser.');
      setIsLoading(false);
      return false;
    }
  }, [enumerateCameras]);

  useEffect(() => {
    enumerateCameras();

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
    requestPermission,
    refreshDevices: enumerateCameras,
  };
}
