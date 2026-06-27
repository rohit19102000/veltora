'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useStore, WatchConfig } from '@/lib/useStore';
import { audioController } from '@/lib/AudioController';
import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';

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

interface CustomizerPanelProps {
  scrollProgress?: number;
}

export default function CustomizerPanel({ scrollProgress = 0 }: CustomizerPanelProps) {
  const caseFinish = useStore((state) => state.caseFinish);
  const dialColor = useStore((state) => state.dialColor);
  const indexStyle = useStore((state) => state.indexStyle);
  const strapType = useStore((state) => state.strapType);
  const initials = useStore((state) => state.initials);
  const totalPrice = useStore((state) => state.totalPrice);
  const explodeProgress = useStore((state) => state.explodeProgress);
  const xRayMode = useStore((state) => state.xRayMode);

  const setCaseFinish = useStore((state) => state.setCaseFinish);
  const setDialColor = useStore((state) => state.setDialColor);
  const setIndexStyle = useStore((state) => state.setIndexStyle);
  const setStrapType = useStore((state) => state.setStrapType);
  const setInitials = useStore((state) => state.setInitials);
  const setExplodeProgress = useStore((state) => state.setExplodeProgress);
  const setXRayMode = useStore((state) => state.setXRayMode);
  const setCertificateOpen = useStore((state) => state.setCertificateOpen);

  const lastWindingProgress = useRef(0);

  // Discrete Step Transitions State
  const [currentStep, setCurrentStep] = useState(0);
  const [exitingStep, setExitingStep] = useState<number | null>(null);

  // Synchronize activeStep with scrollProgress discretely
  useEffect(() => {
    const stepsCount = 7;
    const step = Math.min(Math.floor(scrollProgress * stepsCount), stepsCount - 1);
    if (step !== currentStep) {
      setExitingStep(currentStep);
      setCurrentStep(step);

      // Clear the exiting card after its transition completes
      const timer = setTimeout(() => {
        setExitingStep(null);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [scrollProgress, currentStep]);

  const handleCaseChange = (value: WatchConfig['caseFinish']) => {
    audioController.playClasp();
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
    audioController.playClasp();
    setStrapType(value);
  };

  const handleExplodeChange = (val: number) => {
    setExplodeProgress(val);
    if (Math.abs(val - lastWindingProgress.current) >= 0.04) {
      audioController.playWinding();
      lastWindingProgress.current = val;
    }
  };

  const handleReserveClick = () => {
    audioController.playClasp();
    setCertificateOpen(true);
  };

  const getCardClassName = (idx: number) => {
    if (idx === currentStep) {
      if (currentStep === 0) {
        return 'customizer-card card-active-top';
      }
      return 'customizer-card card-active';
    }
    if (idx === currentStep - 1) {
      return 'customizer-card card-previous';
    }
    if (idx === exitingStep) {
      return 'customizer-card card-exiting';
    }
    return 'customizer-card card-hidden';
  };

  const stepsData = [
    { label: '01. CASE FINISH', num: '01' },
    { label: '02. BESPOKE DIAL LACQUER', num: '02' },
    { label: '03. INDEX MARKERS', num: '03' },
    { label: '04. BESPOKE STRAP', num: '04' },
    { label: '05. MECHANICS', num: '05' },
    { label: '06. CASEBACK ENGRAVING', num: '06' },
    { label: '07. RESERVE ATELIER', num: '07' },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Dynamic Style Tag for Customizer transitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        .customizer-card-container {
          position: relative;
          height: 240px;
          width: 100%;
          overflow: visible;
        }
        @media (min-width: 768px) {
          .customizer-card-container {
            height: 520px;
          }
        }
        .customizer-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 240px;
          background: rgba(22, 19, 15, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(184, 161, 106, 0.18);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        @media (min-width: 640px) {
          .customizer-card {
            padding: 24px;
          }
        }
        .card-hidden {
          opacity: 0;
          transform: translate3d(240px, 380px, 0) scale(0.92);
          pointer-events: none;
        }
        .card-exiting {
          opacity: 0;
          transform: translate3d(0, -90px, 0) scale(0.92);
          pointer-events: none;
          transition: opacity 0.28s cubic-bezier(0.4, 0, 1, 1), transform 0.28s cubic-bezier(0.4, 0, 1, 1);
        }
        .card-previous {
          opacity: 0;
          transform: translate3d(0, -90px, 0) scale(0.92);
          pointer-events: none;
          transition: opacity 0.38s cubic-bezier(0.25, 1, 0.5, 1), transform 0.38s cubic-bezier(0.25, 1, 0.5, 1);
        }
        @media (min-width: 768px) {
          .card-previous {
            opacity: 0.7;
            transform: translate3d(0, 0, 0) scale(1);
            pointer-events: auto;
            border-color: rgba(184, 161, 106, 0.1);
          }
        }
        .card-active {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          pointer-events: auto;
          box-shadow: 0 0 30px rgba(207, 162, 64, 0.15);
          border-color: rgba(184, 161, 106, 0.35);
          transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.15s, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.15s;
        }
        @media (min-width: 768px) {
          .card-active {
            transform: translate3d(0, 260px, 0) scale(1);
          }
        }
        .card-active-top {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          pointer-events: auto;
          box-shadow: 0 0 30px rgba(207, 162, 64, 0.15);
          border-color: rgba(184, 161, 106, 0.35);
          transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}} />

      {/* Main Container: Column 1 (Progress Line), Column 2 ( Escalator stack ) */}
      <div className="flex gap-6 items-stretch relative min-h-[560px]">
        
        {/* PROGRESS TIMELINE COL */}
        <div className="w-6 flex flex-col items-center relative py-2 select-none">
          {/* Faint background track */}
          <div className="absolute top-0 bottom-0 w-[1px] bg-veltora-charcoal z-0" />
          
          {/* Active gold progress filling line */}
          <div 
            className="absolute top-0 w-[1px] bg-veltora-gold transition-all duration-100 z-10"
            style={{ height: `${scrollProgress * 100}%` }}
          />

          {/* Staggered dots along the line */}
          {stepsData.map((step, idx) => {
            const isCompleted = currentStep >= idx;
            const isActive = currentStep === idx;
            return (
              <div 
                key={idx}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ top: `${(idx / (stepsData.length - 1)) * 100}%` }}
              >
                <div 
                  className={`w-4 h-4 rounded-full flex items-center justify-center border font-mono text-[8px] font-bold transition-all duration-300 z-20 ${
                    isActive 
                      ? 'border-veltora-gold bg-veltora-gold text-veltora-obsidian shadow-[0_0_12px_rgba(207,162,64,0.7)] scale-110' 
                      : isCompleted
                      ? 'border-veltora-gold bg-veltora-obsidian text-veltora-gold'
                      : 'border-veltora-charcoal bg-veltora-obsidian text-veltora-steel'
                  }`}
                >
                  {step.num}
                </div>
              </div>
            );
          })}
        </div>

        {/* ESCALATOR CARD STACK COL */}
        <div className="flex-1 flex flex-col justify-between">
          
          {/* Scroll Up Hint */}
          <div className="h-6 flex items-center justify-center">
            {scrollProgress > 0.05 && (
              <span className="text-[10px] font-mono text-veltora-gold/50 uppercase tracking-[0.2em] flex items-center gap-1.5 animate-pulse font-bold">
                <ArrowUp className="w-3.5 h-3.5" /> Scroll up for previous option
              </span>
            )}
          </div>

          {/* Cards Frame */}
          <div className="customizer-card-container">
            
            {/* CARD 0: CASE FINISH */}
            <div className={getCardClassName(0)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                01. CASE FINISH SELECTION
              </span>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 mt-3 sm:mt-4 overflow-y-auto custom-scrollbar pr-1">
                {CASE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleCaseChange(option.id)}
                    className={`group flex items-center gap-2 sm:gap-3 px-2 py-2 sm:px-3.5 sm:py-3.5 rounded-lg border text-left transition-all ${
                      caseFinish === option.id
                        ? 'border-veltora-gold bg-veltora-gold/5 shadow-[0_0_8px_rgba(207,162,64,0.08)]'
                        : 'border-veltora-gold/10 bg-veltora-obsidian/45 hover:border-veltora-gold/30'
                    }`}
                  >
                    <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-veltora-gold/20 flex-shrink-0" style={{ backgroundColor: option.color }} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-veltora-cream truncate leading-none">{option.label}</span>
                      <span className="text-[8px] sm:text-[9px] text-veltora-steel uppercase truncate mt-0.5 font-semibold">{option.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CARD 1: DIAL COLOR */}
            <div className={getCardClassName(1)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                02. BESPOKE DIAL LACQUER
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-3.5 flex-1 mt-3 sm:mt-4 overflow-y-auto custom-scrollbar">
                {DIAL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDialChange(option.value)}
                    className={`group flex items-center gap-2 sm:gap-3 px-2.5 py-2 sm:px-3.5 sm:py-3 rounded-lg border text-left transition-all ${
                      dialColor === option.value
                        ? 'border-veltora-gold bg-veltora-gold/5 shadow-[0_0_8px_rgba(207,162,64,0.08)]'
                        : 'border-veltora-gold/10 bg-veltora-obsidian/45 hover:border-veltora-gold/30'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full border border-white/10 transition-transform group-hover:scale-105" style={{ backgroundColor: option.value }} />
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-veltora-cream">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CARD 2: INDEX STYLE */}
            <div className={getCardClassName(2)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                03. INDEX MARKERS STYLE
              </span>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4.5 flex-1 overflow-y-auto custom-scrollbar">
                {INDEX_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleIndexChange(option.value)}
                    className={`px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg border text-[10px] sm:text-xs font-mono text-center transition-all truncate ${
                      indexStyle === option.value
                        ? 'border-veltora-gold bg-veltora-gold/5 text-veltora-gold font-bold shadow-[0_0_8px_rgba(207,162,64,0.08)]'
                        : 'border-veltora-gold/10 bg-veltora-obsidian/45 text-veltora-cream hover:border-veltora-gold/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CARD 3: STRAP TYPE */}
            <div className={getCardClassName(3)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                04. BESPOKE STRAP SELECTOR
              </span>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mt-3 sm:mt-4 flex-1 overflow-y-auto custom-scrollbar">
                {STRAP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStrapChange(option.value)}
                    className={`group flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg border transition-all ${
                      strapType === option.value
                        ? 'border-veltora-gold bg-veltora-gold/5 shadow-[0_0_8px_rgba(207,162,64,0.08)]'
                        : 'border-veltora-gold/10 bg-veltora-obsidian/45 hover:border-veltora-gold/30'
                    }`}
                  >
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden mb-1.5 sm:mb-2 border border-veltora-gold/10 relative flex-shrink-0">
                      <Image 
                        src={option.swatch} 
                        alt={option.label}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-veltora-cream text-center leading-none truncate w-full font-bold">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CARD 4: BESPOKE MECHANICS */}
            <div className={getCardClassName(4)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                05. BESPOKE MECHANICS CONTROLS
              </span>
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Watch Explosion Slider */}
                <div className="bg-veltora-obsidian/30 p-2 sm:p-3 rounded-lg space-y-1.5 sm:space-y-2 border border-veltora-gold/5">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono">
                    <span className="text-veltora-cream font-bold">3D DECONSTRUCT VIEW</span>
                    <span className="text-veltora-gold font-bold">{Math.round(explodeProgress * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodeProgress}
                    onChange={(e) => handleExplodeChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-veltora-charcoal rounded-lg appearance-none cursor-pointer accent-veltora-gold"
                  />
                </div>

                {/* Dial X-Ray Mode */}
                <div className="flex items-center justify-between bg-veltora-obsidian/30 p-2 sm:p-3 rounded-lg border border-veltora-gold/5">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] sm:text-xs font-mono text-veltora-cream uppercase font-bold font-semibold">DIAL X-RAY MODE</span>
                    <span className="block text-[8px] sm:text-[9px] text-veltora-steel font-mono leading-none">
                      Reveal inner rotating movement.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      audioController.playClick();
                      setXRayMode(!xRayMode);
                    }}
                    className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      xRayMode ? 'bg-veltora-gold' : 'bg-veltora-charcoal'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-veltora-obsidian shadow ring-0 transition duration-200 ease-in-out ${
                        xRayMode ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 5: ENGRAVING */}
            <div className={getCardClassName(5)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                06. CASEBACK ENGRAVING
              </span>
              <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4.5 flex-1">
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  className="w-full bg-veltora-obsidian border border-veltora-gold/20 focus:border-veltora-gold-light rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-mono text-veltora-gold tracking-[0.25em] focus:outline-none uppercase font-bold"
                  placeholder="INITIALS (MAX 3)"
                />
                <p className="text-[9px] sm:text-[10px] text-veltora-steel font-mono leading-relaxed mt-1 sm:mt-1.5 uppercase font-medium">
                  Engraved live onto the back sapphire crystal center inside the Veltora Atelier Geneva.
                </p>
              </div>
            </div>

            {/* CARD 6: VALUATION / RESERVE */}
            <div className={getCardClassName(6)}>
              <span className="text-[10px] sm:text-xs font-mono text-veltora-gold tracking-[0.15em] uppercase font-bold">
                07. RESERVE COMMISSION
              </span>
              <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 flex-1">
                <div className="flex justify-between items-end bg-veltora-obsidian/30 p-2.5 sm:p-3.5 rounded-lg border border-veltora-gold/5">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-veltora-steel uppercase leading-none font-semibold">Total Price</span>
                    <div className="text-lg sm:text-2xl font-display font-bold text-veltora-gold leading-tight mt-0.5 sm:mt-1">
                      CHF {totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] sm:text-[9px] font-mono text-veltora-steel uppercase leading-none font-semibold">Deposit (20%)</span>
                    <div className="text-xs sm:text-sm font-mono text-veltora-cream leading-tight mt-0.5 sm:mt-1 font-bold">
                      CHF {(totalPrice * 0.20).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReserveClick}
                  className="w-full bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold py-2.5 sm:py-3.5 rounded-lg transition-all text-[10px] sm:text-xs tracking-widest"
                >
                  Reserve Configuration
                </button>
              </div>
            </div>

          </div>

          {/* Scroll Down Hint */}
          <div className="h-6 flex items-center justify-center">
            {scrollProgress < 0.95 && (
              <span className="text-[10px] font-mono text-veltora-gold/50 uppercase tracking-[0.2em] flex items-center gap-1.5 animate-pulse font-bold">
                <ArrowDown className="w-3.5 h-3.5" /> Scroll down for next option
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
