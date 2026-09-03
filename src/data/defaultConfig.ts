import { OverlayConfig } from '../types';
import { UAJY_EMBLEM_SVG, UAJY_SECONDARY_SVG } from '../assets/uajyLogo';
import { DEFAULT_CATHOLIC_MASS_RUNDOWN } from './defaultLiturgy';

export const PRIMARY_UAJY_LOGO_1 = UAJY_EMBLEM_SVG;
export const PRIMARY_UAJY_LOGO_2 = UAJY_SECONDARY_SVG;

export const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    title: 'Perayaan Ekaristi & Misa Kudus Campus Ministry UAJY',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-185489067527?auto=format&fit=crop&w=1200&q=80',
    slideNumber: 1,
  },
  {
    id: 'slide-2',
    title: "Bacaan Liturgi & Renungan Hari Ini: 'You Shall Be My People'",
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    slideNumber: 2,
  },
  {
    id: 'slide-3',
    title: 'Konseling Pastoral & Rekoleksi Spiritualitas Mahasiswa',
    imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80',
    slideNumber: 3,
  },
  {
    id: 'slide-4',
    title: 'Jadwal Misa Kampus, Peribadatan & Workshop OMK',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    slideNumber: 4,
  },
];

export const defaultConfig: OverlayConfig = {
  configVersion: 2,
  layoutMode: 'full_presenter_noborder',

  speaker: {
    id: 'spk-1',
    name: 'R.D. Yustinus Mahar, Pr.',
    title: 'Selebran Utama / Pastor Moderator Campus Ministry',
    institution: 'Campus Ministry Universitas Atma Jaya Yogyakarta',
    topic: 'Perayaan Ekaristi & Renungan Liturgi - "You Shall Be My People"',
  },

  speaker2: {
    id: 'spk-2',
    name: 'Dr. Maria Benedicta, M.Hum.',
    title: 'Pendamping Pastoral & Lektor Liturgi',
    institution: 'Tim Liturgi & Peribadatan UAJY',
    topic: 'Workshop Spiritualitas & Pendampingan Orang Muda Katolik',
  },

  cameraMode: 'chroma_green',
  cameraSourceType: 'chroma_green',
  chromaColor: '#00FF00',
  showCameraFrame: false,
  frameBorderColor: '#093A6E',

  camera1DeviceId: '',
  camera1Label: 'Kamera 1 (Utama)',
  camera1Mirrored: false,
  camera1Active: false,

  camera2DeviceId: '',
  camera2Label: 'Kamera 2 (Kedua)',
  camera2Mirrored: false,
  camera2Active: false,

  primaryActiveCamera: 'camera1',

  slideSourceType: 'canva_embed',
  canvaUrl: 'https://www.canva.com/design/DAGfsK7x68U/view?embed',
  slides: DEFAULT_SLIDES,
  activeSlideIndex: 0,
  hideCanvaControlsOnAudience: true,
  autoAdvanceSlides: false,
  autoAdvanceIntervalSeconds: 10,

  showLowerThird: false,
  lowerThirdStyle: 'classic_signature',
  lowerThirdPosition: 'bottom_center',
  lowerThirdScale: 1.0,
  lowerThirdShape: 'sharp',
  lowerThirdColor: 'navy',
  lowerThirdFont: 'sans',
  layoutShape: 'sharp',
  lowerThirdAnimationKey: 1,
  customBannerText: 'Selamat Datang di Live Streaming Campus Ministry UAJY',

  showLogos: false,
  activeLogoUrl: '',
  secondLogoUrl: '',
  logoPosition: 'top_left',
  logoSize: 'medium',
  logoOpacity: 1.0,

  showTicker: false,
  tickerText: 'Selamat datang dalam Perayaan Ekaristi & Live Streaming Campus Ministry Universitas Atma Jaya Yogyakarta • Misa Kampus (Miskam): Setiap Hari Rabu pkl 12:00 WIB di Kapel Kampus • Misa Jumat Pertama: Pkl 12:00 WIB • "Faith is taking the first step even when you cannot see the whole staircase" • Konseling Pastoral & Layanan Spiritualitas: campusministry@uajy.ac.id',
  tickerSpeed: 25,
  tickerBadgeTitle: 'LITURGI & INFORMASI',
  tickerBgColor: '#FFF7E5',
  tickerTextColor: '#093A6E',
  tickerBadgeBgColor: '#093A6E',
  tickerFontSize: 'medium',
  tickerFontFamily: 'sans',

  instagramHandle: '@campusministryuajy',
  youtubeHandle: 'Campus Ministry UAJY',
  websiteUrl: 'campusministry.uajy.ac.id',

  // Theme Preset & Custom Colors
  themePreset: 'cream',
  backgroundUrl: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6dzhwbGlqaG5qYW5yYjE0bzMzZmh2YmZnYjJ3YzhxZTkybG1tayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UYBDCJjwOd9Re/giphy.gif',
  customPrimaryBgColor: '#FFF7E5',
  customAccentColor: '#093A6E',
  customNameColor: '#093A6E',
  customTitleColor: '#926C35',
  frameBorderWidth: 'normal',
  bannerOpacity: 'opaque',

  waitingCountdownMinutes: 10,
  waitingTitle: 'PERAYAAN EKARISTI & LIVE STREAMING',
  waitingSubtitle: 'Campus Ministry Universitas Atma Jaya Yogyakarta',
  waitingMessage: 'Marilah mempersiapkan hati dan pikiran kita untuk memasuki suasana peribadatan yang khidmat.',
  waitingBadgeText: 'MISA KUDUS SEGERA DIMULAI',
  waitingBgColor: '#FFF7E5',
  waitingAccentColor: '#093A6E',
  waitingFontFamily: 'sans',

  // Liturgy Mass Rundown Tracker
  showLiturgyTracker: false,
  activeLiturgyIndex: 0,
  liturgyTrackerPosition: 'top_right',
  liturgyTrackerStyle: 'modern_glass',
  showLiturgyPosture: true,
  showLiturgyNextPreview: true,
  liturgyItems: DEFAULT_CATHOLIC_MASS_RUNDOWN,
  liturgyAnimationKey: 1,
};
