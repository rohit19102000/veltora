'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/useStore';
import { audioController } from '@/lib/AudioController';
import dynamic from 'next/dynamic';

const WatchCanvas = dynamic(() => import('@/components/WatchCanvas'), { ssr: false });
import CustomizerPanel from '@/components/CustomizerPanel';
import CheckoutDrawer from '@/components/CheckoutDrawer';
import BespokeCertificate from '@/components/BespokeCertificate';
import { transformToVeltora, VeltoraProduct } from '@/lib/transformProduct';
import { Volume2, VolumeX, Menu, X, ArrowDown, MapPin, Check, Star, Search, Truck, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

export default function HomePage() {
  const isMuted = useStore((state) => state.isMuted);
  const toggleMute = useStore((state) => state.toggleMute);
  const loadFromURL = useStore((state) => state.loadFromURL);
  const activeModel = useStore((state) => state.activeModel);
  const setActiveModel = useStore((state) => state.setActiveModel);
  const setBasePrice = useStore((state) => state.setBasePrice);
  const escapementVph = useStore((state) => state.escapementVph);
  const setEscapementVph = useStore((state) => state.setEscapementVph);

  // States
  const [navVisible, setNavVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorLagPos, setCursorLagPos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<'default' | 'hover-cta' | 'hover-card'>('default');
  const [cursorText, setCursorText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [loadPercentage, setLoadPercentage] = useState(0);
  
  // API Products
  const [products, setProducts] = useState<VeltoraProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<VeltoraProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Section Ref Scroll-based calculations
  const brandStoryRef = useRef<HTMLDivElement>(null);
  const craftsmanshipRef = useRef<HTMLDivElement>(null);
  const mechanismRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const collectionsTrackRef = useRef<HTMLDivElement>(null);
  const customizerRef = useRef<HTMLDivElement>(null);
  const heritageRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  // GSAP split-text character reveal animation
  useEffect(() => {
    if (!loadingScreen && heroTitleRef.current) {
      const chars = heroTitleRef.current.querySelectorAll('.char');
      gsap.fromTo(
        chars,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.04, ease: 'power4.out', delay: 0.3 }
      );
    }
  }, [loadingScreen]);

  const [craftScrollProgress, setCraftScrollProgress] = useState(0); // 0 -> 1 within the section scroll
  const [brandStoryProgress, setBrandStoryProgress] = useState(0); // 0 -> 1 scroll progress relative to screen center
  const [mechanismExplosion, setMechanismExplosion] = useState(0); // 0 -> 1 scroll explosive factor
  const [currentDetailIdx, setCurrentDetailIdx] = useState(0); // active detail step index (0 to 4)
  const [exitingDetailIdx, setExitingDetailIdx] = useState<number | null>(null); // exiting detail step index
  const [collectionsScrollProgress, setCollectionsScrollProgress] = useState(0); // 0 -> 1 within collections scroll
  const [collectionsTrackWidth, setCollectionsTrackWidth] = useState(0); // horizontal scroll track width in px
  const [collectionsSectionHeight, setCollectionsSectionHeight] = useState(0); // dynamic vertical height in px
  const [customizerScrollProgress, setCustomizerScrollProgress] = useState(0); // 0 -> 1 scroll progress for customizer steps
  const [activeHeritageYear, setActiveHeritageYear] = useState(1923);
  const [timelineProgress, setTimelineProgress] = useState(0); // 0 -> 1 within the active step
  const [countStats, setCountStats] = useState({ hours: 0, components: 0, year: 0, countries: 0 });
  const [activeSection, setActiveSection] = useState('hero'); // tracks active navbar section
  const [activeCardSide, setActiveCardSide] = useState<'front' | 'back'>('front'); // active side of the VPH card
  const [frontVph, setFrontVph] = useState(28800); // VPH value on front side of the card
  const [backVph, setBackVph] = useState(28800); // VPH value on back side of the card

  // Showrooms & Delivery Concierge States
  const allShowrooms = [
    { city: 'Geneva Atelier', address: 'Rue du Rhône 34, 1204 Genève', hours: 'Mon - Sat: 10:00 - 18:00', phone: '+41 22 310 1923' },
    { city: 'Dubai Exhibition Gallery', address: 'The Dubai Mall, Fashion Avenue, Dubai', hours: 'Mon - Sun: 10:00 - 22:00', phone: '+971 4 362 7900' },
    { city: 'Tokyo Ginza Boutique', address: '7-Chome Ginza, Tokyo 104-0061', hours: 'Tue - Sun: 11:00 - 19:00', phone: '+81 3 5562 1961' },
    { city: 'London Mayfair Salon', address: 'Bond Street 14, London W1S', hours: 'Mon - Sat: 10:00 - 18:30', phone: '+44 20 7493 1984' },
    { city: 'New York Fifth Ave Atelier', address: '730 Fifth Ave, New York NY 10019', hours: 'Mon - Sat: 10:00 - 19:00', phone: '+1 212 555 2024' },
  ];
  const [showroomSearch, setShowroomSearch] = useState('');
  const [filteredShowrooms, setFilteredShowrooms] = useState(allShowrooms);
  const [deliveryZip, setDeliveryZip] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<{ checked: boolean; deliverable: boolean; dateString?: string } | null>(null);
  const [flippedProductId, setFlippedProductId] = useState<number | null>(null);
  const [conciergeProgress, setConciergeProgress] = useState(0); // 0 -> 1 scroll progress for showrooms/delivery section

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Heritage Timeline Active Image index
  const heritageImages = {
    1923: '/assets/archive_1923.png',
    1961: '/assets/archive_1961.png',
    1984: '/assets/archive_1984.png',
    2024: '/assets/archive_2024.png',
  };

  const heritageEras = [
    {
      year: 1923,
      title: "The Founding Atelier",
      desc: "Founded in Geneva, Switzerland. Master watchmaker Emil Veltora sets up his bench with a singular obsession: to engineer the ultimate measure of time. The birth of a century-long dedication to hand-built mechanical luxury.",
      statLabel1: "Craftsmen",
      statVal1: "3 masters",
      statLabel2: "First Caliber",
      statVal2: "V-1 Handwound"
    },
    {
      year: 1961,
      title: "The Speed Revolution",
      desc: "Veltora pioneers high-frequency escapements. Prototyping a revolutionary 36,000 beats per hour caliber, establishing near-frictionless precision that captures fractions of a second with medical accuracy.",
      statLabel1: "Beat Rate",
      statVal1: "36,000 vph",
      statLabel2: "Power Reserve",
      statVal2: "40 Hours"
    },
    {
      year: 1984,
      title: "The Titanium Age",
      desc: "Breaking away from traditional heavy metals, Veltora drafts and manufactures the first premium aerospace-grade titanium watch casing. A legendary triumph of metallurgy combining featherlight comfort with near-indestructible strength.",
      statLabel1: "Case Material",
      statVal1: "Grade 5 Ti",
      statLabel2: "Tensile Strength",
      statVal2: "900 MPa"
    },
    {
      year: 2024,
      title: "The Caliber V-9 Masterpiece",
      desc: "The present-day pinnacle of the Veltora workshop. Handcrafting the 287-part Caliber V-9 Tourbillon in a state-of-the-art sterile cleanroom. 300 hours of assembly culminating in an engine of supreme horological ambition.",
      statLabel1: "Part Count",
      statVal1: "287 Pieces",
      statLabel2: "Build Time",
      statVal2: "300 Hours"
    }
  ];

  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    { name: 'Aurelius Vance', model: 'NOIR I Owner', quote: 'The sheer weight of the titanium and the obsidian dial makes me feel like I am wearing a piece of the cosmos.' },
    { name: 'Elena Rostova', model: 'SOLEIL Owner', quote: 'Watching the light reflect on the sunburst guilloche dial under the Geneva sky is a ritual in itself.' },
    { name: 'Marcus Sterling', model: 'ABYSSAL Owner', quote: 'It survived a deep dive in the North Sea without losing a fraction of a beat. A triumph of precision.' }
  ];

  // Reviews data (marquee vertical scrolling loop)
  const reviews = [
    {
      name: "Alexander Vance",
      text: "The Caliber V-9 is a mechanical triumph. The precision of the tourbillon movement combined with the hand-finished Côtes de Genève bridges is absolute watchmaking perfection. Veltora has redefined what a bespoke luxury timepiece can be.",
      rating: 5,
      date: "June 2026"
    },
    {
      name: "Genevieve Thorne",
      text: "There is an understated majesty in Veltora's engineering. It does not shout for attention; it commands it through pure craftsmanship. The customizer allowed me to tailor a timepiece that is truly an extension of my identity.",
      rating: 5,
      date: "April 2026"
    },
    {
      name: "Marc-André Dubois",
      text: "Assembly is a labor of love that shines in every macro detail. The guilloché dial catches light in a way that photos simply cannot capture. A masterpiece of Swiss engineering.",
      rating: 5,
      date: "May 2026"
    },
    {
      name: "Sophia Sterling",
      text: "It is not a watch—it is a sculpture that measures the flow of time. The titanium case is incredibly light yet feels exceptionally robust. An heirloom piece that my family will treasure for generations.",
      rating: 5,
      date: "March 2026"
    },
    {
      name: "Rohan Malhotra",
      text: "The buying process is as bespoke as the watch. The concierge kept me updated throughout the 300 hours of manual crafting. When I opened the box, I was speechless. Simply phenomenal.",
      rating: 5,
      date: "May 2026"
    },
    {
      name: "Elisa Rostova",
      text: "I customized a rose-gold bezel Soleil with a blue guilloche dial. The way light reflects on it is mesmerizing. Veltora has created the ultimate fusion of modern design and classic horological heritage.",
      rating: 5,
      date: "June 2026"
    },
    {
      name: "Kabir Verma",
      text: "Veltora Caliber V-9 is the crown jewel of my collection. I've collected watches for twenty years, but the level of hand beveling and attention to micro-assemblies here beats the major luxury brands hands down.",
      rating: 5,
      date: "February 2026"
    },
    {
      name: "Charlotte Dubois",
      text: "The titanium sandblasted texture feels modern yet extremely classy. Combined with the leather strap, it transition perfectly from casual afternoon gallery visits to formal evening dinners.",
      rating: 5,
      date: "March 2026"
    },
    {
      name: "Maximilian Sterling",
      text: "It's an engineering marvel. Watching the balance wheel oscillate through the open exhibition caseback is a daily joy. Precision timekeeping at its finest.",
      rating: 5,
      date: "January 2026"
    }
  ];

  // Waitlist form
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Initialize and load store configurations
  useEffect(() => {
    loadFromURL();

    // 1. Navbar Fade-in after 3 seconds
    const timer = setTimeout(() => {
      setNavVisible(true);
    }, 3000);

    // 2. Play initial mechanical tick on load, fades out after 3s
    audioController.playTick(2400, 0.08, 0.2);
    const tickInterval = setInterval(() => {
      audioController.playTick(2400, 0.06, 0.15);
    }, 1000);
    setTimeout(() => {
      clearInterval(tickInterval);
    }, 3000);

    // 3. Fetch product data from Fake Store API and transform
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://fakestoreapi.com/products?limit=6');
        const data = await res.json();
        const vProducts = data.map((item: { id: number; price: number; image: string; description: string }) => transformToVeltora(item));
        setProducts(vProducts);
        setFilteredProducts(vProducts);
      } catch (e) {
        console.error('Failed to fetch product data:', e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();

    return () => {
      clearTimeout(timer);
      clearInterval(tickInterval);
    };
  }, [loadFromURL]);

  // Loading Screen simulation progress
  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 8) + 4;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(interval);
        setTimeout(() => {
          setLoadingScreen(false);
        }, 600);
      }
      setLoadPercentage(currentPct);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Sync mute state with AudioController
  useEffect(() => {
    audioController.setMute(isMuted);
  }, [isMuted]);

  // 4. Custom lagging cursor pointer follow (using lerp)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setCursorState('default');
    const handleMouseUp = () => setCursorState('default');

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Lag loop (8 frames behind true pointer using lerp)
  useEffect(() => {
    let animId: number;
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateCursor = () => {
      setCursorLagPos((prev) => ({
        x: lerp(prev.x, cursorPos.x, 0.125), // 8 frames lag coefficient (1/8 = 0.125)
        y: lerp(prev.y, cursorPos.y, 0.125),
      }));
      animId = requestAnimationFrame(updateCursor);
    };

    animId = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(animId);
  }, [cursorPos]);

  // Dynamic horizontal track width calculation for watch collections slideshow
  useEffect(() => {
    const updateTrackWidth = () => {
      if (collectionsTrackRef.current) {
        const scrollWidth = collectionsTrackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Subtract full viewport width to align the right edge of the last card with the viewport right edge
        const trackWidth = Math.max(0, scrollWidth - viewportWidth);
        setCollectionsTrackWidth(trackWidth);
        
        // Dynamic vertical height: viewportHeight + horizontal overflow * scroll speed factor
        const dynamicHeight = trackWidth > 0 ? viewportHeight + trackWidth * 1.2 : viewportHeight;
        setCollectionsSectionHeight(dynamicHeight);
      }
    };
    updateTrackWidth();
    window.addEventListener('resize', updateTrackWidth);
    const timer = setTimeout(updateTrackWidth, 1000);
    return () => {
      window.removeEventListener('resize', updateTrackWidth);
      clearTimeout(timer);
    };
  }, [filteredProducts, products]);

  // Synchronize dynamic specifications details in Section 04 discretely
  useEffect(() => {
    const stepsCount = 5;
    const step = Math.min(Math.floor(mechanismExplosion * stepsCount), stepsCount - 1);
    if (step !== currentDetailIdx) {
      setExitingDetailIdx(currentDetailIdx);
      setCurrentDetailIdx(step);
      
      const timer = setTimeout(() => {
        setExitingDetailIdx(null);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [mechanismExplosion, currentDetailIdx]);

  // Scroll listeners for GSAP-like triggers and metronome
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 100);
      const vh = window.innerHeight;

      // 1. Ambient metronome tick metronome sound (starts when brandStory is visible, stops when scrolled past)
      if (brandStoryRef.current) {
        const rect = brandStoryRef.current.getBoundingClientRect();
        const inViewport = rect.top < vh && rect.bottom > 0;
        if (inViewport && !isMuted) {
          audioController.startMetronome(2.8);
        } else {
          audioController.stopMetronome();
        }

        // Calculate scroll progress relative to screen center
        const sectionHeight = rect.height;
        const sectionCenter = rect.top + sectionHeight / 2;
        const viewportCenter = vh / 2;
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
        const progress = Math.max(0, 1 - distanceFromCenter / (vh * 0.7)); // fade zone is 70% of viewport
        setBrandStoryProgress(progress);
      }

      // 2. Section 03 - Craftsmanship Reveal Scroll Progress
      if (craftsmanshipRef.current) {
        const rect = craftsmanshipRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - vh;
        const scrollDistance = -rect.top;
        const progress = totalScrollable > 0 ? scrollDistance / totalScrollable : 0;
        setCraftScrollProgress(Math.min(Math.max(progress, 0), 1));
      }


      // 3. Section 04 - Internal Mechanism Scroll Progress (Movement Canvas)
      if (mechanismRef.current) {
        const rect = mechanismRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - vh;
        const scrollDistance = -rect.top;
        const progress = totalScrollable > 0 ? scrollDistance / totalScrollable : 0;
        setMechanismExplosion(Math.min(Math.max(progress, 0), 1));
      }

      // 3.5 Section 05 - Collections Showcase Scroll Progress
      if (collectionsRef.current) {
        const rect = collectionsRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - vh;
        const scrollDistance = -rect.top;
        const progress = totalScrollable > 0 ? scrollDistance / totalScrollable : 0;
        setCollectionsScrollProgress(Math.min(Math.max(progress, 0), 1));
      }

      // 3.8 Section 06 - Customizer Scroll Progress
      if (customizerRef.current) {
        const rect = customizerRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - vh;
        const scrollDistance = -rect.top;
        const progress = totalScrollable > 0 ? scrollDistance / totalScrollable : 0;
        setCustomizerScrollProgress(Math.min(Math.max(progress, 0), 1));
      }

      // 4. Section 07 - Heritage timeline active year
      if (heritageRef.current) {
        const rect = heritageRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - vh;
        const scrollDistance = -rect.top;
        const progress = totalScrollable > 0 ? scrollDistance / totalScrollable : 0;
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        // 4 steps, index from 0 to 3
        let activeStepIdx = Math.floor(clampedProgress * 4);
        if (activeStepIdx > 3) activeStepIdx = 3;
        const localProgress = (clampedProgress * 4) - activeStepIdx;
        
        const years = [1923, 1961, 1984, 2024];
        setActiveHeritageYear(years[activeStepIdx]);
        setTimelineProgress(localProgress);

        // Count stats triggers
        if (clampedProgress > 0.02) {
          setCountStats({
            hours: Math.min(Math.round(clampedProgress * 300), 300),
            components: Math.min(Math.round(clampedProgress * 287), 287),
            year: Math.min(Math.round(1923 + (clampedProgress * 101)), 2024),
            countries: Math.min(Math.round(clampedProgress * 12), 12),
          });
        }

        // Track active section for navbar highlighting
        const sectionsList = [
          { id: 'brand-story', selector: '#brand-story' },
          { id: 'craftsmanship', selector: '#craftsmanship' },
          { id: 'movement', selector: '#movement' },
          { id: 'collections', selector: '#collections' },
          { id: 'customizer', selector: '#customizer' },
          { id: 'reviews', selector: '#reviews' }
        ];

        let currentActive = 'hero';
        for (const sec of sectionsList) {
          const el = document.querySelector(sec.selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= vh * 0.45 && rect.bottom > vh * 0.45) {
              currentActive = sec.id;
              break;
            }
          }
        }
        setActiveSection(currentActive);

        // Section 08: Showrooms & Delivery Concierge scroll tracker
        const showroomsEl = document.getElementById('showrooms');
        if (showroomsEl) {
          const rect = showroomsEl.getBoundingClientRect();
          const trackHeight = showroomsEl.clientHeight - vh;
          if (trackHeight > 0) {
            const progress = -rect.top / trackHeight;
            const clamped = Math.max(0, Math.min(1, progress));
            setConciergeProgress(clamped);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMuted]);

  // Testimonial auto advance
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Filter collections
  const filterProducts = (tier: string) => {
    audioController.playClick();
    setActiveFilter(tier);
    if (tier === 'ALL') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.tier.toUpperCase() === tier));
    }
  };

  // Configure watches (Routes model config to customizer section)
  const handleConfigureModel = (product: VeltoraProduct) => {
    audioController.playClick();
    setActiveModel(product.modelName);
    setBasePrice(product.price);
    
    // Smooth scroll to customizer section
    const customizerSec = document.getElementById('customizer-section');
    if (customizerSec) {
      customizerSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioController.playClick();
    if (waitlistEmail) {
      setWaitlistSuccess(true);
      setWaitlistEmail('');
    }
  };

  const handleShowroomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    audioController.playClick();
    if (!showroomSearch) {
      setFilteredShowrooms(allShowrooms);
    } else {
      const query = showroomSearch.toLowerCase();
      const filtered = allShowrooms.filter(s => 
        s.city.toLowerCase().includes(query) || 
        s.address.toLowerCase().includes(query)
      );
      setFilteredShowrooms(filtered);
    }
  };

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    audioController.playClick();
    if (!deliveryZip) return;
    const estDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setDeliveryResult({
      checked: true,
      deliverable: true,
      dateString: estDate
    });
  };

  const scrollToHeritageStep = (idx: number) => {
    if (!heritageRef.current) return;
    const containerTop = heritageRef.current.offsetTop;
    // Each step is 1.0 of the scrollable distance. Since parent is 500vh, scrollable is 400vh, i.e., 4 steps of 100vh.
    const targetScroll = containerTop + idx * window.innerHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Retrograde wedge calculations for caliber sunburst ray shadow
  const radStart = (-120 * Math.PI) / 180;
  const progressAngle = -120 + mechanismExplosion * 240;
  const radEnd = (progressAngle * Math.PI) / 180;
  const x1 = 50 + 42 * Math.cos(radStart);
  const y1 = 50 + 42 * Math.sin(radStart);
  const x2 = 50 + 42 * Math.cos(radEnd);
  const y2 = 50 + 42 * Math.sin(radEnd);
  const largeArcFlag = (mechanismExplosion * 240) > 180 ? 1 : 0;
  const wedgePath = `M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

  return (
    <div className="relative min-h-screen bg-veltora-obsidian font-body overflow-x-clip selection:bg-veltora-gold selection:text-veltora-obsidian">
      {/* LOADING SCREEN LOADER */}
      <div className={`fixed inset-0 bg-[#080708] z-[99999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${loadingScreen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative flex flex-col items-center gap-6">
          {/* SVG Watch Face Loader */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 100 100" className="opacity-90">
              {/* Outer Gold Dial Track */}
              <circle cx="50" cy="50" r="46" fill="none" stroke="#cfa240" strokeWidth="1" className="opacity-30" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="#cfa240" strokeWidth="1.5" strokeDasharray="1 3" className="opacity-60" />
              
              {/* Hour markers (12, 3, 6, 9) */}
              <line x1="50" y1="4" x2="50" y2="10" stroke="#cfa240" strokeWidth="2" />
              <line x1="96" y1="50" x2="90" y2="50" stroke="#cfa240" strokeWidth="2" />
              <line x1="50" y1="96" x2="50" y2="90" stroke="#cfa240" strokeWidth="2" />
              <line x1="4" y1="50" x2="10" y2="50" stroke="#cfa240" strokeWidth="2" />
              
              {/* Second Hand (Sweeping Line) */}
              <g className="animate-sweep-second" style={{ transformOrigin: '50px 50px' }}>
                {/* Counterweight */}
                <line x1="50" y1="50" x2="50" y2="60" stroke="#f3e5ab" strokeWidth="1.5" />
                {/* Main Hand */}
                <line x1="50" y1="50" x2="50" y2="10" stroke="#cfa240" strokeWidth="1.5" />
                {/* Tip Dot */}
                <circle cx="50" cy="10" r="2.5" fill="#f3e5ab" />
              </g>

              {/* Center Pin */}
              <circle cx="50" cy="50" r="4" fill="#f3e5ab" />
              <circle cx="50" cy="50" r="1.5" fill="#080708" />
            </svg>
            
            {/* Volumetric ambient glow underneath */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(207,162,64,0.12)_0%,transparent_70%)] animate-pulse pointer-events-none" />
          </div>

          {/* Brand & Loading Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display tracking-[0.3em] text-veltora-cream uppercase">
              VELTORA
            </h2>
            <p className="text-[9px] font-mono text-veltora-gold tracking-[0.4em] uppercase">
              ATELIER GENÈVE
            </p>
            
            {/* Loading Progress */}
            <div className="pt-4 flex flex-col items-center gap-1.5">
              <div className="w-32 h-[1px] bg-veltora-charcoal relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-veltora-gold transition-all duration-300"
                  style={{ width: `${loadPercentage}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-veltora-steel tracking-widest mt-1">
                CALIBRATING ESCAPEMENT · {loadPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic lagging cursor */}
      <div 
        className={`custom-cursor flex items-center justify-center ${
          cursorState === 'hover-cta' ? 'hover-cta' : cursorState === 'hover-card' ? 'hover-card' : ''
        }`}
        style={{ left: `${cursorLagPos.x}px`, top: `${cursorLagPos.y}px` }}
      >
        {cursorState !== 'default' && (
          <span className="text-[8px] font-mono font-bold tracking-widest text-veltora-obsidian uppercase select-none pointer-events-none">
            {cursorText}
          </span>
        )}
      </div>

      {/* GLOBAL NAVIGATION HEADER */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 border-b border-veltora-gold/5 ${
          navVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${scrolled ? 'bg-veltora-obsidian/75 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <a 
            href="#" 
            className="text-veltora-cream font-display text-2xl uppercase tracking-[0.25em] hover:text-veltora-gold transition-colors"
            onPointerOver={() => { setCursorState('hover-cta'); setCursorText('TOP'); }}
            onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
          >
            VELTORA
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-widest uppercase">
            {[
              { id: 'brand-story', label: 'Manifesto', href: '#brand-story' },
              { id: 'craftsmanship', label: 'Craftsmanship', href: '#craftsmanship' },
              { id: 'movement', label: 'The Caliber', href: '#movement' },
              { id: 'collections', label: 'Collections', href: '#collections' },
              { id: 'customizer', label: 'Customizer', href: '#customizer' },
              { id: 'reviews', label: 'Reviews', href: '#reviews' },
            ].map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a 
                  key={link.id} 
                  href={link.href} 
                  className={`relative py-1 transition-all duration-300 ${
                    isActive 
                      ? 'text-veltora-gold font-bold' 
                      : 'text-veltora-steel hover:text-veltora-cream'
                  }`}
                  style={isActive ? { textShadow: '0 0 10px rgba(207, 162, 64, 0.7)' } : undefined}
                >
                  {link.label}
                  {/* Glowing underline indicator */}
                  <span 
                    className={`absolute bottom-0 left-0 w-full h-[1px] bg-veltora-gold transition-all duration-300 origin-center ${
                      isActive ? 'scale-x-100 opacity-100 shadow-[0_0_8px_rgba(207,162,64,0.8)]' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-6">
            {/* Audio Toggle */}
            <button 
              onClick={() => {
                audioController.playClick();
                toggleMute();
              }}
              className="text-veltora-steel hover:text-veltora-gold transition-colors"
              onPointerOver={() => { setCursorState('hover-cta'); setCursorText(isMuted ? 'UNMUTE' : 'MUTE'); }}
              onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-veltora-gold" />}
            </button>

            {/* CTA Button */}
            <a 
              href="#customizer" 
              className="hidden sm:inline-block border border-veltora-gold hover:bg-veltora-gold hover:text-veltora-obsidian text-veltora-gold px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all rounded"
              onPointerOver={() => { setCursorState('hover-cta'); setCursorText('BESPOKE'); }}
              onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
            >
              Reserve Build
            </a>

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-veltora-cream hover:text-veltora-gold transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-veltora-obsidian/95 z-[99] flex flex-col justify-center p-12 space-y-8 animate-fade-in">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-veltora-cream hover:text-veltora-gold"
          >
            <X className="w-8 h-8" />
          </button>
          <nav className="flex flex-col space-y-6 text-2xl font-display uppercase tracking-widest text-veltora-cream">
            <a href="#brand-story" onClick={() => setMobileMenuOpen(false)}>Manifesto</a>
            <a href="#craftsmanship" onClick={() => setMobileMenuOpen(false)}>Craftsmanship</a>
            <a href="#movement" onClick={() => setMobileMenuOpen(false)}>The Caliber</a>
            <a href="#collections" onClick={() => setMobileMenuOpen(false)}>Collections</a>
            <a href="#customizer" onClick={() => setMobileMenuOpen(false)}>Customizer</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
          </nav>
        </div>
      )}

      {/* SECTION 01 — HERO: CINEMATIC INTRO */}
      <section className="relative w-full h-screen bg-black flex flex-col justify-between overflow-hidden">
        {/* Higgsfield Hero loop video */}
        <video 
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          autoPlay 
          muted 
          loop 
          playsInline
          poster="/assets/hero_still.png"
        >
          <source src="/assets/hero_video.mp4" type="video/mp4" />
        </video>

        {/* Floating volumetric particles grid background overlay */}
        <div className="absolute inset-0 bg-radial-vignette mix-blend-overlay pointer-events-none" />

        {/* Content Details */}
        <div className="flex-1 flex flex-col justify-end items-center text-center pb-24 z-20 pointer-events-none">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 ref={heroTitleRef} className="text-[12vw] xs:text-[10vw] sm:text-8xl md:text-9xl font-display tracking-[0.22em] sm:tracking-[0.35em] text-veltora-cream uppercase overflow-hidden py-2 select-none whitespace-nowrap text-center">
              {"VELTORA".split("").map((char, index) => (
                <span key={index} className="char inline-block opacity-0 translate-y-[60px]">
                  {char}
                </span>
              ))}
            </h1>
            <p className="text-sm sm:text-base font-mono tracking-[0.5em] text-veltora-gold uppercase">
              Time, Elevated.
            </p>
          </div>
        </div>

        {/* Scroll CTA indicator */}
        <div className="absolute bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-1.5 z-20 animate-bounce">
          <a 
            href="#brand-story" 
            className="text-[10px] font-mono tracking-widest text-veltora-gold uppercase cursor-pointer"
            onPointerOver={() => { setCursorState('hover-cta'); setCursorText('ENTER'); }}
            onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
          >
            Discover the Movement
          </a>
          <ArrowDown className="w-3.5 h-3.5 text-veltora-gold" />
        </div>
      </section>

      {/* SECTION 02 — BRAND STORY: THE OBSESSION */}
      <section id="brand-story" ref={brandStoryRef} className="relative w-full min-h-screen py-32 flex items-center justify-center overflow-hidden bg-[#080708]">
        {/* Background Image with Dark Vignette/Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image 
            src="/assets/workshop.png" 
            alt="Watchmaker Hands" 
            fill
            className="object-cover transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${1.0 + brandStoryProgress * 0.1})`,
              opacity: 0.35
            }}
          />
          {/* Gradients to fade to solid obsidian on top and bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080708] via-black/50 to-[#080708] z-10" />
          <div className="absolute inset-0 bg-radial-vignette mix-blend-multiply z-10" />
        </div>

        {/* Centered Content Container */}
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center z-20 space-y-10">
          <span 
            className="text-[10px] font-mono text-veltora-gold tracking-[0.3em] uppercase block transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, brandStoryProgress * 1.5),
              transform: `translateY(${(1 - brandStoryProgress) * -15}px)`
            }}
          >
            THE PHILOSOPHY
          </span>

          <h2 
            className="text-4xl sm:text-5xl md:text-6xl font-display text-veltora-cream tracking-wide leading-tight transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, brandStoryProgress * 1.5),
              transform: `translateX(${(1 - brandStoryProgress) * -60}px)`
            }}
          >
            We do not make watches. We engineer the measure of human ambition.
          </h2>

          <p 
            className="text-veltora-steel font-body text-base sm:text-lg md:text-xl leading-relaxed font-light max-w-2xl mx-auto transition-all duration-700 ease-out"
            style={{
              opacity: Math.max(0, (brandStoryProgress - 0.1) / 0.9),
              transform: `translateY(${(1 - brandStoryProgress) * 20}px)`
            }}
          >
            Each VELTORA movement is assembled by a single master, over three hundred hours, with instruments finer than a surgeon&apos;s and patience older than industry.
          </p>

          {/* Stats row */}
          <div 
            className="grid grid-cols-3 gap-6 border-t border-veltora-gold/15 pt-8 max-w-lg mx-auto transition-all duration-700 ease-out"
            style={{
              opacity: Math.max(0, (brandStoryProgress - 0.2) / 0.8),
              transform: `translateY(${(1 - brandStoryProgress) * 25}px)`
            }}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-veltora-gold">300 Hrs</div>
              <div className="text-[9px] font-mono text-veltora-steel uppercase tracking-wider mt-1">Atelier Build Time</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-veltora-gold">47 Parts</div>
              <div className="text-[9px] font-mono text-veltora-steel uppercase tracking-wider mt-1">Escapement Pieces</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-veltora-gold">Est. 1923</div>
              <div className="text-[9px] font-mono text-veltora-steel uppercase tracking-wider mt-1">Geneva Founding</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03 — CRAFTSMANSHIP REVEAL */}
      <section id="craftsmanship" ref={craftsmanshipRef} className="relative w-full h-[500vh] bg-black">
        {/* Sticky viewport */}
        <div className="sticky top-0 w-full h-screen flex flex-col justify-between overflow-hidden py-24 bg-black">
          {/* Ambient background gold glow to simulate lens flare */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(207,162,64,0.035)_0%,transparent_60%)] pointer-events-none z-0" />
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-10">
            <span className="text-[10px] font-mono text-veltora-gold tracking-widest uppercase">
              CLOSE FOCUS DETAIL
            </span>
            <h3 className="text-3xl font-display text-veltora-cream tracking-wide uppercase mt-1">
              Craftsmanship Reveal
            </h3>
          </div>

          {/* Realistic Watch Exploded View Animation based on scroll */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] flex items-center justify-center">
              
              {/* Layer 1: Top Strap */}
              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateY(calc(-130px - ${craftScrollProgress * 50}px)) translateX(${-craftScrollProgress * 30}px) rotate(${-craftScrollProgress * 5}deg) scale(0.32)`
                }}
              >
                <Image 
                  src="/assets/watch_strap_top.png" 
                  alt="Top Strap" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

              {/* Layer 2: Bottom Strap */}
              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateY(calc(130px + ${craftScrollProgress * 50}px)) translateX(${craftScrollProgress * 30}px) rotate(${craftScrollProgress * 5}deg) scale(0.32)`
                }}
              >
                <Image 
                  src="/assets/watch_strap_bottom.png" 
                  alt="Bottom Strap" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

              {/* Layer 3: Movement (reveals underneath dial) */}
              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateY(${craftScrollProgress * 50}px) translateX(${-craftScrollProgress * 50}px) rotate(${craftScrollProgress * 6}deg) scale(${0.44 - craftScrollProgress * 0.03})`,
                  opacity: craftScrollProgress > 0.02 ? 1 : 0
                }}
              >
                <Image 
                  src="/assets/watch_movement_layer.png" 
                  alt="Watch Caliber Movement" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

              {/* Layer 4: Titanium Case */}
              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateY(${craftScrollProgress * 20}px) translateX(${-craftScrollProgress * 20}px) rotate(${-craftScrollProgress * 3}deg) scale(0.5)`
                }}
              >
                <Image 
                  src="/assets/watch_case_layer.png" 
                  alt="Titanium Case" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

              {/* Layer 5: Dial Face */}
              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateY(${-craftScrollProgress * 50}px) translateX(${craftScrollProgress * 50}px) rotate(${-craftScrollProgress * 5}deg) scale(${0.44 + craftScrollProgress * 0.03})`
                }}
              >
                <Image 
                  src="/assets/watch_dial_layer.png" 
                  alt="Watch Dial" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

              {/* Layer 6: Sapphire Crystal Glass */}
              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateY(${-craftScrollProgress * 110}px) translateX(${craftScrollProgress * 110}px) rotate(${craftScrollProgress * 10}deg) scale(${0.45 + craftScrollProgress * 0.08})`
                }}
              >
                <Image 
                  src="/assets/watch_crystal_layer.png" 
                  alt="Sapphire Crystal" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

              {/* Unified Complete Watch Overlay (Fades out immediately on scroll to show layers) */}
              <div 
                className="absolute inset-0 transition-opacity duration-300 ease-out"
                style={{
                  opacity: craftScrollProgress < 0.03 ? 1 : 0,
                  pointerEvents: 'none',
                  transform: 'scale(0.5)'
                }}
              >
                <Image 
                  src="/assets/watch_complete.png" 
                  alt="VELTORA Luxury Timepiece" 
                  fill 
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>

            </div>
          </div>

          {/* Material panels sliding in from right */}
          <div className="absolute right-6 sm:right-12 top-1/2 transform -translate-y-1/2 w-80 h-[240px] md:h-auto space-y-4 z-20 pointer-events-auto">
            {(() => {
              const panelsList = [
                { id: 'crystal', label: 'Sapphire Crystal', img: '/assets/img2.png', activePct: 0.08 },
                { id: 'dial', label: 'Guilloche Dial', img: '/assets/macro_dial.png', activePct: 0.22 },
                { id: 'case', label: 'Titanium Case', img: '/assets/img1.png', activePct: 0.38 },
                { id: 'markers', label: 'Blued Steel Markers', img: '/assets/img4.png', activePct: 0.54 }
              ];

              // Find active index for mobile layout (only latest active card is visible)
              let activeIdxMobile = -1;
              for (let i = 0; i < panelsList.length; i++) {
                if (craftScrollProgress >= panelsList[i].activePct) {
                  activeIdxMobile = i;
                }
              }

              return panelsList.map((panel, idx) => {
                const desktopVisible = craftScrollProgress >= panel.activePct;
                const mobileVisible = activeIdxMobile === idx;

                return (
                  <div 
                    key={panel.id}
                    className={`transition-all duration-300 transform p-4 rounded-xl flex items-center gap-4 border-none bg-[#120e09]/30 backdrop-blur-[3px] md:glass-panel md:bg-[#120e09]/90 md:border-none md:backdrop-blur-md absolute bottom-0 right-0 w-full md:relative md:bottom-auto md:right-auto md:w-auto ${
                      mobileVisible 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-[150%] opacity-0 pointer-events-none'
                    } ${
                      desktopVisible 
                        ? 'md:translate-x-0 md:opacity-100 md:pointer-events-auto' 
                        : 'md:translate-x-[150%] md:opacity-0 md:pointer-events-none'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-veltora-gold/25 relative flex-shrink-0 opacity-100">
                      <Image src={panel.img} alt={panel.label} fill className="object-cover" />
                    </div>
                    <div className="opacity-100">
                      <span className="text-[8px] font-mono text-veltora-gold tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        DETAIL 0{idx + 1}
                      </span>
                      <h4 className="text-sm font-display text-white uppercase tracking-wide font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {panel.label}
                      </h4>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Bottom horizontal scroll indicator */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full flex items-center justify-between z-20">
            <span className="text-[9px] font-mono text-veltora-steel uppercase">
              Scroll to deconstruct watch
            </span>
            <div className="w-32 h-[2px] bg-veltora-charcoal relative">
              <div 
                className="absolute top-0 left-0 h-full bg-veltora-gold transition-all duration-100"
                style={{ width: `${craftScrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 04 — INTERNAL MECHANISM: THE MOVEMENT */}
      <section id="movement" ref={mechanismRef} className="relative w-full h-[200vh] bg-veltora-obsidian">
        {/* Ambient background gold glow to simulate lens flare */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(207,162,64,0.035)_0%,transparent_65%)] pointer-events-none z-0" />
        
        {/* Dynamic style block for Caliber card transitions */}
        <style dangerouslySetInnerHTML={{ __html: `
          .mechanism-detail-card-container {
            position: relative;
            height: 250px;
            width: 100%;
            overflow: visible;
          }
          .mechanism-detail-card {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 170px;
            background: rgba(22, 19, 15, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(184, 161, 106, 0.2);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          @media (min-width: 640px) {
            .mechanism-detail-card {
              height: 220px;
              padding: 24px;
            }
          }
          .mech-hidden {
            opacity: 0;
            transform: translate3d(240px, 120px, 0) scale(0.92);
            pointer-events: none;
          }
          .mech-exiting {
            opacity: 0;
            transform: translate3d(0, -90px, 0) scale(0.92);
            pointer-events: none;
            transition: opacity 0.28s cubic-bezier(0.4, 0, 1, 1), transform 0.28s cubic-bezier(0.4, 0, 1, 1);
          }
          .mech-active {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            pointer-events: auto;
            transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.18s, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.18s;
          }
          .card-flipper {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            transform-style: preserve-3d;
          }
          .card-flipper.is-flipped {
            transform: rotateY(180deg);
          }
          .card-face {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 170px;
            backface-visibility: hidden;
            border-radius: 16px;
            padding: 16px;
            background: rgba(22, 19, 15, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(184, 161, 106, 0.2);
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          @media (min-width: 640px) {
            .card-face {
              height: 220px;
              padding: 24px;
            }
          }
          .card-face-front {
            transform: rotateY(0deg);
          }
          .card-face-back {
            transform: rotateY(180deg);
          }
        `}} />

        {/* Sticky viewport container */}
        <div className="sticky top-0 w-full h-screen flex flex-col justify-center overflow-hidden py-12 sm:py-16 bg-veltora-obsidian">
          
          {/* Centered Heading */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full text-center mb-6 sm:mb-8 z-20">
            <span className="text-[11px] font-mono text-veltora-gold tracking-[0.3em] uppercase block">
              THE ENGINE
            </span>
            <h3 className="text-4xl font-display text-veltora-cream tracking-wide uppercase mt-1">
              VELTORA Caliber V-9
            </h3>
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-10 gap-12 items-center z-10">
            {/* Left Masterpiece Caliber View */}
            <div className="lg:col-span-6 h-[45vh] lg:h-[65vh] relative flex items-center justify-center overflow-hidden pointer-events-none">
              
              {/* Giant Retrograde Caliber Gauge in the background */}
              <div className="absolute inset-0 flex items-center justify-center z-0 opacity-25">
                <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] flex items-center justify-center select-none">
                  {/* SVG arc */}
                  <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                    <defs>
                      <radialGradient id="sunburst-ray-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                        <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.04" />
                        <stop offset="90%" stopColor="#D4AF37" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.45" />
                      </radialGradient>
                    </defs>

                    {/* Volumetric sun ray shadow glow wedge */}
                    <path
                      d={wedgePath}
                      fill="url(#sunburst-ray-glow)"
                      style={{
                        filter: 'blur(10px)',
                        opacity: mechanismExplosion > 0.01 ? 0.85 : 0,
                        transition: 'opacity 0.25s ease-out'
                      }}
                    />

                    {/* Faint background arc */}
                    <path
                      d="M 20 80 A 42 42 0 1 1 80 80"
                      fill="none"
                      stroke="rgba(184, 161, 106, 0.2)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* Glowing drop shadow outline behind active progress arc */}
                    <path
                      d="M 20 80 A 42 42 0 1 1 80 80"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="180"
                      style={{
                        strokeDashoffset: 180 - 180 * mechanismExplosion,
                        filter: 'blur(6px)',
                        opacity: 0.45,
                        transition: 'stroke-dashoffset 0.15s ease-out'
                      }}
                    />

                    {/* Active progress arc */}
                    <path
                      d="M 20 80 A 42 42 0 1 1 80 80"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeDasharray="180"
                      style={{
                        strokeDashoffset: 180 - 180 * mechanismExplosion,
                        filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.6))',
                        transition: 'stroke-dashoffset 0.15s ease-out'
                      }}
                    />
                  </svg>

                  {/* Rotational retrograde pointer hand */}
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div 
                      className="bg-gradient-to-t from-transparent via-veltora-gold/40 to-veltora-gold rounded-full origin-bottom transition-transform duration-100 ease-out"
                      style={{
                        transform: `rotate(${-120 + mechanismExplosion * 240}deg) translateY(-80px)`,
                        height: '140px',
                        width: '2px',
                        boxShadow: '0 0 12px rgba(212, 175, 55, 0.8)'
                      }}
                    />
                    {/* Center axis pin */}
                    <div className="absolute w-5 h-5 rounded-full bg-veltora-obsidian border-2 border-veltora-gold shadow-[0_0_8px_rgba(212, 175, 55, 0.6)] z-20" />
                  </div>

                  {/* Tick numbers positioned around the circular arc */}
                  {[
                    { val: '01', style: { bottom: '15%', left: '16%' } },
                    { val: '02', style: { top: '35%', left: '10%' } },
                    { val: '03', style: { top: '10%', left: '50%', transform: 'translateX(-50%)' } },
                    { val: '04', style: { top: '35%', right: '10%' } },
                    { val: '05', style: { bottom: '15%', right: '16%' } }
                  ].map((tick, idx) => {
                    const isActive = currentDetailIdx === idx;
                    return (
                      <span 
                        key={idx}
                        className={`absolute font-mono text-[9px] sm:text-xs font-bold transition-all duration-300 ${
                          isActive ? 'text-veltora-gold scale-125' : 'text-veltora-steel/30'
                        }`}
                        style={{ ...tick.style, textShadow: isActive ? '0 0 8px rgba(212,175,55,0.7)' : undefined }}
                      >
                        {tick.val}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Spinning Caliber Tourbillon (Centered in front of the gauge) */}
              <div 
                className="relative w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] flex items-center justify-center transition-transform duration-75 ease-out z-10"
                style={{
                  transform: `rotate(${mechanismExplosion * 360}deg) scale(${0.85 + mechanismExplosion * 0.15})`
                }}
              >
                <div 
                  className="relative w-full h-full"
                  style={{
                    animation: `sweepSecond ${40 - (escapementVph - 18000) * 0.0015}s linear infinite`
                  }}
                >
                  <Image 
                    src="/assets/veltora_caliber_v9_transparent.png" 
                    alt="VELTORA Caliber V-9 Tourbillon" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Specs panel */}
            <div className="lg:col-span-4 flex flex-col justify-between h-[380px]">
              {/* Static buttons on top right, always visible */}
              <div className="space-y-2.5 border-b border-veltora-gold/15 pb-4 mb-4">
                <span className="block text-[10px] font-mono text-veltora-steel tracking-[0.2em] uppercase font-bold">
                  CALIBER SPEED REGULATOR (VPH)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[18000, 21600, 28800, 36000].map((vph) => {
                    const isActive = escapementVph === vph;
                    const labels = {
                      18000: '18k VPH',
                      21600: '21.6k VPH',
                      28800: '28.8k VPH',
                      36000: '36k VPH'
                    };
                    return (
                      <button
                        key={vph}
                        onClick={() => {
                          audioController.playClasp();
                          audioController.startMetronome(vph / 3600);
                          
                          // 180 degree double-sided card flip logic
                          if (activeCardSide === 'front') {
                            setBackVph(vph);
                            setActiveCardSide('back');
                          } else {
                            setFrontVph(vph);
                            setActiveCardSide('front');
                          }
                          setEscapementVph(vph);
                          
                          if (mechanismRef.current) {
                            mechanismRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={`py-2 px-1 rounded font-mono text-[8px] sm:text-[9px] font-bold border text-center transition-all ${
                          isActive
                            ? 'bg-veltora-gold text-veltora-obsidian border-veltora-gold shadow-[0_0_8px_rgba(207,162,64,0.3)]'
                            : 'bg-veltora-obsidian text-veltora-cream border-veltora-gold/15 hover:border-veltora-gold/45'
                        }`}
                      >
                        {labels[vph as keyof typeof labels]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details Stack Container (full width) */}
              <div className="relative h-[250px] w-full overflow-visible">
                {(() => {
                  const detailsData = [
                    {
                      label: 'Oscillation Frequency',
                      val: `${(escapementVph / 7200).toFixed(1)} Hz / ${escapementVph.toLocaleString()} VPH`,
                      desc: 'The beat rate determines hand sweep smoothness and kinetic stability. Regulate the oscillation speed above.'
                    },
                    {
                      label: 'Caliber Autonomy',
                      val: '72 Hours Power Reserve',
                      desc: 'Dual-barrel mainspring system provides constant power flow over 3 full days of chronometric autonomy.'
                    },
                    {
                      label: 'Atelier Architecture',
                      val: '287 Mechanical Components',
                      desc: 'Individually hand-filed, finished and assembled Swiss caliber gears with Côte de Genève bevelling.'
                    },
                    {
                      label: 'Masterpiece Finishing',
                      val: 'Anglage & Bevelled Bridges',
                      desc: 'Bridges and plates feature manually beveled edges, contrasting mirror-polishes, and satin circular-grain wheels.'
                    },
                    {
                      label: 'Caliber Jewels',
                      val: '35 Synthetic Rubies',
                      desc: 'Synthetic ruby jewel bearings located at pivot points to minimize mechanical friction and energy loss.'
                    }
                  ];

                  return detailsData.map((detail, idx) => {
                    let cardState = 'mech-hidden';
                    if (idx === currentDetailIdx) {
                      cardState = 'mech-active';
                    } else if (idx === exitingDetailIdx) {
                      cardState = 'mech-exiting';
                    }

                    if (idx === 0) {
                      const isFlipped = activeCardSide === 'back';
                      return (
                        <div 
                          key={idx} 
                          className={`mechanism-detail-card ${cardState}`}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            padding: 0, 
                            boxShadow: 'none',
                            perspective: '1000px'
                          }}
                        >
                          <div className={`card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                            {/* Front Face */}
                            <div className="card-face card-face-front">
                              <span className="text-[9px] sm:text-[10px] font-mono text-veltora-gold tracking-[0.2em] uppercase font-bold">
                                SPECIFICATION 01 OF 05
                              </span>
                              <h4 className="text-lg sm:text-2xl font-display text-veltora-cream uppercase mt-1.5 sm:mt-2.5 tracking-wide">
                                Oscillation Frequency
                              </h4>
                              <p className="text-xs sm:text-sm font-mono text-veltora-gold-light mt-1 font-semibold leading-relaxed">
                                {(frontVph / 7200).toFixed(1)} Hz / {frontVph.toLocaleString()} VPH
                              </p>
                              <p className="text-[10px] sm:text-xs text-veltora-steel font-mono mt-1.5 sm:mt-3 leading-relaxed">
                                {detail.desc}
                              </p>
                            </div>
                            {/* Back Face */}
                            <div className="card-face card-face-back">
                              <span className="text-[9px] sm:text-[10px] font-mono text-veltora-gold tracking-[0.2em] uppercase font-bold">
                                SPECIFICATION 01 OF 05
                              </span>
                              <h4 className="text-lg sm:text-2xl font-display text-veltora-cream uppercase mt-1.5 sm:mt-2.5 tracking-wide">
                                Oscillation Frequency
                              </h4>
                              <p className="text-xs sm:text-sm font-mono text-veltora-gold-light mt-1 font-semibold leading-relaxed">
                                {(backVph / 7200).toFixed(1)} Hz / {backVph.toLocaleString()} VPH
                              </p>
                              <p className="text-[10px] sm:text-xs text-veltora-steel font-mono mt-1.5 sm:mt-3 leading-relaxed">
                                {detail.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`mechanism-detail-card ${cardState}`}>
                        <span className="text-[9px] sm:text-[10px] font-mono text-veltora-gold tracking-[0.2em] uppercase font-bold">
                          SPECIFICATION 0{idx + 1} OF 05
                        </span>
                        <h4 className="text-lg sm:text-2xl font-display text-veltora-cream uppercase mt-1.5 sm:mt-2.5 tracking-wide">
                          {detail.label}
                        </h4>
                        <p className="text-xs sm:text-sm font-mono text-veltora-gold-light mt-1 font-semibold leading-relaxed">
                          {detail.val}
                        </p>
                        <p className="text-[10px] sm:text-xs text-veltora-steel font-mono mt-1.5 sm:mt-3 leading-relaxed">
                          {detail.desc}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05 — COLLECTIONS SHOWCASE */}
      <section 
        id="collections" 
        ref={collectionsRef} 
        className="relative w-full bg-black"
        style={{ height: collectionsSectionHeight > 0 ? `${collectionsSectionHeight}px` : '250vh' }}
      >
        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-[#080708]">
          {/* Ambient background gold glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(207,162,64,0.02)_0%,transparent_75%)] pointer-events-none z-0" />
          
          <div className="w-full">
            <div 
              ref={collectionsTrackRef}
              style={{
                transform: `translateX(-${collectionsScrollProgress * collectionsTrackWidth}px)`,
                paddingLeft: "calc((100vw - 1280px) / 2 + 48px)"
              }}
              className="flex items-center gap-12 select-none w-max will-change-transform pr-[20vw] z-10 relative"
            >
              {/* Header column (stays on left of the track) */}
              <div className="w-[360px] flex-shrink-0 flex flex-col space-y-6 pr-6">
                <span className="text-[10px] font-mono text-veltora-gold tracking-[0.3em] uppercase">
                  THE GALLERY
                </span>
                <h3 className="text-5xl font-display text-veltora-cream uppercase tracking-wide leading-[1.1]">
                  Watch Collections
                </h3>
                <p className="text-veltora-steel text-sm leading-relaxed font-light">
                  Each timepiece represents a tier of our craftsmanship. Scroll through our curated collections to view options and specifications.
                </p>

                {/* Filter pills inside the header column */}
                <div className="flex flex-wrap gap-2 text-xs font-mono pt-4">
                  {['ALL', 'TOURBILLON', 'PERPETUAL', 'DIVER', 'LIMITED'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => filterProducts(tier)}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        activeFilter === tier
                          ? 'border-veltora-gold bg-veltora-gold text-veltora-obsidian font-bold'
                          : 'border-veltora-gold/20 text-veltora-steel hover:text-veltora-cream hover:border-veltora-gold/35'
                      }`}
                      onPointerOver={() => { setCursorState('hover-cta'); setCursorText('FILTER'); }}
                      onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards horizontal loop */}
              {loadingProducts ? (
                <div className="flex gap-8">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-[350px] h-[480px] rounded-2xl bg-veltora-charcoal/50 animate-pulse border border-veltora-gold/15 flex-shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-8">
                  {filteredProducts.map((product) => {
                    const isCardFlipped = flippedProductId === product.id;
                    return (
                      <div
                        key={product.id}
                        className="w-[350px] h-[500px] flex-shrink-0 group perspective-1000 cursor-pointer"
                        onPointerOver={() => { 
                          if (!isMobile) {
                            setCursorState('hover-card'); 
                            setCursorText('FLIP'); 
                            setFlippedProductId(product.id);
                          }
                        }}
                        onPointerOut={() => { 
                          if (!isMobile) {
                            setCursorState('default'); 
                            setCursorText(''); 
                            setFlippedProductId(null);
                          }
                        }}
                        onClick={() => {
                          audioController.playClick();
                          setFlippedProductId(prev => prev === product.id ? null : product.id);
                        }}
                      >
                        <div 
                          className="relative w-full h-full preserve-3d"
                          style={{
                            transform: isMobile 
                              ? 'none' 
                              : (isCardFlipped ? 'rotateY(180deg) scale(0.96)' : 'rotateY(0deg) scale(1)'),
                            transition: isMobile ? 'none' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          
                          {/* FRONT SIDE (Watch Card with Title floating on bottom-left) */}
                          <div 
                            className={`absolute inset-0 backface-hidden w-full h-full rounded-2xl overflow-hidden border border-[#8f6820]/35 flex flex-col transition-all duration-300 ${isCardFlipped ? 'z-0' : 'z-10'}`}
                            style={isMobile ? {
                              opacity: isCardFlipped ? 0 : 1,
                              transform: isCardFlipped ? 'scale(0.93)' : 'scale(1)',
                              transition: 'opacity 0.5s ease-in-out, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                              pointerEvents: isCardFlipped ? 'none' : 'auto'
                            } : undefined}
                          >
                            {/* Full card Image */}
                            <div className="absolute inset-0 w-full h-full bg-[#0b0b0c] overflow-hidden">
                              <Image 
                                src={product.image}
                                alt={product.modelName}
                                fill
                                className="object-cover"
                              />
                              {/* Dark gradient overlay for text readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />
                            </div>

                            {/* Floating Badge (top-left) */}
                            <span className="absolute top-4 left-4 z-20 bg-veltora-obsidian/75 border border-[#8f6820]/45 rounded-full px-3 py-1 text-[8px] font-mono text-veltora-gold uppercase tracking-wider">
                              {product.tier}
                            </span>

                            {/* Details - Floating bottom-left */}
                            <div className="absolute bottom-6 left-6 right-6 z-20 space-y-1">
                              <span className="text-[9px] font-mono text-veltora-gold/80 tracking-wider uppercase font-semibold">
                                {product.tier}
                              </span>
                              <h4 className="text-2xl font-display text-veltora-cream uppercase tracking-wider font-bold">
                                {product.modelName}
                              </h4>
                            </div>
                          </div>

                          {/* BACK SIDE (Flipped, Dark Golden Background) */}
                          <div 
                            className={`absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-2xl overflow-hidden bg-[#1c1305]/95 border border-[#8f6820]/45 flex flex-col justify-between p-8 shadow-2xl transition-all duration-300 ${isCardFlipped ? 'z-20' : 'z-0'}`}
                            style={isMobile ? {
                              transform: isCardFlipped ? 'rotateY(0deg) scale(1)' : 'rotateY(0deg) scale(0.93)',
                              opacity: isCardFlipped ? 1 : 0,
                              transition: 'opacity 0.5s ease-in-out, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                              pointerEvents: isCardFlipped ? 'auto' : 'none'
                            } : undefined}
                          >
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <span className="text-[9px] font-mono text-veltora-gold tracking-widest uppercase block">
                                {product.tier} EDITION
                              </span>
                              <div className="flex justify-between items-baseline border-b border-[#8f6820]/30 pb-3">
                                <h4 className="text-2xl font-display text-veltora-cream uppercase tracking-wide">
                                  {product.modelName}
                                </h4>
                                <span className="text-sm font-mono text-veltora-gold-light font-bold">
                                  CHF {product.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-[10px] font-mono text-veltora-steel uppercase tracking-widest">
                                {product.tagline}
                              </p>
                              <p className="text-xs text-veltora-cream/80 leading-relaxed font-light line-clamp-6">
                                {product.description}
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleConfigureModel(product)}
                            className="w-full border border-veltora-gold/40 hover:border-veltora-gold-light bg-veltora-gold text-veltora-obsidian font-mono uppercase font-bold py-3 rounded-xl transition-all text-xs tracking-widest hover:bg-veltora-gold-light hover:shadow-[0_0_15px_rgba(243,229,171,0.2)] flex items-center justify-center gap-2 mt-4"
                          >
                            <span>Configure Timepiece</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06 — CUSTOMIZER: CONFIGURE YOURS */}
      <section id="customizer" ref={customizerRef} className="relative w-full h-[350vh] bg-veltora-obsidian">
        {/* Scroll anchor target */}
        <div id="customizer-section" className="absolute top-0 left-0" />

        {/* Sticky viewport wrapper */}
        <div className="sticky top-0 w-full h-screen flex flex-col justify-center overflow-hidden py-10">
          {/* Section Header moved up */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full mb-6 z-20">
            <span className="text-[11px] font-mono text-veltora-gold tracking-[0.3em] uppercase block">
              VELTORA BESPOKE PROGRAMME
            </span>
            <h3 className="text-4xl font-display text-veltora-cream tracking-wide uppercase mt-1">
              Configure Your Timepiece: <span className="text-veltora-gold font-bold">{activeModel}</span>
            </h3>
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
            {/* Left Three.js Live watch canvas */}
            <div className="lg:col-span-7 h-[45vh] lg:h-[65vh] relative flex items-center justify-center overflow-hidden">
              <WatchCanvas />
              
              {/* Customizer Hint Overlay */}
              <div className="absolute top-4 left-4 bg-veltora-charcoal/85 rounded px-3 py-1 text-[8px] font-mono text-veltora-gold uppercase tracking-widest">
                Live PBR 3D Render
              </div>
            </div>

            {/* Right Configuration parameters control */}
            <div className="lg:col-span-5 relative">
              <CustomizerPanel scrollProgress={customizerScrollProgress} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 07 — HERITAGE & NUMBERS */}
      <section id="heritage" ref={heritageRef} className="relative w-full h-[500vh] bg-black">
        {/* Pinned scrubber timeline */}
        <div className="sticky top-0 w-full h-screen flex flex-col justify-between py-16 sm:py-20 overflow-hidden bg-[#080708]">
          
          {/* Background Image Slideshow with Cross-Fade */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {[1923, 1961, 1984, 2024].map((year) => {
              const isActive = activeHeritageYear === year;
              return (
                <div
                  key={year}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-60' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={heritageImages[year as keyof typeof heritageImages]}
                    alt={`Veltora Year ${year}`}
                    fill
                    className="object-cover scale-105"
                    priority={year === 1923}
                  />
                </div>
              );
            })}
            {/* Dark overlay gradients to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#080708] via-black/25 to-[#080708] z-10" />
            <div className="absolute inset-0 bg-black/35 z-10" />
          </div>

          {/* Section Header */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-20">
            <span className="text-[10px] font-mono text-veltora-gold tracking-[0.3em] uppercase">
              OUR JOURNEY
            </span>
            <h3 className="text-4xl font-display text-veltora-cream tracking-wide uppercase mt-1">
              Heritage & Century
            </h3>
          </div>

          {/* Timeline Center Content (Classy Overlay) */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-20">
            
            {/* Left Side: Timeline Scrubber */}
            <div className="lg:col-span-4 space-y-8">
              {/* Sliding big outline year */}
              <div className="relative h-20 overflow-hidden select-none pointer-events-none">
                <div 
                  className="font-display text-7xl sm:text-8xl font-bold text-transparent tracking-widest transition-all duration-500 ease-out"
                  style={{
                    WebkitTextStroke: '1.5px rgba(207, 162, 64, 0.15)',
                    transform: `translateX(${-20 + timelineProgress * 20}px)`,
                    opacity: 0.2 + timelineProgress * 0.8
                  }}
                >
                  {activeHeritageYear}
                </div>
              </div>

              <div className="relative border-l border-veltora-gold/20 pl-8 py-2 space-y-8">
                {/* Active Year indicator bar */}
                <div 
                  className="absolute left-[-1px] w-[3px] bg-veltora-gold transition-all duration-200 ease-out shadow-[0_0_8px_#cfa240]"
                  style={{
                    height: '24%',
                    transformOrigin: 'top',
                    transform: `scaleY(${0.3 + timelineProgress * 0.7})`,
                    top: activeHeritageYear === 1923 ? '2%' : 
                         activeHeritageYear === 1961 ? '26%' : 
                         activeHeritageYear === 1984 ? '51%' : '76%'
                  }}
                />
                
                {[1923, 1961, 1984, 2024].map((year, idx) => {
                  const isActive = activeHeritageYear === year;
                  return (
                    <div 
                      key={year}
                      className="relative cursor-pointer group py-1"
                      onClick={() => {
                        audioController.playClick();
                        scrollToHeritageStep(idx);
                      }}
                      onPointerOver={() => { setCursorState('hover-cta'); setCursorText(String(year)); }}
                      onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
                    >
                      {/* Scrubber node bullet */}
                      <div 
                        className={`absolute -left-[37px] top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border transition-all duration-300 ${
                          isActive 
                            ? 'bg-veltora-gold border-veltora-gold-light scale-125 shadow-[0_0_10px_#cfa240]' 
                            : 'bg-veltora-charcoal border-veltora-gold/25 group-hover:border-veltora-gold'
                        }`}
                      />
                      <div className="flex items-baseline gap-4">
                        <span className={`text-4xl sm:text-5xl font-display font-light transition-all duration-500 ${
                          isActive ? 'text-veltora-gold scale-105 translate-x-2' : 'text-veltora-steel/30'
                        }`}>
                          {year}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono text-veltora-gold-light tracking-widest uppercase animate-fade-in">
                            {year === 1923 ? 'FOUNDING' : year === 1961 ? 'PRECISION' : year === 1984 ? 'INNOVATION' : 'MASTERPIECE'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Scroll Stat Counters */}
              <div className="grid grid-cols-2 gap-8 border-t border-veltora-gold/15 pt-8">
                <div>
                  <div className="text-4xl sm:text-5xl font-display font-semibold text-veltora-gold">
                    {countStats.hours}+
                  </div>
                  <div className="text-[10px] font-mono text-veltora-steel uppercase tracking-widest mt-1">Hours Craftwork</div>
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-display font-semibold text-veltora-gold">
                    {countStats.components}
                  </div>
                  <div className="text-[10px] font-mono text-veltora-steel uppercase tracking-widest mt-1">Components</div>
                </div>
              </div>
            </div>

            {/* Center Column: Floating Info Card with word-by-word reveal */}
            <div className="lg:col-span-7">
              {(() => {
                const era = heritageEras.find(e => e.year === activeHeritageYear) || heritageEras[0];
                return (
                  <div 
                    key={activeHeritageYear} 
                    className="glass-panel p-8 sm:p-10 rounded-2xl border border-veltora-gold/20 bg-[#1c1305]/85 backdrop-blur-md shadow-2xl space-y-6 animate-scale-up transition-all duration-500 hover:border-veltora-gold/40 hover:shadow-[0_0_30px_rgba(207,162,64,0.1)]"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-veltora-gold tracking-widest uppercase">
                        HISTORICAL ARCHIVE · ERA {activeHeritageYear}
                      </span>
                      <h4 className="text-3xl font-display text-veltora-cream uppercase tracking-wider">
                        {era.title}
                      </h4>
                    </div>

                    <p className="text-veltora-steel text-sm sm:text-base leading-relaxed font-light font-body min-h-[96px]">
                      {era.desc.split(" ").map((word, idx) => {
                        return (
                          <span
                            key={idx}
                            className="inline-block mr-[0.28em] animate-reveal-word"
                            style={{
                              animationDelay: `${idx * 25}ms`,
                              animationDuration: '400ms',
                              animationFillMode: 'both'
                            }}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </p>

                    {/* Era Specific Stats */}
                    <div 
                      className="grid grid-cols-2 gap-6 pt-4 border-t border-veltora-gold/10 animate-fade-in"
                      style={{
                        animationDelay: '600ms',
                        animationDuration: '500ms',
                        animationFillMode: 'both'
                      }}
                    >
                      <div>
                        <span className="block text-[9px] font-mono text-veltora-steel uppercase tracking-wider font-semibold">
                          {era.statLabel1}
                        </span>
                        <span className="text-base font-display text-veltora-cream uppercase font-semibold">
                          {era.statVal1}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-veltora-steel uppercase tracking-wider font-semibold">
                          {era.statLabel2}
                        </span>
                        <span className="text-base font-display text-veltora-cream uppercase font-semibold">
                          {era.statVal2}
                        </span>
                      </div>
                    </div>

                    {/* Embedded Testimonials Slider */}
                    <div className="pt-6 border-t border-veltora-gold/10 relative">
                      <span className="text-[8px] font-mono text-veltora-gold/50 tracking-widest uppercase block mb-2">
                        REGISTRY TESTIMONY
                      </span>
                      <p className="text-veltora-cream/90 italic text-xs leading-relaxed font-body">
                        &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                      </p>
                      <div className="flex justify-between items-center mt-3 text-[10px] font-mono">
                        <span className="text-veltora-gold uppercase tracking-wider">
                          {testimonials[activeTestimonial].name}
                        </span>
                        <span className="text-veltora-steel uppercase">
                          {testimonials[activeTestimonial].model}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>

            {/* Right Column: Watch Hand Sweep Gauge */}
            <div className="hidden lg:flex lg:col-span-1 justify-center items-center h-full">
              <svg width={50} height={320} viewBox="0 0 50 320" className="opacity-80">
                {/* Track line (dark gold/charcoal) */}
                <line
                  x1={25}
                  y1={10}
                  x2={25}
                  y2={300}
                  stroke="#1c1a16"
                  strokeWidth={1.5}
                />
                {/* Gold fill line */}
                <line
                  x1={25}
                  y1={10}
                  x2={25}
                  y2={10 + timelineProgress * 290}
                  stroke="url(#goldGradient)"
                  strokeWidth={2}
                />
                {/* Tip Group */}
                <g transform={`translate(0, ${timelineProgress * 290})`}>
                  <circle cx={25} cy={10} r={4.5} fill="#cfa240" className="shadow-lg" />
                  <polygon points="21,14 29,14 25,22" fill="#cfa240" />
                </g>
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cfa240" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#cfa240" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </svg>
            </div>

          </div>

          {/* Bottom scrub indicator */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full flex justify-between z-20">
            <span className="text-[9px] font-mono text-veltora-steel uppercase tracking-widest">
              Scroll down to travel through time
            </span>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeTestimonial === idx ? 'bg-veltora-gold w-3' : 'bg-veltora-charcoal'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 07.5 — REVIEWS FLOATING TIMELINE */}
      <section id="reviews" className="relative w-full min-h-screen py-24 bg-black flex flex-col justify-between overflow-hidden">
        {/* Background Image of Watch on Table */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/reviews_bg.png"
            alt="Classic watch on table"
            fill
            className="object-cover"
          />
          {/* Dark luxury overlay vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080708] via-black/60 to-[#080708] z-10" />
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full text-center z-20">
          <span className="text-[10px] font-mono text-veltora-gold tracking-[0.3em] uppercase">
            REGISTRY REVIEWS
          </span>
          <h3 className="text-4xl sm:text-5xl font-display text-veltora-cream tracking-wide uppercase mt-2">
            Owner Testimonies
          </h3>
        </div>

        {/* 3D Tilted Review Container Box */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full flex items-center justify-center py-6 z-20">
          <div 
            className="relative w-full max-w-5xl overflow-hidden glass-panel p-6 sm:p-10 rounded-[20px] border border-[#8f6820]/30 bg-[#1c1305]/80 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.65)] h-[480px] sm:h-[560px] animate-float-tilt text-left"
          >
            {/* Columns grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-hidden">
              
              {/* Column 1: Always visible */}
              <div className="flex flex-col overflow-hidden h-full relative group">
                <div className="flex flex-col gap-6 animate-marquee-vertical hover:[animation-play-state:paused] will-change-transform">
                  {[reviews[0], reviews[3], reviews[6], reviews[0], reviews[3], reviews[6]].map((review, i) => (
                    <div key={`col1-${i}`} className="shrink-0 w-full glass-panel p-6 rounded-xl border border-[#8f6820]/30 bg-[#141009]/90 shadow-sm flex flex-col justify-between h-auto transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-xs sm:text-sm italic font-display text-veltora-cream leading-relaxed mb-4">
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <div>
                        <span className="text-[10px] font-mono text-veltora-gold uppercase tracking-wider font-semibold block">{review.name}</span>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-0.5 text-veltora-gold">
                            {Array.from({ length: review.rating }).map((_, idx) => (
                              <Star key={idx} className="w-2.5 h-2.5 fill-veltora-gold text-veltora-gold" />
                            ))}
                          </div>
                          <span className="text-veltora-steel uppercase text-[8px] font-mono">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Visible on tablet/desktop */}
              <div className="hidden md:flex flex-col overflow-hidden h-full relative group">
                <div className="flex flex-col gap-6 animate-marquee-vertical-fast hover:[animation-play-state:paused] will-change-transform">
                  {[reviews[1], reviews[4], reviews[7], reviews[1], reviews[4], reviews[7]].map((review, i) => (
                    <div key={`col2-${i}`} className="shrink-0 w-full glass-panel p-6 rounded-xl border border-[#8f6820]/30 bg-[#141009]/90 shadow-sm flex flex-col justify-between h-auto transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-xs sm:text-sm italic font-display text-veltora-cream leading-relaxed mb-4">
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <div>
                        <span className="text-[10px] font-mono text-veltora-gold uppercase tracking-wider font-semibold block">{review.name}</span>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-0.5 text-veltora-gold">
                            {Array.from({ length: review.rating }).map((_, idx) => (
                              <Star key={idx} className="w-2.5 h-2.5 fill-veltora-gold text-veltora-gold" />
                            ))}
                          </div>
                          <span className="text-veltora-steel uppercase text-[8px] font-mono">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Visible only on desktop */}
              <div className="hidden lg:flex flex-col overflow-hidden h-full relative group">
                <div className="flex flex-col gap-6 animate-marquee-vertical-slow hover:[animation-play-state:paused] will-change-transform">
                  {[reviews[2], reviews[5], reviews[8], reviews[2], reviews[5], reviews[8]].map((review, i) => (
                    <div key={`col3-${i}`} className="shrink-0 w-full glass-panel p-6 rounded-xl border border-[#8f6820]/30 bg-[#141009]/90 shadow-sm flex flex-col justify-between h-auto transition-transform hover:-translate-y-1 duration-300">
                      <p className="text-xs sm:text-sm italic font-display text-veltora-cream leading-relaxed mb-4">
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <div>
                        <span className="text-[10px] font-mono text-veltora-gold uppercase tracking-wider font-semibold block">{review.name}</span>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-0.5 text-veltora-gold">
                            {Array.from({ length: review.rating }).map((_, idx) => (
                              <Star key={idx} className="w-2.5 h-2.5 fill-veltora-gold text-veltora-gold" />
                            ))}
                          </div>
                          <span className="text-veltora-steel uppercase text-[8px] font-mono">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom indicator text */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full flex justify-center z-20">
          <span className="text-[9px] font-mono text-veltora-steel uppercase tracking-widest animate-pulse">
            Hover column to pause scrolling
          </span>
        </div>
      </section>

      {/* SECTION 08 — GLOBAL CONCIERGE: LOCATION & DELIVERY */}
      <section id="showrooms" className="relative w-full h-[200vh] bg-veltora-obsidian">
        {/* Slow zoom-in/zoom-out background image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image 
            src="/assets/veltora_showroom_bg.png"
            alt="VELTORA Showroom Interior"
            fill
            className="object-cover opacity-25 scale-100 zoom-bg-animation"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-veltora-obsidian via-transparent to-black" />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {/* Global style block for background zoom animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes zoomInOutBg {
            0% { transform: scale(1.0); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1.0); }
          }
          .zoom-bg-animation {
            animation: zoomInOutBg 28s ease-in-out infinite;
          }
        `}} />

        {/* Sticky viewport container */}
        <div className="sticky top-0 w-full h-screen flex flex-col justify-center overflow-hidden py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-10 space-y-8">
            {/* Centered Heading */}
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-veltora-gold tracking-[0.3em] uppercase block font-bold">
                GLOBAL CONCIERGE
              </span>
              <h2 className="text-3xl sm:text-5xl font-display text-veltora-cream uppercase tracking-wide">
                Atelier Finder & Delivery
              </h2>
              <p className="text-veltora-steel text-xs font-mono max-w-xl mx-auto leading-relaxed">
                Find an authorized VELTORA showroom near you or calculate direct armored delivery transit coordinates to your doorstep.
              </p>
            </div>

            {/* Centered card-slider viewport */}
            <div className="relative w-full max-w-2xl mx-auto h-[460px] flex items-center justify-center overflow-visible">
              
              {/* CARD 1: SHOWROOM FINDER */}
              <div 
                className="absolute inset-0 glass-panel p-6 sm:p-8 rounded-2xl border border-veltora-gold/15 bg-[#120e09]/90 backdrop-blur-md flex flex-col justify-between transition-all duration-500 ease-out"
                style={{
                  opacity: conciergeProgress < 0.5 ? 1 : 0,
                  transform: `translate3d(0, ${conciergeProgress < 0.5 ? '0' : '-120px'}, 0) scale(${conciergeProgress < 0.5 ? '1' : '0.92'})`,
                  pointerEvents: conciergeProgress < 0.5 ? 'auto' : 'none',
                }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-veltora-gold/10 pb-3">
                    <MapPin className="w-5 h-5 text-veltora-gold" />
                    <h3 className="text-lg font-display text-veltora-cream uppercase tracking-wider font-bold">
                      Find Showrooms and Shops Near You to Experience Veltora
                    </h3>
                  </div>

                  <form onSubmit={handleShowroomSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={showroomSearch}
                        onChange={(e) => setShowroomSearch(e.target.value)}
                        placeholder="ENTER CITY OR SHOWROOM NAME..." 
                        className="w-full bg-[#181410] border border-veltora-gold/30 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-veltora-steel/70 focus:outline-none focus:border-veltora-gold focus:ring-1 focus:ring-veltora-gold font-mono font-bold"
                      />
                      <Search className="w-3.5 h-3.5 text-veltora-steel absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold px-5 rounded-lg text-xs tracking-wider transition-colors"
                    >
                      Search
                    </button>
                  </form>

                  {/* Showroom List container */}
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredShowrooms.length === 0 ? (
                      <div className="text-center py-8 text-xs font-mono text-veltora-steel">
                        No ateliers found matching your query.
                      </div>
                    ) : (
                      filteredShowrooms.map((showroom, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 rounded-lg border border-veltora-gold/5 bg-veltora-obsidian/40 hover:border-veltora-gold/25 transition-all text-left space-y-2"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-mono text-veltora-gold uppercase font-bold">
                              {showroom.city}
                            </h4>
                            <span className="text-[8px] font-mono text-veltora-steel bg-veltora-charcoal px-1.5 py-0.5 rounded">
                              ACTIVE SHOWROOM
                            </span>
                          </div>
                          <p className="text-[10px] text-veltora-cream/80 font-light font-mono leading-relaxed">
                            {showroom.address}
                          </p>
                          <div className="flex justify-between items-center text-[9px] font-mono text-veltora-steel pt-1 border-t border-veltora-gold/5">
                            <span>{showroom.hours}</span>
                            <span className="text-veltora-gold/70">{showroom.phone}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: DELIVERY AVAILABILITY */}
              <div 
                className="absolute inset-0 glass-panel p-6 sm:p-8 rounded-2xl border border-veltora-gold/15 bg-[#120e09]/90 backdrop-blur-md flex flex-col justify-between transition-all duration-500 ease-out"
                style={{
                  opacity: conciergeProgress >= 0.5 ? 1 : 0,
                  transform: `translate3d(0, ${conciergeProgress >= 0.5 ? '0' : '120px'}, 0) scale(${conciergeProgress >= 0.5 ? '1' : '0.92'})`,
                  pointerEvents: conciergeProgress >= 0.5 ? 'auto' : 'none',
                }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-veltora-gold/10 pb-3">
                    <Truck className="w-5 h-5 text-veltora-gold" />
                    <h3 className="text-lg font-display text-veltora-cream uppercase tracking-wider font-bold font-semibold">
                      Direct Delivery Checker
                    </h3>
                  </div>

                  <p className="text-[11px] font-mono text-veltora-steel leading-relaxed">
                    Due to the handcrafted assembly and high value of VELTORA timepieces, direct shipping is regulated via insured armored carriers (Ferrari Group or Malca-Amit). Enter your zip code or country below to verify coverage.
                  </p>

                  <form onSubmit={handleCheckDelivery} className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={deliveryZip}
                      onChange={(e) => setDeliveryZip(e.target.value)}
                      placeholder="ENTER POSTAL CODE OR COUNTRY..." 
                      className="flex-1 bg-[#181410] border border-veltora-gold/30 rounded-lg px-4 py-2.5 text-xs text-white placeholder-veltora-steel/70 focus:outline-none focus:border-veltora-gold focus:ring-1 focus:ring-veltora-gold font-mono font-bold"
                    />
                    <button 
                      type="submit" 
                      className="bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold px-5 rounded-lg text-xs tracking-wider transition-colors"
                    >
                      Check
                    </button>
                  </form>

                  {/* Delivery Checker response output */}
                  {deliveryResult && (
                    <div className="p-4 rounded-xl border border-veltora-gold/20 bg-veltora-gold/5 space-y-3.5 text-left animate-fade-in">
                      <div className="flex items-center gap-2 text-veltora-gold">
                        <ShieldCheck className="w-4 h-4 text-veltora-gold" />
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                          ✓ SECURE DELIVERY COVERAGE CONFIRMED
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[8px] font-mono text-veltora-steel uppercase">
                          ATELIER DOORSTEP PROMISE
                        </span>
                        <p className="text-xs sm:text-sm font-display text-veltora-cream leading-relaxed">
                          Order now to have your custom Veltora hand-delivered to your doorstep in exactly <strong className="text-veltora-gold">14 days</strong>.
                        </p>
                        <p className="text-[10px] font-mono text-veltora-gold-light font-semibold">
                          Estimated Hand-Delivery Date: {deliveryResult.dateString}
                        </p>
                      </div>

                      {/* Shipping progression steps list */}
                      <div className="border-t border-veltora-gold/10 pt-3 space-y-2">
                        <span className="block text-[8px] font-mono text-veltora-steel uppercase mb-1">
                          Transit Progress Timeline
                        </span>
                        <div className="grid grid-cols-4 gap-2 text-[8px] font-mono text-veltora-steel">
                          <div className="space-y-1">
                            <span className="block text-veltora-gold/90 font-bold">DAYS 1-2</span>
                            <span className="block text-[7px] leading-tight">Assembly & Caliber Reg</span>
                          </div>
                          <div className="space-y-1 border-l border-veltora-gold/10 pl-2">
                            <span className="block text-veltora-gold/90 font-bold">DAYS 3-10</span>
                            <span className="block text-[7px] leading-tight">Finishing & Chrono Cert</span>
                          </div>
                          <div className="space-y-1 border-l border-veltora-gold/10 pl-2">
                            <span className="block text-veltora-gold/90 font-bold">DAY 11</span>
                            <span className="block text-[7px] leading-tight">Engraving & Boxing</span>
                          </div>
                          <div className="space-y-1 border-l border-veltora-gold/10 pl-2">
                            <span className="block text-veltora-gold/90 font-bold">DAYS 12-14</span>
                            <span className="block text-[7px] leading-tight">Armored Air Transit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Central Scroll Helper Indicators */}
            <div className="h-10 relative">
              {conciergeProgress < 0.5 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 font-mono text-[9px] text-veltora-gold tracking-[0.25em] animate-pulse">
                  <span>SCROLL DOWN FOR DIRECT DELIVERY CHECKER</span>
                  <ArrowDown className="w-3 h-3 animate-bounce" />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 font-mono text-[9px] text-veltora-gold tracking-[0.25em] animate-pulse">
                  <div className="transform rotate-180 flex items-center justify-center">
                    <ArrowDown className="w-3 h-3 animate-bounce" />
                  </div>
                  <span>SCROLL UP FOR ATELIER FINDER</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 09 — ACQUISITION: FOOTER CTA */}
      <section className="relative w-full min-h-[60vh] flex flex-col justify-between bg-black overflow-hidden py-12">
        {/* Footer cinematic background image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/footer_bg.png"
            alt="Veltora watch on black marble"
            fill
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-veltora-obsidian" />
        </div>

        {/* Centered headline CTAs */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto space-y-6 z-10">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-veltora-gold tracking-widest uppercase">
              THE ACQUISITION
            </span>
            <h2 className="text-3xl sm:text-5xl font-display text-veltora-cream uppercase tracking-wide">
              Yours. In Three Hundred Hours.
            </h2>
            <p className="text-veltora-steel text-xs font-light max-w-lg mx-auto">
              VELTORA timepieces are handcrafted on-demand at our atelier. Reserve your place in the assembly register or connect with our concierge.
            </p>
          </div>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <a 
              href="#customizer"
              className="bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold py-2.5 px-6 rounded-lg transition-colors text-xs tracking-widest"
              onPointerOver={() => { setCursorState('hover-cta'); setCursorText('RESERVE'); }}
              onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
            >
              Reserve a Piece
            </a>
            <a 
              href="#concierge"
              className="border border-veltora-gold hover:bg-veltora-gold/10 text-veltora-gold font-mono uppercase font-bold py-2.5 px-6 rounded-lg transition-colors text-xs tracking-widest"
              onPointerOver={() => { setCursorState('hover-cta'); setCursorText('MAP'); }}
              onPointerOut={() => { setCursorState('default'); setCursorText(''); }}
            >
              Visit Boutique
            </a>
          </div>

          {/* Waitlist Form */}
          <div className="w-full max-w-md border-t border-veltora-gold/10 pt-4 space-y-2">
            <h4 className="text-xs font-mono text-veltora-cream uppercase tracking-widest">
              Join the Registry Waitlist
            </h4>
            
            {waitlistSuccess ? (
              <div className="flex items-center justify-center gap-2 text-veltora-gold text-sm font-mono uppercase">
                <Check className="w-4 h-4 text-veltora-gold" />
                <span>You have been registered.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="flex-1 bg-veltora-charcoal/80 border border-veltora-gold/10 rounded px-4 py-2 text-xs text-veltora-cream placeholder-veltora-steel/50 focus:outline-none focus:border-veltora-gold"
                  placeholder="ENTER EMAIL FOR NOTIFICATIONS"
                />
                <button
                  type="submit"
                  className="bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold px-4 rounded text-xs"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Boutique locator maps section */}
        <div id="concierge" className="max-w-5xl mx-auto px-6 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 z-10 pt-8">
          {[
            { city: 'Geneva Boutique', address: 'Rue du Rhône 34, 1204 Genève' },
            { city: 'Dubai Gallery', address: 'The Dubai Mall, Fashion Avenue' },
            { city: 'Tokyo Atelier', address: '7-Chome Ginza, Tokyo 104-0061' }
          ].map((boutique, idx) => (
            <div key={idx} className="glass-panel p-3 rounded-xl flex items-start gap-3 border border-veltora-gold/10 hover:border-veltora-gold/25 transition-all">
              <MapPin className="w-4 h-4 text-veltora-gold mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-mono text-veltora-cream uppercase font-bold">{boutique.city}</h5>
                <p className="text-[10px] text-veltora-steel mt-1 font-light leading-relaxed">{boutique.address}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Luxury Footer */}
        <footer className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-10 pt-12 pb-6 border-t border-veltora-gold/10 mt-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {/* Column 1: Brand Info */}
            <div className="space-y-4 md:col-span-1">
              <h4 className="text-lg font-display text-veltora-cream tracking-widest uppercase">
                VELTORA
              </h4>
              <p className="text-[10px] text-veltora-steel leading-relaxed max-w-xs font-light">
                Handcrafting the measure of human ambition in Geneva, Switzerland. Each timepiece represents 300 hours of dedication and horological mastery.
              </p>
            </div>
            
            {/* Column 2: Collections Links */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono text-veltora-cream uppercase tracking-wider font-semibold">Collections</h5>
              <ul className="space-y-2 text-[10px] font-mono text-veltora-steel uppercase">
                <li><a href="#collections" className="hover:text-veltora-cream transition-colors">Legendary</a></li>
                <li><a href="#collections" className="hover:text-veltora-cream transition-colors">Masterpiece</a></li>
                <li><a href="#collections" className="hover:text-veltora-cream transition-colors">Classic</a></li>
                <li><a href="#customizer" className="hover:text-veltora-cream transition-colors">Bespoke Configurator</a></li>
              </ul>
            </div>

            {/* Column 3: Atelier Experience */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono text-veltora-cream uppercase tracking-wider font-semibold">Atelier</h5>
              <ul className="space-y-2 text-[10px] font-mono text-veltora-steel uppercase">
                <li><a href="#brand-story" className="hover:text-veltora-cream transition-colors">Manifesto</a></li>
                <li><a href="#craftsmanship" className="hover:text-veltora-cream transition-colors">Craftsmanship</a></li>
                <li><a href="#movement" className="hover:text-veltora-cream transition-colors">Caliber V-9</a></li>
                <li><a href="#reviews" className="hover:text-veltora-cream transition-colors">Owner Registry</a></li>
              </ul>
            </div>

            {/* Column 4: Boutiques / Contacts */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono text-veltora-cream uppercase tracking-wider font-semibold">Inquiries</h5>
              <ul className="space-y-2 text-[10px] font-mono text-veltora-steel uppercase">
                <li><a href="#concierge" className="hover:text-veltora-cream transition-colors">Geneva Boutique</a></li>
                <li><a href="#concierge" className="hover:text-veltora-cream transition-colors">Dubai Gallery</a></li>
                <li><a href="#concierge" className="hover:text-veltora-cream transition-colors">Tokyo Atelier</a></li>
                <li><span className="text-veltora-gold/80">concierge@veltora.com</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-veltora-gold/5 text-veltora-steel text-[9px] font-mono uppercase tracking-widest">
            <div>
              &copy; {new Date().getFullYear()} VELTORA SA. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-veltora-cream transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-veltora-cream transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-veltora-cream transition-colors">Assembly registry</a>
            </div>
          </div>
        </footer>
      </section>

      {/* STRIPE PAYMENT DRAWER */}
      <CheckoutDrawer />
      
      {/* BESPOKE CRAFTSMANSHIP CERTIFICATE OVERLAY */}
      <BespokeCertificate />
    </div>
  );
}
