export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-light)]/30 via-transparent to-[var(--primary)]/10" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <p className="font-[var(--font-lora)] text-[var(--primary)] text-sm uppercase tracking-[0.3em] mb-6 animate-fade-in">
          Welcome to
        </p>
        <h1 className="font-[var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-[var(--foreground)]">
          Atulyaswar
          <br />
          <span className="text-[var(--primary)]">Publication</span>
        </h1>
        <p className="font-[var(--font-lora)] text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-12 leading-relaxed">
          Where extraordinary stories find their voice. We bring timeless
          literature and powerful narratives to readers who seek depth,
          beauty, and meaning in every page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#books"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--primary)] text-white font-[var(--font-lora)] text-base rounded-lg hover:bg-[var(--primary-light)] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Explore Our Books
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-[var(--primary)] text-[var(--primary)] font-[var(--font-lora)] text-base rounded-lg hover:bg-[var(--primary)] hover:text-white transition-all duration-300"
          >
            Our Story
          </a>
        </div>

        <div className="mt-20 flex justify-center gap-16 text-center">
          <div>
            <p className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--primary)]">
              500+
            </p>
            <p className="font-[var(--font-lora)] text-sm text-[var(--muted)] mt-1">
              Books Published
            </p>
          </div>
          <div>
            <p className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--primary)]">
              200+
            </p>
            <p className="font-[var(--font-lora)] text-sm text-[var(--muted)] mt-1">
              Authors
            </p>
          </div>
          <div>
            <p className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--primary)]">
              50+
            </p>
            <p className="font-[var(--font-lora)] text-sm text-[var(--muted)] mt-1">
              Awards Won
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[var(--muted)]"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
