"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Language = "english" | "hindi" | "marathi";

const normalizeLanguage = (value: string | null): Language => {
  if (value === "hindi" || value === "hi") return "hindi";
  if (value === "marathi" || value === "mr") return "marathi";
  return "english";
};

export default function SiteFooter() {
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

  const t = useMemo(
    () =>
      language === "hindi"
        ? {
            publication: "अतुल्यस्वर पब्लिकेशन",
            journalName: "म्यूजिक रिसर्च जर्नल",
            description:
              "शास्त्रीय और समकालीन संगीत अध्ययन के लिए पीयर-रिव्यूड प्रकाशन मंच।",
            journal: "जर्नल",
            about: "परिचय",
            board: "बोर्ड सदस्य",
            current: "वर्तमान अंक",
            archive: "आर्काइव",
            authors: "लेखक",
            submit: "पांडुलिपि जमा करें",
            manuscripts: "पांडुलिपियां",
            guidelines: "गाइडलाइंस",
            faq: "सामान्य प्रश्न",
            policy: "ओपन एक्सेस पॉलिसी",
              resources: "उपयोगी लिंक",
            contact: "संपर्क",
            contactUs: "संपर्क करें",
            editor: "नोटेशन एडिटर",
            location: "पुणे, महाराष्ट्र, भारत",
            rights: "सर्वाधिकार सुरक्षित।",
            designed: "जर्नल-फर्स्ट पब्लिशिंग के लिए डिज़ाइन किया गया।",
          }
        : language === "marathi"
          ? {
              publication: "अतुल्यस्वर पब्लिकेशन",
              journalName: "संगीत संशोधन जर्नल",
              description:
                "शास्त्रीय आणि समकालीन संगीत अभ्यासासाठी समकक्ष-परीक्षित प्रकाशन मंच.",
              journal: "जर्नल",
              about: "माहिती",
              board: "मंडळ सदस्य",
              current: "सध्याचा अंक",
              archive: "संग्रह",
              authors: "लेखक",
              submit: "हस्तलिखित सादर करा",
              manuscripts: "हस्तलिखिते",
              guidelines: "मार्गदर्शक सूचना",
              faq: "प्रश्नोत्तरे",
              policy: "मुक्त प्रवेश धोरण",
              resources: "उपयुक्त दुवे",
              contact: "संपर्क",
              contactUs: "संपर्क करा",
              editor: "नोटेशन एडिटर",
              location: "पुणे, महाराष्ट्र, भारत",
              rights: "सर्व हक्क राखीव.",
              designed: "जर्नल-केंद्रित प्रकाशनासाठी डिझाइन केलेले.",
            }
        : {
            publication: "Atulyaswar Publication",
            journalName: "Music Research Journal",
            description:
              "Peer reviewed publication space for research in classical and contemporary music studies.",
            journal: "Journal",
            about: "About Us",
            board: "Board Members",
            current: "Current Issue",
            archive: "Archive",
            authors: "Authors",
            submit: "Submit Manuscript",
            manuscripts: "Manuscripts",
            guidelines: "Guidelines",
            faq: "FAQ",
            policy: "Open Access Policy",
            resources: "Resources",
            contact: "Contact",
            contactUs: "Contact Us",
            editor: "Notation Editor",
            location: "Pune, Maharashtra, India",
            rights: "All rights reserved.",
            designed: "Website designed by",
          },
    [language],
  );

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div className="footer-inline-row">
            <Link href="/journal/open-access-policy" className="footer-policy-link">
              {t.policy}
              </Link>
            <span className="footer-inline-divider">|</span>
            <span className="footer-inline-item">Email: atulyaswarpublication@gmail.com</span>
            <span className="footer-inline-divider">|</span>
            <span className="footer-inline-item">Phone No: +91 9765556976</span>
            </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} {t.publication}. {t.rights}
          </p>
          <div className="footer-bottom-right">
            <p className="footer-copy">Designed By Softlance Labs</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
