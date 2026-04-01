import Image from "next/image";
import Link from "next/link";
import logoImage from "../../Asset/Logo1.png";
import backgroundImage from "../../Asset/background_img.jpg";

export default function HomePage() {
  return (
    <main className="cover-page">
      <div className="cover-shell">
        <section className="cover-main-card">
          <div className="cover-main-card-content">
            <div className="cover-cta-row">
              <Link href="/journal" className="entry-button cover-pill-button">
                Open Journal
              </Link>
              <div className="cover-center-image-card" aria-hidden="true">
                <Image
                  src={backgroundImage}
                  alt=""
                  fill
                  className="cover-center-image"
                  priority
                />
                <div className="cover-center-image-overlay">
                  <Image
                    src={logoImage}
                    alt="Atulyaswar logo"
                    className="cover-logo-image"
                    priority
                  />
                  <p className="cover-journal-tagline">
                    A Peer Reviewed, Indian Music Research Journal
                  </p>
                </div>
              </div>
              <Link href="/editor" className="entry-button cover-pill-button">
                Open Editor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
