import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";

export default function HomePage() {
  const dummyClassicalImages = [
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80",
  ];

  return (
    <main className="page-shell">
      <TopNavbar activePath="/" />
      <div className="main-content">
        <section className="entry-page home-hero">
          <div className="hero-overlay">
            <h1 className="entry-title">Atulyaswar Music Research Journal</h1>
            <p className="entry-subtitle">
              Discover peer reviewed research, current issues, archive content,
              and music scholarship updates in one place.
            </p>
            <div className="entry-actions">
              <Link href="/journal" className="entry-button">
                Enter Journal
              </Link>
              <Link href="/journal/submit-manuscript" className="ghost-button">
                Submit Manuscript
              </Link>
            </div>
          </div>
        </section>

        <section className="product-card">
          <h2 className="section-title">Classical Singing Class Moments (Dummy Images)</h2>
          <div className="dummy-image-grid">
            {dummyClassicalImages.map((src) => (
              <article key={src} className="dummy-image-card">
                <div
                  className="dummy-image"
                  role="img"
                  aria-label="Classical singing class"
                  style={{ backgroundImage: `url(${src})` }}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="home-products-grid">
          <article className="product-card highlight-card">
            <h2 className="section-title">Atulyaswar Notation Editor</h2>
            <p>
              Dedicated editor module for notation workflows. Menus and advanced
              tools can be configured in the next phase.
            </p>
            <div className="entry-actions">
              <Link href="/journal" className="entry-button">
                Open Journal
              </Link>
              <Link href="/editor" className="entry-button">
                Open Editor
              </Link>
            </div>
          </article>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
