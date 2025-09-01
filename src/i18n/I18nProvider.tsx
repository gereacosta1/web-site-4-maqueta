import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import es from "./dict.es";
import en from "./dict.en";

type Lang = "es" | "en";
type Dict = typeof es & typeof en; // mismas claves en ambos

type Ctx = {
  lang: Lang;
  t: (k: keyof Dict) => string;
  setLang: (l: Lang) => void;
  fmtMoney: (v: number) => string;
};

const I18nCtx = createContext<Ctx | null>(null);
const LS_KEY = "onewaymotor_lang";

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("es");

  // idioma por storage o navegador
  useEffect(() => {
    const saved = (localStorage.getItem(LS_KEY) as Lang | null);
    const def: Lang = saved || ((navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en");
    setLang(def);
    document.documentElement.lang = def;
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const dict = lang === "es" ? es : en;
  const t = (k: keyof Dict) => (dict as any)[k] ?? String(k);

  const fmtMoney = (value: number) =>
    new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);

  const value = useMemo<Ctx>(() => ({ lang, t, setLang, fmtMoney }), [lang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
};
