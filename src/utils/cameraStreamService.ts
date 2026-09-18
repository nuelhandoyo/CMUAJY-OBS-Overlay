/**
 * Camera Stream Service
 * Solusi singleton & pooling stream kamera untuk mengatasi:
 * 1. Konflik eksklusif hardware di Windows (NotReadableError / Device in use) ketika dipanggil berkali-kali
 * 2. OverconstrainedError akibat deviceId berubah / berbeda origin antara preview dan lokal
 * 3. Deteksi Secure Context (HTTPS vs HTTP localhost vs HTTP IP LAN)
 */

interface StreamEntry {
  stream: MediaStream;
  refCount: number;
}

const streamPool = new Map<string, StreamEntry>();

export function checkSecureContext(): { isSecure: boolean; message?: string } {
  if (typeof window === 'undefined') return { isSecure: true };

  if (!window.isSecureContext) {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isLocalhost) {
      return {
        isSecure: false,
        message: `Browser memblokir kamera karena dibuka via HTTP (${window.location.origin}). Buka via http://localhost:3000 pada komputer ini atau gunakan HTTPS.`,
      };
    }
  }

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      isSecure: false,
      message: 'Browser ini tidak mendukung navigator.mediaDevices.getUserMedia (WebRTC).',
    };
  }

  return { isSecure: true };
}

/**
 * Mendapatkan MediaStream kamera dengan strategi self-healing:
 * - Menggunakan ideal constraint (bukan exact) agar tidak gagal jika deviceId berbeda/berubah
 * - Sharing stream antar komponen (Admin preview + Audience overlay) agar tidak terjadi konflik hardware lock di Windows
 * - Fallback bertingkat (1080p -> 720p -> generic default camera)
 */
export async function acquireCameraStream(targetDeviceId?: string): Promise<MediaStream> {
  const secureStatus = checkSecureContext();
  if (!secureStatus.isSecure) {
    throw new Error(secureStatus.message || 'Kamera tidak dapat diakses di lingkungan ini.');
  }

  const poolKey = targetDeviceId && targetDeviceId.trim() ? targetDeviceId.trim() : '__default__';

  // 1. Cek apakah stream sudah ada dan masih aktif
  const existing = streamPool.get(poolKey);
  if (existing && existing.stream.active) {
    const activeTracks = existing.stream.getVideoTracks().filter((t) => t.readyState === 'live');
    if (activeTracks.length > 0) {
      existing.refCount++;
      return existing.stream;
    }
  }

  // 2. Jika tidak ada, buat stream baru dengan strategi self-healing
  let stream: MediaStream;

  const buildConstraints = (res: '1080' | '720' | 'any', devId?: string): MediaStreamConstraints => {
    const videoConstraint: MediaTrackConstraints = {};

    if (devId && devId.trim()) {
      videoConstraint.deviceId = { ideal: devId.trim() };
    }

    if (res === '1080') {
      videoConstraint.width = { ideal: 1920 };
      videoConstraint.height = { ideal: 1080 };
      videoConstraint.frameRate = { ideal: 30, max: 60 };
    } else if (res === '720') {
      videoConstraint.width = { ideal: 1280 };
      videoConstraint.height = { ideal: 720 };
    }

    return { video: Object.keys(videoConstraint).length > 0 ? videoConstraint : true, audio: false };
  };

  try {
    // Percobaan 1: Ideal 1080p dengan deviceId
    stream = await navigator.mediaDevices.getUserMedia(buildConstraints('1080', targetDeviceId));
  } catch (err1: any) {
    console.warn('[CameraService] Percobaan 1 (1080p ideal) gagal, mencoba 720p fallback:', err1?.message);
    try {
      // Percobaan 2: Fallback ke 720p
      stream = await navigator.mediaDevices.getUserMedia(buildConstraints('720', targetDeviceId));
    } catch (err2: any) {
      console.warn('[CameraService] Percobaan 2 (720p) gagal, mencoba kamera default generik:', err2?.message);
      try {
        // Percobaan 3: Generic camera tanpa resolusi
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err3: any) {
        console.error('[CameraService] Semua percobaan akuisisi kamera gagal:', err3);
        if (err3?.name === 'NotReadableError' || err3?.name === 'TrackStartError') {
          throw new Error('Kamera sedang digunakan oleh aplikasi lain atau OBS Video Capture Device. Tutup aplikasi tersebut atau gunakan mode Chroma Green di OBS.');
        } else if (err3?.name === 'NotAllowedError' || err3?.name === 'PermissionDeniedError') {
          throw new Error('Izin kamera belum diberikan. Klik tombol "Izinkan Akses Kamera" di browser.');
        } else if (err3?.name === 'NotFoundError') {
          throw new Error('Tidak ditemukan perangkat kamera webcam / capture card di komputer ini.');
        }
        throw err3;
      }
    }
  }

  // Simpan ke pool
  streamPool.set(poolKey, {
    stream,
    refCount: 1,
  });

  return stream;
}

/**
 * Melepaskan penggunaan stream
 */
export function releaseCameraStream(targetDeviceId?: string) {
  const poolKey = targetDeviceId && targetDeviceId.trim() ? targetDeviceId.trim() : '__default__';
  const entry = streamPool.get(poolKey);
  if (!entry) return;

  entry.refCount--;
  if (entry.refCount <= 0) {
    // Tunggu sedikit sebelum mematikan track agar transisi perpindahan view tidak flicker
    setTimeout(() => {
      const current = streamPool.get(poolKey);
      if (current && current.refCount <= 0) {
        current.stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        streamPool.delete(poolKey);
      }
    }, 1500);
  }
}

/**
 * Membaca daftar perangkat video input dengan label bersih dan deduplikasi
 */
export async function getCleanVideoDevices(): Promise<Array<{ deviceId: string; label: string; groupId: string }>> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const seen = new Set<string>();
    const result: Array<{ deviceId: string; label: string; groupId: string }> = [];

    let fallbackCounter = 1;
    for (const d of allDevices) {
      if (d.kind === 'videoinput') {
        const id = d.deviceId;
        if (id && seen.has(id)) continue;
        if (id) seen.add(id);

        const cleanLabel = d.label
          ? d.label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)$/i, '') // Hapus ID hardware yang berantakan
          : `Kamera ${fallbackCounter} (Izinkan kamera untuk melihat nama asli)`;

        result.push({
          deviceId: id,
          label: cleanLabel,
          groupId: d.groupId,
        });
        fallbackCounter++;
      }
    }

    return result;
  } catch (e) {
    console.warn('[CameraService] Gagal enumerateDevices:', e);
    return [];
  }
}
