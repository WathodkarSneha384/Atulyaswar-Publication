import Image from "next/image";
import Link from "next/link";
import logoImage from "../../Asset/Logo1.png";

export default function HomePage() {
  return (
    <main className="cover-page">
      <div className="cover-shell">
        <section className="cover-main-card">
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
        </section>
      </div>
    </main>
  );
}
