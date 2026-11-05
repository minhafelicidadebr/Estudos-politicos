/**
 * Lightweight i18n — zero deps. Pt-BR / En-US / Es.
 * Sprint 6: Internationalization with auto-detect + persistence.
 */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Locale = "pt-BR" | "en-US" | "es";

const dict = {
  "pt-BR": {
    "nav.home": "Início",
    "nav.methodology": "Metodologia",
    "nav.library": "Biblioteca",
    "nav.compare": "Comparar",
    "nav.history": "Histórico",
    "nav.settings": "Configurações",
    "nav.signin": "Entrar",
    "nav.signout": "Sair",
    "common.loading": "Carregando...",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.delete": "Excluir",
    "common.export": "Exportar",
    "history.title": "Histórico de Análises",
    "history.subtitle": "Suas análises anteriores com trilha de auditoria preservada.",
    "history.empty": "Nenhuma análise no histórico.",
    "history.first": "Começar primeira análise →",
    "settings.title": "Configurações",
    "settings.subtitle": "Gerencie sua conta e preferências de análise.",
    "settings.profile": "Perfil",
    "settings.name": "Nome",
    "settings.bio": "Bio",
    "settings.preferred_country": "País de interesse",
    "settings.email": "Email",
    "settings.preferences": "Preferências",
    "settings.language": "Idioma",
    "settings.layer": "Camada pedagógica padrão",
    "settings.notifications": "Notificações",
    "settings.security": "Segurança",
    "settings.saved": "Preferências salvas com sucesso.",
  },
  "en-US": {
    "nav.home": "Home",
    "nav.methodology": "Methodology",
    "nav.library": "Library",
    "nav.compare": "Compare",
    "nav.history": "History",
    "nav.settings": "Settings",
    "nav.signin": "Sign in",
    "nav.signout": "Sign out",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.export": "Export",
    "history.title": "Analysis History",
    "history.subtitle": "Your past analyses with audit trail preserved.",
    "history.empty": "No analyses in history.",
    "history.first": "Start first analysis →",
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and analysis preferences.",
    "settings.profile": "Profile",
    "settings.name": "Name",
    "settings.bio": "Bio",
    "settings.preferred_country": "Country of interest",
    "settings.email": "Email",
    "settings.preferences": "Preferences",
    "settings.language": "Language",
    "settings.layer": "Default pedagogical layer",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.saved": "Preferences saved successfully.",
  },
  "es": {
    "nav.home": "Inicio",
    "nav.methodology": "Metodología",
    "nav.library": "Biblioteca",
    "nav.compare": "Comparar",
    "nav.history": "Historial",
    "nav.settings": "Configuración",
    "nav.signin": "Entrar",
    "nav.signout": "Salir",
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.export": "Exportar",
    "history.title": "Historial de Análisis",
    "history.subtitle": "Tus análisis previos con auditoría preservada.",
    "history.empty": "Sin análisis en el historial.",
    "history.first": "Comenzar primer análisis →",
    "settings.title": "Configuración",
    "settings.subtitle": "Gestiona tu cuenta y preferencias.",
    "settings.profile": "Perfil",
    "settings.name": "Nombre",
    "settings.bio": "Bio",
    "settings.preferred_country": "País de interés",
    "settings.email": "Correo",
    "settings.preferences": "Preferencias",
    "settings.language": "Idioma",
    "settings.layer": "Capa pedagógica por defecto",
    "settings.notifications": "Notificaciones",
    "settings.security": "Seguridad",
    "settings.saved": "Preferencias guardadas con éxito.",
  },
} as const;

type Key = keyof typeof dict["pt-BR"];

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: Key) => string;
}

const Ctx = createContext<I18nCtx | undefined>(undefined);

const STORAGE_KEY = "aegis_locale";

function detectInitial(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in dict) return stored;
  const nav = navigator.language || "pt-BR";
  if (nav.startsWith("en")) return "en-US";
  if (nav.startsWith("es")) return "es";
  return "pt-BR";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitial);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<I18nCtx>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (k) => (dict[locale] as Record<string, string>)[k] ?? (dict["pt-BR"] as Record<string, string>)[k] ?? k,
  }), [locale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
