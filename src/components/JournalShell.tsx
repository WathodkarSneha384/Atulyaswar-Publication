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

          <div className="bottom-policy-line">
            <Link
              href="/journal/open-access-policy"
              className={`policy-link ${
                activePath === "/journal/open-access-policy" ? "active" : ""
              }`}
            >
              Open Access Policy
            </Link>
            <span className="copyright">Copyright {new Date().getFullYear()}</span>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
