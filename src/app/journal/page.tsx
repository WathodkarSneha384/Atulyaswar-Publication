import Link from "next/link";
import JournalShell from "@/components/JournalShell";

export default function JournalHomePage() {
  return (
    <JournalShell activePath="/journal">
      <section className="journal-search-row">
        <input
          type="text"
          placeholder="Search news..."
          className="journal-search-input"
        />
        <button type="button" className="journal-search-btn" aria-label="Search">
          Search
        </button>
      </section>

      <section className="journal-chart-wrap">
        <div className="chart-placeholder" role="img" aria-label="Year wise article contribution chart">
          <div className="chart-heading">Year Wise Article Contribution</div>
          <div className="chart-bars">
            {[18, 34, 28, 40, 32, 46, 38, 52, 44, 60].map((height, idx) => (
              <span key={`bar-${idx}`} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </section>

      <section className="founder-layout">
        <article className="founder-card">
          <h3>Founder&apos;s Message</h3>
          <div className="founder-body">
            <div
              className="founder-photo"
              role="img"
              aria-label="Founder portrait"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80)",
              }}
            />
            <div>
              <p>
                Atulyaswar is a peer reviewed online journal focused on high quality music
                research. We aim to create a strong bridge between researchers,
                academicians, and readers.
              </p>
              <p>
                Our mission is to provide accessible research publication space and
                encourage responsible scholarship in Indian music studies.
              </p>
              <Link href="/journal/about" className="inline-link">
                Read More
              </Link>
            </div>
          </div>
        </article>

        <aside className="journal-side-panel">
          <article className="side-widget">
            <h4>Open Access</h4>
            <p>Freely accessible research content for all readers.</p>
          </article>
          <article className="side-widget">
            <h4>Plagiarism Check</h4>
            <p>Screened submissions for research originality.</p>
          </article>
          <article className="side-widget">
            <h4>Follow Us</h4>
            <p>Facebook | Telegram | YouTube</p>
          </article>
        </aside>
      </section>

      <section className="announcements-block">
        <h3>Announcements</h3>
        <article className="news-item">
          <h4>Attention Regarding Fake Account</h4>
          <p>Use only official communication channels for all journal activity.</p>
          <Link href="/journal/contact-us" className="inline-link">
            Read More
          </Link>
        </article>
      </section>

      <section className="indexed-strip">
        <h3>We Are Indexed In</h3>
        <div className="indexed-grid">
          <article className="indexed-card">Google Scholar</article>
          <article className="indexed-card">EBSCO</article>
          <article className="indexed-card">Library of Congress</article>
        </div>
      </section>

      <section className="signup-strip">
        <h3>Sign up for updates</h3>
        <p>Drop your Mail id to get regular updates about journals.</p>
        <form className="subscribe-form">
          <input
            type="email"
            placeholder="Enter your email"
            className="subscribe-input"
          />
          <button type="button" className="subscribe-button">
            Subscribe
          </button>
        </form>
      </section>
    </JournalShell>
  );
}
