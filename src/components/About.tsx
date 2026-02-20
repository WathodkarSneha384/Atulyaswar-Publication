export default function About() {
  return (
    <section id="about" className="py-24 bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-[var(--font-lora)] text-[var(--primary)] text-sm uppercase tracking-[0.3em] mb-4">
              Our Story
            </p>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-8 leading-tight">
              Crafting Literary
              <br />
              <span className="text-[var(--primary)]">Excellence</span>
            </h2>
            <div className="space-y-6 font-[var(--font-lora)] text-[var(--muted)] leading-relaxed">
              <p>
                Atulyaswar Publication was born from a deep passion for
                storytelling and the belief that every voice deserves to be
                heard. We are more than a publishing house — we are curators
                of culture, guardians of narrative, and champions of
                literary art.
              </p>
              <p>
                Our mission is to discover, nurture, and amplify exceptional
                voices from diverse backgrounds. From debut authors to
                seasoned writers, we provide the editorial excellence,
                creative vision, and global reach to transform manuscripts
                into masterpieces.
              </p>
              <p>
                Every book we publish is a testament to the power of words
                — to inspire, to challenge, and to illuminate the human
                experience.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/20 flex items-center justify-center border border-[var(--border)]">
              <div className="text-center p-8">
                <svg
                  className="w-24 h-24 mx-auto mb-6 text-[var(--primary)]/40"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--foreground)] mb-2">
                  Since 2020
                </p>
                <p className="font-[var(--font-lora)] text-[var(--muted)]">
                  Dedicated to literary excellence
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
