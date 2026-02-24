"use client";

import { useEffect, useState } from "react";

type Language = "english" | "hindi" | "marathi";

const STORAGE_KEY = "atulyaswar-language";

const normalizeLanguage = (value: string | null): Language => {
  if (value === "hindi" || value === "hi") return "hindi";
  if (value === "marathi" || value === "mr") return "marathi";
  return "english";
};

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>("english");

  useEffect(() => {
    const saved = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    setLanguage(saved);
    document.documentElement.lang =
      saved === "hindi" ? "hi" : saved === "marathi" ? "mr" : "en";
    document.dispatchEvent(
      new CustomEvent("atulyaswar-language-change", { detail: saved }),
    );
  }, []);

  const switchLanguage = (next: Language) => {
    setLanguage(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang =
      next === "hindi" ? "hi" : next === "marathi" ? "mr" : "en";
    document.dispatchEvent(
      new CustomEvent("atulyaswar-language-change", { detail: next }),
    );
  };

  return (
    <div className="floating-language" aria-label="Language switcher">
      <select
        id="floating-language-select"
        className="floating-lang-select"
        value={language}
        onChange={(event) => switchLanguage(event.target.value as Language)}
      >
        <option value="marathi">Marathi</option>
        <option value="english">English</option>
        <option value="hindi">Hindi</option>
      </select>
    </div>
  );
}
