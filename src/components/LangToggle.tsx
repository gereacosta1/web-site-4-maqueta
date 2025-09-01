import React from "react";
import { useI18n } from "../i18n/I18nProvider";

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label="Change language"
      className="px-3 py-1 rounded-md border border-white/20 text-white hover:bg-white/10"
    >
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}
