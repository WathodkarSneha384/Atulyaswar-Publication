import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { journalMenuItems } from "@/lib/journalContent";

type TopNavbarProps = {
  activePath: string;
};

export default function TopNavbar({ activePath }: TopNavbarProps) {
  return (
    <header className="top-header">
      <div className="header-inner">
        <div className="header-main">
          <div className="brand-column">
            <Link href="/" className="brand-home-link">
              <BrandLogo subtitle="Atulyaswar Publication" compact />
            </Link>
          </div>

          <div className="header-right">
            <nav className="top-navbar top-navbar-inline" aria-label="Main navigation">
              {journalMenuItems.map((item) => {
                const isActive = item.href === activePath;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`menu-item ${isActive ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/editor"
                className={`menu-item ${activePath === "/editor" ? "active" : ""}`}
              >
                Editor
              </Link>
              <Link href="#" className="menu-item auth-menu-item">
                Login
              </Link>
              <Link href="#" className="menu-item auth-menu-item">
                Register
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
