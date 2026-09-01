import React, { useState } from 'react';
import { OverlayConfig, LiturgyStep } from '../../types';
import {
  DEFAULT_CATHOLIC_MASS_RUNDOWN,
  TEMPLATE_DAILY_MASS_RUNDOWN,
  TEMPLATE_WORD_LITURGY_RUNDOWN,
} from '../../data/defaultLiturgy';
import {
  ListOrdered,
  Play,
  SkipForward,
  SkipBack,
  Eye,
  EyeOff,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Search,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface LiturgyManagerProps {
  config: OverlayConfig;
  updateConfig: (fields: Partial<OverlayConfig>) => void;
}

export const LiturgyManager: React.FC<LiturgyManagerProps> = ({
  config,
  updateConfig,
}) => {
  const items = config.liturgyItems || DEFAULT_CATHOLIC_MASS_RUNDOWN;
  const currentIndex = Math.max(0, Math.min(config.activeLiturgyIndex || 0, items.length - 1));
  const currentStep: LiturgyStep = items[currentIndex] || items[0];

  const [searchQuery, setSearchQuery] = useState('');

  // Next / Prev handlers with animation key increment
  const handleNextStep = () => {
    if (currentIndex < items.length - 1) {
      updateConfig({
        activeLiturgyIndex: currentIndex + 1,
        liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
        showLiturgyTracker: true,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentIndex > 0) {
      updateConfig({
        activeLiturgyIndex: currentIndex - 1,
        liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
        showLiturgyTracker: true,
      });
    }
  };

  const handleJumpToStep = (index: number) => {
    updateConfig({
      activeLiturgyIndex: index,
      liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
      showLiturgyTracker: true,
    });
  };

  const handleResetToFirst = () => {
    updateConfig({
      activeLiturgyIndex: 0,
      liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
    });
  };

  const handleToggleShow = () => {
    updateConfig({
      showLiturgyTracker: !config.showLiturgyTracker,
      liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
    });
  };

  // Item list mutations
  const handleUpdateItem = (index: number, fields: Partial<LiturgyStep>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...fields };
    updateConfig({ liturgyItems: updated });
  };

  const handleAddItem = () => {
    const newItem: LiturgyStep = {
      id: `custom-lit-${Date.now()}`,
      category: 'LITURGI',
      title: 'Judul Prosesi / Kegiatan Baru',
      posture: 'Umat Berdiri',
      notes: '',
    };
    const updated = [...items, newItem];
    updateConfig({ liturgyItems: updated });
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    const newActive = currentIndex >= updated.length ? updated.length - 1 : currentIndex;
    updateConfig({
      liturgyItems: updated,
      activeLiturgyIndex: newActive,
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    let newActive = currentIndex;
    if (currentIndex === index) {
      newActive = targetIndex;
    } else if (currentIndex === targetIndex) {
      newActive = index;
    }

    updateConfig({
      liturgyItems: updated,
      activeLiturgyIndex: newActive,
    });
  };

  const handleApplyPreset = (preset: LiturgyStep[]) => {
    if (window.confirm('Terapkan template susunan prosesi ini?')) {
      updateConfig({
        liturgyItems: preset,
        activeLiturgyIndex: 0,
        liturgyAnimationKey: (config.liturgyAnimationKey || 0) + 1,
      });
    }
  };

  const filteredItems = items.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.posture && item.posture.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
      {/* Header Title */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-[#093A6E] flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-amber-500" />
            <span>Floating Rundown Prosesi Misa (Bawah Tengah Full Width)</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Tampilkan judul kegiatan/prosesi misa dan sikap posisi umat di floating bar bawah layar. Name Tag otomatis dinonaktifkan saat floating rundown aktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleShow}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              config.showLiturgyTracker
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {config.showLiturgyTracker ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{config.showLiturgyTracker ? '🟢 FLOATING LIVE AKTIF' : '⚪ FLOATING NONAKTIF'}</span>
          </button>
        </div>
      </div>

      {/* Auto Name Tag Deactivation Notice */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-[#093A6E]">
        <Info className="w-4 h-4 shrink-0 text-blue-600" />
        <span className="font-semibold">
          <strong>Mode Siaran Khidmat:</strong> Saat Floating Rundown aktif, Name Tag pembicara otomatis disembunyikan agar layar tetap bersih dan fokus pada teks prosesi misa serta posisi umat.
        </span>
      </div>

      {/* 1. PROMINENT LIVE CONTROLLER HUD CARD */}
      <div className="bg-gradient-to-br from-[#093A6E] to-[#041a33] text-white rounded-2xl p-5 shadow-lg border border-blue-900/60 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              PROSESI AKTIF SAAT INI (LANGKAH {currentIndex + 1} DARI {items.length})
            </span>
          </div>

          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black shadow-xs">
            {currentStep?.posture || 'Umat Berdiri'}
          </span>
        </div>

        {/* Large Current Step Display */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-black text-[#FFF7E5] drop-shadow-sm leading-tight">
              {currentStep?.title || 'Belum ada langkah prosesi'}
            </h3>
          </div>
        </div>

        {/* Primary Action Buttons (Prev / Next / Reset) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={handlePrevStep}
            disabled={currentIndex === 0}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentIndex === 0
                ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xs'
            }`}
          >
            <SkipBack className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <button
            onClick={handleResetToFirst}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>Reset ke Awal (#1)</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentIndex >= items.length - 1}
            className={`py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              currentIndex >= items.length - 1
                ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300'
            }`}
          >
            <span>LANGKAH BERIKUTNYA</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. TEMPLATE RUNDOWN CEPAT (PRESET) */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-extrabold text-[#093A6E] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-500" />
          Template Susunan Prosesi Misa:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleApplyPreset(DEFAULT_CATHOLIC_MASS_RUNDOWN)}
            className="p-3 bg-blue-50/80 hover:bg-blue-100/80 text-[#093A6E] border border-blue-200 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">✝️ Misa Kudus Lengkap (TPE)</span>
              <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">29 Langkah</span>
            </div>
            <span className="text-[11px] text-slate-600">Ritus Pembuka hingga Berkat & Pengutusan</span>
          </button>

          <button
            onClick={() => handleApplyPreset(TEMPLATE_DAILY_MASS_RUNDOWN)}
            className="p-3 bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 border border-amber-200 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">🕊️ Misa Harian / Kampus</span>
              <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">10 Langkah</span>
            </div>
            <span className="text-[11px] text-slate-600">Format ringkas untuk perayaan harian</span>
          </button>

          <button
            onClick={() => handleApplyPreset(TEMPLATE_WORD_LITURGY_RUNDOWN)}
            className="p-3 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">📖 Ibadat Sabda / Taize</span>
              <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">6 Langkah</span>
            </div>
            <span className="text-[11px] text-slate-600">Ibadat Sabda atau rekoleksi doa</span>
          </button>
        </div>
      </div>

      {/* 3. SUSUNAN DAFTAR PROSESI INTERAKTIF */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-extrabold text-[#093A6E] uppercase tracking-wider">
            Daftar Urutan Prosesi ({items.length} Langkah):
          </span>

          <button
            onClick={handleAddItem}
            className="px-3.5 py-1.5 bg-[#093A6E] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan Baru</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kegiatan / posisi umat..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Step Items List */}
        <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredItems.map(({ item, originalIndex }) => {
            const isLiveActive = currentIndex === originalIndex;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
                  isLiveActive
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Step Index & Quick Live Button */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                      isLiveActive
                        ? 'bg-[#093A6E] text-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{originalIndex + 1}
                  </span>

                  <button
                    onClick={() => handleJumpToStep(originalIndex)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                      isLiveActive
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-100 hover:bg-[#093A6E] text-slate-700 hover:text-white border border-slate-200'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isLiveActive ? '● AKTIF LIVE' : 'GO LIVE'}</span>
                  </button>
                </div>

                {/* Middle: Title & Posture Selection */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 min-w-0">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(originalIndex, { title: e.target.value })}
                      placeholder="Nama prosesi / kegiatan..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-black text-xs text-slate-900 focus:border-blue-600 outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <select
                      value={item.posture || 'Umat Berdiri'}
                      onChange={(e) => handleUpdateItem(originalIndex, { posture: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-800 outline-none cursor-pointer focus:bg-white"
                    >
                      <option value="Umat Berdiri">🧍 Umat Berdiri</option>
                      <option value="Umat Duduk">🪑 Umat Duduk</option>
                      <option value="Umat Berlutut">🧎 Umat Berlutut</option>
                      <option value="Umat Berjalan">🚶 Umat Berjalan</option>
                      <option value="Umat Hening">🤫 Umat Hening</option>
                    </select>
                  </div>
                </div>

                {/* Right: Reorder & Delete */}
                <div className="flex items-center justify-end gap-1 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleMoveItem(originalIndex, 'up')}
                    disabled={originalIndex === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                    title="Geser ke Atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveItem(originalIndex, 'down')}
                    disabled={originalIndex === items.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                    title="Geser ke Bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(originalIndex)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded disabled:opacity-30 cursor-pointer ml-1"
                    title="Hapus Kegiatan Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
