import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E4E] to-[#002E2E]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#004E4E]/80 backdrop-blur-xl border-b border-[#003333] z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[#F5F5F5]">Salient</Link>
            <Link href="/" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-40 pb-32 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-white mb-8">
              About Salient
            </h1>
            <p className="text-2xl text-[#a3a3a3] font-light max-w-4xl mx-auto leading-relaxed">
              We&apos;re building the future of intelligent video streaming through AI-driven saliency detection and optimization.
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-8">Our Mission</h2>
                <p className="text-xl text-[#a3a3a3] leading-relaxed mb-8">
                  At Salient, we believe that video streaming can be both high-quality and bandwidth-efficient. 
                  Our AI-powered platform uses advanced saliency detection to intelligently optimize video content, 
                  preserving visual quality where it matters most while dramatically reducing data usage.
                </p>
                <p className="text-xl text-[#a3a3a3] leading-relaxed">
                  We&apos;re solving the fundamental challenge of modern video streaming: delivering crystal-clear 
                  content to users without overwhelming their bandwidth or data plans.
                </p>
              </div>
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-12">
                <div className="text-center">
                  <div className="text-6xl mb-6">🎯</div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Smart Optimization</h3>
                  <p className="text-[#a3a3a3] text-lg">
                    Our AI identifies the most important visual elements in each frame, 
                    ensuring viewers never miss what matters.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-8">The Technology</h2>
              <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
                Built on cutting-edge computer vision and machine learning research, 
                Salient represents the next generation of video optimization.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] border border-[#262626] rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Neural Networks</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  Advanced deep learning models trained on millions of video frames to understand human visual attention patterns.
                </p>
              </div>

              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] border border-[#262626] rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Real-time Processing</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  GPU-accelerated inference pipeline that processes video content in real-time without compromising quality.
                </p>
              </div>

              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] border border-[#262626] rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Adaptive Compression</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  Intelligent compression algorithms that adapt to content type, preserving quality in focus areas while optimizing elsewhere.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-8">Meet the Team</h2>
              <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
                A diverse group of engineers, researchers, and visionaries working together 
                to revolutionize how we experience video content.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Team Member 1 */}
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center group hover:border-[#3b82f6] transition-all duration-200">
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image src="/kshitij.jpeg" alt="Kshitij Kochhar" width={96} height={96} className="object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Kshitij Kochhar</h3>
                <p className="text-[#3b82f6] font-medium mb-4">CEO & Co-founder</p>
                <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">
                  Computer vision researcher with 8+ years in AI. Former Google DeepMind engineer.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center group hover:border-[#3b82f6] transition-all duration-200">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image src="/anuraag.jpeg" alt="Anuraag Pandhi" width={96} height={96} className="object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Anuraag Pandhi</h3>
                <p className="text-[#3b82f6] font-medium mb-4">Worker #1</p>
                <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">
                  Full-stack engineer and ML infrastructure expert. Previously at Netflix and AWS.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center group hover:border-[#3b82f6] transition-all duration-200">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image src="/taimur.jpeg" alt="Taimur Shaikh" width={96} height={96} className="object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Taimur Shaikh</h3>
                <p className="text-[#3b82f6] font-medium mb-4">Worker #2</p>
                <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">
                  PhD in Computer Science, specializing in video processing and neural network optimization.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Team Member 4 */}
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center group hover:border-[#3b82f6] transition-all duration-200">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image src="/devyani.jpeg" alt="Devyani Vij" width={96} height={96} className="object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Devyani Vij</h3>
                <p className="text-[#3b82f6] font-medium mb-4">Worker #3</p>
                <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">
                  UX/UI designer with expertise in AI product interfaces. Former design lead at Figma.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-[#a3a3a3] hover:text-[#3b82f6] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-8">Our Values</h2>
              <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
                The principles that guide everything we do at Salient.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
                <div className="text-4xl mb-6">🔬</div>
                <h3 className="text-xl font-semibold text-white mb-4">Innovation First</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  We push the boundaries of what&apos;s possible with AI and computer vision, 
                  always seeking better solutions to complex problems.
                </p>
              </div>

              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
                <div className="text-4xl mb-6">🌍</div>
                <h3 className="text-xl font-semibold text-white mb-4">Global Impact</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  We believe technology should make the world more accessible, 
                  reducing barriers to high-quality video content for everyone.
                </p>
              </div>

              <div className="bg-[#111111] border border-[#262626] rounded-lg p-8 text-center">
                <div className="text-4xl mb-6">🤝</div>
                <h3 className="text-xl font-semibold text-white mb-4">Collaboration</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  We work closely with our users and partners to build solutions 
                  that truly meet their needs and exceed their expectations.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-16">
              <h2 className="text-4xl font-bold text-white mb-8">
                Ready to experience the future of video streaming?
              </h2>
              <p className="text-xl text-[#a3a3a3] mb-12 max-w-2xl mx-auto">
                Join thousands of users who are already optimizing their video content with Salient.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  href="/upload"
                  className="px-10 py-5 bg-[#3b82f6] text-white rounded-lg font-semibold hover:bg-[#2563eb] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Try Salient Now
                </Link>
                <Link 
                  href="/demo"
                  className="px-10 py-5 border border-[#404040] text-white rounded-lg font-semibold hover:bg-[#1a1a1a] hover:border-[#3b82f6] transition-all duration-200"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
