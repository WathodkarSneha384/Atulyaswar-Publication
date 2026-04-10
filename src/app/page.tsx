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
            <defs>
              <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9f2b82" />
                <stop offset="40%" stopColor="#c94bb3" />
                <stop offset="70%" stopColor="#e063c3" />
                <stop offset="100%" stopColor="#ff85e1" />
              </linearGradient>
              <linearGradient id="subtitleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7f1f68" />
                <stop offset="50%" stopColor="#b63c98" />
                <stop offset="100%" stopColor="#de63ba" />
              </linearGradient>
            </defs>

            <text
              x="50%"
              y="70"
              textAnchor="middle"
              fontFamily="Playfair Display, Cinzel, serif"
              fontSize="86"
              fontWeight="600"
              fill="url(#textGradient)"
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
              fill="url(#subtitleGradient)"
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
          <div className="split-home-actions">
            <Link href="/journal" className="entry-button split-home-journal-btn">
              Open Journal
            </Link>
            <Link href="/editor" className="entry-button split-home-editor-btn">
              Open Editor
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
        <Link href="/journal" className="entry-button split-home-journal-btn">
          Open Journal
        </Link>
        <Link href="/editor" className="entry-button split-home-editor-btn">
          Open Editor
        </Link>
      </div>
    </main>
  );
}
