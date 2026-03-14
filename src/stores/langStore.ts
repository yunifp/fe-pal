import { create } from "zustand";
import i18n from "@/i18n";

type Language = "id" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLangStore = create<LanguageState>((set) => ({
  language: (localStorage.getItem("lang") as Language) || "id",
  setLanguage: (lang) => {
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));
