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
      {/* Background Gradient */}
      <div className="fixed inset-0 opacity-90" style={{
        background: `linear-gradient(135deg, var(--background) 0%, var(--background-end) 100%)`
      }} />
      

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-all duration-500" style={{
        backgroundColor: scrolled ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.03)",
        borderColor: "var(--border)"
      }}>
        <div className="max-w-[1200px] mx-auto px-16 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Salient Labs</div>
          <div className="hidden md:flex space-x-12">
            <Link href="#how-it-works" className="font-medium text-base hover:opacity-70 transition-all duration-300 hover:scale-105" style={{ color: "var(--text-primary)" }}>
              How it works
            </Link>
            <Link href="/upload" className="font-medium text-base hover:opacity-70 transition-all duration-300 hover:scale-105" style={{ color: "var(--text-primary)" }}>
              Upload Video
            </Link>
            <Link href="/about" className="font-medium text-base hover:opacity-70 transition-all duration-300 hover:scale-105" style={{ color: "var(--text-primary)" }}>
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-10 relative pt-32">
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight" style={{ color: "var(--text-primary)" }}>
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Sharper
            </span>{" "}where
            <br />
            <span style={{ color: "var(--text-primary)" }}>it Matters.</span>
          </h1>

          <p className="text-xl mb-16 max-w-[800px] mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Dynamic video compression that sees how you do.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link 
              href="/upload"
              className="px-10 py-4 rounded-xl font-semibold transition-colors"
              style={{ 
                backgroundColor: "var(--accent)",
                color: "var(--text-primary)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--accent)";
              }}
            >
              Upload Video
            </Link>
            <Link 
              href="/demo"
              className="px-10 py-4 border-2 rounded-xl font-semibold transition-colors"
              style={{ 
                borderColor: "var(--border-light)",
                color: "var(--text-primary)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--surface)";
                e.target.style.borderColor = "var(--border)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "var(--border-light)";
              }}
            >
              Learn More
            </Link>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="w-full h-[400px] border rounded-3xl flex items-center justify-center" style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)"
            }}>
              <div className="text-center">
                <div className="text-6xl mb-4">🎥</div>
                <div className="text-2xl font-medium" style={{ color: "var(--text-secondary)" }}>Interactive video demo</div>
              </div>
            </div>
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
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-[#4F7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Analyze</h3>
              <p className="text-lg text-white/70 leading-relaxed">
                Advanced neural networks detect human visual attention patterns in each frame
              </p>
            </div>

            {/* Step 2: Optimize */}
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-[#4F7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Optimize</h3>
              <p className="text-lg text-white/70 leading-relaxed">
                Intelligently reduce detail in peripheral areas while preserving quality in focus regions
              </p>
            </div>

            {/* Step 3: Deliver */}
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-[#4F7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Deliver</h3>
              <p className="text-lg text-white/70 leading-relaxed">
                Stream crystal-clear content while saving up to 50% bandwidth with zero perceived quality loss
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="demo" className="py-[120px] px-10 relative z-10">
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
            <div>
              <div className="w-full h-[400px] border-2 border-white/10 rounded-3xl mb-8 flex items-center justify-center bg-white/5">
                <div className="text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <div className="font-medium text-2xl text-white/50">Original Video</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Original</h3>
              <p className="text-lg text-white/70 leading-relaxed">
                Full resolution everywhere • Full data usage • 2.4 MB file size
              </p>
            </div>

            {/* Optimized */}
            <div>
              <div className="w-full h-[400px] border-2 border-[#4F7FFF]/50 rounded-3xl mb-8 flex items-center justify-center bg-white/5">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <div className="font-medium text-2xl bg-gradient-to-r from-[#4F7FFF] to-[#667eea] bg-clip-text text-transparent">Optimized with Salient Labs</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Optimized</h3>
              <p className="text-lg text-white/70 leading-relaxed">
                Full resolution where it matters • 50% data savings • 1.2 MB file size
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-[120px] px-10 relative z-10" style={{ background: 'rgba(10, 22, 40, 0.5)' }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-[64px] font-extrabold mb-6 leading-[1.1] text-white">
            Powered by Advanced Technology
          </h2>
          <p className="text-xl text-white/70 mb-16 max-w-[600px] mx-auto leading-[1.6]">
            Built on cutting-edge AI and GPU-accelerated infrastructure
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-16">
            <div className="text-4xl font-bold text-[#4F7FFF]">Baseten</div>
            <div className="text-4xl font-bold text-[#4F7FFF]">AWS</div>
            <div className="text-4xl font-bold text-[#4F7FFF]">OpenGL</div>
            <div className="text-4xl font-bold text-[#4F7FFF]">FFmpeg</div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-32 px-10 border-t relative z-10 border-white/10">
        <div className="max-w-[1200px] mx-auto text-center">
          <h3 className="text-[56px] font-extrabold mb-8 leading-[1.1] text-white max-w-[900px] mx-auto">
            Experience the future of streaming optimization.
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href="/upload"
              className="px-10 py-4 bg-[#4F7FFF] text-white rounded-xl font-semibold hover:bg-[#667eea] transition-colors"
            >
              Upload Video
            </Link>
            <Link 
              href="/demo"
              className="px-10 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/50 transition-colors"
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
