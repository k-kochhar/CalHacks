'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [isOriginal, setIsOriginal] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#111111]/80 backdrop-blur-xl border-b border-[#262626] z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">Salient</Link>
            <Link href="/" className="text-[#a3a3a3] hover:text-white transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-40 pb-32 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Experience Salient in Action
            </h1>
            <p className="text-xl text-[#a3a3a3] font-light">
              Toggle between original and optimized versions to see the difference
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-12">
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-1">
              <button
                onClick={() => setIsOriginal(true)}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  isOriginal 
                    ? 'bg-[#3b82f6] text-white shadow-lg' 
                    : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setIsOriginal(false)}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  !isOriginal 
                    ? 'bg-[#3b82f6] text-white shadow-lg' 
                    : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                Optimized
              </button>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="bg-[#111111] border border-[#262626] rounded-lg overflow-hidden mb-12">
            <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#111111] flex items-center justify-center">
              {isOriginal ? (
                <div className="text-center">
                  <div className="text-8xl mb-6">🎬</div>
                  <div className="text-3xl font-semibold text-white mb-4">Original Video</div>
                  <div className="text-[#a3a3a3] text-xl">1080p • 2.4 MB • Full quality</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-8xl mb-6">⚡</div>
                  <div className="text-3xl font-semibold text-[#3b82f6] mb-4">Optimized with Salient</div>
                  <div className="text-[#a3a3a3] text-xl">1080p • 1.2 MB • 50% smaller</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
              <div className="text-4xl font-bold text-[#3b82f6] mb-3">1080p</div>
              <div className="text-[#a3a3a3] text-lg">Resolution</div>
            </div>
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
              <div className="text-4xl font-bold text-[#3b82f6] mb-3">
                {isOriginal ? '2.4 MB' : '1.2 MB'}
              </div>
              <div className="text-[#a3a3a3] text-lg">File Size</div>
            </div>
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
              <div className="text-4xl font-bold text-[#3b82f6] mb-3">
                {isOriginal ? '100%' : '50%'}
              </div>
              <div className="text-[#a3a3a3] text-lg">Compression Ratio</div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-10">
                <h3 className="text-3xl font-bold text-white mb-8">
                  How Salient Works
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#3b82f6] font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">AI Analysis</h4>
                      <p className="text-[#a3a3a3] text-lg leading-relaxed">Our advanced neural network analyzes each frame to identify the most important visual elements that viewers focus on.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#3b82f6] font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Smart Optimization</h4>
                      <p className="text-[#a3a3a3] text-lg leading-relaxed">The system intelligently reduces detail in less important areas while preserving full quality in focus regions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#3b82f6] font-bold text-lg">3</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Bandwidth Savings</h4>
                      <p className="text-[#a3a3a3] text-lg leading-relaxed">Result: significantly smaller file sizes with no perceptible quality loss in the areas that matter most.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Related Clips */}
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8">
                <h4 className="text-xl font-semibold text-white mb-6">Related Examples</h4>
                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="w-20 h-16 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#262626] rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📹</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-white">Sports Highlights</div>
                      <div className="text-[#a3a3a3]">60% compression</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-20 h-16 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#262626] rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-white">Conference Talk</div>
                      <div className="text-[#a3a3a3]">45% compression</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-20 h-16 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#262626] rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-white">Product Demo</div>
                      <div className="text-[#a3a3a3]">55% compression</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8">
                <h4 className="text-xl font-semibold text-white mb-6">Powered by</h4>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">Baseten</span>
                    <span className="text-[#3b82f6] font-semibold">Inference</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">AWS</span>
                    <span className="text-[#3b82f6] font-semibold">GPU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">OpenGL</span>
                    <span className="text-[#3b82f6] font-semibold">Rendering</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">FFmpeg</span>
                    <span className="text-[#3b82f6] font-semibold">Encoding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/upload"
                className="px-10 py-5 bg-[#3b82f6] text-white rounded-lg font-semibold hover:bg-[#2563eb] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Try with Your Video
              </Link>
              <Link 
                href="/"
                className="px-10 py-5 border border-[#404040] text-white rounded-lg font-semibold hover:bg-[#1a1a1a] hover:border-[#3b82f6] transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
