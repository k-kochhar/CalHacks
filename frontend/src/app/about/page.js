import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--background) 0%, var(--background-end) 100%)`,
      }}
    >
      {/* Optional subtle noise / bg blobs (match home if you want) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      {/* NAV */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-all duration-500"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Salient Labs
          </Link>
          <Link
            href="/"
            className="font-medium transition-colors duration-300"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-40 pb-32 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1
              className="text-6xl font-bold mb-8"
              style={{ color: "var(--text-primary)" }}
            >
              About Salient Labs
            </h1>
            <p
              className="text-2xl font-light max-w-4xl mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              We&apos;re building the future of intelligent video streaming
              through perceptual compression and adaptive delivery.
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2
                  className="text-4xl font-bold mb-8"
                  style={{ color: "var(--text-primary)" }}
                >
                  Our Mission
                </h2>
                <p
                  className="text-xl leading-relaxed mb-8"
                  style={{ color: "var(--text-secondary)" }}
                >
                  At Salient Labs, we believe video can be both high-quality and
                  bandwidth-efficient. Our system preserves sharp detail in the
                  areas people actually look at — and reduces waste everywhere
                  else.
                </p>
                <p
                  className="text-xl leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  We&apos;re solving the core streaming problem: deliver more
                  clarity with less cost.
                </p>
              </div>

              <div
                className="rounded-lg p-12 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="text-center">
                  <div
                    className="text-6xl mb-6"
                    style={{ color: "var(--accent)" }}
                  >
                    🎯
                  </div>
                  <h3
                    className="text-2xl font-semibold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Adaptive Optimization
                  </h3>
                  <p
                    className="text-lg leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Our compression prioritizes what matters in every frame,
                    instead of treating all pixels the same.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold mb-8"
                style={{ color: "var(--text-primary)" }}
              >
                The Technology
              </h2>
              <p
                className="text-xl max-w-3xl mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                This is perceptual compression. High fidelity in focus areas.
                Efficient everywhere else. Built for real-time delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div
                className="rounded-lg p-8 text-center transition-all duration-200"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: "var(--accent)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Perceptual Modeling
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  We model which regions of a frame people actually pay
                  attention to — and spend bits there first.
                </p>
              </div>

              {/* Card 2 */}
              <div
                className="rounded-lg p-8 text-center transition-all duration-200"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: "var(--accent)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Real-time Pipeline
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Runs alongside live video with minimal overhead. Built for
                  streaming, calls, and broadcast.
                </p>
              </div>

              {/* Card 3 */}
              <div
                className="rounded-lg p-8 text-center transition-all duration-200"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: "var(--accent)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Adaptive Compression
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Preserve the center of attention. Compress the rest. Cut data
                  cost without tanking perceived quality.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-24" id="team">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold mb-8"
                style={{ color: "var(--text-primary)" }}
              >
                Meet the Team
              </h2>
              <p
                className="text-xl max-w-3xl mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Engineers, researchers, and product minds focused on making
                streaming actually efficient.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Example team card */}
              <div
                className="rounded-lg p-8 text-center group transition-all duration-200 hover:shadow-[0_16px_64px_rgba(79,127,255,0.3)]"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image
                    src="/kshitij.jpeg"
                    alt="Kshitij Kochhar"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <Link
                  href="https://www.linkedin.com/in/kkochhar04/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold mb-2 block transition-colors duration-200 hover:text-[var(--accent)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Kshitij Kochhar
                </Link>
                <p
                  className="font-medium mb-4"
                  style={{ color: "var(--accent)" }}
                >
                  CEO & Co-founder
                </p>
              </div>

              {/* Repeat same pattern for others */}
              {/* Anuraag */}
              <div
                className="rounded-lg p-8 text-center group transition-all duration-200 hover:shadow-[0_16px_64px_rgba(79,127,255,0.3)]"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image
                    src="/anuraag.jpeg"
                    alt="Anuraag Pandhi"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <Link
                  href="https://www.linkedin.com/in/anuraag-p/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold mb-2 block transition-colors duration-200 hover:text-[var(--accent)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Anuraag Pandhi
                </Link>
                <p
                  className="font-medium mb-4"
                  style={{ color: "var(--accent)" }}
                >
                  CPO & Co-founder
                </p>
              </div>

              {/* Taimur */}
              <div
                className="rounded-lg p-8 text-center group transition-all duration-200 hover:shadow-[0_16px_64px_rgba(79,127,255,0.3)]"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image
                    src="/taimur.jpeg"
                    alt="Taimur Shaikh"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <Link
                  href="https://www.linkedin.com/in/taimur-shaikh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold mb-2 block transition-colors duration-200 hover:text-[var(--accent)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Taimur Shaikh
                </Link>
                <p
                  className="font-medium mb-4"
                  style={{ color: "var(--accent)" }}
                >
                  CTO & Co-founder
                </p>
              </div>

              {/* Devyani */}
              <div
                className="rounded-lg p-8 text-center group transition-all duration-200 hover:shadow-[0_16px_64px_rgba(79,127,255,0.3)]"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image
                    src="/devyani.jpeg"
                    alt="Devyani Vij"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <Link
                  href="https://www.linkedin.com/in/dvij/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold mb-2 block transition-colors duration-200 hover:text-[var(--accent)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Devyani Vij
                </Link>
                <p
                  className="font-medium mb-4"
                  style={{ color: "var(--accent)" }}
                >
                  CFO & Co-founder
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold mb-8"
                style={{ color: "var(--text-primary)" }}
              >
                Our Values
              </h2>
              <p
                className="text-xl max-w-3xl mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                The principles that guide how we build.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🔬",
                  title: "Precision",
                  body:
                    "We treat bandwidth like a resource, not a given. Efficiency is the product.",
                },
                {
                  icon: "🌍",
                  title: "Access",
                  body:
                    "High-quality video shouldn’t require high-end internet. We lower that bar.",
                },
                {
                  icon: "🤝",
                  title: "Partnership",
                  body:
                    "We build with creators, platforms, and infra teams — not just for them.",
                },
              ].map((val, i) => (
                <div
                  key={i}
                  className="rounded-lg p-8 text-center"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    className="text-4xl mb-6"
                    style={{ color: "var(--accent)" }}
                  >
                    {val.icon}
                  </div>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {val.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {val.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div
              className="rounded-lg p-16 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                backdropFilter: "blur(16px)",
              }}
            >
              <h2
                className="text-4xl font-bold mb-8"
                style={{ color: "var(--text-primary)" }}
              >
                Ready to see perceptual compression in action?
              </h2>
              <p
                className="text-xl mb-12 max-w-2xl mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Try it on your own footage. Watch your bandwidth bill drop.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/upload"
                  className="px-10 py-5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-primary)",
                    boxShadow:
                      "0 12px 48px rgba(79,127,255,0.5), 0 8px 32px rgba(0,0,0,0.6)",
                  }}
                >
                  Try Salient Labs Now
                </Link>
                <Link
                  href="/demo"
                  className="px-10 py-5 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
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