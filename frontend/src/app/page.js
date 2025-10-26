import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E4E] to-[#002E2E]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#004E4E]/80 backdrop-blur-xl border-b border-[#003333] z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[#F5F5F5]">Salient</div>
            <div className="hidden md:flex space-x-10">
              <Link href="#how-it-works" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors font-medium">How it works</Link>
              <Link href="#demo" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors font-medium">Demo</Link>
              <Link href="/about" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors font-medium">About</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-7xl font-bold text-[#F5F5F5] mb-8 leading-[1.1] tracking-tight">
            Stream smarter,<br />
            <span className="text-[#00FFFF]">not heavier.</span>
          </h1>
          <p className="text-2xl text-[#E8E8E8] mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            AI-driven saliency keeps your focus areas crystal clear while cutting data waste.
          </p>
          
          {/* Background Animation Placeholder */}
          <div className="mb-16 relative">
            <div className="w-full h-80 bg-gradient-to-br from-[#006666] to-[#004E4E] border border-[#003333] rounded-lg flex items-center justify-center shadow-2xl">
              <div className="text-[#00FFFF] text-xl font-medium">Video transitioning from blurred → sharp regions</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/upload"
              className="px-10 py-5 bg-[#00FFFF] text-[#002E2E] rounded-lg font-semibold hover:bg-[#00E6E6] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-[#00FFFF]/25"
            >
              Try Salient
            </Link>
            <Link 
              href="/demo"
              className="px-10 py-5 border border-[#005555] text-[#F5F5F5] rounded-lg font-semibold hover:bg-[#006666] hover:border-[#00FFFF] transition-all duration-200"
            >
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-8 bg-[#004E4E]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-[#F5F5F5] mb-20">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1: Analyze */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-[#006666] border border-[#003333] rounded-lg flex items-center justify-center mx-auto mb-8 group-hover:border-[#00FFFF] group-hover:shadow-[#00FFFF]/20 transition-all duration-200">
                <svg className="w-10 h-10 text-[#00FFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#F5F5F5] mb-4">Analyze</h3>
              <p className="text-[#E8E8E8] text-lg">AI detects focus areas</p>
            </div>

            {/* Step 2: Optimize */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-[#006666] border border-[#003333] rounded-lg flex items-center justify-center mx-auto mb-8 group-hover:border-[#00FFFF] group-hover:shadow-[#00FFFF]/20 transition-all duration-200">
                <svg className="w-10 h-10 text-[#00FFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#F5F5F5] mb-4">Optimize</h3>
              <p className="text-[#E8E8E8] text-lg">Reduce detail elsewhere</p>
            </div>

            {/* Step 3: Deliver */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-[#006666] border border-[#003333] rounded-lg flex items-center justify-center mx-auto mb-8 group-hover:border-[#00FFFF] group-hover:shadow-[#00FFFF]/20 transition-all duration-200">
                <svg className="w-10 h-10 text-[#00FFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#F5F5F5] mb-4">Deliver</h3>
              <p className="text-[#E8E8E8] text-lg">Preserve quality, save bandwidth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-[#F5F5F5] mb-20">
            See the Difference
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Original */}
            <div className="text-center">
              <div className="w-full h-80 bg-gradient-to-br from-[#006666] to-[#004E4E] border border-[#003333] rounded-lg mb-6 flex items-center justify-center">
                <div className="text-[#B8B8B8] font-medium text-lg">Original Video</div>
              </div>
              <h3 className="text-xl font-semibold text-[#F5F5F5] mb-3">Original</h3>
              <p className="text-[#E8E8E8] text-lg">Full resolution, full data usage</p>
            </div>

            {/* Optimized */}
            <div className="text-center">
              <div className="w-full h-80 bg-gradient-to-br from-[#006666] to-[#004E4E] border border-[#00FFFF] rounded-lg mb-6 flex items-center justify-center shadow-[#00FFFF]/20">
                <div className="text-[#00FFFF] font-medium text-lg">Optimized with Salient</div>
              </div>
              <h3 className="text-xl font-semibold text-[#F5F5F5] mb-3">Optimized</h3>
              <p className="text-[#E8E8E8] text-lg">Same resolution. Less data. Smarter streaming.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-32 px-8 bg-[#004E4E]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-[#F5F5F5] mb-16">
            Powered by Advanced Technology
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-16 mb-12">
            <div className="text-3xl font-bold text-[#00FFFF]">Baseten</div>
            <div className="text-3xl font-bold text-[#00FFFF]">AWS</div>
            <div className="text-3xl font-bold text-[#00FFFF]">OpenGL</div>
            <div className="text-3xl font-bold text-[#00FFFF]">FFmpeg</div>
          </div>
          <p className="text-[#E8E8E8] text-xl">
            Powered by advanced inference and GPU-accelerated rendering.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 bg-[#002E2E] border-t border-[#003333]">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-[#F5F5F5] mb-12">
            Experience the future of streaming optimization.
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href="/upload"
              className="px-10 py-5 bg-[#00FFFF] text-[#002E2E] rounded-lg font-semibold hover:bg-[#00E6E6] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-[#00FFFF]/25"
            >
              Upload Video
            </Link>
            <Link 
              href="/demo"
              className="px-10 py-5 border border-[#005555] text-[#F5F5F5] rounded-lg font-semibold hover:bg-[#006666] hover:border-[#00FFFF] transition-all duration-200"
            >
              View Demo
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-lg">
            <Link href="/about" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors">About</Link>
            <Link href="#team" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors">Team</Link>
            <Link href="https://github.com" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
