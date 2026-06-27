'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/lib/useStore';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { audioController } from '@/lib/AudioController';

export default function BespokeCertificate() {
  const isCertificateOpen = useStore((state) => state.isCertificateOpen);
  const setCertificateOpen = useStore((state) => state.setCertificateOpen);
  const setCartOpen = useStore((state) => state.setCartOpen);

  const activeModel = useStore((state) => state.activeModel);
  const caseFinish = useStore((state) => state.caseFinish);
  const dialColor = useStore((state) => state.dialColor);
  const indexStyle = useStore((state) => state.indexStyle);
  const strapType = useStore((state) => state.strapType);
  const initials = useStore((state) => state.initials);
  const totalPrice = useStore((state) => state.totalPrice);

  // Generate a unique Atelier Commission Number
  const commissionNumber = useMemo(() => {
    const hashInput = `${activeModel}-${caseFinish}-${dialColor}-${strapType}-${initials}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      hash = (hash << 5) - hash + hashInput.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0');
    return `VT-923-${hex.slice(0, 6)}`;
  }, [activeModel, caseFinish, dialColor, strapType, initials]);

  // Format selections for print readability
  const formattedSpecs = useMemo(() => {
    return {
      case: caseFinish.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      strap: strapType.charAt(0).toUpperCase() + strapType.slice(1),
      indices: indexStyle.charAt(0).toUpperCase() + indexStyle.slice(1),
      dial: dialColor === '#0A0A0B' ? 'Obsidian Black' :
            dialColor === '#F5F0E8' ? 'Geneva Cream' :
            dialColor === '#1D3B5C' ? 'Meteorite Blue' :
            dialColor === '#1D3F2D' ? 'Forest Lacquer' : 'Champagne Gold'
    };
  }, [caseFinish, strapType, indexStyle, dialColor]);

  if (!isCertificateOpen) return null;

  const handlePrint = () => {
    audioController.playClick();
    window.print();
  };

  const handleProceed = () => {
    audioController.playClasp();
    setCertificateOpen(false);
    setCartOpen(true);
  };

  const handleClose = () => {
    audioController.playClick();
    setCertificateOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 overflow-y-auto no-print py-10">
      {/* Dynamic style block for printing clean certificates */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-certificate-container, #print-certificate-container * {
            visibility: visible !important;
          }
          #print-certificate-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #ffffff !important;
            color: #0d0d0d !important;
            border: 8px double #CFA240 !important;
            padding: 4rem !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-gold-text {
            color: #8C6A1E !important;
          }
          .print-charcoal-text {
            color: #404040 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Main Overlay Card */}
      <div 
        id="print-certificate-container"
        className="relative w-full max-w-2xl bg-veltora-charcoal/95 border-2 border-veltora-gold/30 rounded-2xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between space-y-8 overflow-hidden text-center"
      >
        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t border-l border-veltora-gold/20" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t border-r border-veltora-gold/20" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b border-l border-veltora-gold/20" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b border-r border-veltora-gold/20" />

        {/* Close Button (No Print) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-veltora-steel hover:text-veltora-cream p-1.5 rounded-full transition-colors no-print bg-veltora-obsidian/45"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[10px] font-mono text-veltora-gold tracking-[0.3em] uppercase block print-gold-text">
            ATELIER BESPOKE COMMISSION
          </span>
          <h2 className="text-3xl sm:text-4xl font-display text-veltora-cream uppercase tracking-wider print-charcoal-text">
            Certificate of Craftsmanship
          </h2>
          <div className="w-20 h-[1px] bg-veltora-gold/30 mx-auto" />
        </div>

        {/* Certification Text */}
        <div className="space-y-4 max-w-lg mx-auto text-sm leading-relaxed text-veltora-steel font-mono">
          <p className="print-charcoal-text">
            This document certifies that the bespoke timepiece detailed below has been formally commissioned for hand-crafting at the Veltora Genevan Atelier.
          </p>
          <p className="text-xs text-veltora-gold/80 italic font-sans print-gold-text">
            Each bespoke piece is individual, undergoing 300 hours of precision machining, calibrating, and hand-polishing.
          </p>
        </div>

        {/* Commission Specs Table */}
        <div className="border border-veltora-gold/15 rounded-xl bg-veltora-obsidian/40 p-5 sm:p-6 text-left space-y-4 max-w-md mx-auto print-charcoal-text print:border-neutral-300 print:bg-transparent">
          <div className="flex justify-between items-center text-[10px] font-mono border-b border-veltora-gold/10 pb-2 mb-2 print:border-neutral-200">
            <span className="text-veltora-steel uppercase">Specifications</span>
            <span className="text-veltora-gold tracking-widest font-semibold print-gold-text">{commissionNumber}</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-veltora-steel">MODEL:</span>
              <span className="text-veltora-cream font-bold print-charcoal-text">{activeModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-veltora-steel">CASE FINISH:</span>
              <span className="text-veltora-cream print-charcoal-text">{formattedSpecs.case}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-veltora-steel">DIAL SPEC:</span>
              <span className="text-veltora-cream print-charcoal-text">{formattedSpecs.dial} ({formattedSpecs.indices})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-veltora-steel">STRAP SELECTION:</span>
              <span className="text-veltora-cream print-charcoal-text">{formattedSpecs.strap}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-veltora-steel">CLIENT ENGRAVING:</span>
              <span className="text-veltora-gold font-bold tracking-widest print-gold-text">{initials || 'NONE'}</span>
            </div>
            <div className="flex justify-between border-t border-veltora-gold/10 pt-2.5 mt-2 print:border-neutral-200">
              <span className="text-veltora-steel uppercase font-bold">TOTAL VALUATION:</span>
              <span className="text-veltora-gold font-bold font-display text-sm print-gold-text">CHF {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Seal and Signatures */}
        <div className="grid grid-cols-2 gap-4 items-center pt-4 border-t border-veltora-gold/10 max-w-md mx-auto print:border-neutral-200">
          {/* Atelier Seal */}
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <div className="relative w-12 h-12 flex items-center justify-center text-veltora-gold rounded-full border border-veltora-gold/20 print-gold-text print:border-neutral-300">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left font-mono text-[9px] leading-tight text-veltora-steel">
              <span className="block text-veltora-cream font-bold print-charcoal-text">GENÈVE SECURE</span>
              <span>VERIFIED BUILD</span>
            </div>
          </div>

          {/* Master Signature */}
          <div className="text-right flex flex-col items-end">
            <span className="text-veltora-gold font-display text-xl italic tracking-wide print-gold-text">
              Emil Veltora
            </span>
            <span className="text-[8px] font-mono text-veltora-steel uppercase mt-0.5">
              Master Watchmaker
            </span>
          </div>
        </div>

        {/* Action Buttons (No Print) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-veltora-gold/10 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 border border-veltora-gold/20 hover:border-veltora-gold text-veltora-gold font-mono uppercase text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-veltora-gold/5"
          >
            <Printer className="w-4 h-4" />
            <span>Download Certificate</span>
          </button>
          
          <button
            onClick={handleProceed}
            className="flex-1 bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Deposit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
