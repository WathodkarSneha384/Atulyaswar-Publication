const books = [
  {
    title: "The Whispered Dawn",
    author: "Priya Sharma",
    genre: "Literary Fiction",
    description:
      "A sweeping saga of love, loss, and redemption set against the backdrop of a changing India.",
    color: "from-amber-100 to-orange-200",
  },
  {
    title: "Echoes of Silence",
    author: "Aarav Mehta",
    genre: "Poetry Collection",
    description:
      "A profound collection of poems that explore the spaces between words and the silence that speaks volumes.",
    color: "from-rose-100 to-pink-200",
  },
  {
    title: "Beyond the Horizon",
    author: "Meera Kulkarni",
    genre: "Historical Fiction",
    description:
      "A riveting tale of courage and discovery following explorers through uncharted territories of the mind.",
    color: "from-blue-100 to-indigo-200",
  },
  {
    title: "The Garden of Words",
    author: "Rohan Desai",
    genre: "Short Stories",
    description:
      "Twelve interconnected stories that bloom like flowers in a garden, each revealing a different facet of human nature.",
    color: "from-emerald-100 to-teal-200",
  },
];

export default function FeaturedBooks() {
  return (
    <section id="books" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-[var(--font-lora)] text-[var(--primary)] text-sm uppercase tracking-[0.3em] mb-4">
            Our Collection
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            Featured <span className="text-[var(--primary)]">Books</span>
          </h2>
          <p className="font-[var(--font-lora)] text-[var(--muted)] max-w-2xl mx-auto">
            Discover our curated selection of extraordinary works that
            captivate, inspire, and transform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div
              key={book.title}
              className="group cursor-pointer"
            >
              <div
                className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${book.color} dark:opacity-80 flex items-end p-6 mb-4 transition-transform duration-300 group-hover:-translate-y-2 shadow-md group-hover:shadow-xl`}
              >
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg p-4 w-full">
                  <p className="text-xs font-[var(--font-lora)] text-[var(--primary)] uppercase tracking-wider mb-1">
                    {book.genre}
                  </p>
                  <h3 className="font-[var(--font-playfair)] text-lg font-bold text-[var(--foreground)]">
                    {book.title}
                  </h3>
                </div>
              </div>
              <h3 className="font-[var(--font-playfair)] text-lg font-semibold text-[var(--foreground)] mb-1">
                {book.title}
              </h3>
              <p className="font-[var(--font-lora)] text-sm text-[var(--primary)] mb-2">
                by {book.author}
              </p>
              <p className="font-[var(--font-lora)] text-sm text-[var(--muted)] leading-relaxed">
                {book.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
