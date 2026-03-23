"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BrandLogo from "@/components/BrandLogo";

type TopNavbarProps = {
  activePath: string;
};

export default function TopNavbar({ activePath }: TopNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePath]);

  const labels = {
    Home: "Home",
    Journal: "Journal",
    Editor: "Editor",
    About: "About",
    Board: "Board Members",
    CurrentIssue: "Current Issue",
    Archive: "Archive",
    Submit: "Submit Manuscript",
    Guidelines: "Guidelines",
    ContactUs: "Contact Us",
    FAQ: "FAQ",
  };

  const topRowMenu = [
    { label: labels.Home, href: "/" },
    { label: labels.Journal, href: "/journal" },
    { label: labels.About, href: "/journal/about" },
    { label: labels.Board, href: "/journal/editorial-board" },
    { label: labels.CurrentIssue, href: "/journal/current-issue" },
    { label: labels.Archive, href: "/journal/archive" },
    { label: labels.FAQ, href: "/faq" },
    { label: labels.Submit, href: "/journal/submit-manuscript" },
    { label: labels.Guidelines, href: "/journal/guidelines" },
    { label: labels.ContactUs, href: "/journal/contact-us" },
  ];

  return (
    <header className="top-header">
      <div className="header-inner">
        <div className="header-main">
          <div className="header-nav-rows">
            <div className="double-navbar" aria-label="Main navigation">
              <nav className="top-navbar top-navbar-primary-row" aria-label="Primary menu">
                <Link href="/" className="top-row-logo" aria-label="Atulyaswar home">
                  <BrandLogo subtitle="Atulyaswar Publication" compact />
                </Link>
                <button
                  type="button"
                  className="mobile-menu-toggle"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                >
                  {mobileMenuOpen ? "Close" : "Menu"}
                </button>
                <div className="top-row-links">
                  {topRowMenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`menu-item menu-item-top ${activePath === item.href ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {isMounted && mobileMenuOpen
        ? createPortal(
            <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
              <nav
                className="mobile-nav-drawer"
                aria-label="Mobile navigation menu"
                onClick={(event) => event.stopPropagation()}
              >
                {topRowMenu.map((item) => (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className={`mobile-drawer-item ${activePath === item.href ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
