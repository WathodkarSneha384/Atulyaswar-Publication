"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BrandLogo from "@/components/BrandLogo";

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
          About: "परिचय",
          Board: "बोर्ड सदस्य",
          CurrentIssue: "वर्तमान अंक",
          Archive: "आर्काइव",
          Submit: "पांडुलिपि जमा करें",
          Guidelines: "गाइडलाइंस",
          ContactUs: "संपर्क करें",
          FAQ: "सामान्य प्रश्न",
        };
      }

      if (language === "marathi") {
        return {
          Home: "मुख्यपृष्ठ",
          Journal: "जर्नल",
          Editor: "एडिटर",
          About: "माहिती",
          Board: "मंडळ सदस्य",
          CurrentIssue: "सध्याचा अंक",
          Archive: "संग्रह",
          Submit: "हस्तलिखित सादर करा",
          Guidelines: "मार्गदर्शक सूचना",
          ContactUs: "संपर्क करा",
          FAQ: "प्रश्नोत्तरे",
        };
      }

      return {
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
    },
    [language],
  );

  const topRowMenu = [
    { label: labels.Home, href: "/" },
    { label: labels.Journal, href: "/journal" },
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
    </header>
  );
}
