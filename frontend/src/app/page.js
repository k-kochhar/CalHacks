'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A1628] via-[#1a0b2e] to-[#0A1628] opacity-90 animate-pulse" />
      
      {/* Floating Geometric Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-tr from-[#4F7FFF]/15 to-[#667eea]/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-[#764ba2]/10 to-[#4F7FFF]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }} />
      </div>

      {/* Dot Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-md bg-black/40 shadow-lg' : 'backdrop-blur-xl bg-white/[0.03]'}`}>
        <div className="max-w-[1200px] mx-auto px-16 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Salient Labs</div>
          <div className="hidden md:flex space-x-12">
            <Link href="#how-it-works" className="text-[#FFFFFF] hover:opacity-70 transition-all duration-300 font-medium text-base hover:scale-105">
              How it works
            </Link>
            <Link href="#demo" className="text-[#FFFFFF] hover:opacity-70 transition-all duration-300 font-medium text-base hover:scale-105">
              Demo
            </Link>
            <Link href="/about" className="text-[#FFFFFF] hover:opacity-70 transition-all duration-300 font-medium text-base hover:scale-105">
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Viewport Height */}
      <section className="h-screen flex items-center justify-center px-10 relative" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        <div className="max-w-[1200px] mx-auto text-center relative z-10 pt-32">
          {/* Hero Headline with Gradient Text - Staggered Animation */}
          <h1 className="text-[clamp(48px,8vw,96px)] font-extrabold mb-8 leading-[1.1] tracking-[-0.02em]" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
            <span 
              className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(102,126,234,0.5)]"
            >
              Focus
            </span>{" "}on
            <br />
            <span className="text-white">What Matters.</span>
          </h1>

          {/* Subheadline - Staggered Animation */}
          <p className="text-xl mb-16 max-w-[800px] mx-auto leading-[1.6] font-light text-white/80" style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}>
            Dynamic video compression that sees how you do.
          </p>
          
          {/* CTA Buttons - Staggered Animation */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20" style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}>
            <Link 
              href="/upload"
              className="px-10 py-[18px] bg-[#4F7FFF] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#667eea] hover:scale-105 active:scale-98 text-base shadow-[0_8px_32px_rgba(79,127,255,0.3)] hover:shadow-[0_12px_48px_rgba(79,127,255,0.5)]"
            >
              Watch Demo
            </Link>
            <Link 
              href="/demo"
              className="px-10 py-[18px] border-2 border-white/30 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105 active:scale-98 text-base"
            >
              Learn More
            </Link>
          </div>

          {/* Video Placeholder - Glassmorphic Card with Staggered Animation */}
          <div className="max-w-5xl mx-auto" style={{ animation: 'fadeInUp 0.8s ease-out 1s both' }}>
            <div className="relative group cursor-pointer">
              <div className="w-full h-[500px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-3xl flex items-center justify-center overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:translate-y-[-8px] group-hover:border-[rgba(255,255,255,0.2)] group-hover:shadow-[0_16px_64px_rgba(79,127,255,0.2)]">
                <div className="text-center">
                  <div className="text-6xl mb-4 text-[#667eea]">🎥</div>
                  <div className="text-2xl font-medium text-white/80">Interactive video demo</div>
                  <div className="mt-2 text-sm text-white/60">Hover to preview</div>
                </div>
                
                {/* Ambient Light Effect */}
                <div className="absolute inset-0 bg-gradient-radial from-[#4F7FFF]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-[120px] px-10 relative" style={{ background: 'rgba(10, 22, 40, 0.5)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[64px] font-extrabold mb-6 leading-[1.1] text-white">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-[700px] mx-auto leading-[1.6]">
              Three simple steps to smarter streaming
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {/* Step 1: Analyze */}
            <div className="text-center group cursor-pointer transform perspective-1000 hover:rotate-y-2 transition-all duration-300">
              <div className="w-24 h-24 bg-white/[0.08] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-300 group-hover:border-[#667eea]/50 group-hover:scale-110 group-hover:bg-white/[0.12] shadow-lg group-hover:shadow-2xl">
                <svg className="w-12 h-12 text-[#4F7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Analyze</h3>
              <p className="text-lg text-white/70 leading-[1.6]">
                Advanced neural networks detect human visual attention patterns in each frame
              </p>
            </div>

            {/* Step 2: Optimize */}
            <div className="text-center group cursor-pointer transform perspective-1000 hover:rotate-y-2 transition-all duration-300">
              <div className="w-24 h-24 bg-white/[0.08] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-300 group-hover:border-[#667eea]/50 group-hover:scale-110 group-hover:bg-white/[0.12] shadow-lg group-hover:shadow-2xl">
                <svg className="w-12 h-12 text-[#4F7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Optimize</h3>
              <p className="text-lg text-white/70 leading-[1.6]">
                Intelligently reduce detail in peripheral areas while preserving quality in focus regions
              </p>
            </div>

            {/* Step 3: Deliver */}
            <div className="text-center group cursor-pointer transform perspective-1000 hover:rotate-y-2 transition-all duration-300">
              <div className="w-24 h-24 bg-white/[0.08] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-300 group-hover:border-[#667eea]/50 group-hover:scale-110 group-hover:bg-white/[0.12] shadow-lg group-hover:shadow-2xl">
                <svg className="w-12 h-12 text-[#4F7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Deliver</h3>
              <p className="text-lg text-white/70 leading-[1.6]">
                Stream crystal-clear content while saving up to 50% bandwidth with zero perceived quality loss
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="demo" className="py-[120px] px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[64px] font-extrabold mb-6 leading-[1.1] text-white">
              See the Difference
            </h2>
            <p className="text-xl text-white/70 max-w-[700px] mx-auto leading-[1.6]">
              Visual quality preserved. Data consumption reduced.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Original */}
            <div className="group cursor-pointer">
              <div className="w-full h-[400px] border-2 border-white/10 rounded-3xl mb-8 flex items-center justify-center bg-white/[0.03] backdrop-blur-xl transition-all duration-300 group-hover:border-white/20 group-hover:translate-y-[-4px] group-hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <div className="font-medium text-2xl text-white/50">Original Video</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Original</h3>
              <p className="text-lg text-white/70 leading-[1.6]">
                Full resolution everywhere • Full data usage • 2.4 MB file size
              </p>
            </div>

            {/* Optimized */}
            <div className="group cursor-pointer">
              <div className="w-full h-[400px] border-2 border-[#4F7FFF]/50 rounded-3xl mb-8 flex items-center justify-center bg-white/[0.03] backdrop-blur-xl transition-all duration-300 group-hover:border-[#4F7FFF] group-hover:translate-y-[-4px] group-hover:shadow-[0_16px_64px_rgba(79,127,255,0.3)]">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <div className="font-medium text-2xl bg-gradient-to-r from-[#4F7FFF] to-[#667eea] bg-clip-text text-transparent">Optimized with Salient Labs</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Optimized</h3>
              <p className="text-lg text-white/70 leading-[1.6]">
                Full resolution where it matters • 50% data savings • 1.2 MB file size
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-[120px] px-10" style={{ background: 'rgba(10, 22, 40, 0.5)' }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-[64px] font-extrabold mb-6 leading-[1.1] text-white">
            Powered by Advanced Technology
          </h2>
          <p className="text-xl text-white/70 mb-16 max-w-[600px] mx-auto leading-[1.6]">
            Built on cutting-edge AI and GPU-accelerated infrastructure
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-16">
            <div className="text-4xl font-bold text-[#4F7FFF] transition-all duration-300 hover:scale-125 cursor-pointer">Baseten</div>
            <div className="text-4xl font-bold text-[#4F7FFF] transition-all duration-300 hover:scale-125 cursor-pointer">AWS</div>
            <div className="text-4xl font-bold text-[#4F7FFF] transition-all duration-300 hover:scale-125 cursor-pointer">OpenGL</div>
            <div className="text-4xl font-bold text-[#4F7FFF] transition-all duration-300 hover:scale-125 cursor-pointer">FFmpeg</div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-32 px-10 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto text-center">
          <h3 className="text-[56px] font-extrabold mb-8 leading-[1.1] text-white max-w-[900px] mx-auto">
            Experience the future of streaming optimization.
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href="/upload"
              className="px-10 py-[18px] bg-[#4F7FFF] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#667eea] hover:scale-105 active:scale-98 text-base shadow-[0_8px_32px_rgba(79,127,255,0.3)]"
            >
              Upload Video
            </Link>
            <Link 
              href="/demo"
              className="px-10 py-[18px] border-2 border-white/30 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105 active:scale-98 text-base"
            >
              View Demo
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-lg">
            <Link href="/about" className="text-white/70 hover:text-white transition-colors duration-300">
              About
            </Link>
            <Link href="#team" className="text-white/70 hover:text-white transition-colors duration-300">
              Team
            </Link>
            <Link href="https://github.com" className="text-white/70 hover:text-white transition-colors duration-300">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
