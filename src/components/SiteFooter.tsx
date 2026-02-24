import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <section className="footer-brand">
            <p className="footer-kicker">Atulyaswar Publication</p>
            <h3>Music Research Journal</h3>
            <p className="footer-muted">
              Peer reviewed publication space for research in classical and
              contemporary music studies.
            </p>
            <div className="footer-socials">
              <Link href="#" aria-label="Instagram">
                Instagram
              </Link>
              <Link href="#" aria-label="YouTube">
                YouTube
              </Link>
              <Link href="#" aria-label="Telegram">
                Telegram
              </Link>
            </div>
          </section>

          <section>
            <h4 className="footer-title">Journal</h4>
            <div className="footer-links">
              <Link href="/journal/about">About Us</Link>
              <Link href="/journal/editorial-board">Board Members</Link>
              <Link href="/journal/current-issue">Current Issue</Link>
              <Link href="/journal/archive">Archive</Link>
            </div>
          </section>

          <section>
            <h4 className="footer-title">Authors</h4>
            <div className="footer-links">
              <Link href="/journal/submit-manuscript">Submit Manuscript</Link>
              <Link href="/journal/guidelines">Guidelines</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/journal/open-access-policy">Open Access Policy</Link>
            </div>
          </section>

          <section>
            <h4 className="footer-title">Contact</h4>
            <div className="footer-links">
              <Link href="/journal/contact-us">Contact Us</Link>
              <Link href="/editor">Notation Editor</Link>
            </div>
            <p className="footer-muted">Pune, Maharashtra, India</p>
            <p className="footer-muted">Email: editor@atulyaswar.org</p>
          </section>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Atulyaswar Publication. All rights
            reserved.
          </p>
          <div className="footer-bottom-right">
            <p className="footer-copy">Designed for journal-first publishing.</p>
            <button type="button" className="language-btn" aria-label="Language switch">
              EN | HI
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
