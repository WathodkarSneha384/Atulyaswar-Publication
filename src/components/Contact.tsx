"use client";

import { useState, type FormEvent } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-24 bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="font-[var(--font-lora)] text-[var(--primary)] text-sm uppercase tracking-[0.3em] mb-4">
              Get in Touch
            </p>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-8 leading-tight">
              Let&apos;s Bring Your
              <br />
              <span className="text-[var(--primary)]">Story to Life</span>
            </h2>
            <p className="font-[var(--font-lora)] text-[var(--muted)] leading-relaxed mb-8">
              Whether you&apos;re an aspiring author with a manuscript, a
              seasoned writer looking for a new publishing partner, or a
              reader with questions — we&apos;d love to hear from you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="font-[var(--font-playfair)] font-bold text-[var(--foreground)]">
                    Email
                  </p>
                  <p className="font-[var(--font-lora)] text-sm text-[var(--muted)]">
                    contact@atulyaswar.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-[var(--font-playfair)] font-bold text-[var(--foreground)]">
                    Address
                  </p>
                  <p className="font-[var(--font-lora)] text-sm text-[var(--muted)]">
                    Mumbai, Maharashtra, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-[var(--font-lora)] text-sm text-[var(--foreground)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-[var(--font-lora)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block font-[var(--font-lora)] text-sm text-[var(--foreground)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-[var(--font-lora)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block font-[var(--font-lora)] text-sm text-[var(--foreground)] mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-[var(--font-lora)] focus:outline-none focus:border-[var(--primary)] transition-colors">
                  <option>Manuscript Submission</option>
                  <option>Publishing Inquiry</option>
                  <option>Collaboration</option>
                  <option>General Question</option>
                </select>
              </div>
              <div>
                <label className="block font-[var(--font-lora)] text-sm text-[var(--foreground)] mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-[var(--font-lora)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-[var(--primary)] text-white font-[var(--font-lora)] text-base rounded-lg hover:bg-[var(--primary-light)] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {submitted ? "Message Sent!" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
