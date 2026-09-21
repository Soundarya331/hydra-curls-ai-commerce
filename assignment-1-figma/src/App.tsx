import React, { useState, useRef } from 'react';
import {
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  Droplet,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Hydrating Shampoo',
    subtitle: 'Deep Cleanses Scalp & Hydrates Hair',
    image: '/assets/hair-type-curly.jpg',
    tag: 'Step 1: Cleanse'
  },
  {
    id: 2,
    name: 'Hydrating Conditioner',
    subtitle: 'Intense Detangling & Moisture Infusion',
    image: '/assets/hair-type-wavy.jpg',
    tag: 'Step 2: Condition'
  },
  {
    id: 3,
    name: 'Deep Hydrating Mask',
    subtitle: 'Weekly Intense Hydration & Repair',
    image: '/assets/feature-card-1.jpg',
    tag: 'Step 3: Nourish'
  },
  {
    id: 4,
    name: 'Curl Defining Leave-In Cream',
    subtitle: 'All-Day Frizz Control & Soft Curls',
    image: '/assets/hair-type-coily.jpg',
    tag: 'Step 4: Define'
  },
  {
    id: 5,
    name: 'Hydra Hold Curl Gel',
    subtitle: 'Long-Lasting Cast Without Crunch',
    image: '/assets/hair-type-curly.jpg',
    tag: 'Step 5: Lock & Hold'
  }
];

export const App: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Home' | 'Products' | 'Hair Care Blog' | 'Curly Girl Method'>('Home');
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Carousel active product
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % PRODUCTS.length);
  };

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00d2ff] selection:text-black">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#050b1c] text-white border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="border border-white/20 px-2 py-1 bg-white/5 rounded">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00d2ff] block">Parachute</span>
              <span className="text-sm font-extrabold text-white tracking-tight">ADVANCED</span>
            </div>
            <span className="text-2xl font-serif italic font-bold bg-gradient-to-r from-white via-cyan-100 to-[#00d2ff] bg-clip-text text-transparent">
              Hydra Curls
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {(['Home', 'Products', 'Hair Care Blog', 'Curly Girl Method'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-2 transition-colors ${
                  activeTab === tab ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00d2ff] rounded-full shadow-[0_0_8px_#00d2ff]" />
                )}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-white hover:text-[#00d2ff]"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#0a122c] border-b border-slate-800 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold">
              {(['Home', 'Products', 'Hair Care Blog', 'Curly Girl Method'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileNavOpen(false);
                  }}
                  className={`text-left py-1.5 ${
                    activeTab === tab ? 'text-[#00d2ff] font-bold' : 'text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* 2. HERO VIDEO BANNER (1920 x 1133.23 Video Section) */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#2b0947] via-[#481173] to-[#250341] text-white">
        <div className="relative max-w-7xl mx-auto aspect-[16/9] min-h-[500px] md:min-h-[640px] flex items-center justify-center">
          
          {/* HTML5 Video */}
          <video
            ref={videoRef}
            src="/assets/hero-video.mp4"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
            loop
            muted={isMuted}
            playsInline
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#250341]/90 via-purple-950/40 to-[#2b0947]/70" />

          {/* Centered Overlay Content */}
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-6">
            <div className="inline-block border border-white/30 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg">
              <span className="text-xs uppercase tracking-widest text-[#00d2ff] font-bold">Parachute Advanced</span>
              <span className="text-sm font-serif italic text-white ml-2 font-bold">Hydra Curls</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic font-bold tracking-tight text-white leading-tight drop-shadow-lg">
              Pure ingredients. Real results.
              <br />
              <span className="text-[#00e5ff] not-italic font-sans text-2xl sm:text-4xl block mt-2 font-normal">
                -------- Every drop matters. --------
              </span>
            </h1>

            {/* Play/Pause Button */}
            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/60 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 group"
                aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-white/30 flex items-center justify-center text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Cyan Wave Divider at Bottom */}
          <div className="absolute bottom-0 inset-x-0 w-full overflow-hidden leading-none z-20">
            <svg
              className="relative block w-full h-12 sm:h-16 text-[#00d2ff]"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* 3. NEW LAUNCH HERO PROMOTION */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-cyan-50/50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xl font-serif italic text-slate-700 block">New Launch</span>
              
              <div className="flex items-center gap-3">
                <div className="border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  Parachute Advanced
                </div>
                <span className="text-3xl font-serif italic font-extrabold text-[#3b1261]">
                  Hydra Curls
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-snug">
                Revolutionary hair care range specially designed for{' '}
                <span className="text-[#3b1261]">Arab curly, coily & wavy hair</span>.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Experience <strong className="text-[#00a8cc]">48-hour hydration</strong> with natural active ingredients like Hyaluronic Acid, Coconut & Avocado oils.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                  No SLS, Silicones, Parabens
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  48-Hour Hydration
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Hair Types 2, 3, 4
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button className="px-6 py-3 bg-[#00d2ff] hover:bg-[#00bfe6] text-slate-900 font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:scale-105">
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-6 py-3 bg-transparent hover:bg-cyan-50 text-[#00a8cc] border-2 border-[#00d2ff] font-bold text-xs sm:text-sm rounded-full transition-colors">
                  Learn Curly Girl Method
                </button>
              </div>
            </div>

            {/* Right Bottle Splash Asset */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-gradient-to-br from-cyan-100/40 via-white to-purple-100/40">
                <img
                  src="/assets/hero-launch.jpg"
                  alt="Hydra Curls Water Splash Bottle"
                  className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FULL PRODUCT LINEUP BANNER (Frame 60) */}
      <section className="relative w-full bg-[#3c095e] text-white py-12 md:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-800/50">
            <img
              src="/assets/product-lineup-banner.jpg"
              alt="Hydra Curls 48-Hour Full Range Lineup"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. PRODUCT SHOWCASE & SIGNATURE CIRCULAR CAROUSEL (Screenshot 2) */}
      <section className="relative py-20 bg-gradient-to-b from-[#eaf9fd] via-[#f4fcfe] to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Two Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#d9f5fc] to-[#eaf9fd] rounded-3xl p-8 md:p-10 border border-cyan-200/60 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Hyaluron Moisture Lock</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Hyaluronic Acid acts like a magnet for moisture, drawing continuous hydration into each curl strand. It forms a lightweight barrier that prevents humidity from disrupting your curl definition.
                </p>
              </div>
              <div className="mt-8">
                <button className="px-5 py-2.5 bg-[#00d2ff] hover:bg-[#00bce5] text-slate-900 font-bold text-xs rounded-full shadow-sm">
                  Learn More &rarr;
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#d9f5fc] to-[#eaf9fd] rounded-3xl p-8 md:p-10 border border-cyan-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-bold text-slate-900">5-Step Complete System</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  From deep scalp hydration to cast-locking gel, the complete Hydra Curls method delivers 48 hours of bouncy, frizz-free curls.
                </p>
                <button className="px-5 py-2.5 bg-[#00d2ff] hover:bg-[#00bce5] text-slate-900 font-bold text-xs rounded-full shadow-sm">
                  Shop Collection &rarr;
                </button>
              </div>
              <img
                src="/assets/product-lineup-banner.jpg"
                alt="Product Collection"
                className="w-48 h-32 object-cover rounded-2xl shadow-md border border-white"
              />
            </div>
          </div>

          {/* THE SIGNATURE PURPLE CURVE CAROUSEL */}
          <div className="relative bg-gradient-to-b from-[#490d79] to-[#2b0349] text-white rounded-[40px] p-8 md:p-16 shadow-2xl overflow-hidden text-center">
            
            <div className="max-w-xl mx-auto space-y-2 mb-8">
              <span className="text-xs uppercase tracking-widest text-[#00e5ff] font-bold">Interactive Collection</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif italic">
                {PRODUCTS[currentProductIndex].name}
              </h2>
              <p className="text-xs text-purple-200">{PRODUCTS[currentProductIndex].subtitle}</p>
            </div>

            {/* Active Bottle Presentation with Navigation Arrows */}
            <div className="relative flex items-center justify-center my-6">
              
              <button
                onClick={prevProduct}
                className="absolute left-4 sm:left-12 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all transform hover:scale-110"
                aria-label="Previous Product"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Product Showcase Box */}
              <div className="w-56 h-72 sm:w-64 sm:h-80 bg-white/10 border border-white/20 rounded-3xl p-4 flex flex-col items-center justify-center backdrop-blur-md shadow-2xl relative group">
                <span className="absolute top-3 right-3 text-[10px] bg-[#00d2ff] text-black font-bold px-2 py-0.5 rounded-full">
                  {PRODUCTS[currentProductIndex].tag}
                </span>
                <img
                  src={PRODUCTS[currentProductIndex].image}
                  alt={PRODUCTS[currentProductIndex].name}
                  className="h-44 sm:h-52 object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform"
                />
                <p className="mt-3 text-xs font-bold text-white">{PRODUCTS[currentProductIndex].name}</p>
              </div>

              <button
                onClick={nextProduct}
                className="absolute right-4 sm:right-12 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all transform hover:scale-110"
                aria-label="Next Product"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Circular Product Selector Pills */}
            <div className="flex justify-center items-center gap-3 pt-4">
              {PRODUCTS.map((prod, idx) => (
                <button
                  key={prod.id}
                  onClick={() => setCurrentProductIndex(idx)}
                  className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden flex items-center justify-center ${
                    currentProductIndex === idx
                      ? 'border-[#00d2ff] ring-4 ring-[#00d2ff]/30 scale-110'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                  title={prod.name}
                >
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Cursive Sweeping Slogan */}
            <p className="mt-10 text-xl sm:text-2xl font-serif italic text-purple-200">
              Experience the power of hydration in every drop.
            </p>
          </div>

          {/* CLINICALLY PROVEN 48-HOUR HYDRATION CARD */}
          <div className="bg-white rounded-3xl border-2 border-[#00d2ff] p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <span className="text-xs uppercase font-bold text-[#00a8cc] tracking-wider block">
                  The Hydra Curls Formula
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Clinically Proven <span className="text-[#00a8cc]">48-Hour</span> Hydration
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our advanced formula with Hyaluronic Acid doesn't just coat your hair; it penetrates the cuticle to lock in moisture from the inside out, providing continuous hydration for two full days.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <Droplet className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">Moisture Attraction</strong>
                      <span className="text-slate-500">Hyaluronic Acid acts like a magnet for moisture, drawing hydration into each strand.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">Strengthening Seal</strong>
                      <span className="text-slate-500">Coconut & Avocado oils seal the hair cuticle, preventing moisture loss and adding strength.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 48 Hours Clock Graphic */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-cyan-50/50 rounded-2xl border border-cyan-100">
                <div className="w-16 h-16 rounded-full border-4 border-[#00d2ff] flex items-center justify-center text-[#00a8cc] mb-2 shadow-inner">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-black text-slate-900">48</span>
                  <span className="ml-1 text-sm font-bold text-white bg-[#00d2ff] px-2 py-0.5 rounded uppercase">Hours</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  of continuous curl hydration and frizz control
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. NATURE'S BEST INGREDIENTS & COMMUNITY REVIEWS (Screenshot 3) */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Ingredients Section */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#00a8cc] font-bold">Premium Ingredients</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Powered by <span className="text-[#00a8cc]">Nature's</span> Best Ingredients
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Our formulations combine scientifically-proven active ingredients with natural extracts for superior curly hair care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xl">
                💧
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hyaluronic Acid</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rich in vitamins and moisture-binding molecules for ultimate curl definition and long-lasting softness.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Deep Hydration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Moisture Lock</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600" /> Plump Curls</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
                🥥
              </div>
              <h3 className="text-lg font-bold text-slate-900">Coconut Oil</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Natural nourishment that penetrates hair shaft to strengthen, prevent breakage, and add glossy luster.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Hair Strength</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Natural Shine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Frizz Control</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                🥑
              </div>
              <h3 className="text-lg font-bold text-slate-900">Avocado Extract</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rich in vitamins and fatty acids for ultimate curl definition, bounce, and nutrient replenishing.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Curl Definition</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Softness</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Nutrient Rich</li>
              </ul>
            </div>
          </div>

          {/* Quality Pills */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold text-slate-700 pt-4">
            {['No SLS', 'No Silicones', 'No Parabens', 'Cruelty Free', 'Natural Extracts'].map((pill) => (
              <span key={pill} className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-cyan-600" />
                {pill}
              </span>
            ))}
          </div>

          {/* HEAR FROM OUR COMMUNITY */}
          <div className="bg-gradient-to-r from-[#59c9e8] via-[#75d4ed] to-[#39badf] rounded-[40px] p-8 md:p-14 text-slate-900 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Model */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-64 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60">
                  <img
                    src="/assets/hair-type-curly.jpg"
                    alt="Community Member Curls"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow">
                      &larr;
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow">
                      &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-800">Real Women, Real Results</span>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">Hear from Our Community</h3>
                </div>

                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-[#0c142e] text-white p-5 rounded-2xl shadow-lg space-y-2 border border-slate-800">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, star) => (
                          <Star key={star} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                        "I've struggled with frizz my whole life. Hydra Curls is the first range that actually tamed my hair for more than a day! The 48-hour claim is 100% real."
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-[#00d2ff] flex items-center justify-center text-[10px]">
                          AK
                        </div>
                        <span>Aisha K. • Dubai, UAE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEE WHAT THE EXPERTS ARE SAYING */}
          <div className="space-y-8 text-center pt-8">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[#00a8cc]">Influencer Approved</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">See What The Experts Are Saying</h3>
            </div>

            {/* 8 Influencer Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Transformation 1', img: '/assets/hair-type-curly.jpg' },
                { name: 'Transformation 2', img: '/assets/hair-type-wavy.jpg' },
                { name: 'Transformation 3', img: '/assets/hair-type-coily.jpg' },
                { name: 'Transformation 4', img: '/assets/hair-type-curly.jpg' },
                { name: 'Transformation 5', img: '/assets/hair-type-coily.jpg' },
                { name: 'Transformation 6', img: '/assets/hair-type-wavy.jpg' },
                { name: 'Transformation 7', img: '/assets/hair-type-curly.jpg' },
                { name: 'Transformation 8', img: '/assets/hair-type-coily.jpg' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-slate-100 cursor-pointer"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-semibold text-white">#HydraCurlsRoutine</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 7. HAIR TYPE TARGETING & CURLY GIRL METHOD (Screenshot 4) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold text-[#00a8cc] tracking-widest">Designed for You</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Perfect for Arab <span className="text-[#00a8cc]">Curly, Coily & Wavy</span> Hair
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              One range is specifically formulated to meet the unique needs of Arab hair textures, providing targeted care for types 2, 3, and 4.
            </p>
          </div>

          {/* 3 Hair Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group rounded-3xl overflow-hidden border border-slate-200 shadow-md relative aspect-[4/5] cursor-pointer">
              <img
                src="/assets/hair-type-wavy.jpg"
                alt="Wavy Hair Type"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-transparent to-transparent flex items-end p-6">
                <span className="text-3xl font-serif italic font-bold text-white tracking-wide">wavy</span>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-slate-200 shadow-md relative aspect-[4/5] cursor-pointer">
              <img
                src="/assets/hair-type-curly.jpg"
                alt="Curly Hair Type"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-transparent to-transparent flex items-end p-6">
                <span className="text-3xl font-serif italic font-bold text-white tracking-wide">curly</span>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-slate-200 shadow-md relative aspect-[4/5] cursor-pointer">
              <img
                src="/assets/hair-type-coily.jpg"
                alt="Coily Hair Type"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-transparent to-transparent flex items-end p-6">
                <span className="text-3xl font-serif italic font-bold text-white tracking-wide">coily</span>
              </div>
            </div>
          </div>

          {/* YOUR CURLY HAIR JOURNEY STARTS HERE */}
          <div className="space-y-6 pt-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs uppercase font-bold text-[#00a8cc] tracking-widest">Learn & Grow</span>
              <h3 className="text-3xl font-black text-slate-900">
                Your Curly Hair <span className="text-[#00a8cc]">Journey Starts Here</span>
              </h3>
              <p className="text-xs text-slate-500">
                Access expert guides, styling tips, and a community of women who celebrate their natural curls.
              </p>
            </div>

            {/* 3 Color Split Wave Banners */}
            <div className="space-y-6">
              
              {/* Split 1: Teal + Deep Blue */}
              <div className="rounded-3xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
                <div className="bg-[#3cd5c0] flex items-center justify-center p-6">
                  <img
                    src="/assets/hair-type-curly.jpg"
                    alt="Curly Girl Guide"
                    className="h-64 rounded-2xl object-cover shadow-md"
                  />
                </div>
                <div className="bg-[#4853b8] text-white p-8 md:p-12 flex flex-col justify-center space-y-3">
                  <span className="text-xs uppercase tracking-widest text-cyan-200 font-bold font-serif italic">Expert Guide</span>
                  <h4 className="text-2xl font-bold font-serif">Curly Girl Method Guide</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Complete guide to the CGM with moodboards, tips, and step-by-step instructions designed specifically for Arab hair.
                  </p>
                  <button className="pt-2 text-xs font-bold text-[#00d2ff] hover:underline text-left">
                    EXPLORE NOW &rarr;
                  </button>
                </div>
              </div>

              {/* Split 2: Purple + Pink */}
              <div className="rounded-3xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
                <div className="bg-[#6b478c] text-white p-8 md:p-12 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <span className="text-xs uppercase tracking-widest text-pink-200 font-bold font-serif italic">Expert Guide</span>
                  <h4 className="text-2xl font-bold font-serif">Curl Refresh & Sleep Care</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    How to protect curls with silk bonnets and effortlessly refresh definition on Day 2 and Day 3 without re-washing.
                  </p>
                  <button className="pt-2 text-xs font-bold text-[#00d2ff] hover:underline text-left">
                    EXPLORE NOW &rarr;
                  </button>
                </div>
                <div className="bg-[#ffb0b0] flex items-center justify-center p-6 order-1 md:order-2">
                  <img
                    src="/assets/hair-type-wavy.jpg"
                    alt="Curl Styling"
                    className="h-64 rounded-2xl object-cover shadow-md"
                  />
                </div>
              </div>

              {/* Split 3: Yellow + Cyan */}
              <div className="rounded-3xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
                <div className="bg-[#fbb034] flex items-center justify-center p-6">
                  <img
                    src="/assets/hair-type-coily.jpg"
                    alt="Deep Nourishing"
                    className="h-64 rounded-2xl object-cover shadow-md"
                  />
                </div>
                <div className="bg-[#00a8cc] text-white p-8 md:p-12 flex flex-col justify-center space-y-3">
                  <span className="text-xs uppercase tracking-widest text-amber-200 font-bold font-serif italic">Expert Guide</span>
                  <h4 className="text-2xl font-bold font-serif">Hydration & Porosity Test</h4>
                  <p className="text-xs text-slate-100 leading-relaxed">
                    Discover your hair's unique porosity and find the ideal balance of protein and moisture for frizz-free coils.
                  </p>
                  <button className="pt-2 text-xs font-bold text-white hover:underline text-left">
                    EXPLORE NOW &rarr;
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 8. JOIN THE REVOLUTION BANNER (Screenshot 5) */}
      <section className="relative bg-[#071330] text-white py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Join the Curly Hair Revolution
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Transform your curly hair journey with expert guidance, premium products, and a supportive community.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="px-6 py-3 bg-[#00d2ff] hover:bg-[#00bce5] text-slate-900 font-bold text-xs sm:text-sm rounded-full shadow-lg transition-transform transform hover:scale-105">
                  Explore Products &rarr;
                </button>
                <button className="px-6 py-3 bg-transparent hover:bg-white/10 text-white border border-white/40 font-bold text-xs sm:text-sm rounded-full transition-colors">
                  Learn Curly Girl Method
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-6 text-center border-t lg:border-t-0 lg:border-l border-slate-700 pt-6 lg:pt-0 lg:pl-10">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white block">48h</span>
                <span className="text-xs text-slate-400 font-medium">Hydration</span>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white block">05</span>
                <span className="text-xs text-slate-400 font-medium">Products</span>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white block">3</span>
                <span className="text-xs text-slate-400 font-medium">Hair Types</span>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white block">0</span>
                <span className="text-xs text-slate-400 font-medium">Sulfates</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-black text-slate-400 py-16 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Brand column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="border border-white/20 px-2 py-0.5 rounded text-[10px] text-[#00d2ff]">
                  Parachute
                </div>
                <span className="text-xl font-serif italic font-bold text-white">Hydra Curls</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Advanced hair care specially designed for Arab curly, coily & wavy hair types 2, 3, and 4.
              </p>
            </div>

            {/* Hair care links */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="text-white font-bold uppercase tracking-wider text-[11px]">Hair Care</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Curly Girl Method</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hair Type Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Styling Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ingredient Benefits</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="text-white font-bold uppercase tracking-wider text-[11px]">Connect</h5>
              <p className="leading-relaxed">
                Follow us for daily hair care tips and inspiration for your curly hair journey.
              </p>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-4 space-y-3">
              <h5 className="text-white font-bold uppercase tracking-wider text-[11px]">Newsletter</h5>
              <p className="leading-relaxed">
                Get expert tips and exclusive offers delivered to your inbox.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00d2ff]"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-[#00d2ff] hover:bg-[#00bce5] text-slate-900 rounded-xl font-bold transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 text-center text-[11px] text-slate-600">
            &copy; 2026 Parachute Advanced Hydra Curls. All Rights Reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};
