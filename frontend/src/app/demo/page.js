'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [isOriginal, setIsOriginal] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-surface/80 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-secondary">Salient Labs</Link>
            <Link href="/" className="text-secondary hover:text-accent transition-colors font-medium">
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
            <h1 className="text-5xl font-bold text-secondary mb-6">
              Experience Salient Labs in Action
            </h1>
            <p className="text-xl text-secondary font-light">
              Toggle between original and optimized versions to see the difference
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-12">
            <div className="bg-surface border border-border rounded-lg p-1">
              <button
                onClick={() => setIsOriginal(true)}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  isOriginal 
                    ? 'bg-accent text-bg shadow-lg shadow-accent/25' 
                    : 'text-secondary hover:text-accent'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setIsOriginal(false)}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  !isOriginal 
                    ? 'bg-accent text-bg shadow-lg shadow-accent/25' 
                    : 'text-secondary hover:text-accent'
                }`}
              >
                Optimized
              </button>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden mb-12 shadow-lg">
            <div className="aspect-video bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center">
              {isOriginal ? (
                <div className="text-center">
                  <div className="text-8xl mb-6">🎬</div>
                  <div className="text-3xl font-semibold text-secondary mb-4">Original Video</div>
                  <div className="text-secondary text-xl">1080p • 2.4 MB • Full quality</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-8xl mb-6">⚡</div>
                  <div className="text-3xl font-semibold text-accent mb-4">Optimized with Salient Labs</div>
                  <div className="text-secondary text-xl">1080p • 1.2 MB • 50% smaller</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-surface border border-border rounded-lg p-8 text-center shadow-lg">
              <div className="text-4xl font-bold text-accent mb-3">1080p</div>
              <div className="text-secondary text-lg">Resolution</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-8 text-center shadow-lg">
              <div className="text-4xl font-bold text-accent mb-3">
                {isOriginal ? '2.4 MB' : '1.2 MB'}
              </div>
              <div className="text-secondary text-lg">File Size</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-8 text-center shadow-lg">
              <div className="text-4xl font-bold text-accent mb-3">
                {isOriginal ? '100%' : '50%'}
              </div>
              <div className="text-secondary text-lg">Compression Ratio</div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-border rounded-lg p-10 shadow-lg">
                <h3 className="text-3xl font-bold text-secondary mb-8">
                  How Salient Labs Works
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-surface-elevated border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-secondary mb-3">AI Analysis</h4>
                      <p className="text-secondary text-lg leading-relaxed">Our advanced neural network analyzes each frame to identify the most important visual elements that viewers focus on.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-surface-elevated border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-secondary mb-3">Smart Optimization</h4>
                      <p className="text-secondary text-lg leading-relaxed">The system intelligently reduces detail in less important areas while preserving full quality in focus regions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-surface-elevated border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold text-lg">3</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-secondary mb-3">Bandwidth Savings</h4>
                      <p className="text-secondary text-lg leading-relaxed">Result: significantly smaller file sizes with no perceptible quality loss in the areas that matter most.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Related Clips */}
              <div className="bg-surface border border-border rounded-lg p-8 shadow-lg">
                <h4 className="text-xl font-semibold text-secondary mb-6">Related Examples</h4>
                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="w-20 h-16 bg-gradient-to-br from-surface-elevated to-surface border border-border rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📹</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-secondary">Sports Highlights</div>
                      <div className="text-secondary">60% compression</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-20 h-16 bg-gradient-to-br from-surface-elevated to-surface border border-border rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-secondary">Conference Talk</div>
                      <div className="text-secondary">45% compression</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-20 h-16 bg-gradient-to-br from-surface-elevated to-surface border border-border rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-secondary">Product Demo</div>
                      <div className="text-secondary">55% compression</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-surface border border-border rounded-lg p-8 shadow-lg">
                <h4 className="text-xl font-semibold text-secondary mb-6">Powered by</h4>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span className="text-secondary">Baseten</span>
                    <span className="text-accent font-semibold">Inference</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">AWS</span>
                    <span className="text-accent font-semibold">GPU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">OpenGL</span>
                    <span className="text-accent font-semibold">Rendering</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">FFmpeg</span>
                    <span className="text-accent font-semibold">Encoding</span>
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
                className="px-10 py-5 bg-accent text-bg rounded-lg font-semibold hover:bg-accent-hover transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 shadow-accent/25"
              >
                Try with Your Video
              </Link>
              <Link 
                href="/"
                className="px-10 py-5 border border-border-light text-secondary rounded-lg font-semibold hover:bg-surface transition-all duration-200"
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
