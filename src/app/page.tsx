import Image from "next/image";
import Link from "next/link";
import backgroundImage from "../../Asset/background_img.jpg";

export default function HomePage() {
  return (
    <main className="split-home">
      <section className="split-home-shell">
        <div className="split-home-left">
          <svg
            className="split-home-logo"
            viewBox="0 0 600 190"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Atulyaswar. A Peer Reviewed Indian Music Research Journal"
          >
            <text
              x="50%"
              y="70"
              textAnchor="middle"
              fontFamily="Playfair Display, Cinzel, serif"
              fontSize="86"
              fontWeight="600"
              fill="#9f2b82"
              letterSpacing="1"
            >
              Atulyaswar
            </text>

            <text
              x="50%"
                y="126"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
                fontSize="32"
              fontWeight="600"
              fill="#b97dad"
            >
                <tspan x="50%" dy="0">
                  A Peer Reviewed Indian Music
                </tspan>
                <tspan x="50%" dy="36">
                  Research Journal
                </tspan>
            </text>
          </svg>
          <p className="split-home-description">
            A peer-reviewed Indian music research platform for publishing and
            editing scholarly content on Indian music.
          </p>
          <div className="split-home-entry-grid">
            <Link href="/journal" className="split-home-entry-card split-home-entry-card-journal">
              <span className="split-home-entry-top-icon" aria-hidden="true">📖</span>
              <span className="split-home-entry-head">
                <span className="split-home-entry-icon" aria-hidden="true">♫</span>
                <span className="split-home-entry-title split-home-entry-title-journal">Open Journal</span>
              </span>
              <span className="split-home-entry-copy">
                Explore research papers, articles, and publications.
              </span>
            </Link>
            <Link href="/editor" className="split-home-entry-card split-home-entry-card-editor">
              <span className="split-home-entry-top-icon" aria-hidden="true">✍🏽</span>
              <span className="split-home-entry-head">
                <span className="split-home-entry-icon" aria-hidden="true">✎</span>
                <span className="split-home-entry-title">Open Editor</span>
              </span>
              <span className="split-home-entry-copy">
                Write, submit, and manage your scholarly content.
              </span>
            </Link>
          </div>
        </div>

        <div className="split-home-right">
          <Image
            src={backgroundImage}
            alt="Indian music instruments"
            fill
            className="split-home-image"
            priority
          />
        </div>
      </section>

      <div className="split-home-actions-mobile">
        <Link href="/journal" className="split-home-entry-card split-home-entry-card-journal">
          <span className="split-home-entry-top-icon" aria-hidden="true">📖</span>
          <span className="split-home-entry-head">
            <span className="split-home-entry-icon" aria-hidden="true">♫</span>
            <span className="split-home-entry-title split-home-entry-title-journal">Open Journal</span>
          </span>
          <span className="split-home-entry-copy">
            Explore research papers, articles, and publications.
          </span>
        </Link>
        <Link href="/editor" className="split-home-entry-card split-home-entry-card-editor">
          <span className="split-home-entry-top-icon" aria-hidden="true">✍🏽</span>
          <span className="split-home-entry-head">
            <span className="split-home-entry-icon" aria-hidden="true">✎</span>
            <span className="split-home-entry-title">Open Editor</span>
          </span>
          <span className="split-home-entry-copy">
            Write, submit, and manage your scholarly content.
          </span>
        </Link>
      </div>
    </main>
  );
}
