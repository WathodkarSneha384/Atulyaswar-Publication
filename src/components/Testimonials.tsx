const testimonials = [
  {
    quote:
      "Atulyaswar Publication transformed my manuscript into a work of art. Their editorial team is nothing short of brilliant.",
    name: "Ananya Iyer",
    role: "Author of 'The Crimson Thread'",
  },
  {
    quote:
      "Working with Atulyaswar was a dream. They understood my vision and elevated it beyond what I thought possible.",
    name: "Vikram Joshi",
    role: "Poet & Essayist",
  },
  {
    quote:
      "From the first meeting to the book launch, every step was handled with care, professionalism, and genuine passion for literature.",
    name: "Neha Patil",
    role: "Debut Novelist",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-[var(--font-lora)] text-[var(--primary)] text-sm uppercase tracking-[0.3em] mb-4">
            What Authors Say
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            Author <span className="text-[var(--primary)]">Testimonials</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-8 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:shadow-lg transition-all duration-300"
            >
              <svg
                className="w-10 h-10 text-[var(--primary)]/30 mb-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
              <p className="font-[var(--font-lora)] text-[var(--foreground)] leading-relaxed mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <p className="font-[var(--font-playfair)] font-bold text-[var(--foreground)]">
                  {testimonial.name}
                </p>
                <p className="font-[var(--font-lora)] text-sm text-[var(--muted)]">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
