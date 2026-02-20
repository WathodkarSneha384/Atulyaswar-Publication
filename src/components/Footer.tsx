export default function Footer() {
  return (
    <footer className="py-16 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-[var(--font-playfair)] text-lg font-bold">
                A
              </div>
              <span className="font-[var(--font-playfair)] text-xl font-bold text-[var(--foreground)]">
                Atulyaswar
              </span>
            </div>
            <p className="font-[var(--font-lora)] text-sm text-[var(--muted)] leading-relaxed">
              Where extraordinary stories find their voice. Dedicated to
              literary excellence since 2020.
            </p>
          </div>

          <div>
            <h4 className="font-[var(--font-playfair)] font-bold text-[var(--foreground)] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Home", "About", "Books", "Services"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="font-[var(--font-lora)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-[var(--font-playfair)] font-bold text-[var(--foreground)] mb-4">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                "Book Publishing",
                "Editorial Services",
                "Cover Design",
                "Digital Publishing",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="font-[var(--font-lora)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-[var(--font-playfair)] font-bold text-[var(--foreground)] mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {["Twitter", "Instagram", "LinkedIn", "Facebook"].map(
                (social) => (
                  <li key={social}>
                    <a
                      href="#"
                      className="font-[var(--font-lora)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                    >
                      {social}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-[var(--font-lora)] text-sm text-[var(--muted)]">
            &copy; {new Date().getFullYear()} Atulyaswar Publication. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="font-[var(--font-lora)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="font-[var(--font-lora)] text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
