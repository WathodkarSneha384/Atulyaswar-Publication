"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { journalMenuItems } from "@/lib/journalContent";

type TopNavbarProps = {
  activePath: string;
};

type Language = "english" | "hindi" | "marathi";

const normalizeLanguage = (value: string | null): Language => {
  if (value === "hindi" || value === "hi") return "hindi";
  if (value === "marathi" || value === "mr") return "marathi";
  return "english";
};

export default function TopNavbar({ activePath }: TopNavbarProps) {
  const [language, setLanguage] = useState<Language>("english");

  useEffect(() => {
    setLanguage(normalizeLanguage(localStorage.getItem("atulyaswar-language")));

    const handler = (event: Event) => {
      const custom = event as CustomEvent<Language>;
      setLanguage(normalizeLanguage(custom.detail));
    };

    document.addEventListener("atulyaswar-language-change", handler);
    return () => document.removeEventListener("atulyaswar-language-change", handler);
  }, []);

  const labels = useMemo(
    () => {
      if (language === "hindi") {
        return {
          Home: "होम",
          Journal: "जर्नल",
          Editor: "एडिटर",
          Login: "एडमिन लॉगिन",
          Register: "रजिस्टर",
        };
      }

      if (language === "marathi") {
        return {
          Home: "मुख्यपृष्ठ",
          Journal: "जर्नल",
          Editor: "एडिटर",
          Login: "ॲडमिन लॉगिन",
          Register: "नोंदणी",
        };
      }

      return {
        Home: "Home",
        Journal: "Journal",
        Editor: "Editor",
        Login: "Admin Login",
        Register: "Register",
      };
    },
    [language],
  );

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
                    {labels[item.label as keyof typeof labels] ?? item.label}
                  </Link>
                );
              })}
              <Link
                href="/editor"
                className={`menu-item ${activePath === "/editor" ? "active" : ""}`}
              >
                {labels.Editor}
              </Link>
              <Link
                href="/admin/login"
                className={`menu-item auth-menu-item ${
                  activePath === "/admin/login" ? "active" : ""
                }`}
              >
                {labels.Login}
              </Link>
              <Link href="#" className="menu-item auth-menu-item">
                {labels.Register}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
