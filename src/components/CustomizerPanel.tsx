'use client';

import React from 'react';
import { useStore, WatchConfig } from '@/lib/useStore';
import { audioController } from '@/lib/AudioController';
import Image from 'next/image';

const CASE_OPTIONS: { id: WatchConfig['caseFinish']; label: string; color: string; desc: string }[] = [
  { id: 'gold', label: 'Yellow Gold', color: '#D4AF37', desc: '18K Yellow Gold finish' },
  { id: 'rose_gold', label: 'Rose Gold', color: '#B76E79', desc: '18K Rose Gold alloy' },
  { id: 'white_gold', label: 'White Gold', color: '#E6E6FA', desc: 'Rhodium-plated White Gold' },
  { id: 'titanium', label: 'Titanium', color: '#8C8C8C', desc: 'Grade 5 brushed titanium' },
  { id: 'dlc_black', label: 'DLC Black', color: '#1A1A1A', desc: 'Diamond-like carbon steel' },
];

const DIAL_OPTIONS = [
  { value: '#0A0A0B', label: 'Obsidian Black', desc: 'Deep cosmic matte black' },
  { value: '#F5F0E8', label: 'Geneva Cream', desc: 'Heritage sand blasted cream' },
  { value: '#1D3B5C', label: 'Meteorite Blue', desc: 'Sunburst galactic blue' },
  { value: '#1D3F2D', label: 'Forest Lacquer', desc: 'Hand-lacquered dark forest green' },
  { value: '#D4AF37', label: 'Champagne Gold', desc: 'Brushed gold sunray dial' },
];

const INDEX_OPTIONS: { value: WatchConfig['indexStyle']; label: string }[] = [
  { value: 'baton', label: 'Classic Batons' },
  { value: 'roman', label: 'Roman Numerals' },
  { value: 'arabic', label: 'Arabic Numerals' },
  { value: 'skeleton', label: 'Openworked Skeleton' },
];

const STRAP_OPTIONS: { value: WatchConfig['strapType']; label: string; swatch: string }[] = [
  { value: 'alligator', label: 'Alligator Leather', swatch: '/assets/swatch_alligator.png' },
  { value: 'calfskin', label: 'Calfskin Leather', swatch: '/assets/swatch_calfskin.png' },
  { value: 'steel', label: 'Steel Bracelet', swatch: '/assets/swatch_steel.png' },
  { value: 'titanium', label: 'Titanium Mesh', swatch: '/assets/swatch_titanium.png' },
  { value: 'nato', label: 'Nylon NATO', swatch: '/assets/swatch_nato.png' },
  { value: 'rubber', label: 'Sport Rubber', swatch: '/assets/swatch_rubber.png' },
];

export default function CustomizerPanel() {
  const caseFinish = useStore((state) => state.caseFinish);
  const dialColor = useStore((state) => state.dialColor);
  const indexStyle = useStore((state) => state.indexStyle);
  const strapType = useStore((state) => state.strapType);
  const initials = useStore((state) => state.initials);
  const totalPrice = useStore((state) => state.totalPrice);
  const activeModel = useStore((state) => state.activeModel);

  const setCaseFinish = useStore((state) => state.setCaseFinish);
  const setDialColor = useStore((state) => state.setDialColor);
  const setIndexStyle = useStore((state) => state.setIndexStyle);
  const setStrapType = useStore((state) => state.setStrapType);
  const setInitials = useStore((state) => state.setInitials);
  const setCartOpen = useStore((state) => state.setCartOpen);

  const handleCaseChange = (value: WatchConfig['caseFinish']) => {
    audioController.playClick();
    setCaseFinish(value);
  };

  const handleDialChange = (value: string) => {
    audioController.playClick();
    setDialColor(value);
  };

  const handleIndexChange = (value: WatchConfig['indexStyle']) => {
    audioController.playClick();
    setIndexStyle(value);
  };

  const handleStrapChange = (value: WatchConfig['strapType']) => {
    audioController.playClick();
    setStrapType(value);
  };

  const handleReserveClick = () => {
    audioController.playClick();
    setCartOpen(true);
  };

  return (
    <div className="w-full bg-veltora-charcoal border border-veltora-gold/10 rounded-2xl p-6 sm:p-8 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* Configurator Header */}
      <div className="border-b border-veltora-gold/15 pb-4">
        <span className="text-[10px] font-mono text-veltora-gold tracking-widest uppercase">
          VELTORA BESPOKE PROGRAMME
        </span>
        <h2 className="text-2xl font-display text-veltora-cream tracking-wide uppercase mt-1">
          Configure Your Model: <span className="text-veltora-gold">{activeModel}</span>
        </h2>
      </div>

      {/* 1. CASE FINISH */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-veltora-steel tracking-wider">
          01. Case Finish & Material
        </label>
        <div className="flex flex-wrap gap-3">
          {CASE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCaseChange(option.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                caseFinish === option.id
                  ? 'border-veltora-gold bg-veltora-gold/5 shadow-[0_0_10px_rgba(207,162,64,0.1)]'
                  : 'border-veltora-gold/15 bg-veltora-obsidian hover:border-veltora-gold/35'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-veltora-obsidian shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-xs font-mono text-veltora-cream uppercase">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. DIAL COLOR */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-veltora-steel tracking-wider">
          02. Guilloche Dial Color
        </label>
        <div className="flex flex-wrap gap-3">
          {DIAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDialChange(option.value)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                dialColor === option.value
                  ? 'border-veltora-gold bg-veltora-gold/5 shadow-[0_0_10px_rgba(207,162,64,0.1)]'
                  : 'border-veltora-gold/15 bg-veltora-obsidian hover:border-veltora-gold/35'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-veltora-cream/10 shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: option.value }}
              />
              <span className="text-xs font-mono text-veltora-cream uppercase">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. INDICES STYLE */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-veltora-steel tracking-wider">
          03. Hour Markers / Indices
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INDEX_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleIndexChange(option.value)}
              className={`px-3 py-3 rounded-lg border text-center transition-all ${
                indexStyle === option.value
                  ? 'border-veltora-gold bg-veltora-gold/5 text-veltora-gold shadow-[0_0_10px_rgba(207,162,64,0.1)]'
                  : 'border-veltora-gold/15 bg-veltora-obsidian hover:border-veltora-gold/35 text-veltora-cream'
              }`}
            >
              <span className="text-xs font-mono uppercase font-bold tracking-wide">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. STRAP MATERIAL */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-veltora-steel tracking-wider">
          04. Strap Selection
        </label>
        <div className="grid grid-cols-3 gap-3">
          {STRAP_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStrapChange(option.value)}
              className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                strapType === option.value
                  ? 'border-veltora-gold bg-veltora-gold/5 shadow-[0_0_10px_rgba(207,162,64,0.1)]'
                  : 'border-veltora-gold/15 bg-veltora-obsidian hover:border-veltora-gold/35'
              }`}
            >
              {/* Display Higgsfield swatch image inside option button */}
              <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border border-veltora-gold/20 relative">
                <Image 
                  src={option.swatch} 
                  alt={option.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-mono text-veltora-cream text-center leading-tight">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. PERSONALISE ENGRAVING */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-veltora-steel tracking-wider">
          05. Caseback Initials Engraving
        </label>
        <div className="space-y-1">
          <input
            type="text"
            maxLength={3}
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            className="w-full bg-veltora-obsidian border border-veltora-gold/20 focus:border-veltora-gold-light rounded-lg px-4 py-2.5 text-sm font-mono text-veltora-gold tracking-widest focus:outline-none"
            placeholder="ENTER INITIALS (MAX 3)"
          />
          <p className="text-[10px] text-veltora-steel font-mono">
            Engraved live onto the back sapphire crystal center.
          </p>
        </div>
      </div>

      {/* CTA RESERVE */}
      <div className="border-t border-veltora-gold/15 pt-6 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-mono text-veltora-steel uppercase">Total Price</span>
            <div className="text-3xl font-display font-bold text-veltora-gold">
              CHF {totalPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-veltora-steel uppercase">Deposit (20%)</span>
            <div className="text-sm font-mono text-veltora-cream">
              CHF {(totalPrice * 0.20).toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={handleReserveClick}
          className="w-full bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-veltora-gold/20 flex items-center justify-center gap-2 text-sm tracking-widest"
        >
          <span>Reserve Custom Configuration</span>
        </button>
      </div>
    </div>
  );
}
