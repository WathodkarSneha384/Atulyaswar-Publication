import Link from "next/link";
import { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import TopNavbar from "@/components/TopNavbar";

type JournalShellProps = {
  activePath: string;
  children: ReactNode;
};

export default function JournalShell({ activePath, children }: JournalShellProps) {
  return (
    <main className="page-shell">
      <TopNavbar activePath={activePath} />
      <div className="main-content">
        <section className="product-card">
          <div className="journal-content">{children}</div>
        </section>
      </div>
      <Link href="/editor" className="cross-nav-fab" aria-label="Open Editor">
        Open Editor
      </Link>
      <SiteFooter />
    </main>
  );
}
