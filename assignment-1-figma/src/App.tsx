import React, { useState, useRef } from 'react';
import {
  Menu,
  X,
  Play,
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
  
  // Hero video state (inline player — overlays stay visible while playing)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Carousel active product
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const playHeroVideo = () => {
    if (!videoRef.current) return;

    videoRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play();
        setIsPlaying(true);
      }
    });
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
      {/* 1. TOP NAVIGATION HEADER - Reduced height & vibrant blue text matching design */}
      <header className="sticky top-0 z-50 bg-[#060b1e] text-white border-b border-[#00d2ff]/30 shadow-xl">
        <div className="w-full px-4 sm:px-8 lg:px-16 h-[72px] sm:h-[100px] flex items-center justify-between relative max-w-[1920px] mx-auto">
          
          {/* Logo on the left - sleek dark background matching header */}
          <div className="flex items-center gap-3 z-10">
            <a href="#" className="block cursor-pointer">
              <img
                src="/assets/logo-header-dark.png"
                alt="Parachute Advansed Hydra Curls"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </a>
          </div>

          {/* Centered Navigation Links - Blue text color matching user request */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-10 text-sm font-semibold tracking-wide">
            {(['Home', 'Products', 'Hair Care Blog', 'Curly Girl Method'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1 text-sm tracking-wide transition-all relative ${
                  activeTab === tab
                    ? 'text-[#00d2ff] font-bold drop-shadow-[0_0_8px_rgba(0,210,255,0.7)]'
                    : 'text-[#38bdf8]/90 hover:text-[#00d2ff]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00d2ff] rounded-full shadow-[0_0_8px_#00d2ff]" />
                )}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-[#00d2ff] hover:text-white z-10"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#060b1e] border-b border-[#00d2ff]/40 p-5 space-y-3 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-2 text-sm font-semibold">
              {(['Home', 'Products', 'Hair Care Blog', 'Curly Girl Method'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileNavOpen(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${
                    activeTab === tab ? 'text-[#00d2ff] bg-white/5 font-bold' : 'text-[#38bdf8]/80 hover:text-[#00d2ff]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* 2. HERO BANNER & VIDEO (Figma Rectangle 136 — 1920×1133 inline video with overlays) */}
      <section className="relative w-full bg-[#1b052d] overflow-hidden">
        <div className="relative w-full max-w-[1920px] mx-auto aspect-[1920/1133] flex flex-col justify-between items-center">

          {/* Inline hero video (new-animation-video.mp4) with native controls at bottom */}
          <video
            ref={videoRef}
            src="/assets/hero-video.mp4"
            poster="/assets/Rectangle 136.jpg"
            className="absolute inset-0 w-full h-full object-cover z-0"
            controls
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
          />

          {/* Centered overlay content — stays visible while video plays (Figma prototype) */}
          <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 pointer-events-none">
            {/* Parachute Advansed Hydra Curls Logo - SITS DIRECTLY ON PURPLE BACKDROP (NO BOX) */}
            <div className="mb-3 sm:mb-4 flex justify-center">
              <img
                src="/assets/hero-logo-perfect.png"
                alt="Parachute Advansed Hydra Curls"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain select-none drop-shadow-md"
              />
            </div>

            {/* Headline Line 1: Pure ingredients. Real results. */}
            <div className="w-full flex justify-center px-2">
              <img
                src="/assets/hero-line-1.png"
                alt="Pure ingredients. Real results."
                className="w-full max-w-[320px] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[640px] h-auto object-contain mx-auto select-none"
              />
            </div>

            {/* Center play button — hidden while video is playing */}
            {!isPlaying && (
              <div className="my-2 sm:my-3 flex items-center justify-center">
                <button
                  onClick={playHeroVideo}
                  className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-black/75 hover:bg-black/95 border-2 border-white/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all transform hover:scale-110 active:scale-95 group cursor-pointer"
                  aria-label="Play Animation Video"
                  title="Play Animation Video"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white fill-white ml-1 transition-transform group-hover:scale-110" />
                </button>
              </div>
            )}

            {/* Headline Line 2: Every drop matters. */}
            <div className="w-full flex justify-center px-2">
              <img
                src="/assets/hero-line-2.png"
                alt="Every drop matters."
                className="w-full max-w-[260px] sm:max-w-[360px] md:max-w-[440px] lg:max-w-[500px] h-auto object-contain mx-auto select-none"
              />
            </div>

            {/* Subtle wavy line (Figma Line 33.svg) */}
            <div className="mt-3 sm:mt-4 flex justify-center w-full">
              <img
                src="/assets/Line 33.svg"
                alt="Wavy accent line"
                className="w-48 sm:w-72 md:w-88 lg:w-96 h-auto object-contain mx-auto select-none opacity-90"
              />
            </div>

            {/* Down Arrow (Figma icon-park-outline_down.svg) */}
            <div className="mt-3 sm:mt-4 pointer-events-auto">
              <a
                href="#new-launch"
                className="inline-block animate-bounce cursor-pointer p-1 transition-transform hover:scale-110"
                aria-label="Scroll to next section"
              >
                <img
                  src="/assets/icon-park-outline_down.svg"
                  alt="Scroll Down"
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain mx-auto brightness-200"
                />
              </a>
            </div>
          </div>

          {/* Cyan wave divider at bottom (Figma Rectangle 140-transparent.png) */}
          <div className="relative z-20 w-full overflow-hidden leading-none select-none pointer-events-none -mb-1 shrink-0">
            <img
              src="/assets/Rectangle 140-transparent.png"
              alt="Cyan Wave Divider"
              className="w-full h-auto object-cover min-h-[35px] sm:min-h-[55px] md:min-h-[75px]"
            />
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: NEW LAUNCH (1920 x 830 - Frame 75 - matching media_1790010562111.png) */}
      <section id="new-launch" className="relative w-full bg-[#f3fafd] overflow-hidden">
        <div className="relative w-full max-w-[1920px] mx-auto">
          {/* Frame 75 Full High-Res Graphic */}
          <img
            src="/assets/Frame 75.jpg"
            alt="Parachute Advansed Hydra Curls - New Launch"
            className="w-full h-auto object-cover block select-none"
          />

          {/* Clickable Overlay Hotspots for Explore Products & Learn Curly Girl Method */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-12">
              <div className="col-span-12 lg:col-span-6 pt-16 sm:pt-24 lg:pt-36 pointer-events-auto">
                <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-8">
                  <a
                    href="#lineup"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#00d2ff] hover:bg-[#00bee8] text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#cgm"
                    className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3.5 bg-white hover:bg-cyan-50 text-[#00a8cc] border-2 border-[#00d2ff] font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all"
                  >
                    Learn Curly Girl Method
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Divider into Section 2 */}
          <div className="w-full overflow-hidden leading-none select-none pointer-events-none -mb-1">
            <img
              src="/assets/Rectangle 140.jpg"
              alt="Wave Transition"
              className="w-full h-auto object-cover rotate-180 opacity-90"
            />
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: 48-HOUR FULL LINEUP (1920 x 830 - Frame 72 - matching media_1790010579464.png) */}
      <section id="lineup" className="relative w-full bg-[#3d0f5e] overflow-hidden">
        <div className="relative w-full max-w-[1920px] mx-auto">
          {/* Frame 72 Full High-Res Graphic */}
          <img
            src="/assets/Frame 72.jpg"
            alt="Hydra Curls 48-Hour Hydration Full Range Lineup"
            className="w-full h-auto object-cover block select-none"
          />
        </div>
      </section>

      {/* 5. SECTION 3: TWO CARDS & CLOUD TRANSITION (Frame 71 + Lorem Ipsum - matching media_1790010593460.png) */}
      <section className="relative w-full bg-[#f4fcfe] pt-12 sm:pt-16 pb-0 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12">
          
          {/* Two Side-by-Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Card: Lorem Ipsum Card with organic wavy background pattern */}
            <div className="relative rounded-3xl overflow-hidden border border-cyan-100 shadow-xl bg-gradient-to-br from-[#dcf4fa] via-[#e9f8fc] to-[#f4fcfe] p-8 sm:p-12 lg:p-14 flex flex-col justify-between min-h-[450px] sm:min-h-[550px]">
              
              {/* Pattern Backdrop */}
              <img
                src="/assets/gray-white-irregular-organic-lines-seamless-pattern 1.jpg"
                alt="Wavy organic pattern"
                className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply pointer-events-none"
              />

              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Lorem Ipsum
                </h3>

                <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed font-normal">
                  Hyaluronic Acid acts like a magnet for moisture, drawing hydration into each strand. Hyaluronic Acid acts like a magnet for moisture, drawing hydration into each strand.Hyaluronic Acid acts like a magnet for moisture, drawing hydration into each strand.
                </p>
              </div>

              <div className="relative z-10 pt-8">
                <button className="px-6 sm:px-8 py-3 bg-[#00d2ff] hover:bg-[#00bee8] text-white font-bold text-sm sm:text-base rounded-lg shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Card: Frame 71 (Lorem Ipsum + 5 Purple Bottles Lineup) */}
            <div className="relative rounded-3xl overflow-hidden border border-cyan-100 shadow-xl min-h-[450px] sm:min-h-[550px]">
              <img
                src="/assets/Frame 71.jpg"
                alt="Hydra Curls Collection - Lorem Ipsum"
                className="w-full h-full object-cover block"
              />
              <div className="absolute top-[160px] sm:top-[190px] left-8 sm:left-14 z-20">
                <a
                  href="#collection"
                  className="px-6 sm:px-8 py-3 bg-[#00d2ff] hover:bg-[#00bee8] text-white font-bold text-sm sm:text-base rounded-lg shadow-md shadow-cyan-500/20 inline-flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Cloud Bank Transition into Purple Carousel (fb450438-a5c3-4f1f-8684-943c13acfeaf 1 + Cyan Wave) */}
          <div className="relative w-full mt-16 sm:mt-24 overflow-hidden">
            <img
              src="/assets/fb450438-a5c3-4f1f-8684-943c13acfeaf 1.jpg"
              alt="Cloud Bank"
              className="w-full h-auto object-cover select-none pointer-events-none"
            />
            <div className="absolute bottom-0 inset-x-0 w-full overflow-hidden leading-none select-none pointer-events-none -mb-1">
              <img
                src="/assets/Rectangle 140.jpg"
                alt="Cyan Wave"
                className="w-full h-auto object-cover min-h-[40px] sm:min-h-[60px]"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 6. SECTION 4: SIGNATURE PURPLE CURVE CAROUSEL (Component 11 & Group.jpg) */}
      <section id="collection" className="relative py-16 sm:py-24 bg-gradient-to-b from-[#f4fcfe] via-white to-[#f4fcfe] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="relative bg-gradient-to-b from-[#490d79] to-[#2b0349] text-white rounded-[40px] p-8 md:p-16 shadow-2xl overflow-hidden text-center">
            
            {/* Slogan curved text asset (Group.jpg) */}
            <div className="max-w-xl mx-auto mb-6">
              <img
                src="/assets/Group.jpg"
                alt="Experience the power of hydration in every drop."
                className="w-full max-w-md h-auto mx-auto brightness-200 invert"
              />
            </div>

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
                className="absolute left-4 sm:left-12 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all transform hover:scale-110 cursor-pointer"
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
                className="absolute right-4 sm:right-12 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all transform hover:scale-110 cursor-pointer"
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
                  className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden flex items-center justify-center cursor-pointer ${
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

          {/* 7. SECTION 5: CLINICALLY PROVEN 48-HOUR HYDRATION (Group 12138) */}
          <div className="bg-white rounded-3xl border border-cyan-100 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="max-w-5xl mx-auto">
              <img
                src="/assets/Group 12138.jpg"
                alt="Clinically Proven 48-Hour Hydration"
                className="w-full h-auto object-contain mx-auto"
              />
            </div>
          </div>

        </div>
      </section>
      {/* 8. SECTION 6: POWERED BY NATURE'S BEST INGREDIENTS (Frame 12) */}
      <section className="relative w-full bg-[#f4fcfe] py-12 sm:py-16 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-cyan-100 bg-white">
            <img
              src="/assets/Frame 12.jpg"
              alt="Powered by Nature's Best Ingredients - Hyaluronic Acid, Coconut Oil, Avocado Extract"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>
      </section>

      {/* 9. SECTION 7: HEAR FROM OUR COMMUNITY (Frame 60) */}
      <section className="relative w-full bg-[#6cd2f0] py-12 sm:py-16 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 bg-[#6cd2f0]">
            <img
              src="/assets/Frame 60.jpg"
              alt="Hear from Our Community - Aisha K. Review & Model"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>
      </section>

      {/* 10. SECTION 8: SEE WHAT THE EXPERTS ARE SAYING (Frame 61) */}
      <section className="relative w-full bg-white py-12 sm:py-16 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100">
            <img
              src="/assets/Frame 61.jpg"
              alt="See What The Experts Are Saying - Influencer Testimonials"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>
      </section>

      {/* 11. SECTION 9: DESIGNED FOR YOU - WAVY, CURLY, COILY (Components 15, 16, 17) */}
      <section id="cgm" className="relative w-full bg-[#f4fcfe] py-16 sm:py-20 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-[#00a8cc] tracking-widest">Designed for You</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900">
              Perfect for Arab <span className="text-[#00a8cc]">Curly, Coily & Wavy</span> Hair
            </h2>
            <p className="text-sm text-slate-500">
              One range is specifically formulated to meet the unique needs of Arab hair textures, providing targeted care for types 2, 3, and 4.
            </p>
          </div>

          {/* 3 Hair Type Cards from Figma Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group rounded-3xl overflow-hidden shadow-xl border border-purple-100 relative cursor-pointer transform hover:-translate-y-1 transition-all">
              <img
                src="/assets/Component 15.jpg"
                alt="Wavy Hair Type"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>

            <div className="group rounded-3xl overflow-hidden shadow-xl border border-purple-100 relative cursor-pointer transform hover:-translate-y-1 transition-all">
              <img
                src="/assets/Component 16.jpg"
                alt="Curly Hair Type"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>

            <div className="group rounded-3xl overflow-hidden shadow-xl border border-purple-100 relative cursor-pointer transform hover:-translate-y-1 transition-all">
              <img
                src="/assets/Component 17.jpg"
                alt="Coily Hair Type"
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 12. SECTION 10: JOIN THE CURLY HAIR REVOLUTION (Frame 76) */}
      <section className="relative w-full bg-[#0a1738] overflow-hidden">
        <div className="relative max-w-[1920px] mx-auto">
          <img
            src="/assets/Frame 76.jpg"
            alt="Join the Curly Hair Revolution - 48h Hydration, 05 Products, 3 Hair Types, 0 Sulfates"
            className="w-full h-auto object-cover block"
          />
          {/* Interactive clickable overlays */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-12">
              <div className="col-span-12 lg:col-span-7 pt-24 sm:pt-28 pointer-events-auto">
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#lineup"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-[#00d2ff] hover:bg-[#00bee8] text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#cgm"
                    className="inline-flex items-center px-6 sm:px-8 py-3 bg-transparent hover:bg-white/10 text-white border border-white/40 font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all"
                  >
                    Learn Curly Girl Method
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. SECTION 11: YOUR CURLY HAIR JOURNEY STARTS HERE (Group 12173) */}
      <section className="relative w-full bg-white py-12 sm:py-16 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <img
              src="/assets/Group 12173.jpg"
              alt="Learn & Grow - Your Curly Hair Journey Starts Here"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>
      </section>

      {/* 14. FOOTER (Group 12050) */}
      <footer className="relative w-full bg-black text-white overflow-hidden">
        <div className="max-w-[1920px] mx-auto">
          <img
            src="/assets/Group 12050.jpg"
            alt="Parachute Advansed Hydra Curls Footer"
            className="w-full h-auto object-cover block"
          />
        </div>
      </footer>

    </div>
  );
};
