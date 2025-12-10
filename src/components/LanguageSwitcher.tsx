import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { availableLanguages } from "../locales";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languageConfig: Record<
    string,
    { flagCode: string; label: string; name: string }
  > = {
    "pt-BR": { flagCode: "br", label: "PT-BR", name: "Português" },
    "en-US": { flagCode: "us", label: "EN-US", name: "English" },
  };

  // Mapeia códigos curtos para completos
  const getFullLanguageCode = (lang: string): string => {
    const mappings: Record<string, string> = {
      pt: "pt-BR",
      en: "en-US",
    };
    return mappings[lang] || lang;
  };

  // Converte "pt" para "pt-BR" para compatibilidade
  const currentLanguageFull = getFullLanguageCode(i18n.language || "pt-BR");
  const currentConfig = languageConfig[currentLanguageFull];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between gap-2
          w-full p-2.5 rounded-lg
          transition-all duration-200
          bg-transparent hover:bg-gray-100
          dark:bg-slate-800/50 dark:hover:bg-slate-700
          border border-gray-200 dark:border-slate-700
          shadow-sm dark:shadow-slate-950/30
          text-xs font-medium
          text-gray-700 dark:text-slate-300
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        "
      >
        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w20/${currentConfig.flagCode}.png`}
            srcSet={`https://flagcdn.com/w40/${currentConfig.flagCode}.png 2x`}
            alt={currentConfig.name}
            className="w-5 h-auto"
          />
          <span>{currentConfig.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-slate-950/50 overflow-hidden">
          {availableLanguages.map((lang) => {
            const config = languageConfig[lang];
            return (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5
                  text-xs font-medium
                  transition-colors
                  ${
                    currentLanguageFull === lang
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }
                `}
              >
                <img
                  src={`https://flagcdn.com/w20/${config.flagCode}.png`}
                  srcSet={`https://flagcdn.com/w40/${config.flagCode}.png 2x`}
                  alt={config.name}
                  className="w-5 h-auto"
                />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{config.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
