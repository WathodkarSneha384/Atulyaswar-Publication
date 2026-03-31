import Image from "next/image";
import Link from "next/link";
import logoImage from "../../Asset/Logo1.png";
import backgroundImage from "../../Asset/background_img.jpg";
import desktopBackgroundImage from "../../Asset/desktop_background.png";

export default function HomePage() {
  return (
    <main className="cover-page">
      <Image
        src={backgroundImage}
        alt="Indian classical instruments background for mobile"
        fill
        priority
        className="cover-page-bg-image cover-page-bg-image-mobile"
      />
      <Image
        src={desktopBackgroundImage}
        alt="Indian classical instruments background for desktop"
        fill
        priority
        className="cover-page-bg-image cover-page-bg-image-desktop"
      />
      <div className="cover-page-bg-overlay" aria-hidden="true" />
      <div className="cover-shell">
        <section className="cover-main-card">
          <div className="cover-main-card-content">
            <div className="cover-logo-head cover-logo-row">
              <Image
                src={logoImage}
                alt="Atulyaswar logo"
                className="cover-logo-image"
                priority
              />
              <p className="cover-journal-tagline">- A Peer Reviewed Indian Music Journal</p>
            </div>
            <div className="cover-actions cover-actions-outside">
              <Link href="/journal" className="entry-button">
                Open Journal
              </Link>
              <Link href="/editor" className="ghost-button cover-ghost">
                Open Editor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
