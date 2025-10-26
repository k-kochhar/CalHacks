import Link from "next/link";
import Image from "next/image";

export default function TeamPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--background) 0%, var(--background-end) 100%)`,
      }}
    >
      {/* Optional subtle noise / bg blobs */}
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
              Meet the Team
            </h1>
            <p
              className="text-2xl font-light max-w-4xl mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              We make
              streaming actually efficient.
            </p>
          </div>

          {/* Team Section */}
          <section className="mb-24">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Kshitij */}
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
                  CS @ UMD
                </p>
              </div>

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
                  Financial Engineering @ Columbia
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
                  CS @ Columbia
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
                  Financial Engineering @ Columbia
                </p>
              </div>
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
                See perceptual compression in action.
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

