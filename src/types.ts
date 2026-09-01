export type LayoutMode = 'presenter_slide' | 'slide_two_presenters' | 'full_presenter' | 'full_presenter_noborder' | 'split_two' | 'waiting' | 'full_slide_pip' | 'full_slide_only';

export type CameraMode = 'chroma_green' | 'transparent';

export type LowerThirdStyle = 'classic_signature' | 'sleek_modern' | 'minimal_gold' | 'futuristic_glass' | 'uajy_signature';

export type LowerThirdShape = 'sharp' | 'bevel';
export type LowerThirdColor = 'navy' | 'blue' | 'crimson' | 'emerald' | 'gold' | 'dark' | 'frosted_white' | 'custom';
export type LowerThirdFont = 'sans' | 'mono' | 'display' | 'poppins' | 'oswald';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  institution: string;
  avatarUrl?: string;
  topic?: string;
}

export interface LiturgyStep {
  id: string;
  category: string; // e.g. "RITUS PEMBUKA", "LITURGI SABDA", "LITURGI EKARISTI", "KOMUNI", "RITUS PENUTUP"
  title: string;    // e.g. "Perarakan Masuk", "Tanda Salib & Salam", "Doa Syukur Agung"
  posture?: string;  // e.g. "Umat Berdiri", "Umat Duduk", "Umat Berlutut", "Umat Berjalan"
  notes?: string;   // optional notes or hymn numbers
}

export type LiturgyTrackerPosition = 'top_right' | 'top_left' | 'top_center' | 'bottom_right';
export type LiturgyTrackerStyle = 'modern_glass' | 'elegant_gold' | 'sleek_dark' | 'compact_badge';

export interface SlideItem {
  id: string;
  title: string;
  imageUrl: string;
  slideNumber: number;
}

export interface OverlayConfig {
  // Active Layout
  layoutMode: LayoutMode;

  // Speaker Data
  speaker: Speaker;
  speaker2?: Speaker; // For split screen

  // Camera Settings
  cameraMode: CameraMode;
  chromaColor: string; // e.g. "#00FF00"
  showCameraFrame: boolean;
  frameBorderColor: string;

  // Slide Deck & Canva
  slideSourceType: 'canva_embed' | 'image_deck' | 'chroma_green';
  slideChromaColor?: string;
  canvaUrl: string;
  slides: SlideItem[];
  activeSlideIndex: number;
  hideCanvaControlsOnAudience?: boolean;
  autoAdvanceSlides?: boolean;
  autoAdvanceIntervalSeconds?: number;

  // Lower Third Control
  showLowerThird: boolean;
  lowerThirdStyle: LowerThirdStyle;
  lowerThirdPosition?: 'bottom_left' | 'top_left';
  lowerThirdShape?: LowerThirdShape;
  lowerThirdColor?: LowerThirdColor;
  lowerThirdFont?: LowerThirdFont;
  layoutShape?: LowerThirdShape;
  lowerThirdAnimationKey: number; // Increment to re-trigger entrance animation
  customBannerText?: string;

  // Logos
  showLogos: boolean;
  activeLogoUrl: string;
  secondLogoUrl: string;
  logoPosition: 'top_right' | 'top_left' | 'both_corners';

  // Running Text / Ticker
  showTicker: boolean;
  tickerText: string;
  tickerSpeed: number; // seconds per cycle

  // Socials / Watermark
  instagramHandle: string;
  youtubeHandle: string;
  websiteUrl: string;

  // Theme Preset Mode (Cream Light vs Dark Navy vs Frosted Glass Light)
  themePreset?: 'cream' | 'dark' | 'frosted_light';

  // Background Customization
  backgroundUrl?: string;

  // Custom Typography & Colors
  customPrimaryBgColor?: string; // e.g. "#093A6E"
  customAccentColor?: string;    // e.g. "#F59E0B"
  customNameColor?: string;      // e.g. "#FDE68A"
  customTitleColor?: string;     // e.g. "#E2E8F0"

  // Frame & Layout Customization
  frameBorderWidth?: 'thin' | 'normal' | 'thick' | 'extra_thick'; // 2px, 4px, 6px, 8px
  bannerOpacity?: 'opaque' | 'glass_blur' | 'semi_transparent';

  // Logo Customization
  logoSize?: 'small' | 'medium' | 'large';
  logoOpacity?: number; // 0.5 to 1.0

  // Running Text / Ticker Customization
  tickerBadgeTitle?: string;     // e.g. "INFORMASI" or "LIVE"
  tickerBgColor?: string;        // e.g. "#093A6E" or "#000000"
  tickerTextColor?: string;     // e.g. "#FFFFFF"
  tickerBadgeBgColor?: string;   // e.g. "#F59E0B"
  tickerFontSize?: 'small' | 'medium' | 'large';
  tickerFontFamily?: LowerThirdFont;

  // Custom Waiting Screen (Layar Pembuka)
  waitingTitle: string;
  waitingSubtitle: string;
  waitingMessage: string;
  waitingBadgeText: string;
  waitingCountdownMinutes: number;
  waitingBgColor?: string;       // e.g. "#093A6E"
  waitingAccentColor?: string;   // e.g. "#F59E0B"
  waitingFontFamily?: LowerThirdFont;

  // Mass Liturgy / Procession Floating Tracker
  showLiturgyTracker: boolean;
  activeLiturgyIndex: number;
  liturgyTrackerPosition: LiturgyTrackerPosition;
  liturgyTrackerStyle?: LiturgyTrackerStyle;
  showLiturgyPosture?: boolean;
  showLiturgyNextPreview?: boolean;
  liturgyItems: LiturgyStep[];
  liturgyAnimationKey: number;
}
