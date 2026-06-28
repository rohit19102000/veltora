import { create } from 'zustand';

export interface WatchConfig {
  caseFinish: 'gold' | 'rose_gold' | 'white_gold' | 'titanium' | 'dlc_black';
  dialColor: string; // hex color
  indexStyle: 'roman' | 'baton' | 'arabic' | 'skeleton';
  strapType: 'alligator' | 'calfskin' | 'steel' | 'titanium' | 'nato' | 'rubber';
  initials: string;
}

interface CustomizerState extends WatchConfig {
  isMuted: boolean;
  isCartOpen: boolean;
  activeModel: string;
  basePrice: number;
  totalPrice: number;
  explodeProgress: number;
  xRayMode: boolean;
  escapementVph: number;
  isCertificateOpen: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setCaseFinish: (finish: WatchConfig['caseFinish']) => void;
  setDialColor: (color: string) => void;
  setIndexStyle: (style: WatchConfig['indexStyle']) => void;
  setStrapType: (strap: WatchConfig['strapType']) => void;
  setInitials: (initials: string) => void;
  toggleMute: () => void;
  setCartOpen: (open: boolean) => void;
  setActiveModel: (model: string) => void;
  setBasePrice: (price: number) => void;
  setExplodeProgress: (progress: number) => void;
  setXRayMode: (xRay: boolean) => void;
  setEscapementVph: (vph: number) => void;
  setCertificateOpen: (open: boolean) => void;
  loadFromURL: () => void;
  getShareableLink: () => string;
  updatePrice: () => void;
  syncToURL: () => void;
}

const STRAP_PRICES = {
  alligator: 450,
  calfskin: 250,
  steel: 600,
  titanium: 800,
  nato: 150,
  rubber: 200,
};

const CASE_PRICES = {
  gold: 3500,
  rose_gold: 3800,
  white_gold: 4000,
  titanium: 2000,
  dlc_black: 1500,
};

export const useStore = create<CustomizerState>((set, get) => ({
  caseFinish: 'gold',
  dialColor: '#0A0A0B',
  indexStyle: 'baton',
  strapType: 'alligator',
  initials: '',
  isMuted: false,
  isCartOpen: false,
  activeModel: 'NOIR I',
  basePrice: 18000,
  totalPrice: 18000 + 3500 + 450, // base + gold + alligator
  explodeProgress: 0,
  xRayMode: false,
  escapementVph: 28800,
  isCertificateOpen: false,
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),

  setCaseFinish: (finish) => {
    set({ caseFinish: finish });
    get().updatePrice();
    get().syncToURL();
  },
  setDialColor: (color) => {
    set({ dialColor: color });
    get().syncToURL();
  },
  setIndexStyle: (style) => {
    set({ indexStyle: style });
    get().syncToURL();
  },
  setStrapType: (strap) => {
    set({ strapType: strap });
    get().updatePrice();
    get().syncToURL();
  },
  setInitials: (initials) => {
    set({ initials: initials.substring(0, 3).toUpperCase() });
    get().syncToURL();
  },
  toggleMute: () => {
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });
    if (typeof window !== 'undefined') {
      localStorage.setItem('veltora_muted', String(nextMuted));
    }
  },
  setCartOpen: (open) => set({ isCartOpen: open }),
  setActiveModel: (model) => {
    set({ activeModel: model });
    get().syncToURL();
  },
  setBasePrice: (price) => {
    set({ basePrice: price });
    get().updatePrice();
  },
  setExplodeProgress: (progress) => set({ explodeProgress: progress }),
  setXRayMode: (xRay) => set({ xRayMode: xRay }),
  setEscapementVph: (vph) => set({ escapementVph: vph }),
  setCertificateOpen: (open) => set({ isCertificateOpen: open }),
  
  // Helpers
  updatePrice: () => {
    const { basePrice, caseFinish, strapType } = get();
    const caseDelta = CASE_PRICES[caseFinish] || 0;
    const strapDelta = STRAP_PRICES[strapType] || 0;
    set({ totalPrice: basePrice + caseDelta + strapDelta });
  },

  syncToURL: () => {
    if (typeof window === 'undefined') return;
    const { caseFinish, dialColor, indexStyle, strapType, initials, activeModel } = get();
    const params = new URLSearchParams();
    params.set('model', activeModel);
    params.set('case', caseFinish);
    params.set('dial', dialColor);
    params.set('index', indexStyle);
    params.set('strap', strapType);
    if (initials) params.set('initials', initials);
    
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newRelativePathQuery);
  },

  loadFromURL: () => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const activeModel = params.get('model') || get().activeModel;
    const caseFinish = (params.get('case') as WatchConfig['caseFinish']) || get().caseFinish;
    const dialColor = params.get('dial') || get().dialColor;
    const indexStyle = (params.get('index') as WatchConfig['indexStyle']) || get().indexStyle;
    const strapType = (params.get('strap') as WatchConfig['strapType']) || get().strapType;
    const initials = params.get('initials') || get().initials;
    const isMuted = localStorage.getItem('veltora_muted') === 'true';

    set({
      activeModel,
      caseFinish,
      dialColor,
      indexStyle,
      strapType,
      initials,
      isMuted
    });
    get().updatePrice();
  },

  getShareableLink: () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }
}));
