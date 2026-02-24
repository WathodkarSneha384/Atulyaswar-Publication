import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";

export default function EditorPage() {
  return (
    <main className="page-shell">
      <TopNavbar activePath="/editor" />
      <div className="main-content">
        <section className="product-card">
          <div className="journal-logo-line">
            <h1 className="product-title">Atulyaswar Notation Editor</h1>
            <p className="product-subtitle">Menus Yet to be decided</p>
          </div>
          <div className="editor-placeholder">
            <p>
              This product page is now live as a dedicated route. Once client
              requirements are finalized, menu items and notation features can
              be added here.
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
