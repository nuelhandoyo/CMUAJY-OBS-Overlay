import React, { useState } from 'react';
import { OverlayConfig } from '../types';
import { AudienceOverlay } from './AudienceOverlay';
import { LiturgyManager } from './admin/LiturgyManager';
import { getCanvaEmbedUrl } from '../utils/canva';
import { UAJY_EMBLEM_SVG, UAJY_SECONDARY_SVG } from '../assets/uajyLogo';
import {
  Monitor,
  Layout,
  User,
  Video,
  Presentation,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Link,
  Image as ImageIcon,
  RotateCcw,
  Clock,
  HelpCircle,
  Info,
  Tv,
  Laptop,
  Globe,
  Share2,
  X,
  Key,
  RefreshCw,
  Sliders,
  ListOrdered,
  SkipBack,
  SkipForward,
} from 'lucide-react';

interface AdminPanelProps {
  config: OverlayConfig;
  onChangeConfig: (newConfig: OverlayConfig) => void;
  onOpenAudienceWindow: () => void;
  onSwitchToAudienceView?: () => void;
  roomCode?: string;
  onChangeRoomCode?: (newCode: string) => void;
  syncStatus?: {
    status: 'connected' | 'syncing' | 'offline';
    code: string;
    subscribers: number;
    lastSyncTime: number;
  };
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  onChangeConfig,
  onOpenAudienceWindow,
  onSwitchToAudienceView,
  roomCode = 'UAJY-MISA',
  onChangeRoomCode,
  syncStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'liturgy' | 'speaker' | 'waiting_screen' | 'camera' | 'slides' | 'branding'>('layout');
  const [copiedType, setCopiedType] = useState<'audience' | 'operator' | 'room_code' | null>(null);
  const [showObsGuideModal, setShowObsGuideModal] = useState(false);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  
  // Custom room code editing state
  const [inputCode, setInputCode] = useState(roomCode);
  const [isEditingCode, setIsEditingCode] = useState(false);

  // URLs for Audience and Operator with room/session code
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const audienceUrl = `${baseUrl}?view=audience&code=${encodeURIComponent(roomCode)}`;
  const operatorUrl = `${baseUrl}?view=operator&code=${encodeURIComponent(roomCode)}`;

  const handleApplyNewCode = () => {
    if (onChangeRoomCode && inputCode.trim()) {
      onChangeRoomCode(inputCode.trim());
      setIsEditingCode(false);
    }
  };

  const handleGenerateRandomCode = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newGenCode = `UAJY-${randomSuffix}`;
    setInputCode(newGenCode);
    if (onChangeRoomCode) {
      onChangeRoomCode(newGenCode);
      setIsEditingCode(false);
    }
  };

  const updateConfig = (fields: Partial<OverlayConfig>) => {
    onChangeConfig({ ...config, ...fields });
  };

  const copyToClipboard = (url: string, type: 'audience' | 'operator') => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetKey: 'activeLogoUrl' | 'secondLogoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateConfig({ [targetKey]: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogos = () => {
    updateConfig({
      showLogos: false,
      activeLogoUrl: '',
      secondLogoUrl: '',
      logoPosition: 'top_left',
    });
  };

  const updateSpeaker = (fields: Partial<typeof config.speaker>) => {
    updateConfig({
      speaker: { ...config.speaker, ...fields },
    });
  };

  const updateSpeaker2 = (fields: Partial<typeof config.speaker2>) => {
    updateConfig({
      speaker2: {
        id: config.speaker2?.id || 'spk-2',
        name: config.speaker2?.name || '',
        title: config.speaker2?.title || '',
        institution: config.speaker2?.institution || '',
        ...fields,
      },
    });
  };

  const triggerLowerThirdAnim = () => {
    updateConfig({
      showLowerThird: true,
      lowerThirdAnimationKey: (config.lowerThirdAnimationKey || 0) + 1,
    });
  };

  const copyAudienceUrl = () => {
    copyToClipboard(audienceUrl, 'audience');
  };

  const handleNextSlide = () => {
    if (config.slides.length === 0) return;
    const nextIdx = (config.activeSlideIndex + 1) % config.slides.length;
    updateConfig({ activeSlideIndex: nextIdx });
  };

  const handlePrevSlide = () => {
    if (config.slides.length === 0) return;
    const prevIdx = (config.activeSlideIndex - 1 + config.slides.length) % config.slides.length;
    updateConfig({ activeSlideIndex: prevIdx });
  };

  const handleAddSlide = () => {
    if (!newSlideUrl) return;
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: newSlideTitle || `Slide ${config.slides.length + 1}`,
      imageUrl: newSlideUrl,
      slideNumber: config.slides.length + 1,
    };
    const updatedSlides = [...config.slides, newSlide];
    updateConfig({
      slides: updatedSlides,
      activeSlideIndex: updatedSlides.length - 1,
    });
    setNewSlideUrl('');
    setNewSlideTitle('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result as string;
        if (resultUrl) {
          const newSlide = {
            id: `slide-${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            imageUrl: resultUrl,
            slideNumber: config.slides.length + 1,
          };
          const updatedSlides = [...config.slides, newSlide];
          updateConfig({
            slides: updatedSlides,
            activeSlideIndex: updatedSlides.length - 1,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSlide = (index: number) => {
    const updated = config.slides.filter((_, i) => i !== index);
    const newActive = Math.max(0, Math.min(config.activeSlideIndex, updated.length - 1));
    updateConfig({
      slides: updated,
      activeSlideIndex: newActive,
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Light Admin Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#093A6E] text-amber-400 rounded-xl font-bold shadow-md">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#093A6E] tracking-tight flex items-center gap-2 flex-wrap">
              OBS OVERLAY OPERATOR
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                LIGHT MODE • REAL-TIME SYNC
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                ✨ 4K UHD • 2K • 1080p READY
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Panel Kontrol Admin Campus Ministry UAJY • Mendukung Layar 4K UHD (3840×2160) & 1080p
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowObsGuideModal(true)}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Buka Petunjuk Pengaturan OBS Studio"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Panduan OBS</span>
          </button>

          <button
            onClick={() => copyToClipboard(audienceUrl, 'audience')}
            className={`flex items-center gap-1.5 border text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs ${
              copiedType === 'audience'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
            title="Salin URL OBS (?view=audience)"
          >
            {copiedType === 'audience' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Copy className="w-4 h-4 text-amber-500" />
            )}
            <span>{copiedType === 'audience' ? 'URL OBS Tersalin!' : 'Salin URL OBS (Audience)'}</span>
          </button>

          <button
            onClick={() => copyToClipboard(operatorUrl, 'operator')}
            className={`flex items-center gap-1.5 border text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs ${
              copiedType === 'operator'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
            title="Salin URL Operator (?view=operator)"
          >
            {copiedType === 'operator' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Copy className="w-4 h-4 text-blue-600" />
            )}
            <span>{copiedType === 'operator' ? 'URL Operator Tersalin!' : 'Salin URL Operator'}</span>
          </button>

          <button
            onClick={onOpenAudienceWindow}
            className="flex items-center gap-1.5 bg-[#093A6E] hover:bg-blue-900 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer border border-blue-900"
            title="Buka Overlay Audience di Tab Baru"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Buka Layar Audience</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1800px] w-full mx-auto">
        {/* LEFT / TOP SECTION: Live Preview Canvas (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex flex-col gap-3 sticky top-24">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              <span className="flex items-center gap-2 text-[#093A6E]">
                <Monitor className="w-4 h-4 text-amber-500" />
                Live Preview Output Audience
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                SINKRON LANGSUNG
              </span>
            </div>

            {/* Quick Control Bar: Name Tag Toggle & Quick Layout Switcher */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 shadow-xs">
              {/* Row 1: Toggle Switch Name Tag ON/OFF */}
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#093A6E] uppercase tracking-wide flex items-center gap-1.5">
                    🏷️ Name Tag Pembicara
                  </span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase transition-all ${
                      config.showLowerThird
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {config.showLowerThird ? 'SHOW (ON)' : 'HIDE (OFF)'}
                  </span>
                </div>

                {/* iOS Style Toggle Switch */}
                <button
                  onClick={() => updateConfig({ showLowerThird: !config.showLowerThird })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    config.showLowerThird ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={config.showLowerThird}
                  title={config.showLowerThird ? 'Sembunyikan Name Tag' : 'Tampilkan Name Tag'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      config.showLowerThird ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Tombol Cepat Layout (Quick Layout Switcher) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    ⚡ Quick Switch Layout:
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    GANTI LANGSUNG
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                  <button
                    onClick={() => updateConfig({ layoutMode: 'presenter_slide' })}
                    title="Slide + 1 Pembicara"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'presenter_slide'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">💻</span>
                    <span className="text-[10px] leading-tight">Slide + 1</span>
                  </button>

                  <button
                    onClick={() => updateConfig({ layoutMode: 'slide_two_presenters' })}
                    title="Slide + 2 Pembicara"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'slide_two_presenters'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">👥</span>
                    <span className="text-[10px] leading-tight">Slide + 2</span>
                  </button>

                  <button
                    onClick={() => updateConfig({ layoutMode: 'full_presenter' })}
                    title="1 Kamera (Dengan Bingkai)"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'full_presenter'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">👤</span>
                    <span className="text-[10px] leading-tight">1 Kamera</span>
                  </button>

                  <button
                    onClick={() => updateConfig({ layoutMode: 'full_presenter_noborder' })}
                    title="Full Kamera (Tanpa Border / Bingkai)"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'full_presenter_noborder'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">📷</span>
                    <span className="text-[10px] leading-tight">Full No Border</span>
                  </button>

                  <button
                    onClick={() => updateConfig({ layoutMode: 'split_two' })}
                    title="2 Kamera Split"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'split_two'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">🎙️</span>
                    <span className="text-[10px] leading-tight">2 Kamera</span>
                  </button>

                  <button
                    onClick={() => updateConfig({ layoutMode: 'full_slide_only' })}
                    title="Slide Full Screen Only"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'full_slide_only' || config.layoutMode === 'full_slide_pip'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">📊</span>
                    <span className="text-[10px] leading-tight">Slide Full</span>
                  </button>

                  <button
                    onClick={() => updateConfig({ layoutMode: 'waiting' })}
                    title="Layar Countdown / Tunggu"
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.layoutMode === 'waiting'
                        ? 'bg-[#093A6E] text-white border-[#093A6E] shadow-sm font-extrabold ring-2 ring-amber-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-sm">⏰</span>
                    <span className="text-[10px] leading-tight">Tunggu</span>
                  </button>
                </div>
              </div>

              {/* Row 3: Quick Switch Tema Warna */}
              <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    🎨 Quick Switch Tema:
                  </span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {config.themePreset === 'frosted_light' ? '❄️ FROSTED GLASS' : config.themePreset === 'dark' ? '🌙 DARK NAVY' : '🍦 CREAM LIGHT'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() =>
                      updateConfig({
                        themePreset: 'cream',
                        lowerThirdColor: 'navy',
                        customPrimaryBgColor: '#FFF7E5',
                        customAccentColor: '#093A6E',
                        customNameColor: '#093A6E',
                        customTitleColor: '#926C35',
                        frameBorderColor: '#093A6E',
                        tickerBgColor: '#FFF7E5',
                        tickerTextColor: '#093A6E',
                        tickerBadgeBgColor: '#093A6E',
                        waitingBgColor: '#FFF7E5',
                        waitingAccentColor: '#093A6E',
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      (config.themePreset || 'cream') === 'cream'
                        ? 'bg-[#FFF7E5] text-[#093A6E] border-[#093A6E] ring-2 ring-amber-400 font-black'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>🍦</span>
                    <span>Cream Light</span>
                  </button>

                  <button
                    onClick={() =>
                      updateConfig({
                        themePreset: 'dark',
                        lowerThirdColor: 'navy',
                        customPrimaryBgColor: '#093A6E',
                        customAccentColor: '#FFF7E5',
                        customNameColor: '#FFF7E5',
                        customTitleColor: '#A88337',
                        frameBorderColor: '#FFF7E5',
                        tickerBgColor: '#093A6E',
                        tickerTextColor: '#FFF7E5',
                        tickerBadgeBgColor: '#FFF7E5',
                        waitingBgColor: '#093A6E',
                        waitingAccentColor: '#FFF7E5',
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      config.themePreset === 'dark'
                        ? 'bg-[#093A6E] text-[#FFF7E5] border-[#FFF7E5] ring-2 ring-[#FFF7E5] font-black'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>🌙</span>
                    <span>Dark Navy</span>
                  </button>

                  <button
                    onClick={() =>
                      updateConfig({
                        themePreset: 'frosted_light',
                        lowerThirdColor: 'frosted_white',
                        customPrimaryBgColor: 'rgba(255, 255, 255, 0.85)',
                        customAccentColor: '#0F172A',
                        customNameColor: '#0F172A',
                        customTitleColor: '#475569',
                        frameBorderColor: '#FFFFFF',
                        tickerBgColor: 'rgba(255, 255, 255, 0.90)',
                        tickerTextColor: '#0F172A',
                        tickerBadgeBgColor: '#0F172A',
                        waitingBgColor: 'rgba(255, 255, 255, 0.85)',
                        waitingAccentColor: '#FFFFFF',
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      config.themePreset === 'frosted_light'
                        ? 'bg-white text-slate-900 border-slate-900 ring-2 ring-blue-500 font-black shadow-xs'
                        : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span>❄️</span>
                    <span>Frosted Glass</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview Frame Container */}
            <div className="w-full relative rounded-xl overflow-hidden shadow-lg border border-slate-300 bg-slate-200">
              <AudienceOverlay
                config={config}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                isEmbeddedPreview={true}
              />
            </div>

            {/* Quick Action Overlay Controls */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={triggerLowerThirdAnim}
                className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-extrabold py-2.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Animasi Nama Pembicara</span>
              </button>

              <button
                onClick={() => updateConfig({ showLowerThird: !config.showLowerThird })}
                className={`flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                  config.showLowerThird
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                    : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {config.showLowerThird ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4" />}
                <span>{config.showLowerThird ? 'Sembunyikan Name Tag' : 'Tampilkan Name Tag'}</span>
              </button>

              {(config.layoutMode === 'presenter_slide' ||
                config.layoutMode === 'full_slide_pip' ||
                config.layoutMode === 'full_slide_only') && (
                <p className="text-[11px] text-amber-800 font-bold bg-amber-50/80 p-2 rounded-xl border border-amber-200/80 col-span-2">
                  ⚡ Note: Name Tag otomatis disembunyikan saat mode Slide aktif.
                </p>
              )}

              <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-bold text-[#093A6E]">📐 Resolusi OBS:</span>
                <span className="font-mono text-slate-700">1920×1080 (FHD) / 3840×2160 (4K UHD)</span>
                <span className="text-emerald-700 font-bold">✓ Skala Otomatis</span>
              </div>
            </div>

            {/* QUICK LITURGY PROCESSION CONTROLLER HUD */}
            <div className="mt-2 pt-3 border-t border-slate-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#093A6E] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-amber-500" />
                  Live Prosesi Misa Saat Ini
                </span>
                <button
                  onClick={() =>
                    updateConfig({
                      showLiturgyTracker: !config.showLiturgyTracker,
                      liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
                    })
                  }
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                    config.showLiturgyTracker
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {config.showLiturgyTracker ? '🟢 FLOATING ON' : '⚪ OFF'}
                </button>
              </div>

              {(() => {
                const lItems = config.liturgyItems || [];
                const lIdx = Math.max(0, Math.min(config.activeLiturgyIndex || 0, Math.max(0, lItems.length - 1)));
                const currentL = lItems[lIdx];
                return (
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-300/80 flex flex-col gap-2 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-black bg-[#093A6E] text-amber-300 px-1.5 py-0.5 rounded">
                        #{lIdx + 1}/{lItems.length}
                      </span>
                      {currentL?.posture && (
                        <span className="text-[10px] font-black bg-amber-200 text-slate-900 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                          {currentL.posture}
                        </span>
                      )}
                    </div>

                    <div className="font-black text-xs text-slate-900 line-clamp-2">
                      {currentL?.title || 'Belum ada data prosesi'}
                    </div>

                    {config.showLiturgyTracker && (
                      <div className="text-[10px] text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded font-medium">
                        ℹ️ Name Tag otomatis dinonaktifkan
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-amber-200/60">
                      <button
                        onClick={() => {
                          if (lIdx > 0) {
                            updateConfig({
                              activeLiturgyIndex: lIdx - 1,
                              liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
                              showLiturgyTracker: true,
                            });
                          }
                        }}
                        disabled={lIdx === 0}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <SkipBack className="w-3 h-3" />
                        <span>Sebelumnya</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('liturgy')}
                        className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-300 transition-all cursor-pointer"
                        title="Buka Tab Rundown Lengkap"
                      >
                        Kelola
                      </button>

                      <button
                        onClick={() => {
                          if (lIdx < lItems.length - 1) {
                            updateConfig({
                              activeLiturgyIndex: lIdx + 1,
                              liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
                              showLiturgyTracker: true,
                            });
                          }
                        }}
                        disabled={lIdx >= lItems.length - 1}
                        className="flex-1 py-1.5 px-2 bg-[#093A6E] hover:bg-blue-900 disabled:opacity-40 text-white text-[11px] font-black rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Berikutnya</span>
                        <SkipForward className="w-3 h-3 text-amber-300" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* OPERATOR SLIDE CONTROL CARD */}
            <div className="mt-2 pt-3 border-t border-slate-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#093A6E] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Presentation className="w-4 h-4 text-cyan-600" />
                  Kontrol Operator Slide
                </span>
                <span className="text-[10px] bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-full font-mono font-bold">
                  {config.slideSourceType === 'canva_embed' ? 'CANVA LIVE' : 'SLIDE GAMBAR'}
                </span>
              </div>

              {config.slideSourceType === 'canva_embed' ? (
                <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">Presentasi Canva Aktif</span>
                    <a
                      href={config.canvaUrl.replace('/view?embed', '/view')}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-[11px] rounded-lg flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Kontrol Canva (Tab Baru)</span>
                    </a>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={config.hideCanvaControlsOnAudience !== false}
                      onChange={(e) => updateConfig({ hideCanvaControlsOnAudience: e.target.checked })}
                      className="w-3.5 h-3.5 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                    />
                    <span>Sembunyikan Bar Kontrol & Nomor Halaman Canva di Audience</span>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevSlide}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>
                    <span className="text-xs font-mono font-extrabold text-[#093A6E]">
                      Slide {config.activeSlideIndex + 1} / {config.slides.length}
                    </span>
                    <button
                      onClick={handleNextSlide}
                      className="px-3 py-1.5 bg-[#093A6E] hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {config.slides.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => updateConfig({ activeSlideIndex: idx })}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                          config.activeSlideIndex === idx
                            ? 'bg-[#093A6E] text-amber-300 border-[#093A6E]'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DEDICATED SESSION KEY & OBS URL INTEGRATION CARD */}
            <div className="mt-2 pt-3 border-t border-slate-200 flex flex-col gap-3">
              {/* Header with Title & Panduan OBS Button */}
              <div className="flex items-center justify-between text-xs font-extrabold text-[#093A6E] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" />
                  Kunci Sesi & URL Multi-Browser
                </span>
                <button
                  onClick={() => setShowObsGuideModal(true)}
                  className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Panduan OBS</span>
                </button>
              </div>

              {/* ACTIVE SESSION ROOM CODE CONTROLLER */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-xl border border-amber-300/90 flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide">
                      🔑 Kunci Sesi Bersama:
                    </span>
                    <span className="text-xs font-mono font-black bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                      {roomCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{syncStatus?.subscribers ? `${syncStatus.subscribers} Perangkat` : 'Terkoneksi'}</span>
                    </span>

                    <button
                      onClick={() => setIsEditingCode(!isEditingCode)}
                      className="text-[10px] font-bold bg-white hover:bg-amber-100 text-slate-700 border border-amber-300 px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3 text-amber-600" />
                      <span>{isEditingCode ? 'Batal' : 'Ganti Kode'}</span>
                    </button>
                  </div>
                </div>

                {/* Edit Room Code Form (When Toggled) */}
                {isEditingCode && (
                  <div className="bg-white p-2.5 rounded-lg border border-amber-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in shadow-inner">
                    <div className="flex-1 flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 font-mono">CODE:</span>
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="Contoh: MISA-UAJY"
                        className="flex-1 bg-amber-50/50 border border-amber-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 outline-none uppercase"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={handleApplyNewCode}
                        className="px-3 py-1 bg-[#093A6E] hover:bg-blue-900 text-white font-black text-xs rounded transition-all cursor-pointer shadow-xs"
                      >
                        Terapkan
                      </button>
                      <button
                        onClick={handleGenerateRandomCode}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                        title="Buat Kode Acak"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-600" />
                        <span>Acak</span>
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-amber-900/90 leading-tight">
                  Kode ini tertera di URL. Perangkat atau browser apa pun (OBS di PC lain, HP/tablet kru) yang menggunakan kode yang sama akan <strong>tersinkronisasi secara instan & real-time</strong>.
                </p>
              </div>

              {/* 1. Audience URL (OBS Browser Source) */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/90 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide">
                      1. URL Audience (OBS Studio)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded">
                    ?view=audience&code={roomCode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={audienceUrl}
                    className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-800 outline-none select-all truncate shadow-inner"
                  />
                  <button
                    onClick={() => copyToClipboard(audienceUrl, 'audience')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedType === 'audience'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#093A6E] hover:bg-blue-900 text-white'
                    }`}
                    title="Salin URL Audience untuk OBS"
                  >
                    {copiedType === 'audience' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === 'audience' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={onOpenAudienceWindow}
                    className="p-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Buka Audience di Tab Baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-amber-900/80 leading-tight">
                  Tempel ke <strong>OBS Studio &gt; Browser Source</strong> (Lebar: 1920 / 3840, Tinggi: 1080 / 2160, FPS: 60). Layout otomatis menyesuaikan resolusi tanpa terpotong.
                </p>
              </div>

              {/* 2. Operator URL (Admin Control Panel) */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/90 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-[#093A6E]" />
                    <span className="text-[11px] font-black text-blue-950 uppercase tracking-wide">
                      2. URL Operator (Panel Kontrol)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-blue-200/90 text-blue-900 px-1.5 py-0.5 rounded">
                    ?view=operator&code={roomCode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={operatorUrl}
                    className="flex-1 bg-white border border-blue-300 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-800 outline-none select-all truncate shadow-inner"
                  />
                  <button
                    onClick={() => copyToClipboard(operatorUrl, 'operator')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedType === 'operator'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title="Salin URL Operator Panel"
                  >
                    {copiedType === 'operator' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === 'operator' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <a
                    href={operatorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg transition-all cursor-pointer shrink-0 flex items-center justify-center"
                    title="Buka Operator di Tab Baru / Device Lain"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[10px] text-blue-900/80 leading-tight">
                  Buka di laptop operator kedua, iPad/tablet, atau HP untuk mengontrol siaran secara mobile dari mana saja.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Operator Control Tabs & Forms (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Navigation Tabs (Light Mode Styled) */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'layout'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Layout className="w-4 h-4 text-amber-400" />
              <span>Tampilan / Layout</span>
            </button>

            <button
              onClick={() => setActiveTab('liturgy')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'liturgy'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span>Rundown Misa / Prosesi</span>
            </button>

            <button
              onClick={() => setActiveTab('speaker')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'speaker'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Name Tag Multifungsi</span>
            </button>

            <button
              onClick={() => setActiveTab('waiting_screen')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'waiting_screen'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Layar Pembuka</span>
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'camera'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span>Frame & Chroma Green</span>
            </button>

            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'slides'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Presentation className="w-4 h-4 text-amber-400" />
              <span>Canva & Slide Deck</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                activeTab === 'branding'
                  ? 'bg-[#093A6E] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Running Text Ticker</span>
            </button>
          </div>

          {/* TAB 1: LAYOUT SELECTION */}
          {activeTab === 'layout' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#093A6E] flex items-center gap-2">
                <Layout className="w-5 h-5 text-amber-500" />
                Pilih Tampilan Layout Stream
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Presenter + Slide */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'presenter_slide' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'presenter_slide'
                      ? 'border-[#093A6E] bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#093A6E]">
                      📊 1 Pembicara + Slide
                    </span>
                    {config.layoutMode === 'presenter_slide' && (
                      <span className="text-[10px] bg-[#093A6E] text-amber-300 font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Layar slide presentasi utama di kiri dengan kotak kamera pembicara tinggi penuh di kanan.
                  </p>
                </button>

                {/* 1b. 2 Presenters + Slide */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'slide_two_presenters' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'slide_two_presenters'
                      ? 'border-sky-600 bg-sky-50 shadow-md ring-2 ring-sky-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-sky-900">
                      👥 2 Pembicara + Slide
                    </span>
                    {config.layoutMode === 'slide_two_presenters' && (
                      <span className="text-[10px] bg-sky-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Layar slide presentasi di kiri dengan dua kotak kamera pembicara tersusun vertikal di kanan. Name Tag ditampilkan sebagai Banner Docked di bawah layout.
                  </p>
                </button>

                {/* 2. Full Slide + PIP Camera */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'full_slide_pip' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'full_slide_pip'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-indigo-900">
                      🖥️ Full Slide + PIP Kamera Kanan Bawah
                    </span>
                    {config.layoutMode === 'full_slide_pip' && (
                      <span className="text-[10px] bg-indigo-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Slide presentasi penuh memenuhi layar dengan kotak kamera presenter kecil di pojok kanan bawah.
                  </p>
                </button>

                {/* 3. Full Slide Only (Without Camera) */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'full_slide_only' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'full_slide_only'
                      ? 'border-cyan-600 bg-cyan-50 shadow-md ring-2 ring-cyan-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-cyan-900">
                      📺 Full Slide Presentasi (Tanpa Kamera)
                    </span>
                    {config.layoutMode === 'full_slide_only' && (
                      <span className="text-[10px] bg-cyan-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Layar penuh slide presentasi (Canva / Gambar) tanpa tampilan kamera presenter.
                  </p>
                </button>

                {/* 2. Full Presenter Camera (With Border Frame) */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'full_presenter', showCameraFrame: true })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'full_presenter'
                      ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-800">
                      🎥 Full Kamera Presenter (Dengan Border)
                    </span>
                    {config.layoutMode === 'full_presenter' && (
                      <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Tampilan 1 orang presenter dengan bingkai border warna/garis di sekeliling layar.
                  </p>
                </button>

                {/* 2b. Full Screen Camera (Without Border) */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'full_presenter_noborder', showCameraFrame: false })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'full_presenter_noborder'
                      ? 'border-teal-600 bg-teal-50 shadow-md ring-2 ring-teal-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-teal-900">
                      📹 Full Screen Kamera (Tanpa Border)
                    </span>
                    {config.layoutMode === 'full_presenter_noborder' && (
                      <span className="text-[10px] bg-teal-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Tampilan kamera penuh 100% layar edge-to-edge tanpa margin, tanpa padding, dan tanpa garis border (borderless).
                  </p>
                </button>

                {/* 3. Split Screen 2 Speakers */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'split_two' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'split_two'
                      ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-blue-800">
                      🎙️ Split Screen 2 Pembicara
                    </span>
                    {config.layoutMode === 'split_two' && (
                      <span className="text-[10px] bg-blue-700 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Dua kotak kamera berdampingan. Name Tag ditampilkan sebagai Banner Docked di bawah kotak kamera (tidak menutup wajah).
                  </p>
                </button>

                {/* 4. Waiting Screen / Starting Soon */}
                <button
                  onClick={() => updateConfig({ layoutMode: 'waiting' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.layoutMode === 'waiting'
                      ? 'border-amber-600 bg-amber-50 shadow-md ring-2 ring-amber-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-amber-800">
                      ⏰ Layar Pembuka / Countdown
                    </span>
                    {config.layoutMode === 'waiting' && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Hitung mundur pembuka acara, judul custom, dan nama narasumber.
                  </p>
                </button>
              </div>

              {/* Lower Third Theme Style Selector & Customizations */}
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-4">
                {/* Preset Style */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Preset Tema Lower Third (Banner Nama)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'classic_signature', label: 'Classic Signature' },
                        { id: 'sleek_modern', label: 'Sleek Modern' },
                        { id: 'minimal_gold', label: 'Minimal Gold' },
                        { id: 'futuristic_glass', label: 'Futuristic Glass' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => updateConfig({ lowerThirdStyle: st.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          config.lowerThirdStyle === st.id
                            ? 'bg-[#093A6E] text-amber-300 border-[#093A6E] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Layout Shape Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Bentuk Frame Layout (Kamera & Slide Canvas)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { id: 'sharp', label: '🔲 Sharp (Kotak Presisi + Rounded 4px)' },
                        { id: 'bevel', label: '📐 Bevel (Miring Asimetris)' },
                      ] as const
                    ).map((sh) => (
                      <button
                        key={sh.id}
                        onClick={() => updateConfig({ layoutShape: sh.id })}
                        className={`px-4 py-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          (config.layoutShape || 'sharp') === sh.id
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lower Third Shape Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Bentuk Lower Third (Banner Nama)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { id: 'sharp', label: '🔲 Sharp (Kotak + Rounded 4px)' },
                        { id: 'bevel', label: '📐 Bevel (Miring Asimetris)' },
                      ] as const
                    ).map((sh) => (
                      <button
                        key={sh.id}
                        onClick={() => updateConfig({ lowerThirdShape: sh.id })}
                        className={`px-4 py-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          (config.lowerThirdShape || 'sharp') === sh.id
                            ? 'bg-[#093A6E] text-amber-300 border-[#093A6E] shadow-sm ring-2 ring-blue-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Versi Tampilan (Light Cream vs Dark Navy) */}
                <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#093A6E] uppercase tracking-wider flex items-center gap-2">
                      <span>🎨 Switch Mode Tampilan Tema (Cream vs Dark)</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-800 bg-amber-200/90 px-3 py-0.5 rounded-full">
                      PILIHAN MODE TEMA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Mode 1: Versi Cream / Light (Dominan Cream) */}
                    <button
                      onClick={() =>
                        updateConfig({
                          themePreset: 'cream',
                          lowerThirdColor: 'navy',
                          customPrimaryBgColor: '#FFF7E5',
                          customAccentColor: '#093A6E',
                          customNameColor: '#093A6E',
                          customTitleColor: '#926C35',
                          frameBorderColor: '#093A6E',
                          tickerBgColor: '#FFF7E5',
                          tickerTextColor: '#093A6E',
                          tickerBadgeBgColor: '#093A6E',
                          waitingBgColor: '#FFF7E5',
                          waitingAccentColor: '#093A6E',
                        })
                      }
                      className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        (config.themePreset || 'cream') === 'cream'
                          ? 'bg-[#FFF7E5] border-[#093A6E] shadow-md ring-2 ring-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#FFF7E5] border-2 border-[#093A6E] flex items-center justify-center shrink-0 shadow-xs">
                        <span className="text-base">🍦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-[#093A6E]">
                            1. Versi Cream / Light
                          </span>
                          {(config.themePreset || 'cream') === 'cream' && (
                            <span className="text-[9px] bg-[#093A6E] text-[#FFF7E5] font-black px-2 py-0.5 rounded-full">
                              AKTIF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          Dominan Cream (#FFF7E5) lembut dengan teks Navy (#093A6E) & aksen Bronze (#926C35). Tampilan bersih, kontras tinggi & terang.
                        </p>
                      </div>
                    </button>

                    {/* Mode 2: Versi Dark (Warna Kebalikan Navy & Cream) */}
                    <button
                      onClick={() =>
                        updateConfig({
                          themePreset: 'dark',
                          lowerThirdColor: 'navy',
                          customPrimaryBgColor: '#093A6E',
                          customAccentColor: '#FFF7E5',
                          customNameColor: '#FFF7E5',
                          customTitleColor: '#A88337',
                          frameBorderColor: '#FFF7E5',
                          tickerBgColor: '#093A6E',
                          tickerTextColor: '#FFF7E5',
                          tickerBadgeBgColor: '#FFF7E5',
                          waitingBgColor: '#093A6E',
                          waitingAccentColor: '#FFF7E5',
                        })
                      }
                      className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        config.themePreset === 'dark'
                          ? 'bg-[#093A6E] text-white border-[#FFF7E5] shadow-md ring-2 ring-[#FFF7E5]'
                          : 'bg-slate-900 text-slate-100 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#093A6E] border-2 border-[#FFF7E5] flex items-center justify-center shrink-0 shadow-xs">
                        <span className="text-base">🌙</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-[#FFF7E5]">
                            2. Versi Dark (Navy & Cream)
                          </span>
                          {config.themePreset === 'dark' && (
                            <span className="text-[9px] bg-[#FFF7E5] text-[#093A6E] font-black px-2 py-0.5 rounded-full">
                              AKTIF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                          Warna kebalikannya: Background Navy (#093A6E) gelap dengan Teks & Badge Cream (#FFF7E5) serta aksen Gold (#A88337).
                        </p>
                      </div>
                    </button>

                    {/* Mode 3: Versi Frosted Glass Light (Putih Transparan) */}
                    <button
                      onClick={() =>
                        updateConfig({
                          themePreset: 'frosted_light',
                          lowerThirdColor: 'frosted_white',
                          customPrimaryBgColor: 'rgba(255, 255, 255, 0.85)',
                          customAccentColor: '#0F172A',
                          customNameColor: '#0F172A',
                          customTitleColor: '#475569',
                          frameBorderColor: '#FFFFFF',
                          tickerBgColor: 'rgba(255, 255, 255, 0.90)',
                          tickerTextColor: '#0F172A',
                          tickerBadgeBgColor: '#0F172A',
                          waitingBgColor: 'rgba(255, 255, 255, 0.85)',
                          waitingAccentColor: '#FFFFFF',
                        })
                      }
                      className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                        config.themePreset === 'frosted_light'
                          ? 'bg-white/95 text-slate-900 border-slate-900 shadow-md ring-2 ring-blue-500'
                          : 'bg-white/80 text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/90 border-2 border-slate-300 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="text-base">❄️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">
                            3. Frosted Glass (Putih Terang)
                          </span>
                          {config.themePreset === 'frosted_light' && (
                            <span className="text-[9px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-full">
                              AKTIF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          Desain kaca buram transparan terang (Frosted White) berlatar blur mewah (backdrop-blur) dengan teks pekat & border putih.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Background GIF / Image URL */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                      <span>🖼️ Gambar / GIF Background Siaran</span>
                    </label>
                    <button
                      onClick={() =>
                        updateConfig({
                          backgroundUrl:
                            'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6dzhwbGlqaG5qYW5yYjE0bzMzZmh2YmZnYjJ3YzhxZTkybG1tayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UYBDCJjwOd9Re/giphy.gif',
                        })
                      }
                      className="text-[10px] font-bold text-blue-700 hover:underline bg-blue-50 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Reset GIF Default
                    </button>
                  </div>
                  <input
                    type="text"
                    value={
                      config.backgroundUrl ||
                      'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p6dzhwbGlqaG5qYW5yYjE0bzMzZmh2YmZnYjJ3YzhxZTkybG1tayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UYBDCJjwOd9Re/giphy.gif'
                    }
                    onChange={(e) => updateConfig({ backgroundUrl: e.target.value })}
                    placeholder="https://... (URL GIF / Gambar Background)"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500">
                    Gunakan URL GIF animasi atau gambar beresolusi tinggi untuk background panggung live streaming.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Skema Warna (Theme Color)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {(
                      [
                        { id: 'frosted_white', label: 'Frosted (Putih)', colorBg: 'bg-white border border-slate-300' },
                        { id: 'navy', label: 'Deep Navy', colorBg: 'bg-[#093A6E]' },
                        { id: 'blue', label: 'Royal Blue', colorBg: 'bg-blue-600' },
                        { id: 'crimson', label: 'Crimson Red', colorBg: 'bg-rose-700' },
                        { id: 'emerald', label: 'Emerald Green', colorBg: 'bg-emerald-600' },
                        { id: 'gold', label: 'Luxury Gold', colorBg: 'bg-amber-500' },
                        { id: 'dark', label: 'Dark Slate', colorBg: 'bg-slate-800' },
                        { id: 'custom', label: 'Kustom (HEX)', colorBg: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' },
                      ] as const
                    ).map((cl) => (
                      <button
                        key={cl.id}
                        onClick={() => updateConfig({ lowerThirdColor: cl.id })}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          (config.lowerThirdColor || 'navy') === cl.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-amber-400'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cl.colorBg}`} />
                        <span className="truncate">{cl.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Panel Kustomisasi Warna Khusus (HEX Color Pickers) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#093A6E] uppercase tracking-wider">
                      🎨 Custom Color Palette (Warna HEX Khusus)
                    </span>
                    {config.lowerThirdColor !== 'custom' && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-md">
                        Aktifkan opsi "Kustom (HEX)" di atas untuk menerapkan skema ini sepenuhnya
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Background Utama Overlay */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-slate-800">Background Utama</div>
                        <div className="text-[10px] text-slate-500">Banner & Overlay</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customPrimaryBgColor || '#093A6E'}
                          onChange={(e) => updateConfig({ customPrimaryBgColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={config.customPrimaryBgColor || '#093A6E'}
                          onChange={(e) => updateConfig({ customPrimaryBgColor: e.target.value })}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold border rounded-lg uppercase"
                        />
                      </div>
                    </div>

                    {/* Aksen & Highlight Border */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-slate-800">Warna Aksen/Highlight</div>
                        <div className="text-[10px] text-slate-500">Border & Badge</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customAccentColor || '#F59E0B'}
                          onChange={(e) => updateConfig({ customAccentColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={config.customAccentColor || '#F59E0B'}
                          onChange={(e) => updateConfig({ customAccentColor: e.target.value })}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold border rounded-lg uppercase"
                        />
                      </div>
                    </div>

                    {/* Teks Nama Speaker */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-slate-800">Teks Nama Pembicara</div>
                        <div className="text-[10px] text-slate-500">Nama Utama</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customNameColor || '#FDE68A'}
                          onChange={(e) => updateConfig({ customNameColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={config.customNameColor || '#FDE68A'}
                          onChange={(e) => updateConfig({ customNameColor: e.target.value })}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold border rounded-lg uppercase"
                        />
                      </div>
                    </div>

                    {/* Teks Gelar / Subtitle */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-slate-800">Teks Gelar / Subtitle</div>
                        <div className="text-[10px] text-slate-500">Jabatan & Institusi</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customTitleColor || '#E2E8F0'}
                          onChange={(e) => updateConfig({ customTitleColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={config.customTitleColor || '#E2E8F0'}
                          onChange={(e) => updateConfig({ customTitleColor: e.target.value })}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold border rounded-lg uppercase"
                        />
                      </div>
                    </div>

                    {/* Border Frame Kamera & Slide */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-slate-800">Border Frame Layout</div>
                        <div className="text-[10px] text-slate-500">Garis Pinggir Kamera</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.frameBorderColor || '#0284C7'}
                          onChange={(e) => updateConfig({ frameBorderColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={config.frameBorderColor || '#0284C7'}
                          onChange={(e) => updateConfig({ frameBorderColor: e.target.value })}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold border rounded-lg uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipografi / Font Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Gaya Font Broadcast (Sans-Serif High Legibility)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {(
                      [
                        { id: 'sans', label: 'Plus Jakarta', desc: 'Sangat Jelas & High Contrast' },
                        { id: 'poppins', label: 'Poppins', desc: 'Modern Clean Sans' },
                        { id: 'oswald', label: 'Oswald', desc: 'Impact Tegas & Tinggi' },
                        { id: 'display', label: 'Display Caps', desc: 'Heavy Broadcast Bold' },
                        { id: 'mono', label: 'Monospace', desc: 'Tech & Digital' },
                      ] as const
                    ).map((ft) => (
                      <button
                        key={ft.id}
                        onClick={() => updateConfig({ lowerThirdFont: ft.id })}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                          (config.lowerThirdFont || 'sans') === ft.id
                            ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs ring-2 ring-amber-400'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <span className="font-extrabold">{ft.label}</span>
                        <span className="text-[10px] opacity-75 font-normal">{ft.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kustomisasi Frame */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Ketebalan Border Frame Kamera
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'thin', label: 'Tipis (2px)' },
                        { id: 'normal', label: 'Normal (4px)' },
                        { id: 'thick', label: 'Tebal (6px)' },
                        { id: 'extra_thick', label: 'Sangat Tebal (8px)' },
                      ] as const
                    ).map((bw) => (
                      <button
                        key={bw.id}
                        onClick={() => updateConfig({ frameBorderWidth: bw.id })}
                        className={`px-2 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          (config.frameBorderWidth || 'normal') === bw.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {bw.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Posisi Floating Name Tag
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateConfig({ lowerThirdPosition: 'bottom_left' })}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        (config.lowerThirdPosition || 'bottom_left') === 'bottom_left'
                          ? 'bg-[#093A6E] text-amber-300 border-[#093A6E]'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Pojok Kiri Bawah (Default)
                    </button>
                    <button
                      onClick={() => updateConfig({ lowerThirdPosition: 'top_left' })}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        config.lowerThirdPosition === 'top_left'
                          ? 'bg-[#093A6E] text-amber-300 border-[#093A6E]'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Pojok Kiri Atas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LITURGY PROCESSION RUNDOWN MANAGER */}
          {activeTab === 'liturgy' && (
            <LiturgyManager config={config} updateConfig={updateConfig} />
          )}

          {/* TAB 2: MULTIFUNCTIONAL NAME TAG & SPEAKER EDITOR */}
          {activeTab === 'speaker' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-[#093A6E] flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    Pengaturan Name Tag Multifungsi (Lower Third)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi data narasumber atau judul sesi. Ditampilkan otomatis di semua layout.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateConfig({ showLowerThird: !config.showLowerThird })}
                    className={`text-xs font-extrabold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      config.showLowerThird
                        ? 'bg-[#093A6E] text-amber-300 border-[#093A6E]'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {config.showLowerThird ? 'Tag: AKTIF' : 'Tag: SEMBUNYI'}
                  </button>
                  <button
                    onClick={triggerLowerThirdAnim}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    Tampilkan Ulang Tag
                  </button>
                </div>
              </div>

              {/* Active Liturgy Notice */}
              {config.showLiturgyTracker && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">⚠️ Perhatian:</span>
                    <span>Floating Rundown Misa saat ini sedang aktif di layar, sehingga Name Tag otomatis dinonaktifkan agar siaran tetap fokus dan bersih.</span>
                  </div>
                  <button
                    onClick={() => updateConfig({ showLiturgyTracker: false })}
                    className="shrink-0 px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition-all cursor-pointer text-[11px]"
                  >
                    Matikan Rundown
                  </button>
                </div>
              )}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4">
                <div className="text-xs font-black text-[#093A6E] uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    INFORMASI PEMBICARA / NAME TAG UTAMA
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 lowercase font-mono">
                    (Dapat diisi nama narasumber atau judul sesi)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nama Pembicara / Judul Sesi
                    </label>
                    <input
                      type="text"
                      value={config.speaker.name}
                      onChange={(e) => updateSpeaker({ name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-[#093A6E] font-bold focus:border-[#093A6E] outline-none"
                      placeholder="Contoh: Dr. Ir. Maria Agnes, M.T."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Jabatan / Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      value={config.speaker.title}
                      onChange={(e) => updateSpeaker({ title: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-[#093A6E] outline-none"
                      placeholder="Contoh: Narasumber Utama / Pakar AI"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Instansi / Sub-Header / Tag Badge
                    </label>
                    <input
                      type="text"
                      value={config.speaker.institution}
                      onChange={(e) => updateSpeaker({ institution: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-[#093A6E] outline-none"
                      placeholder="Contoh: FAKULTAS TEKNOLOGI INFORMASI"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Topik Presentasi / Detail Keterangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={config.speaker.topic || ''}
                      onChange={(e) => updateSpeaker({ topic: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-[#093A6E] outline-none"
                      placeholder="Contoh: Implementasi Artificial Intelligence..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM WAITING SCREEN (LAYAR PEMBUKA) */}
          {activeTab === 'waiting_screen' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-[#093A6E] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Pengaturan Custom Layar Pembuka (Starting Soon)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesuaikan judul, pesan, status badge, dan hitung mundur saat mode Layar Pembuka aktif.
                  </p>
                </div>
                <button
                  onClick={() => updateConfig({ layoutMode: 'waiting' })}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Aktifkan Mode Pembuka
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Judul Utama Layar Pembuka
                  </label>
                  <input
                    type="text"
                    value={config.waitingTitle || ''}
                    onChange={(e) => updateConfig({ waitingTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#093A6E] focus:bg-white focus:border-[#093A6E] outline-none"
                    placeholder="Contoh: SELAMAT DATANG DI LIVE STREAMING"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sub-Judul / Deskripsi Singkat
                  </label>
                  <input
                    type="text"
                    value={config.waitingSubtitle || ''}
                    onChange={(e) => updateConfig({ waitingSubtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#093A6E] outline-none font-medium"
                    placeholder="Contoh: Acara Webinar & Presentasi Interaktif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Badge Status Pembuka
                  </label>
                  <input
                    type="text"
                    value={config.waitingBadgeText || ''}
                    onChange={(e) => updateConfig({ waitingBadgeText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#093A6E] outline-none font-medium"
                    placeholder="Contoh: SIARAN SEGERA DIMULAI"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pesan Informasi Tambahan (Banner Kecil)
                  </label>
                  <input
                    type="text"
                    value={config.waitingMessage || ''}
                    onChange={(e) => updateConfig({ waitingMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#093A6E] outline-none font-medium"
                    placeholder="Contoh: Silakan bersiap dan siapkan pertanyaan terbaik Anda."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Durasi Hitung Mundur (Menit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={config.waitingCountdownMinutes}
                    onChange={(e) => updateConfig({ waitingCountdownMinutes: parseInt(e.target.value, 10) || 5 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#093A6E] outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHROMA GREEN & OBS FRAME */}
          {activeTab === 'camera' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <h2 className="text-lg font-black text-[#093A6E] flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-500" />
                Pengaturan Chroma Green & Frame OBS
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chroma Green Option */}
                <button
                  onClick={() => updateConfig({ cameraMode: 'chroma_green' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.cameraMode === 'chroma_green'
                      ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-800">
                      💚 Chroma Green (#00FF00)
                    </span>
                    {config.cameraMode === 'chroma_green' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Kotak capture berwarna hijau terang. Sangat cocok untuk ditimpa kamera via Chroma Key filter di OBS Studio.
                  </p>
                </button>

                {/* Transparent Option */}
                <button
                  onClick={() => updateConfig({ cameraMode: 'transparent' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.cameraMode === 'transparent'
                      ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-purple-800">
                      ✨ Transparan (OBS Layering)
                    </span>
                    {config.cameraMode === 'transparent' && (
                      <span className="text-[10px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Area berlubang transparan. Letakkan sumber Browser Source di atas sumber Video Kamera di OBS.
                  </p>
                </button>
              </div>

              {/* Frame Customization */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Warna Chroma Key Green
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.chromaColor}
                      onChange={(e) => updateConfig({ chromaColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-xs"
                    />
                    <input
                      type="text"
                      value={config.chromaColor}
                      onChange={(e) => updateConfig({ chromaColor: e.target.value })}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono w-32"
                    />
                  </div>
                </div>

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
                      value={config.frameBorderColor}
                      onChange={(e) => updateConfig({ frameBorderColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-xs"
                      title="Warna Garis Bingkai Kamera"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANVA & SLIDE DECK MANAGER */}
          {activeTab === 'slides' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-[#093A6E] flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-amber-500" />
                  Integrasi Slide Presentasi (Canva / File Gambar)
                </h2>
              </div>

              {/* Source Switcher: Canva vs Image Deck vs Chroma Green */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => updateConfig({ slideSourceType: 'canva_embed' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.slideSourceType === 'canva_embed'
                      ? 'border-cyan-600 bg-cyan-50/80 shadow-md ring-2 ring-cyan-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-cyan-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      Canva Live Embed
                    </span>
                    {config.slideSourceType === 'canva_embed' && (
                      <span className="text-[10px] bg-cyan-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Tampilkan link presentasi Canva langsung secara interaktif.
                  </p>
                </button>

                <button
                  onClick={() => updateConfig({ slideSourceType: 'image_deck' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.slideSourceType === 'image_deck'
                      ? 'border-[#093A6E] bg-blue-50/80 shadow-md ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#093A6E] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      Slide Gambar / File
                    </span>
                    {config.slideSourceType === 'image_deck' && (
                      <span className="text-[10px] bg-[#093A6E] text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Unggah file gambar (PNG/JPG) atau masukkan URL gambar.
                  </p>
                </button>

                <button
                  onClick={() => updateConfig({ slideSourceType: 'chroma_green' })}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    config.slideSourceType === 'chroma_green'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-700 shadow-xs shrink-0" />
                      Chroma Green Slide Box
                    </span>
                    {config.slideSourceType === 'chroma_green' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Ganti area slide dengan hijau polos (#00FF00) untuk Chroma Key di OBS/vMix.
                  </p>
                </button>
              </div>

              {/* CHROMA GREEN SLIDE SETTINGS FORM */}
              {config.slideSourceType === 'chroma_green' && (
                <div className="p-5 bg-emerald-50/60 rounded-2xl border-2 border-emerald-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      Pengaturan Chroma Key Box Area Slide
                    </label>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Area slide presentasi saat ini diisi dengan warna Chroma Key polos. Anda dapat memanfaatkan area ini untuk di-keying di software broadcast (OBS, Streamlabs, vMix) atau meletakkan Window Capture / Video Input eksternal di belakang frame.
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Pilih Warna Keying Slide
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={config.slideChromaColor || config.chromaColor || '#00FF00'}
                          onChange={(e) => updateConfig({ slideChromaColor: e.target.value })}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-xs"
                        />
                        <input
                          type="text"
                          value={config.slideChromaColor || config.chromaColor || '#00FF00'}
                          onChange={(e) => updateConfig({ slideChromaColor: e.target.value })}
                          className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono w-32 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CANVA INPUT FORM */}
              {config.slideSourceType === 'canva_embed' && (
                <div className="p-5 bg-gradient-to-br from-cyan-50/50 via-sky-50/30 to-slate-50 rounded-2xl border-2 border-cyan-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-cyan-950 uppercase tracking-wider flex items-center gap-2">
                      <Link className="w-4 h-4 text-cyan-700" />
                      Link Embed Presentasi Canva
                    </label>
                    <button
                      onClick={() =>
                        updateConfig({
                          canvaUrl: 'https://www.canva.com/design/DAGfsK7x68U/view?embed',
                        })
                      }
                      className="text-[11px] font-bold text-cyan-800 hover:text-cyan-950 underline cursor-pointer"
                    >
                      Gunakan Sample Template Canva
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={config.canvaUrl}
                      onChange={(e) => updateConfig({ canvaUrl: e.target.value })}
                      placeholder="Contoh: https://www.canva.com/design/DAG.../view?embed"
                      className="w-full bg-white border border-cyan-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200 outline-none shadow-xs"
                    />
                    <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-cyan-200/80">
                      <strong>Cara mengambil link Canva:</strong>
                      <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-500">
                        <li>Buka presentasi Anda di Canva</li>
                        <li>Klik tombol <strong>Share</strong> (Bagikan) di pojok kanan atas</li>
                        <li>Pilih <strong>More / Lainnya</strong> &gt; <strong>Embed (Sematkan)</strong></li>
                        <li>Salin link HTML embed atau URL tampilan publik (view link) lalu tempel di atas.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Clean Audience Mode Toggle & Presenter Window Button */}
                  <div className="p-4 bg-white rounded-xl border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.hideCanvaControlsOnAudience !== false}
                        onChange={(e) => updateConfig({ hideCanvaControlsOnAudience: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                      />
                      <span>Sembunyikan Bar Kontrol & Nomor Halaman Canva di Audience (Bersih Tanpa UI Canva)</span>
                    </label>

                    <a
                      href={config.canvaUrl.replace('/view?embed', '/view')}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Kontrol Canva (Tab Baru)</span>
                    </a>
                  </div>

                  {/* Canva Live Preview Tester */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">Preview & Kontrol Interactive Canva (Operator):</span>
                      <span className="text-[11px] text-cyan-800 font-semibold bg-cyan-100 px-2 py-0.5 rounded-md">
                        Klik panah pada slide di bawah untuk berpindah slide Canva
                      </span>
                    </div>
                    <div className="w-full h-72 rounded-xl overflow-hidden border-2 border-cyan-300 bg-slate-900 shadow-inner">
                      <iframe
                        src={getCanvaEmbedUrl(config.canvaUrl)}
                        title="Canva Preview"
                        className="w-full h-full border-0"
                        allow="fullscreen"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE DECK MANAGER FORM */}
              {config.slideSourceType === 'image_deck' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Navigasi & Urutan Slide Gambar
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevSlide}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-300"
                        title="Slide Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-[#093A6E] px-2">
                        {config.activeSlideIndex + 1} / {config.slides.length}
                      </span>
                      <button
                        onClick={handleNextSlide}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-300"
                        title="Slide Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Auto Advance Timer Controls */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoAdvanceSlides || false}
                        onChange={(e) => updateConfig({ autoAdvanceSlides: e.target.checked })}
                        className="w-4 h-4 text-[#093A6E] rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Putar Slide Gambar Secara Otomatis (Auto Advance Slide Rotation)</span>
                    </label>

                    {config.autoAdvanceSlides && (
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span>Durasi ganti slide:</span>
                        <select
                          value={config.autoAdvanceIntervalSeconds || 10}
                          onChange={(e) => updateConfig({ autoAdvanceIntervalSeconds: Number(e.target.value) })}
                          className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900 font-bold focus:border-[#093A6E]"
                        >
                          <option value={5}>5 Detik</option>
                          <option value={10}>10 Detik</option>
                          <option value={15}>15 Detik</option>
                          <option value={30}>30 Detik</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Upload or Add Slide URL */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                    <div className="text-xs font-bold text-slate-700 uppercase">Tambah Slide Gambar Baru</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Unggah File Gambar (PNG / JPG)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#093A6E] file:text-white hover:file:bg-blue-900 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Atau Masukkan URL Gambar Slide
                          </label>
                          <input
                            type="text"
                            value={newSlideUrl}
                            onChange={(e) => setNewSlideUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#093A6E]"
                          />
                        </div>
                        <button
                          onClick={handleAddSlide}
                          className="bg-[#093A6E] hover:bg-blue-900 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-4 h-4 text-amber-400" />
                          <span>Tambah</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Slides Grid List */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                    {config.slides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        onClick={() => updateConfig({ activeSlideIndex: idx })}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col group ${
                          config.activeSlideIndex === idx
                            ? 'border-[#093A6E] ring-2 ring-blue-300/60 shadow-md'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="aspect-video bg-slate-900 relative overflow-hidden">
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-[#093A6E] text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm">
                            #{idx + 1}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlide(idx);
                            }}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-2 bg-white text-[11px] font-semibold text-slate-800 truncate border-t border-slate-100">
                          {slide.title || `Slide ${idx + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TICKER */}
          {activeTab === 'branding' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <h2 className="text-lg font-black text-[#093A6E] flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                Pengaturan Running Text Ticker (Informasi Berjalan)
              </h2>

              {/* Running Text / Ticker Editor */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#093A6E] uppercase">
                    Running Text Ticker (Bawah Screen)
                  </span>
                  <button
                    onClick={() => updateConfig({ showTicker: !config.showTicker })}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      config.showTicker
                        ? 'bg-[#093A6E] text-amber-300 border-[#093A6E] shadow-xs'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {config.showTicker ? 'Ticker Aktif' : 'Ticker Nonaktif'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Judul Badge Ticker (Contoh: INFORMASI / LIVE STREAMING)
                    </label>
                    <input
                      type="text"
                      value={config.tickerBadgeTitle || 'INFORMASI'}
                      onChange={(e) => updateConfig({ tickerBadgeTitle: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold outline-none focus:border-[#093A6E]"
                      placeholder="INFORMASI"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Ukuran Font Ticker
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'small', label: 'Kecil' },
                          { id: 'medium', label: 'Sedang' },
                          { id: 'large', label: 'Besar' },
                        ] as const
                      ).map((ts) => (
                        <button
                          key={ts.id}
                          onClick={() => updateConfig({ tickerFontSize: ts.id })}
                          className={`px-2 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                            (config.tickerFontSize || 'medium') === ts.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {ts.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Teks Ticker Berjalan
                  </label>
                  <textarea
                    rows={2}
                    value={config.tickerText}
                    onChange={(e) => updateConfig({ tickerText: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#093A6E]"
                  />
                </div>

                {/* Ticker Color & Font Customization */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Background Ticker:</span>
                    <input
                      type="color"
                      value={config.tickerBgColor || '#093A6E'}
                      onChange={(e) => updateConfig({ tickerBgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Warna Teks Ticker:</span>
                    <input
                      type="color"
                      value={config.tickerTextColor || '#FFFFFF'}
                      onChange={(e) => updateConfig({ tickerTextColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Badge Accent Color:</span>
                    <input
                      type="color"
                      value={config.tickerBadgeBgColor || '#F59E0B'}
                      onChange={(e) => updateConfig({ tickerBadgeBgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={config.instagramHandle}
                      onChange={(e) => updateConfig({ instagramHandle: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-[#093A6E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      YouTube Channel
                    </label>
                    <input
                      type="text"
                      value={config.youtubeHandle}
                      onChange={(e) => updateConfig({ youtubeHandle: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-[#093A6E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={config.websiteUrl}
                      onChange={(e) => updateConfig({ websiteUrl: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-[#093A6E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OBS STUDIO SETUP & URL INTEGRATION MODAL */}
      {showObsGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#093A6E] to-blue-900 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                  <Tv className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                    PANDUAN KONEKSI OBS STUDIO & OPERATOR
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    Cara membedakan & menghubungkan URL Siaran OBS dengan Panel Kontrol Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowObsGuideModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/20"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6 text-slate-800 text-xs leading-relaxed">
              {/* Section 1: Comparison of 2 URLs with Session Key */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#093A6E] uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500" />
                    1. Dua Jenis URL dengan Kunci Sesi ({roomCode})
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    <span>KUNCI: {roomCode}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Audience Card */}
                  <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#093A6E] text-xs uppercase flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-amber-600" />
                        URL Audience (OBS Browser)
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        ?view=audience&code={roomCode}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Halaman overlay murni tanpa menu admin. Otomatis menyesuaikan resolusi 1080p / 4K tanpa terpotong.
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={audienceUrl}
                        className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-800 outline-none select-all"
                      />
                      <button
                        onClick={() => copyToClipboard(audienceUrl, 'audience')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 ${
                          copiedType === 'audience'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#093A6E] hover:bg-blue-900 text-white'
                        }`}
                      >
                        {copiedType === 'audience' ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>

                  {/* Operator Card */}
                  <div className="p-4 bg-blue-50/80 border-2 border-blue-300 rounded-2xl flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#093A6E] text-xs uppercase flex items-center gap-1.5">
                        <Laptop className="w-4 h-4 text-blue-600" />
                        URL Operator (Panel Admin)
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                        ?view=operator&code={roomCode}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Halaman kontrol kru di laptop/HP kedua untuk ganti nama, tata letak kamera, slide, dan running text.
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={operatorUrl}
                        className="flex-1 bg-white border border-blue-300 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-800 outline-none select-all"
                      />
                      <button
                        onClick={() => copyToClipboard(operatorUrl, 'operator')}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 ${
                          copiedType === 'operator'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {copiedType === 'operator' ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Step-by-Step OBS Setup */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black text-[#093A6E] uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-600" />
                  2. Langkah-Langkah Memasang di OBS Studio
                </h4>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#093A6E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">Tambahkan Browser Source:</strong>
                      <p className="text-slate-600 text-[11px]">
                        Di OBS Studio, pada panel <strong>Sources</strong>, klik tanda plus (<strong>+</strong>) &gt; pilih <strong>Browser</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#093A6E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">Tempel URL Audience:</strong>
                      <p className="text-slate-600 text-[11px]">
                        Pada kolom <strong>URL</strong>, tempel link Audience: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">{audienceUrl}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#093A6E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900">Atur Resolusi & FPS:</strong>
                      <div className="grid grid-cols-3 gap-2 mt-1.5">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Width (Lebar)</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">1920 (atau 3840)</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Height (Tinggi)</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">1080 (atau 2160)</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">FPS</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">60</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#093A6E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      4
                    </span>
                    <div>
                      <strong className="text-slate-900">Centang Opsi Hemat & Performa:</strong>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 mt-1 space-y-0.5">
                        <li>Centang <strong>"Shutdown source when not visible"</strong></li>
                        <li>Centang <strong>"Refresh browser when scene becomes active"</strong></li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <div>
                      <strong className="text-emerald-900">Selesai! Real-Time Synchronization Siap:</strong>
                      <p className="text-slate-600 text-[11px]">
                        Buka panel operator di laptop/HP Anda. Setiap tombol yang Anda klik akan langsung mengupdate tampilan di OBS secara instan tanpa perlu refresh!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-3xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(audienceUrl, 'audience')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin URL OBS</span>
                </button>
                <button
                  onClick={onOpenAudienceWindow}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Buka Layar Audience</span>
                </button>
              </div>

              <button
                onClick={() => setShowObsGuideModal(false)}
                className="px-5 py-2 bg-[#093A6E] hover:bg-blue-900 text-white font-black rounded-xl transition-all cursor-pointer text-xs shadow-sm"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
